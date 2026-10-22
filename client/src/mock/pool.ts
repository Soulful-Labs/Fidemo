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

