import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import Select from './Select'
import { Check } from './icons'
import { cn } from '../../lib/cn'

export interface CheckOption { value: string; label?: string; sub?: string; icon?: ReactNode }

/**
 * The Audience step's dropdowns (client designs, 15 Oct 2026: Age, Education,
 * Genders, Industries, Profile Tiers): a list of checkboxes under the field,
 * 40px rows, the ticked ones on a yellow-30 pill. `all` puts an "All" row
 * above a rule, ticked when nothing else is; ticking it clears the rest.
 * `search` puts a search box at the top. `single` is the tiers list: one
 * choice, a round check on the right, and the list closes on a pick.
 */
export default function CheckPicker({
  value, options, picked, onChange, all, search, single, className, label, field,
}: {
  /** What the closed field reads. */
  value: string
  options: CheckOption[]
  picked: string[]
  onChange: (next: string[]) => void
  all?: string
  search?: string
  single?: boolean
  className?: string
  label?: string
  /** A field of the caller's own in place of the Select, given a function that opens the list (Industries keeps its text box). */
  field?: (open: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const shown = q.trim() ? options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q.trim().toLowerCase())) : options
  const toggle = (v: string) => {
    if (single) { onChange([v]); setOpen(false); return }
    onChange(picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v])
  }
  const Box = ({ on }: { on: boolean }) => (
    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-1.5',
      on ? 'border-cta-primary bg-cta-primary text-bg-0' : 'border-text-body bg-bg-0')}>
      {on && <Check className="h-3.5 w-3.5" />}
    </span>
  )
  const Row = ({ on, onClick, children, tall }: { on: boolean; onClick: () => void; children: ReactNode; tall?: boolean }) => (
    <button type="button" role={single ? 'option' : 'menuitemcheckbox'} aria-checked={on} aria-selected={single ? on : undefined} onClick={onClick}
      className={cn('flex w-full shrink-0 items-center gap-3 rounded-md px-3 text-left text-body-regular text-text-title transition-colors',
        tall ? 'min-h-[64px] py-2' : 'h-[38px]', on ? 'bg-yellow-alpha20' : 'hover:bg-bg-1')}>
      {children}
    </button>
  )
  return (
    <div className="relative">
      {field ? field(() => setOpen(true)) : <Select value={value} className={className} onClick={() => setOpen((o) => !o)} />}
      {open && (
        <>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="fixed inset-0 z-20 cursor-default" />
          <div role={single ? 'listbox' : 'menu'} aria-label={label}
            className="absolute left-0 right-0 top-full z-30 mt-1 flex max-h-[215px] flex-col gap-0.5 overflow-y-auto rounded-lg bg-bg-0 p-[11px] shadow-menu">
            {search && (
              <label className="relative mb-1 flex shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3 top-[9px] text-text-subtitle">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={search} aria-label={search}
                  className="h-[38px] w-full rounded-md border-1 border-stroke-input bg-bg-0 pl-10 pr-3 text-body-regular text-text-title outline-none placeholder:text-text-body" />
              </label>
            )}
            {all && (
              <>
                <Row on={picked.length === 0} onClick={() => onChange([])}><Box on={picked.length === 0} />{all}</Row>
                <span aria-hidden="true" className="my-0.5 h-px shrink-0 bg-stroke-input" />
              </>
            )}
            {shown.map((o, i) => {
              const on = picked.includes(o.value)
              return single ? (
                <Fragment key={o.value}>
                {i > 0 && <span aria-hidden="true" className="h-px shrink-0 bg-stroke-1" />}
                <Row on={on} tall={Boolean(o.sub)} onClick={() => toggle(o.value)}>
                  {o.icon}
                  <span className="flex flex-1 flex-col">
                    <span>{o.label ?? o.value}</span>
                    {o.sub && <span className="text-text-regular text-text-subtitle">{o.sub}</span>}
                  </span>
                  {on && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-bg-0"><Check className="h-3.5 w-3.5" /></span>}
                </Row>
                </Fragment>
              ) : (
                <Row key={o.value} on={on} onClick={() => toggle(o.value)}><Box on={on} />{o.label ?? o.value}</Row>
              )
            })}
            {search && q.trim() && !options.some((o) => (o.label ?? o.value).toLowerCase() === q.trim().toLowerCase()) && (
              <Row on={false} onClick={() => { onChange([...picked, q.trim()]); setQ('') }}><Box on={false} />Add &ldquo;{q.trim()}&rdquo;</Row>
            )}
          </div>
        </>
      )}
    </div>
  )
}
