import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Check } from './icons'

export interface CheckboxProps {
  checked: boolean
  onChange: (next: boolean) => void
  label?: ReactNode
  disabled?: boolean
  error?: boolean
}

export default function Checkbox({ checked, onChange, label, disabled, error }: CheckboxProps) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border-1 transition-colors',
          checked ? 'border-cta-primary bg-cta-primary text-cta-primaryText' : 'bg-bg-1',
          !checked && (error ? 'border-state-danger' : 'border-cta-tertiaryStroke'),
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {checked && <Check className="h-4 w-4" />}
      </button>
      {label && (
        <label htmlFor={id} className="text-text-regular text-text-body">
          {label}
        </label>
      )}
    </div>
  )
}
