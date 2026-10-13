import { taskResults } from '@shared/questions'
import type { Answered } from '@shared/questions'
import type { Participation, Study } from '@shared/types'

/** The invitation to rate, drawn in the rail and again across the Activity tab. */
export const RATE_PROMPT = {
  title: "Rate this respondent for this study",
  rail: 'Your rating helps you and other clients find better matching respondents.',
  wide: 'Rating your experience helps you and other clients find better matching respondents.',
  cta: "Rate",
}

export type Answer =
  | { kind: 'text'; value: string }
  | { kind: 'bullets'; values: string[] }
  | { kind: 'ordered'; values: string[] }
  | { kind: 'file'; name: string; size: string }
  | { kind: 'matrix'; columns: string[]; rows: { label: string; choice: number }[] }

export interface QA { prompt: string; answer: Answer }

/**
 * The screener as this respondent answered it (shared participation). The
 * pre-screener's answers are not kept, only that it was passed (workflow 28).
 */
export function answersOf(study: Pick<Study, 'preScreener' | 'screener'>, p?: Participation): QA[] {
  const pre: QA[] = study.preScreener.map((q) => ({ prompt: q.prompt, answer: { kind: 'text', value: p?.prescreener === 'passed' ? 'Passed' : 'Not answered' } }))
  const main: QA[] = study.screener.map((q) => {
    const v = p?.answers?.[q.id]
    return { prompt: q.prompt, answer: Array.isArray(v) ? { kind: 'bullets', values: v } : { kind: 'text', value: v === undefined || v === '' ? 'Not answered' : String(v) } }
  })
  return [...pre, ...main]
}

const qa = (a: Answered): QA => ({ prompt: a.prompt, answer: a.list ? { kind: 'bullets', values: a.list } : { kind: 'text', value: a.text ?? 'Not answered' } })

/**
 * The study itself as this respondent answered it (shared/questions.ts
 * taskResults): a survey's answers under one heading, a diary's under a bar
 * for each day filled in.
 */
export function resultsOf(study: Pick<Study, 'tasks' | 'type'>, p?: Participation): { label?: string; answers: QA[] }[] {
  const r = taskResults(study, p)
  return study.type === 'diary' ? r.days.map((d) => ({ label: `DAY ${d.day}`, answers: d.answers.map(qa) })) : [{ answers: r.survey.map(qa) }]
}

const SITUATION = 'Which of the following best describes your current situation?'
const TRACK = 'I regularly track experiences'
const MULTI = ['I rarely or never record experiences over time', 'Track habits over multiple days for personal, work, or research purposes']
const MATRIX: Answer = {
  kind: 'matrix',
  columns: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'],
  rows: [{ label: 'Step  A', choice: 2 }, { label: 'Step B', choice: 3 }, { label: 'Step B', choice: 4 }],
}


/** The diary result, which the frame groups under a day bar. */
export const DIARY_DAYS: { label: string; answers: QA[] }[] = [
  {
    label: 'DAY 1',
    answers: [
      { prompt: SITUATION, answer: { kind: 'text', value: TRACK } },
      { prompt: SITUATION, answer: { kind: 'bullets', values: MULTI } },
    ],
  },
  {
    label: 'DAY 2',
    answers: [
      { prompt: SITUATION, answer: { kind: 'text', value: TRACK } },
      { prompt: SITUATION, answer: { kind: 'bullets', values: MULTI } },
      { prompt: SITUATION, answer: { kind: 'text', value: 'I regularly track experiences or habits' } },
    ],
  },
  {
    label: 'DAY 3',
    answers: [
      { prompt: SITUATION, answer: { kind: 'text', value: TRACK } },
      { prompt: SITUATION, answer: { kind: 'bullets', values: MULTI } },
      { prompt: 'Rate the steps of process of testing your glucose at home', answer: MATRIX },
    ],
  },
]

export const VERIFICATION_PIN = {
  title: 'Verification PIN',
  activityBody: 'This PIN number is to be shared with John M. for their completion verification',
  sessionBody: 'Share this PIN number with John M. for their completion verification',
}

/** The session card's own words. Who, when and where come from the booking. */
export const SESSION = { cta: 'Start Interview', running: '0:25:16' }

export const NOTES = {
  title: 'Add Notes',
  saved: 'Auto-saved',
  heading: 'Interview Notes',
  body: 'This is how to be written notes',
  bullet: 'Point 1',
}
