import type { Tier } from '../components/app/TierTag'

/**
 * The Matched and Recruited tabs as drawn (1952:76970, 1952:77106,
 * 1952:77242, 1952:77337, 1952:81128 and their siblings in the other five
 * type sections). The people are the same in every section.
 */
export interface Match { id: string; initial: string; name: string; role: string; score: string; tier: Tier; verified?: boolean }

/** The first card is "Ferry L." with an "R" in its avatar, as drawn. */
export const MATCHED: Match[] = [
  { id: 'm1', initial: 'R', name: 'Ferry L.', role: 'Physiology Therapist, Orthopedic', score: '95%', tier: 'Platinum', verified: true },
  { id: 'm2', initial: 'S', name: 'Sophie A.', role: 'Clinical Psychologist', score: '89%', tier: 'Gold', verified: true },
  { id: 'm3', initial: 'E', name: 'Ella M.', role: 'Nutritionist', score: '87%', tier: 'Gold' },
  { id: 'm4', initial: 'T', name: 'Tom H.', role: 'Cardiologist', score: '95%', tier: 'Platinum' },
  { id: 'm5', initial: 'L', name: 'Liam T.', role: 'Orthopedic Surgeon', score: '93%', tier: 'Platinum', verified: true },
  { id: 'm6', initial: 'D', name: 'David P.', role: 'Gastroenterologist', score: '94%', tier: 'Platinum' },
  { id: 'm7', initial: 'J', name: 'James K.', role: 'Pediatrician', score: '91%', tier: 'Platinum', verified: true },
  { id: 'm8', initial: 'A', name: 'Ava R.', role: 'Dermatologist', score: '90%', tier: 'Platinum' },
  { id: 'm9', initial: 'N', name: 'Nina C.', role: 'Radiologist', score: '68%', tier: 'Silver' },
]

export type ApplicationStatus = 'Applied' | 'Qualified' | 'Disqualified'
export interface Application { id: string; name: string; role: string; status: ApplicationStatus; score: string; tier: Tier }

/** Ten applications. The group video frame names the first "Sarah K"; every other frame "John M". */
export const applications = (first: string): Application[] => [
  { id: 'a1', name: first, role: 'Supply Chain Specialist', status: 'Applied', score: '92', tier: 'Platinum' },
  { id: 'a2', name: 'John M', role: 'Sales Strategist', status: 'Applied', score: '85', tier: 'Gold' },
  { id: 'a3', name: 'John M', role: 'Compliance Officer', status: 'Applied', score: '88', tier: 'Gold' },
  { id: 'a4', name: 'John M', role: 'Financial Consultant', status: 'Applied', score: '91', tier: 'Platinum' },
  { id: 'a5', name: 'Veronica L', role: 'Human Resources Manager', status: 'Qualified', score: '90', tier: 'Platinum' },
  { id: 'a6', name: 'John M', role: 'Operations Manager', status: 'Qualified', score: '92', tier: 'Platinum' },
  { id: 'a7', name: 'John M', role: 'Project Coordinator', status: 'Qualified', score: '78', tier: 'Gold' },
  { id: 'a8', name: 'John M', role: 'Business Analyst', status: 'Qualified', score: '86', tier: 'Gold' },
  { id: 'a9', name: 'John M', role: 'Market Research Analyst', status: 'Disqualified', score: '65', tier: 'Silver' },
  { id: 'a10', name: 'John M', role: 'Data Analyst', status: 'Disqualified', score: '70', tier: 'Gold' },
]

export interface Booking { id: string; name: string; role: string; score: string; tier: Tier; day: string; time: string }

/** One-to-one studies: the booked sessions (video 1:1 1952:81128, in-person 1961:182930). */
export const SCHEDULED: Booking[] = [
  { id: 'b1', name: 'Veronica L', role: 'Human Resources Manager', score: '90', tier: 'Platinum', day: '12 Aug, Wed', time: '10:00 AM' },
  { id: 'b2', name: 'John M', role: 'Human Resources Manager', score: '90', tier: 'Platinum', day: '16 Aug, Fri', time: '10:00 AM' },
  { id: 'b3', name: 'Emily R', role: 'Marketing Director', score: '85', tier: 'Gold', day: '16 Aug, Fri', time: '11:00 AM' },
  { id: 'b4', name: 'Michael T', role: 'Software Engineer', score: '92', tier: 'Platinum', day: '16 Aug, Fri', time: '12:00 PM' },
  { id: 'b5', name: 'Sophia K', role: 'Product Designer', score: '88', tier: 'Gold', day: '16 Aug, Fri', time: '1:00 PM' },
  { id: 'b6', name: 'David L', role: 'Data Analyst', score: '87', tier: 'Gold', day: '16 Aug, Fri', time: '2:00 PM' },
  { id: 'b7', name: 'Olivia J', role: 'Project Manager', score: '91', tier: 'Platinum', day: '16 Aug, Fri', time: '3:00 PM' },
  { id: 'b8', name: 'James C', role: 'UX Researcher', score: '89', tier: 'Gold', day: '16 Aug, Fri', time: '4:00 PM' },
  { id: 'b9', name: 'Ava B', role: 'Sales Executive', score: '93', tier: 'Platinum', day: '16 Aug, Fri', time: '5:00 PM' },
  { id: 'b10', name: 'Lucas H', role: 'Content Writer', score: '86', tier: 'Gold', day: '16 Aug, Fri', time: '6:00 PM' },
]

export interface Session { id: string; name: string; day: string; time: string; address?: string; seats: string; people: string }
const ADDRESS = 'A-123, Empire State, Hamburg Street 2, Carolina, Texas, USA - 10001'

/** Group studies: the sessions (group video 1952:77337, in-person group 1961:185585). */
export const SESSIONS: Record<'video' | 'inPerson', Session[]> = {
  video: [
    { id: 's1', name: 'Session 1', day: 'Aug 20, Friday', time: '12:00 PM - 12:40 PM', seats: '4 / 10 Seats', people: 'JRTUMO' },
    { id: 's2', name: 'Session 2', day: 'Aug 21, Saturday', time: '1:00 PM - 1:40 PM', seats: '6 / 10 Seats', people: 'YQELFA' },
  ],
  inPerson: [
    { id: 's1', name: 'Session 1', day: 'Aug 20, Friday', time: '12:00 PM - 12:40 PM', address: ADDRESS, seats: '4 / 10 Seats', people: 'JRTUMO' },
    { id: 's2', name: 'Session 2', day: 'Aug 20, Friday', time: '12:00 PM - 12:40 PM', address: ADDRESS, seats: '6 / 10 Seats', people: 'JRTUMO' },
  ],
}

/** Respondent Profile Details (1932:109128): one profile is drawn, Ferry L.'s. */
export const PROFILE = {
  initial: 'F', name: 'Ferry L.', role: 'Physiology Therapist, Orthopedic',
  meta: ['New York, USA', '10 years experience', 'Cert. ID: HL-R-9F2A-3K7P'],
  trust: '95', tier: 'Platinum' as Tier,
  ratings: [
    { label: 'Expertise', value: '98%', colour: 'green' }, { label: 'Reliability', value: '100%', colour: 'blue' },
    { label: 'Communication', value: '94%', colour: 'purple' }, { label: 'Success Rate', value: '89%', colour: 'yellow' },
  ] as { label: string; value: string; colour: 'green' | 'blue' | 'purple' | 'yellow' }[],
  about: [['Occupation', 'Physician'], ['Industry', 'Healthcare, Pharma'], ['Education', 'MBBS, BHMS'], ['Gender & Age', 'Male  •  31 years'], ['Experience', '10 years'], ['Other Interests', 'Psychology, Neurology']],
  verified: ['Government ID Verified', 'Live Photo Verified', 'Verified Professional', 'NPI cross checked'],
  metrics: [['Completed Studies', '100'], ['Earned', '$5K+'], ['Highest Streak', '3 months']],
}
