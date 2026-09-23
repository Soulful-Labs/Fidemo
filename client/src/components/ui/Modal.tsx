import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The 460px centred dialog: Delete Study?, Logout, Mark as solved?, Change
 * Password, and the success dialogs.
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
        className={cn('flex w-modal flex-col gap-4 rounded-lg bg-bg p-6 text-center shadow-xl', className)}>
        {title && <h2 className="text-title-s text-text-title">{title}</h2>}
        {body && <div className="text-text-regular text-text-subtitle">{body}</div>}
        {children}
        {footer && <div className="flex gap-3 pt-1">{footer}</div>}
      </div>
    </div>
  )
}
