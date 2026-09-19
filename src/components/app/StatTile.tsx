import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface StatTileProps {
  /** "Wallet Balance", "Studies In Review" */
  label: string
  /** "$624.48", "128" */
  value: string
  /** "+$260" — green when positive, never red unless something is wrong. */
  delta?: string
  icon?: ReactNode
  onClick?: () => void
  alt?: boolean
}

/** The dashboard overview tiles (PRD 5.1). Tappable ones route; see the brief. */
export default function StatTile({ label, value, delta, icon, onClick, alt = false }: StatTileProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border-1 border-stroke-2 p-4 text-left',
        alt ? 'bg-bgAlt-2' : 'bg-bg-1',
        onClick && 'transition-colors hover:border-stroke-3',
      )}
    >
      <div className="flex items-center gap-2 text-text-body">
        {icon}
        <span className="text-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-title-m text-text-title">{value}</span>
        {delta && <span className="text-label text-state-success">{delta}</span>}
      </div>
    </Wrapper>
  )
}
