import type { Study } from '../mock/types'
import type { SortKey, StudyFilters } from '../mock/storeTypes'
import { DEFAULT_FILTERS } from '../mock/storeTypes'

/** Sort labels from PRD 6.2. */
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'price_high', label: 'Price: High' },
  { key: 'price_low', label: 'Price: Low' },
  { key: 'new_first', label: 'New First' },
  { key: 'old_first', label: 'Old First' },
]

/** Search matches title and description, per the button table. */
function matchesQuery(study: Study, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    study.title.toLowerCase().includes(q) ||
    study.description.toLowerCase().includes(q)
  )
}

export function matchesFilters(study: Study, filters: StudyFilters): boolean {
  if (!matchesQuery(study, filters.query)) return false
  if (filters.types.length > 0 && !filters.types.includes(study.type)) return false
  if (study.reward < filters.price[0] || study.reward > filters.price[1]) return false
  if (study.durationMins < filters.time[0] || study.durationMins > filters.time[1]) return false
  if (filters.industries.length > 0 && !filters.industries.includes(study.industry)) return false
  if (filters.occupations.length > 0) {
    const target = study.targetProfession.toLowerCase()
    if (!filters.occupations.some((o) => target.includes(o.toLowerCase()))) return false
  }
  return true
}

/** `new_first` uses endsAt as the proxy for recency; the seed has no postedAt. */
export function sortStudies(studies: Study[], sort: SortKey): Study[] {
  const out = [...studies]
  switch (sort) {
    case 'price_high': return out.sort((a, b) => b.reward - a.reward)
    case 'price_low': return out.sort((a, b) => a.reward - b.reward)
    case 'new_first': return out.sort((a, b) => +new Date(b.endsAt) - +new Date(a.endsAt))
    case 'old_first': return out.sort((a, b) => +new Date(a.endsAt) - +new Date(b.endsAt))
    default: return out.sort((a, b) => b.matchScore - a.matchScore)
  }
}

export function applyFilters(studies: Study[], filters: StudyFilters): Study[] {
  return sortStudies(studies.filter((s) => matchesFilters(s, filters)), filters.sort)
}

/** How many filters inside the sheet are active, for the badge on the icon. */
export function activeFilterCount(filters: StudyFilters): number {
  const d = DEFAULT_FILTERS
  return (
    filters.types.length +
    filters.industries.length +
    filters.occupations.length +
    (filters.price[0] !== d.price[0] || filters.price[1] !== d.price[1] ? 1 : 0) +
    (filters.time[0] !== d.time[0] || filters.time[1] !== d.time[1] ? 1 : 0)
  )
}
