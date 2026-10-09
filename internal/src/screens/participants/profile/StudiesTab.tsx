import StudyTypeTag from '../../../components/app/StudyTypeTag'
import { SearchInput, Select } from '../../../components/ui/Input'
import Table from '../../../components/ui/Table'
import type { Column } from '../../../components/ui/Table'
import { UnderlineTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import { APPLIED, HISTORY, SAVED, SCHEDULED_ONE, SIX } from '../../../mock/profile'
import type { StudyLine, StudyStatus } from '../../../mock/profile'

export type StudySub = 'invites' | 'scheduled' | 'applied' | 'history' | 'saved'
export const STUDY_SUBS = [{ key: 'invites', label: 'Invites To Schedule' }, { key: 'scheduled', label: 'Scheduled' }, { key: 'applied', label: 'Applied' }, { key: 'history', label: 'History' }, { key: 'saved', label: 'Saved' }]

const TONE: Record<StudyStatus, string> = {
  'In Review': 'bg-yellow-50 text-brand-primary', 'In Process': 'bg-yellow-50 text-brand-primary', Paid: 'bg-state-successBg text-state-success',
  Rejected: 'bg-orange-100 text-state-destructive', 'No Show': 'bg-red-50 text-state-danger',
}
const Status = ({ s }: { s?: StudyStatus }) => s ? <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-text-regular', TONE[s])}>{s}</span> : null

const name: Column<StudyLine> = { key: 'name', header: 'Study Name', width: '1fr', render: (r) => <span className="-ml-1 flex items-center gap-3"><img src={r.thumb} alt="" className="h-10 w-10 rounded-xs object-cover" /><span className="truncate">{r.name}</span></span> }
const type = (w: number): Column<StudyLine> => ({ key: 'type', header: 'Type', width: w, render: (r) => <StudyTypeTag type={r.type} className="h-7 px-2.5" /> })
const date = (header: string, w = 140): Column<StudyLine> => ({ key: 'date', header, width: w, sortable: true, render: (r) => r.date })
const price: Column<StudyLine> = { key: 'price', header: 'Price', width: 100, sortable: true, render: (r) => r.price }
const match: Column<StudyLine> = { key: 'match', header: 'Matching', width: 100, sortable: true, render: (r) => r.match }
const status: Column<StudyLine> = { key: 'status', header: 'Status', width: 120, render: (r) => <Status s={r.status} /> }

const COLS = {
  invites: [name, type(180), date('Created On'), price, match],
  scheduled: [name, type(180), date('Scheduled', 190), price],
  drafts: [name, type(180), date('Applied On'), price, match],
  applied: [name, type(180), date('Applied'), price, match, status],
  history: [name, type(180), date('Completed', 160), price, status],
}
const T = ({ rows, cols }: { rows: StudyLine[]; cols: Column<StudyLine>[] }) => <Table rows={rows} rowKey={(r) => r.id} columns={cols} highlight={rows.length > 2 ? 'st-pay' : undefined} />
const Heading = ({ children }: { children: string }) => <h3 className="pb-2 pt-4 text-body-medium leading-[22px] text-text-title">{children}</h3>

/**
 * Studies (2017:150996 and siblings): five underline sub-tabs over a search
 * and an "All" filter, then the participant's studies in that state. Saved
 * (2017:155992) has no filter and stacks five tables under their own
 * headings. Read only: no row action is drawn, and rows are not links.
 */
export default function StudiesTab({ sub, onSub }: { sub: StudySub; onSub: (s: StudySub) => void }) {
  return (
    <div>
      <UnderlineTabs items={STUDY_SUBS} value={sub} onChange={(k) => onSub(k as StudySub)} />
      <div className="flex gap-3 pb-3 pt-4">
        <SearchInput size="sm" placeholder="Search studies..." />
        {sub !== 'saved' && <Select size="sm" className="w-[134px] shrink-0" value="All" options={['All']} />}
      </div>
      {sub === 'invites' && <T rows={SIX} cols={COLS.invites} />}
      {sub === 'scheduled' && <T rows={SCHEDULED_ONE} cols={COLS.scheduled} />}
      {sub === 'applied' && <T rows={APPLIED} cols={COLS.applied} />}
      {sub === 'history' && <T rows={HISTORY} cols={COLS.history} />}
      {sub === 'saved' && (
        <div className="-mt-4">
          <Heading>Invites To Schedule</Heading><T rows={SIX} cols={COLS.invites} />
          <Heading>Scheduled</Heading><T rows={SAVED.scheduled} cols={COLS.scheduled} />
          <Heading>Drafts</Heading><T rows={SAVED.drafts} cols={COLS.drafts} />
          <Heading>Applied</Heading><T rows={SAVED.applied} cols={COLS.applied} />
          <Heading>History</Heading><T rows={SAVED.history} cols={COLS.history} />
        </div>
      )}
    </div>
  )
}
