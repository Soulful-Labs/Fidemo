import type { AppState } from '../mock/storeTypes'
import type { Study, User } from '../mock/types'
import { RATING_DELTA, TRUST, clampTrust, tierFor } from './rules'
import { profileCompletion } from './profile'

/** Statuses that count as a completed, paid study (workflow 44 pays not-needed in full; a late show still took part). */
export const COMPLETED: Study['status'][] = ['paid', 'not_needed', 'late_show']

const sameYear = (iso: string, now: Date) => new Date(iso).getFullYear() === now.getFullYear()
const sameMonth = (iso: string, now: Date) => {
  const d = new Date(iso)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

/** Study earnings only: redemptions are wallet credits, not money earned. */
const earning = (t: AppState['transactions'][number]) => t.category !== 'Redeem Points'

/** When a study was paid, from its timeline. */
export const paidAt = (study: Study) =>
  study.timeline.find((t) => t.label === 'Paid')?.at ?? study.timeline.at(-1)?.at ?? study.endsAt

export interface DerivedFigures {
  walletBalance: number
  /** Earnings credited but waiting on the client approving the payout list (workflow 46). */
  pendingEarnings: number
  allTimeEarned: number
  yearEarned: number
  points: number
  trustScore: number
  tier: User['tier']
  completedStudies: number
  streak: User['streak']
  profileCompletion: number
  /** Performance ratings as percentages, from the client reviews on record. */
  ratings: User['ratings']
  /** Workflow 49: earned $600 in the year and the tax form is not on file. */
  taxFormRequired: boolean
}

export const TAX_FORM_THRESHOLD = 600

/**
 * The one place every headline number comes from. Nothing here is stored:
 * wallet, points, Trust Score, tier, completed studies and the streak are
 * all read off the underlying lists, so two screens can never disagree.
 */
export function derive(state: AppState, now: Date = new Date()): DerivedFigures {
  const { transactions, payouts, pointsHistory, redeemHistory, studies, trustEvents, user } = state

  const credited = transactions.reduce((sum, t) => sum + t.amount, 0)
  const withdrawn = payouts.reduce((sum, p) => sum + p.amount, 0)
  const walletBalance = Math.round((credited - withdrawn) * 100) / 100

  const allTimeEarned = transactions.filter(earning).reduce((sum, t) => sum + t.amount, 0)
  const yearEarned = transactions.filter((t) => earning(t) && sameYear(t.at, now)).reduce((sum, t) => sum + t.amount, 0)
  const pendingEarnings = studies.filter((s) => s.status === 'in_process').reduce((sum, s) => sum + s.reward, 0)

  const points = pointsHistory.reduce((sum, p) => sum + p.amount, 0) - redeemHistory.reduce((sum, r) => sum + r.points, 0)

  const completed = studies.filter((s) => COMPLETED.includes(s.status))
  const completedThisYear = completed.filter((s) => sameYear(paidAt(s), now)).length
  const noShows = studies.filter((s) => s.status === 'no_show').length
  const lateShows = studies.filter((s) => s.status === 'late_show').length

  // Policy: "Ratings from the last 10 studies count", up to +40.
  const ratingDelta = completed
    .filter((s) => s.clientReview)
    .sort((a, b) => paidAt(b).localeCompare(paidAt(a)))
    .slice(0, TRUST.RATINGS_WINDOW)
    .reduce((sum, s) => sum + (RATING_DELTA[s.clientReview!.stars] ?? 0), 0)

  // Policy section 1: onboarding 50 + completion (max 10) + ratings (max 40) - deductions, kept within 50..100.
  const trustScore = clampTrust(
    TRUST.ONBOARDING +
      Math.min(TRUST.STUDY_COMPLETION_CAP_PER_YEAR, completedThisYear * TRUST.STUDY_COMPLETION) +
      Math.min(TRUST.RATINGS_MAX, Math.max(-TRUST.RATINGS_MAX, ratingDelta)) +
      noShows * TRUST.NO_SHOW +
      lateShows * TRUST.LATE_SHOW_UP +
      trustEvents.reduce((sum, e) => sum + e.delta, 0),
  )

  const streak = {
    current: completed.filter((s) => sameMonth(paidAt(s), now)).length,
    target: 4,
    month: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }

  const reviewed = completed.filter((s) => s.clientReview)
  const pct = (key: 'expertise' | 'reliability' | 'communication') =>
    reviewed.length ? Math.round((reviewed.reduce((sum, s) => sum + s.clientReview![key], 0) / (reviewed.length * 5)) * 100) : 0
  const attempted = completed.length + noShows
  const ratings = {
    expertise: pct('expertise'), reliability: pct('reliability'), communication: pct('communication'),
    successRate: attempted ? Math.round((completed.length / attempted) * 100) : 0,
  }

  return {
    walletBalance, pendingEarnings, allTimeEarned, yearEarned, points, trustScore,
    tier: tierFor(trustScore), completedStudies: completed.length, streak,
    profileCompletion: profileCompletion(user), ratings,
    taxFormRequired: yearEarned >= TAX_FORM_THRESHOLD && !user.taxFormDone,
  }
}

export interface TrustHistoryEntry {
  label: string
  detail?: string
  delta: number
  at: string
  studyId?: string
}

/**
 * Every line the Trust Score is made of, newest first, so any deduction or
 * gain can be traced to the study that caused it. Completions past the
 * yearly cap and ratings outside the last-ten window show as 0.
 */
export function trustHistory(state: AppState, now: Date = new Date()): TrustHistoryEntry[] {
  const { studies, trustEvents, user } = state
  const completed = studies.filter((s) => COMPLETED.includes(s.status)).sort((a, b) => paidAt(b).localeCompare(paidAt(a)))
  const thisYear = completed.filter((s) => sameYear(paidAt(s), now))
  const counted = new Set(thisYear.slice(-TRUST.STUDY_COMPLETION_CAP_PER_YEAR).map((s) => s.id))
  const rated = completed.filter((s) => s.clientReview)
  const inWindow = new Set(rated.slice(0, TRUST.RATINGS_WINDOW).map((s) => s.id))
  const when = (s: Study, label: string) => s.timeline.find((t) => t.label === label)?.at ?? paidAt(s)

  const entries: TrustHistoryEntry[] = [
    { label: 'Onboarding', detail: 'Fixed starting score', delta: TRUST.ONBOARDING, at: user.joinedAt },
    ...completed.map((s) => ({
      label: 'Study completed', detail: s.title, studyId: s.id, at: paidAt(s),
      delta: counted.has(s.id) ? TRUST.STUDY_COMPLETION : 0,
    })),
    ...rated.map((s) => ({
      label: `${s.clientReview!.stars}-star client rating`, detail: s.title, studyId: s.id, at: paidAt(s),
      delta: inWindow.has(s.id) ? (RATING_DELTA[s.clientReview!.stars] ?? 0) : 0,
    })),
    ...studies.filter((s) => s.status === 'no_show').map((s) => ({ label: 'No show', detail: s.title, studyId: s.id, at: when(s, 'No Show'), delta: TRUST.NO_SHOW })),
    ...studies.filter((s) => s.status === 'late_show').map((s) => ({ label: 'Late show up', detail: s.title, studyId: s.id, at: when(s, 'Late show up'), delta: TRUST.LATE_SHOW_UP })),
    ...trustEvents.map((e) => ({ label: e.label, detail: e.detail, studyId: e.studyId, at: e.at, delta: e.delta })),
  ]
  return entries.sort((a, b) => b.at.localeCompare(a.at))
}

/** The stored user with every derived figure filled in. */
export function deriveUser(state: AppState, now: Date = new Date()): User & DerivedFigures {
  const d = derive(state, now)
  return { ...state.user, ...d }
}

/** Workflow 57: has this person taken part in a study for this client before? */
export function hasTakenPartWith(studies: Study[], clientId: string, exceptId?: string): boolean {
  return studies.some((s) => s.client.id === clientId && s.id !== exceptId && COMPLETED.includes(s.status))
}
