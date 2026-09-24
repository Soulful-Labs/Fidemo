import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * A Create form section: the green glyph hangs in a 20px gutter and the copy
 * and fields line up in the column beside it (1622:81504, 1622:81615).
 */
export function Section({ icon, title, sub, children, className, headPad = 'pb-2.5', pad = 'py-[15px]', titleLead = '' }: {
  icon: ReactNode; title: string; sub: string; children: ReactNode
  className?: string; headPad?: string; pad?: string; titleLead?: string
}) {
  return (
    <section className={cn('flex border-b-1 border-stroke-1 last:border-b-0 px-2', pad, className)}>
      <span className="w-5 shrink-0 text-brand-secondary">{icon}</span>
      <div className="flex-1 pr-[10px]">
        <div className={cn('flex flex-col gap-0.5', headPad)}>
          <h2 className={cn('text-title-s text-text-title', titleLead)}>{title}</h2>
          {sub && <p className="text-text-regular text-text-subtitle">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

/** A labelled box: the label above, the value or placeholder inside it. */
export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-text-regular text-text-subtitle">{label}</span>
      {children}
    </label>
  )
}

/** The plain text box the Create forms are full of. */
export function TextBox({ value, placeholder, onChange, className }: {
  value?: string; placeholder?: string; onChange?: (v: string) => void; className?: string
}) {
  return (
    <input value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)}
      className={cn('h-input w-full rounded-sm border-1 border-stroke-input bg-bg px-4 text-body-regular text-text-title placeholder:text-text-body', className)} />
  )
}

/** A removable chip: the selected countries and age ranges sit in these. */
export function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-1 px-3 text-text-regular text-text-title">
      {children}
      <button type="button" aria-label="Remove" onClick={onRemove} className="text-text-body hover:text-text-title">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}

/** One bar of the tier distribution in the forecast. */
export function TierBar({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-text-regular text-text-subtitle">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-3">
        <span className="block h-full rounded-full" style={{ width: `${value}%`, background: colour }} />
      </span>
      <span className="w-10 shrink-0 text-right text-text-regular text-text-subtitle">{value}%</span>
    </div>
  )
}
