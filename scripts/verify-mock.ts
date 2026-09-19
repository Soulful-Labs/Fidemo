import { STUDIES, ALL_TYPES, ALL_STATUSES } from '../src/mock/studies'
import { NOTIFICATIONS, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS, USER } from '../src/mock/data'
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
for (const st of ALL_STATUSES) ok(`status ${st}`, STUDIES.some((s) => s.status === st))
const kinds = new Set(STUDIES.flatMap((s) => [...s.screener, ...(s.tasks ?? [])]).map((q) => q.kind))
for (const k of ['single','multi','text','image','scale']) ok(`question kind ${k}`, kinds.has(k as never))
ok('every study has a unique id', new Set(STUDIES.map((s) => s.id)).size === STUDIES.length)
ok('seeds present', [NOTIFICATIONS, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY, REFERRALS, TICKETS, TRANSACTIONS].every((a) => a.length > 0))
ok('exactly one default payout method', PAYOUT_METHODS.filter((m) => m.isDefault).length === 1)

console.log('\n--- BUSINESS RULES (CLAUDE.md values, not Figma) ---')
ok('trust floor is 50', R.clampTrust(10) === 50)
ok('trust ceiling is 100', R.clampTrust(500) === 100)
ok('5 star = +4', R.trustForRating(5) === 4)
ok('4 star = +3', R.trustForRating(4) === 3)
ok('3 star = +1', R.trustForRating(3) === 1)
ok('2 star = -2', R.trustForRating(2) === -2)
ok('1 star = -3', R.trustForRating(1) === -3)
ok('no show = -4', R.TRUST.NO_SHOW === -4)
ok('late cancellation = -2 (Figma says -4)', R.TRUST.LATE_CANCELLATION === -2)
ok('upheld fraud = -20 (Figma says -2)', R.TRUST.UPHELD_FRAUD === -20)
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
let state: AppState = {
  signedIn: false, user: USER, studies: STUDIES, notifications: NOTIFICATIONS,
  transactions: TRANSACTIONS, payouts: PAYOUTS, payoutMethods: PAYOUT_METHODS,
  pointsHistory: POINTS_HISTORY, redeemHistory: REDEEM_HISTORY, referrals: REFERRALS,
  tickets: TICKETS, answers: {}, toasts: [],
}
const get = (id: string) => state.studies.find((s) => s.id === id)!

state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'applying' })
ok('available -> applying', get('st-01').status === 'applying')
state = reducer(state, { type: 'SAVE_ANSWERS', id: 'st-01', answers: { q1: 'Physician' } })
state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'draft' })
ok('applying -> draft keeps answers', get('st-01').status === 'draft' && state.answers['st-01'].q1 === 'Physician')
state = reducer(state, { type: 'SET_STATUS', id: 'st-01', status: 'applied', timelineLabel: 'Applied' })
ok('draft -> applied adds timeline', get('st-01').status === 'applied' && get('st-01').timeline.at(-1)!.label === 'Applied')

const before = { wallet: state.user.walletBalance, points: state.user.points, trust: state.user.trustScore, studies: state.user.completedStudies }
state = reducer(state, { type: 'PAY_STUDY', id: 'st-01' })
const paid = get('st-01')
ok('pay -> status paid', paid.status === 'paid')
ok('wallet +reward', state.user.walletBalance === before.wallet + paid.reward, `${before.wallet} -> ${state.user.walletBalance}`)
ok('points +25', state.user.points === before.points + 25)
ok('trust +1', state.user.trustScore === before.trust + 1)
ok('completed studies +1', state.user.completedStudies === before.studies + 1)
ok('transaction added', state.transactions[0].studyId === 'st-01')
ok('points entry added', state.pointsHistory[0].amount === 25)

const trustBefore = state.user.trustScore
state = reducer(state, { type: 'CANCEL_STUDY', id: 'st-10' })
ok('cancel -> available', get('st-10').status === 'available')
ok('cancel costs 2 trust', state.user.trustScore === trustBefore - 2)
ok('cancel clears booking', get('st-10').booking === undefined)

const wBefore = state.user.walletBalance
state = reducer(state, { type: 'WITHDRAW', amount: 100, destination: '****7790' })
ok('withdraw reduces balance', state.user.walletBalance === wBefore - 100)
ok('withdraw adds processing payout', state.payouts[0].status === 'processing' && state.payouts[0].net === 98)

const pBefore = state.user.points
state = reducer(state, { type: 'REDEEM_POINTS', points: 1000 })
ok('redeem deducts points', state.user.points === pBefore - 1000)
ok('redeem credits $10', Math.round((state.user.walletBalance - (wBefore - 100)) * 100) / 100 === 10)

state = reducer(state, { type: 'MARK_ALL_READ' })
ok('mark all read', state.notifications.every((n) => n.read))

console.log('\n--- TAB DERIVATION ---')
for (const tab of ['invites','scheduled','drafts','applied','history'] as const) {
  const n = STUDIES.filter((s) => STATUS[s.status].tab === tab).length
  ok(`${tab} tab has content`, n > 0, `${n} studies`)
}

console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
