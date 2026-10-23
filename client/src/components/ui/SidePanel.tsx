import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'

/**
 * The 600px panel: a 56px title bar with the close button on the right, a
 * scrolling body and an optional footer. Where it sits (23 Oct 2026):
 * - `placement="center"` (the default), a pop-up: small or form-like content
 *   (Ask Support, Rate, Add New Card, Invite To Study...) opens in the centre
 *   of the screen, as tall as what it holds, every corner rounded.
 * - `placement="sheet"`: long scrollable content (a participant's profile,
 *   Notifications, Invoice Details...) is a full-height overlay anchored to
 *   the right edge, from top to bottom.
 */
export default function SidePanel({
  open, onClose, title, subtitle, headerAction, footer, children, className, bodyClassName, headerClassName, placement = 'center',
}: {
  open: boolean; onClose: () => void; title?: ReactNode; subtitle?: string
  placement?: 'center' | 'sheet'
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
    <div className={cn('fixed inset-0 z-50 flex bg-text-title/20', placement === 'sheet' ? 'justify-end' : 'items-center justify-center p-6')} role="presentation" onClick={onClose}>
      <aside role="dialog" aria-modal="true" data-placement={placement} onClick={(e) => e.stopPropagation()}
        className={cn('flex w-panel flex-col overflow-hidden bg-bg-0 shadow-xl', placement === 'sheet' ? 'h-full rounded-l-xl' : 'max-h-full rounded-xl', className)}>
        <header className={cn('flex h-14 shrink-0 items-center justify-between gap-4 border-b-1 border-stroke-1 px-4', headerClassName)}>
          <div className="flex min-w-0 flex-col">
            {typeof title === 'string' ? <h2 className="text-title-s text-text-title">{title}</h2> : title}
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
