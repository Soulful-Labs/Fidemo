import { ageFrom, tierOf } from './derive'
import { priceStudy } from './platform'
import { buildScreener, buildTasks } from './questions'
import type { AuthoredKind } from './questions'
import type { Location, Person, PlatformState, PreScreenQuestion, Question, RepeatRule, Session, Study, StudySetup, StudyType, Tier } from './types'

/**
 * Everything a client enters in the Create flow, in one record.
 *
 * The client app's five steps edit this and nothing else. A draft study keeps
 * it whole, so it reopens exactly as it was left; a submitted study keeps it
 * too, beside the fields the respondent app and the console read, which
 * `buildStudy` works out from it. Nothing a study is submitted with comes
 * from another study or from a default the client never saw.
 */
export type FormType = 'survey' | 'video_call' | 'in_person' | 'diary'

export interface FormOption { id: string; text: string; mark: string }
/** A question as the builders hold it, half-built ones included. */
export interface FormQuestion {
  id: string
  label: string
  kind: AuthoredKind
  text: string
  options: FormOption[]
  min?: string; max?: string; gap?: string; showGap?: boolean
  formats?: string; maxFiles?: string
  matrixKind?: string
  columns?: string[]
  rows?: string[]
}

/** "09:00 AM" to "05:30 PM". */
export interface TimeWindow { from: string; to: string }
export interface FormAddress { id: string; title: string; detail: string }
/** A group session: the day as YYYY-MM-DD and the time it starts. */
export interface FormSession { id: string; date: string; time: string }
/** Dates whose hours differ from the weekly ones. No windows means unavailable all day. */
export interface FormOverride { id: string; from: string; to: string; windows: TimeWindow[] }

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export interface StudyForm {
  // 1. About
  type: FormType
  groupVideo: boolean
  groupInPerson: boolean
  /** Minutes. */
  duration: number
  /** "DD / MM / YYYY", optional. */
  endDate: string
  title: string
  description: string
  /** The chosen picture's file name. */
  thumbnail: string
  /** The picture itself, as the browser read it (a data URL, scaled down). It is the study's image everywhere. */
  image: string
  // 2. Audience
  participants: string
  countries: string[]
  gender: string
  education: string
  ageRanges: string[]
  roles: string
  functions: string
  skills: string
  industries: string
  condition: 'na' | 'fresh' | 'never'
  tiers: string
  // 3. Screener
  questions: FormQuestion[]
  // 4. Study
  incentive: number
  autoPay: boolean
  /** A survey's questions, or the questions a diary asks on each entry. */
  tasks: FormQuestion[]
  /** The form builder has been submitted. */
  tasksSubmitted: boolean
  durationUnit: string
  frequency: string
  studyDuration: string
  minimumRequired: string
  buffer: string
  notice: string
  seats: string
  /** One-to-one studies: the hours offered on each weekday. A day with none is unavailable. */
  hours: Partial<Record<Weekday, TimeWindow[]>>
  overrides: FormOverride[]
  addresses: FormAddress[]
  sessions: FormSession[]
  /** The availability composer has been submitted. */
  availabilitySet: boolean
}

export const MARKS: Partial<Record<AuthoredKind, string[]>> = {
  'Single-select': ['Correct', 'Incorrect'],
  'Multi-select': ['May Select', 'Must Select', 'Incorrect'],
}
/** A survey's or diary's options qualify or disqualify, where a screener's are correct or incorrect (client Figma 1518:92064). */
export const TASK_MARKS = ['Qualify', 'Disqualify']

let seq = 0
export const formId = (prefix = 'x') => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`

/** A fresh question of a kind, with the options the frame starts one with. */
export function blankQuestion(label: string, kind: AuthoredKind = 'Single-select', marks: string[] = MARKS[kind] ?? []): FormQuestion {
  return {
    id: formId('q'), label, kind, text: '',
    options: kind === 'Ranking' ? [0, 1].map(() => ({ id: formId('o'), text: '', mark: '' })) : marks.map((m) => ({ id: formId('o'), text: '', mark: m })),
    min: '', max: '', gap: '', showGap: true,
    formats: '', maxFiles: '1', matrixKind: 'Single-select/row',
    columns: ['1', ''], rows: ['A', ''],
  }
}

/** The window a day opens with, as the Weekly Hours card draws it. It offers no time until its end is moved after its start. */
export const BLANK_WINDOW: TimeWindow = { from: '12:00 AM', to: '12:00 AM' }

/**
 * A new study, as the Create frames draw the flow before anything is typed:
 * the nine empty screener questions, one per answer type, and Monday to
 * Friday switched on. No address, session or override: those are the client's
 * to add.
 */
export function blankForm(): StudyForm {
  return {
    type: 'in_person', groupVideo: false, groupInPerson: false,
    duration: 40, endDate: '', title: '', description: '', thumbnail: '', image: '',
    participants: '10',
    countries: ['United States of America', 'United Kingdom'],
    gender: 'All Genders', education: "Graduate or Bachelor's",
    ageRanges: ['18–20', '21–29'],
    roles: '', functions: '', skills: '', industries: '',
    condition: 'na', tiers: '',
    questions: [
      blankQuestion('Pre-screener - Q1', 'Single-select'), blankQuestion('Pre-screener - Q2', 'Multi-select'),
      blankQuestion('Pre-screener - Q3', 'Single-line input'), blankQuestion('Q4', 'Number input'),
      blankQuestion('Q5', 'Multi-line input'), blankQuestion('Q6', 'Slider'), blankQuestion('Q7', 'Ranking'),
      blankQuestion('Q8', 'File Upload'), blankQuestion('Q9', 'Mattrix'),
    ],
    incentive: 700, autoPay: true, tasks: [], tasksSubmitted: false,
    durationUnit: 'Day', frequency: 'Every 2 days', studyDuration: '5 days', minimumRequired: '4 days',
    buffer: '15 minutes', notice: '10                    Minutes', seats: '10 seats',
    hours: Object.fromEntries(WEEKDAYS.slice(0, 5).map((d) => [d, [{ ...BLANK_WINDOW }]])),
    overrides: [], addresses: [], sessions: [],
    availabilitySet: false,
  }
}

// ------------------------------------------------------------------- reading

export const studyTypeOf = (f: Pick<StudyForm, 'type' | 'groupVideo' | 'groupInPerson'>): StudyType =>
  f.type === 'video_call' && f.groupVideo ? 'group_video_call' : f.type === 'in_person' && f.groupInPerson ? 'in_person_group' : f.type

const isGroup = (t: StudyType) => t === 'group_video_call' || t === 'in_person_group'
const isInPerson = (t: StudyType) => t === 'in_person' || t === 'in_person_group'
const isOneToOne = (t: StudyType) => t === 'video_call' || t === 'in_person'

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const firstNumber = (s: string) => { const m = /\d+/.exec(s); return m ? Number(m[0]) : NaN }
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Minutes from a "30 Minutes", "1 Hour", "1 Day" or "No buffer" pick. */
export function minutesOf(s: string): number {
  const n = firstNumber(s)
  if (!Number.isFinite(n)) return 0
  return /day/i.test(s) ? n * 1440 : /hour/i.test(s) ? n * 60 : n
}

/** Minutes past midnight of "09:30 AM", or NaN. */
export function clockMinutes(s: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s.trim())
  if (!m) return NaN
  return ((Number(m[1]) % 12) + (m[3]!.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m[2])
}
export const clockLabel = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24, m = mins % 60
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
/** Every half hour of the day, for the time pickers. */
export const CLOCK_TIMES = Array.from({ length: 48 }, (_, i) => clockLabel(i * 30))

/** A YYYY-MM-DD day at local noon, or undefined. Noon, so the day survives any timezone the state is read in. */
export function dayOf(s: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim())
  if (!m) return undefined
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12)
  return d.getMonth() === Number(m[2]) - 1 ? d : undefined
}
/** The About step's "DD / MM / YYYY", at the end of that day. */
function endDateOf(s: string): Date | undefined {
  const m = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(s.trim())
  if (!m) return undefined
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 23, 59)
  return d.getMonth() === Number(m[2]) - 1 ? d : undefined
}
const weekdayOf = (d: Date): Weekday => WEEKDAYS[(d.getDay() + 6) % 7]!
const dayLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** "Study gets ended after 60 days max" (client Figma 1622:81504). */
export const MAX_RUN_DAYS = 60
const DAY = 86_400_000

/** The start times one window offers: sessions of the study's length, the buffer between them. */
function slotsIn(w: TimeWindow, durationMins: number, bufferMins: number): string[] {
  const from = clockMinutes(w.from), to = clockMinutes(w.to)
  const out: string[] = []
  for (let t = from; t + durationMins <= to; t += durationMins + bufferMins) out.push(clockLabel(t))
  return out
}

type Refusal = { ok: false; why: string }
const no = (why: string): Refusal => ({ ok: false, why })

/** What is wrong with a set of hours, or nothing. `where` names the day or the override. */
function windowsFault(windows: TimeWindow[], where: string, durationMins: number): string | undefined {
  for (const w of windows) {
    const from = clockMinutes(w.from), to = clockMinutes(w.to)
    if (!Number.isFinite(from) || !Number.isFinite(to)) return `${where} has a time that cannot be read`
    if (to <= from) return `${where}: the end time must be after the start time`
    if (to - from < durationMins) return `${where}: ${w.from} to ${w.to} is shorter than the ${durationMins} minute session`
  }
  return undefined
}

// ------------------------------------------------------------- the audience

const COUNTRY_CODE: Record<string, string> = {
  'United States of America': 'US', 'United Kingdom': 'UK', Canada: 'CA', Australia: 'AU', Germany: 'DE', India: 'IN', Japan: 'JP',
}
const TIERS_AT: Record<string, Tier[]> = {
  'Silver and above': ['silver', 'gold', 'platinum'], 'Gold and above': ['gold', 'platinum'], 'Platinum only': ['platinum'],
}
const EDUCATION_WORDS = ['high school', 'bachelor', 'master', 'doctor']
const inRange = (age: number, range: string) => {
  const [lo, hi] = range.replace('+', '–200').split(/[–-]/).map(Number)
  return age >= lo! && age <= (hi ?? lo!)
}

/**
 * How many people on the platform fit the audience as entered: verified,
 * active, and matching every criterion the pool records. Work functions and
 * skills are not on a person's profile, so they cannot narrow the count.
 */
export function audiencePeople(state: PlatformState, f: StudyForm, now: Date = new Date()): Person[] {
  const roles = list(f.roles).map((r) => r.toLowerCase())
  const industries = list(f.industries).map((r) => r.toLowerCase())
  const codes = f.countries.map((c) => COUNTRY_CODE[c] ?? c)
  const edu = EDUCATION_WORDS.find((w) => f.education.toLowerCase().includes(w))
  const tiers = TIERS_AT[f.tiers]
  return state.people.filter((p) => {
    if (p.status !== 'active' || p.identity.state !== 'verified') return false
    if (codes.length && !codes.some((c) => p.location.endsWith(`, ${c}`) || p.location.includes(c))) return false
    if (f.gender && f.gender !== 'All Genders' && p.profile.gender !== f.gender) return false
    if (edu && !p.profile.education.toLowerCase().includes(edu)) return false
    if (f.ageRanges.length) { const age = ageFrom(p.profile.dob, now); if (age === undefined || !f.ageRanges.some((r) => inRange(age, r))) return false }
    if (roles.length && !roles.some((r) => p.profile.occupation.toLowerCase().includes(r))) return false
    if (industries.length && !industries.some((r) => p.profile.industry.toLowerCase().includes(r))) return false
    if (tiers && !tiers.includes(tierOf(state, p.id, now))) return false
    return true
  })
}
/** The same test for a study: the people its audience describes. A study that was not built in the Create flow has no audience to test. */
export const fitsStudy = (state: PlatformState, study: Study, now: Date = new Date()): Person[] => (study.form ? audiencePeople(state, study.form, now) : [])
export const estimateAudience = (state: PlatformState, f: StudyForm, now: Date = new Date()): number => audiencePeople(state, f, now).length

const CONDITION: Record<StudyForm['condition'], { rule: RepeatRule; label?: string }> = {
  na: { rule: 'allow' },
  fresh: { rule: 'prefer_fresh', label: 'Prefer fresh people' },
  never: { rule: 'exclude', label: 'Has never participated in any of your studies before' },
}

/** The audience as the Manage, Publish and Review screens write it: one pill per thing entered. */
export function audiencePills(f: StudyForm): StudySetup['audience'] {
  const pill = (label: string, value: string) => (value ? [{ label, value }] : [])
  return [
    { value: f.participants.trim() || '0', icon: 'people' },
    ...(f.countries.length ? [{ value: f.countries.join(', '), icon: 'pin' }] : []),
    ...pill('Gender', f.gender), ...pill('Education', f.education), ...pill('Age', f.ageRanges.join(', ')),
    ...pill('Work Functions', list(f.functions).join(', ')), ...pill('Roles', list(f.roles).join(', ')),
    ...pill('Industry', list(f.industries).join(', ')), ...pill('Skills', list(f.skills).join(', ')),
    ...pill('Condition', CONDITION[f.condition].label ?? ''), ...pill('Profile Tiers', f.tiers),
  ]
}

// ---------------------------------------------------------------- summaries

export const TYPE_LABEL: Record<StudyType, string> = {
  survey: 'Survey', video_call: 'Video Call', group_video_call: 'Group Video Call', in_person: 'In-Person', in_person_group: 'In-Person Group', diary: 'Diary Study',
}
const askable = (qs: FormQuestion[]) => qs.filter((q) => q.text.trim()).length
const openDays = (f: StudyForm) => WEEKDAYS.filter((d) => (f.hours[d] ?? []).length > 0)

/** Step 4 in one line, as the settings card and the Manage screen write it. "Not set up yet" until it is. */
export function studySummary(f: StudyForm): { label: string; value: string } {
  const type = studyTypeOf(f)
  const addresses = plural(f.addresses.length, 'address', 'addresses')
  if (type === 'survey') return { label: 'Survey Form', value: f.tasksSubmitted ? plural(askable(f.tasks), 'input') : 'Not set up yet' }
  if (type === 'diary') return { label: 'Diary Study Form', value: f.tasksSubmitted ? `${plural(askable(f.tasks), 'question')}, ${f.studyDuration} logs` : 'Not set up yet' }
  const label = TYPE_LABEL[type]
  if (!f.availabilitySet) return { label, value: 'Not set up yet' }
  if (isGroup(type)) return { label, value: [plural(f.sessions.length, 'session'), `${f.seats} per session`, ...(isInPerson(type) ? [addresses] : [])].join(', ') }
  return {
    label, value: [...(isInPerson(type) ? [addresses] : []), `available ${openDays(f).length} days/week`, 'custom timings',
      ...(f.overrides.length ? [`${plural(f.overrides.length, 'day')} overrides`] : [])].join(', '),
  }
}

/** The four steps in the strings the Publish, Manage and Review screens write them in, from what was built. */
export function summarise(state: PlatformState, f: StudyForm, now: Date = new Date()): StudySetup & { typeLabel: string; type: StudyType } {
  const type = studyTypeOf(f)
  return {
    type, typeLabel: TYPE_LABEL[type],
    estimatedAudience: estimateAudience(state, f, now).toLocaleString('en-US'),
    audience: audiencePills(f),
    screenerSummary: plural(askable(f.questions), 'input'),
    studySummary: studySummary(f),
  }
}

/** Step 4 read back line by line, for a screen that shows everything the client entered. */
export function studyDetails(f: StudyForm): { label: string; value: string }[] {
  const type = studyTypeOf(f)
  const rows: { label: string; value: string }[] = []
  const hours = (ws: TimeWindow[]) => (ws.length ? ws.map((w) => `${w.from} to ${w.to}`).join(', ') : 'Unavailable')
  if (type === 'diary') rows.push({ label: 'Duration Unit', value: f.durationUnit }, { label: 'Frequency', value: f.frequency }, { label: 'Study Duration', value: f.studyDuration }, { label: 'Minimum Required', value: f.minimumRequired })
  if (isInPerson(type)) f.addresses.forEach((a, i) => rows.push({ label: `Address ${i + 1}`, value: `${a.title}: ${a.detail}` }))
  if (isGroup(type)) {
    rows.push({ label: 'Seats per session', value: f.seats })
    f.sessions.forEach((s, i) => { const d = dayOf(s.date); rows.push({ label: `Session ${i + 1}`, value: `${d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' }) : s.date}, ${s.time}` }) })
  }
  if (isOneToOne(type)) {
    rows.push({ label: 'Buffer between meetings', value: f.buffer }, { label: 'Minimum notice duration', value: f.notice })
    for (const d of WEEKDAYS) rows.push({ label: d, value: hours(f.hours[d] ?? []) })
    f.overrides.forEach((o) => { const a = dayOf(o.from), b = dayOf(o.to); rows.push({ label: `Override ${a ? dayLabel(a) : o.from}${o.to !== o.from && b ? ` - ${dayLabel(b)}` : ''}`, value: hours(o.windows) }) })
  }
  rows.push({ label: 'AutoPay', value: f.autoPay ? 'On' : 'Off' })
  return rows
}

// ------------------------------------------------------------------ building

/** The fields of a study that come from the form. The store adds the id, the client, the dates it stamps and the people. */
export type BuiltStudy = Pick<Study,
  'title' | 'description' | 'image' | 'type' | 'industry' | 'durationMins' | 'endsAt' | 'required' | 'repeatRule' | 'rates' | 'targetProfession'
  | 'city' | 'locations' | 'availability' | 'schedule' | 'preScreener' | 'screener' | 'tasks' | 'diary' | 'sessions' | 'autoPay'>

/**
 * The study a form describes, or the first thing that stops it being one,
 * said the way the client would fix it. Checked in the order of the steps.
 */
export function buildStudy(f: StudyForm, now: Date = new Date()): { ok: true; study: BuiltStudy; preScreener: PreScreenQuestion[]; screener: Question[] } | Refusal {
  const type = studyTypeOf(f)
  // 1. About
  if (!f.title.trim()) return no('Give the study a title on the About step')
  const durationMins = Number(f.duration) || 0
  if (durationMins <= 0) return no('Set how long the study takes on the About step')
  let endsAt = new Date(now.getTime() + MAX_RUN_DAYS * DAY)
  if (f.endDate.trim()) {
    const end = endDateOf(f.endDate)
    if (!end) return no('The study end date must be written DD / MM / YYYY')
    if (end <= now) return no('The study end date has already passed')
    if (end > endsAt) return no(`A study ends after ${MAX_RUN_DAYS} days at most; choose an earlier end date`)
    endsAt = end
  }
  // 2. Audience
  const required = /^\d+$/.test(f.participants.trim()) ? Number(f.participants) : 0
  if (required <= 0) return no('Enter the number of target participants on the Audience step')
  // 3. Screener
  const screener = buildScreener(f.questions)
  if (!screener.ok) return screener
  // 4. Study
  if (!Number.isFinite(f.incentive) || f.incentive <= 0) return no('Set the incentive amount on the Study step')
  const study: BuiltStudy = {
    title: f.title.trim(), description: f.description.trim(), image: f.image || undefined, type, industry: list(f.industries).join(', '), durationMins,
    endsAt: endsAt.toISOString(), required, repeatRule: CONDITION[f.condition].rule, rates: priceStudy(type, f.incentive),
    targetProfession: list(f.roles).join(', '), preScreener: screener.preScreener, screener: screener.screener, autoPay: f.autoPay,
  }

  if (type === 'survey' || type === 'diary') {
    const what = type === 'survey' ? 'survey' : 'diary form'
    if (!f.tasksSubmitted) return no(`Create and submit the ${what} on the Study step`)
    const tasks = buildTasks(f.tasks)
    if (!tasks.ok) return tasks
    if (tasks.tasks.length === 0) return no(`Add at least one question to the ${what}`)
    study.tasks = tasks.tasks
    if (type === 'diary') {
      const totalDays = firstNumber(f.studyDuration), minDays = firstNumber(f.minimumRequired)
      if (!(totalDays > 0) || !(minDays > 0)) return no('Set the diary study duration and the minimum required')
      if (minDays > totalDays) return no(`The minimum required (${f.minimumRequired}) is more than the study duration (${f.studyDuration})`)
      study.diary = { totalDays, minDays, unit: f.durationUnit, frequency: f.frequency }
    }
    return { ok: true, study, preScreener: screener.preScreener, screener: screener.screener }
  }

  if (!f.availabilitySet) return no(`Set and submit your ${isInPerson(type) ? 'address and availability' : 'availability'} on the Study step`)
  const when = scheduleOf(f, type, durationMins, endsAt, now)
  if (!when.ok) return when
  Object.assign(study, when.fields)
  return { ok: true, study, preScreener: screener.preScreener, screener: screener.screener }
}

type Scheduled = Pick<Study, 'city' | 'locations' | 'availability' | 'schedule' | 'sessions'>

/** A session study's addresses, sessions and bookable slots, from the availability composer. */
function scheduleOf(f: StudyForm, type: StudyType, durationMins: number, endsAt: Date, now: Date): { ok: true; fields: Scheduled } | Refusal {
  const fields: Scheduled = {}
  if (isInPerson(type)) {
    if (f.addresses.length === 0) return no('Add at least one address for the in-person sessions')
    fields.locations = f.addresses.map((a): Location => ({ id: a.id, label: a.title, address: a.detail, short: a.title }))
    fields.city = f.addresses[0]!.title
  }

  if (isGroup(type)) {
    const seats = firstNumber(f.seats)
    if (!(seats > 0)) return no('Enter the seats per session')
    if (f.sessions.length === 0) return no('Add at least one group session')
    const sessions: Session[] = []
    for (const [i, s] of f.sessions.entries()) {
      const day = dayOf(s.date), mins = clockMinutes(s.time)
      if (!day || !Number.isFinite(mins)) return no(`Session ${i + 1} needs a date and a start time`)
      const start = new Date(day); start.setHours(Math.floor(mins / 60), mins % 60, 0, 0)
      if (start <= now) return no(`Session ${i + 1} is in the past`)
      if (start > endsAt) return no(`Session ${i + 1} is after the study ends`)
      if (sessions.some((x) => x.date === day.toISOString() && x.slot === clockLabel(mins))) return no(`Session ${i + 1} is at the same time as another session`)
      // With one address every session is held there. With several, no step asks which, so none is assumed.
      sessions.push({ id: s.id, date: day.toISOString(), slot: clockLabel(mins), seats, locationId: fields.locations?.length === 1 ? fields.locations[0]!.id : undefined })
    }
    fields.sessions = sessions.sort((a, b) => a.date.localeCompare(b.date) || clockMinutes(a.slot) - clockMinutes(b.slot))
    return { ok: true, fields }
  }

  // One to one: the weekly hours and the overrides become the dated slots a respondent books.
  const bufferMins = minutesOf(f.buffer), noticeMins = minutesOf(f.notice)
  for (const d of WEEKDAYS) { const fault = windowsFault(f.hours[d] ?? [], d, durationMins); if (fault) return no(fault) }
  const overrides: { from: Date; to: Date; windows: TimeWindow[] }[] = []
  for (const [i, o] of f.overrides.entries()) {
    const from = dayOf(o.from), to = dayOf(o.to || o.from)
    if (!from || !to) return no(`Date override ${i + 1} needs its dates`)
    if (to < from) return no(`Date override ${i + 1} ends before it starts`)
    const fault = windowsFault(o.windows, `Date override ${i + 1}`, durationMins)
    if (fault) return no(fault)
    overrides.push({ from, to, windows: o.windows })
  }
  const availability: { date: string; slots: string[] }[] = []
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12)
  for (let day = first; day <= endsAt; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 12)) {
    const over = overrides.find((o) => day >= o.from && day <= o.to)
    const windows = over ? over.windows : f.hours[weekdayOf(day)] ?? []
    const slots = [...new Set(windows.flatMap((w) => slotsIn(w, durationMins, bufferMins)))].sort((a, b) => clockMinutes(a) - clockMinutes(b))
    if (slots.length) availability.push({ date: day.toISOString(), slots })
  }
  if (availability.length === 0) return no('Your availability offers no session time before the study ends; switch on a day and set its hours')
  fields.availability = availability
  fields.schedule = { bufferMins, noticeMins }
  return { ok: true, fields }
}

/** What stops the availability composer being submitted as it stands, or nothing. The same check Publish makes. */
export function availabilityFault(f: StudyForm, now: Date = new Date()): string | undefined {
  const end = f.endDate.trim() ? endDateOf(f.endDate) : undefined
  const latest = new Date(now.getTime() + MAX_RUN_DAYS * DAY)
  const made = scheduleOf(f, studyTypeOf(f), Number(f.duration) || 0, end && end > now && end < latest ? end : latest, now)
  return made.ok ? undefined : made.why
}

// ---------------------------------------------------------------- reopening

const KIND_OF: Record<Question['kind'], AuthoredKind> = { single: 'Single-select', multi: 'Multi-select', text: 'Multi-line input', image: 'File Upload', scale: 'Single-select' }

function questionOf(q: Question, label: string, marks: string[]): FormQuestion {
  const kind = (q.authored as AuthoredKind | undefined) ?? KIND_OF[q.kind]
  const options = 'options' in q ? q.options.map((o) => ({ id: formId('o'), text: o, mark: q.marks?.[o] ?? (kind === 'Ranking' ? '' : marks[0] ?? '') })) : []
  return { ...blankQuestion(label, kind, marks), text: q.prompt, ...(options.length ? { options } : {}) }
}

/**
 * The form for a draft that was not made in the Create flow (a duplicate of a
 * seeded study, say): what the study record holds, put back into the steps.
 * Weekly hours cannot be read back from dated slots, so they open unset.
 */
export function formFromStudy(s: Study): StudyForm {
  if (s.form) return structuredClone(s.form)
  const f = blankForm()
  const type: FormType = s.type === 'group_video_call' ? 'video_call' : s.type === 'in_person_group' ? 'in_person' : s.type
  const pre = s.preScreener.map((q, i): FormQuestion => ({
    ...blankQuestion(`Pre-screener - Q${i + 1}`), text: q.prompt,
    options: q.options.map((o) => ({ id: formId('o'), text: o, mark: q.passing.includes(o) ? 'Correct' : 'Incorrect' })),
  }))
  const full = s.screener.map((q, i) => questionOf(q, `Q${pre.length + i + 1}`, MARKS[(q.authored as AuthoredKind) ?? KIND_OF[q.kind]] ?? []))
  const tasks = (s.tasks ?? []).map((q, i) => questionOf(q, s.type === 'diary' ? `Q${i + 1}` : `SQ ${i + 1}`, TASK_MARKS))
  return {
    ...f, type, groupVideo: s.type === 'group_video_call', groupInPerson: s.type === 'in_person_group',
    duration: s.durationMins || f.duration, title: s.title === 'Untitled study' ? '' : s.title, description: s.description, image: s.image ?? '',
    participants: s.required > 0 ? String(s.required) : f.participants, roles: s.targetProfession, industries: s.industry,
    condition: s.repeatRule === 'exclude' ? 'never' : s.repeatRule === 'prefer_fresh' ? 'fresh' : 'na',
    questions: pre.length + full.length ? [...pre, ...full] : f.questions,
    incentive: s.rates.incentivePer || f.incentive, autoPay: s.autoPay ?? f.autoPay, tasks, tasksSubmitted: tasks.length > 0,
    studyDuration: s.diary ? `${s.diary.totalDays} days` : f.studyDuration, minimumRequired: s.diary ? `${s.diary.minDays} days` : f.minimumRequired,
    durationUnit: s.diary?.unit ?? f.durationUnit, frequency: s.diary?.frequency ?? f.frequency,
    addresses: (s.locations ?? []).map((l) => ({ id: l.id, title: l.label, detail: l.address })),
    seats: s.sessions?.[0] ? `${s.sessions[0].seats} seats` : f.seats,
  }
}
