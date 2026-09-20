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
  /** Helper line under the progress bar, e.g. "Just 2 minutes...". */
  helper?: string
  alt?: boolean
  className?: string
}

/**
 * 56px title bar as drawn in Figma: a 32px row with the back arrow, the title
 * and trailing icons, and a hairline underneath. With `progress` it becomes
 * the 93px onboarding bar (row, 4px green segments, helper line).
 */
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
        'sticky top-0 z-30 flex w-full shrink-0 flex-col border-b-1 border-stroke-1 px-4 pt-3',
        progress ? 'h-bar-progress' : 'h-bar',
        alt ? 'bg-bgAlt-0' : 'bg-bg-0',
        className,
      )}
    >
      <div className="flex h-8 items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="-ml-1 flex h-8 w-8 items-center justify-center text-text-title hover:text-text-body"
          >
            <ArrowLeft />
          </button>
        )}
        {title && <h1 className="truncate text-title-s text-text-title">{title}</h1>}
        {right && <div className="ml-auto flex items-center gap-3">{right}</div>}
      </div>

      {progress && (
        <div className="flex flex-col gap-2 pt-2">
          <Stepper current={progress.current} total={progress.total} tone="green" />
          {helper && <p className="text-label text-text-body">{helper}</p>}
        </div>
      )}
    </header>
  )
}
