import { reportedStudies } from '@shared/derive'
import type { ReportedStudyRow } from '@shared/derive'
import { dayMonthYear } from '@shared/format'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import { SearchInput } from '../../../components/ui/Input'
import Table, { Pagination } from '../../../components/ui/Table'
import type { Column } from '../../../components/ui/Table'
import { SegmentedTabs } from '../../../components/ui/Tabs'
import { consoleType, studyPictures, usePlatform } from '../../../platform'

const PAGE = 10

const columns: Column<ReportedStudyRow>[] = [
  { key: 'name', header: 'Study Name', width: 325, render: (r) => (
    <span className="-ml-1 flex items-center gap-3">
      <img src={studyPictures(r.study.id, r.study.image).small} alt="" className="h-10 w-10 shrink-0 rounded-xs object-cover" />
      <span className="truncate text-text-medium">{r.study.title}</span>
    </span>
  ) },
  { key: 'type', header: 'Type', width: 180, render: (r) => <StudyTypeTag type={consoleType(r.study.type)} /> },
  { key: 'client', header: 'Client', width: 165, sortable: true, render: (r) => <span className="block truncate">{r.client?.name ?? ''}</span> },
  { key: 'last', header: 'Last Reported on', width: 165, sortable: true, render: (r) => dayMonthYear(r.lastAt) },
  { key: 'created', header: 'Study Created', width: 165, sortable: true, render: (r) => dayMonthYear(r.study.createdAt) },
  { key: 'users', header: 'Users Reported', width: '1fr', sortable: true, render: (r) => (
    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-yellow-40 px-2.5 text-text-regular text-brand-primary">{r.users}</span>
  ) },
]

/**
 * Reported Studies (2314:146860 Pending, 2317:158478 History): studies that
 * respondents reported, from the shared study reports. Pending lists the
 * studies with open reports; History the ones the team has resolved. A row
 * opens the study's reports. The search narrows by study or client name.
 */
export default function ReportedStudies() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const history = params.get('tab') === 'history'
  const state = usePlatform()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const q = search.trim().toLowerCase()
  const rows = reportedStudies(state, history ? 'history' : 'pending')
    .filter((r) => !q || r.study.title.toLowerCase().includes(q) || (r.client?.name ?? '').toLowerCase().includes(q))
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const shown = rows.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE)

  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Reported Studies' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={history ? 'history' : 'pending'}
        onChange={(k) => { setPage(1); setParams(k === 'history' ? { tab: k } : {}, { replace: true }) }}
        items={[{ key: 'pending', label: 'Pending' }, { key: 'history', label: 'History' }]} />
      {!history && <h2 className="pb-2 pt-4 text-title-s leading-[25px] text-text-title">{rows.length} pending report application{rows.length === 1 ? '' : 's'}</h2>}
      <div className={history ? 'pb-[15px] pt-4' : 'pb-[15px]'}>
        <SearchInput size="sm" placeholder="Search participants by name or role..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>
      <Table empty={history ? 'Studies whose reports you have resolved will appear here.' : 'Studies that participants report will appear here.'}
        rows={shown} rowKey={(r) => r.study.id} columns={columns}
        onRowClick={(r) => navigate(`/studies/reported/${r.study.id}${history ? '?tab=history' : ''}`)} />
      {rows.length > PAGE && <div className="pt-3"><Pagination page={Math.min(page, pages)} pages={pages} onChange={setPage} /></div>}
    </AppShell>
  )
}
