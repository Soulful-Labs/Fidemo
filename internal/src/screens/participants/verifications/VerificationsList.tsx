import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import { SearchInput, Select } from '../../../components/ui/Input'
import Table, { Pagination } from '../../../components/ui/Table'
import type { Column } from '../../../components/ui/Table'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { cn } from '../../../lib/cn'
import { ONBOARDING, ONBOARDING_HISTORY, REPORTED, REPORTED_HISTORY } from '../../../mock/verifications'
import type { Pending } from '../../../mock/verifications'

type Row = Pending & { result?: string }
const RESULT: Record<string, string> = {
  Verified: 'bg-state-successBg text-state-success', Rejected: 'bg-orange-100 text-state-destructive',
  Restricted: 'bg-orange-100 text-state-destructive', Deactivated: 'bg-red-50 text-state-danger',
}
const who: Column<Row> = { key: 'name', header: 'Name', width: 200, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> }
const col = (key: keyof Row, header: string, width: number | string, opts: Partial<Column<Row>> = {}): Column<Row> => ({ key, header, width, render: (r) => <span className="block truncate">{r[key]}</span>, ...opts })
const by = col('by', 'Reported By', 150, { render: (r) => <span className={r.by === 'System (Algo)' ? 'text-text-subtitle' : undefined}>{r.by}</span> })
const result = (reportedGreen: boolean): Column<Row> => ({ key: 'result', header: 'Result', width: 120, render: (r) => (
  <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-text-regular', reportedGreen && r.result === 'Rejected' ? RESULT.Verified : RESULT[r.result ?? ''])}>{r.result}</span>) })

const Toolbar = ({ filter }: { filter: string }) => (
  <div className="flex gap-4 pb-[15px]"><SearchInput size="sm" placeholder="Search participants by name or role..." /><Select size="sm" className="w-[200px] shrink-0" value={filter} options={[filter]} /></div>
)

/**
 * Verifications (Onboarding 2022:168589, Reported 2036:142437): two segments,
 * each a pending queue and a History table under it, both with a search, one
 * dropdown and pagination to 10.
 * - Onboarding ("87 pending verifications"): identity and profession checks
 *   together in one queue, told apart by the "Flagged For" column.
 * - Reported ("65 pending applications"): reports against participants, with
 *   who reported them. This is the queue the Dashboard's "Flagged/reported
 *   accounts" group leads to.
 * A pending row opens its detail; a History row opens the same detail decided.
 */
export default function VerificationsList() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const reported = params.get('tab') === 'reported'
  const open = (r: Row) => navigate(`/participants/verifications/${r.id}`)
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Verifications' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={reported ? 'reported' : 'onboarding'}
        onChange={(k) => setParams(k === 'reported' ? { tab: k } : {}, { replace: true })} items={[{ key: 'onboarding', label: 'Onboarding' }, { key: 'reported', label: 'Reported' }]} />
      <h2 className="pb-2 pt-4 text-title-s leading-[25px] text-text-title">{reported ? '65 pending applications' : '87 pending verifications'}</h2>
      <Toolbar filter={reported ? 'Reported By All' : 'Flagged for All'} />
      {reported
        ? <Table rowHeight={52} rows={REPORTED as Row[]} rowKey={(r) => r.id} onRowClick={open} columns={[{ ...who, width: 180 }, col('role', 'Role', 206), col('date', 'Date', 124, { sortable: true }), by, col('flag', 'Flagged For', 170), col('reason', 'Reason', '1fr')]} />
        : <Table rowHeight={52} rows={ONBOARDING as Row[]} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 240), col('date', 'Date', 130, { sortable: true }), col('flag', 'Flagged For', 170), col('reason', 'Reason', '1fr')]} />}
      <div className="pt-3"><Pagination page={1} pages={10} /></div>

      <h2 className="mt-8 border-t-1 border-stroke-1 pb-3 pt-8 text-title-s leading-[25px] text-text-title">History</h2>
      <Toolbar filter="Flagged for All" />
      {reported
        ? <Table rowHeight={52} rows={REPORTED_HISTORY as Row[]} rowKey={(r) => r.id} onRowClick={open} columns={[who, by.width ? { ...by, width: 220 } : by, col('date', 'Completed', 130, { sortable: true }), col('flag', 'Flagged For', 170), col('reason', 'Verification Remarks', '1fr'), result(true)]} />
        : <Table rowHeight={52} rows={ONBOARDING_HISTORY as Row[]} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 220), col('date', 'Completed', 130, { sortable: true }), col('flag', 'Flagged For', 170), col('reason', 'Verification Remarks', '1fr'), result(false)]} />}
      <div className="pt-3"><Pagination page={1} pages={10} /></div>
    </AppShell>
  )
}
