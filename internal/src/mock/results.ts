import type { StudyType } from '../components/app/StudyTypeTag'
import type { Tier } from '../components/app/TierTag'

/**
 * Results, the respondent page and the session page as drawn across the six
 * Manage sections (turn 7). Every string is from the frames, slips included
 * ("succefully", "The diary study has been..." on the survey frame).
 */
export interface ResultRow { id: string; name: string; role: string; date: string; score: string; tier: Tier; rated: boolean; session: 'S1' | 'S2' }

/** Ten completed respondents. The two group frames score the last two differently, as drawn. */
export const resultRows = (group: boolean): ResultRow[] => [
  { id: 'r1', name: 'Ferry L', role: 'Oncologist', date: 'Aug 10, 2026', score: '92', tier: 'Platinum', rated: false, session: 'S1' },
  { id: 'r2', name: 'James K', role: 'Oncologist', date: 'Aug 10, 2026', score: '92', tier: 'Platinum', rated: false, session: 'S1' },
  { id: 'r3', name: 'Jordan M', role: 'Cardiologist', date: 'Aug 9, 2026', score: '85', tier: 'Gold', rated: false, session: 'S1' },
  { id: 'r4', name: 'Samantha T', role: 'Neurologist', date: 'Aug 9, 2026', score: '78', tier: 'Gold', rated: false, session: 'S1' },
  { id: 'r5', name: 'Emily R', role: 'Pediatrician', date: 'Aug 9, 2026', score: '88', tier: 'Gold', rated: false, session: 'S2' },
  { id: 'r6', name: 'Michael B', role: 'Dermatologist', date: 'Aug 9, 2026', score: '90', tier: 'Platinum', rated: false, session: 'S2' },
  { id: 'r7', name: 'Laura J', role: 'Endocrinologist', date: 'Aug 8, 2026', score: '76', tier: 'Gold', rated: false, session: 'S2' },
  { id: 'r8', name: 'Kevin W', role: 'Orthopedic Surgeon', date: 'Aug 8, 2026', score: '95', tier: 'Platinum', rated: true, session: 'S2' },
  { id: 'r9', name: 'Nina S', role: 'Psychiatrist', date: 'Aug 8, 2026', score: group ? '64' : '82', tier: group ? 'Silver' : 'Gold', rated: true, session: 'S2' },
  { id: 'r10', name: 'Oliver P', role: 'Gastroenterologist', date: 'Aug 8, 2026', score: group ? '89' : '68', tier: group ? 'Gold' : 'Silver', rated: true, session: 'S2' },
]

export const RESULT_SESSIONS = [{ id: 's1', code: 'S1', when: 'Aug 20, 2026, 10:00 AM' }, { id: 's2', code: 'S2', when: 'Aug 21, 2026, 10:00 AM' }]

export type Tile = [label: string, value: string, rest?: string]
/** What the Results tab draws for each type: its tiles, its summary card, and whether Download carries a chevron. */
export const RESULTS: Record<StudyType, { tiles: Tile[]; summary: [string, string]; chevron: boolean }> = {
  survey: { tiles: [['Completed', '20', '/30 required'], ['Avg. Trust Score', '92'], ['Rated By You', '11', '/20 completed']], summary: ['Results Summaries', 'Get AI Summaries of all the results'], chevron: false },
  diary: { tiles: [['Completed', '20', '/30 required'], ['Avg. Trust Score', '92'], ['Rated By You', '11', '/20 completed']], summary: ['Results Summaries', 'Get AI Summaries of all the results'], chevron: true },
  video: { tiles: [['Completed', '20', '/30 required'], ['Avg. Trust Score', '92'], ['Rated By You', '11', '/20 completed']], summary: ['Results Summaries', 'Get AI Summaries of all the results'], chevron: false },
  'in-person': { tiles: [['Sessions Completed', '2', '/3'], ['Participants Completed', '20', '/30 required'], ['Avg. Trust Score', '92']], summary: ['Notes Summaries', 'Get all the Notes results archive'], chevron: true },
  'video-group': { tiles: [['Completed', '10', '/10 required'], ['Avg. Trust Score', '96']], summary: ['Results Summaries', 'Get AI Summaries of all the results'], chevron: true },
  'in-person-group': { tiles: [['Completed', '10', '/10 required'], ['Avg. Trust Score', '96']], summary: ['Notes Summaries', 'Get all the Notes results archive'], chevron: true },
}

export const CERTIFICATE = {
  eyebrow: 'STUDY VERIFICATION CERTIFICATE', title: '21 of 21 completions verified human',
  body: 'A sealed, signed proof that every respondent in this study passed identity and duplicate checks. Share the check link so your own stakeholders can confirm it independently — no need to trust Focus Insite’s word for it.',
  foot: ['CERT ID · HL-C-7B4E-9N2X', 'Issued Aug 4, 2026'],
}

export const DOWNLOADS = [
  { name: 'Session 1', when: 'Aug 20, Fri, 12:00 PM ET', detail: ['4 participants', 'Recordings + Transcript'] },
  { name: 'Session 2', when: 'Aug 20, Fri, 12:00 PM ET', detail: ['6 participants', 'Recordings + Transcript'] },
]

/** The respondent card beside every respondent page. Group sections name the person Sarah K, the rest John M. */
export const RESPONDENT = {
  role: 'Human Resource Manager', facts: ['12 years experience', 'New York, USA', 'Cert. ID: HL-R-9F2A-3K7P'],
  trust: '95', tier: 'Platinum' as Tier,
  ratings: [['Expertise', '98%', 'green'], ['Reliability', '100%', 'blue'], ['Communication', '94%', 'purple'], ['Success Rate', '89%', 'yellow']] as [string, string, 'green' | 'blue' | 'purple' | 'yellow'][],
  about: [['Education', 'MBBS, BHMS'], ['Gender', 'Male'], ['Age', '31 years']],
  verified: ['Government ID Verified', 'Live Photo Verified', 'Verified Professional', 'NPI cross checked'],
  metrics: [['Completed Studies', '100'], ['Earned', '$5K+'], ['Highest Streak', '24 weeks']],
}

const SITUATION = 'Which of the following best describes your current situation?'
export type Answer =
  | { q: string; prompt: string; text: string }
  | { q: string; prompt: string; bullets: string[] }
  | { q: string; prompt: string; ordered: string[] }
  | { q: string; prompt: string; file: [string, string] }
  | { q: string; prompt: string; matrix: { cols: string[]; rows: [string, number][] } }

const Q1: Answer = { q: 'Q1', prompt: SITUATION, text: 'I regularly track experiences' }
const Q2: Answer = { q: 'Q2', prompt: SITUATION, bullets: ['I rarely or never record experiences over time', 'Track habits over multiple days for personal, work, or research purposes'] }
const Q3: Answer = { q: 'Q3', prompt: SITUATION, text: 'I regularly track experiences or habits' }
const Q9: Answer = { q: 'Q9', prompt: 'Rate the steps of process of testing your glucose at home', matrix: { cols: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], rows: [['Step  A', 2], ['Step B', 3], ['Step B', 4]] } }

/** The nine answers on every screener, and on the survey's Study Result. */
export const ANSWERS: Answer[] = [
  Q1, Q2, Q3,
  { q: 'Q4', prompt: 'How many times do you test your glucose in a month?', text: '4' },
  { q: 'Q5', prompt: SITUATION, text: 'I regularly track experiences or habits over multiple days for personal, work, or research purposes. I occasionally note down experiences, but not in any regular way. Kept notes about daily routines or experiences' },
  { q: 'Q6', prompt: 'Average reading of glucose', text: '125' },
  { q: 'Q7', prompt: 'Order the frequency of visits since diagnosed from recent as first to old as last', ordered: ['0-2 times a month', '2-4 times a month', '4-6 times a month', '6-8 times a month'] },
  { q: 'Q8', prompt: 'Upload a picture of prescribed medicines you’re taking currently', file: ['IMG213546879.pdf', '5 MB'] },
  Q9,
]
/** The diary's Study Result: three days. */
export const DIARY_ANSWERS: [string, Answer[]][] = [['DAY 1', [Q1, Q2]], ['DAY 2', [Q1, Q2, Q3]], ['DAY 3', [Q1, Q2, Q9]]]

export interface ActivityItem { text: string; bold?: string; when: string; sub?: [string, string][]; strong?: boolean }

/** A survey respondent's activity (1932:108923): four steps, no session. */
export const SHORT_ACTIVITY: ActivityItem[] = [
  { text: 'Applied to study', when: 'Aug 5, 2026, 10:42 PM' },
  { text: 'Qualified and invited for the study', when: 'Aug 7, 2026, 10:42 PM' },
  { text: 'Completed the study succefully.', when: 'Aug 7, 2026, 10:42 PM' },
  { text: 'Rewarded the incentive $250 successfully.', when: 'Aug 7, 2026, 10:42 PM' },
]
/** Everyone else's: scheduled, then completed in two steps (PIN by the participant, marked by the client), then rewarded. */
export const sessionActivity = (who: string, at: boolean, strongReward = false): ActivityItem[] => [
  { text: 'Applied to study', when: 'Aug 5, 2026, 10:42 PM' },
  { text: 'Qualified and invited for the study', when: 'Aug 7, 2026, 10:42 PM' },
  { text: 'Scheduled for ', bold: `August 12, 2026, Wednesday, 10:00 AM${at ? ', at Carolina, Texas, USA' : ''}`, when: 'Aug 7, 2026, 10:42 PM' },
  { text: 'Completed the study successfully.', when: '', sub: [[`Verified with PIN by ${who} (participant)`, 'Aug 12, 2026, 10:05 AM'], ['Marked as completed by client (you)', 'Aug 12, 2026, 10:42 AM']] },
  { text: 'Rewarded the incentive $250 successfully.', when: 'Aug 15, 2026, 10:42 PM', strong: strongReward },
]

export const PIN = '152438'
export const SESSION_ADDRESS = 'A-123, Empire State, Hamburg Street 2, Carolina, Texas, USA - 10001'

export type Attendance = 'participant' | 'noshow' | 'todo'
export interface Participant { id: string; name: string; role: string; score: string; tier: Tier; attendance: Attendance }
/** The five people in a group session (1952:79052, 1952:79377). */
export const PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Sarah K', role: 'Housewife', score: '95', tier: 'Platinum', attendance: 'participant' },
  { id: 'p2', name: 'Lisa M', role: 'Content Creator', score: '85', tier: 'Gold', attendance: 'participant' },
  { id: 'p3', name: 'Jenna T', role: 'Student', score: '76', tier: 'Gold', attendance: 'noshow' },
  { id: 'p4', name: 'Raj S', role: 'Accountant', score: '54', tier: 'Silver', attendance: 'todo' },
  { id: 'p5', name: 'Carlos W', role: 'Content Creator', score: '62', tier: 'Silver', attendance: 'todo' },
]
