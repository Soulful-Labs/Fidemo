/**
 * Business rules, from the table in CLAUDE.md and PRD 7.3.
 *
 * These values are authoritative. Figma disagrees in four places and is wrong
 * in all four (PRD section 14, conflicts 1, 3 and 4):
 *   - Figma "Cancelled Session -4"  -> late cancellation is -2
 *   - Figma "Fraud -2"              -> upheld fraud is -20
 *   - Figma "Late Show Up -2"       -> not a rule at all
 *   - Figma streak reward 100       -> streak is 50 points
 */

export type Tier = 'silver' | 'gold' | 'platinum'

// --- Trust Score -----------------------------------------------------------

export const TRUST = {
  /** 50 is the floor, not zero. A new account starts here. */
  MIN: 50,
  MAX: 100,
  ONBOARDING: 50,
  /** Plus 1 per completed study, capped at 10 a year. */
  STUDY_COMPLETION: 1,
  STUDY_COMPLETION_CAP_PER_YEAR: 10,
  NO_SHOW: -4,
  LATE_CANCELLATION: -2,
  UPHELD_FRAUD: -20,
  /** Ratings are the last 10 and can add up to 40. */
  RATINGS_WINDOW: 10,
  RATINGS_MAX: 40,
} as const

/** 5 star +4, 4 star +3, 3 star +1, 2 star -2, 1 star -3. */
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

/** A professional credential does not change the Trust Score (PRD 4.6). */
export const CREDENTIAL_TRUST_DELTA = 0

// --- Tiers -----------------------------------------------------------------

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

/** Points are separate from the Trust Score and are never deducted (PRD 8.1). */
export const POINTS = {
  REFERRAL: 200,
  BEING_REFERRED: 100,
  STUDY_COMPLETION: 25,
  FULL_PROFILE: 50,
  STREAK: 50,
} as const

/** 100 points = $1, minimum redemption 1,000 points. */
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
