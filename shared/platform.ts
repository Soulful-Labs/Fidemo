/**
 * Platform settings the signed policy does not cover: fees, scheduling
 * limits, the diary rule, the tax threshold and the demo's simulated delays.
 * They come from the 58 step workflow, the PRDs and the console's Pricing &
 * Rewards screen. Kept apart from rules.ts so that file stays the policy and
 * nothing else.
 */
import type { AddOnParameter, FeeAddOn, StudyRates, StudyType } from './types'

// --- Profile and audience lists ---------------------------------------------

/**
 * What a participant picks on their profile and a client targets on the
 * Audience step (21 Oct 2026: one list for both, so a study can only ask for
 * a value someone can give). "Prefer not to say" is a choice on the profile
 * and never a target: it matches no study that sets the criterion.
 */
export const AREA_TYPES = ['Urban', 'Suburban', 'Rural']
export const ETHNICITIES = ['Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Mixed', 'Other', 'Prefer not to say']
export const TARGET_ETHNICITIES = ETHNICITIES.filter((e) => e !== 'Prefer not to say')
/** Household income as a participant gives it; the Audience step's ranges are matched against these by overlap. */
export const PROFILE_INCOMES = ['Under $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000 - $150,000', 'Over $150,000', 'Prefer not to say']

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
  /** Policy section 8: +$20 per completed participant when the audience targets skills. */
  RECRUITMENT_SKILLS_ADDON: 20,
  /** Workflow 10: twenty per cent of the confirmed price, taken as the setup fee. */
  SETUP_SHARE: 0.2,
  /**
   * Flat fee on every withdrawal. $1.99 since 23 October 2026, as the
   * console's Pricing & Rewards draws it (it was $2; policy v2 section 4
   * follows). A master admin changes it under Participants Fees
   * (shared/settings.ts); a withdrawal keeps the fee it was requested at.
   */
  WITHDRAWAL: 1.99,
} as const

/** Which of the audience's targeting the recruitment add-ons charge for: any roles, any skills. */
export interface Targeting { roles?: boolean; skills?: boolean }
/** True when a comma-separated audience field names at least one thing. */
export const targets = (field?: string): boolean => (field ?? '').split(',').some((x) => x.trim() !== '')

/**
 * Prices a study from the fee schedule and the incentive the client chose
 * (policy section 8). Recruitment is $25 per completed participant; +$25 for a
 * Video Call, In-Person or Diary study, or for Roles targeting (one add-on,
 * whichever applies); +$20 for Skills targeting.
 */
export const priceStudy = (type: StudyType, incentivePer: number, targeting: Targeting = {}): StudyRates => ({
  platformFee: FEES.PLATFORM,
  recruitingPer: FEES.RECRUITMENT_BASE + FEE_ADDONS.filter((a) => addOnApplies(a, type, targeting)).reduce((n, a) => n + a.amount, 0),
  incentivePer,
  moderationPer: FEES.MODERATION,
})

/**
 * The recruitment add-ons in force (22 Oct 2026: a master admin edits them in the console; shared/settings.ts
 * keeps this list current). The policy's two to start: +$25 for Video Call, In-Person or Diary, or Roles;
 * +$20 for Skills. Each is charged once per completed participant when the study matches any of its parameters.
 */
export const FEE_ADDONS: FeeAddOn[] = [
  { id: 'ao-type', amount: 25, on: ['video_call', 'in_person', 'diary', 'roles'] },
  { id: 'ao-skills', amount: 20, on: ['skills'] },
]
const TYPE_PARAM: Record<StudyType, AddOnParameter> = { survey: 'survey', video_call: 'video_call', group_video_call: 'video_call', in_person: 'in_person', in_person_group: 'in_person', diary: 'diary' }
export const addOnApplies = (a: FeeAddOn, type: StudyType, targeting: Targeting = {}): boolean =>
  a.on.includes(TYPE_PARAM[type]) || (a.on.includes('roles') && !!targeting.roles) || (a.on.includes('skills') && !!targeting.skills)

/** The share of each cost taken up front: 25% (client designs, Survey_Study Setup, 15 Oct 2026). */
export const DEPOSIT_SHARE = 0.25
const cents = (n: number) => Math.round(n * 100) / 100

/**
 * The one deposit rule, decided 15 Oct 2026: 25% of the recruitment cost and
 * 25% of the incentive cost for the full sample, taken when the study is
 * submitted. Everything else is billed on the people actually delivered
 * (workflow 54). Every screen that states a deposit, and the store that takes
 * it, reads this. It replaces "the full sample's incentives at submission".
 */
export const depositParts = (rates: Pick<StudyRates, 'incentivePer' | 'recruitingPer'>, required: number): { recruitment: number; incentive: number; total: number } => {
  const n = Math.max(0, required)
  const recruitment = cents(DEPOSIT_SHARE * rates.recruitingPer * n), incentive = cents(DEPOSIT_SHARE * rates.incentivePer * n)
  return { recruitment, incentive, total: cents(recruitment + incentive) }
}
export const depositFor = (rates: Pick<StudyRates, 'incentivePer' | 'recruitingPer'>, required: number): number => depositParts(rates, required).total

/** What a study will cost at its full sample, line by line, from the fee table above. */
export interface Quote {
  participants: number
  rates: StudyRates
  incentives: number
  recruitment: number
  moderation: number
  platformFee: number
  total: number
  /** Taken at submission (depositFor): its two parts and the total. */
  deposit: number
  depositRecruitment: number
  depositIncentive: number
  /** Billed as participants complete: everything that is not the deposit. */
  later: number
}
export function quoteStudy(type: StudyType, required: number, incentivePer: number, targeting: Targeting = {}): Quote {
  const rates = priceStudy(type, Math.max(0, incentivePer || 0), targeting)
  const participants = Math.max(0, required || 0)
  const incentives = rates.incentivePer * participants, recruitment = rates.recruitingPer * participants, moderation = rates.moderationPer * participants
  const total = rates.platformFee + incentives + recruitment + moderation
  const parts = depositParts(rates, participants)
  return { participants, rates, incentives, recruitment, moderation, platformFee: rates.platformFee, total, deposit: parts.total, depositRecruitment: parts.recruitment, depositIncentive: parts.incentive, later: total - parts.total }
}

// --- Pricing, 23 Oct 2026 ------------------------------------------------------

/**
 * The client's price (client designs of 23 Oct 2026): Total Recruiting Cost is
 * a rate per participant times the number of participants. The participant's
 * incentive is inside the rate, not charged on top.
 *
 * The rate is a value the platform holds, never one typed into a screen. It
 * will come from a rate sheet the team maintains; until then it is this one
 * rate. `rateFor` is the one place a study is priced, so swapping in the
 * sheet changes this function and nothing else.
 *
 * The fee schedule above (FEES, quoteStudy, depositParts) is what the Create
 * flow's Study step still draws, unchanged, until it is decided what comes out
 * of that step. Nothing is charged by it.
 */
export const RATE_PER_PARTICIPANT = 250

/** The rate per participant for a study as it is set up now. The rate sheet will key on what the study asks for. */
export const rateFor = (_study: { type: StudyType; required?: number }): number => RATE_PER_PARTICIPANT

/**
 * The payment structure: three shares of Total Recruiting Cost that add up to
 * it. The upfront deposit is taken when the study is published (submitted for
 * review), the incentive deposit when the team takes it live, and what is due
 * on completion is the final bill less both deposits, paid on the bill once
 * recruiting stops. The 30% stage is drawn "Incentive deposit" on Payment
 * Breakdown and "Recruitment Cost" on the Pay screens; each keeps its own word.
 */
export const PAYMENT_STAGES = {
  upfront: { share: 0.2, label: 'Upfront deposit', bill: 'Upfront Deposit' },
  incentive: { share: 0.3, label: 'Incentive deposit', bill: 'Recruitment Cost' },
  completion: { share: 0.5, label: 'Completion Due', bill: 'Completion Due' },
} as const
export type PaymentStage = keyof typeof PAYMENT_STAGES
/** A share as the screens print it: "20%". */
export const sharePct = (stage: PaymentStage): string => `${Math.round(PAYMENT_STAGES[stage].share * 100)}%`

/** A study's price at a rate and a number of participants, and the three stages of it. The stages always add up to the total. */
export interface PaymentPlan { rate: number; participants: number; total: number; upfront: number; incentive: number; completion: number }
export function paymentPlan(rate: number, participants: number): PaymentPlan {
  const n = Math.max(0, Math.floor(participants || 0))
  const total = cents(rate * n)
  const upfront = cents(total * PAYMENT_STAGES.upfront.share), incentive = cents(total * PAYMENT_STAGES.incentive.share)
  return { rate, participants: n, total, upfront, incentive, completion: cents(total - upfront - incentive) }
}

/** How the deposits are described wherever one is listed. */
export const DEPOSIT_RULE = `${sharePct('upfront')} upfront at publish + ${sharePct('incentive')} when recruiting starts`

/** "$250 x 20 participants". */
export const rateTimes = (rate: number, n: number): string => `$${rate.toLocaleString('en-US')} x ${n} participant${n === 1 ? '' : 's'}`

/** What a profile can say about someone's work. A study's audience names these in its own words; a match is the same words, ignoring case. */
/** Where a client writes to the team (22 Oct 2026: Contact Us opens the mail client with it, not a support ticket). */
export const SUPPORT_EMAIL = 'support@humanlayer.app'

export const WORK_FUNCTIONS = ['Consultation', 'Patient Care', 'Research', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'Teaching', 'Management']
export const SKILLS = ['Diagnosis', 'Triage', 'Clinical Research', 'Programming', 'Data Analysis', 'Writing', 'Public Speaking', 'Budgeting', 'Forecasting', 'Project Management', 'Coaching', 'Negotiation']

/**
 * A diary's entries are counted in the unit the client chose: an entry is an
 * hour, a day or a week. Every screen that names an entry reads the words
 * from here, so "Day 2 of 5" becomes "Week 2 of 5" when the unit is a week.
 */
export function diaryWords(unit?: string): { Unit: string; unit: string; units: string; UNIT: string; every: string } {
  const u = unit === 'Hour' || unit === 'Week' ? unit : 'Day'
  return { Unit: u, unit: u.toLowerCase(), units: `${u.toLowerCase()}s`, UNIT: u.toUpperCase(), every: u === 'Day' ? 'each day' : `each ${u.toLowerCase()}` }
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

/**
 * Policy section 5: a participant may cancel a booked session more than 24
 * hours before it, at -2 Trust Score. Inside 24 hours they cannot; not
 * attending is then a no-show at -4.
 */
export const CANCEL_MIN_HOURS_BEFORE = 24
export function canCancel(sessionAt: string, now: Date = new Date()): { ok: boolean; reason?: string } {
  const hours = (new Date(sessionAt).getTime() - now.getTime()) / 3_600_000
  if (hours < CANCEL_MIN_HOURS_BEFORE) return { ok: false, reason: 'Sessions can only be cancelled more than 24 hours before. If you cannot attend now, it counts as a no-show (-4 Trust Score).' }
  return { ok: true }
}

/**
 * Policy section 5, "Diary completion: at least 4 of 5 days". A diary of any
 * length keeps that share: the minimum is at least four fifths of its
 * entries, rounded up (4 of 5, 6 of 7, 12 of 14).
 */
export const DIARY_MIN_SHARE = 4 / 5
export const diaryMinimumFor = (total: number): number => Math.ceil(total * DIARY_MIN_SHARE - 1e-9)

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
 * "excellent" when their payout is processed. No payout is ever made on a
 * timer: the team processes them by hand in the console once a study has
 * finished.
 */
export const TIMINGS = {
  screenerToInvite: 3000,
  fakeServer: 600,
  signUpCelebration: 5000,
  autoReply: 2500,
  toast: 3000,
} as const

/**
 * The two waits a participant is told about, each said one way everywhere.
 * No source file states either: the withdrawal time is the one the policy is
 * reported to give (2-3 working days), and the review time is the longer of
 * the two Figma drew, so it never promises more than the team can do by hand.
 */
export const WAITS = {
  /** Hearing back on a screener, and a completed study's response being processed. */
  REVIEW: '3-5 days',
  /** A withdrawal reaching the bank. */
  WITHDRAWAL: '2-3 working days',
  /** "Expected in bank by" is the far end of that: this many working days after the request. */
  WITHDRAWAL_LATEST_WORKING_DAYS: 3,
  /** The stated payout window (23 Oct 2026, policy v2 section 4): a completed study's reward is paid within this many days after the study ends. */
  PAYOUT_AFTER_STUDY_ENDS_DAYS: 14,
} as const

/** A date `n` working days (Monday to Friday) after `iso`. */
export function workingDaysAfter(iso: string, n: number): string {
  const d = new Date(iso)
  let left = n
  while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1 }
  return d.toISOString()
}
export const withdrawalExpectedBy = (requestedAt: string): string => workingDaysAfter(requestedAt, WAITS.WITHDRAWAL_LATEST_WORKING_DAYS)

/** Tables in the client app and the console page at ten rows. */
export const PAGE_SIZE = 10

/** Report Participant (client 2313:83072): the reasons a client can give, in the order drawn. */
export const CLIENT_REPORT_REASONS = [
  'Was asking to collaborate outside', 'Participant is misrepresenting their identity',
  'Profession looks like a scam or suspicious', 'Participant had an inappropriate behavior', 'Other',
] as const
/** The description box on both report flows takes 500 characters at most. */
export const REPORT_MAX_CHARS = 500

/** Report Study (respondent app, 19 Oct 2026): the reasons a respondent can give, in the order drawn. */
export const STUDY_REPORT_REASONS = [
  'Client is offering payment outside', 'Client is misrepresenting their identity',
  'Study looks like a scam or contains a suspicious link', 'Study contains contact information',
  'Study seems illegal or unethical', 'Study is unclear or incomplete', 'This is ad, not a study', 'Other',
] as const
