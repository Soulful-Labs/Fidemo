import type { Booking, RepeatRule, StudyType } from '../types'
import type { RespondentStatus } from '../lifecycle'

/**
 * The studies run by the nine clients nobody is driving in the demo, each
 * written with Jonathan's own part in it (`status`, `booking`, `timeline`,
 * `clientReview`). seed.ts turns every entry into a Study with its
 * participations; nothing here is read by a screen.
 */
export interface CatalogueEntry {
  id: string; title: string; description: string; type: StudyType; reward: number; durationMins: number
  industry: string; targetProfession: string; image: string
  screenerSet: string; tasksSet?: string; client?: string
  /** Jonathan's status on it, in the respondent app's words. */
  status: RespondentStatus
  saved?: boolean; premium?: boolean; city?: string; daysLeft?: number; repeatRule?: RepeatRule
  diary?: { totalDays: number; minDays: number; completedDays: number[] }
  booking?: Booking; pinConfirmed?: boolean
  timeline?: { label: string; at: string }[]
  clientReview?: { stars: number; comment: string; expertise: number; reliability: number; communication: number }
}

export interface CatalogueHelpers {
  at: (offsetDays: number, hour?: number, minute?: number) => string
  CLIENTS: Record<string, string>
}

export function catalogue({ at, CLIENTS }: CatalogueHelpers): CatalogueEntry[] {
  const IMG = (name: string, ext: 'svg' | 'jpg' = 'svg') => `/img/${name}.${ext}`
  const mk = (e: CatalogueEntry) => e
  const review = (stars: number, comment: string, e: number, r: number, c: number) => ({ stars, comment, expertise: e, reliability: r, communication: c })
  /** A closed study's timeline: applied, done, then paid (or the end state). */
  const closed = (applied: number, done: number, doneLabel: string, paid?: number) => [
    { label: 'Applied', at: at(applied, 10, 36) },
    { label: 'Invited to complete', at: at(applied + 2, 9, 5) },
    { label: doneLabel, at: at(done, 13, 0) },
    ...(paid != null
      ? [{ label: 'Awaiting payout', at: at(done, 13, 5) }, { label: 'Payout processed by the team', at: at(paid, 9, 30) }, { label: 'Paid', at: at(paid, 10, 0) }]
      : []),
  ]
  return [
  // ----- Open to apply -----
  mk({ id: 'st-01', title: 'GLP-1 Care Plans, Oncologist View', type: 'video_call', status: 'available', reward: 150, durationMins: 45, industry: 'Healthcare',
    description: 'Share how you build and adjust GLP-1 care plans for oncology patients, and where current guidance falls short.',
    targetProfession: 'Oncologists, Nurse Practitioners, Physician Assistants', image: IMG('glp1'), screenerSet: 'oncology', daysLeft: 18, repeatRule: 'allow' }),
  mk({ id: 'st-02', saved: true, title: 'Inclusive education practices', type: 'survey', status: 'available', reward: 120, durationMins: 20, industry: 'Education',
    description: 'A short survey on how inclusive teaching practices are applied day to day in mixed-ability classrooms.',
    targetProfession: 'Teachers, Teaching Assistants, SENCOs', image: IMG('classroom'), screenerSet: 'education', tasksSet: 'education', client: CLIENTS.northwind, daysLeft: 9 }),
  mk({ id: 'st-05', saved: true, title: 'Daily glucose tracking habits', type: 'diary', status: 'available', reward: 250, durationMins: 15, industry: 'Healthcare',
    description: 'A five day diary on how you record glucose readings, what you skip, and what gets in the way.',
    targetProfession: 'People who track blood glucose daily', image: IMG('glucose'), screenerSet: 'diaryHealth', tasksSet: 'glucose', client: CLIENTS.lumen,
    diary: { totalDays: 5, minDays: 4, completedDays: [] }, daysLeft: 21 }),
  // Workflow 17: premium, the highest paid on the platform, needs a verified credential.
  mk({ id: 'st-23', title: 'Cardiac device trial, specialist panel', type: 'video_call', status: 'available', reward: 450, durationMins: 60, industry: 'Healthcare', premium: true,
    description: 'A specialist panel on onboarding a new implantable monitor into clinic workflow, for a device trial sponsor.',
    targetProfession: 'Cardiologists, Cardiac device nurses, Electrophysiologists', image: IMG('cardiac'), screenerSet: 'cardiac', client: CLIENTS.rjp, daysLeft: 20, repeatRule: 'exclude' }),
  mk({ id: 'st-24', saved: true, title: 'Radiology reporting workflows', type: 'group_video_call', status: 'available', reward: 400, durationMins: 75, industry: 'Healthcare', premium: true,
    description: 'Where reporting loses time: templates, dictation and AI pre-reads, discussed with five other reporting radiologists.',
    targetProfession: 'Radiologists, Reporting radiographers', image: IMG('radiology'), screenerSet: 'radiology', client: CLIENTS.lumen, daysLeft: 15, repeatRule: 'allow' }),
  mk({ id: 'st-28', title: 'Nurse leadership roundtable', type: 'in_person', status: 'available', reward: 380, durationMins: 90, industry: 'Healthcare', premium: true, city: 'Chicago',
    description: 'A roundtable for nurse leaders on retention, rostering and wellbeing, hosted in Chicago with lunch provided.',
    targetProfession: 'Nurse managers, Directors of nursing', image: IMG('roundtable'), screenerSet: 'leadership', client: CLIENTS.rjp, daysLeft: 24, repeatRule: 'allow' }),
  // Demo starting state: three days in, so a walk can fill the diary bar and reach its end.
  mk({ id: 'st-31', title: 'Weekend meal planning diary', type: 'diary', status: 'invited_to_complete', reward: 110, durationMins: 10, industry: 'Food',
    description: 'Five short entries on how you plan, shop for and cook dinner across a week.',
    targetProfession: 'People who cook dinner at home most nights', image: IMG('meal'), screenerSet: 'food', tasksSet: 'meals', client: CLIENTS.meadow,
    diary: { totalDays: 5, minDays: 4, completedDays: [1, 2, 3] }, daysLeft: 13, repeatRule: 'allow',
    timeline: [{ label: 'Applied', at: at(-6, 9, 40) }, { label: 'Invited to complete', at: at(-4, 10, 15) }] }),

  mk({ id: 'st-35', title: 'Airport lounge experience groups', type: 'in_person_group', status: 'available', reward: 150, durationMins: 90, industry: 'Travel', city: 'Chicago',
    description: 'A group session on what makes an airport lounge worth paying for, held at our Chicago office.',
    targetProfession: 'Frequent flyers who book their own travel', image: IMG('travel'), screenerSet: 'travel', client: CLIENTS.orbit, daysLeft: 14 }),

  // ----- Invited to apply -----
  mk({ id: 'st-03', title: 'Retail pharmacy layout walkthrough', type: 'in_person', status: 'invited_to_apply', reward: 200, durationMins: 60, industry: 'Retail', city: 'New York',
    description: 'Walk a researcher through how you navigate a pharmacy floor, find products and reach the counter.',
    targetProfession: 'Regular pharmacy shoppers', image: IMG('pharmacy'), screenerSet: 'shopping', client: CLIENTS.procto, daysLeft: 12, repeatRule: 'exclude' }),
  mk({ id: 'st-04', title: 'Telehealth triage, group session', type: 'group_video_call', status: 'invited_to_apply', reward: 175, durationMins: 90, industry: 'Healthcare',
    description: 'A moderated group discussion on triaging patients remotely, what works and what you work around.',
    targetProfession: 'Triage nurses, Telehealth clinicians', image: IMG('telehealth'), screenerSet: 'telehealth', client: CLIENTS.lumen, daysLeft: 6 }),

  // ----- In progress -----
  mk({ id: 'st-06', title: 'E-commerce checkout flow', type: 'survey', status: 'draft', reward: 90, durationMins: 25, industry: 'Technology',
    description: 'Walk through a checkout journey and tell us where you hesitate, back out or give up.',
    targetProfession: 'Frequent online shoppers', image: IMG('payment', 'jpg'), screenerSet: 'shopping', tasksSet: 'refill', client: CLIENTS.procto, daysLeft: 4,
    timeline: [{ label: 'Application started', at: at(-1, 18, 20) }] }),
  mk({ id: 'st-07', title: 'Oncology EMR workflows', type: 'video_call', status: 'applied', reward: 180, durationMins: 45, industry: 'Healthcare',
    description: 'How you move through your EMR during a typical oncology consult, and what slows you down.',
    targetProfession: 'Oncologists, Oncology nurses', image: IMG('emr'), screenerSet: 'oncology', daysLeft: 15,
    timeline: [{ label: 'Applied', at: at(-3, 10, 36) }] }),
  mk({ id: 'st-08', title: 'Cardiology device onboarding', type: 'video_call', status: 'invited_to_schedule', reward: 220, durationMins: 60, industry: 'Healthcare',
    description: 'Talk us through unboxing, setting up and first use of a new cardiac monitoring device.',
    targetProfession: 'Cardiac nurses, Device clinic staff', image: IMG('monitor'), screenerSet: 'cardiac', client: CLIENTS.lumen, daysLeft: 11,
    timeline: [{ label: 'Applied', at: at(-6, 9, 12) }, { label: 'Invited to schedule', at: at(-1, 16, 4) }] }),
  mk({ id: 'st-09', title: 'Wellness app first impressions', type: 'survey', status: 'invited_to_complete', reward: 75, durationMins: 15, industry: 'Wellness',
    description: 'Open the app for the first time and tell us what you notice, what confuses you and what you would keep.',
    targetProfession: 'Adults who have tried a wellness app', image: IMG('wellness'), screenerSet: 'fitness', tasksSet: 'wellness', client: CLIENTS.kinetic, daysLeft: 3,
    timeline: [{ label: 'Applied', at: at(-4, 11, 0) }, { label: 'Invited to complete', at: at(-2, 9, 30) }] }),
  mk({ id: 'st-10', title: 'Nurse staffing software review', type: 'video_call', status: 'scheduled', reward: 160, durationMins: 45, industry: 'Healthcare',
    description: 'A guided session on how you build rotas, handle short-notice gaps and escalate cover.',
    targetProfession: 'Ward managers, Rota coordinators', image: IMG('staffing'), screenerSet: 'staffing', client: CLIENTS.northwind, daysLeft: 14,
    booking: { date: at(3), slot: '10:30 AM', rescheduleCount: 0 },
    timeline: [{ label: 'Applied', at: at(-8, 10, 36) }, { label: 'Invited to schedule', at: at(-4, 12, 0) }, { label: 'Scheduled', at: at(-2, 15, 45) }] }),
  mk({ id: 'st-11', title: 'Flagship store shopper study', type: 'in_person', status: 'pin_confirmed', reward: 210, durationMins: 60, industry: 'Retail', city: 'New York',
    description: 'Shop the flagship store with a researcher alongside you and talk through every decision.',
    targetProfession: 'Shoppers who visit a flagship store monthly', image: IMG('store'), screenerSet: 'shopping', client: CLIENTS.procto, daysLeft: 2,
    booking: { date: at(0, 14, 0), slot: '02:30 PM', locationId: 'nyc-ts', rescheduleCount: 1 }, pinConfirmed: true,
    timeline: [{ label: 'Applied', at: at(-9, 10, 36) }, { label: 'Invited to schedule', at: at(-6, 12, 0) }, { label: 'Scheduled', at: at(-5, 9, 0) }, { label: 'Rescheduled', at: at(-3, 18, 0) }, { label: 'Session code confirmed', at: at(0, 15, 5) }] }),
  mk({ id: 'st-12', title: 'Sleep routine diary', type: 'diary', status: 'in_process', reward: 240, durationMins: 15, industry: 'Wellness',
    description: 'Five days of short entries about your wind-down routine, interruptions and how you feel waking.',
    targetProfession: 'Adults, 18+', image: IMG('moon'), screenerSet: 'sleep', tasksSet: 'sleepDiary', client: CLIENTS.lumen, daysLeft: 1,
    diary: { totalDays: 5, minDays: 4, completedDays: [1, 2, 3, 4] },
    timeline: [{ label: 'Applied', at: at(-14, 10, 0) }, { label: 'Invited to complete', at: at(-12, 9, 0) }, { label: 'Diary completed', at: at(-1, 21, 40) }, { label: 'Awaiting payout', at: at(-1, 21, 41) }] }),

  // ----- Closed -----
  mk({ id: 'st-13', title: 'Patient intake forms, paper to digital', type: 'survey', status: 'paid', reward: 120, durationMins: 30, industry: 'Healthcare',
    description: 'How your practice moved intake forms from paper to digital, and what patients made of it.',
    targetProfession: 'Practice managers, Receptionists', image: IMG('forms'), screenerSet: 'education', tasksSet: 'forms', client: CLIENTS.northwind, daysLeft: 0,
    timeline: closed(-24, -19, 'Survey completed', -17),
    clientReview: review(5, 'Thoughtful, detailed answers and great examples. A pleasure to work with.', 5, 5, 5), repeatRule: 'allow' }),
  mk({ id: 'st-25', title: 'Coffee drinking habits at home', type: 'survey', status: 'paid', reward: 60, durationMins: 15, industry: 'Food',
    description: 'How you brew, what you buy and what you look for on the pack.',
    targetProfession: 'Daily home coffee drinkers', image: IMG('coffee'), screenerSet: 'food', tasksSet: 'coffee', client: CLIENTS.meadow, daysLeft: 0,
    timeline: closed(-40, -36, 'Survey completed', -33),
    clientReview: review(5, 'Quick, clear and honest about brands.', 4, 5, 5) }),
  mk({ id: 'st-26', title: 'Commuting and EV charging', type: 'video_call', status: 'paid', reward: 140, durationMins: 40, industry: 'Automotive',
    description: 'A call about your commute, where you charge and what a longer trip takes to plan.',
    targetProfession: 'EV drivers and people considering one', image: IMG('ev'), screenerSet: 'mobility', client: CLIENTS.atlas, daysLeft: 0,
    timeline: closed(-58, -52, 'Session completed', -49),
    clientReview: review(5, 'Good detail on real charging problems. Ran a little over time.', 4, 4, 5) }),
  mk({ id: 'st-27', title: 'Home insurance renewals', type: 'video_call', status: 'paid', reward: 130, durationMins: 40, industry: 'Finance',
    description: 'Why you renewed or switched, and what in the renewal letter was unclear.',
    targetProfession: 'Home insurance policy holders', image: IMG('house'), screenerSet: 'insurance', client: CLIENTS.harbor, daysLeft: 0,
    timeline: closed(-96, -90, 'Session completed', -88),
    clientReview: review(5, 'Candid and well organised, exactly the perspective we needed.', 5, 5, 4) }),
  mk({ id: 'st-29', title: 'Pharmacy app refill flow', type: 'survey', status: 'paid', reward: 95, durationMins: 20, industry: 'Healthcare',
    description: 'Refill a prescription in a prototype app and tell us where it stalls.',
    targetProfession: 'People who refill a prescription monthly', image: IMG('refill'), screenerSet: 'shopping', tasksSet: 'refill', client: CLIENTS.procto, daysLeft: 0,
    timeline: closed(-133, -128, 'Survey completed', -125),
    clientReview: review(5, 'Useful notes on the confirmation step.', 4, 5, 4) }),
  mk({ id: 'st-30', title: 'Plant milk preferences', type: 'survey', status: 'paid', reward: 50, durationMins: 10, industry: 'Food',
    description: 'A quick survey on which plant milks you buy and why.',
    targetProfession: 'Shoppers who buy plant milk', image: IMG('meal'), screenerSet: 'food', tasksSet: 'coffee', client: CLIENTS.meadow, daysLeft: 0,
    timeline: closed(-170, -166, 'Survey completed', -163),
    clientReview: review(5, 'Fast and complete.', 5, 5, 5) }),
  mk({ id: 'st-32', title: 'Clinic waiting room audio', type: 'in_person', status: 'paid', reward: 200, durationMins: 60, industry: 'Healthcare', city: 'New York',
    description: 'An hour in a clinic waiting room rating background audio and announcements.',
    targetProfession: 'Recent clinic outpatients', image: IMG('audio'), screenerSet: 'sleep', client: CLIENTS.lumen, daysLeft: 0,
    timeline: closed(-410, -402, 'Session completed', -399),
    clientReview: review(5, 'Reliable and on time.', 4, 5, 4) }),
  mk({ id: 'st-33', title: 'Community clinic intake interview', type: 'video_call', status: 'paid', reward: 175, durationMins: 45, industry: 'Healthcare',
    description: 'How a community clinic handles walk-in intake, from the front desk to triage.',
    targetProfession: 'Clinic front-desk and triage staff', image: IMG('clinic'), screenerSet: 'telehealth', client: CLIENTS.rjp, daysLeft: 0,
    timeline: closed(-350, -344, 'Session completed', -341),
    clientReview: review(5, 'Exactly the operational detail we were after.', 5, 5, 5) }),
  // Workflow 44: turned up, not needed, paid in full.
  mk({ id: 'st-16', title: 'Remote monitoring, clinician panel', type: 'group_video_call', status: 'not_needed', reward: 190, durationMins: 75, industry: 'Healthcare',
    description: 'A panel of clinicians on remote patient monitoring alerts, thresholds and follow-up.',
    targetProfession: 'Clinicians who review remote monitoring alerts', image: IMG('remote'), screenerSet: 'telehealth', client: CLIENTS.lumen, daysLeft: 0,
    timeline: closed(-290, -283, 'Turned up, not needed', -281) }),
  mk({ id: 'st-34', title: 'Clinic scheduling software interview', type: 'video_call', status: 'late_show', reward: 160, durationMins: 45, industry: 'Healthcare',
    description: 'A one-to-one interview on how appointment scheduling software fits into a busy clinic day.',
    targetProfession: 'Practice managers and clinic administrators', image: IMG('clinic'), screenerSet: 'telehealth', client: CLIENTS.harbor, daysLeft: 0,
    booking: { date: at(-322, 11, 0), slot: '11:00 AM', rescheduleCount: 0 },
    clientReview: review(4, 'Good input once we got going, though the session started fifteen minutes late.', 4, 3, 4),
    timeline: [{ label: 'Applied', at: at(-334, 10, 36) }, { label: 'Invited to schedule', at: at(-331, 12, 0) }, { label: 'Scheduled', at: at(-330, 14, 0) },
      { label: 'Late show up', at: at(-322, 11, 15) }, { label: 'Awaiting payout', at: at(-322, 12, 0) }, { label: 'Payout processed by the team', at: at(-320, 9, 30) }, { label: 'Paid', at: at(-320, 10, 0) }] }),
  mk({ id: 'st-14', title: 'Fintech onboarding walkthrough', type: 'video_call', status: 'rejected', reward: 140, durationMins: 40, industry: 'Finance',
    description: 'A session on opening a business account, verifying identity and linking a card.',
    targetProfession: 'Small business owners who opened an account this year', image: IMG('fintech'), screenerSet: 'fintech', client: CLIENTS.brightline, daysLeft: 0,
    timeline: [{ label: 'Applied', at: at(-28, 9, 15) }, { label: 'Rejected', at: at(-26, 10, 30) }] }),
  mk({ id: 'st-15', title: 'Beverage tasting focus group', type: 'in_person_group', status: 'no_show', reward: 130, durationMins: 90, industry: 'Food', city: 'Austin',
    description: 'Taste a new range of soft drinks with seven other people and talk through your reactions.',
    targetProfession: 'Adults who drink soft drinks weekly', image: IMG('beverage'), screenerSet: 'food', client: CLIENTS.meadow, daysLeft: 0,
    booking: { date: at(-9, 13, 15), slot: '01:00 PM', locationId: 'atx-dt', rescheduleCount: 0 },
    timeline: [{ label: 'Applied', at: at(-20, 10, 36) }, { label: 'Invited to schedule', at: at(-16, 12, 0) }, { label: 'Scheduled', at: at(-15, 14, 0) }, { label: 'No Show', at: at(-9, 13, 15) }] }),
  ]
}
