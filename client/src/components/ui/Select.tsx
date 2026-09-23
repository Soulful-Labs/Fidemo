import { cn } from '../../lib/cn'
import { ChevronDown } from './icons'

/**
 * The dropdown drawn on every filter row ("Study Type", "Sort: Score",
 * "Tier: All"). A button, not a native select, so the caret matches.
 */
export default function Select({
  label, value, onClick, className,
}: { label?: string; value: string; onClick?: () => void; className?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-text-regular text-text-subtitle">{label}</span>}
      <button type="button" onClick={onClick}
        className={cn('flex h-input items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-3 text-body-regular text-text-title', className)}>
        <span className="truncate">{value}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-text-subtitle" />
      </button>
    </div>
  )
}
