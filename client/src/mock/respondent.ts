
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

const SITUATION = 'Which of the following best describes your current situation?'
const TRACK = 'I regularly track experiences'
const MULTI = ['I rarely or never record experiences over time', 'Track habits over multiple days for personal, work, or research purposes']
const MATRIX: Answer = {
  kind: 'matrix',
  columns: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'],
  rows: [{ label: 'Step  A', choice: 2 }, { label: 'Step B', choice: 3 }, { label: 'Step B', choice: 4 }],
}

/** The screener the respondent answered, as the frame lists it back. */
export const SCREENER_ANSWERS: QA[] = [
  { prompt: SITUATION, answer: { kind: 'text', value: TRACK } },
  { prompt: SITUATION, answer: { kind: 'bullets', values: MULTI } },
  { prompt: SITUATION, answer: { kind: 'text', value: 'I regularly track experiences or habits' } },
  { prompt: 'How many times do you test your glucose in a month?', answer: { kind: 'text', value: '4' } },
  {
    prompt: SITUATION,
    answer: {
      kind: 'text',
      value: 'I regularly track experiences or habits over multiple days for personal, work, or research purposes. I occasionally note down experiences, but not in any regular way. Kept notes about daily routines or experiences',
    },
  },
  { prompt: 'Average reading of glucose', answer: { kind: 'text', value: '125' } },
  {
    prompt: 'Order the frequency of visits since diagnosed from recent as first to old as last',
    answer: { kind: 'ordered', values: ['0-2 times a month', '2-4 times a month', '4-6 times a month', '6-8 times a month'] },
  },
  { prompt: "Upload a picture of prescribed medicines you're taking currently", answer: { kind: 'file', name: 'IMG213546879.pdf', size: '5 MB' } },
  { prompt: 'Rate the steps of process of testing your glucose at home', answer: MATRIX },
]

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
