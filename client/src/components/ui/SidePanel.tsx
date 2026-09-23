import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'

/**
 * The 600px panel that slides in from the right: Respondent Profile Details,
 * Invoice Details, Ask Support, Invite To Study, Notifications.
 */
export default function SidePanel({
  open, onClose, title, subtitle, footer, children, className,
}: { open: boolean; onClose: () => void; title?: ReactNode; subtitle?: string; footer?: ReactNode; children?: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-text-title/20" role="presentation" onClick={onClose}>
      <aside role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className={cn('flex h-full w-panel flex-col bg-bg shadow-xl', className)}>
        <header className="flex items-start justify-between gap-4 border-b-1 border-stroke-input px-6 py-4">
          <div className="flex flex-col gap-1">
            {typeof title === 'string' ? <h2 className="text-title-s text-text-title">{title}</h2> : title}
            {subtitle && <p className="text-text-regular text-text-subtitle">{subtitle}</p>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
            <Close className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t-1 border-stroke-input px-6 py-4">{footer}</div>}
      </aside>
    </div>
  )
}
