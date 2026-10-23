import { useMemo } from 'react'
import { STREAK_TARGET } from '@shared/platform'
import { REDEEM, TRUST } from '@shared/rules'
import { currentSettings } from '@shared/settings'
import type { AddOnParameter, FeeAddOn, SettingsValues } from '@shared/types'
import { usePlatform } from '../platform'

/**
 * Pricing & Rewards (section 2051:177074), read from the shared platform: the
 * values in force now (shared/settings.ts), which a master admin changes on the
 * edit screens (22 Oct 2026, policy v2 section 10). The policy's values are the
 * starting point. Where the frames drew something else, the policy's value was
 * used and the frame's recorded in internal/CLAUDE.md and the difference list:
 *   - Study completion points 50 -> 25
 *   - No show -2 (edit form) -> -4; Cancelled session -4 (overview) -> -2
 *   - "Points have no expiry and can be redeemed anytime." -> the policy's redemption rule
 * The withdrawal fee follows the frame's $1.99 since 23 Oct 2026 (policy v2 section 4), and the
 * Participants Fees are saved from here like the rest (shared/settings.ts, group `participants`).
 */
export const sign = (n: number) => (n > 0 ? `+${n}` : String(n))
const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`

/** How each add-on parameter reads, on the pills and in the parameter menu (2058:193797). */
export const PARAMETER_LABEL: Record<AddOnParameter, string> = {
  survey: 'Survey study', video_call: 'Video Call study', in_person: 'In-person study', diary: 'Diary study', roles: 'Roles', skills: 'Skills',
}
export const PARAMETERS = Object.values(PARAMETER_LABEL)
export const parameterOf = (label: string) => (Object.keys(PARAMETER_LABEL) as AddOnParameter[]).find((k) => PARAMETER_LABEL[k] === label)

/** An add-on's pills as the frames draw them: "Study Type: Video Call, In-Person, Diary Study", then "Roles", "Skills". */
export function addOnPills(a: FeeAddOn): [string | undefined, string][] {
  const TYPE: Partial<Record<AddOnParameter, string>> = { survey: 'Survey', video_call: 'Video Call', in_person: 'In-Person', diary: 'Diary Study' }
  const types = a.on.filter((p) => TYPE[p]).map((p) => TYPE[p]!)
  return [...(types.length ? [['Study Type:', types.join(', ')] as [string, string]] : []), ...a.on.filter((p) => !TYPE[p]).map((p) => [undefined, PARAMETER_LABEL[p]] as [undefined, string])]
}

/** Every figure the overview draws, from the values in force now. */
export function pricingView(v: SettingsValues) {
  const t = v.trust
  return {
    TIERS_VIEW: [['Silver Tier', String(v.tiers.silver)], ['Gold Tier', String(v.tiers.gold)], ['Platinum Tier', String(v.tiers.platinum)]],
    EARNED: [['Onboarding', sign(t.onboarding)], ['Study Completion', `${sign(t.studyCompletion)} a study, up to ${t.studyCap} a year`], ['Participation Ratings', sign(TRUST.RATINGS_MAX)]],
    EARNED_STARS: [['5-star rating', sign(t.star5)], ['4-star rating', sign(t.star4)], ['3-star rating', sign(t.star3)]],
    DEDUCTED_VIEW: [['2-star rating', sign(t.star2)], ['1-star rating', sign(t.star1)], ['No Show', sign(t.noShow)], ['Late Show Up', sign(t.lateShowUp)], ['Cancelled Session', sign(t.cancelledSession)], ['Fraud', sign(t.fraud)]],
    POINTS: [
      ['Referral', String(v.points.referral), 'When someone refers users to join'], ['Being Referred', String(v.points.beingReferred), 'Refer someone who joins'], ['Study Completion', String(v.points.studyCompletion), 'Per study'],
      ['Full Profile Completion', String(v.points.fullProfile), 'One-rime when user completes profile 100%'], ['Streak Completion', String(v.points.streak), `When user completes ${STREAK_TARGET} studies in one month`],
      ['Profile Picture', String(v.points.profilePicture), 'One-time when user adds a profile picture'], ['Intro Video', String(v.points.introVideo), 'One-time when user adds an intro video'],
    ],
    FEE: {
      platform: usd(v.fees.platform), moderation: usd(v.fees.moderation), recruitmentBase: usd(v.fees.recruitmentBase),
      withdrawal: usd(v.participants.withdrawal), pointValue: usd(v.participants.pointsValue), pointsPerDollar: String(REDEEM.PER_USD), minimumRedeem: String(REDEEM.MINIMUM),
    },
    ADD_ONS: v.fees.addOns.map((a) => ({ id: a.id, amount: `+${usd(a.amount)}`, pills: addOnPills(a) })),
    TRUST_NOTES: [t.onboarding === TRUST.MIN ? `Onboarding is fixed at ${t.onboarding} and is the minimum Trust Score.` : `Onboarding gives ${t.onboarding}; the minimum Trust Score is ${TRUST.MIN}.`, `Study completion contributes up to ${t.studyCap * t.studyCompletion} per year (max ${t.studyCap} studies).`, `Ratings are based on your last ${TRUST.RATINGS_WINDOW} ratings and can add up to ${TRUST.RATINGS_MAX}.`,
      'Adding a professional credential does not change your Trust Score.', `Your score is always between ${TRUST.MIN} (minimum) and ${TRUST.MAX} (maximum).`],
    POINT_NOTES: ['Points are kept separate from your Trust Score.', `Points can be redeemed to the wallet at ${REDEEM.PER_USD} points = $1 USD, with a minimum of ${REDEEM.MINIMUM.toLocaleString('en-US')} points.`],
  }
}

/** The values in force now, and how the overview draws them. */
export function usePricing() {
  const state = usePlatform()
  return useMemo(() => { const v = currentSettings(state); return { values: v, ...pricingView(v) } }, [state])
}
