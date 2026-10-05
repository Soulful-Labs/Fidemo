import type { ReactNode } from 'react'
import Button from '../ui/Button'
import { usePlayful } from '../../lib/playful'

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
  const playful = usePlayful()
  return (
    <div data-stagger className={playful ? 'relative flex flex-col items-center gap-3 px-4 py-6 text-center' : 'flex flex-col items-center gap-3 px-4 py-6 text-center'}>
      {/* PLAYFUL: something always alive behind an empty list: a breathing glow, drifting motes, blinking stars. */}
      {playful && (
        <span data-decor aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="pf-breathe absolute left-1/2 top-1/2 h-24 w-24 rounded-full" />
          <span className="pf-drift absolute left-[18%] top-[30%] h-1.5 w-1.5 rounded-full bg-brand-secondary" />
          <span className="pf-drift absolute right-[20%] top-[55%] h-1 w-1 rounded-full bg-brand-primary [animation-delay:-2s]" />
          <span className="pf-drift absolute left-[30%] bottom-[18%] h-1 w-1 rounded-full bg-accent-blue [animation-delay:-4s]" />
          <span className="pf-blink absolute right-[28%] top-[22%] text-brand-primary"><svg viewBox="0 0 10 10" width="10" height="10"><path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" fill="currentColor" /></svg></span>
          <span className="pf-blink absolute left-[24%] top-[62%] text-accent-purple [animation-delay:-1.3s]"><svg viewBox="0 0 10 10" width="10" height="10"><path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" fill="currentColor" /></svg></span>
        </span>
      )}
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
