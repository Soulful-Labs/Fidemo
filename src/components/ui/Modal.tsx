import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { frameLayer } from '../../app/frame'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { dialogPlayful, scrim } from '../../lib/motion'
import { overlayClosed, overlayOpened } from '../../lib/overlays'
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
    overlayOpened()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      overlayClosed()
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

  // Springs in from slightly small, and on close plays out with the content it
  // last had (AnimatePresence keeps the last render), so nothing empties mid-exit.
  const layer = (
    <AnimatePresence>
    {open && (
    <motion.div
      key="modal"
      variants={scrim} initial="hidden" animate="shown" exit="gone"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-0/80 px-4"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        variants={dialogPlayful}
        style={{ transformPerspective: 900 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-full max-w-content flex-col gap-4 rounded-lg p-4',
          alt ? 'bg-bgAlt-2' : 'bg-bg-2',
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4">
            {title && <h2 className="text-title-m leading-tight text-text-title">{title}</h2>}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ml-auto text-text-title hover:text-text-body"
              >
                <Close className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {children && <div className="text-text-regular text-text-body">{children}</div>}
        {footer && <div className="flex flex-col gap-2">{footer}</div>}
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  )
  // Lifted out of the screen into the frame's own layer.
  return createPortal(layer, frameLayer())
}
