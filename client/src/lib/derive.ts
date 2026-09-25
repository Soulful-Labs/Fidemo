import type { Participation, Person, Study } from '../mock/db'
import { PEOPLE, personById, scoreOf, tierOf } from '../mock/db'
import { STUDY_TAG, isCharged, isPayable, respondentTab } from './lifecycle'
import type { RespondentState } from './lifecycle'
import type { Tier } from './studyTypes'

/**
 * Everything any screen prints about a study. Nothing here is stored; it is
 * all counted off `study.participants`, so two screens cannot disagree.
 */

export interface Counts {
  matched: number
  invited: number
  applied: number
  qualified: number
  disqualified: number
  recruited: number
  scheduled: number
  completed: number
  noShow: number
  rated: number
  /** Everyone who got as far as answering, which is what "applied" means on the header. */
  everApplied: number
  /** Everyone the team confirmed, which is what "qualified" means on the header. */
  everQualified: number
  /** Step 54: the people actually delivered, which is what the client is billed for. */
  delivered: number
}

const STATES: RespondentState[] = [
  'matched', 'invited', 'applied', 'qualified', 'disqualified',
  'recruited', 'scheduled', 'completed', 'no_show', 'rated',
]

export function countStates(study: Study): Record<RespondentState, number> {
  const out = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<RespondentState, number>
  study.participants.forEach((p) => { out[p.state] += 1 })
  return out
}

export function counts(study: Study): Counts {
  const n = countStates(study)
  const completed = n.completed + n.rated
  /** Once someone is past `invited` they have answered the screener. */
  const everApplied = n.applied + n.qualified + n.disqualified + n.recruited + n.scheduled + completed + n.no_show
  /** Once someone is past `applied` the team has confirmed them. */
  const everQualified = n.qualified + n.recruited + n.scheduled + completed + n.no_show
  return {
    matched: n.matched, invited: n.invited, applied: n.applied, qualified: n.qualified,
    disqualified: n.disqualified, recruited: n.recruited, scheduled: n.scheduled,
    completed, noShow: n.no_show, rated: n.rated,
    everApplied, everQualified, delivered: completed,
  }
}

/** The progress bar and the header's Progress figure, from one place. */
export const progressPct = (study: Study) =>
  study.required === 0 ? 0 : Math.min(100, Math.floor((counts(study).completed / study.required) * 100))

/**
 * The three segments the study cards draw: completed, screening and
 * remaining. They used to be measured off the frame and drawn beside counts
 * that disagreed with them. Now they are the counts.
 */
export function segments(study: Study): [number, number, number] {
  const c = counts(study)
  if (study.required === 0) return [0, 0, 100]
  const done = Math.min(100, (c.completed / study.required) * 100)
  const screening = Math.min(100 - done, ((c.recruited + c.scheduled + c.qualified + c.applied) / study.required) * 100)
  return [Math.round(done), Math.round(screening), Math.max(0, 100 - Math.round(done) - Math.round(screening))]
}

/**
 * The status pill. Figma draws Billing beside Recruiting and Completed as if
 * it were a third state; it is not, it is a completed study that still owes
 * money, so it is derived rather than stored.
 */
export function statusTag(study: Study): { label: string; tone: 'neutral' | 'green' | 'grey' | 'yellow' } {
  if (study.state === 'completed') {
    return billing(study).net > 0
      ? { label: 'Billing', tone: 'neutral' }
      : { label: 'Completed', tone: 'green' }
  }
  if (study.state === 'paused') return { label: STUDY_TAG.paused, tone: 'yellow' }
  if (study.state === 'draft' || study.state === 'in_review' || study.state === 'cancelled') {
    return { label: STUDY_TAG[study.state], tone: 'grey' }
  }
  return { label: STUDY_TAG[study.state], tone: 'neutral' }
}

// ------------------------------------------------------------------- people

export interface Recruit extends Person {
  state: RespondentState
  score: number
  tier: Tier
  participation: Participation
}

/** Joins a study's participations to the pool, with the score derived per the policy. */
export function recruits(study: Study, tab?: 'matched' | 'invited' | 'recruited' | 'results'): Recruit[] {
  return study.participants.flatMap((pt) => {
    const p = personById(pt.personId)
    if (!p) return []
    if (tab && respondentTab(pt.state) !== tab) return []
    return [{ ...p, state: pt.state, score: scoreOf(p), tier: tierOf(p), participation: pt }]
  })
}

export const recruit = (study: Study, personId: string): Recruit | undefined =>
  recruits(study).find((r) => r.id === personId)

/** Results tab: "Avg. Trust Score", over the people who actually finished. */
export function averageScore(study: Study) {
  const done = recruits(study, 'results').filter((r) => r.state !== 'no_show')
  if (done.length === 0) return 0
  return Math.round(done.reduce((n, r) => n + r.score, 0) / done.length)
}

// -------------------------------------------------------------------- money

export interface Billing {
  lines: { label: string; amount: number; sub?: string; info?: boolean }[]
  total: number
  /** Step 33, and the "Less: Incentive Deposit" row: incentives for the full sample. */
  deposit: number
  /** The Total Cost tile: projected at the full sample while live, actual once completed. */
  totalCost: number
  /** The Payment Due tile, which is the total cost less the deposit already taken. */
  due: number
  /** Step 54: what is still owed, or a credit back when the study underfilled. */
  net: number
  /** Step 10: twenty per cent of the confirmed price, taken as the setup fee. */
  setupFee: number
  delivered: number
}

/**
 * The billing card, derived. Figma's own four lines and its rates, counted
 * against the people actually delivered, which is what workflow step 54 says
 * the client is charged for.
 */
export function billing(study: Study): Billing {
  const { recruitingPer, incentivePer, moderationPer, platformFee } = study.rates
  const delivered = counts(study).delivered
  const lines = [
    { label: 'Platform Fee', amount: platformFee },
    { label: 'Recruiting Fee', amount: recruitingPer * delivered, sub: `$${recruitingPer} x ${delivered} participants`, info: true },
    { label: 'Incentives', amount: incentivePer * delivered, sub: `$${incentivePer} x ${delivered} participants`, info: true },
    { label: 'Moderation Fee', amount: moderationPer * delivered, sub: `$${moderationPer} x ${delivered} participants`, info: true },
  ]
  const total = lines.reduce((n, l) => n + l.amount, 0)
  const deposit = incentivePer * study.required
  /**
   * The Total Cost tile. While the study is still running there is no actual
   * total yet, so it projects the full sample; once the study is completed it
   * is what was actually billed. Both come out of the same rates.
   */
  const projected = platformFee + (recruitingPer + incentivePer + moderationPer) * study.required
  const totalCost = study.state === 'completed' ? total : projected
  return {
    lines, total, deposit, totalCost, due: totalCost - deposit,
    net: total - deposit, setupFee: Math.round(total * 0.2), delivered,
  }
}

/** Step 46: the payout list the platform builds from attendance and completion. */
export interface PayoutRow { person: Recruit; amount: number; codeConfirmed: boolean; approved: boolean }

export function payoutList(study: Study): PayoutRow[] {
  return recruits(study, 'results')
    .filter((r) => isPayable(r.state))
    .map((r) => ({
      person: r,
      amount: study.rates.incentivePer,
      codeConfirmed: Boolean(r.participation.code?.byClient && r.participation.code?.byParticipant),
      approved: r.state === 'rated',
    }))
}

/** What has been taken from the card so far, per steps 10, 33 and 36. */
export function charged(study: Study) {
  const chargedPeople = study.participants.filter((p) => isCharged(p.state)).length
  return study.rates.incentivePer * chargedPeople
}

// ---------------------------------------------------------------- the client

/** The five dashboard tiles, every one of them counted rather than printed. */
export function dashboardStats(studies: Study[]) {
  const live = studies.filter((s) => s.state === 'recruiting' || s.state === 'ongoing' || s.state === 'paused')
  const done = studies.filter((s) => s.state === 'completed')
  const hired = studies.reduce((n, s) => n + counts(s).delivered, 0)
  const scored = studies.flatMap((s) => recruits(s, 'results')).filter((r) => r.state !== 'no_show')
  const avg = scored.length === 0 ? 0 : Math.round(scored.reduce((n, r) => n + r.score, 0) / scored.length)
  const incentives = studies.filter((s) => s.required > 0)
  const avgIncentive = incentives.length === 0 ? 0
    : incentives.reduce((n, s) => n + s.rates.incentivePer, 0) / incentives.length
  return {
    ongoing: live.length,
    completed: done.length,
    hired,
    avgScore: avg,
    avgIncentive,
  }
}

/** Step 53: "a red alert on login while incentives are unpaid". */
export const unpaidStudies = (studies: Study[]) =>
  studies.filter((s) => s.state === 'completed' && billing(s).net > 0)

/**
 * The policy guardrail and step 57: who this study's repeat rule allows.
 * `exclude` drops anyone who has been in one of this client's studies before,
 * `prefer_fresh` ranks them last, `allow` leaves the order alone.
 */
export function applyRepeatRule(study: Study, people: Person[]): Person[] {
  if (study.repeatRule === 'allow') return people
  const seen = (p: Person) => p.priorStudies.length > 0
  if (study.repeatRule === 'exclude') return people.filter((p) => !seen(p))
  return [...people].sort((a, b) => Number(seen(a)) - Number(seen(b)))
}

/**
 * Step 24: "AI search runs across everyone verified... Score and tier decide
 * who is ranked first." The Pool and the Matched tab both rank this way.
 */
export const rankedPool = (study?: Study) => {
  const ranked = [...PEOPLE].sort((a, b) => scoreOf(b) - scoreOf(a))
  return study ? applyRepeatRule(study, ranked) : ranked
}

// ------------------------------------------------------------- pagination

/**
 * The frames draw ten rows and a pager. The pager used to be decorative
 * because the tables held exactly the rows the frame drew; now the list is
 * as long as the study's people, so it has to be real.
 */
export const PAGE_SIZE = 10

export function paginate<T>(rows: T[], page: number, size = PAGE_SIZE) {
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
