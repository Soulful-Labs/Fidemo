/**
 * Checks the shared layer end to end without a browser:
 *   npm run verify:shared (from the repo root)
 *
 * It asserts the seed is coherent (one participation per person per study,
 * everybody exists, the policy's numbers), then walks the cross-app journey
 * through store.ts and checks every legal move lands and every illegal one
 * is refused with a reason.
 */
import { diffForms, studyHistory } from '../shared/revisions'
import { clientDeactivationBlockers, clientDeactivationRefusal, currentRate, earnedOf, groupSections, groupsOf, payoutRows, personById, redeemRows, studiesOf } from '../shared/derive'
import { settingsAt } from '../shared/settings'
import { withdrawals,
  billing, consoleDashboard, hasCertificate, payoutsToProcess, referralCode, counts, financeTotals, personFigures, pointsRows, poolPerson, recruit, refundsPending, respondentStudies, sharedPhoto, sharedVideo, trustInputs,
} from '../shared/derive'
import { PAYOUT_MOVES, respondentStatus, participationOf } from '../shared/lifecycle'
import { FEES, TIMINGS, depositFor, diaryWords, paymentPlan, quoteStudy, rateFor } from '../shared/platform'
import { EMPTY_RATE_CARD, RATE_CARD, feesCsv, parseCsv, previewUpload, quoteFrom, readCsv, segmentsCsv } from '../shared/ratecard'
import { readFileSync } from 'node:fs'
import { RATE_CARD_FEES_CSV, RATE_CARD_SEGMENTS_CSV } from '../shared/seed/rateCardFiles'
import { POINTS, REDEEM, TIERS, TRUST, starsForRating, starsFromDimensions, trustScore } from '../shared/rules'
import { DEMO_CLIENT_ID, DEMO_PERSON_EMAIL, DEMO_PERSON_ID, DEMO_PERSON_PASSWORD, MASTER_ADMIN_ID, buildSeed } from '../shared/seed'
import { buildScreener, buildTasks, screenerOutline, taskResults } from '../shared/questions'
import type { AuthoredQuestion } from '../shared/questions'
import { AUDIENCE_LISTS, audiencePeople, blankForm, blankQuestion, buildStudy, estimateAudience, formFromStudy, formId, studyDetails, summarise } from '../shared/studyForm'
import type { FormQuestion, StudyForm } from '../shared/studyForm'
import { createPlatform, sessionStart } from '../shared/store'
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
check('platform: withdrawal fee is $1.99 (23 Oct 2026, as Pricing & Rewards draws it)', FEES.WITHDRAWAL === 1.99)
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
const formOf = (over: Partial<StudyForm>): StudyForm => ({ ...blankForm(), type: 'video_call', description: 'Created by the verify script.', functions: 'Consultation', industries: 'Healthcare', ageRanges: ['30–39'], questions: asForm(BUILT), hours: NINE_TO_FIVE, availabilitySet: true, ...over })
const SURVEY: Partial<StudyForm> = { type: 'survey', tasks: asForm([{ kind: 'Multi-line input', text: 'What would you change first?' }]), tasksSubmitted: true }
// An audience Jonathan is in (D38: applying checks it): a physician in healthcare, 38, in the US.
const made = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Journey study', type: 'video_call', participants: '5', incentive: 120, duration: 45, functions: 'Consultation', industries: 'Healthcare', ageRanges: ['30–39'] }))
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
  check('create: the whole form is kept with the study', mine?.form?.title === 'Journey study' && mine.form.questions.length === BUILT.length && mine.required === 5 && mine.rates.incentivePer > 0 && mine.rates.incentivePer !== 120 && mine.rates.incentivePer === mine.incentivePeriods?.[0]?.amount)
  check('create: hours that end before they start are refused, by day', (() => { const r = buildStudy(formOf({ title: 't', hours: { Monday: [{ from: '12:00 AM', to: '12:00 AM' }] } })); return !r.ok && r.why.startsWith('Monday') })())
  check('create: a study with no title, or no availability submitted, is refused', !buildStudy(formOf({ title: ' ' })).ok && !buildStudy(formOf({ title: 't', availabilitySet: false })).ok)
  const tomorrow = new Date(now.getTime() + 86_400_000), ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const off = buildStudy(formOf({ title: 't', overrides: [{ id: 'v1', from: ymd(tomorrow), to: ymd(tomorrow), windows: [] }] }), now)
  check('create: a date override marked unavailable removes that day', off.ok && !off.study.availability!.some((a) => new Date(a.date).toDateString() === tomorrow.toDateString()))
  const inPerson = formOf({ title: 't', type: 'in_person', groupInPerson: true, seats: '6 seats', addresses: [{ id: 'a1', title: 'Austin, Texas', detail: '12 Main St, Austin, Texas, 73301' }], sessions: [{ id: 's1', date: ymd(new Date(now.getTime() + 3 * 86_400_000)), time: '10:00 AM' }] })
  const group = buildStudy(inPerson, now)
  check('create: a group study has the client\'s own sessions, seats and address', group.ok && group.study.type === 'in_person_group' && group.study.sessions?.length === 1 && group.study.sessions[0]!.seats === 6 && group.study.sessions[0]!.slot === '10:00 AM' && group.study.locations?.[0]?.address === '12 Main St, Austin, Texas, 73301' && group.study.sessions[0]!.locationId === 'a1')
  check('create: a session in the past, or an in-person study with no address, is refused', !buildStudy({ ...inPerson, sessions: [{ id: 's1', date: '2020-01-01', time: '10:00 AM' }] }, now).ok && !buildStudy({ ...inPerson, addresses: [] }, now).ok)
  const diary = buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '7 days', minimumRequired: '6 days', frequency: 'Every day', durationUnit: 'Day', tasks: asForm([{ kind: 'Multi-line input', text: 'What happened today?' }]), tasksSubmitted: true }), now)
  check('create: diary settings are the study\'s, as chosen', diary.ok && diary.study.diary?.totalDays === 7 && diary.study.diary.minDays === 6 && diary.study.diary.frequency === 'Every day' && diary.study.tasks?.[0]?.prompt === 'What happened today?')
  check('create: a diary minimum under four fifths of its entries is refused (policy 5: at least 4 of 5)', !buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '7 days', minimumRequired: '5 days', tasks: asForm([{ kind: 'Multi-line input', text: 'x' }]), tasksSubmitted: true }), now).ok && !buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '5 days', minimumRequired: '3 days', tasks: asForm([{ kind: 'Multi-line input', text: 'x' }]), tasksSubmitted: true }), now).ok && buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '5 days', minimumRequired: '4 days', tasks: asForm([{ kind: 'Multi-line input', text: 'x' }]), tasksSubmitted: true }), now).ok)
  check('create: a survey with no form, or a diary asking for more days than it runs, is refused', !buildStudy(formOf({ title: 't', type: 'survey' }), now).ok && !buildStudy(formOf({ title: 't', type: 'diary', studyDuration: '3 days', minimumRequired: '5 days', tasks: asForm([{ kind: 'Multi-line input', text: 'x' }]), tasksSubmitted: true }), now).ok)
  const aud = formOf({ title: 't', countries: ['United States of America'], gender: ['Female'], education: [], ageRanges: [], roles: 'Oncologist, Nurse', functions: 'Consultation', industries: 'Healthcare', condition: 'never', tiers: 'Gold and above' })
  const sum = summarise(st(), aud, now)
  check('create: the audience is written as entered, and sets the repeat rule', sum.audience.some((a) => a.label === 'Roles' && a.value === 'Oncologist, Nurse') && sum.audience.some((a) => a.label === 'Gender' && a.value === 'Female') && sum.audience.some((a) => a.label === 'Profile Tiers') && (() => { const b = buildStudy(aud, now); return b.ok && b.study.repeatRule === 'exclude' && b.study.targetProfession === 'Oncologist, Nurse' })())
  // 22 Oct 2026: two conditions. A draft saved with the old "fresh" reads as N/A, which allows everyone.
  check('create: an older draft with the "fresh" condition builds a study that allows everyone', (() => { const b = buildStudy({ ...aud, condition: 'fresh' as never }, now); return b.ok && b.study.repeatRule === 'allow' })())
  // 22 Oct 2026: Required, from the question menu. Off builds an optional question; a deciding one stops being a pre-screener.
  check('create: a question with Required off is optional, and is not a pre-screener', (() => { const t = buildTasks([{ kind: 'Multi-line input', text: 'Anything else?', required: false }]); const sc = buildScreener([{ kind: 'Single-select', text: 'Do you drive?', options: [{ text: 'Yes', mark: 'Correct' }, { text: 'No', mark: 'Incorrect' }], required: false }]); return t.ok && t.tasks[0]?.optional === true && sc.ok && sc.preScreener.length === 0 && sc.screener[0]?.optional === true })())
  const everyone = estimateAudience(st(), formOf({ countries: [], gender: ['All Genders'], education: [], ageRanges: [], functions: '', industries: '' }), now)
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
  {
    // Edit Study (19 Oct 2026): resubmitting a study in review records what changed, field by field, in Revisions History.
    const fin = { ...half, questions: asForm(BUILT), hours: NINE_TO_FIVE, availabilitySet: true }
    const edited = done.ok ? p.submitStudy(DEMO_CLIENT_ID, { ...fin, title: 'Half built, final', experience: ['3-5 years'] }, done.id) : done
    const rec = edited.ok ? st().studies.find((x) => x.id === edited.id)!.edits ?? [] : []
    check('revisions: an edit to a study in review is recorded by field', edited.ok && rec.length === 1 && rec[0]!.by === 'client'
      && rec[0]!.changes.some((c) => c.path.join('>') === 'About>Title' && c.to === 'Half built, final')
      && rec[0]!.changes.some((c) => c.path.join('>') === 'Audience>Experience' && c.added?.[0] === '3-5 years'), JSON.stringify(rec))
    check('revisions: the history lists the edit before the first submission', edited.ok && studyHistory(st().studies.find((x) => x.id === edited.id)!).map((h) => h.kind).join(',') === 'edit,submitted')
  }
  {
    // Edit Study in the console (19 Oct 2026): the team edits a live study; money and bookings are locked.
    const live = () => st().studies.find((x) => x.id === 'st-social')!
    const base = { ...formFromStudy(live()), functions: 'Marketing' }
    const rates = JSON.stringify(live().rates)
    check('live edit: the client cannot use it', !p.editLiveStudy('st-social', { ...base, title: 'x' }, client).ok)
    const moneyMove = p.editLiveStudy('st-social', { ...base, incentive: base.incentive + 50 }, team)
    check('live edit: the incentive is locked', !moneyMove.ok && /incentive/.test(moneyMove.why))
    check('live edit: the target is locked', !p.editLiveStudy('st-social', { ...base, participants: String(Number(base.participants) + 5) }, team).ok)
    const ok = p.editLiveStudy('st-social', { ...base, title: 'Designing social posts, the tools people use' }, team)
    const last = live().edits?.at(-1)
    check('live edit: a team edit is saved and recorded as the team\'s', ok.ok && live().title === 'Designing social posts, the tools people use' && last?.by === 'team' && last.changes.some((c) => c.path.join('>') === 'About>Title'), ok.ok ? '' : ok.why)
    check('live edit: nothing the client is charged changes', JSON.stringify(live().rates) === rates)
  }
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
check('   the PIN is refused before the session starts (the interviewer gives it during the session)', !p.confirmPin(id, DEMO_PERSON_ID, '407060').ok && status(id) === 'scheduled')
clock = sessionStart({ date: slotDay.date, slot: slotDay.slots[0]! }).getTime() + 5 * 60_000
check('   and enters the PIN once it has started', p.confirmPin(id, DEMO_PERSON_ID, '407060').ok && status(id) === 'pin_confirmed')
const before = fig()
check('9. the client enters the code and marks them completed', p.enterClientCode(id, DEMO_PERSON_ID, '407060').ok && p.complete(id, DEMO_PERSON_ID, client).ok && status(id) === 'in_process')
clock += 60 * 60_000
p.tick()
check('9a. nothing is paid automatically: an hour on, they are still waiting', status(id) === 'in_process' && !participationOf(st().studies.find((s) => s.id === id)!, DEMO_PERSON_ID)!.paidAt)
check('9b. the client cannot pay them, and the team cannot before the study finishes', !p.processPayouts(id, client).ok && !p.processPayouts(id, team).ok)
const clientNote = () => st().clients.find((c) => c.id === DEMO_CLIENT_ID)!.notifications?.[0]
check('9c. the study finishes: the client is told the participants will now be paid', p.moveStudy(id, 'billing', team).ok && clientNote()?.title === 'Your study has finished' && /will now be paid/.test(clientNote()?.body ?? '') && clientNote()?.studyId === id, clientNote()?.body)
check('9d. and the team is told the payouts are ready to process; nothing is paid yet', st().teamNotices[0]?.studyId === id && st().teamNotices[0]?.title === 'Payouts ready to process' && status(id) === 'in_process' && payoutsToProcess(st()).some((c) => c.study.id === id && c.ready.length === 1), st().teamNotices[0]?.body)
check('9e. the team processes them by hand, and it is logged', p.processPayouts(id, team).ok && st().activity[0]!.what.startsWith('Processed 1 payout') && !payoutsToProcess(st()).some((c) => c.study.id === id))
const after = fig()
check('10. wallet, points and Trust Score rise', status(id) === 'paid' && after.walletBalance === before.walletBalance + st().studies.find((x) => x.id === id)!.rates.incentivePer && after.points === before.points + POINTS.STUDY_COMPLETION && after.trustScore === before.trustScore + TRUST.STUDY_COMPLETION, `wallet ${before.walletBalance}->${after.walletBalance} points ${before.points}->${after.points} trust ${before.trustScore}->${after.trustScore}`)
check('11. the same score is what the console profile derives', personFigures(p.getState(), DEMO_PERSON_ID, new Date(clock)).trustScore === after.trustScore)
check('12. the client rates them; the rating feeds the Trust Score', p.rateParticipant(id, DEMO_PERSON_ID, 'excellent').ok && fig().trustScore >= after.trustScore, `trust ${after.trustScore}->${fig().trustScore}`)

const pts = fig().points
check('redeem below the minimum is refused', !p.redeem(DEMO_PERSON_ID, 500).ok)
check('redeem 1,000 points moves $10', p.redeem(DEMO_PERSON_ID, 1000).ok && fig().points === pts - 1000 && fig().walletBalance === after.walletBalance + 10)
check('points history lists every award', pointsRows(st(), DEMO_PERSON_ID).some((r) => r.detail === 'Journey study'))
check('withdrawing more than the balance is refused', !p.requestPayout(DEMO_PERSON_ID, 1e6, '****7790').ok)
{
  // Withdrawal payouts (19 Oct 2026): requested as pending, released by the team only, once.
  p.updatePerson(DEMO_PERSON_ID, { taxFormDone: true })
  const asked = p.requestPayout(DEMO_PERSON_ID, 20, '****7790')
  const mine = () => st().people.find((x) => x.id === DEMO_PERSON_ID)!.payouts.find((x) => asked.ok && x.id === asked.id)!
  check('withdrawal: a request waits for the team as pending', asked.ok && mine().status === 'pending' && withdrawals(st(), 'pending').some((r) => r.payout.id === mine().id), asked.ok ? '' : asked.why)
  check('withdrawal: only the team can release it', asked.ok && !p.releasePayout(DEMO_PERSON_ID, mine().id, client).ok)
  check('withdrawal: the team releases it once, and it is paid', asked.ok && p.releasePayout(DEMO_PERSON_ID, mine().id, team).ok && mine().status === 'paid' && Boolean(mine().releasedAt) && !p.releasePayout(DEMO_PERSON_ID, mine().id, team).ok)
  check('withdrawal: the full state set is in the lifecycle', ['pending', 'approved', 'held', 'paid', 'failed'].every((k) => k in PAYOUT_MOVES))
}
// The journey study finished underfilled above, so it has a refund of its own: the count drops by the one confirmed.
const refundsBefore = refundsPending(st()).length
check('refund: confirmed once, refused twice', p.confirmRefund('st-uf-1', team).ok && !p.confirmRefund('st-uf-1', team).ok && refundsPending(st()).length === refundsBefore - 1)
check('a study in Billing cannot be paused', st().studies.find((s) => s.id === 'st-sleep')!.state === 'billing' && !p.moveStudy('st-sleep', 'paused', client).ok)
{
  // Billing (22 Oct 2026): Re-publish and Recruit takes a study in Billing back to recruiting; stopping it again opens the bill again.
  const sleep = () => st().studies.find((s) => s.id === 'st-sleep')!
  const firstStop = sleep().stoppedAt
  check('a study cannot jump from recruiting straight to Completed', !p.moveStudy('st-pay', 'completed', client).ok)
  const reopened = p.moveStudy('st-sleep', 'recruiting', client).ok && sleep().state === 'recruiting' && !sleep().stoppedAt && billing(sleep()).outstanding === 0
  check('a study in Billing can be re-published, and nothing is due while it recruits', reopened)
  check('Stop-complete moves it to Billing, not Completed, and the bill is due again', p.moveStudy('st-sleep', 'billing', client).ok && sleep().state === 'billing' && sleep().stoppedBy === 'client' && (sleep().stoppedAt ?? '') >= (firstStop ?? '') && billing(sleep()).outstanding > 0 && !sleep().completedAt)
}
check('paying the bill completes the study', billing(st().studies.find((s) => s.id === 'st-sleep')!).outstanding > 0 && p.payBalance('st-sleep').ok && billing(st().studies.find((s) => s.id === 'st-sleep')!).outstanding === 0 && st().studies.find((s) => s.id === 'st-sleep')!.state === 'completed')
check('a completed study cannot be re-published', !p.moveStudy('st-sleep', 'recruiting', client).ok)
{
  // A study that fills its target stops recruiting on its own (22 Oct 2026): the last completion moves it to Billing, marked as filled.
  const ready = (q: { state: string }) => q.state === 'recruited' || q.state === 'qualified' || q.state === 'applied'
  const live = st().studies.find((x) => (x.state === 'recruiting' || x.state === 'ongoing') && !x.beyondTarget && x.type === 'survey' && x.required > 0
    && x.participations.filter(ready).length >= x.required - x.participations.filter((q) => q.state === 'completed').length)
  if (!live) check('a study that fills its target goes to Billing by itself', false, 'no live survey with enough people to fill it')
  else {
    const need = live.required - live.participations.filter((q) => q.state === 'completed').length
    // Applicants are qualified first, as the team would, then each completes.
    for (const q of live.participations.filter(ready).slice(0, need)) { if (q.state === 'applied') p.decide(live.id, q.personId, 'qualified', team); p.complete(live.id, q.personId, team) }
    const after = st().studies.find((x) => x.id === live.id)!
    check('a study that fills its target goes to Billing by itself, marked as filled', after.state === 'billing' || after.state === 'completed', `${live.id} is ${after.state}`)
    check('and it is finished for participants: the team is told the payouts are ready', after.stoppedBy === 'filled' && (st().teamNotices ?? []).some((n) => n.kind === 'payouts' && n.studyId === live.id))
  }
}
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
  clock += 60 * 60_000; p.tick()
  check('console no-show: never paid, the respondent app shows No Show', !yara().paidAt && respondentStudies(st(), 'yara-m').find((r) => r.id === 'st-28')?.status === 'no_show')
  check('console undo no-show, then complete with the code: not paid on a timer', p.undoNoShow('st-28', 'yara-m', team).ok && p.enterClientCode('st-28', 'yara-m', yara().code!.value).ok && p.complete('st-28', 'yara-m', team).ok && (clock += 60 * 60_000, p.tick(), !yara().paidAt))
  check('console: once the study finishes, the team processes the payout', p.moveStudy('st-28', 'billing', team).ok && p.processPayouts('st-28', team).ok && Boolean(yara().paidAt))
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

  const diary = open(formOf({ type: 'diary', title: 'Answers diary', studyDuration: '3 days', minimumRequired: '3 days', tasksSubmitted: true, tasks: asForm([{ kind: 'Multi-line input', text: 'What happened today?' }]) }))
  check('answers: each diary day keeps its own answers', p.completeDiaryDay(diary, DEMO_PERSON_ID, 1, { t1: 'Day one entry' }).ok && p.completeDiaryDay(diary, DEMO_PERSON_ID, 2, { t1: 'Day two entry' }).ok
    && taskResults(st().studies.find((x) => x.id === diary)!, mine(diary)).days.map((d) => `${d.day}:${d.answers[0]!.text}`).join(' | ') === '1:Day one entry | 2:Day two entry')
  check('answers: the seed\'s finished surveys and diaries carry answers too', st().studies.filter((x) => x.tasks?.length && (x.type === 'survey' || x.type === 'diary')).every((x) => x.participations.filter((q) => q.state === 'completed').every((q) => (x.type === 'survey' ? q.taskAnswers : q.diaryAnswers) !== undefined)))

  const q = quoteStudy('video_call', 8, 150)
  check('money: a quote is the fee table, line by line', q.incentives === 1200 && q.recruitment === 8 * (FEES.RECRUITMENT_BASE + FEES.RECRUITMENT_TYPE_ADDON) && q.moderation === 8 * FEES.MODERATION && q.platformFee === FEES.PLATFORM && q.total === 1200 + 400 + 80 + 100, JSON.stringify(q))
  check('money: one deposit rule, 25% of recruitment + 25% of incentives', q.depositIncentive === 300 && q.depositRecruitment === 100 && q.deposit === 400 && q.later === q.total - 400 && depositFor(q.rates, 8) === q.deposit && quoteStudy('survey', 12, 60).recruitment === 12 * FEES.RECRUITMENT_BASE, JSON.stringify({ i: q.depositIncentive, r: q.depositRecruitment, d: q.deposit }))
  const drawn = quoteStudy('survey', 20, 70)
  check('money: the designer card, with the labels right: $1,400 incentives -> $350, $500 recruitment -> $125, $475 upfront', drawn.incentives === 1400 && drawn.recruitment === 500 && drawn.depositIncentive === 350 && drawn.depositRecruitment === 125 && drawn.deposit === 475)
  // 23 Oct 2026: the price is the rate per participant times the participants, paid 20% at publish, 30% when recruiting starts, the rest on the bill.
  const plan = paymentPlan(250, 20)
  check('pricing: $250 x 20 participants is $5,000, paid $1,000 upfront, $1,500 incentive deposit, $2,500 on completion', plan.total === 5000 && plan.upfront === 1000 && plan.incentive === 1500 && plan.completion === 2500, JSON.stringify(plan))
  check('pricing: the three stages always add up to the total, whatever the rate', [[333, 7], [199.99, 13], [250, 1], [250, 0]].every(([r, n]) => { const x = paymentPlan(r!, n!); return Math.abs(x.upfront + x.incentive + x.completion - x.total) < 0.001 }))
  const paid = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Money study', participants: '8', incentive: 150 }))
  const money = paid.ok ? st().studies.find((x) => x.id === paid.id)! : undefined
  check('money: publishing prices the study at the platform rate and takes the 20% upfront deposit; the bill projects rate x participants',
    money?.ratePeriods?.[0]?.rate === rateFor(money) && rateFor(money) > 0 && money?.payments.length === 1 && money.payments[0]!.stage === 'upfront' && money.payments[0]!.amount === paymentPlan(rateFor(money), 8).upfront
    && billing(money).deposit === money.payments[0]!.amount && billing(money).totalCost === rateFor(money) * 8 && billing(money).less[0]!.label === 'Less: 20% Upfront Deposit',
    money ? `${money.payments[0]?.amount} / ${billing(money).totalCost}` : '')
  check('money: the incentive is inside the rate, not charged on top', money ? billing(money).plan.total === rateFor(money) * 8 : false)

  check('edit: a study waiting on the team can be changed and sent again, in place', (() => {
    if (!paid.ok) return false
    const again = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Money study, revised', participants: '10', incentive: 150 }), paid.id)
    const now2 = st().studies.find((x) => x.id === paid.id)!
    return again.ok && again.id === paid.id && now2.title === 'Money study, revised' && now2.required === 10 && now2.state === 'in_review' && now2.payments.length === 1 && now2.payments[0]!.amount === paymentPlan(now2.ratePeriods![0]!.rate, 10).upfront && st().studies.filter((x) => x.title.startsWith('Money study')).length === 1
  })())
  check('edit: a live study is refused, and saving a submitted study as a draft is refused', (() => {
    if (!paid.ok) return false
    const asDraft = p.saveStudyDraft(DEMO_CLIENT_ID, formOf({ title: 'x' }), paid.id)
    p.moveStudy(paid.id, 'recruiting', team)
    const live = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Changed while live' }), paid.id)
    return !asDraft.ok && !live.ok && live.why.includes('live') && st().studies.find((x) => x.id === paid.id)!.title === 'Money study, revised'
  })())
  check('money: the team taking the study live takes the 30% incentive deposit, once', (() => {
    if (!paid.ok) return false
    const x = st().studies.find((y) => y.id === paid.id)!
    const inc = x.payments.filter((y) => y.stage === 'incentive')
    const b = billing(x)
    return inc.length === 1 && inc[0]!.amount === paymentPlan(x.ratePeriods![0]!.rate, 10).incentive && b.deposit === paymentPlan(x.ratePeriods![0]!.rate, 10).upfront + inc[0]!.amount
      && b.less.map((l) => l.label).join(' | ') === 'Less: 20% Upfront Deposit | Less: 30% Recruitment Cost' && b.estimate.net === b.plan.total - b.deposit
  })())
  {
    const travel = st().studies.find((x) => x.id === 'st-travel')!
    const b = billing(travel)
    check('money: the final bill is each completed participant at the rate agreed when they completed, one line per period',
      travel.ratePeriods!.length === 2 && b.lines.length === 2 && b.total === b.lines.reduce((n, l) => n + l.amount, 0)
      && b.lines.reduce((n, l) => n + Number(l.label.match(/x (\d+)/)![1]), 0) === b.delivered && b.net === b.total - b.deposit, b.lines.map((l) => `${l.label} ${l.amount}`).join(', '))
  }
  // 23 Oct 2026: study groups.
  {
    const groups = () => groupsOf(st(), DEMO_CLIENT_ID)
    const blank = p.createStudyGroup(DEMO_CLIENT_ID, '  ')
    const dup = p.createStudyGroup(DEMO_CLIENT_ID, 'my digital studies group')
    const draftId = st().studies.find((x) => x.clientId === DEMO_CLIENT_ID && x.state === 'draft')!.id
    const withDraft = p.createStudyGroup(DEMO_CLIENT_ID, 'Has a draft', [draftId])
    check('groups: a group needs a name of its own, and drafts stay out', !blank.ok && !dup.ok && !withDraft.ok, [blank, dup, withDraft].map((r) => (r.ok ? 'ok' : r.why)).join(' / '))
    const made = p.createStudyGroup(DEMO_CLIENT_ID, 'Health studies', ['st-sleep', 'st-goal'])
    const digital = () => groups().find((g) => g.name === 'My Digital Studies Group')!
    const health = () => groups().find((g) => g.name === 'Health studies')!
    check('groups: creating one with studies moves a study out of the group it was in', made.ok && health().studyIds.join() === 'st-sleep,st-goal' && digital().studyIds.join() === 'st-social')
    check('groups: Add to a Group from the options menu, and adding it twice is refused', p.addStudyToGroup(health().id, 'st-fitness').ok && health().studyIds.includes('st-fitness') && !p.addStudyToGroup(health().id, 'st-fitness').ok)
    check('groups: Edit Group renames it and sets its studies; one taken out goes back to Others', p.updateStudyGroup(health().id, 'Health', ['st-sleep']).ok && groups().some((g) => g.name === 'Health' && g.studyIds.join() === 'st-sleep'))
    const rows = studiesOf(st(), DEMO_CLIENT_ID).filter((x) => x.state !== 'draft')
    const sections = groupSections(groups(), rows)
    check('groups: My Studies is each group, then Others, and every study is listed once', sections.at(-1)!.group === undefined && sections.reduce((n, x) => n + x.rows.length, 0) === rows.length && sections[0]!.group?.name === 'My Digital Studies Group')
    const health2 = groups().find((g) => g.name === 'Health')!
    check('groups: Ungroup removes the group and its studies go back to Others', p.ungroupStudyGroup(health2.id).ok && !groups().some((g) => g.name === 'Health') && groupSections(groups(), rows).at(-1)!.rows.some((r) => r.id === 'st-sleep'))
    check('groups: with no groups there is one unnamed section', groupSections([], rows).length === 1 && groupSections([], rows)[0]!.group === undefined)
  }
}

// ------------------------------------------------ matching, eligibility answers, payouts by hand, the picture
{
  p.reset(); clock = now.getTime()
  const me: Actor = { kind: 'participant', id: DEMO_PERSON_ID }
  const narrow = formOf({ type: 'survey', title: 'Narrow audience', ...SURVEY, countries: [], gender: ['Female'], education: [], ageRanges: [], roles: '', functions: 'Consultation, Patient Care, Research', industries: 'Healthcare', tiers: '', image: 'data:image/jpeg;base64,AAAA', thumbnail: 'cover.jpg' })
  const made2 = p.submitStudy(DEMO_CLIENT_ID, narrow)
  let id2 = (made2 as { id: string }).id
  const study2 = () => st().studies.find((x) => x.id === id2)!
  check('picture: the image that was read is the study\'s image', made2.ok && study2().image === 'data:image/jpeg;base64,AAAA' && study2().form?.thumbnail === 'cover.jpg')
  check('matching: nobody is matched while the study waits on the team', study2().participations.length === 0)
  p.moveStudy(id2, 'recruiting', team)
  const fit = audiencePeople(st(), narrow, new Date(clock)).map((x) => x.id).sort()
  const matched = study2().participations.filter((x) => x.state === 'matched').map((x) => x.personId).sort()
  const everyone = st().people.filter((x) => x.status === 'active' && x.identity.state === 'verified').length
  check('matching: going live matches exactly the people who fit the audience', fit.length > 0 && fit.length < everyone && JSON.stringify(matched) === JSON.stringify(fit), `${matched.length} matched, ${fit.length} fit, ${everyone} in the pool`)
  check('matching: every one of them is a woman in healthcare, as the audience says', matched.every((pid) => { const x = st().people.find((y) => y.id === pid)!; return x.profile.gender === 'Female' && x.profile.industry.toLowerCase().includes('healthcare') }))

  // D38: Jonathan is a man, so this women-only study is not listed for him and his application is refused, naming gender.
  { const seen = respondentStudies(st(), DEMO_PERSON_ID).find((x) => x.id === id2)!
    check('audience: a man cannot apply to a study for women, and is told it is the gender', !seen.fits && seen.audienceMisses.join() === 'gender' && !p.startApplication(id2, DEMO_PERSON_ID).ok && !participationOf(study2(), DEMO_PERSON_ID)) }
  // The eligibility checks run on the same study opened to every gender.
  const wide = p.submitStudy(DEMO_CLIENT_ID, { ...narrow, gender: ['All Genders'], title: 'Narrow audience, any gender' })
  id2 = (wide as { id: string }).id
  p.moveStudy(id2, 'recruiting', team)
  const pre = study2().preScreener[0]!
  check('eligibility: the answers they passed with are kept', p.startApplication(id2, DEMO_PERSON_ID, { [pre.id]: pre.passing[0]!, stray: 'x' }).ok
    && JSON.stringify(participationOf(study2(), DEMO_PERSON_ID)!.preAnswers) === JSON.stringify({ [pre.id]: pre.passing[0] }) && participationOf(study2(), DEMO_PERSON_ID)!.prescreener === 'passed')
  p.submitScreener(id2, DEMO_PERSON_ID, { q2: ['A watch'], q3: '2' }); p.decide(id2, DEMO_PERSON_ID, 'qualified', team)
  check('eligibility: they survive the rest of the screener being submitted', participationOf(study2(), DEMO_PERSON_ID)!.preAnswers?.[pre.id] === pre.passing[0])

  p.complete(id2, DEMO_PERSON_ID, me, { t1: 'Nothing much.' })
  clock += 6 * 60 * 60_000; p.tick()
  const mine2 = () => participationOf(study2(), DEMO_PERSON_ID)!
  check('no AutoPay: a completed participant is never paid on a timer', mine2().state === 'completed' && !mine2().paidAt && st().pending.length === 0)
  check('no AutoPay: the client cannot release it, nor the team before the study finishes', !p.processPayouts(id2, client).ok && !p.processPayouts(id2, team).ok && !mine2().paidAt)
  const notes = st().teamNotices.length
  check('study finishes: the client and the team are each notified once, and nothing is paid', p.moveStudy(id2, 'billing', team).ok && st().teamNotices.length === notes + 1 && st().clients.find((c) => c.id === DEMO_CLIENT_ID)!.notifications?.[0]?.studyId === id2 && !mine2().paidAt)
  check('the team processes the payout by hand', p.processPayouts(id2, team).ok && Boolean(mine2().paidAt) && !p.processPayouts(id2, team).ok)
  check('the client reads the notification', p.markClientNoticesRead(DEMO_CLIENT_ID).ok && st().clients.find((c) => c.id === DEMO_CLIENT_ID)!.notifications!.every((n) => n.read))
}

// ------------------------------------------------ the last loose ends
{
  p.reset(); clock = now.getTime()
  const people = st().people
  const pool = people.filter((x) => x.id !== DEMO_PERSON_ID)
  check('pictures: every seeded pool person has one, drawn and not a photograph; the demo participant starts with none', pool.every((x) => x.photo?.startsWith('data:image/svg+xml,')) && new Set(pool.map((x) => x.photo)).size > pool.length / 2 && !people.find((x) => x.id === DEMO_PERSON_ID)?.photo, `${pool.filter((x) => x.photo).length} of ${pool.length}`)
  check('profiles: every seeded person has work functions and skills', people.every((x) => x.profile.workFunctions.length > 0 && x.profile.skills.length > 0))
  const wide = formOf({ countries: [], gender: ['All Genders'], education: [], ageRanges: [], functions: '', industries: '' })
  const all = audiencePeople(st(), wide, now).length
  const byFunction = audiencePeople(st(), { ...wide, functions: 'Engineering' }, now)
  const bySkill = audiencePeople(st(), { ...wide, skills: 'triage, coaching' }, now)
  check('audience: a work function narrows it to people who do that', byFunction.length > 0 && byFunction.length < all && byFunction.every((x) => x.profile.workFunctions.includes('Engineering')), `${all} -> ${byFunction.length}`)
  check('audience: skills narrow it to people with any of them, ignoring case', bySkill.length > 0 && bySkill.length < all && bySkill.every((x) => x.profile.skills.some((k) => k === 'Triage' || k === 'Coaching')), `${all} -> ${bySkill.length}`)
  check('audience: a function nobody has matches nobody', audiencePeople(st(), { ...wide, functions: 'Beekeeping' }, now).length === 0)
  const weekly = buildStudy(formOf({ title: 't', type: 'diary', durationUnit: 'Week', frequency: 'Weekly', studyDuration: '5 weeks', minimumRequired: '4 weeks', tasks: asForm([{ kind: 'Multi-line input', text: 'What changed this week?' }]), tasksSubmitted: true }), now)
  check('diary: entries are counted in the unit chosen', weekly.ok && weekly.study.diary?.unit === 'Week' && weekly.study.diary.totalDays === 5 && weekly.study.diary.minDays === 4 && diaryWords(weekly.study.diary.unit).Unit === 'Week' && diaryWords(weekly.study.diary.unit).units === 'weeks' && diaryWords(undefined).Unit === 'Day')
}

// ------------------------------------------------ picture, intro video and their consent
{
  p.reset(); clock = now.getTime()
  const me = () => st().people.find((x) => x.id === DEMO_PERSON_ID)!
  const pts = () => personFigures(st(), DEMO_PERSON_ID, new Date(clock)).points
  const pic = 'data:image/jpeg;base64,/9j/4AAQ'
  const vid = { id: 'vid-test', name: 'me.webm', type: 'video/webm', bytes: 1234 }
  check('consent: a picture or video cannot be shared before there is one', !p.setMediaConsent(DEMO_PERSON_ID, 'photo', true).ok && !p.setMediaConsent(DEMO_PERSON_ID, 'video', true).ok)
  check('consent: only an image is taken as a picture', !p.setPicture(DEMO_PERSON_ID, 'data:text/html,<b>x</b>').ok)
  const p0 = pts()
  p.setPicture(DEMO_PERSON_ID, pic); const p1 = pts()
  p.setVideo(DEMO_PERSON_ID, vid); const p2 = pts()
  check('points: a picture earns 25 and a video 75', POINTS.PROFILE_PICTURE === 25 && POINTS.INTRO_VIDEO === 75 && p1 - p0 === 25 && p2 - p1 === 75, `${p0} -> ${p1} -> ${p2}`)
  check('consent: both start off, and with it off a client sees neither', !me().photoConsent && !me().videoConsent && sharedPhoto(me()) === undefined && sharedVideo(me()) === undefined && poolPerson(st(), me()).photo === undefined)
  p.setMediaConsent(DEMO_PERSON_ID, 'photo', true); p.setMediaConsent(DEMO_PERSON_ID, 'video', true)
  check('consent: on, a client sees the picture and the video', poolPerson(st(), me()).photo === pic && poolPerson(st(), me()).video?.id === 'vid-test')
  p.setMediaConsent(DEMO_PERSON_ID, 'photo', false)
  check('consent: each is its own: the picture off leaves the video shared', poolPerson(st(), me()).photo === undefined && poolPerson(st(), me()).video?.id === 'vid-test')
  p.setPicture(DEMO_PERSON_ID, null); p.setVideo(DEMO_PERSON_ID, null)
  check('points: removing the picture and the video does not take the points back', pts() === p2 && !me().photo && !me().video && !me().videoConsent)
  p.setPicture(DEMO_PERSON_ID, pic); p.setVideo(DEMO_PERSON_ID, vid)
  check('points: adding them again does not pay twice, and consent stays off', pts() === p2 && !me().photoConsent && !me().videoConsent)
}

// ------------------------------------------------ the clean-up brief: cancelling, restrictions, certificates, referral, add-ons
{
  p.reset(); clock = now.getTime()
  const meP = () => st().people.find((x) => x.id === DEMO_PERSON_ID)!
  const booked = st().studies.find((x) => participationOf(x, DEMO_PERSON_ID)?.state === 'scheduled')!
  const start = sessionStart(participationOf(booked, DEMO_PERSON_ID)!.booking!).getTime()
  const stateOf = () => participationOf(st().studies.find((x) => x.id === booked.id)!, DEMO_PERSON_ID)?.state
  clock = start - 2 * 3_600_000
  const inside = p.cancelSession(booked.id, DEMO_PERSON_ID)
  check('cancel: a participant cannot cancel inside 24 hours, and is told a no-show costs 4', !inside.ok && /24 hours/.test(inside.why ?? '') && /-4/.test(inside.why ?? '') && stateOf() === 'scheduled')
  clock = start - 48 * 3_600_000
  const early = fig().trustScore
  check('cancel: more than 24 hours before, they can, at -2', p.cancelSession(booked.id, DEMO_PERSON_ID).ok && fig().trustScore === early - 2)
  p.reset(); clock = start + 2 * 3_600_000
  const beforeNoShow = fig().trustScore
  check('cancel: not attending is a no-show at -4', p.markNoShow(booked.id, DEMO_PERSON_ID, client).ok && fig().trustScore === beforeNoShow - 4, `${beforeNoShow} -> ${fig().trustScore}`)
  p.reset(); clock = start - 2 * 3_600_000
  const beforeClient = fig().trustScore
  const events = meP().trustEvents.length
  check('cancel: the client cancels for free, even inside 24 hours, and the participant is told', p.cancelSessionFor(booked.id, DEMO_PERSON_ID, client, 'Interviewer unwell').ok && fig().trustScore === beforeClient && meP().trustEvents.length === events && meP().notifications[0]?.title === 'Study cancelled by client' && stateOf() !== 'scheduled')
  p.reset(); clock = start - 2 * 3_600_000
  check('cancel: the reason is required (22 Oct 2026)', !p.cancelSessionFor(booked.id, DEMO_PERSON_ID, team, '  ').ok && stateOf() === 'scheduled')
  check('cancel: the team cancels for free as well', p.cancelSessionFor(booked.id, DEMO_PERSON_ID, team, 'Room unavailable').ok && fig().trustScore === beforeClient && meP().trustEvents.length === events)
  check('cancel: the reason reaches the participant and is kept against the booking', /Room unavailable/.test(meP().notifications[0]?.body ?? '')
    && st().studies.find((x) => x.id === booked.id)!.participations.find((q) => q.personId === DEMO_PERSON_ID)!.cancellations?.at(-1)?.reason === 'Room unavailable')
  check('cancel: a participant cannot use the client route', !p.cancelSessionFor(booked.id, DEMO_PERSON_ID, { kind: 'participant', id: DEMO_PERSON_ID }, '').ok)

  p.reset(); clock = now.getTime()
  const open = st().studies.find((x) => status(x.id) === 'available')!
  const days = (iso?: string) => Math.round((new Date(iso ?? 0).getTime() - clock) / 86_400_000)
  const ladder: string[] = []
  for (let i = 0; i < 3; i++) {
    check(`restrict: offence ${i + 1} restricts for ${[15, 15, 30][i]} days`, p.setPersonStatus(DEMO_PERSON_ID, 'restricted', `Offence ${i + 1}`, team).ok && meP().status === 'restricted' && days(meP().statusNote?.until) === [15, 15, 30][i])
    ladder.push(`${days(meP().statusNote?.until)}d`)
    if (i === 0) {
      const n = meP().notifications[0]
      check('restrict: they are told the category and the end date', /Team decision/.test(`${n?.title} ${n?.body}`) && /until/i.test(`${n?.title} ${n?.body}`), `${n?.title} / ${n?.body}`)
      check('restrict: they cannot apply, redeem or withdraw', !p.startApplication(open.id, DEMO_PERSON_ID).ok && !p.redeem(DEMO_PERSON_ID, 1000).ok && !p.requestPayout(DEMO_PERSON_ID, 20, 'bank').ok)
    }
    clock = new Date(meP().statusNote!.until!).getTime() + 1000
    p.tick()
    if (i === 0) check('restrict: it ends on its date, and they are told', meP().status === 'active' && meP().notifications[0]?.title === 'Your restriction has ended' && p.startApplication(open.id, DEMO_PERSON_ID).ok)
  }
  check('restrict: the fourth offence deactivates', p.setPersonStatus(DEMO_PERSON_ID, 'restricted', 'Offence 4', team).ok && meP().status === 'deactivated' && (meP().restrictions?.length ?? 0) === 3, ladder.join(', '))
  const appeal = p.appealDeactivation(DEMO_PERSON_ID, 'Please look again.')
  check('restrict: a deactivated participant can appeal, as a ticket', appeal.ok && st().tickets.some((t) => t.id === (appeal as { id: string }).id && t.owner.id === DEMO_PERSON_ID))

  p.reset(); clock = now.getTime()
  const certId = meP().certificateId
  p.updatePerson(DEMO_PERSON_ID, { email: 'jonathan.new@example.com' })
  check('certificate: the ID is stored, and changing the email does not change it', Boolean(certId) && /^FI-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(certId!) && meP().certificateId === certId, certId)
  const fresh = p.signUpPerson('nobody.yet@example.com', 'Fresh123!')
  const newbie = st().people.find((x) => x.id === (fresh as { id: string }).id)!
  check('certificate: an unverified participant has none', !newbie.certificateId && !hasCertificate(newbie))
  const allIds = [...st().people.map((x) => x.certificateId), ...st().clients.map((x) => x.certificateId)].filter(Boolean)
  check('certificate: no two accounts share an ID; businesses are FI-C', new Set(allIds).size === allIds.length && st().clients.filter((c) => c.certificateId).every((c) => /^FI-C-/.test(c.certificateId!)))

  p.reset(); clock = now.getTime()
  const ptsBefore = fig().points
  p.signUpPerson('a.friend@example.com', 'Friend123!', referralCode(meP().name, meP().email))
  check('referral: the referrer earns 200 the moment the friend joins', fig().points === ptsBefore + POINTS.REFERRAL && meP().referrals[0]?.status === 'joined', `${ptsBefore} -> ${fig().points}`)

  // D38: Explore and applying follow the study's audience; every set category must match, any one value within it.
  p.reset(); clock = now.getTime()
  const see = (id: string) => respondentStudies(st(), DEMO_PERSON_ID).find((x) => x.id === id)!
  check('audience: a study for teachers is not listed for a physician, and applying is refused with the category', !see('st-02').fits && see('st-02').audienceMisses.includes('role') && !p.startApplication('st-02', DEMO_PERSON_ID).ok)
  check('audience: a study for physicians in healthcare is listed and open', see('st-01').fits && p.startApplication('st-01', DEMO_PERSON_ID).ok)
  check('audience: a study with no audience is open to everyone', !st().studies.find((x) => x.id === 'st-05')!.audience && see('st-05').fits && see('st-05').matchScore === undefined)
  check('audience: one value within a category is enough (Nurse, Physician or Clinician)', see('st-04').audienceMisses.length === 0)
  { const cl = st().studies.find((x) => x.id === 'st-02')!.clientId
    const invited = p.invite('st-02', DEMO_PERSON_ID, { kind: 'client', id: cl }).ok
    check('audience: a client\'s personal invitation lets someone outside the audience see the study and apply', invited && see('st-02').fits && p.startApplication('st-02', DEMO_PERSON_ID).ok) }

  // 23 Oct 2026: a real participant fills a diary entry only once its date has come; demo accounts are exempt.
  p.reset(); clock = now.getTime()
  {
    const made = p.signUpPerson('diary.person@example.com', 'Diary123!') as { id: string }
    p.updatePerson(made.id, { name: 'Dee Arry', onboarded: true, profile: { occupation: 'Nurse', industry: 'Healthcare', education: 'Bachelors Degree', gender: 'Female', dob: '06 / 05 / 1990' } })
    p.submitIdentity(made.id, 'Passport', { front: { name: 'f.jpg', bytes: 1 }, back: { name: 'b.jpg', bytes: 1 } })
    p.decideCheck(made.id, 'identity', 'verified', 'Checked.', team)
    const ok = p.startApplication('st-05', made.id).ok && p.submitScreener('st-05', made.id, { q1: 'Under 3 months', q2: 'Busy days' }).ok && p.decide('st-05', made.id, 'qualified', team).ok
    const day1 = p.completeDiaryDay('st-05', made.id, 1)
    const day2 = p.completeDiaryDay('st-05', made.id, 2)
    check('diary: a real participant can fill entry 1 on the day they are invited, not entry 2', ok && day1.ok && !day2.ok && /Day 2 opens on/.test((day2 as { why: string }).why), JSON.stringify(day2))
    const mine = respondentStudies(st(), made.id).find((x) => x.id === 'st-05')!
    check('diary: the locked entries carry the date they open', mine.diary!.locks[0] === null && Boolean(mine.diary!.locks[1]) && Boolean(mine.diary!.locks[4]))
    clock = now.getTime() + 3 * 86_400_000
    check('diary: once the dates have come, missed entries stay open to catch up on', p.completeDiaryDay('st-05', made.id, 3).ok && p.completeDiaryDay('st-05', made.id, 2).ok && !p.completeDiaryDay('st-05', made.id, 5).ok)
    clock = now.getTime()
    const demo = respondentStudies(st(), DEMO_PERSON_ID).find((x) => x.id === 'st-31')!
    check('diary: a demo account has every entry open at once', demo.diary!.locks.every((x) => x === null) && p.completeDiaryDay('st-31', DEMO_PERSON_ID, 5).ok)
  }

  // 23 Oct 2026: the seed's "today" is counted from the moment it is built, so whatever the hour, what has happened is in the past
  // and a session whose code was entered has started.
  for (const hour of [6, 23]) {
    const built = new Date(now); built.setHours(hour, 5, 0, 0)
    const seed = buildSeed(built)
    const t = built.getTime()
    const future: string[] = []
    for (const study of seed.studies) for (const x of study.participations) {
      for (const e of x.events) if (new Date(e.at).getTime() > t) future.push(`${study.id} ${x.personId} ${e.label}`)
      if (x.code?.byParticipant && x.booking && sessionStart(x.booking).getTime() > t) future.push(`${study.id} ${x.personId} code entered before its session`)
    }
    for (const tk of seed.tickets) for (const m of tk.messages) if (new Date(m.at).getTime() > t) future.push(`${tk.id} message`)
    for (const person of seed.people) if (new Date(person.lastActiveAt).getTime() > t) future.push(`${person.id} last active`)
    // Every field that records something that has already happened, anywhere in the seed.
    const PAST = new Set(['at', 'createdAt', 'submittedAt', 'firstSubmittedAt', 'approvedAt', 'completedAt', 'paidAt', 'decidedAt', 'flaggedAt', 'joinedAt', 'lastActiveAt', 'releasedAt', 'stoppedAt', 'lastActivityAt', 'pictureAddedAt', 'videoAddedAt', 'fullProfileAt', 'readAt'])
    const walk = (v: unknown, path: string) => {
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
        if (PAST.has(k) && typeof x === 'string' && x && new Date(x).getTime() > t + 1000) future.push(`${path}.${k}`)
        walk(x, `${path}.${k}`)
      }
    }
    walk(seed, 'seed')
    check(`seed: built at ${hour}:05, nothing that happened is dated after it, and every entered code's session has started`, future.length === 0, future.slice(0, 4).join('; '))
  }

  // 23 Oct 2026: the 14 day payout promise, derived: days left from when the study ended, overdue past them, overdue first.
  p.reset(); clock = now.getTime()
  {
    const cases = payoutsToProcess(st(), now)
    if (cases.length >= 2) {
      // A copy of the state with two waiting studies' end dates moved: one ended 20 days ago, one 3 days ago.
      const state = structuredClone(st())
      const [a, b] = [cases[0]!.study.id, cases[1]!.study.id]
      const at = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()
      for (const x of state.studies) { if (x.id === a) { x.stoppedAt = at(20) } if (x.id === b) { x.stoppedAt = at(3) } }
      const after = payoutsToProcess(state, now)
      const late = after.find((c) => c.study.id === a)!, fresh = after.find((c) => c.study.id === b)!
      check('payouts: days left counts the 14 from when the study ended, and past them it is overdue', fresh.daysLeft === 11 && !fresh.overdue && late.daysLeft === -6 && late.overdue, `${fresh.daysLeft} / ${late.daysLeft}`)
      check('payouts: overdue sorts to the top', after[0]!.study.id === a)
      const dash = consoleDashboard(state)
      check('payouts: the dashboard counts overdue ones once, in their own group, and the queue total is unchanged', dash.payoutsOverdue.some((c) => c.study.id === a) && !dash.payoutsDue.some((c) => c.study.id === a) && dash.payoutsOverdue.length + dash.payoutsDue.length === dash.payouts.length && dash.tabs.manage === dash.noShows.length + dash.reports.length + dash.payouts.length)
    } else check('payouts: the seed has studies waiting to be paid', false, String(cases.length))
  }

  // Participant passwords: a front-end stand-in, but every screen that asks for one is checked against it.
  p.reset(); clock = now.getTime()
  const dup = p.signUpPerson(DEMO_PERSON_EMAIL.toUpperCase(), 'Other123!')
  check('auth: signing up with an email already on the platform is refused and opens nothing', !dup.ok && st().people.filter((x) => x.email.toLowerCase() === DEMO_PERSON_EMAIL).length === 1, JSON.stringify(dup))
  const made = p.signUpPerson('auth.person@example.com', 'First123!') as { ok: true; id: string }
  const people0 = st().people.length
  const wrong = p.signInPerson('auth.person@example.com', 'Nope123!')
  check('auth: a wrong password fails and resets nothing', !wrong.ok && st().people.length === people0 && Boolean(st().people.find((x) => x.id === made.id)))
  const right = p.signInPerson('auth.person@example.com', 'First123!')
  check('auth: the right password signs in that account, with no reset', right.ok && (right as { id: string }).id === made.id && !(right as { reset: boolean }).reset && st().people.length === people0)
  check('auth: change password needs the current one', !p.changePersonPassword(made.id, 'Nope123!', 'Second123!').ok && p.changePersonPassword(made.id, 'First123!', 'Second123!').ok && p.signInPerson('auth.person@example.com', 'Second123!').ok && !p.signInPerson('auth.person@example.com', 'First123!').ok)
  check('auth: a reset password is saved', p.resetPersonPassword('auth.person@example.com', 'Third123!').ok && p.signInPerson('auth.person@example.com', 'Third123!').ok)
  const closeWrong = p.closeAccount(made.id, 'Nope123!')
  check('auth: closing the account with a wrong password is refused and leaves it active', !closeWrong.ok && st().people.find((x) => x.id === made.id)!.status === 'active')
  check('auth: closing it with the right password deactivates it, and it can no longer sign in', p.closeAccount(made.id, 'Third123!').ok && st().people.find((x) => x.id === made.id)!.status === 'deactivated' && !p.signInPerson('auth.person@example.com', 'Third123!').ok)
  const demo = p.signInPerson(DEMO_PERSON_EMAIL, DEMO_PERSON_PASSWORD)
  check('auth: the demo login resets the platform', demo.ok && (demo as { reset: boolean }).reset && !st().people.some((x) => x.id === made.id))

  const per = (type: Parameters<typeof quoteStudy>[0], t: { roles?: boolean; skills?: boolean }) => quoteStudy(type, 10, 50, t).rates.recruitingPer
  check('add-ons: roles targeting adds $25, skills $20, and one type-or-roles add-on at most', per('survey', {}) === 25 && per('survey', { roles: true }) === 50 && per('survey', { skills: true }) === 45 && per('survey', { roles: true, skills: true }) === 70 && per('video_call', { roles: true }) === 50 && per('video_call', { skills: true }) === 70, `${per('survey', {})} ${per('survey', { roles: true })} ${per('survey', { skills: true })} ${per('survey', { roles: true, skills: true })}`)
  const roled = buildStudy(formOf({ title: 't', type: 'survey', ...SURVEY, roles: 'Nurse', skills: 'Python' }), now)
  check('add-ons: a study built with roles and skills is priced with both', roled.ok && roled.study.rates?.recruitingPer === 70, JSON.stringify(roled.ok && roled.study.rates))
}

// ------------------------------------------------ tax ID, cards, required audience fields, several education levels
{
  p.reset(); clock = now.getTime()
  const newcomer = p.signUpClient({ name: 'Ada Stone', email: 'ada@stonelabs.com' })
  const cid = (newcomer as { id: string }).id
  const them = () => st().clients.find((c) => c.id === cid)!
  check('tax ID: optional; a business with a website and no tax ID passes the check', newcomer.ok && p.updateClient(cid, { company: 'Stone Labs', website: 'https://stonelabs.com', role: 'Founder' }).ok && them().taxId === '' && them().business.state === 'verified')
  check('tax ID: kept when given', p.updateClient(cid, { taxId: '12-3456789' }).ok && them().taxId === '12-3456789')
  const theirs = formOf({ ...SURVEY, title: 'Card check' })
  const blocked = p.submitStudy(cid, theirs)
  check('card: a client with no card cannot publish, and nothing is created', !blocked.ok && /Add a card/.test(blocked.why) && !st().studies.some((x) => x.title === 'Card check'), blocked.ok ? '' : blocked.why)
  check('card: with a card added they can', p.addCard(cid, { brand: 'VISA', last4: '1111', expires: 'Expires 09/29' }).ok && p.submitStudy(cid, theirs).ok)
  check('card: it can be edited, then replaced, and stays the default', p.updateCard(cid, '1111', { brand: 'VISA', last4: '1111', expires: 'Expires 10/30' }).ok && them().cards[0]!.expires === 'Expires 10/30'
    && p.updateCard(cid, '1111', { brand: 'Mastercard', last4: '2222', expires: 'Expires 01/31' }).ok && them().cards.length === 1 && them().cards[0]!.last4 === '2222' && them().cards[0]!.isDefault === true)
  const why = (f: Partial<StudyForm>) => { const r = buildStudy(formOf({ title: 't', ...f }), now); return r.ok ? 'ok' : r.why }
  check('audience: work function and industry are required', /work function/.test(why({ functions: ' ' })) && /industry/.test(why({ industries: '' })), `${why({ functions: ' ' })} / ${why({ industries: '' })}`)
  check('audience: role and skills are optional', why({ roles: '', skills: '' }) === 'ok')
  const base = formOf({ countries: [], gender: ['All Genders'], ageRanges: [], functions: '', industries: '' })
  const bachelors = audiencePeople(st(), { ...base, education: ["Graduate or Bachelor's"] }, now).length
  const both = audiencePeople(st(), { ...base, education: ["Graduate or Bachelor's", "Master's degree"] }, now).length
  const masters = audiencePeople(st(), { ...base, education: ["Master's degree"] }, now).length
  check('education: several levels are accepted together', both === bachelors + masters && bachelors > 0, `${bachelors} + ${masters} = ${both}`)
  check('education: shown as every level ticked', summarise(st(), { ...base, education: ["Graduate or Bachelor's", 'Doctorate'] }, now).audience.some((a) => a.label === 'Education' && a.value === "Graduate or Bachelor's, Doctorate"))
  check('education: a form saved with one level reopens as a list', formFromStudy({ ...st().studies[0]!, form: { ...base, education: 'Doctorate' as unknown as string[] } }).education.join() === 'Doctorate')
}

// ------------------------------------------------ gender takes several
{
  p.reset(); clock = now.getTime()
  const base = formOf({ countries: [], ageRanges: [], functions: '', industries: '', education: [] })
  const of = (g: string[]) => audiencePeople(st(), { ...base, gender: g }, now).length
  const men = of(['Male']), women = of(['Female']), both = of(['Male', 'Female']), all = of(['All Genders'])
  check('gender: several genders are accepted together, and All Genders is everyone', both === men + women && men > 0 && women > 0 && all >= both, `${men} + ${women} = ${both}; all ${all}`)
  check('gender: a form saved with one gender reads as a list', formFromStudy({ ...st().studies[0]!, form: { ...base, gender: 'Female' as unknown as string[] } }).gender.join() === 'Female')
}

// ------------------------------------------------ ethnicity and area type (21 Oct 2026)
{
  p.reset(); clock = now.getTime()
  const base = formOf({ countries: [], gender: ['All Genders'], ageRanges: [], functions: '', industries: '', education: [] })
  const of = (patch: Partial<typeof base>) => audiencePeople(st(), { ...base, ...patch }, now)
  const all = of({}).length
  const asian = of({ ethnicity: ['Asian'] }), white = of({ ethnicity: ['White'] }), either = of({ ethnicity: ['Asian', 'White'] })
  check('ethnicity: any one ticked matches, and only people who gave it', either.length === asian.length + white.length && asian.length > 0 && white.length > 0 && asian.every((x) => x.profile.ethnicity === 'Asian'), `${asian.length} + ${white.length} = ${either.length}`)
  check('ethnicity: "Prefer not to say" is not a target and matches nothing set', !AUDIENCE_LISTS.ethnicity.includes('Prefer not to say') && of({ ethnicity: [...AUDIENCE_LISTS.ethnicity] }).every((x) => x.profile.ethnicity !== 'Prefer not to say'))
  const urban = of({ areaTypes: ['Urban'] }).length, rural = of({ areaTypes: ['Rural'] }).length
  check('area type: matches the profile, and a category left empty is ignored', urban > 0 && rural > 0 && of({ areaTypes: ['Urban', 'Rural'] }).length === urban + rural && of({ areaTypes: [] }).length === all, `${urban} urban, ${rural} rural of ${all}`)
  check('categories combine: both set narrows to people matching each', of({ ethnicity: ['Asian'], areaTypes: ['Urban'] }).every((x) => x.profile.ethnicity === 'Asian' && x.profile.areaType === 'Urban'))
  check('ethnicity and area type show as pills', summarise(st(), { ...base, ethnicity: ['White'], areaTypes: ['Rural'] }, now).audience.some((a) => a.label === 'Ethnicity' && a.value === 'White') && summarise(st(), { ...base, ethnicity: ['White'], areaTypes: ['Rural'] }, now).audience.some((a) => a.label === 'Area Type'))
  const priced = (f: typeof base) => { const b = buildStudy({ ...f, title: 'Price check', description: 'A study priced twice', functions: 'Product', industries: 'Healthcare' }, now); return b.ok ? JSON.stringify(b.study.rates) : `refused: ${b.why}` }
  const d = diffForms({ ...base, ethnicity: [] , areaTypes: [] }, { ...base, ethnicity: ['Asian'], areaTypes: ['Rural'] })
  check('revisions record ethnicity and area type changes', d.some((c) => c.path.join('/') === 'Audience/Ethnicity') && d.some((c) => c.path.join('/') === 'Audience/Area Type'), JSON.stringify(d))
  check('neither changes the price', priced({ ...base, ethnicity: ['White'], areaTypes: ['Rural'] }) === priced(base) && !priced(base).startsWith('refused'), priced(base))
}

// A client cannot be deactivated while a study runs or an invoice is unpaid (22 Oct 2026).
{
  const busy = st().clients.find((c) => clientDeactivationBlockers(st(), c.id).studies.length > 0 && c.status !== 'deactivated')!
  const firstStudy = clientDeactivationBlockers(st(), busy.id).studies[0]!
  const refused = p.setClientStatus(busy.id, 'deactivated', 'Testing', team)
  check('deactivate client: refused while a study runs, naming it', !refused.ok && refused.why.includes(firstStudy) && st().clients.find((c) => c.id === busy.id)!.status !== 'deactivated', refused.ok ? '' : refused.why)
  const owing = st().clients.find((c) => clientDeactivationBlockers(st(), c.id).invoices.length > 0 && c.status !== 'deactivated')
  if (owing) {
    const r = p.setClientStatus(owing.id, 'deactivated', 'Testing', team)
    check('deactivate client: refused while an invoice is unpaid, naming it', !r.ok && r.why.includes(clientDeactivationBlockers(st(), owing.id).invoices[0]!.split(' ')[0]!), r.ok ? '' : r.why)
  }
  const free = st().clients.find((c) => !clientDeactivationRefusal(st(), c.id) && c.status !== 'deactivated')
  if (free) check('deactivate client: allowed with nothing running or owed', p.setClientStatus(free.id, 'deactivated', 'Testing', team).ok && p.setClientStatus(free.id, 'active', 'Back', team).ok)
}

// Pricing & Rewards saves (22 Oct 2026, policy v2 section 10): master admin only; a change applies from now on
// and moves nothing already earned or agreed.
{
  const sub: Actor = { kind: 'team', id: 'tm-maya' }
  const trust0 = settingsAt(st(), 'trust')
  check('settings: a sub-admin cannot change them', !p.changeSettings('trust', { ...trust0, noShow: -6 }, sub).ok)
  check('settings: a deduction cannot add to the score', !p.changeSettings('trust', { ...trust0, noShow: 3 }, team).ok)
  const people = st().people.slice(0, 25).map((x) => x.id)
  const scores = () => people.map((id) => personFigures(st(), id).trustScore).join(',')
  const pts = () => people.map((id) => personFigures(st(), id).points).join(',')
  const before = { scores: scores(), points: pts(), rates: JSON.stringify(st().studies.map((x) => x.rates)) }
  check('settings: a master admin can change the Trust Score values', p.changeSettings('trust', { ...trust0, noShow: -6, star5: 5, onboarding: 55 }, team).ok && settingsAt(st(), 'trust').noShow === -6)
  check('settings: no existing score moves', scores() === before.scores, `${before.scores} -> ${scores()}`)
  const points0 = settingsAt(st(), 'points')
  check('settings: points change, no balance moves', p.changeSettings('points', { ...points0, studyCompletion: 40 }, team).ok && pts() === before.points)
  const fees0 = settingsAt(st(), 'fees')
  const quote = () => quoteStudy('survey', 10, 100).platformFee
  check('settings: fees change, every agreed price stays', p.changeSettings('fees', { ...fees0, platform: 150, addOns: fees0.addOns.filter((a) => a.id !== 'ao-skills') }, team).ok
    && JSON.stringify(st().studies.map((x) => x.rates)) === before.rates)
  check('settings: a new quote uses the new fees', quote() === 150, String(quote()))
  check('settings: every change is recorded with who and when', (st().settingsLog ?? []).filter((c) => c.by === MASTER_ADMIN_ID && c.group !== 'rateCard').length === 3 && st().activity.some((a) => /Changed the client fees/.test(a.what)))
  // A no-show after the change is valued at the new figure.
  {
    const victim = st().studies.flatMap((x) => x.participations.filter((q) => q.state === 'scheduled').map((q) => ({ study: x.id, person: q.personId })))[0]
    if (victim) {
      const was = personFigures(st(), victim.person).trustScore
      const r = p.markNoShow(victim.study, victim.person, team)
      check('settings: a no-show after the change costs the new value', !r.ok || personFigures(st(), victim.person).trustScore === Math.max(TRUST.MIN, was - 6), `${was} -> ${personFigures(st(), victim.person).trustScore}`)
    }
  }
  p.changeSettings('trust', trust0, team); p.changeSettings('points', points0, team); p.changeSettings('fees', fees0, team)
  // 23 Oct 2026: Participants Fees save too; a withdrawal and a redemption keep the values they were made at.
  {
    const part0 = settingsAt(st(), 'participants')
    check('participants: the starting values are $1.99 a withdrawal and $1 for 100 coins', part0.withdrawal === 1.99 && part0.pointsValue === 1)
    check('participants: a negative fee and a zero points value are refused', !p.changeSettings('participants', { ...part0, withdrawal: -1 }, team).ok && !p.changeSettings('participants', { ...part0, pointsValue: 0 }, team).ok)
    const fee = () => payoutRows(personById(st(), DEMO_PERSON_ID)).map((r) => r.fee).join(',')
    const red = () => redeemRows(personById(st(), DEMO_PERSON_ID)).map((r) => r.amount).join(',')
    const was = { fee: fee(), red: red() }
    check('participants: a master admin changes them and they apply from now on', p.changeSettings('participants', { withdrawal: 2.5, pointsValue: 2 }, team).ok && FEES.WITHDRAWAL === 2.5 && REDEEM.PER_USD === 50)
    check('participants: earlier withdrawals and redemptions keep their values', fee() === was.fee && red() === was.red, `${was.fee}/${was.red} -> ${fee()}/${red()}`)
    p.changeSettings('participants', part0, team)
    check('participants: put back', FEES.WITHDRAWAL === 1.99 && REDEEM.PER_USD === 100)
  }
}

// 23 Oct 2026: Change CPI Rate, the team's per-study rate.
{
  p.reset(); clock = now.getTime()
  const rv = () => st().studies.find((x) => x.id === 'st-remote')!
  const live = () => st().studies.find((x) => x.id === 'st-goal')!
  check('cpi: only the team changes it, and the rate must be more than $0', !p.setStudyRate('st-remote', 300, { kind: 'client', id: DEMO_CLIENT_ID }).ok && !p.setStudyRate('st-remote', 0, team).ok)
  check('cpi: in review it reprices the study outright; the deposit taken stays', p.setStudyRate('st-remote', 300, team).ok && rv().ratePeriods!.length === 1 && billing(rv()).totalCost === 300 * rv().required && billing(rv()).deposit === rv().payments.filter((x) => x.kind === 'deposit').reduce((n, x) => n + x.amount, 0))
  const periods = live().ratePeriods!.length
  check('cpi: on a live study a new period starts, for those who complete from now', p.setStudyRate('st-goal', 320, team).ok && live().ratePeriods!.length === periods + 1 && live().ratePeriods!.at(-1)!.rate === 320 && billing(live()).plan.rate === 320)
  check('cpi: a completed study cannot be repriced', !p.setStudyRate('cp-1', 300, team).ok)
}



// 24 Oct 2026: the rate card, the team's July 2026 sheet, read, quoted, uploaded and exported.
{
  p.reset(); clock = now.getTime()
  const file = (f: string) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
  check('rate card: the embedded files are the CSVs at the root', RATE_CARD_SEGMENTS_CSV === file('rate-card.csv') && RATE_CARD_FEES_CSV === file('rate-card-fees.csv'))
  const segs = readCsv(file('rate-card.csv'))!, fees = readCsv(file('rate-card-fees.csv'))!
  const rawRows = parseCsv(file('rate-card.csv')).length - 1, rawFees = parseCsv(file('rate-card-fees.csv')).length - 1
  check('rate card: every segment row is read, none skipped or unreadable', segs.kind === 'segments' && segs.segments.length === rawRows && rawRows === 14 && segs.unreadable.length === 0 && segs.skipped.length === 0, `${segs.segments.length} of ${rawRows}`)
  check('rate card: every fee row is read, the unquoted comma stays in its note', fees.kind === 'fees' && fees.fees.length === rawFees && rawFees === 19 && fees.fees.find((f) => f.item === 'Client requests lower incentive than recommended')!.note === 'Provide a two option quote: recommended incentive with its timeline, and their requested incentive as best efforts')
  const niche = segs.segments.find((x) => x.level === 'Level 2 Niche Consumer' && x.sizeBand === '1-25')!
  check('rate card: a range keeps both ends, a blank stays blank', niche.cpr.min === 135 && niche.cpr.max === 165 && niche.incentive.min === 125 && niche.incentive.max === 150 && niche.cprNote === 'remote; 200 in person'
    && segs.segments.find((x) => x.segment === 'Re-recruiting with no rescreening or grids')!.incentive.min === null)
  // Upload onto an empty card: every row lands; then onto the same card: everything matches, nothing changes.
  const first = previewUpload(EMPTY_RATE_CARD, [segs, fees])
  check('upload: onto an empty card every row is added', first.added.length === rawRows + rawFees && first.matched.length === 0 && first.unreadable.length === 0)
  const again = previewUpload(first.next, [segs, fees])
  check('upload: the same file again matches every row by its labels and changes nothing', again.added.length === 0 && again.matched.length === rawRows + rawFees && again.matched.every((m) => m.changes.length === 0))
  // Round trip: export and read back, field for field.
  const back = { s: readCsv(segmentsCsv(first.next))!, f: readCsv(feesCsv(first.next))! }
  const strip = (x: unknown) => JSON.stringify(x, (k, v) => (k === 'id' ? undefined : v))
  check('export: the rate card round-trips through CSV, field for field', strip(back.s.segments) === strip(segs.segments) && strip(back.f.fees) === strip(fees.fees))
  check('export: only the note with a comma is quoted', feesCsv(first.next).split('\n').filter((l) => l.includes('"')).length === 1)
  // A changed and an unreadable cell are reported, never guessed.
  const edited = readCsv(file('rate-card.csv').replace('Level 1 Basic Consumer,IR 50% plus,1-25,500,500', 'Level 1 Basic Consumer,IR 50% plus,1-25,550,five hundred'))!
  const pv = previewUpload(first.next, [edited])
  const basic = pv.matched.find((m) => m.label === 'General Population Consumer, Level 1 Basic Consumer, 1-25')!
  check('upload: a changed cell is shown before saving, an unreadable one is left blank and listed', basic.changes.some((c) => c.field === 'Setup' && c.from === '500' && c.to === '550 up to blank') && pv.unreadable.length === 1 && pv.unreadable[0]!.raw === 'five hundred')
  check('upload: a bad header is not a rate card', readCsv('name,price\nx,1') === null)
  // The three the team asked for: 25 participants, one hour, remote, at the lower end of each range.
  const card = first.next
  const id = (level: string, segment?: string) => card.segments.find((x) => (segment ? x.segment === segment : x.level === level) && x.sizeBand === '1-25')!.id
  const basicQ = quoteFrom(card, id('Level 1 Basic Consumer'), 25, 1)!, nicheQ = quoteFrom(card, id('Level 2 Niche Consumer'), 25, 1)!, b2bQ = quoteFrom(card, id('', 'B2B upper level'), 25, 1)!
  check('quote: 25 basic consumers, one hour: $500 + $125 x 25 + $100 x 25 = $6,125, $245 per interview', basicQ.total === 6125 && basicQ.cpi === 245 && basicQ.incentive === 100, `${basicQ.total} / ${basicQ.cpi}`)
  check('quote: 25 niche consumers, one hour: $750 + $135 x 25 + $125 x 25 = $7,250, $290 per interview (top of range $345)', nicheQ.total === 7250 && nicheQ.cpi === 290 && nicheQ.high.cpi === 345, `${nicheQ.total} / ${nicheQ.cpi} / ${nicheQ.high.cpi}`)
  check('quote: 25 B2B upper level, one hour: $1,000 + $200 x 25 + $300 x 25 = $13,500, $540 per interview (top $640)', b2bQ.total === 13500 && b2bQ.cpi === 540 && b2bQ.high.cpi === 640, `${b2bQ.total} / ${b2bQ.cpi} / ${b2bQ.high.cpi}`)
  const screener = card.fees.find((f) => f.item === 'Screener creation')!.id
  check('quote: a flat add-on the team picks is added once', quoteFrom(card, id('Level 1 Basic Consumer'), 25, 1, [screener])!.total === 6625)
  check('quote: a segment with no incentive guide cannot be quoted', quoteFrom(card, card.segments.find((x) => x.segment.startsWith('Re-recruiting'))!.id, 10, 1) === null)
  check('rate card: the seed starts from these files, as its first version', JSON.stringify(RATE_CARD.current) === JSON.stringify({ segments: segs.segments, fees: fees.fees }) && (st().settingsLog ?? []).some((c) => c.group === 'rateCard' && c.source?.includes('July 2026')))
}

// 24 Oct 2026: the incentive is proposed from the rate card, set by the team, and kept per period (D41).
{
  p.reset(); clock = now.getTime()
  const made = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Incentive study', participants: '20', incentive: 700 }))
  const x = () => st().studies.find((y) => made.ok && y.id === made.id)!
  check('incentive: a new study is proposed the rate card\'s guide, not the form\'s $700', made.ok && x().rates.incentivePer > 0 && x().rates.incentivePer !== 700 && x().incentivePeriods!.length === 1 && !!x().quote, made.ok ? String(x().rates.incentivePer) : made.why)
  check('incentive: only the team sets it, and not $0', !p.setStudyIncentive(x().id, 150, { kind: 'client', id: DEMO_CLIENT_ID }).ok && !p.setStudyIncentive(x().id, 0, team).ok)
  check('incentive: in review the team replaces the proposal', p.setStudyIncentive(x().id, 150, team).ok && x().rates.incentivePer === 150 && x().incentivePeriods!.length === 1)
  check('incentive: above the CPI is allowed (the console warns)', p.setStudyIncentive(x().id, currentRate(x()) + 50, team).ok)
  const live = st().studies.find((y) => y.id === 'st-pay')!
  const paidBefore = live.participations.filter((q) => q.paidAt).map((q) => earnedOf(live, q)).join()
  check('incentive: on a live study a new period starts; anyone already paid keeps what they were paid', p.setStudyIncentive('st-pay', live.rates.incentivePer + 25, team).ok
    && st().studies.find((y) => y.id === 'st-pay')!.incentivePeriods!.length >= 1
    && (() => { const now2 = st().studies.find((y) => y.id === 'st-pay')!; return now2.participations.filter((q) => q.paidAt).map((q) => earnedOf(now2, q)).join() === paidBefore })())
  // A study the rate card cannot price is not taken; one in review with no incentive cannot go live.
  const card = RATE_CARD.current
  RATE_CARD.current = EMPTY_RATE_CARD
  const unpriced = p.submitStudy(DEMO_CLIENT_ID, formOf({ title: 'Unpriced', participants: '10' }))
  RATE_CARD.current = card
  check('incentive: with no rate card to price it, a study is not taken', !unpriced.ok && /cannot be priced/.test(unpriced.why))
  // Applying a rate card quote sets both figures.
  const seg = RATE_CARD.current.segments.find((s2) => s2.level === 'Level 2 Niche Consumer' && s2.sizeBand === '1-25')!
  check('quote: applying a rate card quote sets the CPI and the incentive', p.applyRateCardQuote(x().id, seg.id, 1, [], team).ok && currentRate(x()) === quoteFrom(RATE_CARD.current, seg.id, 20, 1)!.cpi && x().rates.incentivePer === 125)
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
