import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyCard from '../../components/client/StudyCard'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import ViewToggle from '../../components/client/ViewToggle'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import { MoreVertical } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import type { StudyType } from '../../lib/studyTypes'
import type { Study } from '../../mock/db'
import { useStudies } from '../../mock/store'
import { counts } from '../../lib/derive'
import { studyTab } from '../../lib/lifecycle'
import { CompletedMenu, DeleteStudyModal, DraftMenu, OngoingMenu, PauseStudyModal, StudyTypeMenu } from './StudyMenus'

export type StudiesTab = 'ongoing' | 'drafts' | 'completed'

const TABS = [
  { key: 'ongoing', label: 'Ongoing', to: '/studies' },
  { key: 'drafts', label: 'Drafts', to: '/studies/drafts' },
  { key: 'completed', label: 'Completed', to: '/studies/completed' },
]

/** Which columns each tab draws, and in which order. */
const COLUMNS: Record<StudiesTab, { key: string; header: string; sortable?: boolean; width?: string }[]> = {
  ongoing: [
    { key: 'name', header: 'Study Name', width: '36%' },
    { key: 'type', header: 'Type', width: '15.5%' },
    { key: 'required', header: 'Required', sortable: true, width: '10.9%' },
    { key: 'qualified', header: 'Qualified', sortable: true, width: '10.9%' },
    { key: 'completed', header: 'Completed', sortable: true, width: '10.9%' },
    { key: 'created', header: 'Created', sortable: true, width: '11.6%' },
    { key: 'menu', header: '', width: '4.2%' },
  ],
  drafts: [
    { key: 'name', header: 'Study Name', width: '51.9%' },
    { key: 'type', header: 'Type', width: '31.1%' },
    { key: 'created', header: 'Created', sortable: true, width: '12.6%' },
    { key: 'menu', header: '', width: '4.4%' },
  ],
  completed: [
    { key: 'name', header: 'Study Name', width: '36.2%' },
    { key: 'type', header: 'Type', width: '20.7%' },
    { key: 'required', header: 'Required', sortable: true, width: '12.2%' },
    { key: 'completed', header: 'Completed', sortable: true, width: '12.2%' },
    { key: 'created', header: 'Created', sortable: true, width: '14.3%' },
    { key: 'menu', header: '', width: '4.4%' },
  ],
}

/** "30 Jul, 2026" sorts by its real date, not its text. */
const asDate = (created: string) => new Date(created.replace(',', '')).getTime()

/**
 * Studies, all three tabs. Ongoing is drawn twice: as a table (1518:90600)
 * and as cards (1518:90966); the square button right of the Study Type filter
 * switches between them. Drafts (1518:90624) and Completed (1518:90760) are
 * table only, with fewer columns, and Completed is the one frame that carries
 * a "My Studies" heading above the tabs.
 */
export default function StudiesList({ tab }: { tab: StudiesTab }) {
  const navigate = useNavigate()
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [types, setTypes] = useState<StudyType[]>([])
  const [typeMenu, setTypeMenu] = useState(false)
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const [pausing, setPausing] = useState<Study | null>(null)
  const [deleting, setDeleting] = useState<Study | null>(null)
  const { studies } = useStudies()

  /** Which tab a study is under is its state's business, never a separate list. */
  const rows = useMemo(() => {
    const list = studies
      .filter((s) => studyTab(s.state) === tab)
      .filter((s) => types.length === 0 || types.includes(s.type))
    if (!sort) return list
    const figure = (s: Study, key: string) => {
      const c = counts(s)
      if (key === 'required') return s.required
      if (key === 'qualified') return c.everQualified
      if (key === 'completed') return c.completed
      return 0
    }
    return [...list].sort((a, b) => {
      const va = sort.key === 'created' ? asDate(a.created) : figure(a, sort.key)
      const vb = sort.key === 'created' ? asDate(b.created) : figure(b, sort.key)
      return (va - vb) * sort.dir
    })
  }, [studies, tab, types, sort])

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }))

  // The cards frame (1518:90966) lists the same six studies in its own order.
  const cards = useMemo(() => {
    const order = ['st-social', 'st-goal', 'st-fitness', 'st-sleep', 'st-pay', 'st-travel']
    return [...rows].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  }, [rows])

  const open = (s: Study) => navigate(tab === 'ongoing' ? `/studies/${s.id}` : `/studies/${s.id}/manage`)

  return (
    <AppShell crumbs={[{ label: 'Studies' }]}>
      <div className="min-h-[881px] rounded-lg bg-bg-0 p-4">
        {tab === 'completed' && <h1 className="pb-2 text-title-s text-text-title">My Studies</h1>}

        <div className="flex items-center justify-between gap-4 pb-6">
          <Tabs variant="segmented" value={tab} items={TABS} />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Select value="Study Type" className="w-[200px]" onClick={() => setTypeMenu((m) => !m)} />
              <StudyTypeMenu open={typeMenu} onClose={() => setTypeMenu(false)} value={types} onChange={setTypes} />
            </div>
            {tab === 'ongoing' && <ViewToggle view={view} onChange={setView} />}
          </div>
        </div>

        {tab === 'ongoing' && view === 'grid' ? (
          <div className="grid grid-cols-3 gap-3">
            {cards.map((s) => (
              <StudyCard key={s.id} onOpen={() => open(s)} onMenu={() => setRowMenu(s.id)}
                menu={<RowMenu tab={tab} row={s} open={rowMenu === s.id} onClose={() => setRowMenu(null)} onPause={() => { setRowMenu(null); setPausing(s) }} onDelete={() => { setRowMenu(null); setDeleting(s) }} />}
                study={s} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border-1 border-stroke-input">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b-1 border-stroke-input bg-bg-1">
                  {COLUMNS[tab].map((c) => (
                    <th key={c.key} style={{ width: c.width }} className="h-row px-[22px] text-text-regular font-normal text-text-subtitle">
                      {c.sortable ? (
                        <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1.5 hover:text-text-title">
                          {c.header}
                          <SortMark active={sort?.key === c.key} dir={sort?.dir} />
                        </button>
                      ) : c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b-1 border-stroke-input last:border-b-0 hover:bg-bg-1">
                    {COLUMNS[tab].map((c) => (
                      <td key={c.key} className="h-row px-[22px] align-middle text-body-regular text-text-title">
                        {c.key === 'name' && (
                          <span className="flex items-center gap-2">
                            <button type="button" onClick={() => open(s)} className="text-left hover:text-brand-primary">{s.name}</button>
                            {/* No frame draws this pill: the Drafts table has no status
                                column, and a study waiting on the team is not a draft. */}
                            {s.state === 'in_review' && (
                              <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-yellow-30 px-[14px] text-text-regular text-brand-primary">
                                In Review
                              </span>
                            )}
                          </span>
                        )}
                        {c.key === 'type' && <StudyTypeTag type={s.type} />}
                        {c.key === 'created' && <span className="whitespace-nowrap text-text-subtitle">{s.created}</span>}
                        {c.key === 'required' && String(s.required)}
                        {c.key === 'qualified' && String(counts(s).everQualified)}
                        {c.key === 'completed' && String(counts(s).completed)}
                        {c.key === 'menu' && (
                          <span className="relative flex justify-end">
                            <button type="button" aria-label="Study options" onClick={() => setRowMenu(rowMenu === s.id ? null : s.id)}
                              className="text-text-subtitle hover:text-text-title">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            <RowMenu tab={tab} row={s} open={rowMenu === s.id} onClose={() => setRowMenu(null)}
                              onPause={() => { setRowMenu(null); setPausing(s) }} onDelete={() => { setRowMenu(null); setDeleting(s) }} />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PauseStudyModal open={pausing !== null} onClose={() => setPausing(null)}
        onConfirm={() => { const s = pausing; setPausing(null); if (s) navigate(`/studies/${s.id}/paused`) }} />
      <DeleteStudyModal open={deleting !== null} onClose={() => setDeleting(null)} name={deleting?.name ?? ''}
        onConfirm={() => setDeleting(null)} />
    </AppShell>
  )
}

/** The ⇅ mark on a sortable header. */
function SortMark({ active, dir }: { active?: boolean; dir?: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M8 4v16m0 0-3-3m3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        className={cn(active && dir === 1 ? 'text-brand-primary' : undefined)} opacity={active && dir === -1 ? 0.4 : 1} />
      <path d="M16 20V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        className={cn(active && dir === -1 ? 'text-brand-primary' : undefined)} opacity={active && dir === 1 ? 0.4 : 1} />
    </svg>
  )
}

/** The right menu for a row or card, which differs per tab. */
function RowMenu({
  tab, row, open, onClose, onPause, onDelete,
}: { tab: StudiesTab; row: Study; open: boolean; onClose: () => void; onPause: () => void; onDelete: () => void }) {
  const copy = () => { void navigator.clipboard?.writeText(`https://focusinsite.com/study/${row.id}`).catch(() => undefined); onClose() }
  if (tab === 'drafts') return <DraftMenu open={open} onClose={onClose} onDelete={onDelete} />
  if (tab === 'completed') return <CompletedMenu open={open} onClose={onClose} onCopy={copy} />
  return <OngoingMenu open={open} onClose={onClose} onPause={onPause} onCopy={copy} />
}
