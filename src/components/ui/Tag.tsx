import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'

export type TagTone =
  | 'neutral'
  | 'yellow'
  | 'green'
  | 'danger'
  | 'blue'
  | 'purple'
  | 'gold'
  | 'platinum'
  | 'silver'

export interface TagProps {
  tone?: TagTone
  size?: 'sm' | 'md'
  icon?: ReactNode
  children: ReactNode
  /** Renders a remove affordance, used by filter chips. */
  onRemove?: () => void
  className?: string
}

/**
 * `danger` is reserved for things that are wrong (No Show, Rejected) per the
 * brief's colour rule. Never use it for a neutral or informational state.
 */
const TONES: Record<TagTone, string> = {
  neutral: 'bg-bg-2 text-text-body border-stroke-3',
  yellow: 'bg-yellow-1000 text-brand-primary border-yellow-700',
  green: 'bg-green-900 text-brand-secondary border-green-700',
  danger: 'bg-state-dangerBg text-state-danger border-state-danger',
  blue: 'bg-bg-2 text-accent-blue border-stroke-3',
  purple: 'bg-bg-2 text-accent-purple border-stroke-3',
  gold: 'bg-bg-2 text-tier-gold border-tier-gold',
  platinum: 'bg-bg-2 text-tier-platinum border-tier-platinum',
  silver: 'bg-bg-2 text-tier-silver border-tier-silver',
}

const SIZES = {
  sm: 'h-6 px-2 gap-1 text-label',
  md: 'h-[30px] px-3 gap-1.5 text-text-medium',
} as const

export default function Tag({
  tone = 'neutral',
  size = 'sm',
  icon,
  children,
  onRemove,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-1 whitespace-nowrap',
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {icon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="ml-1 opacity-70 hover:opacity-100"
        >
          <Close className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
