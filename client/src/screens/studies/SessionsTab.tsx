import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { upcomingSessions } from '../../lib/insight'
import type { SessionRow as Row } from '../../lib/insight'
import Button from '../../components/ui/Button'
import { STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyType } from '../../lib/studyTypes'
import { useStudies } from '../../platform'

/**
 * Scheduled Sessions (exported 13 Oct 2026, no node id on record): every
 * session still to come across the client's live studies, grouped by day. A
 * one-to-one study lists each booked respondent; a group study lists each of
 * its sessions with the seats taken.
 *
 * Everything on a row is read off the bookings the platform already holds.
 * `Join and Start` opens the session's own page with the session started,
 * which is what Start Interview does there; `View Details` opens the same
 * page as it stands. Neither is a decision the designs spell out.
 */
export default function SessionsTab({ search, types }: { search: string; types: StudyType[] }) {
  const navigate = useNavigate()
  const { studies, state } = useStudies()

  const days = useMemo(() => {
    const rows = upcomingSessions(state, studies)
    const q = search.trim().toLowerCase()
    const shown = rows
      .filter((r) => (types.length === 0 || types.includes(r.type)) && (!q || r.study.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)))
      .sort((a, b) => a.at.getTime() - b.at.getTime())
    const byDay = new Map<string, Row[]>()
    for (const r of shown) byDay.set(r.at.toDateString(), [...(byDay.get(r.at.toDateString()) ?? []), r])
    return [...byDay.values()]
  }, [studies, state, search, types])

  if (days.length === 0) {
    return (
      <div className="rounded-lg bg-bg-1 px-6 py-16 text-center">
        <p className="text-body-medium text-text-title">No sessions are scheduled.</p>
        <p className="pt-1 text-text-regular text-text-subtitle">A session appears here as soon as a respondent books one.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {days.map((rows) => {
        const d = rows[0]!.at
        return (
          <section key={d.toDateString()} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 pb-1 text-title-s leading-[26px] text-text-title">
              <span>{d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, <span className="text-text-body">{d.toLocaleDateString('en-US', { weekday: 'long' })}</span></span>
              <span className="flex h-6 min-w-7 items-center justify-center rounded-full bg-bgAlt-1 px-2 text-text-regular text-text-subtitle">{rows.length}</span>
            </h2>
            {rows.map((r) => (
              <article key={r.key} className="flex h-[89px] items-center rounded-lg bg-bg-1 pr-4">
                <div className="flex w-[122px] shrink-0 flex-col items-center gap-1">
                  <span className="text-title-s leading-6 text-brand-primary">{r.at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-text-regular text-text-subtitle">{r.at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {r.at.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
                <span className="h-[57px] w-px shrink-0 bg-stroke-input" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pl-4">
                  <span className="truncate text-body-regular text-text-title">{r.title}</span>
                  <span className="flex items-center gap-1.5 text-text-regular text-text-subtitle">
                    <span className="text-brand-secondary">{STUDY_TYPE[r.type].icon}</span>
                    {STUDY_TYPE[r.type].label}
                    <span className="px-1.5 text-text-body">&bull;</span>
                    <span className="truncate">{r.study}</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Button variant="tertiary" size="row" className="px-4" onClick={() => navigate(r.details)}>View Details</Button>
                  <Button size="row" className="px-4" onClick={() => navigate(r.start)}>Join and Start</Button>
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </div>
  )
}
