import { useNewStudy } from '../screens/create/useNewStudy'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import NotificationsPanel from '../screens/dashboard/NotificationsPanel'
import { BellIcon, ChevronRight, DashboardIcon, HelpIcon, PaymentsIcon, Plus, PoolIcon, StudiesIcon } from '../components/ui/icons'
import { cn } from '../lib/cn'
import { useSession } from '../mock/session'
import { useWorkspace } from '../mock/workspace'
import { notificationRoute } from '../lib/notificationRoute'
import { useStudies } from '../platform'

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
    <nav className="sticky top-0 flex h-screen max-h-[960px] w-nav shrink-0 flex-col border-r-1 border-stroke-warm bg-yellow-20">
      {/* The wordmark sits over the same rule the top bar ends on (y 68 in every 13 Oct 2026 export). */}
      <div className="flex h-[68px] shrink-0 items-center border-b-1 border-stroke-warm pl-7">
        <span className="text-title-l text-text-title">Focus Insite</span>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5 pl-4 pr-[18px] pt-5">
        {NAV.map(({ to, label, Icon }) => {
          const on = pathname === to || pathname.startsWith(`${to}/`)
          /**
           * Studies carries two sub-items (client designs, 15 Oct 2026): My
           * Studies (the Ongoing, Drafts and Completed list, every study page
           * and the Create flow) and Sessions. The parent is a heading, not a
           * selected row; the selected sub-item has the pill and the dot.
           */
          if (to === '/studies') {
            const sessions = pathname.startsWith('/studies/sessions')
            const sub = [{ to: '/studies', label: 'My Studies', on: on && !sessions }, { to: '/studies/sessions', label: 'Sessions', on: sessions }]
            return (
              <li key={to}>
                <NavLink to={to} className="flex h-[46px] items-center gap-2 rounded-md px-4 text-body-regular text-text-title transition-colors hover:bg-bg-0/60">
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
                <ul className="relative ml-[28px] flex flex-col gap-1 pt-0.5">
                  <span aria-hidden="true" className="absolute bottom-[18px] left-0 top-0 w-px bg-stroke-warm" />
                  {sub.map((x) => (
                    <li key={x.to} className="relative flex items-center">
                      <span aria-hidden="true" className={cn('absolute -left-[2.5px] h-[6px] w-[6px] rounded-full', x.on ? 'bg-brand-primary' : 'bg-stroke-warm')} />
                      <NavLink to={x.to} end={x.to === '/studies' ? false : undefined} aria-current={x.on ? 'page' : undefined}
                        className={cn('ml-2 flex h-[46px] flex-1 items-center rounded-md px-3 text-body-regular transition-colors',
                          x.on ? 'bg-bg-0 text-brand-primary shadow-[0_1px_2px_rgba(32,30,25,0.08)]' : 'text-text-subtitle hover:bg-bg-0/60 hover:text-text-title')}>
                        {x.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            )
          }
          return (
            <li key={to}>
              <NavLink to={to}
                className={cn('flex h-[46px] items-center gap-2 rounded-md px-4 text-body-regular transition-colors',
                  on ? 'bg-bg-0 text-brand-primary shadow-[0_1px_2px_rgba(32,30,25,0.08)]' : 'text-text-subtitle hover:bg-bg-0/60 hover:text-text-title')}>
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>

      <div className="ml-4 mr-[18px] border-t-1 border-stroke-warm" />
      <NavLink to="/account" className="mb-4 ml-4 mr-[18px] mt-4 flex h-[58px] items-center gap-2 rounded-md bg-bg-0 px-2 hover:bg-bg-1">
        {account?.photo
          ? <img src={account.photo} alt="" className="h-10 w-10 shrink-0 rounded-sm object-cover" />
          : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-bg-2 text-text-medium text-text-subtitle">{initials}</span>}
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-text-medium text-text-title">{account?.name ?? 'Signed out'}</span>
          <span className="truncate text-text-regular text-text-body">{account?.role || account?.company || 'Client'}</span>
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
  crumbs = [], action, children, bare, hideCreate, heading,
}: { crumbs?: Crumb[]; action?: ReactNode; children: ReactNode; bare?: boolean;
  /** The Dashboard's top bar carries a greeting where every other screen carries its breadcrumb. */
  heading?: string;
  /** Bill Payment (1627:96956) keeps the bell and drops Create Study. */
  hideCreate?: boolean }) {
  const newStudy = useNewStudy()
  const [notifications, setNotifications] = useState(false)
  const { notifications: rows, markNotificationsRead, markNotificationRead } = useWorkspace()
  const { studies } = useStudies()
  const navigate = useNavigate()
  const unread = rows.filter((n) => n.unread).length
  if (bare) return <div className="min-h-screen bg-yellow-20">{children}</div>

  return (
    <div className="flex min-h-screen bg-yellow-20">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b-1 border-stroke-warm bg-yellow-20 px-4 pt-[3px]">
          <nav className="flex items-center gap-1 text-body-regular text-text-subtitle" aria-label="Breadcrumb">
            {heading && <h1 className="text-title-m leading-7 text-text-title">{heading}</h1>}
            {!heading && crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <span className="text-text-body">/</span>}
                {c.to ? <NavLink to={c.to} className="hover:text-text-title">{c.label}</NavLink> : <span className={crumbs.length === 1 ? 'text-body-medium text-text-title' : 'text-text-title'}>{c.label}</span>}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3.5">
            {action ?? (
              <>
                <button type="button" aria-label="Notifications" onClick={() => setNotifications(true)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-md border-1 border-stroke-input text-text-title hover:bg-bg-0">
                  <BellIcon className="h-5 w-5" />
                  {/* The exports draw the bell with no mark. The count is kept for screen readers and the panel shows it. */}
                  {unread > 0 && <span className="sr-only">{unread} unread</span>}
                </button>
                {!hideCreate && (
                  <Button size="row" leftIcon={<Plus className="h-5 w-5" />} onClick={newStudy}>Create Study</Button>
                )}
              </>
            )}
          </div>
        </header>

        {/* The title bar is 70 tall and the page starts at 78 (1627:95962). */}
        <main className="flex-1 px-2 pb-2 pt-2.5">{children}</main>
      </div>

      <NotificationsPanel open={notifications} rows={rows} onClose={() => setNotifications(false)}
        onMarkAllRead={markNotificationsRead}
        onAction={(n) => {
          setNotifications(false)
          markNotificationRead(n.id)
          navigate(notificationRoute(n, studies.map((x) => x.id)))
        }} />
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
