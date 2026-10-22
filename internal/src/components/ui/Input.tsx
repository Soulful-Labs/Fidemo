import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDown, EyeIcon, SearchIcon } from './icons'
import { MenuItem, useMenu } from './Dropdown'

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
 * The dropdown field ("All Studies", "Account Status", "Tier: All"): the
 * input box with a 20px chevron, opening the menu Figma draws for every
 * dropdown (22 Oct 2026, Dropdown menu Item 2368:68734): a white panel of 38px
 * rows, the chosen one on the brand yellow at 20%. It replaced a native select.
 * `size="sm"` is the 38px, 14px one on the Recruited toolbar (1952:77242).
 */
export function Select({ label, value, onChange, options, placeholder, className, boxClassName, size = 'md' }: {
  label?: string; value?: string; onChange?: (v: string) => void; options: string[]; placeholder?: string
  className?: string; boxClassName?: string; size?: 'md' | 'sm'
}) {
  const { open, setOpen, box } = useMenu()
  return (
    <Field label={label} className={className}>
      <div ref={box} className="relative">
        <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label ?? placeholder} onClick={() => setOpen((o) => !o)}
          className={cn(BOX, 'relative w-full cursor-pointer text-left', size === 'sm' && SM, boxClassName)}>
          <span className={cn(FIELD, 'flex items-center truncate pr-6', !value && 'text-text-body')}>{value || placeholder || ''}</span>
          <ChevronDown className={cn('pointer-events-none absolute right-3 h-5 w-5 text-text-title transition-transform duration-150', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 flex max-h-72 flex-col overflow-auto [&>*]:shrink-0 rounded-md border-1 border-stroke-input bg-bg-0 py-1 shadow-menu">
            {options.map((o) => <MenuItem key={o} on={o === value} onClick={() => { onChange?.(o); setOpen(false) }}>{o}</MenuItem>)}
          </div>
        )}
      </div>
    </Field>
  )
}
