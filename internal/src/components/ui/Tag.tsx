import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type TagTone = 'neutral' | 'outline' | 'count' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

/**
 * The "Tag" component (776 instances, 28 tall): a Radius/Full pill with 10px
 * sides and 14px text. Tones as the frames draw them: success is the green
 * "Verified" / "Active" (#14ae5c on #d3f8d7), warning the amber "In Review" /
 * "Processing", danger the red "Rejected" / "No Show", neutral the grey
 * counts and "Recruiting", outline the hairline "Healthcare".
 */
const TONE: Record<TagTone, string> = {
  neutral: 'bg-bg-2 text-text-title',
  outline: 'border-1 border-stroke-input bg-bg-0 text-text-subtitle',
  // The Tag's default look, as on the Dashboard group headers ("16", "264"): a stroke-3 ring, no fill.
  count: 'border-1 border-stroke-3 text-text-subtitle',
  success: 'bg-state-successBg text-state-success',
  warning: 'bg-yellow-50 text-brand-primary',
  danger: 'bg-state-warningBg text-state-danger',
  info: 'bg-bgAlt-2 text-text-subtitle',
  brand: 'bg-green-alpha15 text-brand-secondary',
}

export default function Tag({ tone = 'neutral', icon, children, className }: { tone?: TagTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-text-regular', TONE[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

/** The small count badge on nav rows and headings ("2", "7", "16"): 24 tall, Radius/Full. */
export function CountBadge({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'outline' }) {
  return (
    <span className={cn('inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-text-medium',
      tone === 'brand' ? 'bg-green-alpha15 text-brand-secondary' : 'border-1 border-stroke-input text-text-title')}>{children}</span>
  )
}

/** Avatars: a photo or an initial, Radius/S, at the sizes drawn (24 in table rows, 40 in the account card, 48 in profile cards, 64 on Create Profile). */
export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: 24 | 32 | 40 | 48 | 64; className?: string }) {
  const box = { 24: 'h-6 w-6 rounded-xs text-label', 32: 'h-8 w-8 rounded-sm text-text-medium', 40: 'h-10 w-10 rounded-sm text-body-medium', 48: 'h-12 w-12 rounded-sm text-body-medium', 64: 'h-16 w-16 rounded-md text-title-m' }[size]
  return src
    ? <img src={src} alt={name} className={cn('shrink-0 object-cover', box, className)} />
    : <span aria-label={name} className={cn('flex shrink-0 items-center justify-center bg-bg-2 text-text-subtitle', box, className)}>{name.slice(0, 1)}</span>
}
