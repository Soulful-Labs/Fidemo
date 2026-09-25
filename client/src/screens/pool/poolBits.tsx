import { NavLink } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { Calendar, Close, GoldMark, MoreVertical, PlatinumMark, Plus, SilverMark, UsersIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { POOL_FILTERS } from '../../mock/pool'
import type { PanelCard } from '../../mock/pool'

const MARK: Record<string, typeof GoldMark> = { Silver: SilverMark, Gold: GoldMark, Platinum: PlatinumMark }

/** The add action the Eligible Matches tab swaps into the respondent card. */
export function AddToPanel() {
  return (
    <Button variant="tertiary" size="none" className="h-11 w-full" leftIcon={<Plus className="h-4 w-4" />}>
      Add To This Panel
    </Button>
  )
}

/** A micro-panel tile: mine list their roles, featured ones their description. */
export function PanelTile({ c, to }: { c: PanelCard; to: string }) {
  return (
    <NavLink to={to} className="flex flex-col rounded-lg border-1 border-stroke-input p-4 hover:bg-bg-1">
      <span className="flex items-start justify-between gap-3">
        <span className="flex flex-col gap-1">
          <span className="text-title-s leading-[22px] text-text-title">{c.title}</span>
          <span className="text-text-regular text-text-subtitle">{c.domain}</span>
        </span>
        {c.roles && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle">
            <MoreVertical className="h-4 w-4" />
          </span>
        )}
      </span>
      {c.roles && (
        <span className="flex items-center gap-1.5 truncate pt-3 text-text-regular text-text-title">
          <span className="text-text-body">&#9878;</span>{c.roles}
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

/** A group of radios in the filter rail. */
function Radios({ label, options, value }: { label: string; options: string[]; value: string }) {
  return (
    <div className="flex flex-col gap-2 border-b-1 border-stroke-1 py-4">
      <span className="text-label uppercase tracking-[0.04em] text-text-body">{label}</span>
      {options.map((o) => (
        <label key={o} className="flex items-center gap-3 text-text-regular text-text-title">
          <span className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-1',
            o === value ? 'border-cta-primary' : 'border-cta-tertiaryStroke')}>
            {o === value && <span className="h-2.5 w-2.5 rounded-full bg-cta-primary" />}
          </span>
          {o}
        </label>
      ))}
    </div>
  )
}

/** A select with the chips already picked under it. */
function Picked({ label, placeholder, chips }: { label: string; placeholder: string; chips: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-b-1 border-stroke-1 py-4">
      <span className="text-label uppercase tracking-[0.04em] text-text-body">{label}</span>
      <Select value={placeholder} h="h-[38px]" className="text-text-regular text-text-body" />
      <span className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-bgAlt-2 px-2 text-text-regular text-text-title">
            {c}<Close className="h-3.5 w-3.5 text-text-subtitle" />
          </span>
        ))}
      </span>
    </div>
  )
}

/** The 245px filter rail beside the participants pool. */
export default function FilterRail() {
  const f = POOL_FILTERS
  return (
    <aside className="w-[245px] shrink-0">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-title-s leading-[22px] text-text-title">
          Filters <span className="text-text-subtitle">&#9707;</span>
        </span>
        <button type="button" className="inline-flex items-center gap-1.5 text-text-medium text-text-subtitle hover:text-text-title">
          &#8635; Reset
        </button>
      </div>
      <div className="flex flex-col gap-2 border-b-1 border-stroke-1 py-4">
        <span className="text-label uppercase tracking-[0.04em] text-text-body">TIERS</span>
        {f.tiers.map((t) => {
          const Mark = MARK[t]
          return (
            <label key={t} className="flex items-center gap-3 text-text-regular text-text-title">
              <span className="h-[18px] w-[18px] shrink-0 rounded-none border-1 border-cta-tertiaryStroke" />
              {Mark && <Mark className="h-4 w-4 text-text-subtitle" />}
              {t}
            </label>
          )
        })}
      </div>
      <Radios label="PROFILE SCORE" options={f.score} value="Any" />
      <Radios label="GENDER" options={f.gender} value="All" />
      <Picked {...f.roles} />
      <Picked {...f.domain} />
      <Picked {...f.location} />
      <Picked {...f.language} />
      <Radios label="LAST ACTIVE" options={f.lastActive} value="Any" />
    </aside>
  )
}
