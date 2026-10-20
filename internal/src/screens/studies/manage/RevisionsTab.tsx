import { clientById } from '@shared/derive'
import { monthDayYearTime } from '@shared/format'
import { studyHistory } from '@shared/revisions'
import type { FieldChange, Study } from '@shared/types'
import type { ReactNode } from 'react'
import { VerifiedIcon } from '../../../components/ui/icons'
import { usePlatform } from '../../../platform'

const quoted = (xs: string[]) => xs.map((x) => `“${x}”`).join(', ')
const Line = ({ label, children }: { label: string; children: string }) => (
  <p className="text-text-regular leading-6 text-text-subtitle"><span className="font-medium">{label}:</span> {children}</p>
)

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
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bgAlt-2"><VerifiedIcon className="h-4 w-4 text-state-success" /></span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-text-regular leading-5 text-text-title">{title}</p>
        {children && <div className="flex flex-col gap-1">{children}</div>}
        <p className="text-text-regular leading-5 text-text-body">{monthDayYearTime(at)}</p>
      </div>
    </div>
  )
}

/**
 * Revisions History in the console (2323:212472): the same record the client
 * reads (shared/revisions.ts), from the team's side. The client's rounds are
 * "Changes made by Client", the team's "Changes made by You", then the team's
 * change requests and the first submission.
 */
export default function RevisionsTab({ study }: { study: Study }) {
  const first = clientById(usePlatform(), study.clientId)?.name.split(' ')[0] ?? ''
  const history = studyHistory(study)
  if (!history.length) return <p className="text-text-regular text-text-subtitle">Nothing yet. Revisions appear here once the study is submitted.</p>
  return (
    <div className="flex flex-col gap-2">
      {history.map((h, i) => h.kind === 'edit'
        ? <Card key={i} at={h.at} title={<>Changes made by {h.by === 'client' ? <span className="font-semibold">Client</span> : 'You'}</>}>{h.changes.map((c, j) => <Change key={j} c={c} />)}</Card>
        : h.kind === 'requested'
          ? <Card key={i} at={h.at} title="Requested changes by Team."><div className="whitespace-pre-wrap rounded-md bg-bg-1 px-3 py-3 text-text-regular leading-5 text-text-subtitle">{first ? `Hey ${first},\n` : ''}{h.text}</div></Card>
          : <Card key={i} at={h.at} title="Created and submitted the study for review." />)}
    </div>
  )
}
