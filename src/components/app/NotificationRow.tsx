import type { ReactNode } from 'react'
import Button from '../ui/Button'
import { ChevronRight } from '../ui/icons'
import { cn } from '../../lib/cn'
import { timeAgo } from '../../lib/format'

export interface NotificationRowProps {
  title: string
  body: string
  at: string
  read?: boolean
  icon?: ReactNode
  /** Green icon tile for money and rewards, yellow for everything else. */
  tone?: 'yellow' | 'green'
  /** Optional action, e.g. "Schedule Now" (PRD 11). */
  actionLabel?: string
  onAction?: () => void
  /** PRD 11 type 1 is the only one drawn with a second action. */
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  /** Rows without an action still route to the related screen. */
  onOpen?: () => void
}

/**
 * One row in Notifications (PRD 5.3, Figma 1279:83801): a 44px tinted icon
 * tile, bold title, body, timestamp and the optional action buttons.
 */
export default function NotificationRow({
  title,
  body,
  at,
  read = false,
  icon,
  tone = 'yellow',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onOpen,
}: NotificationRowProps) {
  return (
    <div className={cn('flex gap-4 border-b-1 border-stroke-2 px-3 py-4', !read && 'bg-bg-1')}>
      <div
        className={cn(
          'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
          tone === 'green' ? 'bg-green-900/50 text-brand-secondary' : 'bg-yellow-1000/60 text-brand-primary',
        )}
      >
        {icon}
        {!read && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-state-danger" aria-label="Unread" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button type="button" onClick={onOpen} className="flex flex-col gap-1 text-left">
          <span className="text-body-medium text-text-title">{title}</span>
          <span className="text-body-regular text-text-subtitle">{body}</span>
        </button>
        <span className="text-text-regular text-text-body">{timeAgo(at)}</span>

        {actionLabel && onAction && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="md" variant="secondary" onClick={onAction}>{actionLabel}</Button>
            {secondaryActionLabel && onSecondaryAction && (
              <Button size="md" variant="tertiary" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
