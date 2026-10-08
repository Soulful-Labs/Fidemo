import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDown, EyeIcon, SearchIcon } from './icons'

/**
 * The "Input Field" / "Email Input" / "Password Input" components. Measured
 * on Sign In (1849:112091) and Create Profile (2062:201923): the label is
 * Lables (14, subtitle) in a 20px line, 4px above a 48px box; the box is bg-0
 * with a 1px stroke-input edge and Radius/M corners; text and placeholder are
 * Body 16, the placeholder text-body; 12px inside.
 */
const BOX = 'flex h-12 w-full items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-body-regular text-text-title'
const FIELD = 'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-body'

export function Field({ label, htmlFor, children, helper, error, className }: {
  label?: string; htmlFor?: string; children: ReactNode; helper?: ReactNode; error?: string; className?: string
}) {
  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label && <label htmlFor={htmlFor} className="text-text-regular text-text-subtitle">{label}</label>}
      {children}
      {error ? <p className="text-label text-state-danger">{error}</p> : helper}
    </div>
  )
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  helper?: ReactNode
  error?: string
  boxClassName?: string
  /** md 48 (forms, toolbars); sm 38 with 14px text and Radius/S (inside dialogs, 2036:146119). */
  size?: 'md' | 'sm'
}

const SM = 'h-[38px] rounded-sm text-text-regular'

export default function Input({ label, leftIcon, rightSlot, helper, error, className, boxClassName, id, size = 'md', ...rest }: InputProps) {
  const fid = id ?? (label ? `f-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined)
  return (
    <Field label={label} htmlFor={fid} helper={helper} error={error} className={className}>
      <span className={cn(BOX, size === 'sm' && SM, error && 'border-state-danger', boxClassName)}>
        {leftIcon}
        <input id={fid} className={FIELD} {...rest} />
        {rightSlot}
      </span>
    </Field>
  )
}

/** Password Input: the same box with the eye on the right, which shows and hides what is typed. */
export function PasswordInput(props: Omit<InputProps, 'type' | 'rightSlot'>) {
  const [shown, setShown] = useState(false)
  const icon = props.size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'
  return (
    <Input {...props} type={shown ? 'text' : 'password'}
      rightSlot={
        <button type="button" aria-label={shown ? 'Hide password' : 'Show password'} onClick={() => setShown((s) => !s)} className="-mr-1 text-text-subtitle">
          <EyeIcon className={icon} />
        </button>
      } />
  )
}

/** The search field on list toolbars: the 20px magnifier 12px in, then the placeholder. */
export function SearchInput(props: Omit<InputProps, 'leftIcon'>) {
  return <Input {...props} leftIcon={<SearchIcon className="h-6 w-6 shrink-0 text-text-subtitle" />} />
}

/** Multi-line message box (Create Ticket, Restriction Statement): same edge, 12px padding, top-aligned. */
export function TextArea({ label, className, rows = 3, size = 'md', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; size?: 'md' | 'sm' }) {
  return (
    <Field label={label} className={className}>
      <textarea rows={rows} {...rest}
        className={cn('w-full resize-none rounded-md border-1 border-stroke-input bg-bg-0 px-3 py-3 text-body-regular text-text-title outline-none placeholder:text-text-body', size === 'sm' && 'rounded-sm py-2.5 text-text-regular')} />
    </Field>
  )
}

/**
 * The dropdown field ("All Studies", "Sort: Recent First", "Account Status"):
 * the input box with a 20px chevron on the right. A native select underneath,
 * so it works with no extra code.
 */
export function Select({ label, value, onChange, options, placeholder, className, boxClassName }: {
  label?: string; value?: string; onChange?: (v: string) => void; options: string[]; placeholder?: string
  className?: string; boxClassName?: string
}) {
  return (
    <Field label={label} className={className}>
      <span className={cn(BOX, 'relative', boxClassName)}>
        <select value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} aria-label={label ?? placeholder}
          className={cn(FIELD, 'cursor-pointer appearance-none pr-6', !value && 'text-text-body')}>
          {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-5 w-5 text-text-title" />
      </span>
    </Field>
  )
}
