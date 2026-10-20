import { useDraft } from '../../mock/createStore'
import { useNewStudy } from '../create/useNewStudy'
import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
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
import type { ClientStudy as Study } from '../../platform'
import { useStudies } from '../../platform'
import { counts, progressPct } from '@shared/derive'
import SessionsTab from './SessionsTab'
import { upcomingSessions } from '../../lib/insight'
import { Calendar, Search } from '../../components/ui/icons'
import { studyTab } from '@shared/lifecycle'
import { DoneModal } from '../../components/client/ReportParticipant'
import { CompletedMenu, DeleteStudyModal, DraftMenu, OngoingMenu, PauseStudyModal, RepublishModal, StopCompleteModal, StudyTypeMenu } from './StudyMenus'
import { useToast } from '../../components/ui/Toast'
import { copyText } from '../../lib/copy'

export type StudiesTab = 'ongoing' | 'drafts' | 'completed' | 'sessions'

/**
 * My Studies reads Ongoing, Drafts, Completed (client designs, 15 Oct 2026).
 * Sessions is no longer a tab: it is its own item under Studies in the
 * sidebar, at /studies/sessions, with its own header.
 */
const TABS = [
  { key: 'ongoing', label: 'Ongoing', to: '/studies' },
  { key: 'drafts', label: 'Drafts', to: '/studies/drafts' },
  { key: 'completed', label: 'Completed', to: '/studies/completed' },
]

/** Which columns each tab draws, and in which order. */
const COLUMNS: Record<Exclude<StudiesTab, 'sessions'>, { key: string; header: string; sortable?: boolean; width?: string }[]> = {
  // Measured off the 13 Oct 2026 export: the table is 1150 wide and the columns start at 265, 602, 777, 887, 997, 1122 and 1262.
  ongoing: [
    { key: 'name', header: 'Study Name', width: '27.91%' },
    { key: 'type', header: 'Type', width: '15.22%' },
    { key: 'required', header: 'Required', sortable: true, width: '9.57%' },
    { key: 'qualified', header: 'Qualified', sortable: true, width: '9.57%' },
    { key: 'completed', header: 'Completed', sortable: true, width: '10.87%' },
    { key: 'progress', header: 'Progress', sortable: true, width: '12.17%' },
    { key: 'created', header: 'Created', sortable: true, width: '9.57%' },
    { key: 'menu', header: '', width: '5.12%' },
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
  const [stopping, setStopping] = useState<Study | null>(null)
  const [resuming, setResuming] = useState<Study | null>(null)
  const [republished, setRepublished] = useState(false)
  const [deleting, setDeleting] = useState<Study | null>(null)
  const [search, setSearch] = useState('')
  const { studies, moveStudy } = useStudies()
  /** "4 upcoming video and in-person sessions": the sessions still to come across live studies. */
  const { state: world } = useStudies()
  const upcoming = upcomingSessions(world, studies).length
  const upcomingLine = `${upcoming} upcoming video and in-person session${upcoming === 1 ? '' : 's'}`
  const toast = useToast()

  /** Which tab a study is under is its state's business, never a separate list. */
  const rows = useMemo(() => {
    const list = studies
      .filter((s) => studyTab(s.state) === (tab === 'sessions' ? 'ongoing' : tab))
      .filter((s) => types.length === 0 || types.includes(s.type))
    if (!sort) return list
    const figure = (s: Study, key: string) => {
      const c = counts(s)
      if (key === 'required') return s.required
      if (key === 'qualified') return c.everQualified
      if (key === 'completed') return c.completed
      if (key === 'progress') return progressPct(s)
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

  const newStudy = useNewStudy()
  const { open: openDraft } = useDraft()
  /** A draft reopens in the Create flow with everything it was saved with; anything else opens as a study. */
  const open = (s: Study) => {
    if (s.state === 'draft') { openDraft(s); navigate('/studies/create/about'); return }
    navigate(tab === 'ongoing' ? `/studies/${s.id}` : `/studies/${s.id}/manage`)
  }

  return (
    <AppShell crumbs={[{ label: tab === 'sessions' ? 'Sessions' : 'My Studies' }]}>
      <div className="min-h-[881px] rounded-lg bg-bg-0 p-4">
        {tab === 'completed' && <h1 className="pb-2 text-title-s text-text-title">My Studies</h1>}

        <div className="flex items-center justify-between gap-4 pb-6">
          {tab === 'sessions' ? (
            <div className="flex flex-col gap-1">
              <h1 className="text-title-s leading-[25px] text-text-title">Scheduled Sessions</h1>
              <p className="text-body-regular text-text-body">{upcomingLine}</p>
            </div>
          ) : <Tabs variant="segmented" className="w-[343px]" value={tab} items={TABS} />}
          <div className="flex items-center gap-3">
            {/* The export labels this search "Study Type", the same as the filter beside it. Built as drawn and flagged. */}
            {tab === 'sessions' && (
              <label className="relative flex">
                <Search className="pointer-events-none absolute left-3 top-3 h-6 w-6 text-text-title" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search session or study" aria-label="Search sessions"
                  className="h-input w-[319px] rounded-lg border-1 border-stroke-input bg-bg-0 pl-[43px] pr-3 text-body-regular text-text-title placeholder:text-text-body" />
              </label>
            )}
            <div className="relative">
              <Select value="Study Type" className="w-[200px]" onClick={() => setTypeMenu((m) => !m)} />
              <StudyTypeMenu open={typeMenu} onClose={() => setTypeMenu(false)} value={types} onChange={setTypes} />
            </div>
            {tab === 'ongoing' && <ViewToggle view={view} onChange={setView} />}
            {tab === 'sessions' && (
              <button type="button" aria-label="Calendar view" onClick={() => toast('A calendar view of sessions has not been designed yet')}
                className="flex h-input w-input shrink-0 items-center justify-center rounded-lg border-1 border-stroke-input bg-bg-0 text-text-title hover:bg-bg-1">
                <Calendar className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {tab === 'sessions' ? <SessionsTab search={search} types={types} /> : tab === 'ongoing' && view === 'grid' ? (
          <div className="grid grid-cols-3 gap-3">
            {cards.map((s) => (
              <StudyCard key={s.id} onOpen={() => open(s)} onMenu={() => setRowMenu(s.id)}
                menu={<RowMenu tab={tab} row={s} open={rowMenu === s.id} onClose={() => setRowMenu(null)} onPause={() => { setRowMenu(null); if (s.state === 'paused') setResuming(s); else setPausing(s) }} onStop={() => { setRowMenu(null); setStopping(s) }} onDelete={() => { setRowMenu(null); setDeleting(s) }} />}
                study={s} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border-1 border-stroke-1">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b-1 border-stroke-1 bg-bg-1">
                  {COLUMNS[tab as Exclude<StudiesTab, 'sessions'>].map((c) => (
                    <th key={c.key} style={{ width: c.width }} className="h-[52px] px-4 text-text-regular font-normal text-text-subtitle">
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
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS[tab as Exclude<StudiesTab, 'sessions'>].length} className="px-[22px] py-16 text-center">
                      <p className="text-body-medium text-text-title">
                        {tab === 'drafts' ? 'No drafts yet.'
                          : tab === 'completed' ? 'Nothing has been completed yet.'
                            : 'No studies are running yet.'}
                      </p>
                      <p className="pt-1 text-text-regular text-text-subtitle">
                        {tab === 'drafts' ? 'A study you start and leave will wait for you here.'
                          : tab === 'completed' ? 'A study moves here once every session is done and paid.'
                            : 'Create a study and our team will review it and take it live.'}
                      </p>
                      {tab === 'ongoing' && (
                        <Button size="row" className="mt-4" onClick={newStudy}>
                          Create Study
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
                {rows.map((s) => (
                  <tr key={s.id} className="border-b-1 border-stroke-1 last:border-b-0 hover:bg-bg-1">
                    {COLUMNS[tab as Exclude<StudiesTab, 'sessions'>].map((c) => (
                      <td key={c.key} className={cn('h-16 align-middle text-text-regular text-text-title', c.key === 'name' ? 'pl-3 pr-4' : 'px-4')}>
                        {c.key === 'name' && (
                          <span className="flex items-center gap-3">
                            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-bg-2">
                              {s.image && <img src={s.image} alt="" className="h-full w-full object-cover" />}
                            </span>
                            <button type="button" onClick={() => open(s)} className="line-clamp-2 text-left text-text-medium hover:text-brand-primary">{s.name}</button>
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
                        {c.key === 'progress' && (
                          <span className="flex w-[108px] flex-col gap-1.5">
                            <span className="flex h-2 gap-0.5">
                              {progressPct(s) > 0 && <span className="h-full rounded-full bg-brand-secondary" style={{ width: `${progressPct(s)}%` }} />}
                              {progressPct(s) < 100 && <span className="h-full flex-1 rounded-full bg-green-100" />}
                            </span>
                            <span className="text-label text-text-subtitle">{progressPct(s)}% complete</span>
                          </span>
                        )}
                        {c.key === 'menu' && (
                          <span className="relative flex justify-end">
                            <button type="button" aria-label="Study options" onClick={() => setRowMenu(rowMenu === s.id ? null : s.id)}
                              className="text-text-subtitle hover:text-text-title">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            <RowMenu tab={tab} row={s} open={rowMenu === s.id} onClose={() => setRowMenu(null)}
                              onPause={() => { setRowMenu(null); if (s.state === 'paused') setResuming(s); else setPausing(s) }} onStop={() => { setRowMenu(null); setStopping(s) }} onDelete={() => { setRowMenu(null); setDeleting(s) }} />
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
        onConfirm={() => {
          const st = pausing
          setPausing(null)
          if (!st) return
          /* Pausing is a real move now, so the row, the pill and the tabs follow. */
          const res = moveStudy(st.id, 'paused')
          if (res.ok) navigate(`/studies/${st.id}/paused`); else toast(res.why)
        }} />
      <StopCompleteModal open={stopping !== null} left={stopping ? Math.max(0, stopping.required - counts(stopping).completed) : 0}
        onClose={() => setStopping(null)}
        onConfirm={() => {
          const st = stopping
          setStopping(null)
          if (!st) return
          const res = moveStudy(st.id, 'completed')
          toast(res.ok ? `${st.title} marked completed` : res.why)
        }} />
      <RepublishModal open={resuming !== null} onClose={() => setResuming(null)}
        onConfirm={() => {
          const st = resuming
          setResuming(null)
          if (!st) return
          const res = moveStudy(st.id, 'recruiting')
          if (res.ok) setRepublished(true); else toast(res.why)
        }} />
      <DoneModal open={republished} onClose={() => setRepublished(false)} title="Study has been re-published!"
        body="Your study has been published live for participants and you will keep receiving the participants until you stop the study or it expires by validity." />
      <DeleteStudyModal open={deleting !== null} onClose={() => setDeleting(null)} name={deleting?.name ?? ''}
        onConfirm={() => {
          const st = deleting
          setDeleting(null)
          if (!st) return
          const res = moveStudy(st.id, 'cancelled')
          toast(res.ok ? `${st.name} cancelled` : res.why)
        }} />
    </AppShell>
  )
}

/** The ⇅ mark on a sortable header. */
function SortMark({ active, dir }: { active?: boolean; dir?: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" className="shrink-0 text-text-body">
      <path d="M8 4v16m0 0-3-3m3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        className={cn(active && dir === 1 ? 'text-brand-primary' : undefined)} opacity={active && dir === -1 ? 0.4 : 1} />
      <path d="M16 20V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        className={cn(active && dir === -1 ? 'text-brand-primary' : undefined)} opacity={active && dir === 1 ? 0.4 : 1} />
    </svg>
  )
}

/** The right menu for a row or card, which differs per tab. */
function RowMenu({
  tab, row, open, onClose, onPause, onStop, onDelete,
}: { tab: StudiesTab; row: Study; open: boolean; onClose: () => void; onPause: () => void; onStop: () => void; onDelete: () => void }) {
  const toast = useToast()
  const nav = useNavigate()
  const { duplicateStudy } = useStudies()
  const copy = async () => {
    const ok = await copyText(`https://focusinsite.com/study/${row.id}`)
    toast(ok ? 'Link copied' : 'Could not reach the clipboard')
    onClose()
  }
  /**
   * Stop-complete, Edit and Duplicate each only closed the menu, and a menu
   * closing looks like a consequence to an audit, which is why they survived
   * one. Stop-complete now asks first (Stop and Mark Study Completed?). Editing an ongoing study is its Manage tab, where each Create step
   * reads back with an Edit of its own; editing a draft is the Create flow.
   */
  const { open: openDraft } = useDraft()
  const edit = () => {
    onClose()
    if (row.state === 'draft') openDraft(row)
    nav(row.state === 'draft' ? '/studies/create/about' : `/studies/${row.id}/manage`)
  }
  const duplicate = () => {
    const res = duplicateStudy(row.id)
    toast(res.ok ? `Copied to Drafts as “${row.title} (copy)”` : res.why ?? 'Could not copy that study')
    onClose()
    if (res.ok && tab !== 'drafts') nav('/studies/drafts')
  }
  if (tab === 'drafts') return <DraftMenu open={open} onClose={onClose} onDelete={onDelete} onEdit={edit} onDuplicate={duplicate} />
  if (tab === 'completed') return <CompletedMenu open={open} onClose={onClose} onCopy={copy} onDuplicate={duplicate} />
  return <OngoingMenu open={open} onClose={onClose} onPause={onPause} onCopy={copy} paused={row.state === 'paused'}
    onComplete={onStop} onDuplicate={duplicate} />
}
