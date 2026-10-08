/**
 * Review a new study (section 1982:104844), every string as drawn. All six
 * type variants draw the same study ("About goal-tracking methods") under the
 * same breadcrumb ("Social media posts designing apps"); only the type tag and
 * the Study tab change. Stage two derives these from the study itself.
 */
export const REVIEW = {
  crumb: 'Social media posts designing apps',
  title: 'About goal-tracking methods',
  thumb: '/img/review/header-thumb.png',
  participants: '10',
  cost: '$12,960',
  submitted: '30 Jul, 2026, 11:00 AM',
  about: {
    description: 'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.',
    studyTime: '30 minutes',
    thumbnail: '/img/review/thumbnail.png',
  },
}

export const CLIENT = {
  name: 'Jennifer Lee',
  role: 'Product Manager',
  email: 'jenniferlee@soulfullabs.ai',
  avatar: '/img/review/jennifer-lee.png',
  workspace: [
    ['Company Name', 'SoulfulLabs'],
    ['VAT No.', 'EAS56893231459'],
    ['Website', 'https://www.soulfullabs.ai'],
    ['Industry', 'IT & Consultation'],
    ['Location', 'NYC, New York, USA'],
  ],
  metrics: [
    ['Completed studies', '20'],
    ['Total spent', '$150K'],
    ['Verification', 'Govt. ID Verified'],
    ['Member since', 'Jan 1, 2022'],
  ],
}

/** A pill on the Audience tab: an optional grey label, then the value. */
export type AudiencePill = { label?: string; value: string; icon?: 'users' | 'pin' }

export const AUDIENCE: { heading: string; gap: 'tight' | 'loose'; pills: AudiencePill[] }[] = [
  { heading: 'Target Audience', gap: 'tight', pills: [
    { value: '10', icon: 'users' },
    { value: 'Worldwide', icon: 'pin' },
    { label: 'Gender:', value: 'All' },
    { label: 'Education:', value: 'High school graduate' },
    { label: 'Age:', value: '18-22, 31-40' },
  ] },
  { heading: 'Work details', gap: 'loose', pills: [
    { label: 'Work Functions:', value: 'Consultation' },
    { label: 'Roles:', value: 'Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner' },
    { label: 'Industry:', value: 'Healthcare, Pharma' },
    { label: 'Skills:', value: 'Therapy, Yoga, Weight Loss, Keto Diet' },
  ] },
  { heading: 'Conditions to apply', gap: 'tight', pills: [
    { value: 'Has never participated in any study with Soulful Labs (You) before' },
    { label: 'Profile Tiers:', value: 'Platinum, Gold' },
  ] },
]

export type Verdict = 'Correct' | 'Incorrect' | 'May Select' | 'Must Select'
export interface Question {
  kind: string
  answers?: [string, Verdict][]
  placeholder?: string
}

const PROMPT = 'What are your top ways to document and track your life goals?'
export const QUESTION_PROMPT = PROMPT

const SINGLE: Question = { kind: 'Single-select', answers: [['Answer A', 'Correct'], ['Answer B', 'Incorrect']] }
const MULTI: Question = { kind: 'Multi-select', answers: [['Answer A', 'May Select'], ['Answer B', 'Must Select'], ['Answer C', 'Incorrect']] }
const LINE: Question = { kind: 'Single-line input', placeholder: 'Participants will enter a short text response here…' }
const NUMBER: Question = { kind: 'Number input', placeholder: 'Participants will enter a number in text response' }

/**
 * The four questions each frame shows before its bottom edge. The frames hold
 * nine blocks in all; five sit below the fold and cannot be screenshotted.
 */
export const QUESTIONS: Question[] = [SINGLE, MULTI, LINE, NUMBER]
/** The Screener tab labels its first three "Pre-screener - Qn" and the fourth plain "Q4", as drawn. */
export const SCREENER_LABELS = ['Pre-screener - Q1', 'Pre-screener - Q2', 'Pre-screener - Q3', 'Q4']
export const SURVEY_LABELS = ['Q1', 'Q2', 'Q3', 'Q4']

export const DIARY = {
  setup: [['Duration Unit:', 'Days'], ['Frequency:', 'Every 2 days'], ['Study Duration:', '5 days'], ['Minimum Required:', '4 days']],
  /** Two days are visible; a third sits below the fold. */
  days: ['DAY 1', 'DAY 2'],
  questions: [SINGLE, LINE],
}

export const AVAILABILITY = {
  buffer: '15 minutes',
  bufferHelp: 'It is a duration gap added between consecutive scheduled meetings.',
  notice: '10',
  noticeUnit: 'Minutes',
  noticeHelp: 'Set how much notice time is required to scheduled a slot before the current time.',
  overridesHelp: 'Add dates when your availability changes from your daily hours.',
  overrides: [['Aug 20, Friday', '12:00 AM - 12:00 AM'], ['Aug 25, Monday', 'Unavailable']],
  /** Each day's ranges; Friday draws two. */
  week: [['Monday', 1], ['Tuesday', 1], ['Wednesday', 1], ['Thursday', 1], ['Friday', 2]] as [string, number][],
  time: '12:00 AM',
}

export const ADDRESS = {
  help: 'Add your commercial addresses for participants to book in-person interviews at.',
  name: 'Carolina, Taxas, USA',
  line: 'A-123, Empire State, Hamburg Street 2, Carolina, Texas, USA - 10001',
}

export const GROUP = {
  seats: '10 seats',
  seatsHelp: 'Max number of study participants',
  video: [['Session 1', 'Aug 20, Friday', '12:00 PM - 12:40 PM'], ['Session 2', 'Aug 21, Friday', '12:00 PM - 12:40 PM']],
  inPerson: [['Session 1', 'Aug 20, Friday', '12:00 PM - 12:40 PM'], ['Session 2', 'Aug 20, Friday', '12:00 PM - 12:40 PM']],
}

export const PAYMENT = {
  totalCost: '$16,510',
  depositPaid: '$3,000',
  incentive: '$700',
  suggested: 'Suggested: $700',
  autoPay: 'On',
  card: '4242',
  /** label, detail line, amount, info icon, bold */
  billing: [
    { label: 'Platform Fee', amount: '$100' },
    { label: 'Recruiting Fee', detail: '$20 x 25 participants', amount: '$500', info: true },
    { label: 'Incentives', detail: '$100 x 25 participants', amount: '$2,500', info: true },
    { label: 'Moderation Fee', detail: '$10 x 25 participants', amount: '$250', info: true },
  ],
  totals: [
    { label: 'Total cost', amount: '$16,510' },
    { label: 'Less: Incentive Deposit', detail: '$100 x 30 participants', amount: '-$3000', info: true },
  ],
  net: { label: 'Net payable cost', amount: '$13,510' },
  transaction: { title: 'Incentive Deposit Paid', amount: '$3,000', when: 'Aug 5, 2026, 10:24 AM', detail: '$20 x 30 participants' },
}

export const REVISIONS = {
  requested: {
    title: 'Requested changes.',
    greeting: 'Hey Jennifer,',
    intro: 'We have reviewed your study and noticed the following things should be updated:',
    items: [
      ['About section:', 'Description is too vague which should be easy to understand what study is about.'],
      ['Screener section:', 'The questions’ answers of are not appropriate as pr the type of questions.'],
    ],
    outro: 'You can just update the above changes and tr-submit it to get it live asap. Thanks!',
    when: 'Aug 7, 2026, 10:42 PM',
  },
  created: { title: 'Created and submitted the study for review.', when: 'Aug 7, 2026, 10:42 PM' },
}
