/**
 * Platform settings the signed policy does not cover: fees, scheduling
 * limits, the diary rule, the tax threshold and the demo's simulated delays.
 * They come from the 58 step workflow, the PRDs and the console's Pricing &
 * Rewards screen. Kept apart from rules.ts so that file stays the policy and
 * nothing else.
 */
import type { StudyRates, StudyType } from './types'

// --- Fees -------------------------------------------------------------------

/**
 * The fee schedule the console's Pricing & Rewards screen sets, and the one
 * every bill is built from. The client app's billing card drew a recruiting
 * fee of $20 a head; Pricing & Rewards draws $25 base plus $25 for video,
 * in-person and diary studies. The settings screen is where the number is
 * set, so the bills follow it.
 */
export const FEES = {
  /** One-time per study. */
  PLATFORM: 100,
  /** Per completed participant. */
  MODERATION: 10,
  /** Per completed participant. */
  RECRUITMENT_BASE: 25,
  /** Added per completed participant for these study types. */
  RECRUITMENT_TYPE_ADDON: 25,
  ADDON_TYPES: ['video_call', 'group_video_call', 'in_person', 'in_person_group', 'diary'] as StudyType[],
  /** Drawn on Pricing & Rewards; roles and skills are not modelled on a study, so never charged. */
  RECRUITMENT_SKILLS_ADDON: 20,
  /** Workflow 10: twenty per cent of the confirmed price, taken as the setup fee. */
  SETUP_SHARE: 0.2,
  /**
   * Flat fee on every withdrawal. Not in the signed policy. The respondent
   * PRD and the console's Payout Details say $2; the console's Pricing &
   * Rewards frame draws $1.99. $2 is used everywhere.
   */
  WITHDRAWAL: 2,
} as const

/** Prices a study from the fee schedule and the incentive the client chose. */
export const priceStudy = (type: StudyType, incentivePer: number): StudyRates => ({
  platformFee: FEES.PLATFORM,
  recruitingPer: FEES.RECRUITMENT_BASE + (FEES.ADDON_TYPES.includes(type) ? FEES.RECRUITMENT_TYPE_ADDON : 0),
  incentivePer,
  moderationPer: FEES.MODERATION,
})

/**
 * The one deposit rule (workflow 33): the incentives for the full sample are
 * taken when the study is submitted. Recruitment, moderation and the platform
 * fee are billed on the people actually delivered (workflow 54). Every screen
 * that states a deposit, and the store that takes it, reads this.
 */
export const depositFor = (rates: Pick<StudyRates, 'incentivePer'>, required: number): number => rates.incentivePer * Math.max(0, required)

/** What a study will cost at its full sample, line by line, from the fee table above. */
export interface Quote {
  participants: number
  rates: StudyRates
  incentives: number
  recruitment: number
  moderation: number
  platformFee: number
  total: number
  /** Taken at submission (depositFor). */
  deposit: number
  /** Billed as participants complete: everything that is not the deposit. */
  later: number
}
export function quoteStudy(type: StudyType, required: number, incentivePer: number): Quote {
  const rates = priceStudy(type, Math.max(0, incentivePer || 0))
  const participants = Math.max(0, required || 0)
  const incentives = rates.incentivePer * participants, recruitment = rates.recruitingPer * participants, moderation = rates.moderationPer * participants
  const total = rates.platformFee + incentives + recruitment + moderation
  const deposit = depositFor(rates, participants)
  return { participants, rates, incentives, recruitment, moderation, platformFee: rates.platformFee, total, deposit, later: total - deposit }
}

/** The flat withdrawal fee on its own, as the respondent screens print it. */
export const WITHDRAWAL_FEE = FEES.WITHDRAWAL

export const netWithdrawal = (amount: number): number => Math.max(0, amount - FEES.WITHDRAWAL)

export function canWithdraw(amount: number, balance: number): { ok: boolean; reason?: string } {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: 'Enter an amount' }
  if (amount > balance) return { ok: false, reason: 'Amount is more than your balance' }
  if (amount <= FEES.WITHDRAWAL) return { ok: false, reason: `Amount must be more than the $${FEES.WITHDRAWAL} processing fee` }
  return { ok: true }
}

/** Workflow 49: a tax form is asked for at $600 earned in a year. */
export const TAX_FORM_THRESHOLD = 600

// --- Scheduling, sessions, diary --------------------------------------------

/** Twice only, and only more than 24 hours before the session. */
export const RESCHEDULE = { MAX: 2, MIN_HOURS_BEFORE: 24 } as const

export function canReschedule(rescheduleCount: number, sessionAt: string, now: Date = new Date()): { ok: boolean; reason?: string } {
  if (rescheduleCount >= RESCHEDULE.MAX) return { ok: false, reason: 'This session has already been rescheduled twice' }
  const hours = (new Date(sessionAt).getTime() - now.getTime()) / 3_600_000
  if (hours < RESCHEDULE.MIN_HOURS_BEFORE) return { ok: false, reason: 'Sessions can only be rescheduled more than 24 hours before' }
  return { ok: true }
}

/** At least 4 of 5 days must be filled to qualify for the reward. */
export const DIARY = { TOTAL_DAYS: 5, MIN_DAYS: 4 } as const

export const diaryComplete = (days: number[], minDays: number = DIARY.MIN_DAYS): boolean => days.length >= minDays

/** Pricing & Rewards: "When user completes 4 studies in one month". The reward itself is the policy's. */
export const STREAK_TARGET = 4

/** Console, Screener: "The action can be undone within 1 hour only after it is taken." */
export const DECISION_UNDO_MS = 3_600_000

/** Console, Restrict: "for 15 days as for the 1st time", then 15, then 30. */
export const RESTRICTION_DAYS = [15, 15, 30] as const

/** Workflow 56: a person replies within one working day for clients and money, two for participants. */
export const REPLY_DAYS = { client: 1, money: 1, participant: 2 } as const

/**
 * There is no backend, so every session shares one code. Workflow 42 wants a
 * code per session; this is the demo's stand-in and the only one.
 */
export const DEMO_SESSION_CODE = '407060'

/** Types that book a session; survey and diary go straight to completing. */
export const SESSION_TYPES: StudyType[] = ['video_call', 'group_video_call', 'in_person', 'in_person_group']
export const isSessionType = (t: StudyType): boolean => SESSION_TYPES.includes(t)

// --- The demo's simulated delays ---------------------------------------------

/**
 * Every fake delay, in one place. Set one to 0 to remove it.
 *
 * A client marked `simulated` has nobody driving it, so the store plays its
 * part: it qualifies an applicant after `screenerToInvite` and rates them
 * "excellent" when the payout is approved. A payout is approved
 * `completionToPaid` after completion for every client, which stands in for
 * workflow 46 (the client approving the payout list).
 */
export const TIMINGS = {
  screenerToInvite: 3000,
  completionToPaid: 5000,
  fakeServer: 600,
  signUpCelebration: 5000,
  autoReply: 2500,
  toast: 3000,
} as const

/** Tables in the client app and the console page at ten rows. */
export const PAGE_SIZE = 10
