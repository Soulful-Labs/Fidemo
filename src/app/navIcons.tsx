/** Bottom navigation icons. The active state is carried by colour, not shape. */
type P = { className?: string }
const S = 'shrink-0'

export function HomeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function StudiesIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function WalletIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <path d="M3 8a2 2 0 0 1 2-2h12v3M3 8v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M3 8h16a2 2 0 0 1 2 2v1h-5a2 2 0 0 0 0 4h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProfileIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className={`${S} ${className ?? ''}`}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
