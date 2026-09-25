import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type TagTone = 'neutral' | 'type' | 'green' | 'yellow' | 'purple' | 'blue' | 'grey'

const TONES: Record<TagTone, string> = {
  neutral: 'border-1 border-stroke-3 text-text-subtitle',
  type: 'bg-bgAlt-2 text-text-subtitle [&>svg]:text-brand-secondary',
  green: 'bg-bgAlt-2 text-green-700',
  yellow: 'bg-yellow-30 text-yellow-700',
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  grey: 'bg-bg-2 text-text-subtitle',
}

/**
 * The pill used for study type, status, tier and every inline chip.
 *
 * Measured off the Tag component (1777:96825): 28px tall, **8px** of side
 * padding, a 16px icon then a 6px gap, and 14px text in a 20px line box.
 * It was drawn with 12px padding, which made every chip in the build wider
 * than the frame and pushed whatever sat beside it along.
 */
export default function Tag({
  tone = 'neutral', icon, children, className,
}: { tone?: TagTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-text-regular', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  )
}
