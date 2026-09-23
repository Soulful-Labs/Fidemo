import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** The row of dropdowns above a list: left slot for tabs, right for filters. */
export default function FilterBar({ left, right, className }: { left?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  )
}
