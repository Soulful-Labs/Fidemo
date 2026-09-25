/**
 * The signed Trust and Rewards policy, 20 August 2026, in code.
 *
 * Rule 7: on scores, tiers, points, ratings and certificates this document
 * outranks both the workflow and Figma. Every number below is the policy's,
 * and nothing that is not in the policy is implemented here.
 *
 * Two things the policy leaves open are marked OPEN and are not decided in
 * code; they are in docs/Stage-Two-Conflicts.md for Jim.
 */

// -------------------------------------------------------------- trust score

/** "Starts at 50% from onboarding" and "cannot go below 50%". */
export const TRUST_FLOOR = 50
export const TRUST_CEILING = 100

/** "Fixed starting score." Onboarding is the whole of it. */
export const TRUST_ONBOARDING = 50

/** "+1% for each completed study, up to 10 studies in a year." */
export const TRUST_PER_STUDY = 1
export const TRUST_STUDY_CAP = 10

/** "Ratings from the last 10 studies count" and "can contribute up to 40%". */
export const TRUST_RATING_WINDOW = 10
export const TRUST_RATING_CAP = 40

/** The policy's rating table, denominated in stars. */
export const TRUST_BY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  5: +4,
  4: +3,
  3: +1,
  2: -2,
  1: -3,
}

/** The four deductions, exactly as the policy lists them. */
export const TRUST_DEDUCTION = {
  no_show: -4,
  cancelled_session: -2,
  late_show_up: -2,
  fraud: -20,
} as const

/**
 * OPEN. The policy's sign-off closes client ratings as "the three states
 * already in the workflow: poor, good or excellent", and workflow step 52
 * says the same. But the policy's own Trust Score table is denominated in
 * five stars, and Figma draws five stars on three dimensions.
 *
 * The three states are therefore mapped onto the table's star values so the
 * arithmetic stays the policy's, and the mapping is flagged rather than
 * presented as settled. Nobody has signed off these three numbers.
 */
export type RatingState = 'poor' | 'good' | 'excellent'
export const RATING_STATE_STARS: Record<RatingState, 1 | 2 | 3 | 4 | 5> = {
  excellent: 5,
  good: 4,
  poor: 2,
}

/**
 * The trust score as the policy builds it: a fixed 50, plus up to 10 for
 * completed studies, plus up to 40 from the last ten ratings, clamped.
 */
export function trustScore(input: { completedStudiesThisYear: number; recentStars: number[] }) {
  const studies = Math.min(input.completedStudiesThisYear, TRUST_STUDY_CAP) * TRUST_PER_STUDY
  const window = input.recentStars.slice(-TRUST_RATING_WINDOW)
  const raw = window.reduce((n, s) => n + (TRUST_BY_STARS[s as 1 | 2 | 3 | 4 | 5] ?? 0), 0)
  const ratings = Math.max(-TRUST_RATING_CAP, Math.min(TRUST_RATING_CAP, raw))
  return clampTrust(TRUST_ONBOARDING + studies + ratings)
}

export const clampTrust = (n: number) => Math.max(TRUST_FLOOR, Math.min(TRUST_CEILING, Math.round(n)))

// --------------------------------------------------------------------- tiers

/** "Tier thresholds are based only on Trust Score." */
export const TIER_THRESHOLD = { platinum: 90, gold: 70, silver: 50 } as const

export const tierFor = (score: number): 'silver' | 'gold' | 'platinum' =>
  score >= TIER_THRESHOLD.platinum ? 'platinum' : score >= TIER_THRESHOLD.gold ? 'gold' : 'silver'

// -------------------------------------------------------------------- points

/** "Points are a separate reward balance and never affect Trust Score." */
export const POINTS = {
  being_referred: 100,
  referral: 200,
  study_completion: 25,
  full_profile: 50,
  streak: 50,
} as const

export const POINTS_PER_DOLLAR = 100
export const POINTS_MINIMUM_REDEMPTION = 1000

// --------------------------------------------------------------- guardrails

/** "No public leaderboard." Nothing in the client app may rank participants publicly. */
export const NO_PUBLIC_LEADERBOARD = true

/**
 * "Each study can set its own rule on repeat participants." The three options
 * are the policy's own words, and workflow step 57 repeats them.
 */
export type RepeatRule = 'allow' | 'prefer_fresh' | 'exclude'
export const REPEAT_RULE: Record<RepeatRule, { label: string; help: string }> = {
  allow: { label: 'Allow repeat participants', help: 'Anyone who has taken part before can take part again.' },
  prefer_fresh: { label: 'Prefer fresh people', help: 'Repeat participants are ranked below people new to your studies.' },
  exclude: { label: 'Exclude anyone who has taken part before', help: 'Nobody who has been in one of your studies is matched again.' },
}

// --------------------------------------------------------------- certificate

/**
 * The policy's certificate is the participant's: FOCUS INSITE VERIFIED,
 * unlocked when the ID and selfie pass, valid twelve months, carrying an ID
 * of the form FI-7K42-9QX1, and showing "never a name, email or phone".
 *
 * OPEN. The client Certificate screen (1663:104813) is branded "Human Layer
 * Buyer Certificate" and carries HL-R-9F2A-3K7P, which is the same string the
 * participant panels use for Ferry L. The policy covers participants only, so
 * it neither authorises nor forbids a client certificate. Left as Figma draws
 * it and flagged.
 */
export const CERTIFICATE = {
  issuer: 'FOCUS INSITE VERIFIED',
  validMonths: 12,
  idPattern: /^FI-[0-9A-Z]{4}-[0-9A-Z]{4}$/,
  unlockedBy: 'id_and_selfie',
  /** "Anyone can open the check link to confirm it is genuine." */
  publiclyCheckable: true,
} as const
