import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import TopBar from '../../components/ui/TopBar'
import { cn } from '../../lib/cn'
import { dateLong } from '../../lib/format'
import type { TrustHistoryEntry } from '../../lib/derive'
import { useStore } from '../../mock/store'
import TypeFilter from '../studies/TypeFilter'

const KINDS = [
  { key: 'all', label: 'All' },
  { key: 'gains', label: 'Gains' },
  { key: 'deductions', label: 'Deductions' },
]
const RANGES = ['All Time', 'This Month', 'Last 3 Months', 'This Year']
const DAY = 86_400_000

/** "+4%" / "-2%" pill, the Trust Score Rules style. */
export function DeltaPill({ delta }: { delta: number }) {
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-text-medium',
      delta > 0 ? 'bg-green-900/60 text-brand-secondary' : delta < 0 ? 'bg-state-dangerBg text-state-danger' : 'bg-bg-2 text-text-body')}>
      {delta > 0 ? '+' : ''}{delta}%
    </span>
  )
}

/** One line of the score history; tapping opens the study it came from. */
export function ScoreHistoryRow({ entry }: { entry: TrustHistoryEntry }) {
  const navigate = useNavigate()
  const Row = entry.studyId ? 'button' : 'div'
  return (
    <Row type={entry.studyId ? 'button' : undefined} onClick={entry.studyId ? () => navigate(`/studies/${entry.studyId}`) : undefined}
      className="flex w-full items-center gap-3 border-b-1 border-stroke-3 py-3 text-left last:border-b-0">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-text-medium text-text-title">{entry.label}</span>
        <span className="truncate text-label text-text-body">{entry.detail ? `${entry.detail} • ` : ''}{dateLong(entry.at)}</span>
      </span>
      <DeltaPill delta={entry.delta} />
    </Row>
  )
}

/**
 * Score history: every line the Trust Score is made of (policy section 1),
 * newest first, each traceable to its study. Modelled on Earning History
 * (969:29004 family): range dropdown, a kind filter and the rows.
 */
export default function ScoreHistory() {
  const { back } = useAppNav()
  const { trustHistory } = useStore()
  const [range, setRange] = useState('All Time')
  const [kind, setKind] = useState('all')

  const list = useMemo(() => {
    const now = Date.now()
    const from = range === 'This Month' ? new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
      : range === 'Last 3 Months' ? now - 90 * DAY
        : range === 'This Year' ? new Date(new Date().getFullYear(), 0, 1).getTime() : 0
    return trustHistory.filter((e) => new Date(e.at).getTime() >= from)
      .filter((e) => (kind === 'gains' ? e.delta > 0 : kind === 'deductions' ? e.delta < 0 : true))
  }, [trustHistory, range, kind])

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Score History" onBack={back} />

      <div className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1"><TypeFilter full value={range} options={RANGES.map((r) => ({ key: r, label: r }))} onChange={setRange} /></div>
          <div className="flex-1"><TypeFilter full value={kind} options={KINDS} onChange={setKind} /></div>
        </div>

        {list.length === 0 ? (
          <EmptyState title="Nothing in this range" body="Try a wider date range or a different kind." actionLabel="Show all" onAction={() => { setRange('All Time'); setKind('all') }} />
        ) : (
          <div data-stagger className="flex flex-col rounded-lg bg-bgAlt-2 px-4">
            {list.map((e, i) => <ScoreHistoryRow key={`${e.label}-${e.at}-${i}`} entry={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
