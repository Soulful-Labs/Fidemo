import { useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Eye, EyeOff } from './icons'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helper?: string
  leftIcon?: ReactNode
  /** Trailing content, e.g. a "Max" button. Replaced by the toggle on passwords. */
  rightSlot?: ReactNode
  multiline?: boolean
  rows?: number
  /** Shows a live character count, e.g. About Me. */
  maxLength?: number
  showCount?: boolean
}

export default function Input({
  label,
  error,
  helper,
  leftIcon,
  rightSlot,
  multiline = false,
  rows = 4,
  showCount = false,
  className,
  type = 'text',
  id,
  value,
  ...rest
}: InputProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && reveal ? 'text' : type
  const count = typeof value === 'string' ? value.length : 0

  const shell = cn(
    'flex items-center gap-2 rounded-md border-1 bg-bg-1 px-4 transition-colors',
    multiline ? 'h-auto py-3 items-start' : 'h-input',
    error ? 'border-state-danger' : 'border-stroke-3 focus-within:border-cta-primary',
  )

  const field =
    'w-full bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-disabled'

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={fieldId} className="text-text-medium text-text-subtitle">
          {label}
        </label>
      )}

      <div className={shell}>
        {leftIcon && <span className="text-text-disabled">{leftIcon}</span>}

        {multiline ? (
          <textarea
            id={fieldId}
            rows={rows}
            value={value}
            className={cn(field, 'resize-none', className)}
            {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input id={fieldId} type={resolvedType} value={value} className={cn(field, className)} {...rest} />
        )}

        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="text-text-disabled hover:text-text-body"
          >
            {reveal ? <EyeOff /> : <Eye />}
          </button>
        ) : (
          rightSlot
        )}
      </div>

      {(error || helper || showCount) && (
        <div className="flex items-start justify-between gap-2">
          <span className={cn('text-label', error ? 'text-state-danger' : 'text-text-body')}>
            {error || helper}
          </span>
          {showCount && rest.maxLength != null && (
            <span className="text-label text-text-disabled">
              {count}/{rest.maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
