import type { Tier } from '../lib/studyTypes'

/** A row of the Recruited applications table (1627:96535). */
export interface ApplicationRow {
  name: string
  role: string
  status: 'Applied' | 'Qualified' | 'Disqualified'
  score: number
  tier: Tier
}

export const APPLICATIONS: ApplicationRow[] = [
  { name: 'John M', role: 'Supply Chain Specialist', status: 'Applied', score: 92, tier: 'platinum' },
  { name: 'John M', role: 'Sales Strategist', status: 'Applied', score: 85, tier: 'gold' },
  { name: 'John M', role: 'Compliance Officer', status: 'Applied', score: 88, tier: 'gold' },
  { name: 'John M', role: 'Financial Consultant', status: 'Applied', score: 91, tier: 'platinum' },
  { name: 'Veronica L', role: 'Human Resources Manager', status: 'Qualified', score: 90, tier: 'platinum' },
  { name: 'John M', role: 'Operations Manager', status: 'Qualified', score: 92, tier: 'platinum' },
  { name: 'John M', role: 'Project Coordinator', status: 'Qualified', score: 78, tier: 'gold' },
  { name: 'John M', role: 'Business Analyst', status: 'Qualified', score: 86, tier: 'gold' },
  { name: 'John M', role: 'Market Research Analyst', status: 'Disqualified', score: 65, tier: 'silver' },
  { name: 'John M', role: 'Data Analyst', status: 'Disqualified', score: 70, tier: 'gold' },
]

/** A booked slot on a session study (1627:101612). */
export interface ScheduledRow {
  name: string
  role: string
  score: number
  tier: Tier
  day: string
  time: string
  /** The frame puts Join Now on the session about to start. */
  joinable?: boolean
}

export const SCHEDULED: ScheduledRow[] = [
  { name: 'Veronica L', role: 'Human Resources Manager', score: 90, tier: 'platinum', day: '12 Aug, Wed', time: '10:00 AM', joinable: true },
  { name: 'John M', role: 'Human Resources Manager', score: 90, tier: 'platinum', day: '16 Aug, Fri', time: '10:00 AM' },
  { name: 'Emily R', role: 'Marketing Director', score: 85, tier: 'gold', day: '16 Aug, Fri', time: '11:00 AM' },
  { name: 'Michael T', role: 'Software Engineer', score: 92, tier: 'platinum', day: '16 Aug, Fri', time: '12:00 PM' },
  { name: 'Sophia K', role: 'Product Designer', score: 88, tier: 'gold', day: '16 Aug, Fri', time: '1:00 PM' },
  { name: 'David L', role: 'Data Analyst', score: 87, tier: 'gold', day: '16 Aug, Fri', time: '2:00 PM' },
  { name: 'Olivia J', role: 'Project Manager', score: 91, tier: 'platinum', day: '16 Aug, Fri', time: '3:00 PM' },
  { name: 'James C', role: 'UX Researcher', score: 89, tier: 'gold', day: '16 Aug, Fri', time: '4:00 PM' },
  { name: 'Ava B', role: 'Sales Executive', score: 93, tier: 'platinum', day: '16 Aug, Fri', time: '5:00 PM' },
  { name: 'Lucas H', role: 'Content Writer', score: 86, tier: 'gold', day: '16 Aug, Fri', time: '6:00 PM' },
]

/** A booked group session (1627:104269). */
export interface GroupSession {
  title: string
  day: string
  time: string
  seats: string
  participants: string[]
}

export const GROUP_SESSIONS: GroupSession[] = [
  { title: 'Session 1', day: 'Aug 20, Friday', time: '12:00 PM - 12:40 PM', seats: '4 / 10 Seats', participants: ['J', 'R', 'T', 'U', 'M', 'O'] },
  { title: 'Session 2', day: 'Aug 21, Saturday', time: '12:00 PM - 12:40 PM', seats: '6 / 10 Seats', participants: ['A', 'L', 'K', 'S', 'P', 'E'] },
  { title: 'Session 3', day: 'Aug 22, Sunday', time: '12:00 PM - 12:40 PM', seats: '2 / 10 Seats', participants: ['N', 'D'] },
]
