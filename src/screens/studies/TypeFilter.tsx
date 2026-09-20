import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

export interface TypeFilterProps {
  value: string
  options: { key: string; label: string }[]
  onChange: (key: string) => void
}

/**
 * The small "All ⌄" dropdown next to the My Studies search (Figma
 * 1279:90892): a select-shaped button opening a menu of options.
 */
export default function TypeFilter({ value, options, onChange }: TypeFilterProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.key === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-input w-32 items-center justify-between gap-2 rounded-md border-1 border-stroke-3 px-4 text-body-regular text-text-title"
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown className="shrink-0" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-full z-30 mt-1 w-40 rounded-md bg-bg-2 p-1">
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                role="option"
                aria-selected={option.key === value}
                onClick={() => { onChange(option.key); setOpen(false) }}
                className={cn(
                  'w-full rounded-sm px-3 py-2 text-left text-text-regular',
                  option.key === value ? 'bg-yellow-1000/50 text-brand-primary' : 'text-text-subtitle hover:text-text-title',
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
