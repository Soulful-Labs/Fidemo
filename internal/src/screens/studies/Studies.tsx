import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { SearchInput } from '../../components/ui/Input'
import { DropdownChecks, DropdownSelect } from '../../components/ui/Dropdown'
import { ChevronRight } from '../../components/ui/icons'
import Table from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { useStudyRows } from '../../mock/studies'
import type { StudyRow } from '../../mock/studies'

type Tab = 'review' | 'ongoing' | 'completed'

const TABS = [
  { key: 'review', label: 'To Review' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
]

/** The type filter (2367:68669): its rows and the study types they stand for. */
const TYPES: [string, StudyRow['kind']][] = [
  ['Survey', 'survey'], ['Video Call', 'video_call'], ['Group Video Call', 'group_video_call'],
  ['In-Person', 'in_person'], ['Group In-Person', 'in_person_group'], ['Diary Study', 'diary'],
]
/** The sort menu (2368:68734 to 2368:68743), the same on all three tabs. */
const SORTS: Record<string, (a: StudyRow, b: StudyRow) => number> = {
  Recent: (a, b) => b.at.localeCompare(a.at),
  Earliest: (a, b) => a.at.localeCompare(b.at),
  'Highest Participants': (a, b) => b.people - a.people,
  'Lowest Participants': (a, b) => a.people - b.people,
  'Highest Cost': (a, b) => b.cost - a.cost,
  'Lowest Cost': (a, b) => a.cost - b.cost,
}

const name = (r: StudyRow) => (
  <span className="-ml-1 flex items-center gap-3">
    <img src={r.thumb} alt="" className="h-10 w-10 shrink-0 rounded-xs object-cover" />
    <span className="truncate text-text-medium">{r.name}</span>
  </span>
)
const nameCol = (width: number): Column<StudyRow> => ({ key: 'name', header: 'Study Name', width, render: name })
const typeCol = (width: number): Column<StudyRow> => ({ key: 'type', header: 'Type', width, render: (r) => <StudyTypeTag type={r.type} /> })
const text = (key: string, header: string, width: number | string, get: (r: StudyRow) => ReactNode, muted = false): Column<StudyRow> =>
  ({ key, header, width, sortable: true, render: muted ? (r) => <span className="text-text-subtitle">{get(r)}</span> : get })

/**
 * Studies (1978:97400 To Review, 1874:72973 Ongoing, 1906:19984 Completed):
 * one screen, three tab states. The toolbar is the same on all three: the
 * segmented tabs (380), the search (334), "All Studies" (160) and the sort
 * (240), 12 apart and right-aligned. Under it the tab's count line, then the
 * table; the second row is drawn in its hover state on every tab.
 *
 * Columns per tab, at the frames' widths:
 * - To Review: Study Name 445, Type 200, Participants, Submitted on and Total
 *   Cost 140 each (sortable), and a Review button that opens the review.
 * - Ongoing: Study Name 555, Type 180, Completed 125, Last Activity 140 and
 *   Applications 160 (all three sortable); the applications chip opens the study.
 * - Completed: Study Name 695, Type 200, Completed 140, Date 125 (sortable).
 */
export default function Studies() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'review') as Tab
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<string[]>(['All'])
  const [sort, setSort] = useState('Recent')
  const { rows, count } = useStudyRows(tab)
  /** Search narrows the list by study name, the filter by type; the sort orders what is left. */
  const kinds = types.includes('All') ? undefined : new Set(TYPES.filter(([label]) => types.includes(label)).map(([, k]) => k))
  const shown = rows
    .filter((r) => !query.trim() || r.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((r) => !kinds || kinds.has(r.kind))
    .sort(SORTS[sort])

  const open = (r: StudyRow) => navigate(tab === 'review' ? `/studies/review/${r.id}` : tab === 'completed' ? `/studies/${r.id}?state=completed` : `/studies/${r.id}`)

  const columns: Record<Tab, Column<StudyRow>[]> = {
    review: [
      nameCol(445), typeCol(200),
      text('participants', 'Participants', 140, (r) => r.participants),
      text('submitted', 'Submitted on', 140, (r) => r.submittedOn),
      text('cost', 'Total Cost', 140, (r) => r.totalCost),
      { key: 'action', header: '', width: '1fr', render: (r) => (
        <span className="flex justify-end"><Button size="md" className="h-[38px] px-3" onClick={(e) => { e.stopPropagation(); open(r) }}>Review</Button></span>
      ), className: 'pr-3' },
    ],
    ongoing: [
      nameCol(555), typeCol(180),
      text('completed', 'Completed', 125, (r) => r.completedOngoing),
      text('activity', 'Last Activity', 140, (r) => r.lastActivity, true),
      text('applications', 'Applications', '1fr', (r) => (
        <span className="inline-flex h-8 items-center gap-1 rounded-full bg-yellow-50 px-3 text-body-regular text-brand-primary">
          {r.applications}<ChevronRight className="h-4 w-4" />
        </span>
      )),
    ],
    completed: [
      nameCol(695), typeCol(200),
      text('completed', 'Completed', 140, (r) => r.completedDone),
      text('date', 'Date', '1fr', (r) => r.date, true),
    ],
  }

  return (
    <AppShell crumbs={[{ label: 'Studies' }]}>
      <div className="flex items-center gap-6">
        <SegmentedTabs className="w-[380px]" segmentClassName="flex-1" value={tab} onChange={(k) => setParams(k === 'review' ? {} : { tab: k }, { replace: true })} items={TABS} />
        <div className="ml-auto flex items-center gap-3">
          <SearchInput className="w-[334px]" placeholder="Search studies" value={query} onChange={(e) => setQuery(e.target.value)} />
          <DropdownChecks className="w-40" label="Study types" all="All" options={TYPES.map(([label]) => label)} picked={types} onChange={setTypes}
            text={types.includes('All') ? 'All Studies' : types.length === 1 ? types[0] : `${types.length} study types`} />
          <DropdownSelect className="w-60" label="Sort" prefix="Sort: " value={sort} options={Object.keys(SORTS)} onChange={setSort} />
        </div>
      </div>

      <p className="pt-4 text-body-regular text-text-body">{count}</p>
      <Table empty={{ review: 'Studies that clients submit for review will appear here.', ongoing: 'Studies you approve will appear here while they run.', completed: 'Studies will appear here once they are completed.' }[tab]} className="mt-2" rows={shown} rowKey={(r) => r.id} highlight="st-pay" onRowClick={open} columns={columns[tab]} />
    </AppShell>
  )
}
