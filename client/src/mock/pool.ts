import { useMemo } from 'react'
import { rankedPool } from '@shared/derive'
import type { PoolPerson } from '@shared/derive'
import { usePlatform } from '../platform'

export type { PoolPerson } from '@shared/derive'

/**
 * The participant pool is the platform's, not this app's: everyone verified
 * and active, ranked by score and tier (workflow 24), with the score and
 * tier computed by the policy. This file now holds only the Pool screens'
 * own copy.
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
