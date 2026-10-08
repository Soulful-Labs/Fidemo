import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon, CloseIcon } from './icons'

/**
 * Toggle, measured on Create Profile (2062:201923): a 40 x 24 track with a
 * 3px inset 18px knob. Off: stroke-input track, subtitle knob on the left.
 * On: brand-primary track, near-white (bg-1) knob on the right.
 */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange?.(!checked)}
        className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-primary' : 'bg-stroke-input')}>
        <span className={cn('absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all', checked ? 'left-[19px] bg-bg-1' : 'left-[3px] bg-text-subtitle')} />
      </button>
      {label && <span className="text-body-regular text-text-title">{label}</span>}
    </label>
  )
}

/** "Checkbox-default": a 16px box with Radius/XS, stroke-input edge; checked fills brand-secondary with a white tick. */
export function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span aria-hidden="true" className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border-1',
        checked ? 'border-brand-secondary bg-brand-secondary text-bg' : 'border-stroke-input bg-bg-0')}>
        {checked && <CheckIcon className="h-3 w-3" strokeWidth={2.5} />}
      </span>
      {label && <span className="text-body-regular text-text-title">{label}</span>}
    </label>
  )
}

/**
 * Radio, as on the Review screener answers (1984:114217): an 18px ring in
 * text-body; selected, the ring turns brand-secondary with a 10px dot.
 */
export function Radio({ checked, onChange, label, name, disabled }: { checked: boolean; onChange?: () => void; label?: ReactNode; name?: string; disabled?: boolean }) {
  return (
    <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
      <input type="radio" name={name} className="sr-only" checked={checked} disabled={disabled} onChange={() => onChange?.()} />
      <span aria-hidden="true" className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-1.5', checked ? 'border-brand-secondary' : 'border-text-body')}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-brand-secondary" />}
      </span>
      {label && <span className="text-text-regular text-text-title">{label}</span>}
    </label>
  )
}

/**
 * Selection chips (Advanced Filters: "Physician", "Healthcare"): bgAlt-2
 * pills, Radius/S, 14px text, with a remove cross.
 */
export function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-bgAlt-2 px-2.5 text-text-regular text-text-title">
      {children}
      {onRemove && (
        <button type="button" aria-label={`Remove ${typeof children === 'string' ? children : ''}`} onClick={onRemove} className="text-text-subtitle">
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )
}

/**
 * Option tiles ("Input-selection tabs", 137 x 48, Filters popup): a 1px
 * tertiary-stroke tile; selected is cta-secondary with no edge.
 */
export function OptionTile({ selected, onClick, children }: { selected?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={cn('flex h-12 items-center justify-center rounded-md px-3 text-body-regular text-text-title',
        selected ? 'bg-cta-secondary' : 'border-1 border-cta-tertiaryStroke bg-bg-0')}>
      {children}
    </button>
  )
}
