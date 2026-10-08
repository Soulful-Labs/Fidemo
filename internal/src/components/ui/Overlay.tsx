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
 * 2045:115768, Invite To Study 1992:103508). The frames draw each panel as a
 * box only as tall as its content (470, 517, 597), not a full-height sheet,
 * and never show where it sits; it opens at the top right, as tall as its
 * content. bg-0 with Radius/XL on the left corners; the "Title bar" component, 56 tall, Title-M title 16px in and a
 * 28px ringed close; a stroke-1 rule; a 16px-padded body; a footer of two
 * 48px buttons 16 apart above a stroke-1 rule.
 */
export function SidePanel({ open, onClose, title, footer, children, className }: {
  open: boolean; onClose: () => void; title: ReactNode; footer?: ReactNode; children?: ReactNode; className?: string
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 flex items-start justify-end bg-text-title/20">
      <aside role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className={cn('flex max-h-full w-panel flex-col rounded-l-xl bg-bg-0', className)}>
        <header className="flex h-14 shrink-0 items-center justify-between border-b-1 border-stroke-1 px-4">
          <h2 className="text-title-s text-text-title">{title}</h2>
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
              <h2 className="text-title-s text-text-title">{title}</h2>
              <IconButton label="Close" size={28} onClick={onClose}><CloseIcon className="h-4 w-4" /></IconButton>
            </header>
            <div className="flex flex-col gap-6 px-4 pb-6 pt-4 text-left">{children}</div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-10 text-center">
            {title && <h2 className="text-title-l leading-[31px] text-text-title">{title}</h2>}
            <div className="max-w-[310px]">{children}</div>
          </div>
        )}
        {footer && <footer className="flex gap-4 border-t-1 border-stroke-1 p-4 [&>*]:flex-1">{footer}</footer>}
      </div>
    </div>
  )
}

/**
 * The success dialog (Password has been updated! 1849:112267, 460 x 423),
 * measured: 16px padding, then 24 more above a 160px yellow-100 disc holding
 * the 92px badge; 16 below it the title (Title-L in a 35px line), 8 below that
 * the Body 16 subtitle, 24 under it; then the 80px "Bottom Bar": a stroke-1
 * rule and one 48px button 16 in.
 */
export function SuccessModal({ open, onClose, title, body, action, onAction, tone = 'yellow' }: {
  open: boolean; onClose: () => void; title: string; body: ReactNode; action: string; onAction: () => void
  /** green: "This study has been published live!" (1982:109978) draws the badge in green. */
  tone?: 'yellow' | 'green'
}) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25">
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="flex w-modal flex-col overflow-hidden rounded-xl bg-bg-0">
        <div className="flex flex-col items-center px-4 pb-10 pt-10 text-center">
          <SuccessBadge tone={tone} />
          <h2 className="pt-4 text-title-l leading-[35px] text-text-title">{title}</h2>
          <p className="max-w-[358px] pt-2 text-body-regular text-text-subtitle">{body}</p>
        </div>
        <footer className="h-20 border-t-1 border-stroke-1 p-4">
          <Button fullWidth onClick={onAction}>{action}</Button>
        </footer>
      </div>
    </div>
  )
}

/** The badge: a 92px yellow-500 disc with a 4px brand-primary rim and a white tick, on a 160px yellow-100 disc. */
export function SuccessBadge({ tone = 'yellow' }: { tone?: 'yellow' | 'green' }) {
  const green = tone === 'green'
  return (
    <span className={cn('flex h-40 w-40 items-center justify-center rounded-full', green ? 'bg-state-successBg' : 'bg-yellow-100')}>
      <span className={cn('flex h-[92px] w-[92px] items-center justify-center rounded-full border-4', green ? 'border-state-successHover bg-state-success' : 'border-brand-primary bg-yellow-500')}>
        <svg viewBox="0 0 40 32" className="h-8 w-10" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 17.5 14.5 27 36 5" className={green ? 'stroke-state-successHover' : 'stroke-yellow-700'} strokeOpacity="0.45" strokeWidth="4" transform="translate(1.5 2)" />
          <path d="M4 17.5 14.5 27 36 5" className="stroke-bg" strokeWidth="4" />
        </svg>
      </span>
    </span>
  )
}
