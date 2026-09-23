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
