import type { Question, Study, StudyStatus, StudyType } from './types'

const DAY = 86_400_000

/** Dates are generated relative to now so the prototype never goes stale. */
export function at(offsetDays: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + offsetDays * DAY)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/** Offline placeholder thumbnail; no network needed. */
const img = (bg: string, fg: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23${bg}'/%3E%3Ccircle cx='68' cy='28' r='12' fill='%23${fg}'/%3E%3Cpath d='M12 82l26-30 18 20 12-12 20 22z' fill='%23${fg}'/%3E%3C/svg%3E`

const single = (id: string, prompt: string, options: string[]): Question =>
  ({ id, kind: 'single', prompt, options })
const multi = (id: string, prompt: string, options: string[], helper?: string): Question =>
  ({ id, kind: 'multi', prompt, options, helper })
const text = (id: string, prompt: string, placeholder?: string): Question =>
  ({ id, kind: 'text', prompt, placeholder })
const image = (id: string, prompt: string): Question => ({ id, kind: 'image', prompt })
const scale = (id: string, prompt: string, options: string[]): Question =>
  ({ id, kind: 'scale', prompt, options })

const CLIENTS = {
  rjp: { id: 'cl-rjp', name: 'RJP Pharma Ltd.', rating: 4.5, reviewCount: 124 },
  procto: { id: 'cl-procto', name: 'Procto Platform', rating: 4.2, reviewCount: 58 },
  northwind: { id: 'cl-northwind', name: 'Northwind Research', rating: 4.8, reviewCount: 211 },
  lumen: { id: 'cl-lumen', name: 'Lumen Health', rating: 3.9, reviewCount: 37 },
} as const

const NYC = [
  { id: 'loc-ts', label: 'Times Square', address: 'At 124, Prestige Empire, Jenn’s Street, Times Square, NYC, US 160248' },
  { id: 'loc-bk', label: 'Brooklyn Heights', address: 'At 8, Water Tower Road, Brooklyn Heights, NYC, US 160312' },
]

const slots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM']
const availability = [2, 3, 4, 6, 7].map((d) => ({ date: at(d), slots }))

/** Defaults every study shares, so each entry only states what differs. */
type Seed = Pick<Study, 'id' | 'title' | 'description' | 'type' | 'status' | 'reward' | 'durationMins'> &
  Partial<Study>

function mk(seed: Seed): Study {
  const daysLeft = seed.daysLeft ?? 18
  return {
    image: img('202623', '513303'),
    industry: 'Healthcare',
    matchScore: 88,
    endsAt: at(daysLeft),
    daysLeft,
    targetProfession: 'Physicians, Nurse Practitioners, Physician Assistants',
    client: CLIENTS.rjp,
    saved: false,
    screener: [],
    timeline: [],
    ...seed,
  } as Study
}

const SCREENER_CLINICAL: Question[] = [
  single('q1', 'Which best describes your current role?', [
    'Physician', 'Nurse Practitioner', 'Physician Assistant', 'Other clinical role',
  ]),
  multi('q2', 'Which of these do you prescribe or manage?', [
    'GLP-1 agonists', 'Insulin', 'Oral antidiabetics', 'None of these',
  ], 'Select as many applies'),
  scale('q3', 'How confident are you adjusting these plans?', ['Easy', 'Neutral', 'Hard']),
  text('q4', 'Briefly, where does current guidance fall short?', 'Type your answer here..'),
]

const SCREENER_CONSUMER: Question[] = [
  single('s1', 'How often do you shop online?', ['Daily', 'Weekly', 'Monthly', 'Rarely']),
  multi('s2', 'Which do you use?', ['Mobile app', 'Desktop', 'Tablet'], 'Select as many applies'),
  image('s3', 'Share picture/screenshot of your account with Procto Platform'),
]

export const STUDIES: Study[] = [
  mk({ id: 'st-01', title: 'GLP-1 Care Plans, Oncologist View',
    description: 'Share how you build and adjust GLP-1 care plans for oncology patients, and where current guidance falls short.',
    type: 'video_call', status: 'available', reward: 150, durationMins: 45, matchScore: 96,
    screener: SCREENER_CLINICAL, availability }),

  mk({ id: 'st-02', title: 'Inclusive education practices',
    description: 'A short survey on how inclusive teaching practices are applied day to day in mixed-ability classrooms.',
    type: 'survey', status: 'available', reward: 120, durationMins: 20, industry: 'Education',
    matchScore: 74, daysLeft: 9, client: CLIENTS.northwind,
    targetProfession: 'Teachers, Teaching Assistants, SENCOs',
    screener: [single('e1', 'Do you teach in a mixed-ability classroom?', ['Yes', 'No'])],
    tasks: [
      single('t1', 'How often do you adapt materials per pupil?', ['Every lesson', 'Weekly', 'Rarely']),
      text('t2', 'What is the biggest barrier to inclusive practice?', 'Describe in a few lines..'),
      scale('t3', 'How well supported do you feel?', ['Easy', 'Neutral', 'Hard']),
    ] }),

  mk({ id: 'st-03', title: 'Retail pharmacy layout walkthrough',
    description: 'Walk a researcher through how you navigate a pharmacy floor, find products and reach the counter.',
    type: 'in_person', status: 'invited_to_apply', reward: 200, durationMins: 60, industry: 'Retail',
    matchScore: 91, daysLeft: 12, locations: NYC, availability, client: CLIENTS.procto,
    targetProfession: 'Pharmacists, Pharmacy Technicians',
    screener: SCREENER_CONSUMER }),

  mk({ id: 'st-04', title: 'Telehealth triage, group session',
    description: 'A moderated group discussion on triaging patients through telehealth intake, with five other clinicians.',
    type: 'group_video_call', status: 'invited_to_apply', reward: 175, durationMins: 90,
    matchScore: 83, daysLeft: 6, availability, client: CLIENTS.lumen,
    screener: SCREENER_CLINICAL }),

  mk({ id: 'st-05', title: 'Daily glucose tracking habits',
    description: 'A five day diary on how you record glucose readings, what you skip, and what gets in the way.',
    type: 'diary', status: 'available', reward: 250, durationMins: 15, matchScore: 79, daysLeft: 21,
    diary: { totalDays: 5, minDays: 4, completedDays: [] },
    screener: [single('d1', 'Do you track glucose daily?', ['Yes', 'No'])],
    tasks: [
      text('dt1', 'What did you record today, and what did you skip?', 'Type your answer here..'),
      scale('dt2', 'How difficult was tracking today?', ['Easy', 'Neutral', 'Hard']),
    ] }),

  mk({ id: 'st-06', title: 'E-commerce checkout flow',
    description: 'Walk through a checkout journey and tell us where you hesitate, backtrack or abandon.',
    type: 'survey', status: 'draft', reward: 90, durationMins: 25, industry: 'Technology',
    matchScore: 68, daysLeft: 4, client: CLIENTS.procto,
    targetProfession: 'Online shoppers, 18+',
    screener: SCREENER_CONSUMER,
    timeline: [{ label: 'Application started', at: at(-2, 14, 20) }] }),

  mk({ id: 'st-07', title: 'Oncology EMR workflows',
    description: 'How you move through your EMR during a typical oncology consult, and where it slows you down.',
    type: 'video_call', status: 'applied', reward: 180, durationMins: 45, matchScore: 94, daysLeft: 15,
    availability, screener: SCREENER_CLINICAL,
    timeline: [{ label: 'Applied', at: at(-3, 10, 36) }] }),

  mk({ id: 'st-08', title: 'Cardiology device onboarding',
    description: 'Talk us through unboxing, setting up and first use of a new cardiac monitoring device.',
    type: 'video_call', status: 'invited_to_schedule', reward: 220, durationMins: 60,
    matchScore: 97, daysLeft: 11, availability, client: CLIENTS.lumen,
    targetProfession: 'Cardiologists, Cardiac Nurses',
    screener: SCREENER_CLINICAL,
    timeline: [
      { label: 'Applied', at: at(-6, 9, 12) },
      { label: 'Invited to schedule', at: at(-1, 16, 4) },
    ] }),

  mk({ id: 'st-09', title: 'Wellness app first impressions',
    description: 'Open a wellness app for the first time and answer a short set of questions as you go.',
    type: 'survey', status: 'invited_to_complete', reward: 75, durationMins: 15, industry: 'Wellness',
    matchScore: 71, daysLeft: 3, client: CLIENTS.northwind,
    targetProfession: 'General public, 18+',
    screener: [single('w1', 'Have you used a wellness app before?', ['Yes', 'No'])],
    tasks: [
      single('wt1', 'What did you notice first?', ['The layout', 'The colours', 'The copy', 'The sign-up']),
      multi('wt2', 'Which features would you use?', ['Sleep', 'Steps', 'Mood', 'Nutrition'], 'Select as many applies'),
      text('wt3', 'What would stop you signing up?', 'Describe your experience here..'),
    ],
    timeline: [
      { label: 'Applied', at: at(-5, 11, 0) },
      { label: 'Invited to complete', at: at(-1, 9, 30) },
    ] }),

  mk({ id: 'st-10', title: 'Nurse staffing software review',
    description: 'A guided session on how you build rotas, handle short-notice gaps and escalate cover.',
    type: 'video_call', status: 'scheduled', reward: 160, durationMins: 45, matchScore: 89, daysLeft: 14,
    availability, client: CLIENTS.northwind,
    targetProfession: 'Nurse Managers, Ward Leads',
    screener: SCREENER_CLINICAL,
    // 3 days out, never rescheduled: both reschedule rules currently pass.
    booking: { date: at(3), slot: '10:30 AM', rescheduleCount: 0 },
    timeline: [
      { label: 'Applied', at: at(-8, 10, 36) },
      { label: 'Invited to schedule', at: at(-4, 12, 0) },
      { label: 'Scheduled', at: at(-2, 15, 45) },
    ] }),

  mk({ id: 'st-11', title: 'Flagship store shopper study',
    description: 'An in-person session at our Times Square location, observing how you browse and decide.',
    type: 'in_person', status: 'pin_confirmed', reward: 210, durationMins: 60, industry: 'Retail',
    matchScore: 86, daysLeft: 2, locations: NYC, availability, client: CLIENTS.procto,
    targetProfession: 'General public, 18+',
    screener: SCREENER_CONSUMER, pinConfirmed: true,
    booking: { date: at(0, 14, 0), slot: '02:00 PM', locationId: 'loc-ts', rescheduleCount: 1 },
    timeline: [
      { label: 'Applied', at: at(-10, 9, 0) },
      { label: 'Scheduled', at: at(-5, 11, 20) },
      { label: 'PIN confirmed', at: at(0, 13, 58) },
    ] }),

  mk({ id: 'st-12', title: 'Sleep routine diary',
    description: 'Five days of short entries about your wind-down routine, interruptions and how you feel waking.',
    type: 'diary', status: 'in_process', reward: 240, durationMins: 15, industry: 'Wellness',
    matchScore: 81, daysLeft: 1, client: CLIENTS.lumen,
    targetProfession: 'General public, 18+',
    diary: { totalDays: 5, minDays: 4, completedDays: [1, 2, 3, 4] },
    screener: [single('sl1', 'Do you keep a regular bedtime?', ['Yes', 'No'])],
    tasks: [
      text('st1', 'Describe your wind-down routine tonight.', 'Type your answer here..'),
      scale('st2', 'How rested did you feel this morning?', ['Easy', 'Neutral', 'Hard']),
    ],
    timeline: [
      { label: 'Applied', at: at(-14, 10, 0) },
      { label: 'Diary completed', at: at(-1, 21, 40) },
    ] }),

  mk({ id: 'st-13', title: 'Patient intake forms, paper to digital',
    description: 'How your practice moved intake forms from paper to digital, and what broke along the way.',
    type: 'survey', status: 'paid', reward: 120, durationMins: 30, matchScore: 92, daysLeft: 0,
    saved: true, client: CLIENTS.northwind,
    screener: SCREENER_CLINICAL,
    clientReview: {
      stars: 5, comment: 'Thoughtful, detailed answers and great examples. A pleasure to work with.',
      expertise: 5, reliability: 5, communication: 5, trustDelta: 4,
    },
    timeline: [
      { label: 'Applied', at: at(-20, 10, 36) },
      { label: 'Survey Completed', at: at(-18, 13, 0) },
      { label: 'Paid', at: at(-17, 10, 0) },
    ] }),

  mk({ id: 'st-14', title: 'Fintech onboarding walkthrough',
    description: 'A session on opening a business account, verifying identity and funding it for the first time.',
    type: 'video_call', status: 'rejected', reward: 140, durationMins: 40, industry: 'Finance',
    matchScore: 52, daysLeft: 0, client: CLIENTS.procto,
    targetProfession: 'Small business owners',
    screener: SCREENER_CONSUMER,
    timeline: [
      { label: 'Applied', at: at(-30, 9, 15) },
      { label: 'Rejected', at: at(-28, 10, 30) },
    ] }),

  mk({ id: 'st-15', title: 'Beverage tasting focus group',
    description: 'An in-person group session tasting and comparing three new low-sugar drinks.',
    type: 'in_person_group', status: 'no_show', reward: 130, durationMins: 90, industry: 'Lifestyle',
    matchScore: 64, daysLeft: 0, locations: NYC, client: CLIENTS.procto,
    targetProfession: 'General public, 18+',
    screener: SCREENER_CONSUMER,
    booking: { date: at(-9, 13, 15), slot: '01:15 PM', locationId: 'loc-bk', rescheduleCount: 0 },
    timeline: [
      { label: 'Applied', at: at(-16, 11, 0) },
      { label: 'Scheduled', at: at(-12, 9, 0) },
      { label: 'No Show', at: at(-9, 13, 15) },
    ] }),

  mk({ id: 'st-16', title: 'Remote monitoring, clinician panel',
    description: 'A panel discussion on remote patient monitoring alerts, false positives and escalation paths.',
    type: 'group_video_call', status: 'applying', reward: 190, durationMins: 75, matchScore: 90,
    daysLeft: 8, availability, client: CLIENTS.lumen,
    screener: SCREENER_CLINICAL,
    timeline: [{ label: 'Application started', at: at(0, 9, 5) }] }),
]

/** Sanity helpers used by the store and by tests of the seed. */
export const ALL_TYPES: StudyType[] = [
  'survey', 'video_call', 'group_video_call', 'in_person', 'in_person_group', 'diary',
]

export const ALL_STATUSES: StudyStatus[] = [
  'available', 'invited_to_apply', 'applying', 'draft', 'applied', 'invited_to_schedule',
  'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show',
]
