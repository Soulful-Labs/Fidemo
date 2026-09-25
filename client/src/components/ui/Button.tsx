import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size?: 'md' | 'row' | 'sm' | 'none'
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

/**
 * The four button fills drawn across the client file: the yellow CTA
 * ("Create Study", "Continue", "Publish Study"), the pale yellow secondary
 * ("Invite To Study", "Save To Micropanel"), the white tertiary with a hairline
 * ("View Profile", "Cancel") and the red destructive ("Delete").
 */
const ENABLED = {
  primary: 'border-b-2 border-yellow-700 bg-gradient-to-b from-[#fdc86f] to-[#fca311] text-cta-primaryText hover:to-yellow-700',
  secondary: 'bg-cta-secondary text-cta-secondaryText hover:bg-yellow-300',
  tertiary: 'border-1 border-cta-tertiaryStroke bg-bg text-text-title hover:bg-bg-1',
  danger: 'bg-[#e33a38] text-white hover:opacity-90',
  ghost: 'text-text-subtitle hover:text-text-title',
}
const DISABLED = {
  primary: 'bg-bg-4 text-text-disabled',
  secondary: 'bg-bg-4 text-text-disabled',
  tertiary: 'border-1 border-cta-tertiaryStrokeDisabled text-text-disabled',
  danger: 'bg-bg-4 text-text-disabled',
  ghost: 'text-text-disabled',
}
/**
 * Measured off the CTA Button component. The 38px button (1627:95960) puts
 * its 20px icon 12px in, then 4px, then 14px text; the 48px one (1627:96076)
 * puts a 20px icon 20px in, then 4px, then 16px text. Every size was drawn
 * with 16px of padding and an 8px gap, which made each button wider than the
 * frame and pushed whatever followed it along the row.
 */
const SIZES = {
  md: 'h-btn rounded-sm px-4 text-text-medium',
  row: 'h-[38px] rounded-sm px-3 text-text-medium',
  sm: 'h-btn-sm rounded-sm px-3 text-text-medium',
  none: 'rounded-sm px-4 text-text-medium',
}

export default function Button({
  variant = 'primary', size = 'md', fullWidth, leftIcon, rightIcon, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1 whitespace-nowrap font-sans transition-colors',
        SIZES[size], disabled ? DISABLED[variant] : ENABLED[variant],
        fullWidth && 'w-full', disabled && 'cursor-not-allowed', className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
