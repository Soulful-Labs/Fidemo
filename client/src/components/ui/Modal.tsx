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
  open, onClose, title, body, children, footer, className,
}: { open: boolean; onClose: () => void; title?: string; body?: ReactNode; children?: ReactNode; footer?: ReactNode; className?: string }) {
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
        className={cn('flex w-modal flex-col rounded-lg bg-bg text-center shadow-xl', className)}>
        <div className="flex flex-col gap-3 px-10 pb-6 pt-10">
          {title && <h2 className="text-title-m font-semibold text-text-title">{title}</h2>}
          {body && <div className="text-body-regular text-text-subtitle">{body}</div>}
          {children}
        </div>
        {footer && (
          <div className="flex gap-3 border-t-1 border-stroke-1 px-4 py-4 [&_button]:h-[41px] [&_button]:text-body-regular">{footer}</div>
        )}
      </div>
    </div>
  )
}
