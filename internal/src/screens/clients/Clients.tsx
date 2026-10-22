import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import { SearchInput, Select } from '../../components/ui/Input'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { useClients } from '../../mock/clients'
import type { Client } from '../../mock/clients'
import { inPeriod, PERIODS } from '../../mock/clients'

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
  const { rows: everyone, count } = useClients(off ? 'deactivated' : 'active')
  /** Industry and Location offer what the clients listed are in, and the period the drawn periods (22 Oct 2026); each narrows the table. */
  const [industry, setIndustry] = useState('All')
  const [place, setPlace] = useState('All')
  const [period, setPeriod] = useState('All')
  const options = (k: 'industry' | 'location') => [...new Set(everyone.map((r) => r[k]).filter(Boolean))].sort()
  const rows = everyone.filter((r) => (industry === 'All' || r.industry === industry) && (place === 'All' || r.location === place) && inPeriod(r.at, period))
  return (
    <AppShell crumbs={[{ label: 'Clients' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={off ? 'deactivated' : 'active'} onChange={(k) => setParams(k === 'active' ? {} : { tab: k }, { replace: true })}
        items={[{ key: 'active', label: 'Active' }, { key: 'deactivated', label: 'Deactivated' }]} />
      <p className="pt-4 text-body-regular leading-[22px] text-text-body">{count}</p>
      <div className="flex items-center gap-2 pt-4">
        <SearchInput size="sm" className="mr-2" placeholder="Search clients by name, role, industry, or company..." />
        <Select size="sm" className="w-[190px] shrink-0" value={`Industry: ${industry}`} options={['Industry: All', ...options('industry').map((o) => `Industry: ${o}`)]} onChange={(v) => setIndustry(v.replace('Industry: ', ''))} />
        <Select size="sm" className="w-[190px] shrink-0" value={`Location: ${place}`} options={['Location: All', ...options('location').map((o) => `Location: ${o}`)]} onChange={(v) => setPlace(v.replace('Location: ', ''))} />
        <Select size="sm" className="w-[190px] shrink-0" value={`${last}: ${period}`} options={[`${last}: All`, ...PERIODS.map((p) => `${last}: ${p}`)]} onChange={(v) => setPeriod(v.replace(`${last}: `, ''))} />
      </div>
      <Table empty={everyone.length ? 'No client matches these filters.' : off ? 'Clients whose accounts are deactivated will appear here.' : 'Clients will appear here once they sign up.'} className="mt-3" rowHeight={52} rows={rows} rowKey={(r) => r.id} onRowClick={(r) => navigate(`/clients/${r.id}`)} columns={columns(last)} />
      <div className="pt-3"><Pagination page={1} pages={10} /></div>
    </AppShell>
  )
}
