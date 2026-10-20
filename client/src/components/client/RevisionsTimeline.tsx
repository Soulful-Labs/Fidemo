import { monthDayYearTime } from '@shared/format'
import { studyHistory } from '@shared/revisions'
import type { FieldChange, Study } from '@shared/types'
import type { ReactNode } from 'react'

/**
 * Revisions History (2322:211934): one card per round, newest first. Each card
 * is a green tick, who made the round, a grey box per field it changed, and
 * when. Everything is read from the study (shared/revisions.ts).
 */

const quoted = (xs: string[]) => xs.map((x) => `“${x}”`).join(', ')

function Line({ label, children }: { label: string; children: string }) {
  return <p className="text-text-regular leading-6 text-text-subtitle"><span className="font-medium">{label}:</span> {children}</p>
}

function Change({ c }: { c: FieldChange }) {
  return (
    <div className="flex flex-col rounded-md bg-bg-1 px-3 py-1.5">
      <p className="flex gap-2 text-text-regular leading-6 text-text-body">
        {['Edit', ...c.path].map((p, i) => <span key={i} className="flex gap-2">{i > 0 && <span>&gt;</span>}{p}</span>)}
      </p>
      {c.from !== undefined && <Line label="From">{`“${c.from}”`}</Line>}
      {c.to !== undefined && <Line label="To">{`“${c.to}”`}</Line>}
      {c.added && <Line label="Added">{quoted(c.added)}</Line>}
      {c.removed && <Line label="Removed">{quoted(c.removed)}</Line>}
    </div>
  )
}

function Card({ title, at, children }: { title: ReactNode; at: string; children?: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border-1 border-stroke-1 px-3 pb-[11px] pt-[11px]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bgAlt-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-ok" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-text-regular leading-5 text-text-title">{title}</p>
        {children && <div className="flex flex-col gap-1">{children}</div>}
        <p className="text-text-regular leading-5 text-text-body">{monthDayYearTime(at)}</p>
      </div>
    </div>
  )
}

/**
 * `viewer` is whose app this is: the client reads its own rounds as "You",
 * the console reads them as "Client". `firstName` greets the client in a
 * change request, as the team wrote it.
 */
export default function RevisionsTimeline({ study, viewer, firstName }: { study: Study; viewer: 'client' | 'team'; firstName: string }) {
  const history = studyHistory(study)
  if (history.length === 0) return <p className="text-text-regular text-text-subtitle">Nothing yet. Revisions appear here once the study is submitted.</p>
  return (
    <div className="flex flex-col gap-2">
      {history.map((h, i) => {
        if (h.kind === 'edit') {
          const who = h.by === 'team' ? 'Admin Team' : viewer === 'client' ? 'You' : 'Client'
          return (
            <Card key={i} at={h.at} title={<>Changes made by {h.by === 'team' ? <span className="font-semibold">{who}</span> : who}</>}>
              {h.changes.map((c, j) => <Change key={j} c={c} />)}
            </Card>
          )
        }
        if (h.kind === 'requested') {
          return (
            <Card key={i} at={h.at} title="Requested changes by Team.">
              <div className="whitespace-pre-wrap rounded-md bg-bg-1 px-3 py-3 text-text-regular leading-5 text-text-subtitle">
                {firstName ? `Hey ${firstName},\n` : ''}{h.text}
              </div>
            </Card>
          )
        }
        return <Card key={i} at={h.at} title="Created and submitted the study for review." />
      })}
    </div>
  )
}
