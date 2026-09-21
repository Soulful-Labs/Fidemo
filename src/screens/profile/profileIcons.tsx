type P = { className?: string }
const S = 'shrink-0'
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function CertificateIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <rect x="3" y="4" width="18" height="14" rx="2" {...stroke} />
      <circle cx="9" cy="10" r="2.2" {...stroke} />
      <path d="M5.5 16c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4M14 9h4M14 12.5h4M9 18v3l2-1 2 1v-3" {...stroke} />
    </svg>
  )
}

export function ReferIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="10" cy="8" r="3.5" {...stroke} />
      <path d="M3.5 20c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5M18 9v6M15 12h6" {...stroke} />
    </svg>
  )
}

export function SettingsIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="3" {...stroke} />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" {...stroke} />
      <circle cx="12" cy="12" r="7" {...stroke} />
    </svg>
  )
}

export function SupportIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.5" {...stroke} />
    </svg>
  )
}

export function SignOutIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" {...stroke} />
    </svg>
  )
}

export function KeyIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="8" cy="14" r="4" {...stroke} />
      <path d="m11 11 8.5-8.5M16 6l2 2M13.5 8.5l2 2" {...stroke} />
    </svg>
  )
}

export function MailIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <rect x="3" y="5" width="18" height="14" rx="3" {...stroke} />
      <path d="m3.5 7 8.5 6 8.5-6" {...stroke} />
    </svg>
  )
}

export function CookieIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3.5-3 3 3 0 0 1-3-3.5A3 3 0 0 1 12 3Z" {...stroke} />
      <path d="M8.5 10.5h.5M13 15h.5M8 15.5h.5M15.5 12.5h.5" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

export function DangerIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M12 7.5V13m0 3v.5" {...stroke} />
    </svg>
  )
}

export function VerifiedIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={`${S} ${className ?? ''}`}>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" {...stroke} />
    </svg>
  )
}
