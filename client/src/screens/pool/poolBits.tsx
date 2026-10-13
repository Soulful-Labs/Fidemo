import Select from '../../components/ui/Select'
import { Close, GoldMark, PlatinumMark, SilverMark } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { POOL_FILTERS, usePool } from '../../mock/pool'
import type { PoolFilters } from '../../mock/pool'
import { useState } from 'react'

const MARK: Record<string, typeof GoldMark> = { Silver: SilverMark, Gold: GoldMark, Platinum: PlatinumMark }

/** A group's heading: 14px capitals in the subtitle colour. */
const HEAD = 'flex h-7 items-center text-text-regular uppercase text-text-subtitle'
const TIER_TONE: Record<string, string> = { Silver: 'text-tier-silver', Gold: 'text-tier-gold', Platinum: 'text-tier-platinum' }

/** A group of radios in the filter rail. Picking one narrows the list. */
function Radios({ label, options, value, onPick, open }: {
  label: string; options: string[]; value: string; onPick: (v: string) => void
  /** Profile Score runs straight into Gender, with no rule between them (13 Oct 2026 export). */
  open?: boolean
}) {
  return (
    <div className={cn('flex flex-col pt-[13px]', open ? 'pb-2' : 'border-b-1 border-stroke-1 pb-[13px]')}>
      <span className={HEAD}>{label}</span>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onPick(o)} aria-pressed={o === value}
          className="flex h-7 items-center gap-2 text-left text-text-regular text-text-title">
          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5',
            o === value ? 'border-brand-primary' : 'border-text-body')}>
            {o === value && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
          </span>
          {o}
        </button>
      ))}
    </div>
  )
}

/**
 * A picker with the chips already chosen under it. The select opens the
 * options the pool actually holds, and each chip carries a cross that takes
 * it off again. All three were drawn but none of them did anything.
 */
function Picked({ label, placeholder, options, chips, onChange }: {
  label: string; placeholder: string; options: string[]; chips: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const left = options.filter((o) => !chips.includes(o))
  return (
    <div className="relative flex flex-col gap-1 border-b-1 border-stroke-1 pb-[14px] pt-[13px]">
      <span className={HEAD}>{label}</span>
      <Select value={placeholder} h="h-[38px]" className="rounded-md text-text-regular text-text-body"
        onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="absolute left-0 right-0 top-[72px] z-20 max-h-56 overflow-y-auto rounded-sm border-1 border-stroke-input bg-bg-0 shadow-lg">
          {left.length === 0 && (
            <p className="px-3 py-2 text-text-regular text-text-body">Everything here is already chosen.</p>
          )}
          {left.map((o) => (
            <button key={o} type="button" onClick={() => { onChange([...chips, o]); setOpen(false) }}
              className="flex w-full items-center px-3 py-2 text-left text-text-regular text-text-title hover:bg-bg-1">
              {o}
            </button>
          ))}
        </div>
      )}
      <span className={cn('flex flex-wrap gap-x-2 gap-y-1', chips.length > 0 && 'pt-2')}>
        {chips.map((c) => (
          <span key={c} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-title">
            {c}
            <button type="button" aria-label={`Remove ${c}`} onClick={() => onChange(chips.filter((x) => x !== c))}
              className="text-text-subtitle hover:text-text-title">
              <Close className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </span>
    </div>
  )
}

/** The 245px filter rail beside the participants pool. */
export default function FilterRail({ value, onChange }: {
  value: PoolFilters; onChange: (next: PoolFilters) => void
}) {
  const { options: POOL_OPTIONS } = usePool()
  const f = POOL_FILTERS
  const set = <K extends keyof PoolFilters>(k: K, v: PoolFilters[K]) => onChange({ ...value, [k]: v })
  const toggleTier = (t: string) => {
    if (t === 'Any') { set('tiers', []); return }
    set('tiers', value.tiers.includes(t) ? value.tiers.filter((x) => x !== t) : [...value.tiers, t])
  }
  return (
    <aside className="w-[245px] shrink-0">
      <div className="flex flex-col border-b-1 border-stroke-1 pb-[13px]">
        <span className={HEAD}>TIERS</span>
        {f.tiers.map((t) => {
          const Mark = MARK[t]
          const on = t === 'Any' ? value.tiers.length === 0 : value.tiers.includes(t)
          return (
            <button key={t} type="button" onClick={() => toggleTier(t)} aria-pressed={on}
              className="flex h-7 items-center gap-2 text-left text-text-regular text-text-title">
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-none border-1.5',
                on ? 'border-brand-primary bg-brand-primary text-bg-0' : 'border-text-body')}>
                {on && (
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {Mark && <Mark className={cn('h-[18px] w-[18px]', TIER_TONE[t])} />}
              {t}
            </button>
          )
        })}
      </div>
      <Radios open label="PROFILE SCORE" options={f.score} value={value.score} onPick={(v) => set('score', v)} />
      <Radios label="GENDER" options={f.gender} value={value.gender} onPick={(v) => set('gender', v)} />
      <Picked {...f.roles} options={POOL_OPTIONS.roles} chips={value.roles} onChange={(v) => set('roles', v)} />
      <Picked {...f.domain} options={POOL_OPTIONS.domain} chips={value.domain} onChange={(v) => set('domain', v)} />
      <Picked {...f.location} options={POOL_OPTIONS.location} chips={value.location} onChange={(v) => set('location', v)} />
      <Picked {...f.language} options={POOL_OPTIONS.language} chips={value.language} onChange={(v) => set('language', v)} />
      <Radios label="LAST ACTIVE" options={f.lastActive} value={value.lastActive} onPick={(v) => set('lastActive', v)} />
    </aside>
  )
}
