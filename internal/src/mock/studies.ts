import type { StudyType } from '../components/app/StudyTypeTag'

/**
 * The six studies the Studies list draws (1978:97400, 1874:72973,
 * 1906:19984), with every figure as drawn on each tab. The same six appear on
 * all three tabs; only the columns change. Stage two derives these.
 */
export interface StudyRow {
  id: string
  name: string
  thumb: string
  type: StudyType
  /** To Review */
  participants: string
  submittedOn: string
  totalCost: string
  /** Ongoing */
  completedOngoing: string
  lastActivity: string
  applications: string
  /** Completed */
  completedDone: string
  date: string
}

const img = (n: string) => `/img/studies/${n}-40.png`

export const STUDY_ROWS: StudyRow[] = [
  { id: 'st-goal', name: 'About goal-tracking methods', thumb: img('goal-tracking'), type: 'video', participants: '75', submittedOn: '30 Jul, 2026', totalCost: '$12,960', completedOngoing: '20/60', lastActivity: '30 Jul, 2026', applications: '68', completedDone: '60/60', date: '30 Jul, 2026' },
  { id: 'st-pay', name: 'How Do You Make Your Digital Payments Mostly?', thumb: img('digital-payments'), type: 'diary', participants: '125', submittedOn: '25 Jul, 2026', totalCost: '$23,490', completedOngoing: '16/50', lastActivity: '25 Jul, 2026', applications: '25', completedDone: '50/50', date: '25 Jul, 2026' },
  { id: 'st-sleep', name: 'Share About Your Sleep Cycle', thumb: img('sleep-cycle'), type: 'in-person', participants: '80', submittedOn: '15 Jul, 2026', totalCost: '$14,800', completedOngoing: '32/80', lastActivity: '15 Jul, 2026', applications: '48', completedDone: '70/80', date: '15 Jul, 2026' },
  { id: 'st-fitness', name: 'Fitness Tracker Apps Experience', thumb: img('fitness-tracker'), type: 'video-group', participants: '100', submittedOn: '20 Jul, 2026', totalCost: '$18,230', completedOngoing: '24/40', lastActivity: '20 Jul, 2026', applications: '54', completedDone: '40/40', date: '20 Jul, 2026' },
  { id: 'st-travel', name: 'Travel preferences and experiences', thumb: img('travel-preferences'), type: 'in-person-group', participants: '200', submittedOn: '10 Jul, 2026', totalCost: '$28,040', completedOngoing: '18/60', lastActivity: '10 Jul, 2026', applications: '18', completedDone: '60/60', date: '10 Jul, 2026' },
  { id: 'st-social', name: 'Social media posts designing apps', thumb: img('social-media'), type: 'survey', participants: '150', submittedOn: '10 Jul, 2026', totalCost: '$24,560', completedOngoing: '36/50', lastActivity: '10 Jul, 2026', applications: '62', completedDone: '50/50', date: '10 Jul, 2026' },
]

/** The heading over each tab's table, as drawn. */
export const STUDY_COUNTS = { review: '6 studies to be reviewed', ongoing: '18 Studies', completed: '18 Studies' }
