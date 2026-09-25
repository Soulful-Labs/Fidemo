import type { PoolFilters, PoolPerson } from '../mock/pool'

/**
 * What the Pool's filter rail actually does.
 *
 * The rail was drawn but inert: the tier boxes, the score and gender radios,
 * the four pickers and every chip's cross were plain spans. This is the rule
 * behind each of them, so the grid and the result count follow what is set.
 */

const SCORE_FLOOR: Record<string, number> = {
  '90 & above': 90,
  '80 & above': 80,
  '70 & above': 70,
}

const ACTIVE_WEEKS: Record<string, number> = {
  '2 weeks': 2,
  '1 month': 4,
  '3 months': 13,
}

export function matchesPool(p: PoolPerson, f: PoolFilters): boolean {
  if (f.tiers.length > 0 && !f.tiers.map((t) => t.toLowerCase()).includes(p.tier)) return false
  const floor = SCORE_FLOOR[f.score]
  if (floor !== undefined && p.score < floor) return false
  if (f.gender !== 'All' && p.gender !== f.gender) return false
  const weeks = ACTIVE_WEEKS[f.lastActive]
  if (weeks !== undefined && p.lastActiveWeeks > weeks) return false
  /** A role chip matches anywhere in the role line, which carries a speciality. */
  if (f.roles.length > 0 && !f.roles.some((r) => p.role.toLowerCase().includes(r.toLowerCase()))) return false
  if (f.domain.length > 0 && !f.domain.includes(p.domain)) return false
  if (f.location.length > 0 && !f.location.includes(p.location)) return false
  if (f.language.length > 0 && !f.language.includes(p.language)) return false
  if (f.query.trim()) {
    const q = f.query.trim().toLowerCase()
    const haystack = `${p.name} ${p.role} ${p.domain} ${p.location} ${p.language} ${p.tier} ${p.score}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

/** One chip per filter that is on, each knowing how to take itself off. */
export interface PoolChip {
  key: string
  label: string
  remove: (f: PoolFilters) => PoolFilters
}

export function poolChips(f: PoolFilters): PoolChip[] {
  const out: PoolChip[] = []
  const list = (k: 'roles' | 'domain' | 'location' | 'language') => {
    f[k].forEach((v) => out.push({
      key: `${k}:${v}`,
      label: v,
      remove: (cur) => ({ ...cur, [k]: cur[k].filter((x) => x !== v) }),
    }))
  }
  list('roles')
  list('domain')
  list('location')
  list('language')
  f.tiers.forEach((t) => out.push({
    key: `tier:${t}`,
    label: t,
    remove: (cur) => ({ ...cur, tiers: cur.tiers.filter((x) => x !== t) }),
  }))
  if (f.score !== 'Any') {
    out.push({ key: 'score', label: f.score, remove: (cur) => ({ ...cur, score: 'Any' }) })
  }
  if (f.gender !== 'All') {
    out.push({ key: 'gender', label: f.gender, remove: (cur) => ({ ...cur, gender: 'All' }) })
  }
  if (f.lastActive !== 'Any') {
    out.push({ key: 'lastActive', label: `Active in ${f.lastActive}`, remove: (cur) => ({ ...cur, lastActive: 'Any' }) })
  }
  if (f.query.trim()) {
    out.push({ key: 'query', label: `"${f.query.trim()}"`, remove: (cur) => ({ ...cur, query: '' }) })
  }
  return out
}
