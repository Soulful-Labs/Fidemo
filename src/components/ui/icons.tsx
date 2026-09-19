/**
 * Inline SVG icons. No icon library is allowed by the brief, so the small set
 * the primitives need lives here. All use `currentColor` so colour comes from
 * the surrounding text token.
 */

type IconProps = { className?: string }

const base = 'shrink-0'

export function ArrowLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className={`${base} ${className ?? ''}`}>
      <path d="M19 12H5m0 0 7 7m-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Eye({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function EyeOff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.2A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.1-.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Close({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Search({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Info({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11v5m0-8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Spinner({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className={`${base} animate-spin ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
