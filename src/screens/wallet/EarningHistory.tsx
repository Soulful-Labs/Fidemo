import { useMemo, useState } from 'react'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import TopBar from '../../components/ui/TopBar'
import { cn } from '../../lib/cn'
import { useStore } from '../../mock/store'
import type { EarningCategory } from '../../mock/types'
import TypeFilter from '../studies/TypeFilter'
import { EarningRow } from './bits'

const RANGES = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']
const CATEGORIES: ('All' | EarningCategory)[] = ['All', 'Interview', 'Focus Group', 'Survey', 'In-Person', 'Redeem Points']
const SORTS = [
  { key: 'new', label: 'New First' }, { key: 'old', label: 'Old First' },
  { key: 'low', label: 'Low Amount' }, { key: 'high', label: 'High Amount' },
]

const ICON = 'flex h-input w-12 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title'

/** PRD 10.1 Earning History, Figma 969:29138, with the sort and filter pop-ups. */
export default function EarningHistory() {
  const { back } = useAppNav()
  const { transactions } = useStore()
  const [range, setRange] = useState('All Time')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [sort, setSort] = useState('new')
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null)

  const list = useMemo(() => {
    const d = new Date()
    let since = 0
    if (range !== 'All Time') {
      if (range === 'This Month') d.setDate(1)
      else if (range === 'Last Month') d.setMonth(d.getMonth() - 1, 1)
      else if (range === 'Last 3 Months') d.setMonth(d.getMonth() - 3)
      else d.setMonth(d.getMonth() - 6)
      d.setHours(0, 0, 0, 0)
      since = d.getTime()
    }
    return transactions
      .filter((t) => new Date(t.at).getTime() >= since && (category === 'All' || t.category === category))
      .sort((a, b) =>
        sort === 'new' ? b.at.localeCompare(a.at) : sort === 'old' ? a.at.localeCompare(b.at)
          : sort === 'low' ? a.amount - b.amount : b.amount - a.amount)
  }, [transactions, range, category, sort])

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Earning History" onBack={back} />

      <div data-stagger className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1"><TypeFilter value={range} options={RANGES.map((r) => ({ key: r, label: r }))} onChange={setRange} /></div>
          <button type="button" aria-label="Sort" onClick={() => setSheet('sort')} className={ICON}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" aria-label="Filters" onClick={() => setSheet('filter')} className={cn(ICON, category !== 'All' && 'border-cta-primary text-brand-primary')}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 7h10m4 0h2M4 12h2m4 0h10M4 17h10m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState title="No earnings in this range" body="Try a wider date range or a different category." actionLabel="Show all" onAction={() => { setRange('All Time'); setCategory('All') }} />
        ) : (
          list.map((tx) => <EarningRow key={tx.id} tx={tx} />)
        )}
      </div>

      <BottomSheet alt open={sheet === 'sort'} onClose={() => setSheet(null)} title="Sort by">
        <div className="flex flex-col gap-2">
          {SORTS.map((s) => (
            <button key={s.key} type="button" onClick={() => { setSort(s.key); setSheet(null) }}
              className={cn('flex h-input items-center rounded-md border-1 px-4 text-left text-body-regular', sort === s.key ? 'border-cta-primary bg-yellow-1000/50 text-brand-primary' : 'border-transparent bg-bgAlt-2 text-text-title')}>
              {s.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet alt open={sheet === 'filter'} onClose={() => setSheet(null)} title="Filters"
        footer={<div className="flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => { setCategory('All'); setRange('All Time') }}>Reset</Button><Button className="flex-1" onClick={() => setSheet(null)}>Apply</Button></div>}>
        <div className="flex flex-col gap-3">
          <p className="text-body-regular text-text-subtitle">Category</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
                className={cn('h-btn rounded-md border-1 text-body-regular', category === c ? 'border-transparent bg-cta-secondary text-cta-secondaryText' : 'border-stroke-3 text-text-title')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
