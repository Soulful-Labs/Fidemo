import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import NotificationsPanel from '../screens/dashboard/NotificationsPanel'
import { BellIcon, ChevronRight, DashboardIcon, HelpIcon, PaymentsIcon, Plus, PoolIcon, StudiesIcon } from '../components/ui/icons'
import { cn } from '../lib/cn'
import { useSession } from '../mock/session'
import { useWorkspace } from '../mock/workspace'

/** The left navigation, in the order drawn on every 1440 frame. */
const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/studies', label: 'Studies', Icon: StudiesIcon },
  { to: '/pool', label: 'Pool', Icon: PoolIcon },
  { to: '/payments', label: 'Payments', Icon: PaymentsIcon },
  { to: '/notifications', label: 'Notifications', Icon: BellIcon },
  { to: '/help', label: 'Help', Icon: HelpIcon },
]

export interface Crumb { label: string; to?: string }

/** The left navigation, shared by the app frame and the Create Study frame. */
export function SideNav() {
  const { account } = useSession()
  const initials = (account?.name ?? '')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || 'FI'
  const { pathname } = useLocation()
  return (
    <nav className="sticky top-0 flex h-screen w-nav shrink-0 flex-col border-r-1 border-stroke-input bg-yellow-20">
      {/* The wordmark block stays 68; only the title bar is 70. */}
      <div className="flex h-[68px] items-center px-6">
        <span className="text-title-l text-text-title">Focus Insite</span>
      </div>

      <ul className="flex flex-1 flex-col gap-2 px-4 pt-5">
        {NAV.map(({ to, label, Icon }) => {
          const on = pathname === to || pathname.startsWith(`${to}/`)
          return (
            <li key={to}>
              <NavLink to={to}
                className={cn('flex h-11 items-center gap-3 rounded-sm px-3 text-body-regular transition-colors',
                  on ? 'bg-bg text-brand-primary shadow-[0_1px_2px_rgba(32,30,25,0.06)]' : 'text-text-subtitle hover:bg-bg/60 hover:text-text-title')}>
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>

      <div className="mx-4 border-t-1 border-stroke-input" />
      <NavLink to="/account" className="m-4 flex items-center gap-3 rounded-sm bg-bg p-3 shadow-[0_1px_2px_rgba(32,30,25,0.06)] hover:bg-bg-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-bg-2 text-text-medium text-text-subtitle">{initials}</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-text-medium text-text-title">{account?.name ?? 'Signed out'}</span>
          <span className="truncate text-label text-text-body">{account?.role || account?.company || 'Client'}</span>
        </span>
      </NavLink>
    </nav>
  )
}

/**
 * The desktop frame every client screen sits inside: a 240px left navigation
 * with the wordmark and the account card pinned to the bottom, a 72px top bar
 * carrying the breadcrumb, the bell and Create Study, and the page area.
 */
export default function AppShell({
  crumbs = [], action, children, bare, hideCreate,
}: { crumbs?: Crumb[]; action?: ReactNode; children: ReactNode; bare?: boolean;
  /** Bill Payment (1627:96956) keeps the bell and drops Create Study. */
  hideCreate?: boolean }) {
  const [notifications, setNotifications] = useState(false)
  const { notifications: rows, markNotificationsRead } = useWorkspace()
  const unread = rows.filter((n) => n.unread).length
  if (bare) return <div className="min-h-screen bg-yellow-20">{children}</div>

  return (
    <div className="flex min-h-screen bg-yellow-20">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-topbar shrink-0 items-center justify-between gap-4 border-b-1 border-stroke-input bg-yellow-20 px-4">
          <nav className="flex items-center gap-1 text-body-regular text-text-subtitle" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-text-body">/</span>}
                {c.to ? <NavLink to={c.to} className="hover:text-text-title">{c.label}</NavLink> : <span className="text-text-title">{c.label}</span>}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {action ?? (
              <>
                <button type="button" aria-label="Notifications" onClick={() => setNotifications(true)}
                  className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
                  <BellIcon className="h-5 w-5" />
                  {unread > 0 && <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cta-primary" />}
                </button>
                {!hideCreate && (
                  <NavLink to="/studies/create/about">
                    <Button size="row" leftIcon={<Plus className="h-4 w-4" />}>Create Study</Button>
                  </NavLink>
                )}
              </>
            )}
          </div>
        </header>

        {/* The title bar is 70 tall and the page starts at 78 (1627:95962). */}
        <main className="flex-1 px-2 pb-2 pt-2">{children}</main>
      </div>

      <NotificationsPanel open={notifications} rows={rows} onClose={() => setNotifications(false)}
        onMarkAllRead={markNotificationsRead}
        onAction={() => setNotifications(false)} />
    </div>
  )
}

/** "View All ›", the link drawn at the right of a section heading. */
export function ViewAll({ to }: { to: string }) {
  return (
    <NavLink to={to} className="flex items-center gap-1 text-text-medium text-text-subtitle hover:text-text-title">
      View All <ChevronRight className="h-4 w-4" />
    </NavLink>
  )
}
