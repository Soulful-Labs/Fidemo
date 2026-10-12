import { FEES, STREAK_TARGET } from '@shared/platform'
import { POINTS as P, RATING_DELTA, REDEEM, TIERS, TRUST } from '@shared/rules'

/**
 * Pricing & Rewards (section 2051:177074), read from the shared platform.
 *
 * Every score, tier and points value is the signed Trust and Rewards policy
 * (shared/rules.ts), which outranks Figma; every fee is shared/platform.ts.
 * Where the frames drew something else, the policy's value is shown and the
 * frame's is recorded in internal/CLAUDE.md:
 *   - Study completion points 50 -> 25
 *   - No show -2 (edit form) -> -4; Cancelled session -4 (overview) -> -2
 *   - Study completion trust "+10" -> "+1" a study, up to 10 a year
 *   - "Per study, upto 10 per year" on points -> no yearly cap on points
 *   - "Points have no expiry and can be redeemed anytime." -> the policy's redemption rule
 *   - Withdrawal $1.99 -> $2
 */
const sign = (n: number) => (n > 0 ? `+${n}` : String(n))
const usd = (n: number) => `$${n}`

export const TIERS_VIEW = [['Silver Tier', String(TIERS.silver)], ['Gold Tier', String(TIERS.gold)], ['Platinum Tier', String(TIERS.platinum)]]
/** Edit Tiers (2058:195439) labels the first two fields "Withdrawal" and "Reward Points Value"; the labels are kept, the values are the policy's. */
export const TIERS_EDIT = [['Withdrawal', String(TIERS.silver)], ['Reward Points Value', String(TIERS.gold)], ['Platinum Tier', String(TIERS.platinum)]]

export const EARNED = [['Onboarding', sign(TRUST.ONBOARDING)], ['Study Completion', `${sign(TRUST.STUDY_COMPLETION)} a study, up to ${TRUST.STUDY_COMPLETION_CAP_PER_YEAR} a year`], ['Participation Ratings', sign(TRUST.RATINGS_MAX)]]
export const EARNED_STARS = [['5-star rating', sign(RATING_DELTA[5])], ['4-star rating', sign(RATING_DELTA[4])], ['3-star rating', sign(RATING_DELTA[3])]]
const DEDUCTED = [['No Show', sign(TRUST.NO_SHOW)], ['Late Show Up', sign(TRUST.LATE_SHOW_UP)], ['Cancelled Session', sign(TRUST.CANCELLED_SESSION)], ['Fraud', sign(TRUST.FRAUD)]]
export const DEDUCTED_VIEW = [['2-star rating', sign(RATING_DELTA[2])], ['1-star rating', sign(RATING_DELTA[1])], ...DEDUCTED]
export const DEDUCTED_EDIT = DEDUCTED

export const POINTS = [
  ['Referral', String(P.REFERRAL), 'When someone refers users to join'], ['Being Referred', String(P.BEING_REFERRED), 'Refer someone who joins'], ['Study Completion', String(P.STUDY_COMPLETION), 'Per study'],
  ['Full Profile Completion', String(P.FULL_PROFILE), 'One-rime when user completes profile 100%'], ['Streak Completion', String(P.STREAK), `When user completes ${STREAK_TARGET} studies in one month`],
]

export const TRUST_NOTES = [`Onboarding is fixed at ${TRUST.ONBOARDING} and is the minimum Trust Score.`, `Study completion contributes up to ${TRUST.STUDY_COMPLETION_CAP_PER_YEAR} per year (max ${TRUST.STUDY_COMPLETION_CAP_PER_YEAR} studies).`, `Ratings are based on your last ${TRUST.RATINGS_WINDOW} ratings and can add up to ${TRUST.RATINGS_MAX}.`,
  'Adding a professional credential does not change your Trust Score.', `Your score is always between ${TRUST.MIN} (minimum) and ${TRUST.MAX} (maximum).`]
export const POINT_NOTES = ['Points are kept separate from your Trust Score.', `Points can be redeemed to the wallet at ${REDEEM.PER_USD} points = $1 USD, with a minimum of ${REDEEM.MINIMUM.toLocaleString('en-US')} points.`]

/** The fee schedule (shared/platform.ts FEES). */
export const FEE = {
  platform: usd(FEES.PLATFORM), moderation: usd(FEES.MODERATION), recruitmentBase: usd(FEES.RECRUITMENT_BASE),
  typeAddOn: `+${usd(FEES.RECRUITMENT_TYPE_ADDON)}`, skillsAddOn: `+${usd(FEES.RECRUITMENT_SKILLS_ADDON)}`, withdrawal: usd(FEES.WITHDRAWAL),
  pointValue: usd(1), pointsPerDollar: String(REDEEM.PER_USD), minimumRedeem: String(REDEEM.MINIMUM),
}

/** The add-on parameter menu, drawn loose (2058:193797). */
export const PARAMETERS = ['Survey study', 'Video Call study', 'In-person study', 'Diary study', 'Roles', 'Skills']
