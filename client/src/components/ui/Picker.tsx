import { useState } from 'react'
import Select from './Select'
import { cn } from '../../lib/cn'

/**
 * A Select that opens the options behind it.
 *
 * The Create flow drew a dozen of these and none of them opened; picking a
 * country, a gender, an education level or an age range did nothing. One
 * component so every one of them behaves the same.
 */
export default function Picker({
  value, options, onPick, multiple, picked, h, className, label,
}: {
  /** What the closed control reads. */
  value: string
  options: string[]
  onPick: (v: string) => void
  /** A multiple picker keeps the list open and ticks what is already chosen. */
  multiple?: boolean
  picked?: string[]
  h?: string
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Select label={label} value={value} h={h} className={className} onClick={() => setOpen((o) => !o)} />
      {open && (
        <>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 cursor-default" />
          {/* The same menu as every other dropdown (22 Oct 2026, Figma's dropdown as CheckPicker draws it): a rounded
              panel with the menu shadow, 38px rows, the chosen one on yellow at 20%. */}
          <div className="absolute left-0 right-0 top-full z-30 mt-1 flex max-h-[215px] flex-col gap-0.5 overflow-y-auto rounded-lg bg-bg-0 p-[11px] shadow-menu">
            {options.map((o) => {
              const on = multiple ? (picked ?? []).includes(o) : o === value || value.endsWith(` ${o}`)
              return (
                <button key={o} type="button"
                  onClick={() => { onPick(o); if (!multiple) setOpen(false) }}
                  className={cn('flex h-[38px] w-full shrink-0 items-center gap-2 rounded-md px-3 text-left text-body-regular text-text-title transition-colors',
                    on ? 'bg-yellow-alpha20' : 'hover:bg-bg-1')}>
                  {multiple && (
                    <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-none border-1',
                      on ? 'border-cta-primary bg-cta-primary' : 'border-cta-tertiaryStroke')} />
                  )}
                  {o}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
