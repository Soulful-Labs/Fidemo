import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import Button, { IconButton } from './Button'
import { CloseIcon } from './icons'

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

/**
 * The 600px side panel (Advanced Filters 2003:133781, Create Ticket
 * 2045:115768, Invite To Study 1992:103508): bg-0 with Radius/XL on the left
 * corners; the "Title bar" component, 56 tall, Title-M title 16px in and a
 * 28px ringed close; a stroke-1 rule; a 16px-padded body; a footer of two
 * 48px buttons 16 apart above a stroke-1 rule.
 */
export function SidePanel({ open, onClose, title, footer, children, className }: {
  open: boolean; onClose: () => void; title: ReactNode; footer?: ReactNode; children?: ReactNode; className?: string
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 flex justify-end bg-text-title/20">
      <aside role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className={cn('flex h-full w-panel flex-col rounded-l-xl bg-bg-0', className)}>
        <header className="flex h-14 shrink-0 items-center justify-between border-b-1 border-stroke-1 px-4">
          <h2 className="text-title-m text-text-title">{title}</h2>
          <IconButton label="Close" size={28} onClick={onClose}><CloseIcon className="h-4 w-4" /></IconButton>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <footer className="flex shrink-0 gap-4 border-t-1 border-stroke-1 p-4 [&>*]:flex-1">{footer}</footer>}
      </aside>
    </div>
  )
}

/**
 * The 460px dialog. Two layouts are drawn:
 * - centred (Mark Resolved? 2045:52841): Title-L centred, body Body 16
 *   subtitle centred, then the "Bottom Bar" (80 tall: a stroke-1 rule and two
 *   48px buttons 16 apart, 16 in);
 * - titled (Restrict Maya's Account 2036:146119): the panel's 56px title bar
 *   with a close, a left-aligned body, the same bottom bar.
 * Radius/XL corners, bg-0.
 */
export function Modal({ open, onClose, title, layout = 'centred', footer, children, className }: {
  open: boolean; onClose: () => void; title?: ReactNode; layout?: 'centred' | 'titled'; footer?: ReactNode; children?: ReactNode; className?: string
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25">
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className={cn('flex w-modal flex-col overflow-hidden rounded-xl bg-bg-0', className)}>
        {layout === 'titled' ? (
          <>
            <header className="flex h-14 items-center justify-between border-b-1 border-stroke-1 px-4">
              <h2 className="text-title-m text-text-title">{title}</h2>
              <IconButton label="Close" size={28} onClick={onClose}><CloseIcon className="h-4 w-4" /></IconButton>
            </header>
            <div className="flex flex-col gap-4 p-4 text-left">{children}</div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-8 text-center">
            {title && <h2 className="text-title-l text-text-title">{title}</h2>}
            {children}
          </div>
        )}
        {footer && <footer className="flex gap-4 border-t-1 border-stroke-1 p-4 [&>*]:flex-1">{footer}</footer>}
      </div>
    </div>
  )
}

/**
 * The success dialog (Password has been updated! 1849:112267, 460 x 423): a
 * 160px pale ring with a 92px scalloped badge and a white tick, a Title-L
 * line, a Body 16 subtitle, then the bottom bar with one 48px button.
 */
export function SuccessModal({ open, onClose, title, body, action, onAction }: {
  open: boolean; onClose: () => void; title: string; body: ReactNode; action: string; onAction: () => void
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25">
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="flex w-modal flex-col overflow-hidden rounded-xl bg-bg-0">
        <div className="flex flex-col items-center px-4 pb-4 pt-10 text-center">
          <SuccessBadge />
          <h2 className="pt-4 text-title-l text-text-title">{title}</h2>
          <p className="max-w-[358px] pt-2 text-body-regular text-text-subtitle">{body}</p>
        </div>
        <footer className="border-t-1 border-stroke-1 p-4">
          <SuccessAction onClick={onAction}>{action}</SuccessAction>
        </footer>
      </div>
    </div>
  )
}

function SuccessAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button fullWidth onClick={onClick}>{children}</Button>
}

/** The scalloped tick badge: a 92px yellow-500 star with a yellow-700 rim, inside a 160px yellow-100 disc. */
export function SuccessBadge() {
  const points = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2
    const r = i % 2 === 0 ? 46 : 42
    return `${46 + r * Math.sin(a)},${46 - r * Math.cos(a)}`
  }).join(' ')
  return (
    <span className="flex h-40 w-40 items-center justify-center rounded-full bg-yellow-100">
      <svg viewBox="0 0 92 92" className="h-[92px] w-[92px]" aria-hidden="true">
        <polygon points={points} className="fill-yellow-500 stroke-yellow-700" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 47.5 41 58l21-24" fill="none" className="stroke-bg" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
