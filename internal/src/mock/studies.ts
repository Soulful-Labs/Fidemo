import { useMemo } from 'react'
import { billing, consoleStudies, counts, lastActivity } from '@shared/derive'
import { dayMonthYear, money, plural } from '@shared/format'
import type { StudyType } from '../components/app/StudyTypeTag'
import type { Study } from '@shared/types'
import { consoleType, studyPictures, usePlatform } from '../platform'

/**
 * The Studies list (1978:97400, 1874:72973, 1906:19984), read from the
 * shared platform: To Review is every study waiting on the team, Ongoing
 * every live or paused one, Completed every finished one. Every figure is
 * shared/derive.ts.
 */
export interface StudyRow {
  id: string
  name: string
  thumb: string
  type: StudyType
  /** To Review */
  participants: string
  submittedOn: string
  totalCost: string
  /** Ongoing */
  completedOngoing: string
  lastActivity: string
  applications: string
  /** Completed */
  completedDone: string
  date: string
  /** What the filter and the sort read (22 Oct 2026): the study's own type, size, cost and the tab's date. */
  kind: Study['type']
  people: number
  cost: number
  at: string
}

export function useStudyRows(tab: 'review' | 'ongoing' | 'completed') {
  const state = usePlatform()
  return useMemo(() => {
    const rows: StudyRow[] = consoleStudies(state, tab).map((s) => {
      const c = counts(s)
      return {
        id: s.id, name: s.title, thumb: studyPictures(s.id, s.image).small, type: consoleType(s.type),
        participants: String(s.required), submittedOn: dayMonthYear(s.submittedAt), totalCost: money(billing(s).totalCost),
        completedOngoing: `${c.completed}/${s.required}`, lastActivity: dayMonthYear(lastActivity(s)), applications: String(c.everApplied),
        completedDone: `${c.completed}/${s.required}`, date: dayMonthYear(s.completedAt ?? s.endsAt),
        kind: s.type, people: s.required, cost: billing(s).totalCost,
        at: (tab === 'review' ? s.submittedAt : tab === 'ongoing' ? lastActivity(s) : s.completedAt ?? s.endsAt) ?? '',
      }
    })
    const count = { review: `${plural(rows.length, 'study', 'studies')} to be reviewed`, ongoing: plural(rows.length, 'Study', 'Studies'), completed: plural(rows.length, 'Study', 'Studies') }[tab]
    return { rows, count }
  }, [state, tab])
}
