import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { frameLayer } from '../../app/frame'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { scrim, sheet, sheetPlayful } from '../../lib/motion'
import { usePlayful } from '../../lib/playful'
import { Close } from './icons'
import { useOverlay } from './Modal'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Line under the title, e.g. "Select your education level". */
  subtitle?: string
  children?: ReactNode
  footer?: ReactNode
  showClose?: boolean
  alt?: boolean
  /** Lets tall sheets (pickers) take most of the viewport. */
  tall?: boolean
}

/**
 * Sheet rising from the bottom, as drawn for Consent and the pickers: page
 * background, 24px top radius, title row with a close icon, and a hairline
 * above the footer buttons.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  showClose = true,
  alt = false,
  tall = false,
}: BottomSheetProps) {
  useOverlay(open, onClose)
  const playful = usePlayful()

  // Rises on a spring and sinks away on close, keeping its last content while it goes.
  const layer = (
    <AnimatePresence>
    {open && (
    <motion.div
      key="sheet"
      variants={scrim} initial="hidden" animate="shown" exit="gone"
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg-0/80"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        variants={playful ? sheetPlayful : sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-full max-w-frame flex-col rounded-t-xl border-t-1 border-stroke-3 pt-5',
          tall ? 'max-h-sheet-tall' : 'max-h-sheet',
          alt ? 'bg-bgAlt-0' : 'bg-bg-0',
        )}
      >
        {(title || showClose) && (
          <div className="flex flex-col gap-1 px-4 pb-4">
            <div className="flex h-8 items-center justify-between gap-4">
              {title && <h2 className="text-title-m text-text-title">{title}</h2>}
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-auto flex h-8 w-8 items-center justify-center text-text-title hover:text-text-body"
                >
                  <Close className="h-6 w-6" />
                </button>
              )}
            </div>
            {subtitle && <p className="pt-2 text-text-regular text-text-body">{subtitle}</p>}
          </div>
        )}

        {children && (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 text-text-regular text-text-body">
            {children}
          </div>
        )}
        {footer && (
          <div className="flex flex-col gap-2 border-t-1 border-stroke-2 px-4 pb-6 pt-4">{footer}</div>
        )}
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  )
  // PLAYFUL: lifted out of the screen into the frame's own layer, so the screen can recede behind it.
  return playful ? createPortal(layer, frameLayer()) : layer
}
