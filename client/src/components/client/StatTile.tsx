import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type TileTint = 'yellow' | 'green' | 'purple' | 'blue' | 'none'
const TINT: Record<TileTint, string> = {
  yellow: 'bg-yellow-30', green: 'bg-bgAlt-1', purple: 'bg-purple-100/60', blue: 'bg-blue-100/60', none: 'bg-bg',
}

/** The five figures across the top of the Dashboard (826:85021). */
export default function StatTile({ label, value, icon, tint = 'none', className }: { label: string; value: string; icon?: ReactNode; tint?: TileTint; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border-1 border-stroke-input p-4', TINT[tint], className)}>
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="flex items-center gap-2">
        {icon && <span className="text-brand-primary">{icon}</span>}
        <span className="text-title-l text-text-title">{value}</span>
      </span>
    </div>
  )
}
