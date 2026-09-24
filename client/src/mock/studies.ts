import type { StudyStatus, StudyType } from '../lib/studyTypes'

export interface StudyRow {
  id: string
  /** Exactly as the frame writes it, including its capitalisation. */
  name: string
  type: StudyType
  status: StudyStatus
  required: number
  qualified: number
  completed: number
  created: string
  /** The cards frame writes four of these titles in sentence case. */
  cardName?: string
  /** Card view only: thumbnail, run dates, progress. */
  image?: string
  dates?: string
  daysLeft?: string
  completedPct?: number
  /**
   * The three bar segments the cards frame draws: completed, screening and
   * remaining, in percent. The frame draws these rather than computing them
   * from required/qualified/completed, so they are measured off the frame.
   */
  segments?: [number, number, number]
  breakdown?: { completed: number; screening: number; remaining: number }
}

/**
 * Seeded from the Studies frames: Ongoing table (1518:90600), Ongoing cards
 * (1518:90966), Drafts (1518:90624) and Completed (1518:90760). Names, types,
 * numbers and dates are the frames' own, including the two places where the
 * same title is written with different capitalisation.
 */
export const ONGOING: StudyRow[] = [
  {
    id: 'st-goal', name: 'About goal-tracking methods', type: 'video_call', status: 'recruiting',
    required: 40, qualified: 20, completed: 0, created: '30 Jul, 2026',
    image: '/img/goals.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 0, segments: [0, 55, 45],
  },
  {
    id: 'st-pay', name: 'How Do You Make Your Digital Payments Mostly?', cardName: 'How do you make your digital payments mostly?', type: 'diary', status: 'recruiting',
    required: 12, qualified: 8, completed: 3, created: '25 Jul, 2026',
    image: '/img/card.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 25, segments: [25, 55, 20],
    breakdown: { completed: 3, screening: 6, remaining: 3 },
  },
  {
    id: 'st-sleep', name: 'Share About Your Sleep Cycle', cardName: 'Share about your sleep cycle', type: 'in_person', status: 'billing',
    required: 60, qualified: 64, completed: 60, created: '15 Jul, 2026',
    image: '/img/sleep.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 100, segments: [100, 0, 0],
  },
  {
    id: 'st-fitness', name: 'Fitness Tracker Apps Experience', cardName: 'Fitness tracker apps experience', type: 'group_video_call', status: 'billing',
    required: 60, qualified: 32, completed: 20, created: '20 Jul, 2026',
    image: '/img/runner.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 33, segments: [33, 33, 34],
  },
  {
    id: 'st-travel', name: 'Travel preferences and experiences', type: 'in_person_group', status: 'billing',
    required: 45, qualified: 40, completed: 45, created: '10 Jul, 2026',
    image: '/img/airport.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 100, segments: [100, 0, 0],
  },
  {
    id: 'st-social', name: 'Social media posts designing apps', type: 'survey', status: 'recruiting',
    required: 12, qualified: 8, completed: 5, created: '10 Jul, 2026',
    image: '/img/canva.jpg', dates: 'Jan 25 – Feb 24', daysLeft: '16 days left', completedPct: 25, segments: [25, 55, 20],
  },
]

/** Drafts (1518:90624): five rows, Study Name / Type / Created only. */
export const DRAFTS: StudyRow[] = [
  { id: 'dr-1', name: 'About goal-tracking methods', type: 'survey', status: 'draft', required: 0, qualified: 0, completed: 0, created: '30 Jul, 2026' },
  { id: 'dr-2', name: 'How Do You Make Your Digital Payments Mostly?', type: 'diary', status: 'draft', required: 0, qualified: 0, completed: 0, created: '25 Jul, 2026' },
  { id: 'dr-3', name: 'Social Media Posts Designing Apps', type: 'in_person', status: 'draft', required: 0, qualified: 0, completed: 0, created: '15 Jul, 2026' },
  { id: 'dr-4', name: 'Fitness Tracker Apps Experience', type: 'video_call', status: 'draft', required: 0, qualified: 0, completed: 0, created: '20 Jul, 2026' },
  { id: 'dr-5', name: 'Share About Your Sleep Cycle', type: 'in_person_group', status: 'draft', required: 0, qualified: 0, completed: 0, created: '10 Jul, 2026' },
]

/** Completed (1518:90760): Study Name / Type / Required / Completed / Created. */
export const COMPLETED: StudyRow[] = [
  { id: 'cp-1', name: 'Social media posts designing apps', type: 'survey', status: 'completed', required: 30, qualified: 0, completed: 30, created: '30 Jul, 2026' },
  { id: 'cp-2', name: 'How Do You Make Your Digital Payments Mostly?', type: 'diary', status: 'completed', required: 30, qualified: 0, completed: 25, created: '25 Jul, 2026' },
  { id: 'cp-3', name: 'Social Media Posts Designing Apps', type: 'in_person', status: 'completed', required: 35, qualified: 0, completed: 32, created: '15 Jul, 2026' },
  { id: 'cp-4', name: 'Fitness Tracker Apps Experience', type: 'video_call', status: 'completed', required: 60, qualified: 0, completed: 60, created: '20 Jul, 2026' },
  { id: 'cp-5', name: 'Share About Your Sleep Cycle', type: 'in_person_group', status: 'completed', required: 50, qualified: 0, completed: 40, created: '10 Jul, 2026' },
]

/** The paused study drawn on 1704:143783. */
export const PAUSED_STUDY = {
  id: 'st-goal',
  breadcrumb: 'Business Finance Operations Study',
  type: 'video_call' as StudyType,
  title: 'About goal-tracking methods',
  duration: '1 hour',
  industry: 'Business',
  status: 'Recruiting',
  completed: '20', completedOf: '/30',
  qualified: '35', qualifiedOf: '/60 applied',
  daysRemaining: '36',
  progress: '66%',
  description: 'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.',
  shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
  activeSince: 'July 10, 2026, 02:30 PM',
  image: '/img/goals.jpg',
}

/**
 * The study the Manage frames are drawn around (1627:95956, 1627:96085).
 * Its Manage Study review is the Create flow's four steps read back.
 */
export const MANAGED_STUDY = {
  id: 'st-pay',
  breadcrumb: 'Mobile App Usability Testing',
  type: 'diary' as StudyType,
  title: 'How do you make your digital payments mostly?',
  duration: '1 hour',
  industry: 'Finance',
  status: 'Recruiting',
  completed: '20', completedOf: '/30',
  qualified: '35', qualifiedOf: '/60 applied',
  daysRemaining: '36',
  progress: '66%',
  description: 'Share about your ways of digital spending and payment methods you use in your daily life.',
  shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
  activeSince: 'July 10, 2026, 02:30 PM',
  image: '/img/card.jpg',
  /** Manage Study, as the frame reads the four Create steps back. */
  review: {
    studyTime: '1 hour',
    estimatedAudience: '1K',
    audience: [
      { value: '10', icon: 'people' },
      { value: 'Worldwide', icon: 'pin' },
      { label: 'Gender', value: 'All' },
      { label: 'Education', value: 'High school graduate' },
      { label: 'Age', value: '18-22, 31-40' },
      { label: 'Age', value: '18-22, 31-40' },
      { label: 'Work Functions', value: 'Consultation' },
      { label: 'Roles', value: 'Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner' },
      { label: 'Industry', value: 'Healthcare, Pharma' },
      { label: 'Organization Size', value: 'Self employed, 1-10, 10-50' },
    ] as { label?: string; value: string; icon?: string }[],
    screener: { label: 'Screening', value: '8 inputs' },
    /** The one row the study type changes: a survey reads "Survey Form: 10 inputs". */
    studyRow: { label: 'Diary Study Form', value: '5 questions, 5 days logs' },
    incentive: { label: 'Incentive', value: '$700' },
  },
}

/**
 * The same two Manage frames drawn for a survey (1645:131436, 1645:131565).
 * Proving the collapse: same structure, different seed, and one row - the
 * study summary - that the type changes.
 */
export const MANAGED_SURVEY: typeof MANAGED_STUDY = {
  ...MANAGED_STUDY,
  id: 'st-social',
  breadcrumb: 'GLP-1 Care Plans, Oncologist View',
  type: 'survey' as StudyType,
  title: 'Social media posts designing apps',
  duration: '30 minutes',
  industry: 'Consumer',
  description: 'How do you design social media posts and what tools do you use for it',
  image: '/img/canva.jpg',
  review: {
    ...MANAGED_STUDY.review,
    studyTime: '30 minutes',
    audience: MANAGED_STUDY.review.audience.map((a) =>
      (a.label === 'Roles' ? { ...a, value: 'Social Media Influencer, Creator, Digital Marketer, Graphic Designer' } : a)),
    studyRow: { label: 'Survey Form', value: '10 inputs' },
  },
}

/**
 * The session flavours of the Manage screens. The Recruited frames for
 * In-Person (1627:101612) and Group Video Call (1627:104269) are drawn on
 * these two studies, and the tab reads the booked state off `type`.
 */
export const MANAGED_INPERSON: typeof MANAGED_STUDY = {
  ...MANAGED_STUDY,
  id: 'st-sleep',
  breadcrumb: 'Sleep Cycle Interviews',
  type: 'in_person' as StudyType,
  title: 'Share about your sleep cycle',
  industry: 'Healthcare',
  description: 'Share about your sleep cycle, how you track it and what changes it through the week.',
  image: '/img/sleep.jpg',
  review: { ...MANAGED_STUDY.review, studyRow: { label: 'In-Person', value: '2 addresses, available 5 days/week, custom timings, 2 days overrides' } },
}

export const MANAGED_GROUP: typeof MANAGED_STUDY = {
  ...MANAGED_INPERSON,
  id: 'st-fitness',
  breadcrumb: 'Fitness Tracker Group Sessions',
  type: 'group_video_call' as StudyType,
  title: 'Fitness tracker apps experience',
  description: 'Talk through the fitness tracker apps you use and what keeps you coming back to them.',
  image: '/img/runner.jpg',
}

/** Every study the Manage screens can be opened on, by route id. */
export const MANAGED = [MANAGED_STUDY, MANAGED_SURVEY, MANAGED_INPERSON, MANAGED_GROUP]

export const managedStudy = (id?: string) => MANAGED.find((s) => s.id === id) ?? MANAGED_STUDY
