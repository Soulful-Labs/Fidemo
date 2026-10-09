import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import TierTag from '../../components/app/TierTag'
import Button from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { ListIcon } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { COUNTS, FILTERS, PARTICIPANTS } from '../../mock/participants'
import type { Participant } from '../../mock/participants'
import { AdvancedFilters } from './panels'

const columns = (last: string): Column<Participant>[] => [
  { key: 'name', header: 'Name', width: 200, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> },
  { key: 'role', header: 'Role', width: 250, render: (r) => r.role },
  { key: 'industry', header: 'Industry', width: 160, render: (r) => r.industry },
  { key: 'score', header: 'Score & Tier', width: 150, sortable: true, render: (r) => <span className="flex items-center gap-2">{r.score}<TierTag tier={r.tier} /></span> },
  { key: 'gender', header: 'Gender', width: 100, sortable: true, render: (r) => r.gender },
  { key: 'location', header: 'Location', width: 160, render: (r) => r.location },
  { key: 'date', header: last, width: '1fr', sortable: true, render: (r) => r.date },
]

/**
 * All Participants (Active 1992:101341, Deactivated 2003:134529): one screen,
 * two segments. The segments (280), the count line, then a 38px toolbar: the
 * search (370), "Advanced Filters" and four dropdowns; the table of ten 52px
 * rows; the pagination. Between the two only the active segment, the count
 * and the last heading ("Last Active" / "Deactivated") change.
 *
 * A row opens the participant's profile. No row or bulk action is drawn.
 */
export default function Participants() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'deactivated' ? 'deactivated' : 'active'
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ lastActive: FILTERS.lastActive[0]!, profession: FILTERS.profession[0]!, gender: FILTERS.gender[0]!, tier: FILTERS.tier[0]! })
  const [advanced, setAdvanced] = useState(false)
  const pick = (k: keyof typeof filters) => (v: string) => setFilters((f) => ({ ...f, [k]: v }))

  return (
    <AppShell crumbs={[{ label: 'All Participants' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={tab} onChange={(k) => setParams(k === 'active' ? {} : { tab: k }, { replace: true })}
        items={[{ key: 'active', label: 'Active' }, { key: 'deactivated', label: 'Deactivated' }]} />
      <p className="pt-4 text-body-regular leading-[22px] text-text-body">{COUNTS[tab]}</p>
      <div className="flex items-center gap-2 pt-4">
        <SearchInput size="sm" className="mr-2 w-[370px]" placeholder="Search participants by name or role..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="tertiary" size="md" data-adv="" className="w-[150px] rounded-sm px-0" leftIcon={<ListIcon className="h-4 w-4" />} onClick={() => setAdvanced(true)}>Advanced Filters</Button>
        <Select size="sm" className="w-[150px]" value={filters.lastActive} onChange={pick('lastActive')} options={FILTERS.lastActive} />
        <Select size="sm" className="w-[164px]" value={filters.profession} onChange={pick('profession')} options={FILTERS.profession} />
        <Select size="sm" className="w-[140px]" value={filters.gender} onChange={pick('gender')} options={FILTERS.gender} />
        <Select size="sm" className="w-[140px]" value={filters.tier} onChange={pick('tier')} options={FILTERS.tier} />
      </div>
      <Table className="mt-3" rowHeight={52} rows={PARTICIPANTS} rowKey={(r) => r.id} onRowClick={(r) => navigate(`/participants/${r.id}${tab === 'deactivated' ? '?state=deactivated' : ''}`)}
        columns={columns(tab === 'active' ? 'Last Active' : 'Deactivated')} />
      <div className="pt-3"><Pagination page={1} pages={10} /></div>
      <AdvancedFilters open={advanced} onClose={() => setAdvanced(false)} />
    </AppShell>
  )
}
