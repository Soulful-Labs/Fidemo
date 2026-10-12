import { useMemo } from 'react'
import { cohort, rankedPool } from '@shared/derive'
import type { PoolPerson } from '@shared/derive'
import { usePlatform } from '../platform'

export type { PoolPerson } from '@shared/derive'

/**
 * The participant pool is the platform's, not this app's: everyone verified
 * and active, ranked by score and tier (workflow 24), with the score and
 * tier computed by the policy. This file now holds only the Pool screens'
 * own copy and the micro-panel cards.
 */
export function usePool(): { people: PoolPerson[]; total: number; options: { roles: string[]; domain: string[]; location: string[]; language: string[] } } {
  const state = usePlatform()
  return useMemo(() => {
    const people = rankedPool(state)
    const uniq = (f: (p: PoolPerson) => string) => [...new Set(people.map(f).filter(Boolean))].sort()
    return {
      people, total: people.length,
      /** What each picker offers, taken from the pool itself so nothing is dead. */
      options: { roles: uniq((p) => p.role.split(',')[0]!.trim()), domain: uniq((p) => p.domain), location: uniq((p) => p.location), language: uniq((p) => p.language) },
    }
  }, [state])
}

export const POOL_SEARCH = 'Describe your required audience to search and filter or search by name, role, score, tiers, industry, etc.'
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
  countSuffix: 'eligible respondents match criteria',
  /**
   * The count, the tier split and the average score are computed from the
   * pool (useForecast). These three are a forecast nothing on the platform
   * can produce yet, so they stay as the frame writes them.
   */
  rows: [
    { label: 'Recommended Incentive', value: '$100-200' },
    { label: 'Estimated Time To Fill', value: '5-7 days' },
    { label: 'Expected Rebook Rate', value: '74%' },
  ],
}

/** How the Create form draws the tier split: bars, not cards. */
export const FORECAST_BARS = { silver: { label: 'Silver', bar: 'bg-[#9fb8c8]' }, gold: { label: 'Gold', bar: 'bg-cta-primary' }, platinum: { label: 'Platinum', bar: 'bg-[#9139f6]' } }

/** The forecast for a cohort: everyone in the pool, or the people given. */
export function useForecast(ids?: string[]) {
  const { people } = usePool()
  return useMemo(() => cohort(ids ? people.filter((p) => ids.includes(p.id)) : people), [people, ids])
}

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
