import { Link } from 'react-router-dom'
import { points as fmtPoints } from '../../lib/format'
import { useStore } from '../../mock/store'

/** Logo, points chip and the bell with its unread dot (PRD 5.1). */
export default function DashboardHeader() {
  const { user, notifications } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="flex h-bar items-center gap-3 px-4">
      <span className="text-title-s text-text-title">HumanLayer</span>

      <Link
        to="/points"
        className="ml-auto flex h-tag items-center gap-1 rounded-full border-1 border-yellow-700 bg-yellow-1000 px-3 text-text-medium text-brand-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
          <path d="M12 3l2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        {fmtPoints(user.points)}
      </Link>

      <Link to="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative text-text-title">
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
          <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9ZM10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span
            data-testid="bell-dot"
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-state-danger"
          />
        )}
      </Link>
    </header>
  )
}
