import type { ReactNode } from 'react'
import Button from '../ui/Button'
import { cn } from '../../lib/cn'
import { timeAgo } from '../../lib/format'

export interface NotificationRowProps {
  title: string
  body: string
  at: string
  read?: boolean
  icon?: ReactNode
  /** Optional action, e.g. "Schedule Now" (PRD 11). */
  actionLabel?: string
  onAction?: () => void
  /** Rows without an action still route to the related screen. */
  onOpen?: () => void
}

/** One row in Notifications (PRD 5.3). 24 types, each with optional action. */
export default function NotificationRow({
  title,
  body,
  at,
  read = false,
  icon,
  actionLabel,
  onAction,
  onOpen,
}: NotificationRowProps) {
  return (
    <div
      className={cn(
        'flex gap-3 border-b-1 border-stroke-2 px-4 py-4',
        !read && 'bg-bg-1',
      )}
    >
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-2 text-brand-primary">
        {icon}
        {!read && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cta-primary" aria-label="Unread" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={onOpen}
          className="flex flex-col gap-1 text-left"
        >
          <span className={cn('text-text-large', read ? 'text-text-subtitle' : 'text-text-title')}>
            {title}
          </span>
          <span className="text-text-regular text-text-body">{body}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-label text-text-disabled">{timeAgo(at)}</span>
          {actionLabel && onAction && (
            <Button size="sm" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
