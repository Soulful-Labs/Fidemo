import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'

/**
 * The 600px panel that slides in from the right: Notifications (1518:71845),
 * Respondent Profile Details (1704:141690), Invoice Details, Ask Support and
 * Invite To Study. The frames give it a 56px title bar with the close button
 * on the right, a scrolling body and an optional footer.
 */
export default function SidePanel({
  open, onClose, title, subtitle, headerAction, footer, children, className, bodyClassName, headerClassName,
}: {
  open: boolean; onClose: () => void; title?: ReactNode; subtitle?: string
  headerAction?: ReactNode; footer?: ReactNode; children?: ReactNode
  className?: string; bodyClassName?: string; headerClassName?: string
}) {
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
        className={cn('flex h-full w-panel flex-col bg-bg-0 shadow-xl', className)}>
        <header className={cn('flex h-14 shrink-0 items-center justify-between gap-4 border-b-1 border-stroke-1 px-4', headerClassName)}>
          <div className="flex min-w-0 flex-col">
            {typeof title === 'string' ? <h2 className="text-title-m text-text-title">{title}</h2> : title}
            {subtitle && <p className="text-text-regular text-text-subtitle">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {headerAction}
            <button type="button" aria-label="Close" onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
              <Close className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className={cn('flex-1 overflow-y-auto', bodyClassName ?? 'px-4 py-4')}>{children}</div>
        {footer && <div className="shrink-0 border-t-1 border-stroke-input px-4 py-4">{footer}</div>}
      </aside>
    </div>
  )
}
