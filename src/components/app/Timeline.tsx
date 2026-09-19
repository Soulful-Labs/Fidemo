import { cn } from '../../lib/cn'
import { dateTime } from '../../lib/format'

export interface TimelineEntry {
  label: string
  at: string
}

/** Study Updates: "Applied, May 13, 10:36 AM" then "Paid, May 16, 10:00 AM" (PRD 6.14). */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null

  return (
    <ol className="flex flex-col">
      {entries.map((entry, i) => {
        const last = i === entries.length - 1
        return (
          <li key={`${entry.label}-${entry.at}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  last ? 'bg-brand-primary' : 'bg-stroke-3',
                )}
              />
              {!last && <span className="w-0.5 flex-1 bg-stroke-2" />}
            </div>
            <div className={cn('flex flex-col gap-0.5', last ? 'pb-0' : 'pb-4')}>
              <span className="text-text-medium text-text-title">{entry.label}</span>
              <span className="text-label text-text-body">{dateTime(entry.at)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
