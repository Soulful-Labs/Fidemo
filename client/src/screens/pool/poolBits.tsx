import { NavLink } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { Calendar, Close, GoldMark, MoreVertical, PlatinumMark, Plus, SilverMark, UsersIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { POOL_FILTERS, usePool } from '../../mock/pool'
import type { PanelCard, PoolFilters } from '../../mock/pool'
import { useState } from 'react'
import { useToast } from '../../components/ui/Toast'

const MARK: Record<string, typeof GoldMark> = { Silver: SilverMark, Gold: GoldMark, Platinum: PlatinumMark }

/** The add action the Eligible Matches tab swaps into the respondent card. */
export function AddToPanel({ onAdd }: { onAdd?: () => void }) {
  const toast = useToast()
  return (
    <Button variant="tertiary" size="none" className="h-11 w-full" leftIcon={<Plus className="h-4 w-4" />}
      onClick={() => (onAdd ? onAdd() : toast('Added to this panel'))}>
      Add To This Panel
    </Button>
  )
}

/** A micro-panel tile: mine list their roles, featured ones their description. */
export function PanelTile({ c, to, onDelete }: { c: PanelCard; to: string; onDelete?: () => void }) {
  return (
    <NavLink to={to} className="flex flex-col rounded-lg border-1 border-stroke-input p-4 hover:bg-bg-1">
      <span className="flex items-start justify-between gap-3">
        <span className="flex flex-col gap-1">
          <span className="text-title-s leading-[22px] text-text-title">{c.title}</span>
          <span className="text-text-regular text-text-subtitle">{c.domain}</span>
        </span>
        {c.roles && (
          <button type="button" aria-label="Panel options"
            onClick={(e) => { e.preventDefault(); onDelete?.() }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </span>
      {c.roles && (
        <span className="flex items-center gap-1.5 pt-3 text-text-regular text-text-title">
          <span className="shrink-0 text-text-body">&#9878;</span>
          <span className="truncate">{c.roles}</span>
        </span>
      )}
      {c.description && <span className="line-clamp-2 pt-3 text-text-regular text-text-subtitle">{c.description}</span>}
      <span className="flex items-center gap-2 pt-4">
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-bg-1 px-3 text-text-regular text-text-title">
          <UsersIcon className="h-4 w-4 text-text-subtitle" />{c.members}
        </span>
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-bg-1 px-3 text-text-regular text-text-body">
          <Calendar className="h-4 w-4" />{c.updated}
        </span>
      </span>
    </NavLink>
  )
}

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
