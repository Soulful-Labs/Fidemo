import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Close } from './icons'
import { useOverlay } from './Modal'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  footer?: ReactNode
  showClose?: boolean
  alt?: boolean
  /** Lets tall sheets (pickers) take most of the viewport. */
  tall?: boolean
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  showClose = true,
  alt = false,
  tall = false,
}: BottomSheetProps) {
  useOverlay(open, onClose)
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg-0/80"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-full max-w-[375px] flex-col gap-4 rounded-t-xl border-1 border-stroke-3 p-5 pb-6',
          tall ? 'max-h-[85vh]' : 'max-h-[70vh]',
          alt ? 'bg-bgAlt-2' : 'bg-bg-1',
        )}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-stroke-3" aria-hidden />

        {(title || showClose) && (
          <div className="flex items-center justify-between gap-4">
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

        {children && (
          <div className="min-h-0 flex-1 overflow-y-auto text-text-regular text-text-body">
            {children}
          </div>
        )}
        {footer && <div className="flex flex-col gap-2">{footer}</div>}
      </div>
    </div>
  )
}
