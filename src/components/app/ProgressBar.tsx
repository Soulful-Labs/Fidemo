import { cn } from '../../lib/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  /** Caption above the bar, e.g. "Monthly Goal". */
  label?: string
  /** Right-aligned caption, e.g. "$342.60 of $500". */
  caption?: string
  tone?: 'yellow' | 'green'
  size?: 'sm' | 'md'
}

/** Used for profile completion, the monthly goal, diary days and tier progress. */
export default function ProgressBar({
  value,
  max = 100,
  label,
  caption,
  tone = 'yellow',
  size = 'md',
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div className="flex w-full flex-col gap-2">
      {(label || caption) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-text-medium text-text-subtitle">{label}</span>}
          {caption && <span className="text-label text-text-body">{caption}</span>}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-bg-2', size === 'sm' ? 'h-1' : 'h-2')}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all', tone === 'green' ? 'bg-brand-secondary' : 'bg-cta-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
