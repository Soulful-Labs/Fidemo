import type { Tier } from '../lib/studyTypes'
import { PEOPLE, scoreOf, tierOf } from './db'

/** A respondent card in the Pool and in a panel's member list (1645:161430). */
export interface PoolPerson {
  id: string
  name: string
  role: string
  score: number
  tier: Tier
  /** What the filter rail narrows on. */
  domain: string
  gender: 'Male' | 'Female' | 'Other'
  location: string
  language: string
  lastActiveWeeks: number
}

/** Attributes per pool member, so the rail has something real to filter. */
const ATTRS: Record<string, Pick<PoolPerson, 'domain' | 'gender' | 'location' | 'language' | 'lastActiveWeeks'>> = {
  'tom-h': { domain: 'Fitness & Nutrition', gender: 'Male', location: 'New York, US', language: 'English', lastActiveWeeks: 1 },
  'sofia-p': { domain: 'Healthcare', gender: 'Female', location: 'New York, US', language: 'English', lastActiveWeeks: 2 },
  'yara-m': { domain: 'Healthcare', gender: 'Female', location: 'Boston, US', language: 'English', lastActiveWeeks: 3 },
  'daniel-l': { domain: 'Pharma', gender: 'Male', location: 'New York, US', language: 'Spanish', lastActiveWeeks: 5 },
  'alice-f': { domain: 'Fitness & Nutrition', gender: 'Female', location: 'Chicago, US', language: 'English', lastActiveWeeks: 2 },
  'clara-j': { domain: 'Fitness & Nutrition', gender: 'Female', location: 'New York, US', language: 'English', lastActiveWeeks: 1 },
  'xander-b': { domain: 'Healthcare', gender: 'Male', location: 'New York, US', language: 'English', lastActiveWeeks: 4 },
  'zach-k': { domain: 'Fitness & Nutrition', gender: 'Male', location: 'Austin, US', language: 'English', lastActiveWeeks: 8 },
  'brian-d': { domain: 'Healthcare', gender: 'Male', location: 'New York, US', language: 'English', lastActiveWeeks: 6 },
  'victor-s': { domain: 'Fitness & Nutrition', gender: 'Male', location: 'Miami, US', language: 'Spanish', lastActiveWeeks: 10 },
  'uma-r': { domain: 'Healthcare', gender: 'Female', location: 'Boston, US', language: 'Hindi', lastActiveWeeks: 14 },
  'wendy-t': { domain: 'Pharma', gender: 'Female', location: 'Chicago, US', language: 'English', lastActiveWeeks: 20 },
}

/**
 * The twelve the Pool frame draws, now taken from the one person list with
 * the score and tier derived by the policy rather than printed beside it.
 * Step 24 ranks by score and tier, which is the order they come back in.
 */
const POOL_IDS = [
  'tom-h', 'sofia-p', 'yara-m', 'daniel-l', 'alice-f', 'clara-j',
  'xander-b', 'zach-k', 'brian-d', 'victor-s', 'uma-r', 'wendy-t',
]

export const POOL_PEOPLE: PoolPerson[] = POOL_IDS
  .map((id) => PEOPLE.find((p) => p.id === id)!)
  .map((p) => ({ id: p.id, name: p.name, role: p.role, score: scoreOf(p), tier: tierOf(p), ...ATTRS[p.id]! }))

export const POOL_SEARCH = 'Describe your required audience to search and filter or search by name, role, score, tiers, industry, etc.'
/** The pool the rail filters. The frame writes 260 behind its twelve cards. */
export const POOL_TOTAL = POOL_PEOPLE.length

/** The filter rail, in the order the frame stacks it. */
export const POOL_FILTERS = {
  tiers: ['Any', 'Silver', 'Gold', 'Platinum'],
  score: ['Any', '90 & above', '80 & above', '70 & above'],
  gender: ['All', 'Male', 'Female', 'Other'],
  lastActive: ['Any', '2 weeks', '1 month', '3 months'],
  roles: { label: 'ROLES', placeholder: 'Select roles' },
  domain: { label: 'DOMAIN', placeholder: 'Select domains' },
  location: { label: 'LOCATION', placeholder: 'Select city, country' },
  language: { label: 'LANGUAGE', placeholder: 'Select languages' },
}

/** What each picker offers, taken from the pool itself so nothing is dead. */
export const POOL_OPTIONS = {
  roles: [...new Set(POOL_PEOPLE.map((p) => p.role.split(',')[0]!.trim()))].sort(),
  domain: [...new Set(POOL_PEOPLE.map((p) => p.domain))].sort(),
  location: [...new Set(POOL_PEOPLE.map((p) => p.location))].sort(),
  language: [...new Set(POOL_PEOPLE.map((p) => p.language))].sort(),
}

/**
 * The pool opens with nothing filtered.
 *
 * The frame draws six chips already on — Physician, Healthcare, Pharma,
 * Fitness & Nutrition, New York US, English — narrowing 260 to 208, with no
 * way to take any of them off and nothing saying why they are there. Now that
 * the rail works, starting filtered would hide most of the pool behind
 * filters nobody chose. Flagged for the designer.
 */
export const POOL_DEFAULT_FILTERS = {
  tiers: [] as string[],
  score: 'Any',
  gender: 'All',
  lastActive: 'Any',
  roles: [] as string[],
  domain: [] as string[],
  location: [] as string[],
  language: [] as string[],
  query: '',
}

export type PoolFilters = typeof POOL_DEFAULT_FILTERS

/** A micro-panel card. Mine carry roles and a kebab; featured carry a description. */
export interface PanelCard {
  id: string
  title: string
  domain: string
  roles?: string
  description?: string
  members: string
  updated: string
}

export const MY_PANELS: PanelCard[] = [
  { id: 'leading-neurologists', title: 'Leading Neurologists - USA', domain: 'Healthcare', roles: 'Neurologist, Neurosurgeon, Psychiatrist', members: '30 members', updated: 'Updated on Aug 15, 2026' },
  { id: 'pioneering-oncologists', title: 'Pioneering Oncologists - USA', domain: 'Healthcare', roles: 'Oncologist, Radiologist, Medical Researcher', members: '28 members', updated: 'Updated on Sep 10, 2026' },
  { id: 'top-pediatric', title: 'Top Pediatric Specialists - USA', domain: 'Healthcare', roles: 'Pediatrician, Child Psychologist, Nurse Practitioner', members: '35 members', updated: 'Updated on Oct 5, 2026' },
  { id: 'innovative-surgeons', title: 'Innovative Surgeons - USA', domain: 'Healthcare', roles: 'Surgeon, Orthopedic Surgeon, Surgical Assistant', members: '20 members', updated: 'Updated on Nov 20, 2026' },
  { id: 'expert-dermatologists', title: 'Expert Dermatologists - USA', domain: 'Healthcare', roles: 'Dermatologist, Cosmetic Surgeon, Clinical Researcher', members: '22 members', updated: 'Updated on Dec 15, 2026' },
]

const ONCOLOGY = 'Verified oncology medical professionals treating various cancer lineages and clinical trials patients.'

export const FEATURED_PANELS: PanelCard[] = [
  { id: 'expert-oncologists', title: 'Expert Oncologists Nationwide', domain: 'Healthcare', description: ONCOLOGY, members: '124 members', updated: 'Last Updated Jul 1, 2026' },
  { id: 'leading-neurologists-f', title: 'Leading Neurologists - USA', domain: 'Healthcare', description: ONCOLOGY, members: '30 members', updated: 'Updated Aug 15, 2026' },
  { id: 'healthcare-it', title: 'Senior Healthcare IT Managers', domain: 'IT', description: 'CTOs, CIOs, and IT Admins at major hospital networks handling system-wide security, HIPAA c…', members: '124 members', updated: 'Last Updated Jul 1, 2026' },
  { id: 'orthopedic', title: 'Orthopedic Surgeons & Therapists', domain: 'Healthcare', description: 'Surgical practitioners and sports science physiotherapists handling bone health and physic…', members: '124 members', updated: 'Last Updated Jul 1, 2026' },
  { id: 'top-oncologists', title: 'Top Oncologists Nationwide', domain: 'Healthcare', description: ONCOLOGY, members: '124 members', updated: 'Last Updated Jul 1, 2026' },
  { id: 'top-oncologists-2', title: 'Top Oncologists Nationwide', domain: 'Healthcare', description: ONCOLOGY, members: '124 members', updated: 'Last Updated Jul 1, 2026' },
]

export const FEATURED_CATEGORIES = ['All', 'Healthcare', 'Technology', 'Finance', 'Education', 'Legal', 'Marketing']

/** The panel a micro-panel opens on (1645:161734 mine, 1645:161904 featured). */
export const PANEL_DETAIL = {
  mine: {
    title: 'Top Cardiology Experts - USA',
    crumb: 'My panels',
    domain: 'Healthcare',
    roles: 'Physician,  General Doctor, Therapist',
    stats: [
      { label: 'Panel Members', value: '75', accent: true },
      { label: 'Est. Incentive Range', value: '$200-$400' },
      { label: 'Time To Fill', value: '5-7 Days' },
      { label: 'Avg. Score', value: '92%' },
    ],
  },
  featured: {
    title: 'Expert Oncologists Nationwide',
    crumb: 'Featured panels',
    domain: 'Healthcare',
    roles: 'Physician,  General Doctor, Therapist',
    description: ONCOLOGY,
    stats: [
      { label: 'Members', value: '75' },
      { label: 'Incentive Range', value: '$100-$200' },
      { label: 'Time To Fill', value: '5-7 Days' },
      { label: 'Avg. Score', value: '92%' },
      { label: 'Last Updated', value: 'Aug 10, 2026' },
    ],
  },
}

/** Panel Details, the third tab, and the forecast the Create form previews. */
export const CRITERIA = [
  { label: 'Industry:', value: 'Healthcare, Pharma' },
  { label: 'Age:', value: '18-22, 31-40' },
  { label: '', value: 'NYC, USA', pin: true },
  { label: 'Roles:', value: 'Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner' },
  { label: 'Education:', value: 'High school graduate' },
  { label: 'Language:', value: 'English' },
  { label: 'Profile Score:', value: '90% & above' },
]

export const FORECAST = {
  title: 'Micropanel Forecast',
  estimated: 'Estimated',
  count: '~75',
  countSuffix: 'eligible respondents match criteria',
  tiers: [
    { tier: 'silver' as Tier, pct: '50%', members: '~30 members' },
    { tier: 'gold' as Tier, pct: '40%', members: '~23 members' },
    { tier: 'platinum' as Tier, pct: '10%', members: '~7 members' },
  ],
  rows: [
    { label: 'Average Score', value: '86%' },
    { label: 'Recommended Incentive', value: '$100-200' },
    { label: 'Estimated Time To Fill', value: '5-7 days' },
    { label: 'Expected Rebook Rate', value: '74%' },
  ],
}

/** The same forecast as the Create form draws it: bars, not cards. */
export const FORECAST_BARS = [
  { label: 'Silver', pct: 50, text: '50%', bar: 'bg-[#9fb8c8]' },
  { label: 'Gold', pct: 42, text: '42%', bar: 'bg-cta-primary' },
  { label: 'Platinum', pct: 8, text: '8%', bar: 'bg-[#9139f6]' },
]

/** Invite To Study (1645:163182) lists the client's active studies. */
export const INVITE_STUDIES = [
  { id: 'goals', title: 'About goal-tracking methods', type: 'video_call' as const, domain: 'Healthcare', image: '/img/goals.jpg' },
  { id: 'sleep', title: 'Share about your sleep cycle', type: 'in_person' as const, domain: 'Healthcare', image: '/img/sleep.jpg' },
  { id: 'payments', title: 'How do you make your digital payments mostly?', type: 'diary' as const, domain: 'Healthcare', image: '/img/card.jpg' },
]

/** Save to micro-panel (1651:177206) lists the panels to save into. */
export const SAVE_TARGETS = [
  { id: 'leading', title: 'Leading Neurologists - USA', domain: 'Healthcare', roles: 'Physician, General Doctor, Nutritionist, Therapist, Medical Pra…' },
  { id: 'derm-1', title: 'Expert Dermatologists', domain: 'Healthcare', roles: 'Dermatologist, Cosmetic Surgeon, Clinical Researcher' },
  { id: 'derm-2', title: 'Expert Dermatologists', domain: 'Healthcare', roles: 'Dermatologist, Cosmetic Surgeon, Clinical Researcher' },
]

/** Reviews (1645:163046): what the client wrote, and what the respondent wrote back. */
export const REVIEWS = [
  {
    study: 'Digital patient consulting experience analysis', stars: 4, rating: '4.0', at: 'April 10, 2026',
    body: 'It was great working with Luke. He was clear about the requirements, responsive throughout the project, and very easy to communicate with. The collaboration went smoothly, and I’d be happy to work with him again on future projects. Thanks!',
    client: 'Google Labs', clientStars: 5, clientRating: '5.0', clientBody: 'The collaboration went smoothly, and I’d…',
  },
  {
    study: 'Mobile app design review', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'Working with Sarah was a pleasure. She brought innovative ideas to the table and was open to feedback, making the design process very collaborative. I’m looking forward to our next project together!',
    client: 'Tech Innovations', clientStars: 4.5, clientRating: '4.5', clientBody: 'Her creativity and willingness to ada…',
  },
  {
    study: 'E-commerce website optimization', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'John was fantastic to work with. He understood the project goals from the start and delivered exceptional results that exceeded our expectations. I’d definitely recommend him to others!',
    client: 'Retail Solutions', clientStars: 5, clientRating: '5.0', clientBody: 'His expertise in user experience mad…',
  },
  {
    study: 'Social media marketing campaign', stars: 5, rating: '5', at: 'April 10, 2026',
    body: 'Collaborating with Mia was delightful. She was proactive in her approach, and her insights into market trends helped shape a successful campaign. I look forward to partnering with her again!',
  },
]
