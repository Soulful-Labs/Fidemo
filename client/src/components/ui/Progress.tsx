import { cn } from '../../lib/cn'

/** The study progress bar: one yellow fill, or the green/yellow/grey split drawn on the dashboard card. */
export default function Progress({
  value, max = 100, segments, className,
}: { value?: number; max?: number; segments?: { value: number; tone: 'green' | 'yellow' | 'grey' }[]; className?: string }) {
  const TONE = { green: 'bg-brand-secondary', yellow: 'bg-cta-primary', grey: 'bg-bg-4' }
  return (
    <div className={cn('flex h-2 w-full overflow-hidden rounded-full bg-bg-3', className)}>
      {segments
        ? segments.map((s, i) => <span key={i} className={cn('h-full', TONE[s.tone])} style={{ width: `${(s.value / (max || 1)) * 100}%` }} />)
        : <span className="h-full rounded-full bg-cta-primary" style={{ width: `${Math.min(100, ((value ?? 0) / (max || 1)) * 100)}%` }} />}
    </div>
  )
}
