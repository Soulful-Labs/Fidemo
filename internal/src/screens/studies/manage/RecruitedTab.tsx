import { useNavigate } from 'react-router-dom'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { CalendarIcon, ChevronRight, ClockIcon, PinIcon, VideoUserIcon } from '../../../components/ui/icons'
import Table, { Pagination } from '../../../components/ui/Table'
import type { Column } from '../../../components/ui/Table'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import type { ManagedStudy } from '../../../mock/manage'
import { SCHEDULED, SESSIONS, applications } from '../../../mock/recruiting'
import type { Application, ApplicationStatus, Booking, Session } from '../../../mock/recruiting'

const STATUS: Record<ApplicationStatus, string> = {
  Applied: 'bg-yellow-50 text-brand-primary',
  Qualified: 'bg-state-successBg text-state-success',
  Disqualified: 'bg-orange-100 text-state-destructive',
}

const Score = ({ row }: { row: { score: string; tier: Application['tier'] } }) => (
  <span className="flex items-center gap-2">{row.score}<TierTag tier={row.tier} /></span>
)

const APPLICATION_COLUMNS: Column<Application>[] = [
  { key: 'name', header: 'Name', width: 180, render: (r) => r.name },
  { key: 'role', header: 'Role', width: 360, render: (r) => <span className="text-text-medium">{r.role}</span> },
  { key: 'status', header: 'Status', width: 160, sortable: true, render: (r) => <span className={cn('inline-flex h-7 items-center rounded-full px-3.5 text-text-regular', STATUS[r.status])}>{r.status}</span> },
  { key: 'score', header: 'Score', width: '1fr', sortable: true, render: (r) => <Score row={r} /> },
]

const bookingColumns = (join: boolean): Column<Booking>[] => [
  { key: 'name', header: 'Name', width: 160, render: (r) => r.name },
  { key: 'role', header: 'Role', width: 320, render: (r) => r.role },
  { key: 'score', header: 'Score', width: 190, sortable: true, render: (r) => <Score row={r} /> },
  { key: 'time', header: 'Session Time', width: '1fr', render: (r) => <span className="flex gap-2">{r.day}<span aria-hidden="true">•</span>{r.time}</span> },
  { key: 'join', header: '', width: 140, className: 'pr-2', render: (r) => join && r.id === 'b1'
    ? <span className="flex justify-end"><Button size="md" className="px-3" leftIcon={<VideoUserIcon className="h-5 w-5" />} onClick={(e) => e.stopPropagation()}>Join Now</Button></span> : null },
]

/** A group session: its date and time (and address, in person), seats taken, who is in it, and View Participants. */
function SessionCard({ session, onOpen }: { session: Session; onOpen: () => void }) {
  const Line = ({ Icon, bold, children }: { Icon: typeof CalendarIcon; bold?: boolean; children: string }) => (
    <p className={cn('flex items-center gap-2 leading-[22px] text-text-title', bold ? 'text-body-medium' : 'text-body-regular')}><Icon className="h-5 w-5 text-brand-primary" />{children}</p>
  )
  return (
    <article className="rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-3">
          <h3 className="text-title-s leading-[25px] text-text-title">{session.name}</h3>
          <Line Icon={CalendarIcon} bold={!!session.address}>{session.day}</Line>
          <Line Icon={ClockIcon}>{session.time}</Line>
          {session.address && <Line Icon={PinIcon}>{session.address}</Line>}
        </div>
        <Button variant="secondary" size="md" className="px-3" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onOpen}>View Participants</Button>
      </div>
      <div className="flex items-center justify-between pt-3">
        <span className="flex h-8 items-center rounded-full bg-bgAlt-2 px-3.5 text-text-regular text-text-title">{session.seats}</span>
        <span className="flex pl-2">
          {session.people.split('').map((p, i) => <span key={i} className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border-1 border-bg-1 bg-stroke-3 text-label text-text-subtitle">{p}</span>)}
        </span>
      </div>
    </article>
  )
}

/**
 * Recruited (1952:77242, 1952:77337, 1952:81128 and siblings): everyone who
 * applied, and for session studies who is booked.
 * - Survey and diary: the applications table alone.
 * - Video 1:1 and in-person: "Scheduled" (booked sessions, 60px rows) and
 *   "Applications".
 * - Group video and in-person group: "Sessions" (a card each) and
 *   "Applications".
 * Applications: Name, Role, Status (Applied, Qualified, Disqualified), Score
 * with the tier; ten rows and the pagination. Rows open the respondent.
 */
export default function RecruitedTab({ study, view, onView }: { study: ManagedStudy; view: 'first' | 'applications'; onView: (v: 'first' | 'applications') => void }) {
  const navigate = useNavigate()
  const group = study.type === 'video-group' || study.type === 'in-person-group'
  const booked = study.type === 'video' || study.type === 'in-person'
  const segmented = group || booked
  const showApplications = !segmented || view === 'applications'
  const open = (id: string) => navigate(`/studies/${study.id}/respondents/${id}`)
  const filters = <div className="flex gap-3"><Select size="sm" className="w-40" value="Status: All" options={['Status: All']} /><Select size="sm" className="w-40" value="Tier: All" options={['Tier: All']} /></div>
  return (
    <div>
      <h2 className="text-title-s leading-[25px] text-text-title">Recruited Respondents</h2>
      <p className="pt-1 text-text-regular leading-5 text-text-subtitle">List of respondents applied on this study and track their statuses</p>
      <div className="flex min-h-12 items-center justify-between pb-3 pt-6 box-content">
        {segmented && (
          <SegmentedTabs className="w-60" segmentClassName="flex-1 min-w-0" value={view} onChange={(k) => onView(k as 'first' | 'applications')}
            items={[{ key: 'first', label: group ? 'Sessions' : 'Scheduled' }, { key: 'applications', label: 'Applications' }]} />
        )}
        {(showApplications || booked) && filters}
      </div>
      {showApplications ? (
        <>
          <Table rowHeight={52} rows={applications(study.type === 'video-group' ? 'Sarah K' : 'John M')} rowKey={(r) => r.id} columns={APPLICATION_COLUMNS} onRowClick={(r) => open(r.id)} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </>
      ) : booked ? (
        <>
          <Table rowHeight={60} rows={SCHEDULED} rowKey={(r) => r.id} columns={bookingColumns(study.type === 'video')} onRowClick={(r) => open(r.id)} />
          <div className="pt-3"><Pagination page={1} pages={10} /></div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {SESSIONS[study.type === 'in-person-group' ? 'inPerson' : 'video'].map((s) => <SessionCard key={s.id} session={s} onOpen={() => navigate(`/studies/${study.id}/sessions/${s.id}`)} />)}
        </div>
      )}
    </div>
  )
}
