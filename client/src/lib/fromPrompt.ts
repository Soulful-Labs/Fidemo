import type { FormQuestion, StudyForm } from '@shared/studyForm'
import { blankQuestion } from '@shared/studyForm'
import type { AuthoredKind } from '@shared/questions'

/**
 * Generate with AI, without a model.
 *
 * There is no language model behind the Create flow, so "Generate with AI"
 * reads what the client typed and fills only what that text actually says,
 * by matching words and simple patterns against the lists below. Anything the
 * text does not mention is left exactly as it was, and the result says which
 * fields were filled and which were not found. Nothing here invents a value
 * the text gives no grounds for.
 */

const re = (words: string[]) => new RegExp(`\\b(?:${words.join('|')})\\b`, 'i')

/** Industry, as the audience step writes it, and the words that point to it. */
const INDUSTRIES: [string, string[]][] = [
  ['Healthcare', ['health ?care', 'health', 'hospitals?', 'clinics?', 'clinical', 'patients?', 'doctors?', 'physicians?', 'nurses?', 'nursing', 'medical', 'medicine', 'telehealth', 'dental', 'therapy', 'mental health']],
  ['Pharma', ['pharma', 'pharmaceuticals?', 'drugs?', 'medications?', 'prescriptions?', 'pharmacists?', 'pharmacy']],
  ['Finance', ['banks?', 'banking', 'finance', 'financial', 'fintech', 'payments?', 'credit cards?', 'loans?', 'accounting', 'accountants?', 'investing', 'investments?']],
  ['Insurance', ['insurance', 'insurers?', 'claims']],
  ['IT', ['software', 'saas', 'tech', 'technology', 'developers?', 'cloud computing']],
  ['Education', ['schools?', 'education', 'teachers?', 'students?', 'universit(?:y|ies)', 'colleges?', 'learning', 'edtech']],
  ['Retail', ['retail', 'shopping', 'shoppers?', 'e-?commerce', 'online stores?', 'grocer(?:y|ies)', 'consumers?']],
  ['Travel', ['travel', 'travell?ers?', 'hotels?', 'airlines?', 'flights?', 'tourism', 'holidays?']],
  ['Food', ['food', 'restaurants?', 'cooking', 'recipes?', 'meals?', 'dining']],
  ['Automotive', ['cars?', 'automotive', 'vehicles?', 'driving', 'drivers?', 'electric vehicles?', 'evs?']],
  ['Media', ['media', 'news', 'streaming', 'podcasts?', 'publishing']],
  ['Real Estate', ['real estate', 'housing', 'renters?', 'renting', 'mortgages?', 'landlords?']],
  ['Fitness & Nutrition', ['fitness', 'nutrition', 'diet', 'wellness', 'sleep', 'gyms?', 'workouts?', 'exercise']],
]

/**
 * A role (job title), the words that name it, and its work function: a
 * product manager's role is Product Manager, their function Product. The
 * functions are the platform's own (shared/platform.ts WORK_FUNCTIONS), the
 * words participants choose on their profiles, so the forecast can match them.
 */
const ROLES: [string, string[], string][] = [
  ['Product Manager', ['product managers?', 'product owners?', 'pms'], 'Product'],
  ['Software Engineer', ['software engineers?', 'developers?', 'programmers?', 'engineers?'], 'Engineering'],
  ['Designer', ['designers?', 'ux designers?', 'ui designers?'], 'Design'],
  ['Data Analyst', ['data analysts?', 'data scientists?', 'analysts?'], 'Research'],
  ['Nurse', ['nurses?'], 'Patient Care'],
  ['Physician', ['doctors?', 'physicians?', 'gps', 'surgeons?'], 'Consultation'],
  ['Pharmacist', ['pharmacists?'], 'Consultation'],
  ['Teacher', ['teachers?', 'educators?', 'tutors?'], 'Teaching'],
  ['Accountant', ['accountants?', 'bookkeepers?'], 'Finance'],
  ['Financial Advisor', ['financial advisors?', 'financial planners?'], 'Finance'],
  ['Marketing Manager', ['marketers?', 'marketing managers?'], 'Marketing'],
  ['Sales Representative', ['sales reps?', 'salespeople', 'salespersons?', 'account executives?', 'sales representatives?'], 'Sales'],
  ['Founder', ['founders?', 'small business owners?', 'business owners?', 'entrepreneurs?'], 'Management'],
  ['HR Manager', ['hr managers?', 'recruiters?', 'human resources'], 'Management'],
  ['Operations Manager', ['operations managers?'], 'Operations'],
  ['Researcher', ['researchers?'], 'Research'],
]

/** A work function named on its own: "the marketing team", "people in finance". The platform's own function words. */
const FUNCTIONS: [string, string[]][] = [
  ['Product', ['product']], ['Engineering', ['engineering']], ['Design', ['design']], ['Marketing', ['marketing']],
  ['Sales', ['sales']], ['Finance', ['finance']], ['Operations', ['operations', 'ops']], ['Management', ['management', 'leadership']],
  ['Research', ['research']], ['Teaching', ['teaching']], ['Patient Care', ['patient care', 'clinical', 'nursing']], ['Consultation', ['consultation', 'consulting']],
]

/** The platform's own skills (shared/platform.ts SKILLS), and a few tools a client might name. */
const SKILLS = ['Diagnosis', 'Triage', 'Clinical Research', 'Programming', 'Data Analysis', 'Writing', 'Public Speaking', 'Budgeting', 'Forecasting',
  'Project Management', 'Coaching', 'Negotiation', 'Excel', 'Python', 'SQL', 'Figma', 'Salesforce', 'Tableau', 'Power BI', 'Photoshop', 'JavaScript']

const COUNTRIES: [string, RegExp][] = [
  ['United States of America', /\b(?:united states|usa|u\.s\.a?\.?|america|americans?)\b|\bUS\b/],
  ['United Kingdom', /\b(?:united kingdom|britain|british|england|english)\b|\bUK\b/i],
  ['Canada', /\bcanad(?:a|ians?)\b/i], ['Australia', /\baustralia(?:ns?)?\b/i], ['Germany', /\bgerman(?:y|s)?\b/i],
  ['India', /\bindian?s?\b/i], ['Japan', /\bjapan(?:ese)?\b/i],
]

const AGE_OPTIONS: [string, number, number][] = [['18–20', 18, 20], ['21–29', 21, 29], ['30–39', 30, 39], ['40–54', 40, 54], ['50–59', 50, 59], ['60+', 60, 200]]
const agesBetween = (lo: number, hi: number) => AGE_OPTIONS.filter(([, a, b]) => a <= hi && b >= lo).map(([k]) => k)

const unique = <T,>(xs: T[]) => [...new Set(xs)]
const sentence = (s: string) => { const t = s.trim().replace(/\s+/g, ' '); return t ? t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.') : '' }

export interface PromptReading {
  industries: string[]
  roles: string[]
  functions: string[]
  skills: string[]
  countries: string[]
  gender?: string
  ageRanges: string[]
  education: string[]
  participants?: string
  /** What the study is about, as a short phrase the questions can name. */
  focus: string
  /**
   * What `focus` is, which decides how a question names it: a thing people
   * use ("telehealth apps"), something they do ("cook at home"), a field
   * ("healthcare"), or nothing the text gave.
   */
  mode: 'thing' | 'activity' | 'field' | 'none'
  /** Questions the client wrote into their text, each ending in "?". */
  asked: string[]
}

/** Everything the text says about the audience and the subject. Only what is there. */
export function readPrompt(text: string): PromptReading {
  const t = ` ${text} `
  const roles = ROLES.filter(([, words]) => re(words).test(t))
  const functions = unique([
    ...roles.map(([, , fn]) => fn),
    ...FUNCTIONS.filter(([, words]) => new RegExp(`\\b(?:${words.join('|')})\\s+(?:team|teams|department|function|roles?|people|staff)\\b|\\b(?:in|work in|working in)\\s+(?:${words.join('|')})\\b`, 'i').test(t)).map(([fn]) => fn),
  ])
  const gender = /\b(?:women|woman|female|mothers?|moms?|girls?)\b/i.test(t)
    ? (/\b(?:men|man|male|fathers?|dads?|boys?)\b/i.test(t) ? 'All Genders' : 'Female')
    : /\b(?:men|man|male|fathers?|dads?|boys?)\b/i.test(t) ? 'Male' : undefined

  const ages: string[] = []
  for (const m of t.matchAll(/\b(?:aged?|ages|between)\s+(\d{2})\s*(?:-|–|to|and)\s*(\d{2})\b|\b(\d{2})\s*(?:-|–|to)\s*(\d{2})\s*(?:years?(?:[ -]old)?|year-olds|yo)\b/gi)) {
    const lo = Number(m[1] ?? m[3]), hi = Number(m[2] ?? m[4])
    if (lo >= 18 && hi >= lo) ages.push(...agesBetween(lo, hi))
  }
  for (const m of t.matchAll(/\b(?:over|above|older than)\s+(\d{2})\b|\b(\d{2})\+/gi)) ages.push(...agesBetween(Number(m[1] ?? m[2]), 200))
  for (const m of t.matchAll(/\b(?:under|below|younger than)\s+(\d{2})\b/gi)) ages.push(...agesBetween(18, Number(m[1]) - 1))
  if (/\b(?:gen ?z|young adults?|college students?|university students?|undergrad(?:uate)?s?)\b/i.test(t)) ages.push('18–20', '21–29')
  if (/\bmillennials?\b/i.test(t)) ages.push('30–39', '40–54')
  if (/\b(?:seniors?|retirees?|retired|older adults?|elderly)\b/i.test(t)) ages.push('60+')

  const education = [
    ...(/\bhigh school\b/i.test(t) ? ['High School Graduate'] : []),
    ...(/\b(?:bachelor'?s|college graduates?|graduates|undergraduate degree|degree holders?)\b/i.test(t) ? ["Graduate or Bachelor's"] : []),
    ...(/\b(?:master'?s|mba|postgraduate)\b/i.test(t) ? ["Master's degree"] : []),
    ...(/\b(?:phd|ph\.d|doctorate|doctoral)\b/i.test(t) ? ['Doctorate'] : []),
  ]
  const count = /\b(\d{1,4})\s+(?:[a-z-]+\s+){0,3}?(?:participants|people|respondents|users|customers|interviews|testers|nurses|doctors|teachers|students|parents|managers|engineers|designers)\b/i.exec(t)

  // The subject: a thing people use if the text names one ("telehealth apps"), else the field it is in.
  // Role words are taken out first, so "product managers" is a role and not the thing studied.
  const rest = ROLES.reduce((x, [, words]) => x.replace(new RegExp(`\\b(?:${words.join('|')})\\b`, 'gi'), ' '), text)
  const thing = /\b((?:[a-z-]+\s){0,2}(?:apps?|platforms?|tools?|software|products?|services?|websites?|devices?|cards?|checkout|subscriptions?|dashboards?|features?|wearables?))\b/i.exec(rest)
  const doing = /\b(?:who|that|how (?:they|people|you))\s+([a-z][^.,;?!]{2,60})/i.exec(rest)
  const industries = INDUSTRIES.filter(([, words]) => re(words).test(t)).map(([name]) => name)
  const strip = (x: string) => x.trim().replace(/^(?:(?:the|a|an|our|their|your|its|of|for|with|use|using|about|on|in|at|to|how|they|we|people)\s+)+/i, '')
  const mode: PromptReading['mode'] = thing ? 'thing' : doing ? 'activity' : industries[0] ? 'field' : 'none'
  const focus = mode === 'thing' ? strip(thing![1]!).toLowerCase()
    : mode === 'activity' ? doing![1]!.trim().replace(/\s+(?:and|but)\s*$/i, '')
      : mode === 'field' ? industries[0]!.toLowerCase() : 'the subject of this study'

  return {
    industries,
    roles: roles.map(([name]) => name),
    functions,
    skills: SKILLS.filter((s) => new RegExp(`\\b${s.replace(/\s/g, '\\s')}\\b`, 'i').test(t)),
    countries: COUNTRIES.filter(([, rx]) => rx.test(t)).map(([name]) => name),
    gender,
    ageRanges: AGE_OPTIONS.map(([k]) => k).filter((k) => ages.includes(k)),
    education,
    participants: count?.[1],
    focus, mode,
    asked: (text.match(/[^.?!\n]+\?/g) ?? []).map((q) => q.trim()).filter((q) => q.length > 8),
  }
}

/** The Audience step's fields from the text, and a line per field saying what was filled and what was not found. */
export function audienceFromPrompt(text: string, current: Pick<StudyForm, 'description'>): {
  patch: Partial<StudyForm>; filled: string[]; missing: string[]
} {
  const r = readPrompt(text)
  const patch: Partial<StudyForm> = {}
  const filled: string[] = [], missing: string[] = []
  const take = (label: string, ok: boolean, apply: () => void, shown: string) => { if (ok) { apply(); filled.push(`${label}: ${shown}`) } else missing.push(label) }
  take('Work Function', r.functions.length > 0, () => { patch.functions = r.functions.join(', ') }, r.functions.join(', '))
  take('Industry', r.industries.length > 0, () => { patch.industries = r.industries.join(', ') }, r.industries.join(', '))
  take('Role', r.roles.length > 0, () => { patch.roles = r.roles.join(', ') }, r.roles.join(', '))
  take('Skills', r.skills.length > 0, () => { patch.skills = r.skills.join(', ') }, r.skills.join(', '))
  take('Country', r.countries.length > 0, () => { patch.countries = r.countries }, r.countries.join(', '))
  take('Gender', Boolean(r.gender), () => { patch.gender = [r.gender!] }, r.gender ?? '')
  take('Age Range', r.ageRanges.length > 0, () => { patch.ageRanges = r.ageRanges }, r.ageRanges.join(', '))
  take('Level of Education', r.education.length > 0, () => { patch.education = r.education }, r.education.join(', '))
  take('Number of participants', Boolean(r.participants), () => { patch.participants = r.participants! }, r.participants ?? '')
  // The study's description, on the About step, is filled from the text only when it is still empty.
  if (!current.description.trim()) { patch.description = sentence(text); filled.push('Study description (About step): your text') }
  return { patch, filled, missing }
}

type Made = { kind: AuthoredKind; text: string; options?: string[] }
/** The same questions, worded for what the subject is. */
const say = (r: PromptReading) => {
  const f = r.focus
  if (r.mode === 'thing') return { often: `How often do you use ${f}?`, familiar: `How familiar are you with ${f}?`, last: `Tell us about the last time you used ${f}.`, happy: `Overall, how satisfied are you with ${f} today?`, good: `What works well for you with ${f}?`, bad: `What is the most frustrating part of ${f}?`, change: `If you could change one thing about ${f}, what would it be?` }
  if (r.mode === 'activity') return { often: `How often do you ${f}?`, familiar: `How confident are you when you ${f}?`, last: `Tell us about the last time you did this: ${f}.`, happy: `Overall, how happy are you with how you ${f} today?`, good: `What do you enjoy most when you ${f}?`, bad: `What is the most frustrating part when you ${f}?`, change: `If you could change one thing about how you ${f}, what would it be?` }
  return { often: `How often does ${f} come up in your work or daily life?`, familiar: `How familiar are you with ${f}?`, last: `In a sentence or two, tell us about your experience with ${f}.`, happy: `Overall, how satisfied are you with ${f} today?`, good: `What works well for you with ${f}?`, bad: `What is the most frustrating part of ${f}?`, change: `If you could change one thing about ${f}, what would it be?` }
}
const OFTEN = ['Every day', 'Every week', 'Every month', 'Rarely or never']
/** The text names no subject, role, industry or question: nothing is generated rather than questions that ignore it. */
export const saysNothing = (text: string): boolean => { const r = readPrompt(text); return r.mode === 'none' && !r.roles.length && !r.asked.length }

/**
 * Screener questions from the text: the roles it names, the industry, how
 * often and how well people know the subject, and any question the client
 * wrote into it. None screens anyone out: which answer disqualifies is the
 * client's decision, so every option is Correct or May Select.
 */
export function screenerFromPrompt(text: string, startAt: number): FormQuestion[] {
  const r = readPrompt(text)
  if (saysNothing(text)) return []
  const made: Made[] = [
    ...(r.roles.length ? [{ kind: 'Single-select' as const, text: 'Which of these best describes your current role?', options: [...r.roles, 'Something else'] }] : []),
    ...(r.industries.length ? [{ kind: 'Single-select' as const, text: 'Which industry do you work in, or know best?', options: [...r.industries, 'Another industry'] }] : []),
    { kind: 'Single-select', text: say(r).often, options: OFTEN },
    { kind: 'Single-select', text: say(r).familiar, options: r.mode === 'activity' ? ['Very confident', 'Fairly confident', 'Not very confident', 'Not confident at all'] : ['Very familiar', 'Somewhat familiar', 'Slightly familiar', 'Not familiar at all'] },
    ...r.asked.map((q): Made => ({ kind: 'Multi-line input', text: q })),
    { kind: 'Multi-line input', text: say(r).last },
  ]
  return made.map((m, i) => {
    const q = blankQuestion(`Q${startAt + i}`, m.kind)
    const mark = m.kind === 'Multi-select' ? 'May Select' : 'Correct'
    return { ...q, text: m.text, options: m.options ? m.options.map((o, n) => ({ id: `${q.id}g${n}`, text: o, mark })) : q.options }
  })
}

/** Survey or diary questions from the text: about the subject it names, plus any question the client wrote into it. */
export function surveyFromPrompt(text: string, label: (n: number) => string, startAt: number, marks: (k: AuthoredKind) => string[]): FormQuestion[] {
  const r = readPrompt(text)
  if (saysNothing(text)) return []
  const made: Made[] = [
    ...r.asked.map((q): Made => ({ kind: 'Multi-line input', text: q })),
    { kind: 'Single-select', text: say(r).often, options: OFTEN },
    { kind: 'Single-select', text: say(r).happy, options: ['Very satisfied', 'Satisfied', 'Neither', 'Dissatisfied', 'Very dissatisfied'] },
    { kind: 'Multi-line input', text: say(r).good },
    { kind: 'Multi-line input', text: say(r).bad },
    { kind: 'Multi-line input', text: say(r).change },
  ]
  return made.map((m, i) => {
    const q = blankQuestion(label(startAt + i), m.kind, marks(m.kind))
    const mark = marks(m.kind)[0] ?? ''
    return { ...q, text: m.text, options: m.options ? m.options.map((o, n) => ({ id: `${q.id}g${n}`, text: o, mark })) : q.options }
  })
}
