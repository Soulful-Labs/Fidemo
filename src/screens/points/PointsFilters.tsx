import { useEffect, useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import RangeSlider from '../../components/ui/RangeSlider'
import { cn } from '../../lib/cn'
import type { PointsKind } from '../../mock/types'

export interface PointsFilterState {
  kind: PointsKind | 'all'
  sort: 'new' | 'old' | 'low' | 'high'
  /** Points range upper bound, 0 to 500 (PRD 8.2). */
  max: number
}

const KINDS: { key: PointsKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'referral', label: 'Referral' }, { key: 'study', label: 'Study' },
  { key: 'streak', label: 'Streaks' }, { key: 'bonus', label: 'One-time bonuses' },
]
const SORTS: { key: PointsFilterState['sort']; label: string }[] = [
  { key: 'new', label: 'New First' }, { key: 'old', label: 'Old First' }, { key: 'low', label: 'Low Amount' }, { key: 'high', label: 'High Amount' },
]

const OPTION = 'flex h-input items-center rounded-md border-1 px-4 text-left text-body-regular'
const ON = 'border-cta-primary bg-yellow-1000/50 text-brand-primary'
const OFF = 'border-transparent bg-bgAlt-2 text-text-title'

/** The sort and filter sheets on Points History (PRD 8.2 filters). */
export default function PointsFilters({
  sheet, onClose, value, onChange,
}: { sheet: 'sort' | 'filter' | null; onClose: () => void; value: PointsFilterState; onChange: (next: PointsFilterState) => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => { if (sheet) setDraft(value) }, [sheet, value])

  return (
    <>
      <BottomSheet alt open={sheet === 'sort'} onClose={onClose} title="Sort by">
        <div className="flex flex-col gap-2">
          {SORTS.map((s) => (
            <button key={s.key} type="button" onClick={() => { onChange({ ...value, sort: s.key }); onClose() }}
              className={cn(OPTION, value.sort === s.key ? ON : OFF)}>
              {s.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet alt open={sheet === 'filter'} onClose={onClose} title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDraft({ ...draft, kind: 'all', max: 500 })}>Reset</Button>
            <Button className="flex-1" onClick={() => { onChange(draft); onClose() }}>Apply</Button>
          </div>
        }>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-body-regular text-text-subtitle">Type</p>
            <div className="grid grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <button key={k.key} type="button" aria-pressed={draft.kind === k.key} onClick={() => setDraft({ ...draft, kind: k.key })}
                  className={cn('h-btn rounded-md border-1 text-body-regular', draft.kind === k.key ? 'border-transparent bg-cta-secondary text-cta-secondaryText' : 'border-stroke-3 text-text-title')}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          <RangeSlider label="Points" min={0} max={500} step={25} value={[0, draft.max]}
            onChange={([, max]) => setDraft({ ...draft, max })} format={([, b]) => `0-${b} points`} />
        </div>
      </BottomSheet>
    </>
  )
}
