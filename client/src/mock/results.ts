import type { Tier } from '../lib/studyTypes'

/** A row of Completed Study Respondents (1627:96628). */
export interface ResultRow {
  id: string
  name: string
  role: string
  date: string
  score: number
  tier: Tier
  /** The frame draws a Rate Now button until the client has rated, then a flat "Rated". */
  rated?: boolean
}

export const RESULT_ROWS: ResultRow[] = [
  { id: 'ferry-l', name: 'Ferry L', role: 'Oncologist', date: 'Aug 10, 2026', score: 92, tier: 'platinum' },
  { id: 'james-k', name: 'James K', role: 'Oncologist', date: 'Aug 10, 2026', score: 92, tier: 'platinum' },
  { id: 'jordan-m', name: 'Jordan M', role: 'Cardiologist', date: 'Aug 9, 2026', score: 85, tier: 'gold' },
  { id: 'samantha-t', name: 'Samantha T', role: 'Neurologist', date: 'Aug 9, 2026', score: 78, tier: 'gold' },
  { id: 'emily-r', name: 'Emily R', role: 'Pediatrician', date: 'Aug 9, 2026', score: 88, tier: 'gold' },
  { id: 'michael-b', name: 'Michael B', role: 'Dermatologist', date: 'Aug 9, 2026', score: 90, tier: 'platinum' },
  { id: 'laura-j', name: 'Laura J', role: 'Endocrinologist', date: 'Aug 8, 2026', score: 76, tier: 'gold' },
  { id: 'kevin-w', name: 'Kevin W', role: 'Orthopedic Surgeon', date: 'Aug 8, 2026', score: 95, tier: 'platinum', rated: true },
  { id: 'nina-s', name: 'Nina S', role: 'Psychiatrist', date: 'Aug 8, 2026', score: 82, tier: 'gold', rated: true },
  { id: 'oliver-p', name: 'Oliver P', role: 'Gastroenterologist', date: 'Aug 8, 2026', score: 68, tier: 'silver', rated: true },
]

/** The three figures above the table, and the AI summaries card beside them. */
export const RESULT_STATS = [
  { label: 'Completed', value: '20', suffix: '/30 required' },
  { label: 'Avg. Trust Score', value: '92' },
  { label: 'Rated By You', value: '11', suffix: '/20 completed' },
]

export const SUMMARIES = {
  title: 'Results Summaries',
  body: 'Get AI Summaries of all the results',
  cta: 'Download',
}

/** The sealed certificate the frame ends the Results tab with. */
export const CERTIFICATE = {
  label: 'STUDY VERIFICATION CERTIFICATE',
  title: '21 of 21 completions verified human',
  body: "A sealed, signed proof that every respondent in this study passed identity and duplicate checks. Share the check link so your own stakeholders can confirm it independently — no need to trust Focus Insite's word for it.",
  meta: 'CERT ID · HL-C-7B4E-9N2X · Issued Aug 4, 2026',
  cta: 'Download',
}
