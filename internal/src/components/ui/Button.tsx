import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'ghost'
export type ButtonSize = 'lg' | 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

/**
 * The "CTA Button" component, the most used instance in the file (782).
 * Measured at 1x:
 *
 * - primary: a vertical gradient yellow-300 to yellow-500 with a 1px
 *   yellow-100 highlight along the top and a 3px yellow-700 base (Login,
 *   Submit, Create, Save, Apply).
 * - secondary: flat cta-secondary (#fed592) with secondary text (Cancel in
 *   panels and dialogs, Reset, Mark as completed).
 * - tertiary: bg-0 with a 1px cta-tertiaryStroke ring (Cancel on pages, Copy).
 * - danger: the orange-red Restrict / Deactivate (#ea5a00 with a 3px
 *   #dc5500 base, bound to an sds variable on 2036:146119).
 * - success: the green Approve to Publish.
 *
 * Sizes: lg 48 (forms, dialogs, panel footers), md 38 (title bar, rows, the
 * "Icon Buttons" size), sm 32. Corners are Radius/M (12).
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'border-b-[3px] border-yellow-700 bg-linear-to-b from-yellow-300 via-yellow-400 via-15% to-yellow-500 border-t-1 border-t-yellow-100 text-cta-primaryText',
  secondary: 'bg-cta-secondary text-cta-secondaryText',
  tertiary: 'border-1 border-cta-tertiaryStroke bg-bg-0 text-text-title',
  danger: 'border-b-[3px] border-state-destructiveEdge bg-state-destructive text-bg-0',
  success: 'bg-state-success text-bg',
  ghost: 'text-text-title',
}
const DISABLED = 'cursor-not-allowed opacity-50'

const SIZE: Record<ButtonSize, string> = {
  lg: 'h-12 rounded-md px-5 text-body-medium',
  md: 'h-[38px] rounded-md px-4 text-text-medium',
  sm: 'h-8 rounded-sm px-3 text-text-medium',
}

export default function Button({
  variant = 'primary', size = 'lg', fullWidth, leftIcon, rightIcon, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button type={type} disabled={disabled}
      className={cn('inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-sans',
        SIZE[size], VARIANT[variant], fullWidth && 'w-full', disabled && DISABLED, className)}
      {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}

/** The 38px square "Icon Buttons": a 1px tertiary ring around a 20px icon (link, menu, bell, close). */
export function IconButton({ label, children, className, size = 38, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { label: string; children: ReactNode; size?: 28 | 32 | 38 }) {
  return (
    <button type="button" aria-label={label}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke bg-bg-0 text-text-title',
        size === 38 ? 'h-[38px] w-[38px]' : size === 32 ? 'h-8 w-8' : 'h-7 w-7', className)}
      {...rest}>
      {children}
    </button>
  )
}
