import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The 460px centred dialog: Delete Study? (1726:77088), Pause Study
 * Participation? (1713:144170), Logout, Mark as solved? and the success
 * dialogs. The frame draws the body in a padded block, a hairline, then the
 * buttons: 40px tall, side by side, each taking half the width.
 */
export default function Modal({
  open, onClose, title, body, children, footer, className, wide, compact,
}: { open: boolean; onClose: () => void; title?: string; body?: ReactNode; children?: ReactNode; footer?: ReactNode; className?: string
  /** Sent! lets its one line run the full width; Discard is drawn a size down. */
  wide?: boolean; compact?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25 px-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={cn('flex w-modal flex-col rounded-lg bg-bg-0 text-center shadow-xl', className)}>
        <div className={cn('flex flex-col gap-4', compact ? 'px-6 pb-[30px] pt-[33px]' : wide ? 'px-6 pb-[38px] pt-[44px]' : 'px-10 pb-[38px] pt-[44px]')}>
          {title && <h2 className={cn(compact ? 'text-title-m' : 'text-title-l', 'text-text-title')}>{title}</h2>}
          {body && <div className={cn('mx-auto text-body-regular text-text-subtitle', wide ? 'max-w-none' : 'max-w-[330px]')}>{body}</div>}
          {children}
        </div>
        {footer && (
          <div className="flex gap-4 border-t-1 border-stroke-1 px-4 py-4 [&_button]:h-12 [&_button]:text-body-regular">{footer}</div>
        )}
      </div>
    </div>
  )
}
