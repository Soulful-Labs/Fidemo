import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type TileTint = 'yellow' | 'green' | 'purple' | 'blue' | 'none'

/** The frame fades each tile from its tint at the top to the page below it. */
const TINT: Record<TileTint, string> = {
  yellow: 'from-yellow-40/50', green: 'from-green-50/50',
  purple: 'from-purple-100/50', blue: 'from-blue-100/50', none: 'from-bg-1',
}
const BADGE: Record<TileTint, string> = {
  yellow: 'bg-yellow-40', green: 'bg-green-50', purple: 'bg-purple-100', blue: 'bg-blue-100', none: 'bg-bg-1',
}
const ACCENT: Record<TileTint, string> = {
  yellow: 'text-brand-primary', green: 'text-brand-secondary',
  purple: 'text-purple-600', blue: 'text-blue-600', none: 'text-text-subtitle',
}

/** The five figures across the top of the Dashboard (826:85021). */
export default function StatTile({
  label, value, icon, tint = 'none', className,
}: { label: string; value: string; icon?: ReactNode; tint?: TileTint; className?: string }) {
  return (
    <div className={cn('flex h-[84px] flex-col gap-2 rounded-lg border-1 border-stroke-1 bg-gradient-to-b to-transparent p-3',
      TINT[tint], className)}>
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="flex items-center gap-3">
        {icon && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full [&>svg]:h-[18px] [&>svg]:w-[18px]',
            BADGE[tint], ACCENT[tint])}>{icon}</span>
        )}
        <span className="text-title-l text-text-title">{value}</span>
      </span>
    </div>
  )
}
