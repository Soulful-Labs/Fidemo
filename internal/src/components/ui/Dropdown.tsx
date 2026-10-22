import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDown } from './icons'

/** Closes on a click outside or on Escape. */
export function useMenu() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  return { open, setOpen, box }
}

function Trigger({ text, open, onClick, label }: { text: string; open: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={onClick}
      className="flex h-[38px] w-full items-center justify-between gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-left text-text-regular text-text-title">
      <span className="truncate">{text}</span>
      <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
    </button>
  )
}

function Panel({ width, multi, children }: { width: string; multi?: boolean; children: ReactNode }) {
  return (
    <div role="listbox" aria-multiselectable={multi || undefined}
      className={cn('absolute right-0 top-[calc(100%+4px)] z-20 flex flex-col overflow-hidden rounded-md border-1 border-stroke-input bg-bg-0 py-1 shadow-menu', width)}>
      {children}
    </div>
  )
}

/** One 38px menu row (Dropdown menu Item, 2368:68734): the chosen one sits on the brand yellow at 20%. */
export function MenuItem({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" role="option" aria-selected={on} onClick={onClick}
      className={cn('flex h-[38px] items-center gap-2 whitespace-nowrap rounded-sm px-2.5 text-left text-body-regular text-text-title', on ? 'bg-yellow-alpha20' : 'hover:bg-bg-1')}>
      {children}
    </button>
  )
}

/** The 18px box the filter menu draws (2367:68669): orange with a white tick when ticked. */
function Box({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-xs border-1', on ? 'border-yellow-600 bg-yellow-600' : 'border-text-body bg-bg-0')}>
      {on && <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none"><path d="m2.5 6.2 2.3 2.3 4.7-5" stroke="currentColor" className="text-bg-0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  )
}

/** A single-choice dropdown: the trigger reads `prefix` and the choice, e.g. "Sort: Recent" (sort menu, 2368:68734). */
export function DropdownSelect({ value, options, onChange, prefix = '', label, className, menuWidth = 'w-[184px]' }: {
  value: string; options: readonly string[]; onChange: (v: string) => void; prefix?: string; label: string; className?: string; menuWidth?: string
}) {
  const { open, setOpen, box } = useMenu()
  return (
    <div ref={box} className={cn('relative', className)}>
      <Trigger text={`${prefix}${value}`} open={open} label={label} onClick={() => setOpen((o) => !o)} />
      {open && (
        <Panel width={menuWidth}>
          {options.map((o) => <MenuItem key={o} on={o === value} onClick={() => { onChange(o); setOpen(false) }}>{o}</MenuItem>)}
        </Panel>
      )}
    </div>
  )
}

/**
 * A checkbox dropdown with an "all" row (All Studies, 2367:68669). Ticking
 * "all" clears the rest; ticking anything else clears "all"; nothing ticked
 * is "all" again.
 */
export function DropdownChecks({ all, options, picked, onChange, text, label, className, menuWidth = 'w-[170px]' }: {
  all: string; options: readonly string[]; picked: string[]; onChange: (v: string[]) => void; text: string; label: string; className?: string; menuWidth?: string
}) {
  const { open, setOpen, box } = useMenu()
  const isAll = picked.length === 0 || picked.includes(all)
  const flip = (o: string) => {
    if (o === all) return onChange([all])
    const rest = picked.filter((x) => x !== all)
    const next = rest.includes(o) ? rest.filter((x) => x !== o) : [...rest, o]
    onChange(next.length ? next : [all])
  }
  return (
    <div ref={box} className={cn('relative', className)}>
      <Trigger text={text} open={open} label={label} onClick={() => setOpen((o) => !o)} />
      {open && (
        <Panel width={menuWidth} multi>
          {[all, ...options].map((o) => {
            const on = o === all ? isAll : picked.includes(o)
            return <MenuItem key={o} on={on} onClick={() => flip(o)}><Box on={on} />{o}</MenuItem>
          })}
        </Panel>
      )}
    </div>
  )
}
