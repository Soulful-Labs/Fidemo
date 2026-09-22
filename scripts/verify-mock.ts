import { STUDIES, ALL_TYPES, ALL_STATUSES } from '../src/mock/seed/studies'
import { PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS, returningUserState } from '../src/mock/data'
import { derive, trustHistory } from '../src/lib/derive'
import * as profile from '../src/lib/profile'
import { reducer } from '../src/mock/reducer'
import type { AppState } from '../src/mock/storeTypes'
import * as R from '../src/lib/rules'
import { STATUS } from '../src/lib/studyState'

let fails = 0
const ok = (name: string, cond: boolean, detail = '') => {
  if (!cond) fails++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`)
}

console.log('--- SEED COVERAGE ---')
ok(`>= 12 studies`, STUDIES.length >= 12, `${STUDIES.length} studies`)
for (const t of ALL_TYPES) ok(`type ${t}`, STUDIES.some((s) => s.type === t))
// 'applying' is transient (screener open) and is never seeded.
for (const st of ALL_STATUSES.filter((x) => x !== 'applying')) ok(`status ${st}`, STUDIES.some((s) => s.status === st))
ok('>= 24 studies with distinct titles', new Set(STUDIES.map((s) => s.title)).size >= 24 && new Set(STUDIES.map((s) => s.title)).size === STUDIES.length)
ok('>= 10 clients', new Set(STUDIES.map((s) => s.client.id)).size >= 10)
ok('no thumbnail cycling (each photo reused at most twice)', Math.max(...[...STUDIES.reduce((m, s) => m.set(s.image, (m.get(s.image) ?? 0) + 1), new Map<string, number>()).values()]) <= 2)
ok('every study has 3 pre-screener questions', STUDIES.every((s) => s.preScreener.length === 3))
ok('>= 8 screener sets', new Set(STUDIES.map((s) => s.screener.map((q) => q.id + q.prompt).join('|'))).size >= 8)
ok('>= 6 tickets', TICKETS.length >= 6)
const kinds = new Set(STUDIES.flatMap((s) => [...s.screener, ...(s.tasks ?? [])]).map((q) => q.kind))
for (const k of ['single','multi','text','image','scale']) ok(`question kind ${k}`, kinds.has(k as never))
ok('every study has a unique id', new Set(STUDIES.map((s) => s.id)).size === STUDIES.length)
ok('seeds present', [returningUserState().notifications, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS].every((a) => a.length > 0))
ok('exactly one default payout method', PAYOUT_METHODS.filter((m) => m.isDefault).length === 1)

console.log('\n--- BUSINESS RULES (CLAUDE.md values, not Figma) ---')
ok('trust floor is 50', R.clampTrust(10) === 50)
ok('trust ceiling is 100', R.clampTrust(500) === 100)
ok('5 star = +4', R.trustForRating(5) === 4)
ok('4 star = +3', R.trustForRating(4) === 3)
ok('3 star = +1', R.trustForRating(3) === 1)
ok('2 star = -2', R.trustForRating(2) === -2)
ok('1 star = -3', R.trustForRating(1) === -3)
ok('policy deduction: no show = -4', R.TRUST.NO_SHOW === -4)
ok('policy deduction: cancelled session = -2 (Figma says -4)', R.TRUST.CANCELLED_SESSION === -2)
ok('policy deduction: late show up = -2', R.TRUST.LATE_SHOW_UP === -2)
ok('policy deduction: fraud = -20 (Figma says -2)', R.TRUST.FRAUD === -20)
ok('policy: onboarding 50 is the floor, 100 the ceiling', R.TRUST.ONBOARDING === 50 && R.TRUST.MIN === 50 && R.TRUST.MAX === 100)
ok('policy: completion +1 up to 10 a year, ratings last 10 up to +40', R.TRUST.STUDY_COMPLETION === 1 && R.TRUST.STUDY_COMPLETION_CAP_PER_YEAR === 10 && R.TRUST.RATINGS_WINDOW === 10 && R.TRUST.RATINGS_MAX === 40)
ok('policy: certificate FI- prefix, twelve months', R.CERTIFICATE.ID_PREFIX === 'FI' && R.CERTIFICATE.VALID_MONTHS === 12)
ok('tiers 50/70/90', R.TIERS.silver === 50 && R.TIERS.gold === 70 && R.TIERS.platinum === 90)
ok('tierFor(72) = gold', R.tierFor(72) === 'gold')
ok('tierFor(90) = platinum', R.tierFor(90) === 'platinum')
ok('streak = 50 points (Figma says 100)', R.POINTS.STREAK === 50)
ok('referral 200 / referred 100 / study 25 / profile 50', R.POINTS.REFERRAL === 200 && R.POINTS.BEING_REFERRED === 100 && R.POINTS.STUDY_COMPLETION === 25 && R.POINTS.FULL_PROFILE === 50)
ok('1000 points = $10', R.pointsToUsd(1000) === 10)
ok('below 1000 points blocked', !R.canRedeem(999, 5000).ok)
ok('withdrawal fee $2', R.WITHDRAWAL_FEE === 2 && R.netWithdrawal(500) === 498)
ok('cannot withdraw over balance', !R.canWithdraw(600, 542.6).ok)
ok('reschedule blocked after 2', !R.canReschedule(2, new Date(Date.now() + 5 * 864e5).toISOString()).ok)
ok('reschedule blocked inside 24h', !R.canReschedule(0, new Date(Date.now() + 3600e3).toISOString()).ok)
ok('reschedule allowed at 3 days, 0 used', R.canReschedule(0, new Date(Date.now() + 3 * 864e5).toISOString()).ok)
ok('diary needs 4 of 5', !R.diaryComplete([1,2,3]) && R.diaryComplete([1,2,3,4]))

console.log('\n--- STATE MACHINE ---')
let state: AppState = { ...returningUserState(), signedIn: true }
const user = () => derive(state)
const get = (id: string) => state.studies.find((s) => s.id === id)!

state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'applying' })
ok('available -> applying', get('st-01').status === 'applying')
state = reducer(state, { type: 'SAVE_ANSWERS', id: 'st-01', answers: { q1: 'Physician' } })
state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'draft' })
ok('applying -> draft keeps answers', get('st-01').status === 'draft' && state.answers['st-01'].q1 === 'Physician')
state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'applied', timelineLabel: 'Applied' })
ok('draft -> applied adds timeline', get('st-01').status === 'applied' && get('st-01').timeline.at(-1)!.label === 'Applied')

const b = user()
const before = { wallet: b.walletBalance, points: b.points, trust: b.trustScore, studies: b.completedStudies }
state = reducer(state, { type: 'PAY_STUDY', id: 'st-01' })
const paid = get('st-01')
const a = user()
ok('pay -> status paid', paid.status === 'paid')
ok('pay -> timeline records client approval then paid', paid.timeline.at(-2)!.label === 'Client approved payout' && paid.timeline.at(-1)!.label === 'Paid')
ok('wallet +reward (derived)', Math.abs(a.walletBalance - (before.wallet + paid.reward)) < 0.001, `${before.wallet} -> ${a.walletBalance}`)
ok('points +25 (derived)', a.points === before.points + 25)
ok('pay -> client rating attached (workflow 46)', paid.clientReview?.stars === 5)
ok('trust +1 completion +4 for a 5 star rating (derived)', a.trustScore === before.trust + 1 + 4, `${before.trust} -> ${a.trustScore}`)
ok('completed studies +1 (derived)', a.completedStudies === before.studies + 1)
ok('transaction added', state.transactions[0].studyId === 'st-01')
ok('points entry added', state.pointsHistory[0].amount === 25)

const trustBefore = user().trustScore
state = reducer(state, { type: 'CANCEL_STUDY', id: 'st-10' })
ok('cancel -> available', get('st-10').status === 'available')
ok('cancel costs 2 trust (derived from trustEvents)', user().trustScore === trustBefore - 2)
ok('cancel clears booking', get('st-10').booking === undefined)

const wBefore = user().walletBalance
state = reducer(state, { type: 'WITHDRAW', amount: 100, destination: '****7790' })
ok('withdraw reduces balance', Math.abs(user().walletBalance - (wBefore - 100)) < 0.001)
ok('withdraw adds processing payout', state.payouts[0].status === 'processing' && state.payouts[0].net === 98)

const pBefore = user().points
state = reducer(state, { type: 'REDEEM_POINTS', points: 1000 })
ok('redeem deducts points', user().points === pBefore - 1000)
ok('redeem credits $10', Math.round((user().walletBalance - (wBefore - 100)) * 100) / 100 === 10)

console.log('\n--- DERIVED, NEVER HARDCODED ---')
const fresh = derive(returningUserState())
ok('all time earned = sum of study transactions', fresh.allTimeEarned === TRANSACTIONS.filter((t) => t.category !== 'Redeem Points').reduce((x, t) => x + t.amount, 0))
ok('completed studies = paid + not needed + late show', fresh.completedStudies === STUDIES.filter((s) => s.status === 'paid' || s.status === 'not_needed' || s.status === 'late_show').length)
ok('points = history - redemptions', fresh.points === POINTS_HISTORY.reduce((x, p) => x + p.amount, 0) - REDEEM_HISTORY.reduce((x, r) => x + r.points, 0))
ok('trust score within 50..100 and Gold for the demo account', fresh.trustScore >= 50 && fresh.trustScore <= 100 && fresh.tier === 'gold', String(fresh.trustScore))
ok('streak month is the current month', fresh.streak.month === new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
ok('this month has earnings', TRANSACTIONS.some((t) => new Date(t.at).getMonth() === new Date().getMonth()))
ok('year earnings just under the $600 tax threshold', fresh.yearEarned < 600 && fresh.yearEarned > 500, String(fresh.yearEarned))
ok('every notification refers to a real study state', returningUserState().notifications.every((n) => !n.to || !n.to.startsWith('/studies/') || STUDIES.some((s) => n.to!.startsWith(`/studies/${s.id}`))))
ok('referral notification names a seeded referral', returningUserState().notifications.filter((n) => n.kind === 'referral').every((n) => REFERRALS.some((r) => n.body.startsWith(r.name.split(' ')[0]))))

state = reducer(state, { type: 'MARK_ALL_READ' })
ok('mark all read', state.notifications.every((n) => n.read))

console.log('\n--- WORKFLOW GATES ---')
let taxed: AppState = { ...returningUserState(), signedIn: true }
taxed = reducer(taxed, { type: 'PAY_STUDY', id: 'st-01' })
ok('tax form required once the year crosses $600 (workflow 49)', derive(taxed).taxFormRequired && derive(taxed).yearEarned >= 600, String(derive(taxed).yearEarned))
taxed = reducer(taxed, { type: 'TAX_FORM_DONE' })
ok('tax form on file lifts the block', !derive(taxed).taxFormRequired)
let fresh2 = reducer({ ...returningUserState(), signedIn: false, arrivedVia: 'HL-020-C' }, { type: 'SIGN_UP', email: 'new.person@example.com' })
ok('sign-up starts clean, signed in, unverified (workflow 15)', fresh2.signedIn && !fresh2.user.onboarded && fresh2.studies.every((x) => x.status === 'available') && fresh2.transactions.length === 0)
ok('sign-up records the link code (workflow 12/14)', fresh2.user.sourceCode === 'HL-020-C' && derive(fresh2).points === R.POINTS.BEING_REFERRED)
fresh2 = reducer(fresh2, { type: 'SIGN_OUT' })
fresh2 = reducer(fresh2, { type: 'SIGN_IN', email: 'Jonathan.Reeve@example.com' })
ok('signing in with the seed email restores the seed account', fresh2.user.email === 'jonathan.reeve@example.com' && fresh2.transactions.length > 0)
ok('not_needed is paid in full with no trust effect (workflow 44)', derive(returningUserState()).completedStudies === STUDIES.filter((x) => x.status === 'paid' || x.status === 'not_needed' || x.status === 'late_show').length && TRANSACTIONS.some((t) => t.studyId === 'st-16'))
ok('premium studies are the highest paid (workflow 17)', Math.min(...STUDIES.filter((x) => x.premium).map((x) => x.reward)) > Math.max(...STUDIES.filter((x) => !x.premium).map((x) => x.reward)))
const lateSeed = STUDIES.find((x) => x.status === 'late_show')
ok('a late show up study is seeded, paid, with the deduction on its timeline', Boolean(lateSeed) && TRANSACTIONS.some((t) => t.studyId === lateSeed!.id) && lateSeed!.timeline.some((t) => t.label === 'Late show up'))
{
  const base = returningUserState()
  const without = { ...base, studies: base.studies.map((x) => (x.status === 'late_show' ? { ...x, status: 'paid' as const } : x)) }
  ok('late show up costs exactly 2 trust versus the same study paid on time', derive(without).trustScore - derive(base).trustScore === 2, `${derive(without).trustScore} -> ${derive(base).trustScore}`)
  ok('late show up keeps its points (never deducted)', derive(without).points === derive(base).points)
  const line = trustHistory(base).find((e) => e.label === 'Late show up')
  ok('trust history traces the late show up to its study', Boolean(line) && line!.studyId === lateSeed!.id && line!.delta === -2)
}
{
  const { certificateId } = profile
  ok('certificate ID reads FI-XXXX-XXXX', /^FI-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(certificateId('jonathan.reeve@example.com')), certificateId('jonathan.reeve@example.com'))
  const { from, to } = profile.certificateValidity('2025-07-29T09:00:00.000Z', new Date('2026-09-22T00:00:00Z'))
  ok('certificate validity is a twelve month range that renews on its own', to.getTime() - from.getTime() > 360 * 864e5 && from <= new Date('2026-09-22') && to > new Date('2026-09-22'))
}
ok('no screener asks age, location or job (workflow 30)', STUDIES.every((x) => x.screener.every((q) => !/(age|old are you|where do you live|city|country|occupation|job title)/i.test(q.prompt))))

console.log('\n--- TAB DERIVATION ---')
for (const tab of ['invites','scheduled','drafts','applied','history'] as const) {
  const n = STUDIES.filter((s) => STATUS[s.status].tab === tab).length
  ok(`${tab} tab has content`, n > 0, `${n} studies`)
}

console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
