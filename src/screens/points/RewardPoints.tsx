import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import EmptyState from '../../components/app/EmptyState'
import RollingNumber from '../../components/motion/RollingNumber'
import Button from '../../components/ui/Button'
import TabBar from '../../components/ui/TabBar'
import TopBar from '../../components/ui/TopBar'
import { Info, PointsCoin } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { dateLong, points as fmt } from '../../lib/format'
import { useStore } from '../../mock/store'
import TypeFilter from '../studies/TypeFilter'
import PointsFilters from './PointsFilters'
import type { PointsFilterState } from './PointsFilters'

const RANGES = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']

function since(range: string): number {
  const d = new Date()
  if (range === 'This Month') d.setDate(1)
  else if (range === 'Last Month') d.setMonth(d.getMonth() - 1, 1)
  else if (range === 'Last 3 Months') d.setMonth(d.getMonth() - 3)
  else if (range === 'Last 6 Months') d.setMonth(d.getMonth() - 6)
  else return 0
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** PRD 8.2, Figma 970:32231 / 978:62004: balance card and the two history tabs. */
export default function RewardPoints() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { user, pointsHistory, redeemHistory } = useStore()
  const badge = useRef<HTMLSpanElement>(null)
  const [tab, setTab] = useState<'points' | 'redeem'>('points')
  const [range, setRange] = useState('All Time')
  const [filters, setFilters] = useState<PointsFilterState>({ kind: 'all', sort: 'new', max: 500 })
  const [sheet, setSheet] = useState<'sort' | 'filter' | null>(null)
  const allTime = useMemo(() => pointsHistory.reduce((sum, p) => sum + p.amount, 0) + redeemHistory.reduce((s, r) => s + r.points, 0), [pointsHistory, redeemHistory])

  const from = since(range)
  const sorter = (a: { at: string; amount: number }, b: { at: string; amount: number }) =>
    filters.sort === 'new' ? b.at.localeCompare(a.at) : filters.sort === 'old' ? a.at.localeCompare(b.at)
      : filters.sort === 'low' ? a.amount - b.amount : b.amount - a.amount
  const entries = pointsHistory
    .filter((p) => new Date(p.at).getTime() >= from && (filters.kind === 'all' || p.kind === filters.kind) && p.amount <= filters.max)
    .sort(sorter)
  const redeems = redeemHistory.filter((r) => new Date(r.at).getTime() >= from).sort(sorter)

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Reward Points" onBack={back}
        right={<button type="button" aria-label="How reward points work" onClick={() => navigate('/points/how-it-works')} className="text-text-title"><Info className="h-6 w-6" /></button>} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <section className="flex flex-col gap-4 rounded-lg bg-bgAlt-2 bg-green-fade p-4">
          <span className="text-body-regular text-text-subtitle">Balance</span>
          <div className="flex items-end justify-between gap-3">
            <span ref={badge} className="flex items-center gap-2 text-title-l text-brand-secondary">
              <PointsCoin className="h-6 w-6" />
              <RollingNumber value={user.points} format={fmt} memory="points" float pulse={badge} />
            </span>
            <span className="text-text-regular text-text-subtitle">100 points = $1</span>
          </div>
          <Button fullWidth onClick={() => navigate('/points/redeem')}>Redeem</Button>
        </section>
        <p className="rounded-md border-1 border-stroke-3 py-2 text-center text-text-regular text-text-body">
          All Time Earned: <span className="text-text-title">{fmt(allTime)}</span>
        </p>

        <TabBar items={[{ key: 'points', label: 'Points History' }, { key: 'redeem', label: 'Redeem History' }]} value={tab} onChange={(k) => setTab(k as typeof tab)} />

        <div className="flex items-center gap-2">
          <div className="flex-1"><TypeFilter value={range} options={RANGES.map((r) => ({ key: r, label: r }))} onChange={setRange} /></div>
          <button type="button" aria-label="Sort" onClick={() => setSheet('sort')} className="flex h-input w-12 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {tab === 'points' && (
            <button type="button" aria-label="Filters" onClick={() => setSheet('filter')} className={cn('flex h-input w-12 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title', filters.kind !== 'all' && 'border-cta-primary text-brand-primary')}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 7h10m4 0h2M4 12h2m4 0h10M4 17h10m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          )}
        </div>

        {tab === 'points' ? (
          entries.length === 0 ? <EmptyState title="No points in this range" actionLabel="Show all" onAction={() => { setRange('All Time'); setFilters({ kind: 'all', sort: 'new', max: 500 }) }} /> :
          entries.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-3 border-b-1 border-stroke-3 pb-3">
              <span className="flex flex-col gap-1">
                <span className="text-text-medium text-text-title">{p.label} <span className="text-text-body">•</span> <span className="text-text-regular">{p.detail}</span></span>
                <span className="text-label text-text-body">{dateLong(p.at)}</span>
              </span>
              <span className="text-body-medium text-brand-secondary">+{p.amount}</span>
            </div>
          ))
        ) : (
          redeems.length === 0 ? <EmptyState title="No points redeemed yet!" body="Redeem 1,000 points or more to see them here." actionLabel="Redeem" onAction={() => navigate('/points/redeem')} /> :
          redeems.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 border-b-1 border-stroke-3 pb-3">
              <span className="flex flex-col gap-1">
                <span className="text-text-medium text-text-title">{fmt(r.points)} points redeemed</span>
                <span className="text-label text-text-body">{dateLong(r.at)} • {r.reference}</span>
              </span>
              <span className="text-body-medium text-state-danger">-{fmt(r.points)}</span>
            </div>
          ))
        )}
      </div>

      <PointsFilters sheet={sheet} onClose={() => setSheet(null)} value={filters} onChange={setFilters} />
    </div>
  )
}
