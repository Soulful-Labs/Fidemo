/**
 * The values a master admin can change in the console's Pricing & Rewards
 * (22 Oct 2026; Trust and Rewards Policy v2, section 10): client fees, Trust
 * Score values, tier thresholds and reward points.
 *
 * The rule: a changed value applies only to what happens after the change.
 * Anything already earned or already agreed keeps the value in force at the
 * time. So no existing score moves when a value is edited, and no agreed price
 * moves (a study keeps the rates it was created with, StudyRates).
 *
 * How it is kept:
 * - `state.settingsLog` holds every change, oldest first. The values in force
 *   at any moment are the policy's (DEFAULTS) with every change up to then
 *   applied.
 * - `applyCurrentSettings` writes the values in force now into the shared
 *   constants (FEES, FEE_ADDONS, TRUST, RATING_DELTA, TIERS, POINTS), so
 *   every screen and every new quote reads the current ones. The store calls it
 *   whenever the state loads or changes.
 * - Scores and points are valued per event at the event's own time
 *   (`trustAt`, `pointsAt`), never from the current constants.
 */
import { FEES, FEE_ADDONS } from './platform'
import { EMPTY_RATE_CARD, RATE_CARD } from './ratecard'
import { POINTS, RATING_DELTA, REDEEM, TIERS, TRUST } from './rules'
import type { PlatformState, SettingsGroup, SettingsValues, Stars } from './types'

/** The policy's values, taken before any change could be applied. */
export const DEFAULTS: SettingsValues = {
  fees: { platform: FEES.PLATFORM, moderation: FEES.MODERATION, recruitmentBase: FEES.RECRUITMENT_BASE, addOns: FEE_ADDONS.map((a) => ({ ...a, on: [...a.on] })) },
  trust: {
    onboarding: TRUST.ONBOARDING, studyCompletion: TRUST.STUDY_COMPLETION, studyCap: TRUST.STUDY_COMPLETION_CAP_PER_YEAR,
    star5: RATING_DELTA[5], star4: RATING_DELTA[4], star3: RATING_DELTA[3], star2: RATING_DELTA[2], star1: RATING_DELTA[1],
    noShow: TRUST.NO_SHOW, lateShowUp: TRUST.LATE_SHOW_UP, cancelledSession: TRUST.CANCELLED_SESSION, fraud: TRUST.FRAUD,
  },
  tiers: { ...TIERS },
  points: {
    referral: POINTS.REFERRAL, beingReferred: POINTS.BEING_REFERRED, studyCompletion: POINTS.STUDY_COMPLETION, fullProfile: POINTS.FULL_PROFILE,
    streak: POINTS.STREAK, profilePicture: POINTS.PROFILE_PICTURE, introVideo: POINTS.INTRO_VIDEO,
  },
  // Participants Fees (23 Oct 2026): the withdrawal fee, and the dollar value of 100 reward coins.
  participants: { withdrawal: FEES.WITHDRAWAL, pointsValue: 100 / REDEEM.PER_USD },
  // The rate card (24 Oct 2026) starts empty; the platform's first version is the team's July 2026 sheet (shared/seed.ts).
  rateCard: EMPTY_RATE_CARD,
}

const copy = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T

/** The values of one group in force at a moment (now when no moment is given). */
export function settingsAt<G extends SettingsGroup>(state: PlatformState, group: G, at?: string): SettingsValues[G] {
  let v = copy(DEFAULTS[group])
  for (const c of state.settingsLog ?? []) if (c.group === group && (!at || c.at <= at)) v = copy(c.after) as SettingsValues[G]
  return v
}

/** Every group as it stands now. */
export const currentSettings = (state: PlatformState): SettingsValues =>
  ({ fees: settingsAt(state, 'fees'), trust: settingsAt(state, 'trust'), tiers: settingsAt(state, 'tiers'), points: settingsAt(state, 'points'), participants: settingsAt(state, 'participants'), rateCard: settingsAt(state, 'rateCard') })

/** The Trust Score values in force when something happened. */
export const trustAt = (state: PlatformState, at?: string) => settingsAt(state, 'trust', at)
/** A star rating's value in force when it was given. */
export const starValueAt = (state: PlatformState, stars: number, at?: string): number => {
  const t = trustAt(state, at)
  return ({ 5: t.star5, 4: t.star4, 3: t.star3, 2: t.star2, 1: t.star1 } as Record<Stars, number>)[stars as Stars] ?? 0
}
/** The reward points values in force when something was earned. */
export const pointsAt = (state: PlatformState, at?: string) => settingsAt(state, 'points', at)

/** Writes the values in force now into the shared constants every screen and every new quote reads. */
export function applyCurrentSettings(state: PlatformState): void {
  const now = currentSettings(state)
  const fees = FEES as unknown as Record<string, unknown>
  fees.PLATFORM = now.fees.platform; fees.MODERATION = now.fees.moderation; fees.RECRUITMENT_BASE = now.fees.recruitmentBase
  FEE_ADDONS.splice(0, FEE_ADDONS.length, ...now.fees.addOns.map((a) => ({ ...a, on: [...a.on] })))
  const trust = TRUST as unknown as Record<string, number>
  trust.ONBOARDING = now.trust.onboarding; trust.STUDY_COMPLETION = now.trust.studyCompletion; trust.STUDY_COMPLETION_CAP_PER_YEAR = now.trust.studyCap
  trust.NO_SHOW = now.trust.noShow; trust.LATE_SHOW_UP = now.trust.lateShowUp; trust.CANCELLED_SESSION = now.trust.cancelledSession; trust.FRAUD = now.trust.fraud
  Object.assign(RATING_DELTA, { 5: now.trust.star5, 4: now.trust.star4, 3: now.trust.star3, 2: now.trust.star2, 1: now.trust.star1 })
  Object.assign(TIERS, now.tiers)
  const points = POINTS as unknown as Record<string, number>
  points.REFERRAL = now.points.referral; points.BEING_REFERRED = now.points.beingReferred; points.STUDY_COMPLETION = now.points.studyCompletion
  points.FULL_PROFILE = now.points.fullProfile; points.STREAK = now.points.streak; points.PROFILE_PICTURE = now.points.profilePicture; points.INTRO_VIDEO = now.points.introVideo
  fees.WITHDRAWAL = now.participants.withdrawal
  RATE_CARD.current = now.rateCard
  ;(REDEEM as unknown as Record<string, number>).PER_USD = 100 / now.participants.pointsValue
}

/** Why a proposed group of values cannot be saved, or empty when it can. */
export function settingsFault<G extends SettingsGroup>(group: G, v: SettingsValues[G]): string {
  const nums = (o: object) => Object.values(o).filter((x) => typeof x === 'number') as number[]
  if (nums(v).some((n) => !Number.isFinite(n))) return 'Every value must be a number'
  if (group === 'fees') {
    const f = v as SettingsValues['fees']
    if (nums(f).some((n) => n < 0) || f.addOns.some((a) => !Number.isFinite(a.amount) || a.amount < 0)) return 'A fee cannot be negative'
    if (f.addOns.some((a) => a.on.length === 0)) return 'Every add-on needs at least one parameter'
  }
  if (group === 'rateCard') {
    const c = v as SettingsValues['rateCard']
    const ranges = [...c.segments.flatMap((s) => [s.setup, s.cpr, s.incentive]), ...c.fees.map((f) => f.amount)]
    if (ranges.some((r) => (r.min != null && (!Number.isFinite(r.min) || r.min < 0)) || (r.max != null && (!Number.isFinite(r.max) || r.max < 0)))) return 'A rate cannot be negative'
    if (ranges.some((r) => r.min != null && r.max != null && r.max < r.min)) return 'The top of a range cannot be below its bottom'
    if (c.segments.some((s) => !s.segment.trim())) return 'Every segment row needs a segment name'
    if (c.fees.some((f) => !f.item.trim())) return 'Every fee row needs an item'
  }
  if (group === 'participants') {
    const p = v as SettingsValues['participants']
    if (p.withdrawal < 0) return 'The withdrawal fee cannot be negative'
    if (!(p.pointsValue > 0)) return 'The points value must be more than $0'
  }
  if (group === 'tiers') {
    const t = v as SettingsValues['tiers']
    if (!(TRUST.MIN <= t.silver && t.silver < t.gold && t.gold < t.platinum && t.platinum <= TRUST.MAX)) return `Tiers must rise from Silver to Platinum, between ${TRUST.MIN} and ${TRUST.MAX}`
  }
  if (group === 'points' && nums(v).some((n) => n < 0 || !Number.isInteger(n))) return 'Points must be whole numbers, not negative'
  if (group === 'trust') {
    const t = v as SettingsValues['trust']
    if (!Number.isInteger(t.studyCap) || t.studyCap < 0) return 'Max Study per year must be a whole number'
    if ([t.noShow, t.lateShowUp, t.cancelledSession, t.fraud].some((n) => n > 0)) return 'A deduction cannot add to the score'
  }
  return ''
}
