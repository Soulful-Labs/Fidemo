/**
 * The signed Trust and Rewards policy (docs/Trust-and-Rewards-Policy.html,
 * 20 August 2026) in code, and nothing that is not in it. Fees, scheduling
 * limits and the other platform settings the policy does not cover live in
 * platform.ts.
 *
 * On scores, tiers, points, redemption and the certificate this file
 * outranks Figma, the PRD and the workflow in all three apps.
 */
import type { RatingState, RepeatRule, Stars, Tier } from './types'

// --- 1. Trust Score ---------------------------------------------------------

export const TRUST = {
  /** "Onboarding is fixed at 50%. This is the minimum Trust Score." */
  MIN: 50,
  MAX: 100,
  ONBOARDING: 50,
  /** "+1% for each completed study, up to 10 studies in a year." */
  STUDY_COMPLETION: 1,
  STUDY_COMPLETION_CAP_PER_YEAR: 10,
  /** "Ratings from the last 10 studies count", "+40% max". */
  RATINGS_WINDOW: 10,
  RATINGS_MAX: 40,
  /** Deductions: "No show -4%, Cancelled session -2%, Late show up -2%, Fraud -20%". */
  NO_SHOW: -4,
  CANCELLED_SESSION: -2,
  LATE_SHOW_UP: -2,
  /** "Applied if reported and found guilty of fraud." */
  FRAUD: -20,
} as const

/** The policy's rating table: 5 star +4, 4 star +3, 3 star +1, 2 star -2, 1 star -3. */
export const RATING_DELTA: Record<Stars, number> = { 5: 4, 4: 3, 3: 1, 2: -2, 1: -3 }

export const trustForStars = (stars: number): number => RATING_DELTA[stars as Stars] ?? 0

/**
 * THE POLICY CONTRADICTS ITSELF ON CLIENT RATINGS, and this function is where
 * the two halves meet.
 *
 *   - Section 1, the Trust Score table, is denominated in five stars with five
 *     different effects (+4, +3, +1, -2, -3). The score cannot be computed
 *     without a star value, so STARS ARE WHAT IS STORED and what derive.ts
 *     reads. That half follows section 1.
 *   - Section 6, the sign-off, closes client ratings as "the three states
 *     already in the workflow: poor, good or excellent" (workflow step 52).
 *     So THE CLIENT'S CONTROL HAS THREE STATES, not five stars. That half
 *     follows section 6.
 *
 * Three states cannot reach five star values. The mapping below is this
 * build's bridge and has not been signed off by anybody:
 *
 *     excellent -> 5 stars (+4)
 *     good      -> 4 stars (+3)
 *     poor      -> 2 stars (-2)
 *
 * 3 stars (+1) and 1 star (-3) are therefore unreachable from the client's
 * control. They still exist in the table, and ratings recorded before this
 * build may carry them. This is a question for the business, not for code.
 */
export function starsForRating(state: RatingState): Stars {
  switch (state) {
    case 'excellent': return 5
    case 'good': return 4
    case 'poor': return 2
  }
}

/**
 * The console's Rate panel (Figma 1932:109444) draws three five-star
 * dimensions and no overall control. The stars the policy table scores are
 * their mean, rounded: 5, 5, 4 is 5 stars (+4); 4, 4, 3 is 4 (+3); 3, 3, 3 is
 * 3 (+1). Every value of the table is reachable from here. Undefined until
 * all three are given.
 */
export function starsFromDimensions(d: { expertise?: number; reliability?: number; communication?: number }): Stars | undefined {
  const all = [d.expertise, d.reliability, d.communication]
  if (all.some((x) => !x || x < 1 || x > 5)) return undefined
  return Math.round((all as number[]).reduce((a, b) => a + b, 0) / 3) as Stars
}

export const clampTrust = (score: number): number => Math.min(TRUST.MAX, Math.max(TRUST.MIN, Math.round(score)))

/** A score after one change, kept within the policy's 50 to 100. */
export const applyTrustDelta = (score: number, delta: number): number => clampTrust(score + delta)

/** "Adding a credential does not change the Trust Score, whether the user has one or not." */
export const CREDENTIAL_TRUST_DELTA = 0

export interface TrustInputs {
  /** Studies completed in the current year. */
  completedThisYear: number
  /** Ratings received, oldest first. Only the last ten count. */
  stars: number[]
  noShows: number
  lateShows: number
  cancelledSessions: number
  frauds: number
}

/**
 * The Trust Score exactly as section 1 builds it: a fixed 50, plus one per
 * completed study up to ten a year, plus the last ten ratings up to forty,
 * less the four deductions, kept within 50 and 100.
 */
export function trustScore(i: TrustInputs): number {
  const studies = Math.min(TRUST.STUDY_COMPLETION_CAP_PER_YEAR, i.completedThisYear) * TRUST.STUDY_COMPLETION
  const raw = i.stars.slice(-TRUST.RATINGS_WINDOW).reduce((n, s) => n + trustForStars(s), 0)
  const ratings = Math.min(TRUST.RATINGS_MAX, Math.max(-TRUST.RATINGS_MAX, raw))
  return clampTrust(
    TRUST.ONBOARDING + studies + ratings
    + i.noShows * TRUST.NO_SHOW + i.lateShows * TRUST.LATE_SHOW_UP
    + i.cancelledSessions * TRUST.CANCELLED_SESSION + i.frauds * TRUST.FRAUD,
  )
}

// --- 2. The certificate -----------------------------------------------------

/**
 * "Issued automatically the moment the ID and selfie pass. No studies needed
 * first." "Valid twelve months and renews on its own." Carries tier, studies
 * completed, the checks that were run, validity and an ID of the form
 * FI-7K42-9QX1. "Never a name, email or phone."
 *
 * OPEN: the certificate card is headed "Unlocks at 40, which verification
 * alone reaches", but the score floor everywhere else is 50, so 40 can never
 * be the gate. Verification alone issues it here; no score threshold applies.
 */
export const CERTIFICATE = {
  ISSUER: 'FOCUS INSITE VERIFIED',
  VALID_MONTHS: 12,
  ID_PREFIX: 'FI',
  ID_PATTERN: /^FI-[0-9A-Z]{4}-[0-9A-Z]{4}$/,
  PUBLICLY_CHECKABLE: true,
} as const

// --- 3. Tiers ---------------------------------------------------------------

/** "Silver 50%+, Gold 70%+, Platinum 90%+." "Tier thresholds are based only on Trust Score." */
export const TIERS: Record<Tier, number> = { silver: 50, gold: 70, platinum: 90 }

export function tierFor(score: number): Tier {
  if (score >= TIERS.platinum) return 'platinum'
  if (score >= TIERS.gold) return 'gold'
  return 'silver'
}

/** What is left to reach the next tier, or null at Platinum. */
export function nextTier(score: number): { tier: Tier; at: number; gain: number } | null {
  if (score < TIERS.gold) return { tier: 'gold', at: TIERS.gold, gain: TIERS.gold - score }
  if (score < TIERS.platinum) return { tier: 'platinum', at: TIERS.platinum, gain: TIERS.platinum - score }
  return null
}

// --- 4. Points --------------------------------------------------------------

/**
 * "Points are a separate reward balance and never affect Trust Score. Points
 * are not deducted for missed, late or cancelled sessions."
 */
export const POINTS = {
  /** "Being referred 100, once." */
  BEING_REFERRED: 100,
  REFERRAL: 200,
  STUDY_COMPLETION: 25,
  FULL_PROFILE: 50,
  STREAK: 50,
} as const

/**
 * "100 points = $1 USD", "Minimum redemption 1,000 points".
 * OPEN: section 6 still calls the dollar value "our proposal".
 */
export const REDEEM = { PER_USD: 100, MINIMUM: 1000 } as const

export const pointsToUsd = (points: number): number => points / REDEEM.PER_USD

export function canRedeem(requested: number, balance: number): { ok: boolean; reason?: string } {
  if (requested < REDEEM.MINIMUM) return { ok: false, reason: `Minimum redemption is ${REDEEM.MINIMUM.toLocaleString('en-US')} points` }
  if (requested > balance) return { ok: false, reason: 'You do not have enough points' }
  return { ok: true }
}

// --- 5. Guardrails ----------------------------------------------------------

/** "No public leaderboard." Nothing in any app may rank participants publicly. */
export const NO_PUBLIC_LEADERBOARD = true

/** "Each study can set its own rule on repeat participants: allow them, prefer fresh people, or exclude anyone who has taken part before." */
export const REPEAT_RULES: RepeatRule[] = ['allow', 'prefer_fresh', 'exclude']
