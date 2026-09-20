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
      <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export function Bookmark({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Star({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} width="16" height="16" className={`${base} ${className ?? ''}`}>
      <path d="m12 3 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Clock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className={`${base} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Flame({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.5-4 .2 1.2 1 2 1.8 2C12 8 11 5.5 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Upload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <path d="M12 15V4m0 0 4 4m-4-4-4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Calendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 14h.5m3.25 0h.5m3.25 0h.5M8 17h.5m3.25 0h.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Camera({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`${base} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 18c1-2.2 2.8-3.3 5-3.3s4 1.1 5 3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ShieldCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className={`${base} ${className ?? ''}`}>
      <path d="M12 1.5l2.1 1.6 2.6-.4 1 2.5 2.5 1-.4 2.6L21.5 11l-1.7 2.1.4 2.6-2.5 1-1 2.5-2.6-.4L12 20.5l-2.1-1.7-2.6.4-1-2.5-2.5-1 .4-2.6L2.5 11l1.7-2.1-.4-2.6 2.5-1 1-2.5 2.6.4L12 1.5Z" />
      <path d="m8.5 11.2 2.3 2.3 4.7-4.8" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
