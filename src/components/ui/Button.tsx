import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './icons'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
export type ButtonSize = 'lg' | 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /**
   * Fired instead of onClick when the button is disabled. Supplying it keeps the
   * button focusable and clickable (aria-disabled rather than the `disabled`
   * attribute) so a blocked action can explain itself on tap, e.g. a Reschedule
   * button that is out of retries. Global interaction rule 7.
   */
  onBlocked?: () => void
}

/** Heights come from the brief's layout constants: 48 primary, 38 secondary, 24 inline. */
const SIZES: Record<ButtonSize, string> = {
  lg: 'h-12 px-6 text-body-medium',
  md: 'h-[38px] px-5 text-text-medium',
  sm: 'h-6 px-3 text-label',
}

const ENABLED: Record<ButtonVariant, string> = {
  primary: 'bg-cta-primary text-cta-primaryText hover:bg-yellow-600',
  secondary: 'bg-cta-secondary text-cta-secondaryText hover:bg-yellow-900',
  tertiary: 'border-1 border-cta-tertiaryStroke text-text-title hover:bg-bg-2',
  danger: 'bg-state-danger text-text-title hover:opacity-90',
  ghost: 'text-cta-secondaryText hover:bg-bg-2',
}

const DISABLED: Record<ButtonVariant, string> = {
  primary: 'bg-bg-2 text-text-disabled',
  secondary: 'bg-bg-2 text-text-disabled',
  tertiary: 'border-1 border-cta-tertiaryStrokeDisabled text-text-disabled',
  danger: 'bg-bg-2 text-text-disabled',
  ghost: 'text-text-disabled',
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  onBlocked,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading
  // With onBlocked the button stays clickable so it can say why it is blocked.
  const explains = isDisabled && Boolean(onBlocked) && !loading

  return (
    <button
      type={type}
      disabled={isDisabled && !explains}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      onClick={explains ? () => onBlocked?.() : onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-sans whitespace-nowrap transition-colors',
        SIZES[size],
        isDisabled ? DISABLED[variant] : ENABLED[variant],
        fullWidth && 'w-full',
        isDisabled && 'cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
