import type { Study, StudyStatus } from '../types'
import { CLIENTS } from './clients'
import { SCREENERS, TASKS } from './screeners'

const DAY = 86_400_000

/** Dates are generated relative to now so the prototype never goes stale. */
export function at(offsetDays: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + offsetDays * DAY)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/** In-person venues, per city. */
export const CITIES: Record<string, Study['locations']> = {
  'New York': [
    { id: 'nyc-ts', label: 'Times Square', short: 'Times Square, NYC, New York 160248', address: '124, Prestige Empire, Jenn\'s Street, Times Square, NYC, US 160248' },
    { id: 'nyc-bk', label: 'Brooklyn Heights', short: 'Brooklyn Heights, NYC, New York 160312', address: '8, Water Tower Road, Brooklyn Heights, NYC, US 160312' },
  ],
  Chicago: [
    { id: 'chi-loop', label: 'The Loop', address: '233 S Wacker Drive, Suite 4100, Chicago, IL 60606' },
    { id: 'chi-wp', label: 'Wicker Park', address: '1560 N Milwaukee Avenue, Chicago, IL 60622' },
  ],
  Boston: [
    { id: 'bos-bb', label: 'Back Bay', address: '500 Boylston Street, 8th Floor, Boston, MA 02116' },
    { id: 'bos-cam', label: 'Cambridge', address: '1 Broadway, Kendall Square, Cambridge, MA 02142' },
  ],
  Austin: [
    { id: 'atx-dt', label: 'Downtown', address: '600 Congress Avenue, Austin, TX 78701' },
  ],
}

const ALL_SLOTS = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:30 PM', '04:00 PM']

/**
 * Availability that differs per study: a deterministic pick of dates and
 * slots from the study number, so some studies are wide open and some are
 * nearly full.
 */
function availabilityFor(n: number): Study['availability'] {
  const days = [2, 3, 4, 5, 6, 7, 9, 10, 12].filter((_, i) => (n * 7 + i) % 3 !== 1).slice(0, 3 + (n % 4))
  return days.map((d, i) => {
    const open = ALL_SLOTS.filter((_, j) => (n + i + j) % (2 + (n % 3)) !== 0)
    return { date: at(d), slots: open.length ? open : [ALL_SLOTS[(n + i) % ALL_SLOTS.length]] }
  })
}

const IMG = (name: string, ext: 'svg' | 'jpg' = 'svg') => `/img/${name}.${ext}`

type Seed = Pick<Study, 'id' | 'title' | 'description' | 'type' | 'status' | 'reward' | 'durationMins' | 'industry' | 'targetProfession'> &
  Partial<Study> & { image: string; screenerSet: keyof typeof SCREENERS; tasksSet?: keyof typeof TASKS }

function mk(seed: Seed): Study {
  const n = Number(seed.id.replace(/\D/g, ''))
  const { screenerSet, tasksSet, ...rest } = seed
  const daysLeft = seed.daysLeft ?? 6 + (n % 17)
  const inPerson = seed.type === 'in_person' || seed.type === 'in_person_group'
  const session = inPerson || seed.type === 'video_call' || seed.type === 'group_video_call'
  // A study that has ended has a real end date: the day it was completed,
  // rejected or missed (the last timeline event before the payout steps).
  // Open studies end daysLeft from now.
  const PAYOUT_STEPS = ['Earnings credited', 'Client approved payout', 'Paid']
  const doneAt = seed.timeline?.filter((t) => !PAYOUT_STEPS.includes(t.label)).at(-1)?.at
  const endsAt = doneAt && daysLeft === 0 ? doneAt : at(daysLeft)
  return {
    matchScore: 60 + ((n * 13) % 38),
    endsAt,
    daysLeft,
    client: CLIENTS.rjp,
    saved: false,
    repeatRule: (['allow', 'prefer_fresh', 'exclude_previous'] as const)[n % 3],
    linkCode: `HL-${String(n).padStart(3, '0')}-${['A', 'B', 'C', 'D'][n % 4]}`,
    preScreener: SCREENERS[screenerSet].pre,
    screener: SCREENERS[screenerSet].full,
    tasks: tasksSet ? TASKS[tasksSet] : undefined,
    availability: session ? availabilityFor(n) : undefined,
    locations: inPerson ? CITIES[seed.city ?? 'New York'] : undefined,
    timeline: [],
    ...rest,
  }
}

const review = (stars: number, comment: string, e: number, r: number, c: number) =>
  ({ stars, comment, expertise: e, reliability: r, communication: c, trustDelta: [0, -3, -2, 1, 3, 4][stars] })

/** A closed study's timeline: applied, done, then paid (or the end state). */
const closed = (applied: number, done: number, doneLabel: string, paid?: number, extra?: { label: string; at: string }[]) => [
  { label: 'Applied', at: at(applied, 10, 36) },
  { label: 'Invited to complete', at: at(applied + 2, 9, 5) },
  { label: doneLabel, at: at(done, 13, 0) },
  ...(paid != null
    ? [{ label: 'Earnings credited', at: at(done, 13, 5) }, { label: 'Client approved payout', at: at(paid, 9, 30) }, { label: 'Paid', at: at(paid, 10, 0) }]
    : []),
  ...(extra ?? []),
]

export const STUDIES: Study[] = [
  // ----- Open to apply -----
  mk({ id: 'st-01', title: 'GLP-1 Care Plans, Oncologist View', type: 'video_call', status: 'available', reward: 150, durationMins: 45, industry: 'Healthcare',
    description: 'Share how you build and adjust GLP-1 care plans for oncology patients, and where current guidance falls short.',
    targetProfession: 'Oncologists, Nurse Practitioners, Physician Assistants', image: IMG('glp1'), screenerSet: 'oncology', matchScore: 96, daysLeft: 18, repeatRule: 'allow' }),
  mk({ id: 'st-02', saved: true, title: 'Inclusive education practices', type: 'survey', status: 'available', reward: 120, durationMins: 20, industry: 'Education',
    description: 'A short survey on how inclusive teaching practices are applied day to day in mixed-ability classrooms.',
    targetProfession: 'Teachers, Teaching Assistants, SENCOs', image: IMG('classroom'), screenerSet: 'education', tasksSet: 'education', client: CLIENTS.northwind, matchScore: 74, daysLeft: 9 }),
  mk({ id: 'st-05', saved: true, title: 'Daily glucose tracking habits', type: 'diary', status: 'available', reward: 250, durationMins: 15, industry: 'Healthcare',
    description: 'A five day diary on how you record glucose readings, what you skip, and what gets in the way.',
    targetProfession: 'People who track blood glucose daily', image: IMG('glucose'), screenerSet: 'diaryHealth', tasksSet: 'glucose', client: CLIENTS.lumen,
    diary: { totalDays: 5, minDays: 4, completedDays: [] }, matchScore: 79, daysLeft: 21 }),
  mk({ id: 'st-17', title: 'Fitness tracker apps experience', type: 'survey', status: 'available', reward: 75, durationMins: 15, industry: 'Wellness',
    description: 'Share your experience of using any fitness apps for tracking your weight, steps, diet, etc. and improving them.',
    targetProfession: 'Regular users of a fitness or activity app', image: IMG('runner', 'jpg'), screenerSet: 'fitness', tasksSet: 'fitness', client: CLIENTS.kinetic, matchScore: 96, daysLeft: 16 }),
  mk({ id: 'st-18', title: 'Social media posts designing apps', type: 'video_call', status: 'available', reward: 150, durationMins: 45, industry: 'Technology',
    description: 'How do you design social media posts and what tools do you use for it? A 45 minute call with the design team.',
    targetProfession: 'Marketers, Small business owners, Content creators', image: IMG('canva', 'jpg'), screenerSet: 'design', client: CLIENTS.procto, matchScore: 96, daysLeft: 18 }),
  mk({ id: 'st-19', title: 'Travel preferences and experiences', type: 'in_person_group', status: 'available', reward: 150, durationMins: 90, industry: 'Travel', city: 'Chicago',
    description: 'Let us know about your travel choices and your experiences with booking, airports and loyalty programmes.',
    targetProfession: 'Frequent flyers who book their own travel', image: IMG('airport', 'jpg'), screenerSet: 'travel', client: CLIENTS.orbit, matchScore: 88, daysLeft: 14 }),
  mk({ id: 'st-20', title: 'How do you make your digital payments mostly?', type: 'diary', status: 'available', reward: 150, durationMins: 10, industry: 'Finance',
    description: 'Share about your ways of digital spending and payment methods you use in your daily life.',
    targetProfession: 'Adults who pay by card or phone wallet most days', image: IMG('card', 'jpg'), screenerSet: 'fintech', tasksSet: 'payments', client: CLIENTS.brightline,
    diary: { totalDays: 5, minDays: 4, completedDays: [] }, matchScore: 90, daysLeft: 12 }),
  mk({ id: 'st-21', title: 'Share about your sleep cycle', type: 'in_person', status: 'available', reward: 150, durationMins: 60, industry: 'Wellness', city: 'Boston',
    description: 'How are you experiencing your sleep cycle and what helps you wind down? An hour in our Boston office.',
    targetProfession: 'Adults who have tried to improve their sleep this year', image: IMG('sleep', 'jpg'), screenerSet: 'sleep', client: CLIENTS.lumen, matchScore: 85, daysLeft: 11 }),
  mk({ id: 'st-22', title: 'About goal-tracking methods', type: 'survey', status: 'available', reward: 150, durationMins: 25, industry: 'Education',
    description: 'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness and learning milestones.',
    targetProfession: 'People who set and track personal goals', image: IMG('goals', 'jpg'), screenerSet: 'education', tasksSet: 'goals', client: CLIENTS.northwind, matchScore: 92, daysLeft: 18 }),
  // Workflow 17: premium, the highest paid on the platform, needs a verified credential.
  mk({ id: 'st-23', title: 'Cardiac device trial, specialist panel', type: 'video_call', status: 'available', reward: 450, durationMins: 60, industry: 'Healthcare', premium: true,
    description: 'A specialist panel on onboarding a new implantable monitor into clinic workflow, for a device trial sponsor.',
    targetProfession: 'Cardiologists, Cardiac device nurses, Electrophysiologists', image: IMG('cardiac'), screenerSet: 'cardiac', client: CLIENTS.rjp, matchScore: 91, daysLeft: 20, repeatRule: 'exclude_previous' }),
  mk({ id: 'st-24', saved: true, title: 'Radiology reporting workflows', type: 'group_video_call', status: 'available', reward: 400, durationMins: 75, industry: 'Healthcare', premium: true,
    description: 'Where reporting loses time: templates, dictation and AI pre-reads, discussed with five other reporting radiologists.',
    targetProfession: 'Radiologists, Reporting radiographers', image: IMG('radiology'), screenerSet: 'radiology', client: CLIENTS.lumen, matchScore: 83, daysLeft: 15, repeatRule: 'prefer_fresh' }),
  mk({ id: 'st-28', title: 'Nurse leadership roundtable', type: 'in_person', status: 'available', reward: 380, durationMins: 90, industry: 'Healthcare', premium: true, city: 'Chicago',
    description: 'A roundtable for nurse leaders on retention, rostering and wellbeing, hosted in Chicago with lunch provided.',
    targetProfession: 'Nurse managers, Directors of nursing', image: IMG('roundtable'), screenerSet: 'leadership', client: CLIENTS.rjp, matchScore: 87, daysLeft: 24, repeatRule: 'allow' }),
  // Demo starting state: three days in, so a walk can fill the diary bar and reach its end.
  mk({ id: 'st-31', title: 'Weekend meal planning diary', type: 'diary', status: 'invited_to_complete', reward: 110, durationMins: 10, industry: 'Food',
    description: 'Five short entries on how you plan, shop for and cook dinner across a week.',
    targetProfession: 'People who cook dinner at home most nights', image: IMG('meal'), screenerSet: 'food', tasksSet: 'meals', client: CLIENTS.meadow,
    diary: { totalDays: 5, minDays: 4, completedDays: [1, 2, 3] }, matchScore: 77, daysLeft: 13, repeatRule: 'prefer_fresh',
    timeline: [{ label: 'Applied', at: at(-6, 9, 40) }, { label: 'Invited to complete', at: at(-4, 10, 15) }] }),

  // ----- Invited to apply -----
  mk({ id: 'st-03', title: 'Retail pharmacy layout walkthrough', type: 'in_person', status: 'invited_to_apply', reward: 200, durationMins: 60, industry: 'Retail', city: 'New York',
    description: 'Walk a researcher through how you navigate a pharmacy floor, find products and reach the counter.',
    targetProfession: 'Regular pharmacy shoppers', image: IMG('pharmacy'), screenerSet: 'shopping', client: CLIENTS.procto, matchScore: 91, daysLeft: 12, repeatRule: 'exclude_previous' }),
  mk({ id: 'st-04', title: 'Telehealth triage, group session', type: 'group_video_call', status: 'invited_to_apply', reward: 175, durationMins: 90, industry: 'Healthcare',
    description: 'A moderated group discussion on triaging patients remotely, what works and what you work around.',
    targetProfession: 'Triage nurses, Telehealth clinicians', image: IMG('telehealth'), screenerSet: 'telehealth', client: CLIENTS.lumen, matchScore: 83, daysLeft: 6 }),

  // ----- In progress -----
  mk({ id: 'st-06', title: 'E-commerce checkout flow', type: 'survey', status: 'draft', reward: 90, durationMins: 25, industry: 'Technology',
    description: 'Walk through a checkout journey and tell us where you hesitate, back out or give up.',
    targetProfession: 'Frequent online shoppers', image: IMG('payment', 'jpg'), screenerSet: 'shopping', tasksSet: 'refill', client: CLIENTS.procto, matchScore: 68, daysLeft: 4,
    timeline: [{ label: 'Application started', at: at(-1, 18, 20) }] }),
  mk({ id: 'st-07', title: 'Oncology EMR workflows', type: 'video_call', status: 'applied', reward: 180, durationMins: 45, industry: 'Healthcare',
    description: 'How you move through your EMR during a typical oncology consult, and what slows you down.',
    targetProfession: 'Oncologists, Oncology nurses', image: IMG('emr'), screenerSet: 'oncology', matchScore: 94, daysLeft: 15,
    timeline: [{ label: 'Applied', at: at(-3, 10, 36) }] }),
  mk({ id: 'st-08', title: 'Cardiology device onboarding', type: 'video_call', status: 'invited_to_schedule', reward: 220, durationMins: 60, industry: 'Healthcare',
    description: 'Talk us through unboxing, setting up and first use of a new cardiac monitoring device.',
    targetProfession: 'Cardiac nurses, Device clinic staff', image: IMG('monitor'), screenerSet: 'cardiac', client: CLIENTS.lumen, matchScore: 97, daysLeft: 11,
    timeline: [{ label: 'Applied', at: at(-6, 9, 12) }, { label: 'Invited to schedule', at: at(-1, 16, 4) }] }),
  mk({ id: 'st-09', title: 'Wellness app first impressions', type: 'survey', status: 'invited_to_complete', reward: 75, durationMins: 15, industry: 'Wellness',
    description: 'Open the app for the first time and tell us what you notice, what confuses you and what you would keep.',
    targetProfession: 'Adults who have tried a wellness app', image: IMG('wellness'), screenerSet: 'fitness', tasksSet: 'wellness', client: CLIENTS.kinetic, matchScore: 71, daysLeft: 3,
    timeline: [{ label: 'Applied', at: at(-4, 11, 0) }, { label: 'Invited to complete', at: at(-2, 9, 30) }] }),
  mk({ id: 'st-10', title: 'Nurse staffing software review', type: 'video_call', status: 'scheduled', reward: 160, durationMins: 45, industry: 'Healthcare',
    description: 'A guided session on how you build rotas, handle short-notice gaps and escalate cover.',
    targetProfession: 'Ward managers, Rota coordinators', image: IMG('staffing'), screenerSet: 'staffing', client: CLIENTS.northwind, matchScore: 89, daysLeft: 14,
    booking: { date: at(3), slot: '10:30 AM', rescheduleCount: 0 },
    timeline: [{ label: 'Applied', at: at(-8, 10, 36) }, { label: 'Invited to schedule', at: at(-4, 12, 0) }, { label: 'Scheduled', at: at(-2, 15, 45) }] }),
  mk({ id: 'st-11', title: 'Flagship store shopper study', type: 'in_person', status: 'pin_confirmed', reward: 210, durationMins: 60, industry: 'Retail', city: 'New York',
    description: 'Shop the flagship store with a researcher alongside you and talk through every decision.',
    targetProfession: 'Shoppers who visit a flagship store monthly', image: IMG('store'), screenerSet: 'shopping', client: CLIENTS.procto, matchScore: 86, daysLeft: 2,
    booking: { date: at(0, 14, 0), slot: '02:30 PM', locationId: 'nyc-ts', rescheduleCount: 1 }, pinConfirmed: true,
    timeline: [{ label: 'Applied', at: at(-9, 10, 36) }, { label: 'Invited to schedule', at: at(-6, 12, 0) }, { label: 'Scheduled', at: at(-5, 9, 0) }, { label: 'Rescheduled', at: at(-3, 18, 0) }, { label: 'Session code confirmed', at: at(0, 15, 5) }] }),
  mk({ id: 'st-12', title: 'Sleep routine diary', type: 'diary', status: 'in_process', reward: 240, durationMins: 15, industry: 'Wellness',
    description: 'Five days of short entries about your wind-down routine, interruptions and how you feel waking.',
    targetProfession: 'Adults, 18+', image: IMG('moon'), screenerSet: 'sleep', tasksSet: 'sleepDiary', client: CLIENTS.lumen, matchScore: 81, daysLeft: 1,
    diary: { totalDays: 5, minDays: 4, completedDays: [1, 2, 3, 4] },
    timeline: [{ label: 'Applied', at: at(-14, 10, 0) }, { label: 'Invited to complete', at: at(-12, 9, 0) }, { label: 'Diary completed', at: at(-1, 21, 40) }, { label: 'Earnings credited', at: at(-1, 21, 41) }] }),

  // ----- Closed -----
  mk({ id: 'st-13', title: 'Patient intake forms, paper to digital', type: 'survey', status: 'paid', reward: 120, durationMins: 30, industry: 'Healthcare',
    description: 'How your practice moved intake forms from paper to digital, and what patients made of it.',
    targetProfession: 'Practice managers, Receptionists', image: IMG('forms'), screenerSet: 'education', tasksSet: 'forms', client: CLIENTS.northwind, matchScore: 92, daysLeft: 0,
    timeline: closed(-24, -19, 'Survey completed', -17),
    clientReview: review(5, 'Thoughtful, detailed answers and great examples. A pleasure to work with.', 5, 5, 5), repeatRule: 'allow' }),
  mk({ id: 'st-25', title: 'Coffee drinking habits at home', type: 'survey', status: 'paid', reward: 60, durationMins: 15, industry: 'Food',
    description: 'How you brew, what you buy and what you look for on the pack.',
    targetProfession: 'Daily home coffee drinkers', image: IMG('coffee'), screenerSet: 'food', tasksSet: 'coffee', client: CLIENTS.meadow, matchScore: 80, daysLeft: 0,
    timeline: closed(-40, -36, 'Survey completed', -33),
    clientReview: review(5, 'Quick, clear and honest about brands.', 4, 5, 5) }),
  mk({ id: 'st-26', title: 'Commuting and EV charging', type: 'video_call', status: 'paid', reward: 140, durationMins: 40, industry: 'Automotive',
    description: 'A call about your commute, where you charge and what a longer trip takes to plan.',
    targetProfession: 'EV drivers and people considering one', image: IMG('ev'), screenerSet: 'mobility', client: CLIENTS.atlas, matchScore: 84, daysLeft: 0,
    timeline: closed(-58, -52, 'Session completed', -49),
    clientReview: review(4, 'Good detail on real charging problems. Ran a little over time.', 4, 4, 5) }),
  mk({ id: 'st-27', title: 'Home insurance renewals', type: 'video_call', status: 'paid', reward: 130, durationMins: 40, industry: 'Finance',
    description: 'Why you renewed or switched, and what in the renewal letter was unclear.',
    targetProfession: 'Home insurance policy holders', image: IMG('house'), screenerSet: 'insurance', client: CLIENTS.harbor, matchScore: 79, daysLeft: 0,
    timeline: closed(-96, -90, 'Session completed', -88),
    clientReview: review(5, 'Candid and well organised, exactly the perspective we needed.', 5, 5, 4) }),
  mk({ id: 'st-29', title: 'Pharmacy app refill flow', type: 'survey', status: 'paid', reward: 95, durationMins: 20, industry: 'Healthcare',
    description: 'Refill a prescription in a prototype app and tell us where it stalls.',
    targetProfession: 'People who refill a prescription monthly', image: IMG('refill'), screenerSet: 'shopping', tasksSet: 'refill', client: CLIENTS.procto, matchScore: 82, daysLeft: 0,
    timeline: closed(-133, -128, 'Survey completed', -125),
    clientReview: review(5, 'Useful notes on the confirmation step.', 4, 5, 4) }),
  mk({ id: 'st-30', title: 'Plant milk preferences', type: 'survey', status: 'paid', reward: 50, durationMins: 10, industry: 'Food',
    description: 'A quick survey on which plant milks you buy and why.',
    targetProfession: 'Shoppers who buy plant milk', image: IMG('meal'), screenerSet: 'food', tasksSet: 'coffee', client: CLIENTS.meadow, matchScore: 70, daysLeft: 0,
    timeline: closed(-170, -166, 'Survey completed', -163),
    clientReview: review(5, 'Fast and complete.', 5, 5, 5) }),
  mk({ id: 'st-32', title: 'Clinic waiting room audio', type: 'in_person', status: 'paid', reward: 200, durationMins: 60, industry: 'Healthcare', city: 'New York',
    description: 'An hour in a clinic waiting room rating background audio and announcements.',
    targetProfession: 'Recent clinic outpatients', image: IMG('audio'), screenerSet: 'sleep', client: CLIENTS.lumen, matchScore: 75, daysLeft: 0,
    timeline: closed(-410, -402, 'Session completed', -399),
    clientReview: review(5, 'Reliable and on time.', 4, 5, 4) }),
  mk({ id: 'st-33', title: 'Community clinic intake interview', type: 'video_call', status: 'paid', reward: 175, durationMins: 45, industry: 'Healthcare',
    description: 'How a community clinic handles walk-in intake, from the front desk to triage.',
    targetProfession: 'Clinic front-desk and triage staff', image: IMG('clinic'), screenerSet: 'telehealth', client: CLIENTS.rjp, matchScore: 88, daysLeft: 0,
    timeline: closed(-250, -244, 'Session completed', -241),
    clientReview: review(5, 'Exactly the operational detail we were after.', 5, 5, 5) }),
  // Workflow 44: turned up, not needed, paid in full.
  mk({ id: 'st-16', title: 'Remote monitoring, clinician panel', type: 'group_video_call', status: 'not_needed', reward: 190, durationMins: 75, industry: 'Healthcare',
    description: 'A panel of clinicians on remote patient monitoring alerts, thresholds and follow-up.',
    targetProfession: 'Clinicians who review remote monitoring alerts', image: IMG('remote'), screenerSet: 'telehealth', client: CLIENTS.lumen, matchScore: 90, daysLeft: 0,
    timeline: closed(-230, -223, 'Turned up, not needed', -221) }),
  mk({ id: 'st-34', title: 'Clinic scheduling software interview', type: 'video_call', status: 'late_show', reward: 160, durationMins: 45, industry: 'Healthcare',
    description: 'A one-to-one interview on how appointment scheduling software fits into a busy clinic day.',
    targetProfession: 'Practice managers and clinic administrators', image: IMG('clinic'), screenerSet: 'telehealth', client: CLIENTS.harbor, matchScore: 84, daysLeft: 0,
    booking: { date: at(-322, 11, 0), slot: '11:00 AM', rescheduleCount: 0 },
    clientReview: review(4, 'Good input once we got going, though the session started fifteen minutes late.', 4, 3, 4),
    timeline: [{ label: 'Applied', at: at(-334, 10, 36) }, { label: 'Invited to schedule', at: at(-331, 12, 0) }, { label: 'Scheduled', at: at(-330, 14, 0) },
      { label: 'Late show up', at: at(-322, 11, 15) }, { label: 'Earnings credited', at: at(-322, 12, 0) }, { label: 'Client approved payout', at: at(-320, 9, 30) }, { label: 'Paid', at: at(-320, 10, 0) }] }),
  mk({ id: 'st-14', title: 'Fintech onboarding walkthrough', type: 'video_call', status: 'rejected', reward: 140, durationMins: 40, industry: 'Finance',
    description: 'A session on opening a business account, verifying identity and linking a card.',
    targetProfession: 'Small business owners who opened an account this year', image: IMG('fintech'), screenerSet: 'fintech', client: CLIENTS.brightline, matchScore: 52, daysLeft: 0,
    timeline: [{ label: 'Applied', at: at(-28, 9, 15) }, { label: 'Rejected', at: at(-26, 10, 30) }] }),
  mk({ id: 'st-15', title: 'Beverage tasting focus group', type: 'in_person_group', status: 'no_show', reward: 130, durationMins: 90, industry: 'Food', city: 'Austin',
    description: 'Taste a new range of soft drinks with seven other people and talk through your reactions.',
    targetProfession: 'Adults who drink soft drinks weekly', image: IMG('beverage'), screenerSet: 'food', client: CLIENTS.meadow, matchScore: 64, daysLeft: 0,
    booking: { date: at(-9, 13, 15), slot: '01:00 PM', locationId: 'atx-dt', rescheduleCount: 0 },
    timeline: [{ label: 'Applied', at: at(-20, 10, 36) }, { label: 'Invited to schedule', at: at(-16, 12, 0) }, { label: 'Scheduled', at: at(-15, 14, 0) }, { label: 'No Show', at: at(-9, 13, 15) }] }),
]

export const ALL_TYPES: Study['type'][] = ['survey', 'video_call', 'group_video_call', 'in_person', 'in_person_group', 'diary']
export const ALL_STATUSES: StudyStatus[] = [
  'available', 'invited_to_apply', 'applying', 'draft', 'applied', 'invited_to_schedule',
  'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed',
]
