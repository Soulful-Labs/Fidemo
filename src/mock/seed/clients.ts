import type { Study } from '../types'

export type Client = Study['client']

/** Written reviews other respondents left for a client (PRD 6.16). */
export interface ClientReview {
  id: string
  study: string
  stars: number
  at: string
  comment: string
  participant: { name: string; stars: number; comment?: string }
}

const c = (id: string, name: string, rating: number, reviewCount: number): Client => ({ id, name, rating, reviewCount })

/** Ten clients, each with its own rating and review count. */
export const CLIENTS = {
  rjp: c('cl-rjp', 'RJP Pharma Ltd.', 4.5, 124),
  northwind: c('cl-northwind', 'Northwind Research', 4.8, 211),
  procto: c('cl-procto', 'Procto Platform', 4.2, 58),
  lumen: c('cl-lumen', 'Lumen Health', 3.9, 37),
  brightline: c('cl-brightline', 'Brightline Fintech', 4.1, 46),
  orbit: c('cl-orbit', 'Orbit Travel', 4.6, 89),
  meadow: c('cl-meadow', 'Meadow Foods', 4.7, 152),
  kinetic: c('cl-kinetic', 'Kinetic Labs', 4.4, 73),
  harbor: c('cl-harbor', 'Harbor Insurance', 4.0, 29),
  atlas: c('cl-atlas', 'Atlas Mobility', 4.3, 64),
} as const

const r = (
  id: string, study: string, stars: number, at: string, comment: string,
  participant: ClientReview['participant'],
): ClientReview => ({ id, study, stars, at, comment, participant })

/** Reviews per client, with their own dates, ratings and reply from the client. */
export const CLIENT_REVIEWS: Record<string, ClientReview[]> = {
  'cl-rjp': [
    r('rjp-1', 'Oncology treatment planning interviews', 5, '2026-08-14', 'Clear brief, the moderator knew the clinical detail and the session ran to time.', { name: 'Eliza D', stars: 5, comment: 'Thoughtful answers, a pleasure to work with.' }),
    r('rjp-2', 'Biologics adherence survey', 4, '2026-07-02', 'Survey was long but the questions were relevant to daily practice.', { name: 'Marcus W', stars: 4 }),
    r('rjp-3', 'Specialist pharmacist panel', 5, '2026-05-19', 'Paid within two days. Would take part again.', { name: 'Priya N', stars: 5, comment: 'Excellent domain knowledge.' }),
  ],
  'cl-northwind': [
    r('nw-1', 'Inclusive classroom practices', 5, '2026-09-03', 'Friendly team and a clear purpose for the study.', { name: 'Tom A', stars: 5 }),
    r('nw-2', 'Assessment tooling feedback', 4, '2026-06-27', 'Slot ran ten minutes over, otherwise smooth.', { name: 'Dana O', stars: 4, comment: 'Detailed and constructive.' }),
    r('nw-3', 'Teacher planning habits diary', 5, '2026-04-11', 'Reminders arrived every day and payment was quick.', { name: 'Lena F', stars: 5 }),
    r('nw-4', 'Reading intervention interviews', 4, '2026-02-08', 'Good questions, the recording consent could be clearer.', { name: 'Ravi M', stars: 4 }),
  ],
  'cl-procto': [
    r('pr-1', 'Checkout drop-off interviews', 4, '2026-08-22', 'Straightforward session about a real checkout problem.', { name: 'Chloe B', stars: 4 }),
    r('pr-2', 'Loyalty programme survey', 3, '2026-05-30', 'Payment took over a week and support had to chase it.', { name: 'Noah W', stars: 4 }),
    r('pr-3', 'Store navigation walkthrough', 5, '2026-03-15', 'In person at their Brooklyn store, well organised.', { name: 'Mia T', stars: 5, comment: 'Great observations on the floor layout.' }),
  ],
  'cl-lumen': [
    r('lu-1', 'Remote monitoring clinician panel', 4, '2026-08-01', 'Useful discussion, though the group was larger than described.', { name: 'Sophia D', stars: 4 }),
    r('lu-2', 'Telehealth triage usability', 3, '2026-06-09', 'Session rescheduled twice by the client.', { name: 'Liam B', stars: 5 }),
    r('lu-3', 'Sleep app onboarding diary', 5, '2026-04-25', 'Short daily entries, generous reward.', { name: 'Amelia C', stars: 5 }),
  ],
  'cl-brightline': [
    r('br-1', 'Card onboarding flow test', 4, '2026-07-18', 'Prototype was rough but the researcher was excellent.', { name: 'James S', stars: 4 }),
    r('br-2', 'Budgeting habits survey', 4, '2026-03-02', 'Quick, paid on time.', { name: 'Olivia J', stars: 5 }),
  ],
  'cl-orbit': [
    r('or-1', 'Airport lounge experience groups', 5, '2026-08-30', 'Lovely venue, snacks provided, paid the same week.', { name: 'Lucas M', stars: 5, comment: 'Engaged and candid.' }),
    r('or-2', 'Booking flow interviews', 5, '2026-05-06', 'Very well prepared moderator.', { name: 'Ava R', stars: 4 }),
  ],
  'cl-meadow': [
    r('me-1', 'Breakfast cereal taste panel', 5, '2026-09-10', 'Fun session, clear instructions.', { name: 'Ethan K', stars: 5 }),
    r('me-2', 'Weekly meal planning diary', 4, '2026-07-21', 'Five days felt long but the reward was fair.', { name: 'Zoe P', stars: 4 }),
    r('me-3', 'Plant milk preferences survey', 5, '2026-01-28', 'Quick and relevant.', { name: 'Ben H', stars: 5 }),
  ],
  'cl-kinetic': [
    r('ki-1', 'Wearable comfort interviews', 4, '2026-08-08', 'Good questions about real use, session slightly rushed.', { name: 'Isla G', stars: 5 }),
    r('ki-2', 'Running app onboarding survey', 5, '2026-04-02', 'Paid the next day.', { name: 'Omar S', stars: 4 }),
  ],
  'cl-harbor': [
    r('ha-1', 'Claims process interviews', 4, '2026-06-15', 'Sensitive topic handled well.', { name: 'Grace L', stars: 4 }),
    r('ha-2', 'Renewal letter readability', 3, '2026-02-20', 'Invitation email arrived late; the session itself was fine.', { name: 'Henry C', stars: 5 }),
  ],
  'cl-atlas': [
    r('at-1', 'EV charging habits diary', 5, '2026-07-09', 'Clear daily prompts and a generous reward.', { name: 'Maya V', stars: 5, comment: 'Detailed logs every day.' }),
    r('at-2', 'Commuter focus group', 4, '2026-03-28', 'Group ran well, parking was hard to find.', { name: 'Leo F', stars: 4 }),
  ],
}

export const clientReviews = (clientId: string): ClientReview[] => CLIENT_REVIEWS[clientId] ?? []
