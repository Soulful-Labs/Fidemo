import { cn } from '../../lib/cn'
import { ChevronDown } from './icons'

export interface SelectFieldProps {
  label?: string
  value?: string
  placeholder: string
  onOpen: () => void
  error?: string
  className?: string
}

/**
 * An input-shaped button that opens a picker sheet (Industry, Education
 * Level, Select ID). Drawn like a text input with a chevron on the right.
 */
export default function SelectField({ label, value, placeholder, onOpen, error, className }: SelectFieldProps) {
  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label && <span className="text-text-regular text-text-subtitle">{label}</span>}
      <button
        type="button"
        onClick={onOpen}
        aria-label={label ?? placeholder}
        className={cn(
          'flex h-input w-full items-center justify-between gap-2 rounded-md border-1 bg-transparent px-4 text-left',
          error ? 'border-state-danger' : 'border-stroke-3',
        )}
      >
        <span className={cn('truncate text-body-regular', value ? 'text-text-title' : 'text-text-disabled')}>
          {value || placeholder}
        </span>
        <ChevronDown className="text-text-subtitle" />
      </button>
      {error && <span className="text-label text-state-danger">{error}</span>}
    </div>
  )
}
