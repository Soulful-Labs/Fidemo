import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import { SearchInput, Select } from '../../components/ui/Input'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { CLIENTS } from '../../mock/clients'
import type { Client } from '../../mock/clients'

const columns = (last: string): Column<Client>[] => [
  { key: 'name', header: 'Name', width: 200, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> },
  { key: 'role', header: 'Role', width: 260, render: (r) => r.role }, { key: 'company', header: 'Company', width: 240, render: (r) => r.company },
  { key: 'industry', header: 'Industry', width: 160, render: (r) => r.industry }, { key: 'location', header: 'Location', width: 160, render: (r) => r.location },
  { key: 'date', header: last, width: '1fr', sortable: true, render: (r) => r.date },
]

/**
 * Clients (Active 2049:118695, Deactivated 2049:118738): two segments, the
 * count, a 38px toolbar (search, "Industry: All", "Location: All", and "Last
 * Active: All" or "Deactivated: All"), ten 52px rows and pagination. The two
 * frames differ 0.92%: the segment, the count, the third dropdown and the
 * last heading. No row or bulk action is drawn; a row opens the client.
 */
export default function Clients() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const off = params.get('tab') === 'deactivated'
  const last = off ? 'Deactivated' : 'Last Active'
  return (
    <AppShell crumbs={[{ label: 'Clients' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={off ? 'deactivated' : 'active'} onChange={(k) => setParams(k === 'active' ? {} : { tab: k }, { replace: true })}
        items={[{ key: 'active', label: 'Active' }, { key: 'deactivated', label: 'Deactivated' }]} />
      <p className="pt-4 text-body-regular leading-[22px] text-text-body">{off ? '10,572 deactivated clients' : '126,872 active clients'}</p>
      <div className="flex items-center gap-2 pt-4">
        <SearchInput size="sm" className="mr-2" placeholder="Search clients by name, role, industry, or company..." />
        <Select size="sm" className="w-[150px] shrink-0" value="Industry: All" options={['Industry: All']} />
        <Select size="sm" className="w-[150px] shrink-0" value="Location: All" options={['Location: All']} />
        <Select size="sm" className="w-[150px] shrink-0" value={`${last}: All`} options={[`${last}: All`]} />
      </div>
      <Table className="mt-3" rowHeight={52} rows={CLIENTS} rowKey={(r) => r.id} onRowClick={(r) => navigate(`/clients/${r.id}${off ? '?state=deactivated' : ''}`)} columns={columns(last)} />
      <div className="pt-3"><Pagination page={1} pages={10} /></div>
    </AppShell>
  )
}
