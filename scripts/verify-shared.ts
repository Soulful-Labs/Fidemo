/**
 * Checks the shared layer end to end without a browser:
 *   npm run verify:shared (from the repo root)
 *
 * It asserts the seed is coherent (one participation per person per study,
 * everybody exists, the policy's numbers), then walks the cross-app journey
 * through store.ts and checks every legal move lands and every illegal one
 * is refused with a reason.
 */
import {
  billing, consoleDashboard, counts, financeTotals, personFigures, pointsRows, refundsPending, respondentStudies, trustInputs,
} from '../shared/derive'
import { respondentStatus, participationOf } from '../shared/lifecycle'
import { FEES, TIMINGS } from '../shared/platform'
import { POINTS, REDEEM, TIERS, TRUST, starsForRating, trustScore } from '../shared/rules'
import { DEMO_CLIENT_ID, DEMO_PERSON_ID, MASTER_ADMIN_ID, buildSeed } from '../shared/seed'
import { createPlatform } from '../shared/store'
import type { Actor } from '../shared/store'

let failed = 0
const check = (name: string, ok: boolean, detail = '') => {
  if (!ok) failed += 1
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `  ${detail}` : ''}`)
}

// ------------------------------------------------------------------ the policy

check('policy: floor 50, tiers 50/70/90', TRUST.MIN === 50 && TIERS.silver === 50 && TIERS.gold === 70 && TIERS.platinum === 90)
check('policy: points 100/200/25/50/50', POINTS.BEING_REFERRED === 100 && POINTS.REFERRAL === 200 && POINTS.STUDY_COMPLETION === 25 && POINTS.FULL_PROFILE === 50 && POINTS.STREAK === 50)
check('policy: 100 points = $1, minimum 1,000', REDEEM.PER_USD === 100 && REDEEM.MINIMUM === 1000)
check('policy: deductions -4/-2/-2/-20', TRUST.NO_SHOW === -4 && TRUST.CANCELLED_SESSION === -2 && TRUST.LATE_SHOW_UP === -2 && TRUST.FRAUD === -20)
check('policy: score never below 50', trustScore({ completedThisYear: 0, stars: [1, 1, 1], noShows: 3, lateShows: 1, cancelledSessions: 2, frauds: 1 }) === 50)
check('policy: completion capped at 10 a year, ratings at 40', trustScore({ completedThisYear: 30, stars: Array(20).fill(5), noShows: 0, lateShows: 0, cancelledSessions: 0, frauds: 0 }) === 100)
check('rating control maps to stars 5/4/2', starsForRating('excellent') === 5 && starsForRating('good') === 4 && starsForRating('poor') === 2)
check('platform: withdrawal fee is $2', FEES.WITHDRAWAL === 2)

// -------------------------------------------------------------------- the seed

const now = new Date()
const seed = buildSeed(now)
const ids = new Set(seed.people.map((p) => p.id))
const dupes = seed.studies.filter((s) => new Set(s.participations.map((p) => p.personId)).size !== s.participations.length)
check('seed: one participation per person per study', dupes.length === 0, dupes.map((s) => s.id).join(' '))
check('seed: every participation is a real person', seed.studies.every((s) => s.participations.every((p) => ids.has(p.personId))))
check('seed: every study belongs to a real client', seed.studies.every((s) => seed.clients.some((c) => c.id === s.clientId)))
check('seed: unique ids', new Set(seed.studies.map((s) => s.id)).size === seed.studies.length && ids.size === seed.people.length)
check('seed: nobody is over a study\'s target', seed.studies.every((s) => counts(s).completed <= Math.max(s.required, 0) || s.required === 0), seed.studies.filter((s) => counts(s).completed > s.required).map((s) => `${s.id} ${counts(s).completed}/${s.required}`).join(' '))
check('seed: a draft has no people and no payments', seed.studies.filter((s) => s.state === 'draft').every((s) => s.participations.length === 0 && s.payments.length === 0))

const j = personFigures(seed, DEMO_PERSON_ID, now)
const ji = trustInputs(seed, DEMO_PERSON_ID, now)
console.log('     Jonathan:', JSON.stringify({ ...j, inputs: { ...ji, stars: ji.stars.join('') } }))
check('seed: Jonathan can redeem 1,000 points', j.points >= 1000, String(j.points))
check('seed: Jonathan has a wallet balance to withdraw', j.walletBalance > 100, String(j.walletBalance))
const mine = respondentStudies(seed, DEMO_PERSON_ID, now)
const by = (st: string) => mine.filter((s) => s.status === st).length
console.log('     Jonathan sees', mine.length, 'studies:', ['available', 'invited_to_apply', 'draft', 'applied', 'invited_to_schedule', 'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed'].map((st) => `${st} ${by(st)}`).join(', '))
check('seed: every respondent status has a study', ['available', 'invited_to_apply', 'draft', 'applied', 'invited_to_schedule', 'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed'].every((st) => by(st) > 0))
check('seed: all six study types are open to apply', new Set(mine.filter((s) => s.status === 'available').map((s) => s.type)).size === 6, [...new Set(mine.filter((s) => s.status === 'available').map((s) => s.type))].join(' '))

for (const id of ['st-goal', 'st-pay', 'st-sleep', 'st-fitness', 'st-travel', 'st-social']) {
  const s = seed.studies.find((x) => x.id === id)!
  const c = counts(s), b = billing(s)
  console.log(`     ${id} ${s.type} ${s.state}: ${c.completed}/${s.required} completed, ${c.everQualified}/${c.everApplied} qualified/applied, total $${b.total}, deposit $${b.deposit}, net $${b.net}, outstanding $${b.outstanding}`)
}
const d = consoleDashboard(seed)
console.log('     console:', JSON.stringify({ ...d.tiles, tabs: d.tabs, people: seed.people.length, deactivated: seed.people.filter((p) => p.status === 'deactivated').length, clients: seed.clients.length, studies: seed.studies.length }))
console.log('     finance:', JSON.stringify(financeTotals(seed)))
check('seed: the console has something in every queue', d.screeners.length > 0 && d.identity.length > 0 && d.profession.length > 0 && d.business.length > 0 && d.reports.length > 0 && d.tickets.length > 0 && d.refunds.length > 0 && d.noShows.length > 0)
check('seed: refunds pending match the underfilled studies', refundsPending(seed).length === 2)
console.log('     seed size:', Math.round(JSON.stringify(seed).length / 1024), 'KB')

// ------------------------------------------------------- the journey, in store.ts

const mem = new Map<string, string>()
let clock = now.getTime()
const p = createPlatform({ storage: { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => { mem.set(k, v) }, removeItem: (k) => { mem.delete(k) } }, now: () => new Date(clock) })
const team: Actor = { kind: 'team', id: MASTER_ADMIN_ID }
const client: Actor = { kind: 'client', id: DEMO_CLIENT_ID }
const st = () => p.getState()
const fig = () => personFigures(st(), DEMO_PERSON_ID, new Date(clock))
const status = (id: string) => { const s = st().studies.find((x) => x.id === id)!; return respondentStatus(s.type, participationOf(s, DEMO_PERSON_ID)) }

const made = p.submitStudy(DEMO_CLIENT_ID, { title: 'Journey study', description: 'Created by the verify script.', type: 'video_call', required: 5, incentive: 120, durationMins: 45 })
check('1. client publishes a study, it waits in review', made.ok && st().studies[0]!.state === 'in_review')
const id = made.ok ? made.id : ''
check('2. it is in the console\'s To Review queue', st().studies.filter((s) => s.state === 'in_review').some((s) => s.id === id))
check('   a client cannot take their own study live', !p.moveStudy(id, 'recruiting', client).ok)
check('   a respondent cannot apply before it is approved', !p.startApplication(id, DEMO_PERSON_ID).ok)
check('3. the console approves it', p.moveStudy(id, 'recruiting', team).ok && st().studies.find((s) => s.id === id)!.state === 'recruiting')
check('   the approval is in the activity log', st().activity[0]!.what.includes('Journey study') && st().activity[0]!.by === MASTER_ADMIN_ID)
check('4. it appears to the respondent', respondentStudies(st(), DEMO_PERSON_ID).some((s) => s.id === id && s.status === 'available'))
check('5. the respondent applies and submits the screener', p.startApplication(id, DEMO_PERSON_ID).ok && p.submitScreener(id, DEMO_PERSON_ID, { q1: 'x' }).ok && status(id) === 'applied')
check('6. the application is on the study, for client and console', counts(st().studies.find((s) => s.id === id)!).applied === 1 && consoleDashboard(st()).screeners.some((c) => c.study.id === id))
check('   it is not qualified on a timer (the client is real)', st().pending.length === 0)
check('   an applicant cannot be completed', !p.complete(id, DEMO_PERSON_ID, client).ok)
check('7. qualifying moves the respondent', p.decide(id, DEMO_PERSON_ID, 'qualified', team).ok && status(id) === 'invited_to_schedule')
const slotDay = st().studies.find((s) => s.id === id)!.availability![0]!
check('8. the respondent schedules', p.schedule(id, DEMO_PERSON_ID, { date: slotDay.date, slot: slotDay.slots[0]! }).ok && status(id) === 'scheduled')
check('   a wrong PIN is refused', !p.confirmPin(id, DEMO_PERSON_ID, '000000').ok)
check('   the client cannot mark completed without both codes', !p.complete(id, DEMO_PERSON_ID, client).ok)
check('   and enters the PIN', p.confirmPin(id, DEMO_PERSON_ID, '407060').ok && status(id) === 'pin_confirmed')
const before = fig()
check('9. the client enters the code and marks them completed', p.enterClientCode(id, DEMO_PERSON_ID, '407060').ok && p.complete(id, DEMO_PERSON_ID, client).ok && status(id) === 'in_process')
clock += TIMINGS.completionToPaid + 100
p.tick()
const after = fig()
check('10. wallet, points and Trust Score rise', status(id) === 'paid' && after.walletBalance === before.walletBalance + 120 && after.points === before.points + POINTS.STUDY_COMPLETION && after.trustScore === before.trustScore + TRUST.STUDY_COMPLETION, `wallet ${before.walletBalance}->${after.walletBalance} points ${before.points}->${after.points} trust ${before.trustScore}->${after.trustScore}`)
check('11. the same score is what the console profile derives', personFigures(p.getState(), DEMO_PERSON_ID, new Date(clock)).trustScore === after.trustScore)
check('12. the client rates them; the rating feeds the Trust Score', p.rateParticipant(id, DEMO_PERSON_ID, 'excellent').ok && fig().trustScore >= after.trustScore, `trust ${after.trustScore}->${fig().trustScore}`)

const pts = fig().points
check('redeem below the minimum is refused', !p.redeem(DEMO_PERSON_ID, 500).ok)
check('redeem 1,000 points moves $10', p.redeem(DEMO_PERSON_ID, 1000).ok && fig().points === pts - 1000 && fig().walletBalance === after.walletBalance + 10)
check('points history lists every award', pointsRows(st(), DEMO_PERSON_ID).some((r) => r.detail === 'Journey study'))
check('withdrawing more than the balance is refused', !p.requestPayout(DEMO_PERSON_ID, 1e6, '****7790').ok)
check('refund: confirmed once, refused twice', p.confirmRefund('st-uf-1', team).ok && !p.confirmRefund('st-uf-1', team).ok && refundsPending(st()).length === 1)
check('a completed study cannot be paused', !p.moveStudy('st-sleep', 'paused', client).ok)
check('paying a balance clears the Billing pill', billing(st().studies.find((s) => s.id === 'st-sleep')!).outstanding > 0 && p.payBalance('st-sleep').ok && billing(st().studies.find((s) => s.id === 'st-sleep')!).outstanding === 0)
p.reset()
check('reset puts everything back', !st().studies.some((s) => s.id === id) && refundsPending(st()).length === 2)

// A simulated client decides on the timer.
check('simulated client: screener then auto-qualified after the delay', (() => {
  p.startApplication('st-01', DEMO_PERSON_ID); p.submitScreener('st-01', DEMO_PERSON_ID)
  if (status('st-01') !== 'applied') return false
  clock += TIMINGS.screenerToInvite + 100; p.tick()
  return status('st-01') === 'invited_to_schedule'
})())

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
if (failed) process.exit(1)

// Scores land where the seed means them to, not saturated at the top.
{
  const s = buildSeed(new Date())
  const scores = s.people.filter((p) => p.id !== DEMO_PERSON_ID).map((p) => personFigures(s, p.id).trustScore)
  const at100 = scores.filter((x) => x === 100).length
  console.log('     pool scores: min', Math.min(...scores), 'max', Math.max(...scores), 'at 100:', at100, 'of', scores.length)
  if (at100 > 3) { console.log('FAIL seed: the pool saturates at 100'); process.exit(1) } else console.log('ok   seed: scores spread, not saturated')
}
