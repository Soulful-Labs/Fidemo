import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ChevronRight } from '../ui/icons'

export type TileTint = 'yellow' | 'green' | 'purple' | 'blue' | 'none'

export interface StatTileProps {
  /** "Wallet Balance", "Studies In Review" */
  label: string
  /** "$624.48", "128" */
  value: string
  /**
   * "+$260". Green when positive. A fall is shown in the neutral body colour,
   * not red: red is reserved for things that are wrong, and earning less this
   * month is not an error.
   */
  delta?: string
  icon?: ReactNode
  /** The coloured fade at the top of the tile, as drawn on the dashboard. */
  tint?: TileTint
  onClick?: () => void
  alt?: boolean
}

const TINT: Record<TileTint, string> = {
  yellow: 'bg-yellow-fade text-brand-primary',
  green: 'bg-green-fade text-brand-secondary',
  purple: 'bg-purple-fade text-accent-purple',
  blue: 'bg-blue-fade text-accent-blue',
  none: '',
}

/** The dashboard overview tiles (PRD 5.1, Figma 918:69716). Tappable ones route. */
export default function StatTile({ label, value, delta, icon, tint = 'none', onClick, alt = false }: StatTileProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex w-full flex-col gap-3 rounded-lg p-3 text-left',
        alt ? 'bg-bgAlt-2' : 'bg-bg-1',
        TINT[tint],
        onClick && 'transition-opacity hover:opacity-90',
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-text-regular text-text-subtitle">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-title-l text-text-title">{value}</span>
        {delta && (
          <span className={cn('text-body-medium', delta.startsWith('-') ? 'text-text-body' : 'text-state-success')}>
            {delta}
          </span>
        )}
        {onClick && !delta && <ChevronRight className="text-text-title" />}
      </div>
    </Wrapper>
  )
}
