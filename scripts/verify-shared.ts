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
  billing, consoleDashboard, counts, financeTotals, personFigures, pointsRows, recruit, refundsPending, respondentStudies, trustInputs,
} from '../shared/derive'
import { respondentStatus, participationOf } from '../shared/lifecycle'
import { FEES, TIMINGS, depositFor, diaryWords, quoteStudy } from '../shared/platform'
import { POINTS, REDEEM, TIERS, TRUST, starsForRating, starsFromDimensions, trustScore } from '../shared/rules'
import { DEMO_CLIENT_ID, DEMO_PERSON_ID, MASTER_ADMIN_ID, buildSeed } from '../shared/seed'
import { buildScreener, screenerOutline, taskResults } from '../shared/questions'
import type { AuthoredQuestion } from '../shared/questions'
import { audiencePeople, blankForm, blankQuestion, buildStudy, estimateAudience, formFromStudy, formId, studyDetails, summarise } from '../shared/studyForm'
import type { FormQuestion, StudyForm } from '../shared/studyForm'
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
check('console rate panel: mean of three dimensions, all five values reachable', starsFromDimensions({ expertise: 5, reliability: 5, communication: 4 }) === 5 && starsFromDimensions({ expertise: 3, reliability: 3, communication: 3 }) === 3 && starsFromDimensions({ expertise: 1, reliability: 1, communication: 1 }) === 1 && starsFromDimensions({ expertise: 5 }) === undefined)

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

/** A screener as the client's builder holds it: nine blocks, three filled in, in three answer types. */
const BUILT: AuthoredQuestion[] = [
  { kind: 'Single-select', text: 'Do you track your sleep?', options: [{ text: 'Yes', mark: 'Correct' }, { text: 'No', mark: 'Incorrect' }] },
  { kind: 'Multi-select', text: '' , options: [{ text: '', mark: 'May Select' }] },
  { kind: 'Multi-select', text: 'Which trackers have you used?', options: [{ text: 'A watch', mark: 'May Select' }, { text: 'A ring', mark: 'Must Select' }, { text: '', mark: 'Incorrect' }] },
  { kind: 'Single-line input', text: '   ' },
  { kind: 'Number input', text: 'How many nights a week do you wear it?' },
]
/** The same questions as the Create flow holds them, and a form around them. */
const asForm = (qs: AuthoredQuestion[], marks: string[] = []): FormQuestion[] => qs.map((q, i) => ({
  ...blankQuestion(`Q${i + 1}`, q.kind), text: q.text, options: (q.options ?? []).map((o) => ({ id: formId('o'), text: o.text, mark: o.mark ?? marks[0] ?? '' })),
  min: q.min, max: q.max, gap: q.gap, rows: q.rows, columns: q.columns,
}))
const NINE_TO_FIVE = Object.fromEntries(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => [d, [{ from: '09:00 AM', to: '05:00 PM' }]]))
const formOf = (over: Partial<StudyForm>): StudyForm => ({ ...blankForm(), type: 'video_call', description: 'Created by the verify script.', questions: asForm(BUILT), hours: NINE_TO_FIVE, availabilitySet: true, ...over })
const SURVEY: Partial<StudyForm> = { type: 'survey', tasks: asForm([{ kind: 'Multi-line input', text: 'What would you change first?' }]), tasksSubmitted: true }
const made = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Journey study', type: 'video_call', participants: '5', incentive: 120, duration: 45 }))
{
  const mine = made.ok ? p.getState().studies.find((x) => x.id === made.id)! : undefined
  const outline = mine ? screenerOutline(mine) : []
  check('screener: the three questions the client built are saved, in order, with their types', outline.map((q) => `${q.prompt}|${q.type}`).join(' / ') === 'Do you track your sleep?|Single-select / Which trackers have you used?|Multi-select / How many nights a week do you wear it?|Number input', outline.map((q) => `${q.prompt}|${q.type}`).join(' / '))
  check('screener: blank questions and blank options are left out', outline.length === 3 && outline[1]!.options!.join() === 'A watch,A ring')
  check('screener: nothing is borrowed from another study', mine !== undefined && !p.getState().studies.some((x) => x.id !== mine.id && x.screener.some((q) => mine.screener.some((m) => m.prompt === q.prompt))))
  check('screener: a leading single-select with a Correct answer decides eligibility', mine?.preScreener.length === 1 && mine.preScreener[0]!.passing.join() === 'Yes' && mine.screener.length === 2)
  check('screener: the verdicts set in the builder are kept', mine?.screener[0]!.marks?.['A ring'] === 'Must Select')
  check('screener: a number question is asked as a number', mine?.screener[1]!.kind === 'text' && mine.screener[1]!.format === 'number')
  const none = p.submitStudy(DEMO_CLIENT_ID, formOf({ ...SURVEY, title: 'x', questions: asForm([{ kind: 'Single-select', text: '' }]) }))
  check('screener: a study with no question is refused, and none is created', !none.ok && none.why.includes('at least one screener question') && !p.getState().studies.some((x) => x.title === 'x'))
  const bad = p.submitStudy(DEMO_CLIENT_ID, formOf({ ...SURVEY, title: 'x', questions: asForm([{ kind: 'Number input', text: 'Age?' }, { kind: 'Multi-select', text: 'Pick', options: [{ text: 'Only one' }] }]) }))
  check('screener: a select with one option is refused by its number', !bad.ok && bad.why === 'Screener question 2 needs at least two options', bad.ok ? '' : bad.why)
  const kinds = buildScreener([
    { kind: 'Slider', text: 'Rate it', min: '1', max: '5', gap: '1' }, { kind: 'Slider', text: 'Age', min: '18', max: '80', gap: '1' },
    { kind: 'Ranking', text: 'Rank', options: [{ text: 'A' }, { text: 'B' }] }, { kind: 'File Upload', text: 'Photo' },
    { kind: 'Mattrix', text: 'Rate each', rows: ['Speed', 'Price'], columns: ['Bad', 'Good'] }, { kind: 'Multi-line input', text: 'Why?' },
  ])
  check('screener: all nine builder types become something a respondent can be asked', kinds.ok && kinds.screener.map((q) => q.kind).join() === 'scale,text,multi,image,single,single,text' && kinds.screener[0]!.kind === 'scale' && kinds.screener[0]!.options.join() === '1,2,3,4,5', kinds.ok ? kinds.screener.map((q) => q.kind).join() : kinds.why)
}
// ------------------------------------------------ everything the Create flow holds is the study
{
  const mine = made.ok ? st().studies.find((x) => x.id === made.id)! : undefined
  const dayName = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long' })
  check('create: weekly hours become the dated slots a respondent books, weekdays only', Boolean(mine?.availability?.length) && mine!.availability!.every((a) => !['Saturday', 'Sunday'].includes(dayName(a.date))) && mine!.availability![0]!.slots[0] === '09:00 AM', mine?.availability?.[0]?.slots.join())
  check('create: sessions are the study length with the buffer between them', mine?.availability?.[0]?.slots[1] === '10:00 AM' && mine.schedule?.bufferMins === 15, mine?.availability?.[0]?.slots.slice(0, 3).join())
  check('create: nothing is offered after the study ends', mine !== undefined && mine.availability!.every((a) => a.date <= mine.endsAt))
  check('create: the whole form is kept with the study', mine?.form?.title === 'Journey study' && mine.form.questions.length === BUILT.length && mine.required === 5 && mine.rates.incentivePer === 120)
  check('create: hours that end before they start are refused, by day', (() => { const r = buildStudy(formOf({ title: 't', hours: { Monday: [{ from: '12:00 AM', to: '12:00 AM' }] } })); return !r.ok && r.why.startsWith('Monday') })())
  check('create: a study with no title, or no availability submitted, is refused', !buildStudy(formOf({ title: ' ' })).ok && !buildStudy(formOf({ title: 't', availabilitySet: false })).ok)
  const tomorrow = new Date(now.getTime() + 86_400_000), ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const off = buildStudy(formOf({ title: 't', overrides: [{ id: 'v1', from: ymd(tomorrow), to: ymd(tomorrow), windows: [] }] }), now)
  check('create: a date override marked unavailable removes that day', off.ok && !off.study.availability!.some((a) => new Date(a.date).toDateString() === tomorrow.toDateString()))
  const inPerson = formOf({ title: 't', type: 'in_person', groupInPerson: true, seats: '6 seats', addresses: [{ id: 'a1', title: 'Austin, Texas', detail: '12 Main St, Austin, Texas, 73301' }], sessions: [{ id: 's1', date: ymd(new Date(now.getTime() + 3 * 86_400_000)), time: '10:00 AM' }] })
  const group = buildStudy(inPerson, now)
  check('create: a group study has the client\'s own sessions, seats and address', group.ok && group.study.type === 'in_person_group' && group.study.sessions?.length === 1 && group.study.sessions[0]!.seats === 6 && group.study.sessions[0]!.slot === '10:00 AM' && group.study.locations?.[0]?.address === '12 Main St, Austin, Texas, 73301' && group.study.sessions[0]!.locationId === 'a1')
  check('create: a session in the past, or an in-person study with no address, is refused', !buildStudy({ ...inPerson, sessions: [{ id: 's1', date: '2020-01-01', time: '10:00 AM' }] }, now).ok && !buildStudy({ ...inPerson, addresses: [] }, now).ok)
  const diary = buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '7 days', minimumRequired: '5 days', frequency: 'Every day', durationUnit: 'Day', tasks: asForm([{ kind: 'Multi-line input', text: 'What happened today?' }]), tasksSubmitted: true }), now)
  check('create: diary settings are the study\'s, as chosen', diary.ok && diary.study.diary?.totalDays === 7 && diary.study.diary.minDays === 5 && diary.study.diary.frequency === 'Every day' && diary.study.tasks?.[0]?.prompt === 'What happened today?')
  check('create: a survey with no form, or a diary asking for more days than it runs, is refused', !buildStudy(formOf({ title: 't', type: 'survey' }), now).ok && !buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '3 days', minimumRequired: '5 days', tasks: asForm([{ kind: 'Multi-line input', text: 'x' }]), tasksSubmitted: true }), now).ok)
  const aud = formOf({ title: 't', countries: ['United States of America'], gender: 'Female', education: '', ageRanges: [], roles: 'Oncologist, Nurse', industries: 'Healthcare', condition: 'never', tiers: 'Gold and above' })
  const sum = summarise(st(), aud, now)
  check('create: the audience is written as entered, and sets the repeat rule', sum.audience.some((a) => a.label === 'Roles' && a.value === 'Oncologist, Nurse') && sum.audience.some((a) => a.label === 'Gender' && a.value === 'Female') && sum.audience.some((a) => a.label === 'Profile Tiers') && (() => { const b = buildStudy(aud, now); return b.ok && b.study.repeatRule === 'exclude' && b.study.targetProfession === 'Oncologist, Nurse' })())
  const everyone = estimateAudience(st(), formOf({ countries: [], gender: 'All Genders', education: '', ageRanges: [] }), now)
  check('create: the estimated audience is counted from the pool and narrows with the audience', everyone > 0 && estimateAudience(st(), aud, now) < everyone && sum.estimatedAudience === String(estimateAudience(st(), aud, now)), `${everyone} -> ${sum.estimatedAudience}`)
  check('create: the summary names the type and the setup that was built', sum.typeLabel === 'Video Call' && sum.studySummary.value === 'available 5 days/week, custom timings' && sum.screenerSummary === '3 inputs', `${sum.typeLabel} / ${sum.studySummary.value} / ${sum.screenerSummary}`)

  const half = formOf({ title: 'Half built', type: 'in_person', questions: asForm([{ kind: 'Single-select', text: 'Unfinished', options: [{ text: 'only one' }] }]), addresses: [{ id: 'a1', title: 'Leeds', detail: '1 Park Row, Leeds' }], availabilitySet: false })
  const saved = p.saveStudyDraft(DEMO_CLIENT_ID, half)
  const draft = saved.ok ? st().studies.find((x) => x.id === saved.id)! : undefined
  check('draft: saved as a draft with nothing checked and nothing charged', saved.ok && draft?.state === 'draft' && draft.payments.length === 0 && draft.title === 'Half built')
  check('draft: it reopens with everything that was in it', draft !== undefined && JSON.stringify(formFromStudy(draft)) === JSON.stringify(half))
  const again = saved.ok ? p.saveStudyDraft(DEMO_CLIENT_ID, { ...half, title: 'Half built, renamed' }, saved.id) : saved
  check('draft: saving again saves over it, not beside it', again.ok && saved.ok && again.id === saved.id && st().studies.filter((x) => x.title.startsWith('Half built')).length === 1 && st().studies.find((x) => x.id === saved.id)!.title === 'Half built, renamed')
  const early = saved.ok ? p.submitStudy(DEMO_CLIENT_ID, half, saved.id) : saved
  check('draft: an unfinished draft is refused at submit and stays a draft', !early.ok && saved.ok && st().studies.find((x) => x.id === saved.id)!.state === 'draft', early.ok ? '' : early.why)
  const done = saved.ok ? p.submitStudy(DEMO_CLIENT_ID, { ...half, questions: asForm(BUILT), hours: NINE_TO_FIVE, availabilitySet: true }, saved.id) : saved
  check('draft: finished, it is submitted in place', done.ok && saved.ok && done.id === saved.id && st().studies.filter((x) => x.id === saved.id).length === 1 && st().studies.find((x) => x.id === saved.id)!.state === 'in_review' && st().studies.find((x) => x.id === saved.id)!.locations?.[0]?.label === 'Leeds')
  check('create: the step-4 read-back lists the hours and the address', studyDetails({ ...half, hours: NINE_TO_FIVE }).some((r) => r.label === 'Monday' && r.value === '09:00 AM to 05:00 PM') && studyDetails(half).some((r) => r.label === 'Address 1' && r.value.includes('1 Park Row')))
}
check('1. client publishes a study, it waits in review', made.ok && st().studies.find((s) => s.id === (made as { id: string }).id)!.state === 'in_review')
const id = made.ok ? made.id : ''
check('2. it is in the console\'s To Review queue', st().studies.filter((s) => s.state === 'in_review').some((s) => s.id === id))
check('   a client cannot take their own study live', !p.moveStudy(id, 'recruiting', client).ok)
check('   a respondent cannot apply before it is approved', !p.startApplication(id, DEMO_PERSON_ID).ok)
check('3. the console approves it', p.moveStudy(id, 'recruiting', team).ok && st().studies.find((s) => s.id === id)!.state === 'recruiting')
check('   the approval is in the activity log', st().activity[0]!.what.includes('Journey study') && st().activity[0]!.by === MASTER_ADMIN_ID)
check('4. it appears to the respondent', respondentStudies(st(), DEMO_PERSON_ID).some((s) => s.id === id && s.status === 'available'))
check('5. the respondent applies and submits the screener', p.startApplication(id, DEMO_PERSON_ID).ok && p.submitScreener(id, DEMO_PERSON_ID, { q2: ['A watch'], q3: ' 5 ' }).ok && status(id) === 'applied')
check('   a number answer is saved as a number, the rest as given', (() => { const a = participationOf(st().studies.find((s) => s.id === id)!, DEMO_PERSON_ID)!.answers!; return a.q3 === 5 && Array.isArray(a.q2) })())
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
check('a patch without an email keeps the email', p.updatePerson(DEMO_PERSON_ID, { name: 'Jonathan Reeve', email: undefined }).ok && st().people.find((x) => x.id === DEMO_PERSON_ID)!.email === 'jonathan.reeve@example.com')
check('reset puts everything back', !st().studies.some((s) => s.id === id) && refundsPending(st()).length === 2)

// The console's decisions are what the client app and the respondent app read (one store, one derive).
p.reset()
{
  const lastBy = () => st().activity[0]?.by
  const clientTag = () => recruit(st(), st().studies.find((s) => s.id === 'st-social')!, 'ferry-l')?.state
  const respondentSees = () => respondentStudies(st(), 'ferry-l').find((r) => r.id === 'st-social')?.status
  check('console qualifies: logged under the team member', p.decide('st-social', 'ferry-l', 'qualified', team).ok && lastBy() === MASTER_ADMIN_ID)
  check('console qualifies: the client app sees it', clientTag() !== undefined && st().studies.find((s) => s.id === 'st-social')!.participations.find((x) => x.personId === 'ferry-l')!.state === 'qualified', String(clientTag()))
  check('console qualifies: the respondent app sees it', respondentSees() === 'invited_to_complete', String(respondentSees()))
  check('console undo within the hour', p.decide('st-social', 'ferry-l', 'applied', team).ok && respondentSees() === 'applied')
  p.decide('st-social', 'ferry-l', 'qualified', team)
  clock += 61 * 60_000
  check('console undo refused after the hour', !p.decide('st-social', 'ferry-l', 'applied', team).ok)
  const yara = () => st().studies.find((s) => s.id === 'st-28')!.participations.find((x) => x.personId === 'yara-m')!
  check('console no-show: logged, nothing queued to pay', p.markNoShow('st-28', 'yara-m', team).ok && lastBy() === MASTER_ADMIN_ID && !st().pending.some((x) => x.personId === 'yara-m'))
  clock += TIMINGS.completionToPaid + 100; p.tick()
  check('console no-show: never paid, the respondent app shows No Show', !yara().paidAt && respondentStudies(st(), 'yara-m').find((r) => r.id === 'st-28')?.status === 'no_show')
  check('console undo no-show, then complete with the code: paid after the delay', p.undoNoShow('st-28', 'yara-m', team).ok && p.enterClientCode('st-28', 'yara-m', yara().code!.value).ok && p.complete('st-28', 'yara-m', team).ok && (clock += TIMINGS.completionToPaid + 100, p.tick(), Boolean(yara().paidAt)))
  check('console rating: refused twice (a simulated client rated at payout)', !p.rateParticipant('st-28', 'yara-m', 'dimensions', { expertise: 4, reliability: 4, communication: 3 }, team).ok)
  const unrated = st().studies.find((s) => s.id === 'st-social')!.participations.find((x) => x.state === 'completed' && !x.rating)!
  check('console rating: stored as the mean of the dimensions and logged', p.rateParticipant('st-social', unrated.personId, 'dimensions', { expertise: 4, reliability: 4, communication: 3 }, team).ok && unrated.personId !== undefined
    && st().studies.find((s) => s.id === 'st-social')!.participations.find((x) => x.personId === unrated.personId)!.rating?.stars === 4 && lastBy() === MASTER_ADMIN_ID)
  check('console approves the study a client submitted', (() => {
    const made = p.submitStudy(DEMO_CLIENT_ID, formOf({ ...SURVEY, title: 'Console approval check', industries: 'Tech', duration: 30, participants: '5', incentive: 50, roles: 'Engineer' }))
    if (!made.ok) return false
    const id = (made as { id: string }).id
    return st().studies.find((s) => s.id === id)?.state === 'in_review' && p.moveStudy(id, 'recruiting', team).ok && lastBy() === MASTER_ADMIN_ID
  })())
}
p.reset(); clock = now.getTime()

// A simulated client decides on the timer.
check('simulated client: screener then auto-qualified after the delay', (() => {
  p.startApplication('st-01', DEMO_PERSON_ID); p.submitScreener('st-01', DEMO_PERSON_ID)
  if (status('st-01') !== 'applied') return false
  clock += TIMINGS.screenerToInvite + 100; p.tick()
  return status('st-01') === 'invited_to_schedule'
})())

// ------------------------------------------------ answers, money and editing
{
  p.reset(); clock = now.getTime()
  const me: Actor = { kind: 'participant', id: DEMO_PERSON_ID }
  const mine = (id: string) => participationOf(st().studies.find((x) => x.id === id)!, DEMO_PERSON_ID)!
  const open = (form: StudyForm) => { const m = p.submitStudy(DEMO_CLIENT_ID, form); const id = (m as { id: string }).id; p.moveStudy(id, 'recruiting', team); p.startApplication(id, DEMO_PERSON_ID); p.submitScreener(id, DEMO_PERSON_ID, { q2: ['A watch'], q3: '4' }); p.decide(id, DEMO_PERSON_ID, 'qualified', team); return id }

  const survey = open(formOf({ type: 'survey', title: 'Answers survey', tasksSubmitted: true, tasks: asForm([{ kind: 'Single-select', text: 'How often?', options: [{ text: 'Weekly' }, { text: 'Monthly' }] }, { kind: 'Number input', text: 'How many?' }, { kind: 'Multi-line input', text: 'Why?' }]) }))
  check('answers: a survey handed in with a question left out is refused', (() => { const r = p.complete(survey, DEMO_PERSON_ID, me, { t1: 'Weekly', t2: '3' }); return !r.ok && r.why === 'Question 3 has not been answered' })())
  check('answers: a survey\'s answers are saved with the participation', p.complete(survey, DEMO_PERSON_ID, me, { t1: 'Weekly', t2: '3', t3: 'Because it is quick.' }).ok && mine(survey).taskAnswers?.t3 === 'Because it is quick.' && mine(survey).taskAnswers?.t2 === 3)
  const read = taskResults(st().studies.find((x) => x.id === survey)!, mine(survey))
  check('answers: they read back in order, each with its question', read.survey.map((a) => `${a.prompt}=${a.text}`).join(' | ') === 'How often?=Weekly | How many?=3 | Why?=Because it is quick.', read.survey.map((a) => `${a.prompt}=${a.text}`).join(' | '))

  const diary = open(formOf({ type: 'diary', title: 'Answers diary', studyDuration: '3 days', minimumRequired: '2 days', tasksSubmitted: true, tasks: asForm([{ kind: 'Multi-line input', text: 'What happened today?' }]) }))
  check('answers: each diary day keeps its own answers', p.completeDiaryDay(diary, DEMO_PERSON_ID, 1, { t1: 'Day one entry' }).ok && p.completeDiaryDay(diary, DEMO_PERSON_ID, 2, { t1: 'Day two entry' }).ok
    && taskResults(st().studies.find((x) => x.id === diary)!, mine(diary)).days.map((d) => `${d.day}:${d.answers[0]!.text}`).join(' | ') === '1:Day one entry | 2:Day two entry')
  check('answers: the seed\'s finished surveys and diaries carry answers too', st().studies.filter((x) => x.tasks?.length && (x.type === 'survey' || x.type === 'diary')).every((x) => x.participations.filter((q) => q.state === 'completed').every((q) => (x.type === 'survey' ? q.taskAnswers : q.diaryAnswers) !== undefined)))

  const q = quoteStudy('video_call', 8, 150)
  check('money: a quote is the fee table, line by line', q.incentives === 1200 && q.recruitment === 8 * (FEES.RECRUITMENT_BASE + FEES.RECRUITMENT_TYPE_ADDON) && q.moderation === 8 * FEES.MODERATION && q.platformFee === FEES.PLATFORM && q.total === 1200 + 400 + 80 + 100, JSON.stringify(q))
  check('money: one deposit rule, the incentives for the full sample', q.deposit === 1200 && q.later === q.total - 1200 && depositFor(q.rates, 8) === q.deposit && quoteStudy('survey', 12, 60).recruitment === 12 * FEES.RECRUITMENT_BASE)
  const paid = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Money study', participants: '8', incentive: 150 }))
  const money = paid.ok ? st().studies.find((x) => x.id === paid.id)! : undefined
  check('money: the store takes that deposit, and the bill projects that total', money?.payments[0]?.amount === q.deposit && billing(money!).deposit === q.deposit && billing(money!).totalCost === q.total, money ? `${money.payments[0]?.amount} / ${billing(money).totalCost}` : '')

  check('edit: a study waiting on the team can be changed and sent again, in place', (() => {
    if (!paid.ok) return false
    const again = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Money study, revised', participants: '10', incentive: 150 }), paid.id)
    const now2 = st().studies.find((x) => x.id === paid.id)!
    return again.ok && again.id === paid.id && now2.title === 'Money study, revised' && now2.required === 10 && now2.state === 'in_review' && now2.payments.length === 1 && now2.payments[0]!.amount === 1500 && st().studies.filter((x) => x.title.startsWith('Money study')).length === 1
  })())
  check('edit: a live study is refused, and saving a submitted study as a draft is refused', (() => {
    if (!paid.ok) return false
    const asDraft = p.saveStudyDraft(DEMO_CLIENT_ID, formOf({ title: 'x' }), paid.id)
    p.moveStudy(paid.id, 'recruiting', team)
    const live = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Changed while live' }), paid.id)
    return !asDraft.ok && !live.ok && live.why.includes('live') && st().studies.find((x) => x.id === paid.id)!.title === 'Money study, revised'
  })())
}

// ------------------------------------------------ matching, eligibility answers, AutoPay, the picture
{
  p.reset(); clock = now.getTime()
  const me: Actor = { kind: 'participant', id: DEMO_PERSON_ID }
  const narrow = formOf({ type: 'survey', title: 'Narrow audience', ...SURVEY, countries: [], gender: 'Female', education: '', ageRanges: [], roles: '', industries: 'Healthcare', tiers: '', image: 'data:image/jpeg;base64,AAAA', thumbnail: 'cover.jpg', autoPay: false })
  const made2 = p.submitStudy(DEMO_CLIENT_ID, narrow)
  const id2 = (made2 as { id: string }).id
  const study2 = () => st().studies.find((x) => x.id === id2)!
  check('picture: the image that was read is the study\'s image', made2.ok && study2().image === 'data:image/jpeg;base64,AAAA' && study2().form?.thumbnail === 'cover.jpg')
  check('matching: nobody is matched while the study waits on the team', study2().participations.length === 0)
  p.moveStudy(id2, 'recruiting', team)
  const fit = audiencePeople(st(), narrow, new Date(clock)).map((x) => x.id).sort()
  const matched = study2().participations.filter((x) => x.state === 'matched').map((x) => x.personId).sort()
  const everyone = st().people.filter((x) => x.status === 'active' && x.identity.state === 'verified').length
  check('matching: going live matches exactly the people who fit the audience', fit.length > 0 && fit.length < everyone && JSON.stringify(matched) === JSON.stringify(fit), `${matched.length} matched, ${fit.length} fit, ${everyone} in the pool`)
  check('matching: every one of them is a woman in healthcare, as the audience says', matched.every((pid) => { const x = st().people.find((y) => y.id === pid)!; return x.profile.gender === 'Female' && x.profile.industry.toLowerCase().includes('healthcare') }))

  const pre = study2().preScreener[0]!
  check('eligibility: the answers they passed with are kept', p.startApplication(id2, DEMO_PERSON_ID, { [pre.id]: pre.passing[0]!, stray: 'x' }).ok
    && JSON.stringify(participationOf(study2(), DEMO_PERSON_ID)!.preAnswers) === JSON.stringify({ [pre.id]: pre.passing[0] }) && participationOf(study2(), DEMO_PERSON_ID)!.prescreener === 'passed')
  p.submitScreener(id2, DEMO_PERSON_ID, { q2: ['A watch'], q3: '2' }); p.decide(id2, DEMO_PERSON_ID, 'qualified', team)
  check('eligibility: they survive the rest of the screener being submitted', participationOf(study2(), DEMO_PERSON_ID)!.preAnswers?.[pre.id] === pre.passing[0])

  p.complete(id2, DEMO_PERSON_ID, me, { t1: 'Nothing much.' })
  clock += TIMINGS.completionToPaid * 3; p.tick()
  check('AutoPay off: a completed participant is not paid by the timer', participationOf(study2(), DEMO_PERSON_ID)!.state === 'completed' && !participationOf(study2(), DEMO_PERSON_ID)!.paidAt && st().pending.every((x) => !(x.kind === 'pay' && x.studyId === id2)))
  check('AutoPay off: they are paid when the client approves the payout', p.approvePayouts(id2, [DEMO_PERSON_ID]).ok && Boolean(participationOf(study2(), DEMO_PERSON_ID)!.paidAt))
  const auto = p.submitStudy(DEMO_CLIENT_ID, formOf({ type: 'survey', title: 'AutoPay on', ...SURVEY, autoPay: true }))
  const id3 = (auto as { id: string }).id
  p.moveStudy(id3, 'recruiting', team); p.startApplication(id3, DEMO_PERSON_ID); p.submitScreener(id3, DEMO_PERSON_ID, { q2: ['A watch'], q3: '2' }); p.decide(id3, DEMO_PERSON_ID, 'qualified', team)
  p.complete(id3, DEMO_PERSON_ID, me, { t1: 'Nothing much.' }); clock += TIMINGS.completionToPaid + 100; p.tick()
  check('AutoPay on: they are paid without anyone approving', Boolean(participationOf(st().studies.find((x) => x.id === id3)!, DEMO_PERSON_ID)!.paidAt))
}

// ------------------------------------------------ the last loose ends
{
  p.reset(); clock = now.getTime()
  const people = st().people
  check('pictures: every seeded person has one, drawn and not a photograph', people.every((x) => x.photo?.startsWith('data:image/svg+xml,')) && new Set(people.map((x) => x.photo)).size > people.length / 2, `${people.filter((x) => x.photo).length} of ${people.length}`)
  check('profiles: every seeded person has work functions and skills', people.every((x) => x.profile.workFunctions.length > 0 && x.profile.skills.length > 0))
  const wide = formOf({ countries: [], gender: 'All Genders', education: '', ageRanges: [] })
  const all = audiencePeople(st(), wide, now).length
  const byFunction = audiencePeople(st(), { ...wide, functions: 'Engineering' }, now)
  const bySkill = audiencePeople(st(), { ...wide, skills: 'triage, coaching' }, now)
  check('audience: a work function narrows it to people who do that', byFunction.length > 0 && byFunction.length < all && byFunction.every((x) => x.profile.workFunctions.includes('Engineering')), `${all} -> ${byFunction.length}`)
  check('audience: skills narrow it to people with any of them, ignoring case', bySkill.length > 0 && bySkill.length < all && bySkill.every((x) => x.profile.skills.some((k) => k === 'Triage' || k === 'Coaching')), `${all} -> ${bySkill.length}`)
  check('audience: a function nobody has matches nobody', audiencePeople(st(), { ...wide, functions: 'Beekeeping' }, now).length === 0)
  const weekly = buildStudy(formOf({ title: 't', type: 'diary', durationUnit: 'Week', frequency: 'Weekly', studyDuration: '5 weeks', minimumRequired: '4 weeks', tasks: asForm([{ kind: 'Multi-line input', text: 'What changed this week?' }]), tasksSubmitted: true }), now)
  check('diary: entries are counted in the unit chosen', weekly.ok && weekly.study.diary?.unit === 'Week' && weekly.study.diary.totalDays === 5 && weekly.study.diary.minDays === 4 && diaryWords(weekly.study.diary.unit).Unit === 'Week' && diaryWords(weekly.study.diary.unit).units === 'weeks' && diaryWords(undefined).Unit === 'Day')
}

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
