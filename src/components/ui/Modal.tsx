import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  /** Buttons pinned under the body. */
  footer?: ReactNode
  showClose?: boolean
  /** Green-tinted surface for Trust Score / Points / Wallet screens. */
  alt?: boolean
}

/** Locks body scroll and wires Escape while any overlay is open. */
export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  showClose = true,
  alt = false,
}: ModalProps) {
  useOverlay(open, onClose)
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-0/80 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-full max-w-[343px] flex-col gap-4 rounded-lg border-1 border-stroke-3 p-5',
          alt ? 'bg-bgAlt-2' : 'bg-bg-1',
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4">
            {title && <h2 className="text-title-s text-text-title">{title}</h2>}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto text-text-body hover:text-text-title"
              >
                <Close />
              </button>
            )}
          </div>
        )}

        {children && <div className="text-text-regular text-text-body">{children}</div>}
        {footer && <div className="flex flex-col gap-2">{footer}</div>}
      </div>
    </div>
  )
}
