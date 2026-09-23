import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The small menu drawn next to the ⋮ on a study row or card, and the filter
 * popovers (Genders, Age, Education, Country Location, Profile Tiers).
 */
export default function Popover({
  open, onClose, children, className, width = 200,
}: { open: boolean; onClose: () => void; children: ReactNode; className?: string; width?: number }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} role="presentation" />
      <div style={{ width }} className={cn('absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-sm border-1 border-stroke-input bg-bg py-1 shadow-lg', className)}>
        {children}
      </div>
    </>
  )
}

/** One row of a Popover menu. */
export function PopoverItem({ icon, children, onClick, danger }: { icon?: ReactNode; children: ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-text-regular hover:bg-bg-1', danger ? 'text-[#e33a38]' : 'text-text-title')}>
      {icon}
      {children}
    </button>
  )
}
