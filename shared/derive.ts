/**
 * Every computed figure on the platform: counts, progress, totals, invoices,
 * balances, scores, tiers and pagination. Nothing here is stored and no
 * screen in any of the three apps computes a figure of its own, so two
 * screens cannot disagree about a number.
 *
 * Everything is a pure function of the PlatformState (and the clock).
 */
import {
  DIARY, FEES, PAGE_SIZE, STREAK_TARGET, TAX_FORM_THRESHOLD, isSessionType, depositFor } from './platform'
import {
  clientTag, consoleStudyTab, hasApplied, hasQualified, isApproved, isCharged, isLive, isPayable,
  participationOf, recruitingTab, respondentStatus, STUDY_TAG,
} from './lifecycle'
import type { ClientTag, RespondentStatus } from './lifecycle'
import { isStopped, payoutState } from './lifecycle'
import { CERTIFICATE, POINTS, TRUST, pointsToUsd, tierFor, trustForStars, trustScore } from './rules'
import type { TrustInputs } from './rules'
import type {
  AppNotification, Booking, Client, Participation, Payout, PayoutMethod, ParticipationState, Person, PlatformState, PreScreenQuestion,
  PayoutStatus, Question, RatingState, RepeatRule, Report, ReportResolution, Study, StudyReport, StudyPayment, StudyType, TeamMember, TeamNotice, Ticket, Tier,
} from './types'

// ------------------------------------------------------------------ helpers

const DAY = 86_400_000
const sameYear = (iso: string, now: Date) => new Date(iso).getFullYear() === now.getFullYear()
const sameMonth = (iso: string, now: Date) => {
  const d = new Date(iso)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}
const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString()
const sum = <T>(rows: T[], f: (r: T) => number) => rows.reduce((n, r) => n + f(r), 0)
const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }

export const personById = (state: PlatformState, id: string): Person | undefined => state.people.find((p) => p.id === id)
export const clientById = (state: PlatformState, id: string): Client | undefined => state.clients.find((c) => c.id === id)
export const studyById = (state: PlatformState, id?: string): Study | undefined => state.studies.find((s) => s.id === id)
export const teamById = (state: PlatformState, id?: string): TeamMember | undefined => state.team.find((t) => t.id === id)

/**
 * Workflow 27: a client sees a first name only, with role, location and
 * experience. "Ferry Lindqvist" is "Ferry L" everywhere in the client app.
 */
export const shortName = (name: string): string => {
  const [first, ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  return last ? `${first} ${last.charAt(0)}` : first ?? ''
}

export const daysRemaining = (study: Study, now: Date = new Date()): number =>
  isStopped(study.state) || study.state === 'cancelled' ? 0 : Math.max(0, Math.ceil((new Date(study.endsAt).getTime() - now.getTime()) / DAY))

/** "1 hour", "30 minutes", "1 hour 15 minutes". */
export const durationLabel = (mins: number): string => {
  const h = Math.floor(mins / 60), m = mins % 60
  const hours = h ? `${h} hour${h > 1 ? 's' : ''}` : ''
  return [hours, m ? `${m} minutes` : ''].filter(Boolean).join(' ') || '0 minutes'
}

export const shareLink = (study: Study): string =>
  `https://humanlayer.app/study/${study.linkCode}/${study.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/`

// ----------------------------------------------------- a person's participations

export interface Entry { study: Study; p: Participation }

export const entriesOf = (state: PlatformState, personId: string): Entry[] =>
  state.studies.flatMap((study) => {
    const p = participationOf(study, personId)
    return p ? [{ study, p }] : []
  })

/** Completed and the payout approved: the incentive is in the wallet. */
export const isPaid = (p: Participation): boolean => p.state === 'completed' && Boolean(p.paidAt)

// ---------------------------------------------------------------- Trust Score

/** What rules.trustScore needs, read off the person's prior record and their participations. */
export function trustInputs(state: PlatformState, personId: string, now: Date = new Date()): TrustInputs {
  const person = personById(state, personId)
  const entries = entriesOf(state, personId)
  const paid = entries.filter((e) => isPaid(e.p))
  const rated = entries.filter((e) => e.p.rating).sort((a, b) => a.p.rating!.at.localeCompare(b.p.rating!.at))
  return {
    completedThisYear: (person?.prior.completedThisYear ?? 0) + paid.filter((e) => sameYear(e.p.paidAt!, now)).length,
    stars: [...(person?.prior.stars ?? []), ...rated.map((e) => e.p.rating!.stars)],
    noShows: entries.filter((e) => e.p.state === 'no_show').length,
    lateShows: paid.filter((e) => e.p.lateShow).length,
    cancelledSessions: person?.trustEvents.filter((e) => e.kind === 'cancelled_session').length ?? 0,
    frauds: person?.trustEvents.filter((e) => e.kind === 'fraud').length ?? 0,
  }
}

export const trustScoreOf = (state: PlatformState, personId: string, now: Date = new Date()): number => trustScore(trustInputs(state, personId, now))
export const tierOf = (state: PlatformState, personId: string, now: Date = new Date()): Tier => tierFor(trustScoreOf(state, personId, now))

export interface TrustHistoryEntry { label: string; detail?: string; delta: number; at: string; studyId?: string }

/**
 * Every line the Trust Score is made of, newest first, so any deduction or
 * gain can be traced to the study that caused it. Completions past the
 * yearly cap and ratings outside the last-ten window show as 0.
 */
export function trustHistory(state: PlatformState, personId: string, now: Date = new Date()): TrustHistoryEntry[] {
  const person = personById(state, personId)
  if (!person) return []
  const entries = entriesOf(state, personId)
  const paid = entries.filter((e) => isPaid(e.p)).sort((a, b) => b.p.paidAt!.localeCompare(a.p.paidAt!))
  const room = Math.max(0, TRUST.STUDY_COMPLETION_CAP_PER_YEAR - person.prior.completedThisYear)
  const counted = new Set(paid.filter((e) => sameYear(e.p.paidAt!, now)).slice(-room || paid.length + 1).map((e) => e.study.id))
  const rated = entries.filter((e) => e.p.rating).sort((a, b) => b.p.rating!.at.localeCompare(a.p.rating!.at))
  const inWindow = new Set(rated.slice(0, TRUST.RATINGS_WINDOW).map((e) => e.study.id))
  const when = (e: Entry, label: string) => e.p.events.find((t) => t.label === label)?.at ?? e.p.paidAt ?? e.p.completedAt ?? e.study.endsAt
  const priorRatings = sum(person.prior.stars.slice(-Math.max(0, TRUST.RATINGS_WINDOW - rated.length) || person.prior.stars.length + 1), trustForStars)
  const out: TrustHistoryEntry[] = [
    { label: 'Onboarding', detail: 'Fixed starting score', delta: TRUST.ONBOARDING, at: person.joinedAt },
    ...(person.prior.completedThisYear || person.prior.stars.length ? [{
      label: 'Earlier record', detail: `${person.prior.completedThisYear} studies and ${person.prior.stars.length} ratings before this year's list`,
      delta: Math.min(TRUST.STUDY_COMPLETION_CAP_PER_YEAR, person.prior.completedThisYear) * TRUST.STUDY_COMPLETION + (rated.length >= TRUST.RATINGS_WINDOW ? 0 : priorRatings),
      at: person.joinedAt,
    }] : []),
    ...paid.map((e) => ({ label: 'Study completed', detail: e.study.title, studyId: e.study.id, at: e.p.paidAt!, delta: room > 0 && counted.has(e.study.id) ? TRUST.STUDY_COMPLETION : 0 })),
    ...rated.map((e) => ({ label: `${e.p.rating!.stars}-star client rating`, detail: e.study.title, studyId: e.study.id, at: e.p.rating!.at, delta: inWindow.has(e.study.id) ? trustForStars(e.p.rating!.stars) : 0 })),
    ...entries.filter((e) => e.p.state === 'no_show').map((e) => ({ label: 'No show', detail: e.study.title, studyId: e.study.id, at: when(e, 'No Show'), delta: TRUST.NO_SHOW })),
    ...paid.filter((e) => e.p.lateShow).map((e) => ({ label: 'Late show up', detail: e.study.title, studyId: e.study.id, at: when(e, 'Late show up'), delta: TRUST.LATE_SHOW_UP })),
    ...person.trustEvents.map((e) => ({
      label: e.kind === 'fraud' ? 'Fraud' : 'Cancelled session', detail: e.detail, studyId: e.studyId, at: e.at,
      delta: e.kind === 'fraud' ? TRUST.FRAUD : TRUST.CANCELLED_SESSION,
    })),
  ]
  return out.sort((a, b) => b.at.localeCompare(a.at))
}

// --------------------------------------------------------------------- wallet

export type EarningCategory = 'Interview' | 'Focus Group' | 'Survey' | 'In-Person' | 'Redeem Points'
const CATEGORY: Record<StudyType, EarningCategory> = {
  survey: 'Survey', diary: 'Survey', video_call: 'Interview', group_video_call: 'Focus Group', in_person: 'In-Person', in_person_group: 'Focus Group',
}

export interface WalletRow { id: string; studyId?: string; approved?: boolean; title: string; at: string; amount: number; txNumber: string; category: EarningCategory }
export interface PayoutRow { id: string; at: string; amount: number; fee: number; net: number; destination: string; txId: string; status: 'processing' | 'completed'; state: PayoutStatus; expectedBy?: string; releasedAt?: string }

const txNumber = (seed: string) => `#${200 + (hash(seed) % 60)}-${String(100 + (hash(seed + '#') % 900))}`

/** Money in: one row per paid study and one per redemption, newest first. */
export function walletRows(state: PlatformState, personId: string): WalletRow[] {
  const person = personById(state, personId)
  const earned = entriesOf(state, personId).filter((e) => isPaid(e.p)).map((e): WalletRow => ({
    id: `tx-${e.study.id}`, studyId: e.study.id, approved: true, title: e.study.title, at: e.p.paidAt!,
    amount: e.study.rates.incentivePer, txNumber: txNumber(e.study.id + personId), category: CATEGORY[e.study.type],
  }))
  const redeemed = (person?.redemptions ?? []).map((r): WalletRow => ({
    id: `tx-${r.id}`, title: `${r.points.toLocaleString('en-US')} points redeemed`, at: r.at,
    amount: pointsToUsd(r.points), txNumber: r.reference, category: 'Redeem Points',
  }))
  return [...earned, ...redeemed].sort((a, b) => b.at.localeCompare(a.at))
}

export const payoutRows = (person: Person | undefined): PayoutRow[] =>
  (person?.payouts ?? []).map((p) => ({ ...p, state: payoutState(p.status), status: payoutState(p.status) === 'paid' ? 'completed' as const : 'processing' as const, fee: FEES.WITHDRAWAL, net: p.amount - FEES.WITHDRAWAL }))

// --------------------------------------------------------------------- points

export type PointsKind = 'referral' | 'study' | 'streak' | 'bonus'
export interface PointsRow { id: string; kind: PointsKind; label: string; detail: string; at: string; amount: number }
export interface RedeemRow { id: string; at: string; points: number; amount: number; reference: string }

/** Months in which the person had enough paid studies to complete a streak, with the moment it completed. */
function streakMonths(entries: Entry[]): { month: string; at: string }[] {
  const byMonth = new Map<string, string[]>()
  for (const e of entries.filter((x) => isPaid(x.p))) {
    const d = new Date(e.p.paidAt!)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    byMonth.set(key, [...(byMonth.get(key) ?? []), e.p.paidAt!])
  }
  return [...byMonth.values()].filter((v) => v.length >= STREAK_TARGET).map((v) => {
    const at = [...v].sort()[STREAK_TARGET - 1]!
    return { month: new Date(at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), at }
  })
}

/**
 * What a client or the console may see of a person's picture and intro video:
 * each only while its own consent is on, and nothing otherwise. Every screen
 * outside the respondent's own app reads them through these two.
 */
export const sharedPhoto = (p: Pick<Person, 'photo' | 'photoConsent'>): string | undefined => (p.photoConsent ? p.photo : undefined)
export const sharedVideo = (p: Pick<Person, 'video' | 'videoConsent'>): Person['video'] | undefined => (p.videoConsent ? p.video : undefined)

/** Every award of points, newest first. All of it is the policy's section 4. */
export function pointsRows(state: PlatformState, personId: string): PointsRow[] {
  const person = personById(state, personId)
  if (!person) return []
  const entries = entriesOf(state, personId)
  const rows: PointsRow[] = [
    ...(person.sourceCode ? [{ id: 'pt-referred', kind: 'bonus' as const, label: 'Bonus', detail: 'Joined by referral', at: new Date(new Date(person.joinedAt).getTime() + 5 * 60_000).toISOString(), amount: POINTS.BEING_REFERRED }] : []),
    ...(person.fullProfileAt ? [{ id: 'pt-profile', kind: 'bonus' as const, label: 'Bonus', detail: 'Full profile completion', at: person.fullProfileAt, amount: POINTS.FULL_PROFILE }] : []),
    ...(person.pictureAddedAt ? [{ id: 'pt-picture', kind: 'bonus' as const, label: 'Bonus', detail: 'Profile picture added', at: person.pictureAddedAt, amount: POINTS.PROFILE_PICTURE }] : []),
    ...(person.videoAddedAt ? [{ id: 'pt-video', kind: 'bonus' as const, label: 'Bonus', detail: 'Intro video added', at: person.videoAddedAt, amount: POINTS.INTRO_VIDEO }] : []),
    ...entries.filter((e) => isPaid(e.p)).map((e) => ({ id: `pt-${e.study.id}`, kind: 'study' as const, label: 'Study', detail: e.study.title, at: e.p.paidAt!, amount: POINTS.STUDY_COMPLETION })),
    // Policy section 3: "someone you referred joins". Paid on joining, whether or not they have completed a study yet.
    ...person.referrals.map((r) => ({ id: `pt-${r.id}`, kind: 'referral' as const, label: 'Referral', detail: r.name, at: r.at, amount: POINTS.REFERRAL })),
    ...streakMonths(entries).map((s) => ({ id: `pt-streak-${s.month}`, kind: 'streak' as const, label: 'Streak', detail: s.month, at: s.at, amount: POINTS.STREAK })),
  ]
  return rows.sort((a, b) => b.at.localeCompare(a.at))
}

export const redeemRows = (person: Person | undefined): RedeemRow[] =>
  (person?.redemptions ?? []).map((r) => ({ ...r, amount: pointsToUsd(r.points) }))

// ------------------------------------------------------------------ profile

/** Fields that count towards "N% completed" on the profile card. */
export const PROFILE_FIELDS = [
  'name', 'phone', 'gender', 'address', 'areaType', 'aboutMe', 'languages', 'nationality', 'income', 'ethnicity', 'pets',
  'homeOwner', 'occupation', 'experience', 'licenseId', 'industry', 'education', 'topics', 'dob', 'idType', 'introVideo',
] as const

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim()))

export function profileCompletion(person: Pick<Person, 'name' | 'phone' | 'profile'>): number {
  const done = PROFILE_FIELDS.filter((k) => (k === 'name' ? filled(person.name) : k === 'phone' ? filled(person.phone) : filled(person.profile[k]))).length
  return Math.round((done / PROFILE_FIELDS.length) * 100)
}

/** Age in whole years from a "DD / MM / YYYY" date of birth, or undefined. */
export function ageFrom(dob: string, now: Date = new Date()): number | undefined {
  const m = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(dob.trim())
  if (!m) return undefined
  const [, dd, mm, yyyy] = m.map(Number)
  let age = now.getFullYear() - yyyy!
  if (now.getMonth() + 1 < mm! || (now.getMonth() + 1 === mm && now.getDate() < dd!)) age -= 1
  return age
}

/** A person's referral code, as their link carries it: first name and a short code from the account. */
export const referralCode = (name: string, email: string): string => `${(name.split(' ')[0] || 'friend').toUpperCase()}${accountCode(email, 3)}`

/** A short stable code from the account, used by the referral link and the study certificate. */
export function accountCode(email: string, length = 4): string {
  let h = hash(email.toLowerCase())
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i++) { out += alphabet[h % alphabet.length]; h = Math.floor(h / alphabet.length) + 7 }
  return out
}

/**
 * Policy section 7: one certificate per participant, "with a unique ID
 * generated once and never reused". The ID is drawn at random until it is one
 * nobody holds, participant or client, then stored on the record; it is never
 * recomputed, so a changed email cannot change it. `draw` is Math.random
 * except in the seed, which passes its own so the demo is the same each time.
 * Participants get FI-XXXX-XXXX, a client's business certificate FI-C-XXXX-XXXX.
 */
export function freshCertificateId(state: Pick<PlatformState, 'people' | 'clients'>, kind: 'participant' | 'business', draw: () => number = Math.random): string {
  const taken = new Set([...state.people.map((p) => p.certificateId), ...state.clients.map((c) => c.certificateId)].filter(Boolean))
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const prefix = kind === 'business' ? `${CERTIFICATE.ID_PREFIX}-C` : CERTIFICATE.ID_PREFIX
  for (;;) {
    let code = ''
    for (let i = 0; i < 8; i++) code += alphabet[Math.floor(draw() * alphabet.length) % alphabet.length]
    const id = `${prefix}-${code.slice(0, 4)}-${code.slice(4)}`
    if (!taken.has(id)) return id
  }
}

/** Issued when identity verification completes, never before (policy section 7): verified, and an ID on record. */
export const hasCertificate = (person: Person): boolean => person.identity.state === 'verified' && Boolean(person.certificateId)

/**
 * Whether a participant may take part right now (policy section 9). A
 * restriction holds until its end date and lifts on it, even before the
 * store's tick has written that down; a deactivation holds until reversed.
 */
export function barredFrom(person: Pick<Person, 'status' | 'statusNote'>, now: Date = new Date()): { kind: 'restricted'; until: string; category: string; reason: string } | { kind: 'deactivated'; reason: string; category: string } | null {
  if (person.status === 'deactivated') return { kind: 'deactivated', reason: person.statusNote?.reason ?? '', category: person.statusNote?.category ?? 'Team decision' }
  if (person.status !== 'restricted') return null
  const until = person.statusNote?.until
  if (until && new Date(until).getTime() <= now.getTime()) return null
  return { kind: 'restricted', until: until ?? '', category: person.statusNote?.category ?? 'Team decision', reason: person.statusNote?.reason ?? '' }
}

/** "Valid twelve months and renews on its own": from the latest anniversary of joining to twelve months later. */
export function certificateValidity(joinedAt: string, now: Date = new Date()): { from: Date; to: Date } {
  const from = new Date(joinedAt)
  from.setFullYear(now.getFullYear())
  if (from > now) from.setFullYear(now.getFullYear() - 1)
  const to = new Date(from)
  to.setMonth(to.getMonth() + CERTIFICATE.VALID_MONTHS)
  return { from, to }
}

// ---------------------------------------------------- one person, every figure

export interface PersonFigures {
  walletBalance: number
  /** Earnings credited but waiting on the client approving the payout (workflow 46). */
  pendingEarnings: number
  allTimeEarned: number
  yearEarned: number
  points: number
  trustScore: number
  tier: Tier
  completedStudies: number
  noShows: number
  streak: { current: number; target: number; month: string }
  profileCompletion: number
  /** Performance ratings as percentages, from the client ratings on record. */
  ratings: { expertise: number; reliability: number; communication: number; successRate: number }
  /** Workflow 49: earned $600 in the year and the tax form is not on file. */
  taxFormRequired: boolean
}

export function personFigures(state: PlatformState, personId: string, now: Date = new Date()): PersonFigures {
  const person = personById(state, personId)
  const entries = entriesOf(state, personId)
  const rows = walletRows(state, personId)
  const earned = rows.filter((r) => r.category !== 'Redeem Points')
  const paid = entries.filter((e) => isPaid(e.p))
  const noShows = entries.filter((e) => e.p.state === 'no_show').length
  const score = trustScoreOf(state, personId, now)
  /**
   * A rating scores three dimensions when the client gave them; otherwise the
   * rating's stars stand for all three, as do the ratings from before the seed.
   */
  const rated = entries.filter((e) => e.p.rating)
  const pct = (key: 'expertise' | 'reliability' | 'communication') => {
    const scores = [...(person?.prior.stars ?? []), ...rated.map((e) => e.p.rating![key] ?? e.p.rating!.stars)]
    return scores.length ? Math.round((sum(scores, (x) => x) / (scores.length * 5)) * 100) : 0
  }
  const done = paid.length + (person?.prior.completedThisYear ?? 0)
  const attempted = done + noShows
  const yearEarned = sum(earned.filter((r) => sameYear(r.at, now)), (r) => r.amount)
  return {
    walletBalance: Math.round((sum(rows, (r) => r.amount) - sum(person?.payouts ?? [], (p) => p.amount)) * 100) / 100,
    pendingEarnings: sum(entries.filter((e) => e.p.state === 'completed' && !e.p.paidAt), (e) => e.study.rates.incentivePer),
    allTimeEarned: sum(earned, (r) => r.amount),
    yearEarned,
    points: sum(pointsRows(state, personId), (r) => r.amount) - sum(person?.redemptions ?? [], (r) => r.points),
    trustScore: score, tier: tierFor(score),
    completedStudies: paid.length, noShows,
    streak: {
      current: paid.filter((e) => sameMonth(e.p.paidAt!, now)).length, target: STREAK_TARGET,
      month: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    },
    profileCompletion: person ? profileCompletion(person) : 0,
    ratings: {
      expertise: pct('expertise'), reliability: pct('reliability'), communication: pct('communication'),
      successRate: attempted ? Math.round((done / attempted) * 100) : 0,
    },
    taxFormRequired: yearEarned >= TAX_FORM_THRESHOLD && !person?.taxFormDone,
  }
}

/**
 * What a client, or the team, is shown about one participant: who they are
 * professionally, how they have performed, and what has been verified.
 * Workflow 27: never a surname, an email or a phone number.
 */
export interface ProfileCard {
  id: string; name: string; role: string; location: string; experienceYears: number
  certificateId?: string
  score: number; tier: Tier
  ratings: PersonFigures['ratings']
  about: { occupation: string; industry: string; education: string; gender: string; age?: number; interests: string }
  /** The checks that have passed, in the frames' words. */
  verified: string[]
  completedStudies: number; earned: number; streaks: number
}

export function profileCard(state: PlatformState, personId: string, now: Date = new Date()): ProfileCard | undefined {
  const p = personById(state, personId)
  if (!p) return undefined
  const f = personFigures(state, personId, now)
  return {
    id: p.id, name: shortName(p.name), role: p.profile.occupation, location: p.location,
    experienceYears: Number.parseInt(p.profile.experience, 10) || 0,
    certificateId: hasCertificate(p) ? p.certificateId : undefined,
    score: f.trustScore, tier: f.tier, ratings: f.ratings,
    about: { occupation: p.profile.occupation, industry: p.profile.industry, education: p.profile.education, gender: p.profile.gender, age: ageFrom(p.profile.dob, now), interests: p.profile.topics.join(', ') },
    verified: [
      ...(p.profession.state === 'verified' ? ['Verified Professional'] : []),
      ...(p.identity.state === 'verified' ? ['Government ID Verified'] : []),
      ...(p.livePhoto ? ['Live Photo Verified'] : []),
      ...(p.profession.state === 'verified' ? ['Register cross checked'] : []),
    ],
    completedStudies: f.completedStudies + p.prior.completedThisYear, earned: f.allTimeEarned,
    streaks: streakMonths(entriesOf(state, personId)).length,
  }
}

// ------------------------------------------------------------------ clients

export interface ClientReviewRow {
  id: string; study: string; stars: number; at: string; comment?: string
  /** The client's rating of that participant, shown under the review. */
  /** `id` is absent on the earlier reviews on record, which name the participant without linking a profile. */
  participant: { id?: string; name: string; stars: number; comment?: string }
}

/** Every review of a client: the earlier ones on record, then the ones participants left on the client's studies. */
export function clientReviews(state: PlatformState, clientId: string): ClientReviewRow[] {
  const client = clientById(state, clientId)
  const seeded = state.studies.filter((s) => s.clientId === clientId).flatMap((s) => s.participations.filter((p) => p.clientReview).map((p): ClientReviewRow => ({
    id: `${s.id}-${p.personId}`, study: s.title,
    stars: Math.round((p.clientReview!.reliability + p.clientReview!.communication) / 2), at: p.clientReview!.at, comment: p.clientReview!.comment,
    participant: { id: p.personId, name: shortName(personById(state, p.personId)?.name ?? ''), stars: p.rating?.stars ?? 0, comment: p.rating?.comment },
  })))
  return [...seeded, ...(client?.earlierReviews ?? [])].sort((a, b) => b.at.localeCompare(a.at))
}

export function clientRating(state: PlatformState, clientId: string): { rating: number; reviewCount: number } {
  const reviews = clientReviews(state, clientId)
  return { rating: reviews.length ? Math.round((sum(reviews, (r) => r.stars) / reviews.length) * 10) / 10 : 0, reviewCount: reviews.length }
}

/**
 * Workflow 15, 17, 57: what stands in front of applying, in the order the
 * workflow applies it. Null when the person can go straight to the screener.
 * shared/store.ts startApplication enforces the same three.
 */
export function applyBlocker(state: PlatformState, studyId: string, personId: string): 'verify' | 'premium' | 'repeat' | null {
  const study = studyById(state, studyId)
  const person = personById(state, personId)
  if (!study || !person) return null
  if (!person.onboarded || person.identity.state !== 'verified') return 'verify'
  if (study.premium && person.profession.state !== 'verified') return 'premium'
  const p = participationOf(study, personId)
  // A client who has already invited this person has waived their own repeat rule.
  if (study.repeatRule === 'exclude' && p?.state !== 'invited' && hasTakenPartWith(state, personId, study.clientId, study.id)) return 'repeat'
  return null
}

/** A booked session that has not started yet cannot be completed by the participant. */
export const sessionNotStarted = (booking: Pick<Booking, 'date' | 'slot'> | undefined, now: Date = new Date()): boolean =>
  Boolean(booking) && sessionStartOf(booking!) > now

/** The moment a booked session starts: the booked day at the slot's time. */
export function sessionStartOf(booking: Pick<Booking, 'date' | 'slot'>): Date {
  const d = new Date(booking.date)
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(booking.slot.trim())
  if (m) {
    let h = Number(m[1]) % 12
    if (m[3]!.toUpperCase() === 'PM') h += 12
    d.setHours(h, Number(m[2]), 0, 0)
  }
  return d
}

/** Workflow 57: has this person taken part in a study for this client before? */
export const hasTakenPartWith = (state: PlatformState, personId: string, clientId: string, exceptStudyId?: string): boolean =>
  state.studies.some((s) => s.clientId === clientId && s.id !== exceptStudyId && participationOf(s, personId)?.state === 'completed')

// ------------------------------------------------- the respondent's view of a study

/**
 * How well a study fits a person, 0 to 100. A stand-in for the search in
 * workflow 24: the same industry and a role named in the study's target
 * count most, and the rest is a stable spread so cards do not all read alike.
 */
export function matchScore(study: Study, person: Person): number {
  const industry = study.industry.toLowerCase() === person.profile.industry.toLowerCase() ? 12 : 0
  const role = person.profile.occupation && study.targetProfession.toLowerCase().includes(person.profile.occupation.toLowerCase().split(/[ ,]/)[0]!) ? 6 : 0
  return Math.min(98, 62 + (hash(study.id + person.id) % 20) + industry + role)
}

/**
 * The slots still open on a study: what the client offered, less what other
 * people have booked, and less anything closer than the minimum notice the
 * client set (a study built in the Create flow carries one).
 */
export function openAvailability(study: Study, exceptPersonId?: string, now: Date = new Date()): { date: string; slots: string[] }[] {
  const booked = study.participations.filter((p) => p.state === 'scheduled' && p.booking && p.personId !== exceptPersonId).map((p) => p.booking!)
  if (study.sessions) {
    return study.sessions
      .filter((s) => booked.filter((b) => b.sessionId === s.id).length < s.seats)
      .map((s) => ({ date: s.date, slots: [s.slot] }))
  }
  const earliest = study.schedule ? now.getTime() + study.schedule.noticeMins * 60_000 : undefined
  return (study.availability ?? []).map((a) => ({
    date: a.date,
    slots: a.slots.filter((slot) => !booked.some((b) => sameDay(b.date, a.date) && b.slot === slot)
      && (earliest === undefined || sessionStartOf({ date: a.date, slot }).getTime() >= earliest)),
  }))
}

export interface RespondentStudy {
  id: string
  title: string
  description: string
  image: string
  type: StudyType
  industry: string
  matchScore: number
  reward: number
  durationMins: number
  endsAt: string
  daysLeft: number
  targetProfession: string
  client: { id: string; name: string; rating: number; reviewCount: number }
  locations?: Study['locations']
  availability?: { date: string; slots: string[] }[]
  status: RespondentStatus
  saved: boolean
  premium?: boolean
  repeatRule: RepeatRule
  city?: string
  linkCode: string
  preScreener: PreScreenQuestion[]
  screener: Question[]
  tasks?: Question[]
  diary?: { totalDays: number; minDays: number; completedDays: number[]; unit?: string; frequency?: string }
  booking?: Booking
  pinConfirmed?: boolean
  timeline: { label: string; at: string }[]
  clientReview?: { stars: number; comment: string; expertise: number; reliability: number; communication: number; trustDelta: number }
  userReview?: { reliability: number; communication: number; comment?: string }
  ratedByUser?: boolean
}

/** One study as one person sees it: the study, plus their own part in it. */
export function respondentStudy(state: PlatformState, study: Study, person: Person, now: Date = new Date()): RespondentStudy {
  const p = participationOf(study, person.id)
  const client = clientById(state, study.clientId)
  const status = respondentStatus(study.type, p)
  return {
    id: study.id, title: study.title, description: study.description, image: study.image ?? '', type: study.type, industry: study.industry,
    matchScore: matchScore(study, person), reward: study.rates.incentivePer, durationMins: study.durationMins,
    endsAt: study.endsAt, daysLeft: daysRemaining(study, now), targetProfession: study.targetProfession,
    client: { id: study.clientId, name: client?.company ?? '', ...clientRating(state, study.clientId) },
    locations: study.locations, availability: isSessionType(study.type) ? openAvailability(study, person.id, now) : undefined,
    status, saved: person.savedStudyIds.includes(study.id), premium: study.premium, repeatRule: study.repeatRule, city: study.city,
    linkCode: study.linkCode, preScreener: study.preScreener, screener: study.screener, tasks: study.tasks,
    diary: study.diary ? { ...study.diary, completedDays: p?.diaryDays ?? [] } : undefined,
    booking: status === 'available' ? undefined : p?.booking, pinConfirmed: Boolean(p?.code?.byParticipant),
    timeline: status === 'available' ? [] : p?.events ?? [],
    clientReview: p?.rating ? {
      stars: p.rating.stars, comment: p.rating.comment ?? '', expertise: p.rating.expertise ?? p.rating.stars,
      reliability: p.rating.reliability ?? p.rating.stars, communication: p.rating.communication ?? p.rating.stars,
      trustDelta: trustForStars(p.rating.stars),
    } : undefined,
    userReview: p?.clientReview, ratedByUser: Boolean(p?.clientReview),
  }
}

/**
 * The studies a person can see: everything live from an active client, plus
 * anything they already have a part in, whatever became of the study since.
 */
export function respondentStudies(state: PlatformState, personId: string, now: Date = new Date()): RespondentStudy[] {
  const person = personById(state, personId)
  if (!person) return []
  return state.studies
    .filter((s) => {
      const p = participationOf(s, personId)
      const mine = p && p.state !== 'matched' && p.state !== 'withdrawn'
      return mine || (isLive(s.state) && clientById(state, s.clientId)?.status === 'active')
    })
    .map((s) => respondentStudy(state, s, person, now))
}

// ------------------------------------------------- a study's counts and progress

export interface Counts {
  matched: number; invited: number; applied: number; qualified: number; disqualified: number
  recruited: number; scheduled: number; completed: number; noShow: number; rated: number
  /** Everyone who got as far as answering, which is what "applied" means on the study header. */
  everApplied: number
  /** Everyone a person confirmed, which is what "qualified" means on the study header. */
  everQualified: number
  /** Workflow 54: the people actually delivered, which is what the client is billed for. */
  delivered: number
  /** Completed and the payout approved. */
  paid: number
}

export function counts(study: Study): Counts {
  const n = (s: ParticipationState) => study.participations.filter((p) => p.state === s).length
  const completed = n('completed')
  return {
    matched: n('matched'), invited: n('invited'), applied: n('applied'), qualified: n('qualified'), disqualified: n('disqualified'),
    recruited: n('recruited'), scheduled: n('scheduled'), completed, noShow: n('no_show'),
    rated: study.participations.filter((p) => p.state === 'completed' && p.rating).length,
    everApplied: study.participations.filter((p) => hasApplied(p.state)).length,
    everQualified: study.participations.filter((p) => hasQualified(p.state)).length,
    delivered: completed, paid: study.participations.filter(isPaid).length,
  }
}

/** The progress bar and the header's Progress figure, from one place. */
export const progressPct = (study: Study): number =>
  study.required === 0 ? 0 : Math.min(100, Math.floor((counts(study).completed / study.required) * 100))

/** The three segments the study cards draw: completed, screening and remaining. */
export function segments(study: Study): [number, number, number] {
  const c = counts(study)
  if (study.required === 0) return [0, 0, 100]
  const done = Math.min(100, (c.completed / study.required) * 100)
  const screening = Math.min(100 - done, ((c.recruited + c.scheduled + c.qualified + c.applied) / study.required) * 100)
  return [Math.round(done), Math.round(screening), Math.max(0, 100 - Math.round(done) - Math.round(screening))]
}

/** When anything last happened on a study. */
export function lastActivity(study: Study): string {
  const stamps = [study.createdAt, study.submittedAt, study.approvedAt, study.stoppedAt, study.completedAt, ...study.participations.flatMap((p) => p.events.map((e) => e.at))]
  return stamps.filter((x): x is string => Boolean(x)).sort().at(-1) ?? study.createdAt
}

// ---------------------------------------------------- a study's people, joined

/** A participation joined to its person. `name` is the first name and initial, which is all a client sees. */
export interface Recruit {
  id: string
  name: string
  /** The full name. The console shows it; the client app never does. */
  fullName: string
  /** Only what the participant has consented to share (sharedPhoto, sharedVideo). */
  photo?: string
  video?: Person['video']
  role: string
  location: string
  experienceYears: number
  professionVerified: boolean
  score: number
  tier: Tier
  state: ClientTag
  participation: Participation
}

export function recruits(state: PlatformState, study: Study, tab?: 'matched' | 'invited' | 'recruited' | 'results', now: Date = new Date()): Recruit[] {
  return study.participations.flatMap((pt) => {
    const p = personById(state, pt.personId)
    if (!p) return []
    if (tab && recruitingTab(pt.state) !== tab) return []
    const score = trustScoreOf(state, p.id, now)
    return [{
      id: p.id, name: shortName(p.name), fullName: p.name, photo: sharedPhoto(p), video: sharedVideo(p), role: p.profile.occupation, location: p.location,
      experienceYears: Number.parseInt(p.profile.experience, 10) || 0, professionVerified: p.profession.state === 'verified',
      score, tier: tierFor(score), state: clientTag(pt), participation: pt,
    }]
  })
}

export const recruit = (state: PlatformState, study: Study, personId: string): Recruit | undefined =>
  recruits(state, study).find((r) => r.id === personId)

/**
 * The study verification certificate on Results: how many of the people who
 * completed passed the identity check, and when the study's record was sealed.
 * Its own prefix, FI-S, so it is never mistaken for the client's business
 * certificate (FI-C) or a participant's (FI). It claims identity checks only:
 * no duplicate check exists, so none is claimed.
 */
export function studyCertificate(state: PlatformState, study: Study, now: Date = new Date()) {
  const done = study.participations.filter((p) => p.state === 'completed')
  const verified = done.filter((p) => personById(state, p.personId)?.identity.state === 'verified').length
  const id = `${CERTIFICATE.ID_PREFIX}-S-${accountCode(study.id, 4)}-${accountCode(study.id + '#', 4)}`
  return { verified, total: done.length, id, issuedAt: study.completedAt ?? now.toISOString() }
}

/** Results tab: "Avg. Trust Score", over the people who actually finished. */
export function averageScore(state: PlatformState, study: Study): number {
  const done = recruits(state, study, 'results').filter((r) => r.participation.state === 'completed')
  return done.length === 0 ? 0 : Math.round(sum(done, (r) => r.score) / done.length)
}

/** The seats taken in each session of a group study. */
export function sessionSeats(study: Study): { id: string; date: string; slot: string; seats: number; taken: number; locationId?: string; people: string[] }[] {
  return (study.sessions ?? []).map((s) => {
    const people = study.participations.filter((p) => p.booking?.sessionId === s.id && (p.state === 'scheduled' || p.state === 'completed' || p.state === 'no_show')).map((p) => p.personId)
    return { ...s, taken: people.length, people }
  })
}

// --------------------------------------------------------------------- money

export interface Billing {
  lines: { label: string; amount: number; sub?: string; info?: boolean }[]
  /** What the people actually delivered come to. */
  total: number
  /** Workflow 33: incentives for the full sample, taken when the study is submitted. */
  deposit: number
  /** Projected at the full sample while the study runs, actual once it is completed. */
  totalCost: number
  /** The total cost less the deposit already taken. */
  due: number
  /** Workflow 54: what is still owed on what was delivered, or a credit back when the study underfilled. */
  net: number
  /** Workflow 10: twenty per cent of the confirmed price, taken as the setup fee. */
  setupFee: number
  delivered: number
  /** What the client has actually paid against the balance. */
  balancePaid: number
  /** Still to pay now: the net less what has been paid. Never negative. */
  outstanding: number
  /** The unused incentive to return when the study underfilled. Zero otherwise. */
  refund: number
  /**
   * Billing States, Estimated (19 Oct 2026): the same lines at the required
   * number of participants, i.e. the quote the study was published at, and
   * what that would leave payable after the deposit. Display only.
   */
  estimate: { lines: { label: string; amount: number; sub?: string; info?: boolean }[]; total: number; net: number }
  refundPaid: number
}

const paidOf = (study: Study, kind: StudyPayment['kind']) => sum(study.payments.filter((p) => p.kind === kind), (p) => p.amount)

/**
 * The bill, built from the study's rates and the people actually delivered,
 * which is what workflow 54 says the client is charged for.
 */
export function billing(study: Study): Billing {
  const { recruitingPer, incentivePer, moderationPer, platformFee } = study.rates
  const delivered = counts(study).delivered
  const linesAt = (n: number) => [
    { label: 'Platform Fee', amount: platformFee },
    { label: 'Recruiting Fee', amount: recruitingPer * n, sub: `$${recruitingPer} x ${n} participants`, info: true },
    { label: 'Incentives', amount: incentivePer * n, sub: `$${incentivePer} x ${n} participants`, info: true },
    { label: 'Moderation Fee', amount: moderationPer * n, sub: `$${moderationPer} x ${n} participants`, info: true },
  ]
  const lines = linesAt(delivered)
  const total = sum(lines, (l) => l.amount)
  const deposit = depositFor(study.rates, study.required)
  const projected = platformFee + (recruitingPer + incentivePer + moderationPer) * study.required
  const totalCost = isStopped(study.state) ? total : projected
  const net = total - deposit
  const balancePaid = paidOf(study, 'balance')
  const refundPaid = paidOf(study, 'refund')
  const closed = isStopped(study.state)
  return {
    lines, total, deposit, totalCost, due: totalCost - deposit, net, setupFee: Math.round(total * FEES.SETUP_SHARE), delivered,
    balancePaid, outstanding: closed ? Math.max(0, net - balancePaid) : 0,
    refund: closed && net < 0 ? -net : 0, refundPaid,
    estimate: { lines: linesAt(study.required), total: projected, net: projected - deposit },
  }
}

/** Workflow 46: the payout list the platform builds from attendance and completion. */
export interface PayoutLine { person: Recruit; amount: number; codeConfirmed: boolean; approved: boolean }

export function payoutList(state: PlatformState, study: Study): PayoutLine[] {
  return recruits(state, study, 'results').filter((r) => isPayable(r.participation.state)).map((r) => ({
    person: r, amount: study.rates.incentivePer,
    codeConfirmed: !isSessionType(study.type) || Boolean(r.participation.code?.byClient && r.participation.code?.byParticipant),
    approved: Boolean(r.participation.paidAt),
  }))
}

/** What has been taken from the card so far for people, per workflow 33. */
export const charged = (study: Study): number => study.rates.incentivePer * study.participations.filter((p) => isCharged(p.state)).length

/** The status pill. Billing is a state since 22 Oct 2026: recruiting has stopped and the bill is open. */
export function statusTag(study: Study): { label: string; tone: 'neutral' | 'green' | 'grey' | 'yellow' } {
  if (study.state === 'billing') return { label: 'Billing', tone: 'neutral' }
  if (study.state === 'completed') return { label: 'Completed', tone: 'green' }
  if (study.state === 'paused') return { label: STUDY_TAG.paused, tone: 'yellow' }
  if (study.state === 'draft' || study.state === 'in_review' || study.state === 'cancelled') return { label: STUDY_TAG[study.state], tone: 'grey' }
  return { label: STUDY_TAG[study.state], tone: 'neutral' }
}

// ---------------------------------------------------------------- one client

export const studiesOf = (state: PlatformState, clientId: string): Study[] => state.studies.filter((s) => s.clientId === clientId)

/** The client dashboard's five tiles. */
export function dashboardStats(state: PlatformState, studies: Study[]) {
  const scored = studies.flatMap((s) => recruits(state, s, 'results')).filter((r) => r.participation.state === 'completed')
  const priced = studies.filter((s) => s.required > 0)
  return {
    ongoing: studies.filter((s) => s.state === 'recruiting' || s.state === 'ongoing' || s.state === 'paused' || s.state === 'billing').length,
    completed: studies.filter((s) => s.state === 'completed').length,
    hired: sum(studies, (s) => counts(s).delivered),
    avgScore: scored.length === 0 ? 0 : Math.round(sum(scored, (r) => r.score) / scored.length),
    avgIncentive: priced.length === 0 ? 0 : sum(priced, (s) => s.rates.incentivePer) / priced.length,
  }
}

/** Workflow 53: "a red alert on login while incentives are unpaid". */
export const unpaidStudies = (studies: Study[]): Study[] => studies.filter((s) => s.state === 'billing' && billing(s).outstanding > 0)

/**
 * The policy guardrail and workflow 57: who a study's repeat rule allows.
 * `exclude` drops anyone who has completed one of this client's studies,
 * `allow` leaves the list alone.
 */
export function applyRepeatRule(state: PlatformState, study: Study, people: Person[]): Person[] {
  if (study.repeatRule !== 'exclude') return people
  return people.filter((p) => !hasTakenPartWith(state, p.id, study.clientId, study.id))
}

/** A person as the client app's Pool and panels list them. */
export interface PoolPerson {
  id: string; name: string; role: string; score: number; tier: Tier
  domain: string; gender: string; location: string; language: string; lastActiveWeeks: number
  professionVerified: boolean; experienceYears: number
  /** Only what the participant has consented to share (sharedPhoto, sharedVideo). */
  photo?: string
  video?: Person['video']
}

export function poolPerson(state: PlatformState, p: Person, now: Date = new Date()): PoolPerson {
  const score = trustScoreOf(state, p.id, now)
  return {
    id: p.id, name: shortName(p.name), role: p.profile.occupation, score, tier: tierFor(score), domain: p.profile.industry,
    gender: p.profile.gender, location: p.location, language: p.profile.languages[0] ?? 'English',
    lastActiveWeeks: Math.max(0, Math.round((now.getTime() - new Date(p.lastActiveAt).getTime()) / (7 * DAY))),
    professionVerified: p.profession.state === 'verified', experienceYears: Number.parseInt(p.profile.experience, 10) || 0,
    photo: sharedPhoto(p), video: sharedVideo(p),
  }
}

/**
 * Workflow 24: the search runs across everyone verified and active. "Score
 * and tier decide who is ranked first." The Pool and the Matched tab rank
 * this way. It is a ranking shown to one client about their own search, not
 * a public leaderboard.
 */
export function rankedPool(state: PlatformState, study?: Study, now: Date = new Date()): PoolPerson[] {
  const eligible = state.people.filter((p) => p.status === 'active' && p.identity.state === 'verified')
  const allowed = study ? applyRepeatRule(state, study, eligible) : eligible
  const rank = new Map(allowed.map((p, i) => [p.id, i]))
  return allowed.map((p) => poolPerson(state, p, now)).sort((a, b) => b.score - a.score || rank.get(a.id)! - rank.get(b.id)!)
}

/** What a set of pool people looks like as a cohort: how many, the tier split and the average score. */
export function cohort(people: PoolPerson[]) {
  const n = people.length
  const of = (t: Tier) => people.filter((p) => p.tier === t).length
  const split = (['silver', 'gold', 'platinum'] as const).map((tier) => ({ tier, members: of(tier), pct: n === 0 ? 0 : Math.round((of(tier) / n) * 100) }))
  return { count: n, tiers: split, averageScore: n === 0 ? 0 : Math.round(sum(people, (p) => p.score) / n) }
}

/**
 * Workflow 53: one invoice per completed study, built from the study record.
 * Pending while it still owes and paid once it does not.
 */
export interface Invoice { number: string; studyId: string; study: string; date: string; amount: number; paid: boolean; paidAt?: string }

export const invoiceNumber = (study: Study): string => `INV-${1024000 + (hash(study.id) % 9000)}`

export function invoices(studies: Study[]): Invoice[] {
  // The bill opens when recruiting stops (Billing) and stays on record once paid (Completed).
  return studies.filter((s) => isStopped(s.state) && billing(s).net > 0).map((s) => {
    const b = billing(s)
    return {
      number: invoiceNumber(s), studyId: s.id, study: s.title, date: s.stoppedAt ?? s.completedAt ?? s.endsAt, amount: b.net,
      paid: b.outstanding <= 0, paidAt: s.payments.find((p) => p.kind === 'balance')?.at,
    }
  })
}

/** The three figures across the top of Payments. */
export function paymentStats(studies: Study[]) {
  const pending = invoices(studies).filter((i) => !i.paid)
  const done = studies.filter((s) => s.state === 'completed')
  const spent = sum(done, (s) => billing(s).total)
  return {
    due: sum(pending, (i) => i.amount), dueStudies: pending.length, spent, spentStudies: done.length,
    average: done.length === 0 ? 0 : Math.round(spent / done.length), averageStudies: done.length,
  }
}

// ------------------------------------------------------------- pagination

export function paginate<T>(rows: T[], page: number, size: number = PAGE_SIZE) {
  const total = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(1, page), total)
  return { rows: rows.slice((current - 1) * size, current * size), page: current, total }
}

/** The pager's own labels: every page up to seven, then first, ellipsis, last. */
export function pageLabels(total: number, page: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, '…', total - 1, total]
  if (page >= total - 3) return [1, 2, '…', total - 3, total - 2, total - 1, total]
  return [1, '…', page - 1, page, page + 1, '…', total]
}

// ----------------------------------------------------------------- the platform

/** A participation with its study and person, for the console's queues. */
export interface Case { study: Study; person: Person; p: Participation }

const cases = (state: PlatformState, keep: (s: Study, p: Participation) => boolean): Case[] =>
  state.studies.flatMap((study) => study.participations.filter((p) => keep(study, p)).flatMap((p) => {
    const person = personById(state, p.personId)
    return person ? [{ study, person, p }] : []
  }))

/** Workflow 29 and 32: applications waiting for a person to decide. */
export const screenersToReview = (state: PlatformState): Case[] => cases(state, (s, p) => isLive(s.state) && p.state === 'applied')

/** No-shows on studies still running, for the team to confirm with the participant. */
export const noShowsToVerify = (state: PlatformState): Case[] => cases(state, (s, p) => s.state !== 'completed' && p.state === 'no_show')

export type VerificationKind = 'identity' | 'profession'
export interface VerificationCase { id: string; person: Person; kind: VerificationKind; check: Person['identity'] }

const verificationCases = (state: PlatformState, pending: boolean): VerificationCase[] =>
  state.people.flatMap((person) => (['identity', 'profession'] as const).flatMap((kind) => {
    const check = person[kind]
    const open = check.state === 'flagged'
    const decided = Boolean(check.decidedAt)
    return (pending ? open : decided) ? [{ id: `${kind === 'identity' ? 'iv' : 'pc'}-${person.id}`, person, kind, check }] : []
  }))

/** Workflow 3 and 17: identity and profession checks that failed automatically and wait for a person. */
export const verificationsPending = (state: PlatformState): VerificationCase[] =>
  verificationCases(state, true).sort((a, b) => (b.check.flaggedAt ?? '').localeCompare(a.check.flaggedAt ?? ''))
export const verificationsDecided = (state: PlatformState): VerificationCase[] =>
  verificationCases(state, false).sort((a, b) => (b.check.decidedAt ?? '').localeCompare(a.check.decidedAt ?? ''))

export const reportsPending = (state: PlatformState): Report[] => state.reports.filter((r) => !r.outcome).sort((a, b) => b.at.localeCompare(a.at))
export const reportsDecided = (state: PlatformState): Report[] => state.reports.filter((r) => r.outcome).sort((a, b) => (b.decidedAt ?? '').localeCompare(a.decidedAt ?? ''))

/** Workflow 18: client business checks waiting for a person, and the ones decided. */
export const businessPending = (state: PlatformState): Client[] => state.clients.filter((c) => c.business.state === 'flagged')
export const businessDecided = (state: PlatformState): Client[] => state.clients.filter((c) => c.business.decidedAt)

/** How many times an account has been restricted, however it was done: the ladder's position (policy section 9). */
export const restrictionCount = (state: PlatformState, personId: string): number =>
  personById(state, personId)?.restrictions?.length ?? 0

// -- support

/** Console tabs: New has no reply from a person yet, Ongoing has, Closed is closed. */
export const ticketStage = (t: Ticket): 'new' | 'ongoing' | 'closed' =>
  t.status === 'closed' ? 'closed' : t.messages.some((m) => m.from === 'team') ? 'ongoing' : 'new'

export const ticketsIn = (state: PlatformState, stage: 'new' | 'ongoing' | 'closed'): Ticket[] =>
  state.tickets.filter((t) => ticketStage(t) === stage).sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))

export const ticketsOf = (state: PlatformState, kind: 'participant' | 'client', id: string): Ticket[] =>
  state.tickets.filter((t) => t.owner.kind === kind && t.owner.id === id).sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))

/** Who a ticket is from, by name. */
export const ticketOwnerName = (state: PlatformState, t: Ticket): string =>
  (t.owner.kind === 'client' ? clientById(state, t.owner.id)?.name : personById(state, t.owner.id)?.name) ?? ''

/** Unread on the team's side: the last word is the user's. */
export const awaitingTeam = (t: Ticket): boolean => t.status === 'open' && t.messages.at(-1)?.from === 'user'

// -- finance

export type LedgerKind = 'earning' | 'payout' | 'payment' | 'refund'
export interface LedgerRow {
  id: string; kind: LedgerKind; at: string; title: string; amount: number
  /** Who the money went to and who it came from, by name. The platform is one side of every row. */
  to: string; from: string
  studyId?: string; personId?: string; clientId?: string
  /** Extra detail for the row's panel. */
  reference: string
}

export const PLATFORM_NAME = 'HumanLayer'

/** Every movement of money on the platform, newest first. */
export function ledger(state: PlatformState): LedgerRow[] {
  const rows: LedgerRow[] = []
  for (const s of state.studies) {
    const client = clientById(state, s.clientId)
    for (const p of s.participations.filter(isPaid)) {
      const person = personById(state, p.personId)
      rows.push({ id: `le-${s.id}-${p.personId}`, kind: 'earning', at: p.paidAt!, title: s.title, amount: s.rates.incentivePer, to: person?.name ?? '', from: PLATFORM_NAME, studyId: s.id, personId: p.personId, clientId: s.clientId, reference: txNumber(s.id + p.personId) })
    }
    for (const pay of s.payments) {
      if (pay.kind === 'refund') rows.push({ id: `lr-${pay.id}`, kind: 'refund', at: pay.at, title: 'Study Deposit', amount: pay.amount, to: client?.name ?? '', from: PLATFORM_NAME, studyId: s.id, clientId: s.clientId, reference: invoiceNumber(s) })
      else rows.push({ id: `ls-${pay.id}`, kind: 'payment', at: pay.at, title: pay.kind === 'deposit' ? `Incentive deposit: ${s.title}` : s.title, amount: pay.amount, to: PLATFORM_NAME, from: client?.name ?? '', studyId: s.id, clientId: s.clientId, reference: invoiceNumber(s) })
    }
  }
  for (const person of state.people) {
    for (const po of person.payouts) rows.push({ id: `lp-${po.id}`, kind: 'payout', at: po.at, title: `Bank Withdrawal To ${po.destination.replace(/^\*+/, '**** ')}`, amount: po.amount, to: person.name, from: PLATFORM_NAME, personId: person.id, reference: po.txId })
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at))
}

export interface RefundCase {
  study: Study; client: Client | undefined; target: number; shortfall: number
  billed: number; deposit: number; amount: number; confirmed?: StudyPayment
}

/** Completed studies that underfilled far enough for unused incentive to go back to the client. */
export function refundCases(state: PlatformState): RefundCase[] {
  // A refund is due once recruiting stops and the final bill is below the deposit.
  return state.studies.filter((s) => isStopped(s.state)).flatMap((s) => {
    const b = billing(s)
    if (b.refund <= 0) return []
    return [{
      study: s, client: clientById(state, s.clientId), target: s.required, shortfall: s.required - b.delivered,
      billed: b.total, deposit: b.deposit, amount: b.refund, confirmed: s.payments.find((p) => p.kind === 'refund'),
    }]
  }).sort((a, b) => (b.study.completedAt ?? '').localeCompare(a.study.completedAt ?? ''))
}

export const refundsPending = (state: PlatformState): RefundCase[] => refundCases(state).filter((r) => !r.confirmed)

/**
 * A finished study whose participants are still to be paid. Nothing is paid
 * automatically: the team processes these by hand in the console (Finance,
 * Payouts). `ready` can be paid now; the rest are sessions without a code
 * confirmed on both sides ("no code, no payment").
 */
export interface PayoutCase {
  study: Study
  client?: Client
  owed: Participation[]
  ready: Participation[]
  amount: number
  /** The team notification raised when the study finished, when there is one. */
  notice?: TeamNotice
}
export function payoutsToProcess(state: PlatformState): PayoutCase[] {
  // Participants are paid from Billing on (22 Oct 2026): their part is done when recruiting stops.
  return state.studies.filter((s) => isStopped(s.state)).map((study) => {
    const owed = study.participations.filter((p) => p.state === 'completed' && !p.paidAt)
    const ready = owed.filter((p) => !isSessionType(study.type) || Boolean(p.code?.byClient && p.code?.byParticipant))
    return {
      study, client: state.clients.find((c) => c.id === study.clientId), owed, ready, amount: ready.length * study.rates.incentivePer,
      notice: (state.teamNotices ?? []).find((n) => n.kind === 'payouts' && n.studyId === study.id),
    }
  }).filter((c) => c.owed.length > 0)
    .sort((a, b) => (b.notice?.at ?? b.study.stoppedAt ?? b.study.completedAt ?? '').localeCompare(a.notice?.at ?? a.study.stoppedAt ?? a.study.completedAt ?? ''))
}

/** The console's Finance tiles. */
export function financeTotals(state: PlatformState) {
  const rows = ledger(state)
  const of = (k: LedgerKind) => sum(rows.filter((r) => r.kind === k), (r) => r.amount)
  const pending = refundsPending(state)
  const fees = sum(state.studies.filter((s) => isApproved(s.state)), (s) => {
    const b = billing(s)
    return b.total - s.rates.incentivePer * b.delivered
  })
  return {
    clientsSpent: of('payment'), participantsEarned: of('earning'), paidOut: of('payout'), refunded: of('refund'),
    /** What the platform keeps: the fees on what has been delivered. */
    grossRevenue: fees,
    refundsPending: sum(pending, (r) => r.amount), refundStudies: pending.length,
  }
}

// -- the console dashboard

export function consoleDashboard(state: PlatformState) {
  const screeners = screenersToReview(state)
  const checks = verificationsPending(state)
  const business = businessPending(state)
  const reports = reportsPending(state)
  const fresh = ticketsIn(state, 'new')
  const refunds = refundsPending(state)
  const noShows = noShowsToVerify(state)
  const payouts = payoutsToProcess(state)
  return {
    screeners, checks, identity: checks.filter((c) => c.kind === 'identity'), profession: checks.filter((c) => c.kind === 'profession'),
    business, reports, tickets: fresh, refunds, noShows, payouts,
    tiles: {
      screenersToReview: screeners.length,
      onboardingToVerify: checks.length + business.length,
      openTickets: state.tickets.filter((t) => t.status === 'open').length,
      liveStudies: state.studies.filter((s) => isLive(s.state)).length,
    },
    tabs: {
      onboarding: checks.length + business.length,
      studies: screeners.length + refunds.length,
      support: fresh.length,
      manage: noShows.length + reports.length + payouts.length,
      all: checks.length + business.length + screeners.length + refunds.length + payouts.length + fresh.length + noShows.length + reports.length,
    },
  }
}

/** The studies under one of the console's three tabs, newest first. */
export const consoleStudies = (state: PlatformState, tab: 'review' | 'ongoing' | 'completed'): Study[] =>
  state.studies.filter((s) => consoleStudyTab(s.state) === tab)
    .sort((a, b) => (tab === 'review' ? (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '') : lastActivity(b).localeCompare(lastActivity(a))))

/** Whether the study has met its target, which is when the "Congrats!" banner shows. */
export const targetMet = (study: Study): boolean => study.required > 0 && counts(study).completed >= study.required

/** The "Congrats!" banner: a running study that has met its target, unless the client chose to recruit more. */
export const showsTargetMet = (study: Study): boolean =>
  targetMet(study) && !study.beyondTarget && (study.state === 'recruiting' || study.state === 'ongoing')

/** Diary and survey: whether a person has done enough to complete. */
export const diaryReady = (study: Study, p: Participation | undefined): boolean =>
  !study.diary || (p?.diaryDays?.length ?? 0) >= (study.diary.minDays ?? DIARY.MIN_DAYS)

/** The three-state label for a stored rating, for screens that show what the client pressed. */
export const ratingLabel = (rating: { stars: number; state?: RatingState } | undefined): string =>
  !rating ? '' : rating.state ? rating.state.charAt(0).toUpperCase() + rating.state.slice(1) : `${rating.stars} stars`

/** Notifications newest first, with the count unread. */
export const unreadCount = (rows: AppNotification[]): number => rows.filter((n) => !n.read).length

// ---------------------------------------------------------- study reports

/** The reason given most often, the first one given when tied. */
const mostOf = (xs: string[]): string => {
  const n = new Map<string, number>()
  xs.forEach((x) => n.set(x, (n.get(x) ?? 0) + 1))
  return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

export interface ReportedStudyRow { study: Study; client?: Client; lastAt: string; users: number; reports: StudyReport[] }

/**
 * Reported Studies (console 2314:146860, 2317:158478). Pending: studies with
 * open reports, the number of people who reported them, newest report first.
 * History: studies whose reports have been resolved, counted the same way.
 */
export function reportedStudies(state: PlatformState, tab: 'pending' | 'history'): ReportedStudyRow[] {
  const mine = (state.studyReports ?? []).filter((r) => (tab === 'pending' ? !r.resolution : !!r.resolution))
  return state.studies.flatMap((study) => {
    const reports = mine.filter((r) => r.studyId === study.id)
    if (!reports.length) return []
    const lastAt = reports.map((r) => r.at).sort().at(-1)!
    return [{ study, client: clientById(state, study.clientId), lastAt, users: new Set(reports.map((r) => r.personId)).size, reports }]
  }).sort((a, b) => b.lastAt.localeCompare(a.lastAt))
}

export interface ReportRound { total: number; mostReason: string; reports: StudyReport[] }

/** One study's reports: the open round, and every resolved round with its statement, newest first. */
export function studyReportView(state: PlatformState, studyId: string): {
  open: ReportRound; resolved: (ReportRound & { resolution: ReportResolution })[]
} {
  const all = (state.studyReports ?? []).filter((r) => r.studyId === studyId).sort((a, b) => a.at.localeCompare(b.at))
  const round = (reports: StudyReport[]): ReportRound => ({ total: reports.length, mostReason: mostOf(reports.map((r) => r.reason)), reports })
  const byResolution = new Map<string, StudyReport[]>()
  all.filter((r) => r.resolution).forEach((r) => byResolution.set(r.resolution!.id, [...(byResolution.get(r.resolution!.id) ?? []), r]))
  return {
    open: round(all.filter((r) => !r.resolution)),
    resolved: [...byResolution.values()].map((rs) => ({ ...round(rs), resolution: rs[0]!.resolution! })).sort((a, b) => b.resolution.at.localeCompare(a.resolution.at)),
  }
}

/**
 * A study's pace: completions since it went live against the days it has
 * left. Undefined before the first completion. The client's and the console's
 * Overview both read it, so they say the same thing.
 */
export function paceOf(s: Study, completed: number, now: Date = new Date()) {
  const left = Math.max(0, s.required - completed)
  if (left === 0) return { state: 'done' as const, daysToFinish: 0, perWeek: 0 }
  const since = s.approvedAt ? Math.max(1, (now.getTime() - new Date(s.approvedAt).getTime()) / 86_400_000) : 0
  if (!since || completed === 0) return undefined
  const remaining = daysRemaining(s, now)
  const daysToFinish = Math.ceil(left / (completed / since))
  return { state: daysToFinish <= remaining ? 'ahead' as const : 'behind' as const, daysToFinish, perWeek: Math.ceil((left / Math.max(1, remaining)) * 7) }
}

/** When a stopped study's balance falls due: seven days after it was marked completed. Both apps read this one rule. */
/** The bill falls due a week after recruiting stops (Billing, 22 Oct 2026). */
export const balanceDueBy = (study: Study): string | undefined => {
  const from = study.stoppedAt ?? study.completedAt
  return from ? new Date(new Date(from).getTime() + 7 * 86_400_000).toISOString() : undefined
}

export interface WithdrawalRow { person: Person; payout: Payout; state: PayoutStatus; method?: PayoutMethod }

/**
 * Finance > Payouts (2317:159697): every participant's withdrawal requests.
 * Pending is what the team still has to release; the rest is history. Each
 * row carries the bank account it goes to, matched on its last four digits.
 */
export function withdrawals(state: PlatformState, which: 'pending' | 'released' | 'all' = 'all'): WithdrawalRow[] {
  return state.people.flatMap((person) => person.payouts.map((payout) => {
    const digits = payout.destination.replace(/\D/g, '')
    const method = person.payoutMethods.find((m) => m.accountNumber.replace(/\s/g, '').endsWith(digits))
    return { person, payout, state: payoutState(payout.status), method }
  })).filter((r) => which === 'all' || (which === 'pending' ? r.state === 'pending' : r.state !== 'pending'))
    .sort((a, b) => a.payout.at.localeCompare(b.payout.at))
}

/** One client review of a participant, with what the participant wrote back about that client. */
export interface ParticipantReview {
  studyId: string; study: string; stars: number; at: string; comment: string
  client: string; back: number; reply: string
}

/**
 * Reviews (22 Oct 2026, console 2383:135816, client 1645:163046): every rating
 * a client gave this participant, newest first, each with the participant's
 * own review of that client beside it. The console and the client read the
 * same rows.
 */
export function participantReviews(state: PlatformState, personId: string): ParticipantReview[] {
  return state.studies.flatMap((s) => s.participations.filter((p) => p.personId === personId && p.rating).map((p) => ({
    studyId: s.id, study: s.title, stars: p.rating!.stars, at: p.rating!.at, comment: p.rating!.comment ?? '',
    client: clientById(state, s.clientId)?.company ?? '',
    back: p.clientReview ? Math.round((p.clientReview.reliability + p.clientReview.communication) / 2) : 0,
    reply: p.clientReview?.comment ?? '',
  }))).sort((a, b) => b.at.localeCompare(a.at))
}

/**
 * What stops a client account being deactivated (22 Oct 2026): any study still running (recruiting, ongoing
 * or paused) and any invoice not yet paid. Both are named so the team can say which.
 */
export function clientDeactivationBlockers(state: PlatformState, clientId: string): { studies: string[]; invoices: string[] } {
  const mine = state.studies.filter((s) => s.clientId === clientId)
  return {
    studies: mine.filter((s) => isLive(s.state) || s.state === 'paused').map((s) => s.title),
    invoices: invoices(mine).filter((i) => !i.paid).map((i) => `${i.number} (${i.study})`),
  }
}

/** One sentence naming them, or empty when nothing stands in the way. */
export function clientDeactivationRefusal(state: PlatformState, clientId: string): string {
  const b = clientDeactivationBlockers(state, clientId)
  const parts = [
    b.studies.length ? `${b.studies.length === 1 ? 'an ongoing study' : `${b.studies.length} ongoing studies`}: ${b.studies.join(', ')}` : '',
    b.invoices.length ? `${b.invoices.length === 1 ? 'an unpaid invoice' : `${b.invoices.length} unpaid invoices`}: ${b.invoices.join(', ')}` : '',
  ].filter(Boolean)
  return parts.length ? `This account has ${parts.join('; and ')}. It can be deactivated only once every study is completed and every invoice is paid.` : ''
}
