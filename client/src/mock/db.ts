import type { RespondentState, StudyState } from '../lib/lifecycle'
import type { RatingState, RepeatRule } from '../lib/policy'
import { tierFor, trustScore } from '../lib/policy'
import type { StudyType, Tier } from '../lib/studyTypes'

/**
 * The one underlying list. Every figure on every screen is derived from this
 * file by `lib/derive.ts`; no screen holds a number of its own.
 *
 * The names, roles, titles and rates are the frames' own, so appearance is
 * unchanged. What has gone is the second copy: the Studies list, the study
 * header, the recruiting tabs, Results, the dashboard tiles and the billing
 * card each used to carry their own literals, and they disagreed.
 */

// ------------------------------------------------------------------- people

export interface Person {
  id: string
  /**
   * Workflow step 27: the client sees a first name only, with role, location
   * and experience. No surname, email or phone reaches this file at all.
   */
  name: string
  role: string
  location: string
  experienceYears: number
  /** Step 17: a credential checked against the public register for that profession. */
  professionVerified?: boolean
  /** Policy: the trust score is derived, never stored. These are its two inputs. */
  completedStudiesThisYear: number
  recentStars: number[]
  /** Step 57 and the policy guardrail: which of this client's studies they have been in. */
  priorStudies: string[]
}

const person = (
  id: string, name: string, role: string, completedStudiesThisYear: number, recentStars: number[],
  extra: Partial<Person> = {},
): Person => ({
  id, name, role, location: 'New York, US', experienceYears: 10,
  completedStudiesThisYear, recentStars, priorStudies: [], ...extra,
})

/**
 * The pool. The first ten are the names the Results frame draws, the next ten
 * the Recruited frames, then the Dashboard's recommended cards and the Pool's
 * own tiles, so every frame keeps the names it was drawn with.
 */
export const PEOPLE: Person[] = [
  person('ferry-l', 'Ferry L', 'Oncologist', 8, [5, 5, 5, 4, 5, 5, 5, 4, 5, 5], { professionVerified: true, experienceYears: 10 }),
  person('james-k', 'James K', 'Oncologist', 8, [5, 5, 5, 4, 5, 5, 5, 4, 5, 5], { professionVerified: true }),
  person('jordan-m', 'Jordan M', 'Cardiologist', 6, [4, 4, 5, 4, 4, 3, 4, 5, 4, 4]),
  person('samantha-t', 'Samantha T', 'Neurologist', 5, [4, 3, 4, 3, 4, 4, 3, 4, 3, 4]),
  person('emily-r', 'Emily R', 'Pediatrician', 7, [5, 4, 4, 4, 5, 4, 4, 4, 5, 4], { professionVerified: true }),
  person('michael-b', 'Michael B', 'Dermatologist', 9, [5, 5, 4, 5, 4, 5, 5, 4, 5, 4]),
  person('laura-j', 'Laura J', 'Endocrinologist', 4, [3, 4, 3, 4, 3, 3, 4, 3, 4, 3]),
  person('kevin-w', 'Kevin W', 'Orthopedic Surgeon', 10, [5, 5, 5, 5, 5, 5, 4, 5, 5, 5], { professionVerified: true }),
  person('nina-s', 'Nina S', 'Psychiatrist', 6, [4, 4, 3, 4, 4, 4, 3, 4, 4, 4]),
  person('oliver-p', 'Oliver P', 'Gastroenterologist', 3, [3, 2, 3, 3, 2, 3, 3, 2, 3, 3]),

  person('veronica-l', 'Veronica L', 'Human Resources Manager', 8, [5, 5, 4, 5, 5, 4, 5, 5, 4, 5], { professionVerified: true }),
  person('john-m', 'John M', 'Operations Manager', 9, [5, 5, 5, 4, 5, 5, 5, 5, 4, 5]),
  person('john-m-2', 'John M', 'Supply Chain Specialist', 9, [5, 5, 5, 5, 4, 5, 5, 5, 5, 4]),
  person('john-m-3', 'John M', 'Sales Strategist', 6, [4, 4, 4, 5, 4, 4, 4, 4, 5, 4]),
  person('john-m-4', 'John M', 'Compliance Officer', 7, [4, 5, 4, 4, 5, 4, 4, 5, 4, 4]),
  person('john-m-5', 'John M', 'Financial Consultant', 9, [5, 5, 4, 5, 5, 5, 4, 5, 5, 5]),
  person('john-m-6', 'John M', 'Project Coordinator', 4, [3, 4, 3, 4, 4, 3, 3, 4, 4, 3]),
  person('john-m-7', 'John M', 'Business Analyst', 6, [4, 4, 5, 4, 4, 4, 4, 4, 5, 4]),
  person('john-m-8', 'John M', 'Market Research Analyst', 2, [2, 3, 2, 2, 3, 2, 3, 2, 2, 3]),
  person('john-m-9', 'John M', 'Data Analyst', 3, [3, 3, 3, 3, 4, 3, 3, 3, 3, 3]),

  person('michael-t', 'Michael T', 'Software Engineer', 9, [5, 5, 5, 4, 5, 5, 5, 4, 5, 5]),
  person('sophia-k', 'Sophia K', 'Product Designer', 7, [4, 5, 4, 4, 5, 4, 5, 4, 4, 5]),
  person('david-l', 'David L', 'Data Analyst', 6, [4, 4, 5, 4, 4, 4, 5, 4, 4, 4]),
  person('olivia-j', 'Olivia J', 'Project Manager', 9, [5, 5, 4, 5, 5, 5, 5, 4, 5, 5]),
  person('james-c', 'James C', 'UX Researcher', 7, [5, 4, 4, 5, 4, 4, 5, 4, 4, 5]),
  person('ava-b', 'Ava B', 'Sales Executive', 10, [5, 5, 5, 5, 5, 4, 5, 5, 5, 5]),
  person('lucas-h', 'Lucas H', 'Content Writer', 6, [4, 4, 4, 5, 4, 4, 4, 4, 4, 5]),

  person('r-ferry', 'Ferry L.', 'Physiology Therapist, Orthopedic', 10, [5, 5, 5, 5, 5, 5, 5, 5, 4, 5], { professionVerified: true }),
  person('r-sophie', 'Sophie A.', 'Clinical Psychologist', 8, [5, 4, 5, 4, 5, 5, 4, 5, 4, 5], { professionVerified: true }),
  person('r-ella', 'Ella M.', 'Nutritionist', 7, [4, 5, 4, 4, 5, 4, 5, 4, 4, 5]),
  person('r-tom', 'Tom H.', 'Cardiologist', 10, [5, 5, 5, 5, 5, 5, 5, 4, 5, 5]),
  person('r-liam', 'Liam T.', 'Orthopedic Surgeon', 10, [5, 5, 5, 5, 4, 5, 5, 5, 5, 5], { professionVerified: true }),
  person('r-david', 'David P.', 'Gastroenterologist', 10, [5, 5, 5, 5, 5, 5, 4, 5, 5, 5]),
  person('r-james', 'James K.', 'Pediatrician', 9, [5, 5, 4, 5, 5, 5, 5, 4, 5, 5], { professionVerified: true }),
  person('r-ava', 'Ava R.', 'Dermatologist', 9, [5, 5, 5, 4, 5, 5, 4, 5, 5, 5], { professionVerified: true }),
  person('r-nina', 'Nina C.', 'Radiologist', 2, [3, 2, 2, 3, 2, 3, 2, 2, 3, 2]),

  /* The Pool's own tiles (1645:161430). Same list, same scoring. */
  person('tom-h', 'Tom H.', 'Chiropractor, Sports Medicine', 10, [5, 5, 5, 5, 5, 5, 5, 5, 5, 4], { professionVerified: true }),
  person('sofia-p', 'Sofia P.', 'Occupational Therapist, Pediatric', 10, [5, 5, 5, 5, 5, 4, 5, 5, 4, 5], { professionVerified: true }),
  person('yara-m', 'Yara M.', 'Rehabilitation Specialist, Cardiology', 9, [5, 5, 5, 4, 5, 5, 4, 5, 5, 5], { professionVerified: true }),
  person('daniel-l', 'Daniel L.', 'Acupuncturist, Chronic Pain', 8, [5, 4, 5, 4, 5, 4, 5, 4, 5, 5], { professionVerified: true }),
  person('alice-f', 'Alice F.', 'Exercise Physiologist, Fitness', 6, [4, 4, 5, 4, 4, 4, 5, 4, 4, 4], { professionVerified: true }),
  person('clara-j', 'Clara J.', 'Pilates Instructor, Holistic Health', 9, [5, 5, 4, 5, 5, 5, 4, 5, 5, 5], { professionVerified: true }),
  person('xander-b', 'Xander B.', 'Physiotherapist, Geriatrics', 10, [5, 5, 5, 5, 4, 5, 5, 5, 5, 5], { professionVerified: true }),
  person('zach-k', 'Zach K.', 'Athletic Trainer, Injury Prevention', 5, [4, 4, 4, 4, 4, 4, 4, 4, 4, 4], { professionVerified: true }),
  person('brian-d', 'Brian D.', 'Orthopedic Surgeon, Sports', 6, [4, 4, 5, 4, 4, 4, 5, 4, 4, 4], { professionVerified: true }),
  person('victor-s', 'Victor S.', 'Massage Therapist, Wellness', 4, [4, 4, 4, 3, 4, 4, 4, 3, 4, 4], { professionVerified: true }),
  person('uma-r', 'Uma R.', 'Physical Therapist, Neurology', 3, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], { professionVerified: true }),
  person('wendy-t', 'Wendy T.', 'Kinesiologist, Rehabilitation', 3, [3, 3, 3, 3, 3, 3, 3, 3, 2, 3], { professionVerified: true }),
]

export const personById = (id: string) => PEOPLE.find((p) => p.id === id)

/** Policy: the score is derived from its two inputs, never stored. */
export const scoreOf = (p: Person) => trustScore(p)
export const tierOf = (p: Person): Tier => tierFor(scoreOf(p))

// ------------------------------------------------------------ participation

export interface Participation {
  personId: string
  state: RespondentState
  /** Step 28: the three eligibility questions, asked before the full screener. */
  prescreener?: 'passed' | 'terminated'
  /** Step 29: a borderline answer is held for review rather than rejected. */
  heldForReview?: boolean
  /** Step 38: the slot a session study books. */
  slot?: { day: string; time: string; sessionId?: string }
  /** Step 42: a code at the end of every session, entered by both sides. */
  code?: { value: string; byParticipant: boolean; byClient: boolean }
  /** Step 52: the client's rating, in the policy's three states. */
  rating?: RatingState
  /** Step 46: the client has confirmed this person on the payout list. */
  payoutApproved?: boolean
  completedAt?: string
}

// ------------------------------------------------------------------- study

export interface Study {
  id: string
  /** Exactly as the Studies table writes it, including its capitalisation. */
  name: string
  /** What the study header and the cards write, which the frames set in sentence case. */
  title: string
  /** The breadcrumb the Manage frames draw, which names a different study. */
  breadcrumb: string
  type: StudyType
  state: StudyState
  industry: string
  duration: string
  description: string
  image?: string
  created: string
  createdIso: string
  activeSince?: string
  shareLink?: string
  dates?: string
  daysRemaining: number
  /** The sample size the client asked for. Every count on every screen is against this. */
  required: number
  /** Step 57 and the policy guardrail. */
  repeatRule: RepeatRule
  /** The rates the billing card is built from. Figma's own figures. */
  rates: { platformFee: number; recruitingPer: number; incentivePer: number; moderationPer: number }
  participants: Participation[]
  /** Set when the team takes it live, so `in_review` can be told from `recruiting`. */
  approvedAt?: string
  /** Manage Study (1627:96085): the Create flow's four steps read back. */
  review?: StudyReview
}

export interface StudyReview {
  studyTime: string
  estimatedAudience: string
  audience: { label?: string; value: string; icon?: string }[]
  screener: { label: string; value: string }
  /** The one row the study type changes. */
  studyRow: { label: string; value: string }
  incentive: { label: string; value: string }
}

const AUDIENCE = [
  { value: '10', icon: 'people' },
  { value: 'Worldwide', icon: 'pin' },
  { label: 'Gender', value: 'All' },
  { label: 'Education', value: 'High school graduate' },
  { label: 'Age', value: '18-22, 31-40' },
  { label: 'Age', value: '18-22, 31-40' },
  { label: 'Work Functions', value: 'Consultation' },
  { label: 'Roles', value: 'Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner' },
  { label: 'Industry', value: 'Healthcare, Pharma' },
  { label: 'Organization Size', value: 'Self employed, 1-10, 10-50' },
]

const review = (studyTime: string, studyRow: { label: string; value: string }, roles?: string): StudyReview => ({
  studyTime,
  estimatedAudience: '1K',
  audience: roles ? AUDIENCE.map((a) => (a.label === 'Roles' ? { ...a, value: roles } : a)) : AUDIENCE,
  screener: { label: 'Screening', value: '8 inputs' },
  studyRow,
  incentive: { label: 'Incentive', value: '$700' },
})

const slotsFor = (n: number) => {
  const times = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']
  return Array.from({ length: n }, (_, i) => ({
    day: i === 0 ? '12 Aug, Wed' : '16 Aug, Fri',
    time: i === 0 ? '10:00 AM' : times[(i - 1) % times.length],
  }))
}

/**
 * Builds a study's participant list from counts, so the counts and the list
 * can never disagree. The order is the pool order, which is why the Results
 * table still reads Ferry L, James K, Jordan M as the frame draws it.
 */
function participants(counts: {
  completed: number; rated: number; noShow: number; recruited: number; scheduled: number
  qualified: number; disqualified: number; applied: number; invited: number; matched: number
}, opts: { sessions?: boolean } = {}): Participation[] {
  const out: Participation[] = []
  let i = 0
  const take = (n: number, make: (p: Person, k: number) => Participation) => {
    for (let k = 0; k < n; k += 1) {
      const p = PEOPLE[i % PEOPLE.length]
      i += 1
      out.push(make(p, k))
    }
  }
  const day = (k: number) => `Aug ${10 - Math.floor(k / 3)}, 2026`
  const code = (k: number) => ({ value: String(407060 + k), byParticipant: true, byClient: true })

  take(counts.rated, (p, k) => ({ personId: p.id, state: 'rated', prescreener: 'passed', completedAt: day(k), code: code(k), rating: 'excellent' }))
  take(counts.completed, (p, k) => ({ personId: p.id, state: 'completed', prescreener: 'passed', completedAt: day(k + counts.rated), code: code(k) }))
  take(counts.noShow, (p) => ({ personId: p.id, state: 'no_show', prescreener: 'passed' }))
  const slots = slotsFor(counts.scheduled)
  take(counts.scheduled, (p, k) => ({ personId: p.id, state: 'scheduled', prescreener: 'passed', slot: slots[k] }))
  take(counts.recruited, (p) => ({ personId: p.id, state: 'recruited', prescreener: 'passed' }))
  take(counts.qualified, (p) => ({ personId: p.id, state: 'qualified', prescreener: 'passed' }))
  take(counts.disqualified, (p) => ({ personId: p.id, state: 'disqualified', prescreener: 'terminated' }))
  take(counts.applied, (p, k) => ({ personId: p.id, state: 'applied', prescreener: 'passed', heldForReview: k % 5 === 0 }))
  take(counts.invited, (p) => ({ personId: p.id, state: 'invited' }))
  take(counts.matched, (p) => ({ personId: p.id, state: 'matched' }))
  void opts
  return out
}

export const RATES = { platformFee: 100, recruitingPer: 20, incentivePer: 100, moderationPer: 10 }

/**
 * The six studies the Studies frames draw, now carrying their people. The
 * Manage header's 30 required / 60 applied / 35 qualified / 20 completed is
 * taken as the truth for st-pay; the Studies list used to print 12 / 8 / 3
 * for the same study and now derives from this list instead.
 */
export const STUDIES: Study[] = [
  {
    id: 'st-goal', name: 'About goal-tracking methods', title: 'About goal-tracking methods',
    type: 'video_call', state: 'recruiting',
    breadcrumb: 'Business Finance Operations Study', industry: 'Business', duration: '1 hour',
    description: 'Discuss the effectiveness of the goal-setting tools in helping users achieve their fitness milestones.',
    image: '/img/goals.jpg', created: '30 Jul, 2026', createdIso: '2026-07-30', daysRemaining: 16,
    dates: 'Jan 25 – Feb 24', activeSince: 'July 10, 2026, 02:30 PM', approvedAt: '2026-07-31',
    shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
    required: 40, repeatRule: 'prefer_fresh', rates: RATES,
    participants: participants({ completed: 0, rated: 0, noShow: 0, recruited: 6, scheduled: 4, qualified: 10, disqualified: 5, applied: 15, invited: 8, matched: 9 }),
    review: review('1 hour', { label: 'Video Call', value: '1:1 sessions, 5 days/week, custom timings' }),
  },
  {
    id: 'st-pay', name: 'How Do You Make Your Digital Payments Mostly?',
    title: 'How do you make your digital payments mostly?', breadcrumb: 'Mobile App Usability Testing',
    type: 'diary', state: 'recruiting', industry: 'Finance', duration: '1 hour',
    description: 'Share about your ways of digital spending and payment methods you use in your daily life.',
    image: '/img/card.jpg', created: '25 Jul, 2026', createdIso: '2026-07-25', daysRemaining: 36,
    dates: 'Jan 25 – Feb 24', activeSince: 'July 10, 2026, 02:30 PM', approvedAt: '2026-07-26',
    shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
    required: 30, repeatRule: 'prefer_fresh', rates: RATES,
    participants: participants({ completed: 17, rated: 3, noShow: 2, recruited: 4, scheduled: 0, qualified: 9, disqualified: 6, applied: 19, invited: 7, matched: 9 }),
    review: review('1 hour', { label: 'Diary Study Form', value: '5 questions, 5 days logs' }),
  },
  {
    id: 'st-sleep', name: 'Share About Your Sleep Cycle', title: 'Share about your sleep cycle',
    breadcrumb: 'Sleep Cycle Interviews', type: 'in_person', state: 'completed', industry: 'Healthcare', duration: '1 hour',
    description: 'Share about your sleep cycle, how you track it and what changes it through the week.',
    image: '/img/sleep.jpg', created: '15 Jul, 2026', createdIso: '2026-07-15', daysRemaining: 0,
    dates: 'Jan 25 – Feb 24', activeSince: 'July 10, 2026, 02:30 PM', approvedAt: '2026-07-16',
    shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
    required: 60, repeatRule: 'allow', rates: RATES,
    participants: participants({ completed: 48, rated: 12, noShow: 3, recruited: 0, scheduled: 10, qualified: 4, disqualified: 8, applied: 0, invited: 0, matched: 0 }),
    review: review('1 hour', { label: 'In-Person', value: '2 addresses, available 5 days/week, custom timings, 2 days overrides' }),
  },
  {
    id: 'st-fitness', name: 'Fitness Tracker Apps Experience', title: 'Fitness tracker apps experience',
    breadcrumb: 'Fitness Tracker Group Sessions', type: 'group_video_call', state: 'ongoing', industry: 'Health', duration: '1 hour',
    description: 'Talk through the fitness tracker apps you use and what keeps you coming back to them.',
    image: '/img/runner.jpg', created: '20 Jul, 2026', createdIso: '2026-07-20', daysRemaining: 12,
    dates: 'Jan 25 – Feb 24', activeSince: 'July 10, 2026, 02:30 PM', approvedAt: '2026-07-21',
    shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
    required: 60, repeatRule: 'prefer_fresh', rates: RATES,
    participants: participants({ completed: 18, rated: 2, noShow: 4, recruited: 2, scheduled: 10, qualified: 6, disqualified: 7, applied: 12, invited: 6, matched: 9 }),
    review: review('1 hour', { label: 'Group Video Call', value: '2 sessions, 10 seats, 40 minutes each' }),
  },
  {
    id: 'st-travel', name: 'Travel preferences and experiences', title: 'Travel preferences and experiences',
    breadcrumb: 'Travel Preferences Group Sessions', type: 'in_person_group', state: 'completed',
    industry: 'Travel', duration: '1 hour',
    description: 'Talk through how you plan and book travel, and what changes your mind at the last minute.',
    image: '/img/airport.jpg', created: '10 Jul, 2026', createdIso: '2026-07-10', daysRemaining: 0,
    dates: 'Jan 25 – Feb 24', approvedAt: '2026-07-11',
    required: 45, repeatRule: 'allow', rates: RATES,
    participants: participants({ completed: 34, rated: 6, noShow: 2, recruited: 0, scheduled: 0, qualified: 0, disqualified: 5, applied: 0, invited: 0, matched: 0 }),
    review: review('1 hour', { label: 'In-Person Group', value: '2 addresses, 2 sessions, 10 seats' }),
  },
  {
    id: 'st-social', name: 'Social media posts designing apps', title: 'Social media posts designing apps',
    breadcrumb: 'GLP-1 Care Plans, Oncologist View',
    type: 'survey', state: 'recruiting', industry: 'Consumer', duration: '30 minutes',
    description: 'How do you design social media posts and what tools do you use for it',
    image: '/img/canva.jpg', created: '10 Jul, 2026', createdIso: '2026-07-10', daysRemaining: 36,
    dates: 'Jan 25 – Feb 24', activeSince: 'July 10, 2026, 02:30 PM', approvedAt: '2026-07-11',
    shareLink: 'https://focusinsite.com/study/S123456/business-finance-operation-analysis/',
    required: 30, repeatRule: 'exclude', rates: RATES,
    participants: participants({ completed: 4, rated: 1, noShow: 1, recruited: 5, scheduled: 0, qualified: 8, disqualified: 4, applied: 14, invited: 7, matched: 9 }),
    review: review('30 minutes', { label: 'Survey Form', value: '10 inputs' }, 'Social Media Influencer, Creator, Digital Marketer, Graphic Designer'),
  },
]

/** Drafts (1518:90624). A draft has no people and no numbers, by definition. */
export const DRAFT_STUDIES: Study[] = [
  ['dr-1', 'About goal-tracking methods', 'survey', '30 Jul, 2026'],
  ['dr-2', 'How Do You Make Your Digital Payments Mostly?', 'diary', '25 Jul, 2026'],
  ['dr-3', 'Social Media Posts Designing Apps', 'in_person', '15 Jul, 2026'],
  ['dr-4', 'Fitness Tracker Apps Experience', 'video_call', '20 Jul, 2026'],
  ['dr-5', 'Share About Your Sleep Cycle', 'in_person_group', '10 Jul, 2026'],
].map(([id, name, type, created]) => ({
  id: id as string, name: name as string, title: name as string, breadcrumb: name as string,
  type: type as StudyType, state: 'draft' as StudyState,
  industry: '', duration: '', description: '', created: created as string,
  createdIso: '2026-07-01', daysRemaining: 0, required: 0, repeatRule: 'prefer_fresh' as RepeatRule,
  rates: RATES, participants: [],
}))

/** Completed (1518:90760). Older studies, kept so the tab has its five rows. */
export const ARCHIVE_STUDIES: Study[] = [
  ['cp-1', 'Social media posts designing apps', 'survey', 30, 30, '30 Jul, 2026'],
  ['cp-2', 'How Do You Make Your Digital Payments Mostly?', 'diary', 30, 25, '25 Jul, 2026'],
  ['cp-3', 'Social Media Posts Designing Apps', 'in_person', 35, 32, '15 Jul, 2026'],
  ['cp-4', 'Fitness Tracker Apps Experience', 'video_call', 60, 60, '20 Jul, 2026'],
  ['cp-5', 'Share About Your Sleep Cycle', 'in_person_group', 50, 40, '10 Jul, 2026'],
].map(([id, name, type, required, completed, created]) => ({
  id: id as string, name: name as string, title: name as string, breadcrumb: name as string,
  type: type as StudyType, state: 'completed' as StudyState,
  industry: '', duration: '1 hour', description: '', created: created as string,
  createdIso: '2026-07-01', daysRemaining: 0, required: required as number,
  repeatRule: 'allow' as RepeatRule, rates: RATES,
  participants: participants({
    completed: completed as number, rated: 0, noShow: 0, recruited: 0, scheduled: 0,
    qualified: 0, disqualified: 0, applied: 0, invited: 0, matched: 0,
  }),
}))

export const ALL_STUDIES = [...STUDIES, ...DRAFT_STUDIES, ...ARCHIVE_STUDIES]
