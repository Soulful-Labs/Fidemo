import { useState } from 'react'
import { CLOCK_TIMES } from '@shared/studyForm'
import { cn } from '../../lib/cn'

/**
 * A time of day. Drawn in the availability frames as a plain box holding
 * "12:00 AM"; it opens the half hours of the day so the hours can be set.
 */
export function TimePick({ value, onPick, label, className = 'h-[38px]' }: { value: string; onPick: (v: string) => void; label: string; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative flex shrink-0">
      <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={cn('flex w-[100px] items-center rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular text-text-title', className)}>
        {value}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="fixed inset-0 z-20 cursor-default" />
          <span role="listbox" className="absolute left-0 top-full z-30 mt-1 flex max-h-56 w-[116px] flex-col overflow-y-auto rounded-sm border-1 border-stroke-input bg-bg-0 py-1 shadow-lg">
            {CLOCK_TIMES.map((t) => (
              <button key={t} type="button" role="option" aria-selected={t === value} onClick={() => { onPick(t); setOpen(false) }}
                className={cn('whitespace-nowrap px-3 py-1.5 text-left text-text-regular hover:bg-bg-1', t === value ? 'text-brand-primary' : 'text-text-title')}>{t}</button>
            ))}
          </span>
        </>
      )}
    </span>
  )
}

/**
 * A day. No availability frame draws a way to choose one (the dates in them
 * are fixed text), so this is the browser's own date field in the frames' box.
 */
export function DayPick({ value, onChange, label, className = 'h-[38px]' }: { value: string; onChange: (v: string) => void; label: string; className?: string }) {
  return (
    <input type="date" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className={cn('rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular text-text-title', className)} />
  )
}
