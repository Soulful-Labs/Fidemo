import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import { STUDY_TYPE_LABEL } from '../../components/app/StudyTypeTag'
import TabBar from '../../components/ui/TabBar'
import { cn } from '../../lib/cn'
import { STATUS, statusesForTab } from '../../lib/studyState'
import type { MyStudiesTab } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import type { Study, StudyType } from '../../mock/types'
import { RejectModal } from './detail/ConfirmModals'
import SearchRow from './SearchRow'
import SectionTitle from './SectionTitle'
import StudiesTabs from './StudiesTabs'
import StudyList from './StudyList'
import TypeFilter from './TypeFilter'

const TABS: { key: MyStudiesTab; label: string }[] = [
  { key: 'invites', label: 'Invites' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'applied', label: 'Applied' },
  { key: 'history', label: 'History' },
]

const HISTORY_FILTERS = ['All', 'Paid', 'Rejected', 'No Show'] as const

const EMPTY: Record<MyStudiesTab, { title: string; body: string }> = {
  invites: { title: 'No invitations yet!', body: 'Apply to studies from Explore and invitations will show up here.' },
  scheduled: { title: 'Nothing scheduled yet!', body: 'Once you are invited to schedule a session, book it and it will appear here.' },
  drafts: { title: 'No drafts saved!', body: 'A screener you leave part way is saved here to finish later.' },
  applied: { title: 'No applications in review!', body: 'Apply to a study and track its review here.' },
  history: { title: 'No study history yet!', body: 'Completed and closed studies will be listed here.' },
}

/** "Applied on Wed, Mar 5" for the Applied tab (PRD 6.14). */
function appliedOn(study: Study): string | undefined {
  const at = study.timeline.find((t) => t.label === 'Applied')?.at
  return at ? `Applied on ${new Date(at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : undefined
}

/** PRD 6.14, Figma 919:73010 / 919:73144: the five My Studies sub-tabs. */
export default function MyStudies() {
  const { tab = 'invites' } = useParams()
  const navigate = useNavigate()
  const { studies, rejectInvitation, toast } = useStore()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<StudyType | 'all'>('all')
  const [history, setHistory] = useState<(typeof HISTORY_FILTERS)[number]>('All')
  const [rejecting, setRejecting] = useState<Study | null>(null)

  const current = (TABS.find((t) => t.key === tab)?.key ?? 'invites') as MyStudiesTab
  const statuses = statusesForTab(current)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return studies.filter((s) =>
      statuses.includes(s.status) &&
      (type === 'all' || s.type === type) &&
      (current !== 'history' || history === 'All' || STATUS[s.status].label === history) &&
      (!q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)),
    )
  }, [studies, statuses, type, history, query, current])

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <StudiesTabs />

      <TabBar
        variant="underline"
        scrollable
        className="-mt-2 px-2"
        items={TABS.map((t) => ({ key: t.key, label: t.label, to: `/studies/mine/${t.key}` }))}
      />

      <div className="flex items-center gap-2 pr-4">
        <div className="min-w-0 flex-1"><SearchRow query={query} onQuery={setQuery} /></div>
        {current === 'history' ? (
          <TypeFilter value={history} options={HISTORY_FILTERS.map((h) => ({ key: h, label: h }))} onChange={(k) => setHistory(k as typeof history)} />
        ) : (
          <TypeFilter
            value={type}
            options={[{ key: 'all', label: 'All' }, ...(Object.keys(STUDY_TYPE_LABEL) as StudyType[]).map((t) => ({ key: t, label: STUDY_TYPE_LABEL[t] }))]}
            onChange={(k) => setType(k as StudyType | 'all')}
          />
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState title={EMPTY[current].title} body={EMPTY[current].body} actionLabel="Explore studies" onAction={() => navigate('/studies')} />
      ) : (
        <div className={cn('flex flex-col gap-4 px-4')}>
          {current === 'scheduled' && <SectionTitle title={`Scheduled (${visible.length})`} />}
          <StudyList
            studies={visible.map((s) => s)}
            showStatus={current === 'applied' || current === 'history'}
            rejectable={current === 'invites'}
            footnoteFor={current === 'applied' ? appliedOn : undefined}
            onReject={current === 'invites' ? (s) => setRejecting(s) : undefined}
          />
        </div>
      )}

      <RejectModal
        open={rejecting !== null}
        isInvitation
        onClose={() => setRejecting(null)}
        onConfirm={() => {
          if (rejecting) rejectInvitation(rejecting.id)
          setRejecting(null)
          toast('Invitation rejected')
        }}
      />
    </div>
  )
}
