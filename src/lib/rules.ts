/**
 * Business rules. On the Trust Score, deductions, tiers, points, redemption
 * and the certificate the signed Trust and Rewards policy
 * (docs/Trust-and-Rewards-Policy.html, 20 August 2026) outranks CLAUDE.md,
 * the PRD and Figma (CLAUDE.md rule 11). Every number here is the policy's.
 *
 * Figma disagrees and is wrong in three places (PRD section 14):
 *   - Figma "Cancelled Session -4"  -> policy: -2
 *   - Figma "Fraud -2"              -> policy: -20
 *   - Figma streak reward 100       -> policy: 50 points
 */

export type Tier = 'silver' | 'gold' | 'platinum'

// --- Trust Score -----------------------------------------------------------

export const TRUST = {
  /** Policy: "Onboarding is fixed at 50%. This is the minimum Trust Score." */
  MIN: 50,
  MAX: 100,
  ONBOARDING: 50,
  /** Policy: "+1% for each completed study, up to 10 studies in a year." */
  STUDY_COMPLETION: 1,
  STUDY_COMPLETION_CAP_PER_YEAR: 10,
  /** Policy deductions: No show -4, Cancelled session -2, Late show up -2, Fraud -20. */
  NO_SHOW: -4,
  CANCELLED_SESSION: -2,
  LATE_SHOW_UP: -2,
  /** "Applied if reported and found guilty of fraud." */
  FRAUD: -20,
  /** Policy: "Ratings from the last 10 studies count", "+40% max". */
  RATINGS_WINDOW: 10,
  RATINGS_MAX: 40,
} as const

/**
 * Policy score table: 5 star +4, 4 star +3, 3 star +1, 2 star -2, 1 star -3.
 *
 * OPEN QUESTION FOR JIM (a): the policy text also says clients rate a
 * participant "poor, good or excellent", three states, which cannot map onto
 * five star values with five different effects. The five star table is the
 * only numeric source, so it is what the score is built on until settled.
 */
export const RATING_DELTA: Record<number, number> = { 5: 4, 4: 3, 3: 1, 2: -2, 1: -3 }

export function trustForRating(stars: number): number {
  return RATING_DELTA[stars] ?? 0
}

export function clampTrust(score: number): number {
  return Math.min(TRUST.MAX, Math.max(TRUST.MIN, Math.round(score)))
}

export function applyTrustDelta(score: number, delta: number): number {
  return clampTrust(score + delta)
}

/** Policy: "Adding a credential does not change the Trust Score, whether the user has one or not." */
export const CREDENTIAL_TRUST_DELTA = 0

// --- Certificate -----------------------------------------------------------

/**
 * Policy section 2. Issued automatically the moment the ID (and selfie) pass,
 * no studies needed first; valid twelve months and renews on its own; carries
 * tier, studies completed, the checks that were run, validity and an ID in
 * the form FI-XXXX-XXXX. Never a name, email or phone.
 *
 * OPEN QUESTION FOR JIM (b): the policy's certificate card is headed "Unlocks
 * at 40, which verification alone reaches", but the score floor everywhere
 * else is 50, so 40 can never be the gate. Verification alone is what issues
 * it here; no score threshold is applied.
 */
export const CERTIFICATE = { VALID_MONTHS: 12, ID_PREFIX: 'FI' } as const

// --- Tiers -----------------------------------------------------------------

/** Policy section 3: Silver 50%+, Gold 70%+, Platinum 90%+. "Tier thresholds are based only on Trust Score." */
export const TIERS: Record<Tier, number> = { silver: 50, gold: 70, platinum: 90 }

export function tierFor(score: number): Tier {
  if (score >= TIERS.platinum) return 'platinum'
  if (score >= TIERS.gold) return 'gold'
  return 'silver'
}

/** What is left to reach the next tier, or null at Platinum. */
export function nextTier(score: number): { tier: Tier; at: number; gain: number } | null {
  if (score < TIERS.gold) return { tier: 'gold', at: TIERS.gold, gain: TIERS.gold - score }
  if (score < TIERS.platinum)
    return { tier: 'platinum', at: TIERS.platinum, gain: TIERS.platinum - score }
  return null
}

// --- Reward points ---------------------------------------------------------

/**
 * Policy section 4. "Points are a separate reward balance and never affect
 * Trust Score. Points are not deducted for missed, late or cancelled sessions."
 */
export const POINTS = {
  REFERRAL: 200,
  BEING_REFERRED: 100,
  STUDY_COMPLETION: 25,
  FULL_PROFILE: 50,
  STREAK: 50,
} as const

/**
 * Policy: "100 points = $1 USD", "Minimum redemption 1,000 points".
 *
 * OPEN QUESTION FOR JIM (c): section 6 still calls the dollar value "our
 * proposal", so 100 = $1 is implemented as proposed, not as decided.
 */
export const REDEEM = { PER_USD: 100, MINIMUM: 1000 } as const

export function pointsToUsd(points: number): number {
  return points / REDEEM.PER_USD
}

export function canRedeem(requested: number, balance: number): { ok: boolean; reason?: string } {
  if (requested < REDEEM.MINIMUM)
    return { ok: false, reason: `Minimum redemption is ${REDEEM.MINIMUM.toLocaleString('en-US')} points` }
  if (requested > balance) return { ok: false, reason: 'You do not have enough points' }
  return { ok: true }
}

// --- Wallet ----------------------------------------------------------------

/** Flat $2 processing fee on every withdrawal. */
export const WITHDRAWAL_FEE = 2

export function netWithdrawal(amount: number): number {
  return Math.max(0, amount - WITHDRAWAL_FEE)
}

export function canWithdraw(amount: number, balance: number): { ok: boolean; reason?: string } {
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: 'Enter an amount' }
  if (amount > balance) return { ok: false, reason: 'Amount is more than your balance' }
  if (amount <= WITHDRAWAL_FEE)
    return { ok: false, reason: `Amount must be more than the $${WITHDRAWAL_FEE} processing fee` }
  return { ok: true }
}

// --- Scheduling ------------------------------------------------------------

/** Twice only, and only more than 24 hours before the session. */
export const RESCHEDULE = { MAX: 2, MIN_HOURS_BEFORE: 24 } as const

export function canReschedule(
  rescheduleCount: number,
  sessionAt: string,
  now: Date = new Date(),
): { ok: boolean; reason?: string } {
  if (rescheduleCount >= RESCHEDULE.MAX)
    return { ok: false, reason: 'This session has already been rescheduled twice' }
  const hours = (new Date(sessionAt).getTime() - now.getTime()) / 3_600_000
  if (hours < RESCHEDULE.MIN_HOURS_BEFORE)
    return { ok: false, reason: 'Sessions can only be rescheduled more than 24 hours before' }
  return { ok: true }
}

// --- Diary -----------------------------------------------------------------

/** At least 4 of 5 days must be filled to qualify for the reward. */
export const DIARY = { TOTAL_DAYS: 5, MIN_DAYS: 4 } as const

export function diaryComplete(completedDays: number[], minDays: number = DIARY.MIN_DAYS): boolean {
  return completedDays.length >= minDays
}
