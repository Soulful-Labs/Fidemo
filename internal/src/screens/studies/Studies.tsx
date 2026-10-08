import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { ChevronRight } from '../../components/ui/icons'
import Table from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { STUDY_COUNTS, STUDY_ROWS } from '../../mock/studies'
import type { StudyRow } from '../../mock/studies'

type Tab = 'review' | 'ongoing' | 'completed'

const TABS = [
  { key: 'review', label: 'To Review' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
]

/** The sort each frame shows selected. The menus' other options are not drawn. */
const SORT: Record<Tab, string> = { review: 'Sort: Recent First', ongoing: 'Sort: More applications', completed: 'Sort: Recent First' }

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
  const [filter, setFilter] = useState('All Studies')

  const open = (r: StudyRow) => navigate(tab === 'review' ? `/studies/review/${r.id}` : `/studies/${r.id}`)

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
          <Select className="w-40" value={filter} onChange={setFilter} options={['All Studies']} />
          <Select className="w-60" value={SORT[tab]} options={[SORT[tab]]} />
        </div>
      </div>

      <p className="pt-4 text-body-regular text-text-body">{STUDY_COUNTS[tab]}</p>
      <Table className="mt-2" rows={STUDY_ROWS} rowKey={(r) => r.id} highlight="st-pay" onRowClick={open} columns={columns[tab]} />
    </AppShell>
  )
}
