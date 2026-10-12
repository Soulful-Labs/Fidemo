import { RATING_DELTA, TRUST } from '../rules'
import type { Check, Person, ProfileDetails, Stars } from '../types'

/**
 * The people in the seed. One list for all three apps: the respondent app
 * signs in as the first of them, the client app's pool and recruiting tabs
 * are these people by first name, and the console lists them in full.
 *
 * Nobody here has a Trust Score. Each has a record from before the seed's
 * window (`prior`), and everything since is in their participations.
 */

/**
 * A rating history whose policy deltas add up to what a score needs, so a
 * person's `prior` produces the score their frame drew. The score is still
 * computed by rules.ts from these stars; this only chooses the stars.
 */
export function starsFor(target: number, studies: number): Stars[] {
  const need = Math.max(-TRUST.RATINGS_MAX, Math.min(TRUST.RATINGS_MAX, target - TRUST.ONBOARDING - Math.min(studies, TRUST.STUDY_COMPLETION_CAP_PER_YEAR)))
  return starsSumming(need, TRUST.RATINGS_WINDOW)
}

/** `n` ratings whose policy deltas add up to `need`, lowest first; the closest reachable sum when `need` cannot be hit exactly. */
export function starsSumming(need: number, n: number): Stars[] {
  if (n <= 0) return []
  let best: Stars[] = Array(n).fill(3) as Stars[]
  let gap = Infinity
  for (let a = n; a >= 0; a -= 1) for (let b = n - a; b >= 0; b -= 1) for (let c = n - a - b; c >= 0; c -= 1) for (let d = n - a - b - c; d >= 0; d -= 1) {
    const e = n - a - b - c - d
    const got = a * RATING_DELTA[5] + b * RATING_DELTA[4] + c * RATING_DELTA[3] + d * RATING_DELTA[2] + e * RATING_DELTA[1]
    if (Math.abs(got - need) < gap) {
      gap = Math.abs(got - need)
      best = [...Array(e).fill(1), ...Array(d).fill(2), ...Array(c).fill(3), ...Array(b).fill(4), ...Array(a).fill(5)] as Stars[]
      if (gap === 0) return best
    }
  }
  return best
}

/** The score each person's record is written to produce, by id. */
export const targetScore = (id: string): number | undefined => [...ROWS, ...GENERATED].find((r) => r[0] === id)?.[7]

export const EMPTY_PROFILE: ProfileDetails = {
  gender: '', address: '', areaType: '', aboutMe: '', languages: [], nationality: '', income: '', ethnicity: '',
  pets: [], homeOwner: '', occupation: '', experience: '', licenseId: '', industry: '', education: '', topics: [],
  dob: '', idType: '',
}

const VERIFIED: Check = { state: 'verified' }
const NONE: Check = { state: 'not_started' }

/** id, name, role, industry, location, gender, studies completed this year before the seed, the score the prior record gives, profession verified, language */
type Row = [string, string, string, string, string, 'Male' | 'Female', number, number, boolean?, string?]

const NY = 'New York, US'
const ROWS: Row[] = [
  // The clinicians the client app's Results tables are drawn around.
  ['ferry-l', 'Ferry Lindqvist', 'Oncologist', 'Healthcare', NY, 'Male', 8, 92, true],
  ['james-k', 'James Kowalski', 'Oncologist', 'Healthcare', NY, 'Male', 8, 92, true],
  ['jordan-m', 'Jordan Mitchell', 'Cardiologist', 'Healthcare', 'Boston, US', 'Male', 6, 85],
  ['samantha-t', 'Samantha Torres', 'Neurologist', 'Healthcare', NY, 'Female', 5, 78],
  ['emily-r', 'Emily Rhodes', 'Pediatrician', 'Healthcare', 'Chicago, US', 'Female', 7, 88, true],
  ['michael-b', 'Michael Brandt', 'Dermatologist', 'Healthcare', NY, 'Male', 9, 90],
  ['laura-j', 'Laura Jensen', 'Endocrinologist', 'Healthcare', 'Austin, US', 'Female', 4, 76],
  ['kevin-w', 'Kevin Walsh', 'Orthopedic Surgeon', 'Healthcare', NY, 'Male', 10, 95, true],
  ['nina-s', 'Nina Sandoval', 'Psychiatrist', 'Healthcare', 'Miami, US', 'Female', 6, 82],
  ['oliver-p', 'Oliver Price', 'Gastroenterologist', 'Healthcare', NY, 'Male', 3, 68],
  // Business roles, from the Recruited tables. Eight of them joined through Jonathan's referral link.
  ['veronica-l', 'Veronica Lang', 'Human Resources Manager', 'Consultancy', NY, 'Female', 8, 90, true],
  ['john-m', 'John Mercer', 'Operations Manager', 'Retail', 'Chicago, US', 'Male', 9, 92],
  ['sarah-j', 'Sarah Johnson', 'Supply Chain Specialist', 'Retail', NY, 'Female', 9, 92],
  ['marcus-w', 'Marcus Webb', 'Sales Strategist', 'Retail', 'Austin, US', 'Male', 6, 85],
  ['dana-o', 'Dana Okafor', 'Compliance Officer', 'Finance', NY, 'Female', 7, 88],
  ['tom-a', 'Tom Alvarez', 'Financial Consultant', 'Finance', 'Miami, US', 'Male', 9, 91],
  ['lena-f', 'Lena Fischer', 'Project Coordinator', 'Consultancy', 'Boston, US', 'Female', 4, 78],
  ['ravi-m', 'Ravi Menon', 'Business Analyst', 'Finance', NY, 'Male', 6, 86, false, 'Hindi'],
  ['chloe-b', 'Chloe Barnes', 'Market Research Analyst', 'Marketing', 'Chicago, US', 'Female', 2, 65],
  ['priya-n', 'Priya Nair', 'Data Analyst', 'Finance', NY, 'Female', 3, 70, false, 'Hindi'],
  // The client dashboard's recommended respondents.
  ['michael-t', 'Michael Tanaka', 'Software Engineer', 'IT', 'San Francisco, US', 'Male', 9, 92],
  ['sophia-k', 'Sophia Keller', 'Product Designer', 'IT', 'Austin, US', 'Female', 7, 88],
  ['david-l', 'David Lowe', 'Data Analyst', 'Finance', 'Los Angeles, US', 'Male', 6, 87],
  ['olivia-j', 'Olivia Jarrett', 'Project Manager', 'Marketing', NY, 'Female', 9, 91],
  ['james-c', 'James Chu', 'UX Researcher', 'IT', 'Seattle, US', 'Male', 7, 89],
  ['ava-b', 'Ava Bennett', 'Sales Executive', 'Retail', 'Chicago, US', 'Female', 10, 93],
  ['lucas-h', 'Lucas Hart', 'Content Writer', 'Media', 'Denver, US', 'Male', 6, 86],
  ['felix-l', 'Felix Laurent', 'Physiology Therapist, Orthopedic', 'Healthcare', NY, 'Male', 10, 95, true],
  ['sophie-a', 'Sophie Adler', 'Clinical Psychologist', 'Healthcare', 'Boston, US', 'Female', 8, 89, true],
  ['ella-m', 'Ella Marsh', 'Nutritionist', 'Fitness & Nutrition', NY, 'Female', 7, 87],
  ['tomas-h', 'Tomas Herrera', 'Cardiologist', 'Healthcare', 'Miami, US', 'Male', 10, 95, false, 'Spanish'],
  ['liam-t', 'Liam Thornton', 'Orthopedic Surgeon', 'Healthcare', NY, 'Male', 10, 93, true],
  ['david-p', 'David Park', 'Gastroenterologist', 'Healthcare', 'Los Angeles, US', 'Male', 10, 94],
  ['jamie-k', 'Jamie Kent', 'Pediatrician', 'Healthcare', 'Chicago, US', 'Female', 9, 91, true],
  ['ava-r', 'Ava Romero', 'Dermatologist', 'Healthcare', NY, 'Female', 9, 90, true, 'Spanish'],
  ['nina-c', 'Nina Castillo', 'Radiologist', 'Healthcare', 'Austin, US', 'Female', 2, 68],
  // The twelve the client app's Pool is drawn with.
  ['tom-h', 'Tom Hale', 'Chiropractor, Sports Medicine', 'Fitness & Nutrition', NY, 'Male', 10, 98, true],
  ['sofia-p', 'Sofia Petrov', 'Occupational Therapist, Pediatric', 'Healthcare', NY, 'Female', 10, 94, true],
  ['yara-m', 'Yara Mansour', 'Rehabilitation Specialist, Cardiology', 'Healthcare', 'Boston, US', 'Female', 9, 92, true],
  ['daniel-l', 'Daniel Lopez', 'Acupuncturist, Chronic Pain', 'Pharma', NY, 'Male', 8, 89, true, 'Spanish'],
  ['alice-f', 'Alice Ford', 'Exercise Physiologist, Fitness', 'Fitness & Nutrition', 'Chicago, US', 'Female', 6, 84, true],
  ['clara-j', 'Clara Jones', 'Pilates Instructor, Holistic Health', 'Fitness & Nutrition', NY, 'Female', 9, 93, true],
  ['xander-b', 'Xander Boyd', 'Physiotherapist, Geriatrics', 'Healthcare', NY, 'Male', 10, 95, true],
  ['zach-k', 'Zach Kim', 'Athletic Trainer, Injury Prevention', 'Fitness & Nutrition', 'Austin, US', 'Male', 5, 80, true],
  ['brian-d', 'Brian Doyle', 'Orthopedic Surgeon, Sports', 'Healthcare', NY, 'Male', 6, 84, true],
  ['victor-s', 'Victor Santos', 'Massage Therapist, Wellness', 'Fitness & Nutrition', 'Miami, US', 'Male', 4, 79, true, 'Spanish'],
  ['uma-r', 'Uma Rao', 'Physical Therapist, Neurology', 'Healthcare', 'Boston, US', 'Female', 3, 69, true, 'Hindi'],
  ['wendy-t', 'Wendy Tran', 'Kinesiologist, Rehabilitation', 'Pharma', 'Chicago, US', 'Female', 3, 68, true],
  // The names the console's participant list is drawn with.
  ['samuel-l', 'Samuel Lee', 'Software Engineer', 'IT', 'San Francisco, US', 'Male', 0, 50],
  ['maya-j', 'Maya Johnson', 'Registered Nurse', 'Healthcare', 'Miami, US', 'Female', 4, 62],
  ['jenny-v', 'Jenny Vance', 'Physician, Therapist', 'Healthcare', 'Miami, US', 'Female', 3, 65],
  ['angela-p', 'Angela Patel', 'Project Manager', 'Marketing', NY, 'Female', 5, 75],
  ['david-j', 'David Johnson', 'Sales Executive', 'Retail', 'Chicago, US', 'Male', 10, 95],
  ['linda-t', 'Linda Thompson', 'HR Specialist', 'Consultancy', 'Denver, US', 'Female', 3, 67],
  ['robert-d', 'Robert Dunn', 'Assistant Accountant', 'Consultancy', 'Miami, US', 'Male', 5, 78],
  ['amelia-c', 'Amelia Clarke', 'Pharmacist', 'Pharma', 'Seattle, US', 'Female', 0, 50],
]

const FIRST = ['Noah', 'Isla', 'Ethan', 'Zoe', 'Omar', 'Grace', 'Henry', 'Mia', 'Leo', 'Ruby', 'Caleb', 'Iris']
const LAST = ['Whitfield', 'Okoro', 'Sorensen', 'Delgado', 'Hughes']
const GEN_ROLES: [string, string][] = [
  ['Triage Nurse', 'Healthcare'], ['Teacher', 'Education'], ['Practice Manager', 'Healthcare'], ['Pharmacist', 'Pharma'],
  ['Small Business Owner', 'Retail'], ['Content Creator', 'Media'], ['Digital Marketer', 'Marketing'], ['Ward Manager', 'Healthcare'],
  ['Graphic Designer', 'Media'], ['Personal Trainer', 'Fitness & Nutrition'],
]
const CITIES = [NY, 'Chicago, US', 'Boston, US', 'Austin, US', 'Miami, US', 'Seattle, US', 'Denver, US', 'Los Angeles, US']

/** Forty more, so a study of sixty has sixty different people on it. */
const GENERATED: Row[] = Array.from({ length: 40 }, (_, i) => {
  const first = FIRST[i % FIRST.length]!
  const last = LAST[Math.floor(i / FIRST.length) % LAST.length]! + (i >= 36 ? '-Reid' : '')
  const [role, industry] = GEN_ROLES[i % GEN_ROLES.length]!
  const studies = (i * 3) % 9
  return [`gen-${String(i + 1).padStart(2, '0')}`, `${first} ${last}`, role, industry, CITIES[i % CITIES.length]!, i % 2 ? 'Female' : 'Male', studies, 58 + ((i * 7) % 36), i % 4 === 0]
})

export interface PeopleClock { at: (offsetDays: number, hour?: number, minute?: number) => string }

const slugEmail = (name: string) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`

function fromRow([id, name, role, industry, location, gender, studies, score, verified, language]: Row, n: number, clock: PeopleClock): Person {
  return {
    id, name, email: slugEmail(name), phone: `+1 555 01${String(10 + n).padStart(2, '0')} ${String(100 + ((n * 37) % 900))}`,
    joinedAt: clock.at(-(120 + ((n * 23) % 400)), 9, 0), lastActiveAt: clock.at(-((n * 5) % 60), 8 + (n % 10), (n * 7) % 60),
    status: 'active', location,
    profile: {
      ...EMPTY_PROFILE, gender, address: location, areaType: 'Urban', languages: [language ?? 'English'], nationality: 'American',
      occupation: role, industry, experience: `${4 + (n % 14)} years`, education: 'Bachelors Degree',
      dob: `${String(1 + (n % 27)).padStart(2, '0')} / ${String(1 + (n % 12)).padStart(2, '0')} / ${1975 + (n % 22)}`, idType: 'Passport',
      licenseId: verified ? String(98765012340000 + n) : '',
    },
    onboarded: true, taxFormDone: true,
    identity: VERIFIED, profession: verified ? VERIFIED : NONE, livePhoto: false,
    consent: { shareProfession: true, shareProfile: true, essentialCookies: true, performanceCookie: true },
    emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
    prior: { completedThisYear: studies, stars: starsFor(score, studies) },
    trustEvents: [], payoutMethods: [], payouts: [], redemptions: [], referrals: [], savedStudyIds: [], notifications: [],
  }
}

/** Everyone but Jonathan, whose account is built in seed.ts with his whole history. */
export function buildPool(clock: PeopleClock): Person[] {
  return [...ROWS, ...GENERATED].map((row, i) => fromRow(row, i + 1, clock))
}
