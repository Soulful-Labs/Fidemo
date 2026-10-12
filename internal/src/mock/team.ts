import { useMemo } from 'react'
import { teamById } from '@shared/derive'
import { monthDayYearTime } from '@shared/format'
import type { Module } from '@shared/types'
import { usePlatform } from '../platform'

/**
 * Sub-Admin (section 2060:197774) and My Account (2065:203731), read from the
 * shared platform: the team, and the activity log every decision taken in the
 * console writes to (shared/store.ts).
 */
export interface SubAdmin { id: string; photo: string; name: string; role: string; email: string; access: string[]; active: boolean }

export const MODULES: Module[] = ['Dashboard', 'Studies', 'Participants', 'Clients', 'Support', 'Finance', 'Pricing & Rewards', 'Sub-Admin']
/** The three filters over Activities, drawn loose (2062:201706, 2062:201813, 2062:201633). */
export const FILTER_MODULES = ['All Modules', ...MODULES]
export const FILTER_PERIOD = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months']
const PERIOD_DAYS: Record<string, number> = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90, 'Last 6 months': 182 }

export function useTeam(filters?: { module: string; person: string; period: string; query: string }) {
  const state = usePlatform()
  return useMemo(() => {
    const SUB_ADMINS: SubAdmin[] = state.team.filter((t) => !t.master).map((t) => ({ id: t.id, photo: t.photo ?? '', name: t.name, role: t.role, email: t.email, access: t.access, active: t.active }))
    const since = filters && PERIOD_DAYS[filters.period] ? Date.now() - PERIOD_DAYS[filters.period]! * 86_400_000 : 0
    const q = filters?.query.trim().toLowerCase() ?? ''
    const ACTIVITIES = state.activity
      .filter((a) => !filters || filters.module === 'All Modules' || a.path.startsWith(filters.module))
      .filter((a) => !filters || filters.person === 'Everyone' || teamById(state, a.by)?.name === filters.person)
      .filter((a) => new Date(a.at).getTime() >= since)
      .filter((a) => !q || `${a.what} ${a.path}`.toLowerCase().includes(q))
      .map((a) => {
        const m = teamById(state, a.by)
        return { id: a.id, what: a.what, path: a.path, when: monthDayYearTime(a.at), who: m?.name ?? '', role: m?.role ?? '', photo: m?.photo ?? '' }
      })
    const FILTER_PEOPLE = ['Everyone', ...state.team.map((t) => t.name)]
    return { SUB_ADMINS, ACTIVITIES, FILTER_PEOPLE }
  }, [state, filters?.module, filters?.person, filters?.period, filters?.query])
}

export function useMember(id?: string) {
  const state = usePlatform()
  return useMemo(() => {
    const m = teamById(state, id)
    return m && { id: m.id, name: m.name, email: m.email, role: m.role, photo: m.photo ?? '', access: m.access, active: m.active, master: Boolean(m.master) }
  }, [state, id])
}
