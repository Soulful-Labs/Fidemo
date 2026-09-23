import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type TagTone = 'neutral' | 'green' | 'yellow' | 'purple' | 'blue' | 'grey'

const TONES: Record<TagTone, string> = {
  neutral: 'border-1 border-cta-tertiaryStroke bg-bg text-text-subtitle',
  green: 'bg-bgAlt-2 text-green-700',
  yellow: 'bg-yellow-30 text-yellow-700',
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  grey: 'bg-bg-2 text-text-subtitle',
}

/** The pill used for study type, status, tier and every inline chip. */
export default function Tag({
  tone = 'neutral', icon, children, className,
}: { tone?: TagTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-text-regular', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  )
}
