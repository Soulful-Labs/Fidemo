import type { StudyStatus } from '../../mock/types'

/** The small glyph inside a history status tag (Figma 919:73144). */
export default function StatusIcon({ status }: { status: StudyStatus }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  if (status === 'paid') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
        <path d="M4 14.5c2-1.5 4-1.5 6 0l3 2c1 .6 2 .3 2.5-.5M4 19h5l7-2.5c1.5-.5 3-1.6 4-3l-2-1.5-4 2" {...common} />
        <path d="M13 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" {...common} />
      </svg>
    )
  }
  if (status === 'rejected') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="m9 9 6 6m0-6-6 6" {...common} />
      </svg>
    )
  }
  if (status === 'late_show') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="M12 7.5V12l3 2M12 15.5v.5" {...common} />
      </svg>
    )
  }
  if (status === 'no_show') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
        <path d="M12 4 3 19h18L12 4Zm0 6v4m0 3v.5" {...common} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
      <circle cx="12" cy="12" r="9" {...common} />
      <path d="M12 7.5V12l3 2" {...common} />
    </svg>
  )
}
