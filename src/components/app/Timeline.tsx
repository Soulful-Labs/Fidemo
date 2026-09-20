import { dateTime } from '../../lib/format'

export interface TimelineEntry {
  label: string
  at: string
}

function TickCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Study Updates as drawn on the history details (919:73336): one ticked row
 * per step, "Applied • May 13, 10:36 AM".
 */
export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={`${entry.label}-${entry.at}`} className="flex items-center gap-2 text-text-regular text-text-subtitle">
          <TickCircle />
          <span>{entry.label}</span>
          <span className="text-text-body">•</span>
          <span>{dateTime(entry.at)}</span>
        </li>
      ))}
    </ol>
  )
}
