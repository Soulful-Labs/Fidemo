import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/ui/Button'
import { Checkbox, Chip } from '../../../components/ui/controls'
import { ChevronDown, SparkleIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

/** A block of a step (2325:214085): the green line icon in a 20px gutter, the heading and its line, then the fields at +28. */
export function Section({ icon, title, sub, children }: { icon: ReactNode; title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="flex gap-2 border-b-1 border-stroke-1 py-4 last:border-b-0">
      <span className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-body-medium text-text-title">{title}</h2>
          {sub && <p className="text-text-regular text-text-subtitle">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

/** A field's label over its control, as the Audience inputs are drawn. */
export function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      {children}
    </div>
  )
}

/**
 * A dropdown of checkboxes with the picks as chips under it (Audience,
 * 2325:214318): "2 ethnicities selected  •  Select ethnicity...". `all` is
 * the "any" word, which clears the rest. Nothing ticked means any.
 */
export function MultiPick({ label, options, picked, onChange, prompt, count, all, chips = true }: {
  label: string; options: readonly string[]; picked: string[]; onChange: (v: string[]) => void
  prompt: string; count?: (n: number) => string; all?: string; chips?: boolean
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  const shown = picked.filter((p) => p !== all)
  const flip = (o: string) => onChange(o === all ? [o] : picked.includes(o) ? picked.filter((x) => x !== o) : [...picked.filter((x) => x !== all), o])
  const text = all && (!shown.length || picked.includes(all)) ? all : shown.length && count ? `${count(shown.length)}  •  ${prompt}` : shown.length ? shown.join(', ') : prompt
  return (
    <Labelled label={label}>
      <div ref={box} className="relative">
        <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-left text-text-regular text-text-title">
          <span className={cn('truncate', !shown.length && !all && 'text-text-body')}>{text}</span>
          <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" aria-multiselectable="true" className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 flex max-h-72 flex-col gap-1 overflow-auto rounded-md border-1 border-stroke-input bg-bg-0 p-2">
            {(all ? [all, ...options.filter((o) => o !== all)] : options).map((o) => (
              <div key={o} role="option" aria-selected={picked.includes(o)} className="rounded-sm px-2 py-1.5 hover:bg-bg-1">
                <Checkbox checked={picked.includes(o)} onChange={() => flip(o)} label={<span className="text-text-regular text-text-title">{o}</span>} />
              </div>
            ))}
          </div>
        )}
      </div>
      {chips && shown.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {shown.map((v) => <Chip key={v} onRemove={() => onChange(picked.filter((x) => x !== v))}>{v}</Chip>)}
        </div>
      )}
    </Labelled>
  )
}

/** "Generate with AI" (Audience and Screener): what it does, and the button that does it. */
export function AiCard({ line, action, onAction, children }: { line: string; action?: string; onAction?: () => void; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-text-medium text-text-title"><SparkleIcon className="h-5 w-5 text-brand-primary" />Generate with AI</p>
          <p className="text-text-regular text-text-subtitle">{line}</p>
        </div>
        {action && <Button variant="secondary" size="md" leftIcon={<SparkleIcon className="h-4 w-4" />} onClick={onAction}>{action}</Button>}
      </div>
      {children}
    </div>
  )
}

/** The orange slider drawn on Durations and Incentive Payments: a grey track, the part up to the value in brand-primary, a ringed thumb. The real range input sits on top, unseen, so keys and screen readers work. */
export function Range({ value, min, max, step = 1, label, disabled, onChange }: { value: number; min: number; max: number; step?: number; label: string; disabled?: boolean; onChange?: (v: number) => void }) {
  const at = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <span className={cn('relative flex h-4 items-center', disabled && 'opacity-60')}>
      <span className="absolute inset-x-0 h-1.5 rounded-full bg-stroke-input" />
      <span className="absolute left-0 h-1.5 rounded-full bg-brand-primary" style={{ width: `${at}%` }} />
      <span className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-4 border-brand-primary bg-bg-0" style={{ left: `${at}%` }} />
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label}
        onChange={(e) => onChange?.(Number(e.target.value))} className="absolute inset-0 h-4 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
    </span>
  )
}
