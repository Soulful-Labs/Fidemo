import type { ReactNode } from 'react'
import Button from '../ui/Button'

export interface EmptyStateProps {
  /** Exact PRD copy where it gives it, e.g. "No payouts made yet!". */
  title: string
  body?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

/**
 * Every list needs one: Saved, Drafts, Applied, History, Notifications, Payouts, Referrals, Tickets.
 * Its lines rise in one after another, and the title drifts gently while it waits.
 */
export default function EmptyState({ title, body, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div data-stagger className="flex flex-col items-center gap-3 px-4 py-6 text-center">
      {icon && (
        <div data-idle className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-2 text-text-disabled">
          {icon}
        </div>
      )}
      {/* Breathes gently while the list is empty, so it reads as waiting, not broken. */}
      <p className="text-body-large text-text-title"><span data-idle className="inline-block">{title}</span></p>
      {body && <p className="text-text-regular text-text-body">{body}</p>}
      {actionLabel && onAction && (
        <Button size="md" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
