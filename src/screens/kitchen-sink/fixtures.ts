import type { Study, StudyStatus } from '../../mock/types'

/** Inline placeholder so the kitchen sink needs no network. */
const IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23202623'/%3E%3Cpath d='M16 44l12-14 8 9 6-6 8 11z' fill='%23513303'/%3E%3C/svg%3E"

/** One sample study; `withStatus` clones it so every card state can be shown. */
export const SAMPLE: Study = {
  id: 'st-001',
  title: 'GLP-1 Care Plans, Oncologist View',
  description:
    'Share how you build and adjust GLP-1 care plans for oncology patients, and where current guidance falls short.',
  image: IMG,
  type: 'video_call',
  industry: 'Healthcare',
  matchScore: 96,
  reward: 150,
  durationMins: 45,
  endsAt: '2026-09-30T17:00:00Z',
  daysLeft: 18,
  targetProfession: 'Physicians, Nurse Practitioners, Physician Assistants',
  client: { id: 'cl-01', name: 'RJP Pharma Ltd.', rating: 4.5, reviewCount: 124 },
  status: 'available',
  saved: false,
  repeatRule: 'allow',
  linkCode: 'HL-001-A',
  preScreener: [],
  screener: [],
  timeline: [
    { label: 'Applied', at: '2026-05-13T10:36:00Z' },
    { label: 'Survey Completed', at: '2026-05-15T13:00:00Z' },
    { label: 'Paid', at: '2026-05-16T10:00:00Z' },
  ],
}

export function withStatus(status: StudyStatus, over: Partial<Study> = {}): Study {
  return { ...SAMPLE, id: `st-${status}`, status, ...over }
}

/** Every status the card can render, in journey order. */
export const ALL_STATUSES: StudyStatus[] = [
  'available', 'invited_to_apply', 'draft', 'applied', 'invited_to_schedule',
  'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid',
  'rejected', 'no_show', 'late_show',
]
