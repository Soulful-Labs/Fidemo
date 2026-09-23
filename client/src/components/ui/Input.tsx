import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helper?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  multiline?: boolean
  rows?: number
}

/** The 44px field drawn on every form: label above, hairline box, helper under. */
export default function Input({
  label, helper, leftIcon, rightSlot, multiline, rows = 4, className, ...rest
}: InputProps) {
  const shell = cn(
    'flex w-full items-center gap-2 rounded-sm border-1 border-stroke-input bg-bg px-3 text-body-regular text-text-title',
    multiline ? 'py-3' : 'h-input', className,
  )
  const field = 'min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-body'
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label && <span className="text-text-regular text-text-subtitle">{label}</span>}
      <span className={shell}>
        {leftIcon}
        {multiline
          ? <textarea rows={rows} className={cn(field, 'resize-none')} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
          : <input className={field} {...rest} />}
        {rightSlot}
      </span>
      {helper && <span className="text-label text-text-body">{helper}</span>}
    </label>
  )
}
