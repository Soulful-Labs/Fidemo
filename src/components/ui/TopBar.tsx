import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ArrowLeft } from './icons'
import Stepper from './Stepper'

export interface TopBarProps {
  title?: string
  /** Logical-parent back, not browser history. Omit to hide the arrow. */
  onBack?: () => void
  /** Trailing actions, e.g. an info icon or "Mark all as read". */
  right?: ReactNode
  /** Adds the onboarding progress bar; the bar grows to 93px. */
  progress?: { current: number; total: number }
  /** Helper line under the title, e.g. "Just 2 minutes...". */
  helper?: string
  alt?: boolean
  className?: string
}

export default function TopBar({
  title,
  onBack,
  right,
  progress,
  helper,
  alt = false,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex w-full flex-col justify-center gap-2 px-4',
        // 56px bare, 93px when it carries a progress bar (layout constants).
        progress ? 'h-[93px]' : 'h-14',
        alt ? 'bg-bgAlt-0' : 'bg-bg-0',
        className,
      )}
    >
      <div className="flex h-6 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="text-text-title hover:text-text-body"
          >
            <ArrowLeft />
          </button>
        )}
        {title && <h1 className="truncate text-title-s text-text-title">{title}</h1>}
        {right && <div className="ml-auto flex items-center gap-3">{right}</div>}
      </div>

      {progress && <Stepper current={progress.current} total={progress.total} />}
      {helper && <p className="text-label text-text-body">{helper}</p>}
    </header>
  )
}
