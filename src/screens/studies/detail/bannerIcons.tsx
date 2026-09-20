import type { BannerTone } from './StateBanner'

/** Small line icon in front of a banner title: clock, tick, cross or warning. */
export function BannerIcon({ tone, title }: { tone: BannerTone; title: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  if (tone === 'danger') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="m9 9 6 6m0-6-6 6" {...common} />
      </svg>
    )
  }
  if (tone === 'green' || /Scheduled|Confirmed/.test(title)) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
        <circle cx="12" cy="12" r="9" {...common} />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" {...common} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
      <circle cx="12" cy="12" r="9" {...common} />
      <path d="M12 7.5V12l3 2" {...common} />
    </svg>
  )
}

export function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" className={`shrink-0 ${className ?? ''}`}>
      <path d="M12 4 3 19h18L12 4Zm0 6v4m0 3v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
