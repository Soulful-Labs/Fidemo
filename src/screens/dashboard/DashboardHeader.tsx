import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import Logo from '../../components/app/Logo'
import RollingNumber from '../../components/motion/RollingNumber'
import { popCoins } from '../../components/motion/toyCoins'
import { Bell, PointsCoin } from '../../components/ui/icons'
import { points as fmtPoints } from '../../lib/format'
import { useStore } from '../../mock/store'

/**
 * Logo, points chip and the bell with its unread dot (PRD 5.1, Figma
 * 918:69716). `right` swaps the chip and bell for something else, e.g. the
 * Get Started button on the new-user dashboard.
 */
export default function DashboardHeader({ right }: { right?: ReactNode }) {
  const { user, notifications } = useStore()
  const unread = notifications.filter((n) => !n.read).length
  const chip = useRef<HTMLAnchorElement>(null)

  return (
    <header className="flex h-bar shrink-0 items-center gap-4 px-4">
      <Logo className="[&>span]:text-text-title" />

      {right ?? (
        <>
          <Link
            ref={chip}
            onPointerDown={popCoins}
            to="/points"
            className="ml-auto flex h-tag items-center gap-2 rounded-full border-1 border-green-900 bg-green-900/40 px-3 text-body-medium text-brand-secondary"
          >
            <PointsCoin className="h-5 w-5 text-brand-secondary" />
            <RollingNumber value={user.points} format={fmtPoints} memory="points" float="into" pulse={chip} />
          </Link>

          <Link to="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="relative text-text-title">
            <Bell />
            {unread > 0 && (
              <span
                data-testid="bell-dot"
                className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-state-danger"
              />
            )}
          </Link>
        </>
      )}
    </header>
  )
}
