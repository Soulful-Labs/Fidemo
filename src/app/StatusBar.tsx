/**
 * The iOS status bar drawn on every Figma frame. Only shown inside the desktop
 * phone shell (above 420px); on a real phone the OS draws its own.
 */
export default function StatusBar() {
  return (
    <div className="hidden h-status shrink-0 items-center justify-between px-6 pt-3 text-text-medium font-semibold text-text-title frame:flex">
      <span>9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg viewBox="0 0 16 12" width="16" height="12" fill="none">
          <path d="M8 10.5 9.8 8.3a2.6 2.6 0 0 0-3.6 0L8 10.5ZM4.2 6.1a5.7 5.7 0 0 1 7.6 0M1.2 3.4a9.6 9.6 0 0 1 13.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 27 12" width="27" height="12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
          <path d="M24.5 4v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  )
}
