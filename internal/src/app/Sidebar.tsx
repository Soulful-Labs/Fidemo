import { Link, useLocation } from 'react-router-dom'
import { LogoMark } from '../components/ui/Logo'
import { cn } from '../lib/cn'
import { NAV, activeNav } from './nav'
import type { NavItem } from './nav'

/**
 * The Sidebar asset (1857:127510), measured at 1x: 230 wide on bg-1 with a 1px
 * #f0f0ef right edge; the header (mark 26x32 at 20,20 and "Admin Panel" in
 * title-l, medium). The asset sheet draws a stroke-1 rule under the header at
 * y 72; no screen frame does, so it is not drawn here. group labels in Lables (14, text-body)
 * 6px above their first row; 48px rows 2px apart; the active row is a white pill inset 16px, with a 1px edge.
 * Fixed to the window height: the frames draw it 960 or 1008 tall only
 * because that is the height the component was drawn at.
 */
export default function Sidebar() {
  const { pathname } = useLocation()
  const active = activeNav(pathname)
  const account = pathname.startsWith('/account')

  return (
    <nav aria-label="Main" className="fixed inset-y-0 left-0 z-30 flex w-nav flex-col border-r-1 border-shell-edge bg-bg-1">
      <div className="flex h-[73px] shrink-0 items-start px-5 pt-5">
        <Link to="/dashboard" className="flex items-center gap-[14px]">
          <LogoMark className="h-8 w-[26px]" />
          <span className="text-title-l font-medium"><span className="text-text-subtitle">Admin</span> <span className="text-text-body">Panel</span></span>
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
        {NAV.map(({ group, items }, g) => (
          <div key={group} className="flex flex-col">
            <p className={cn('px-4 pb-1.5 text-text-regular leading-5 text-text-body', g === 0 ? 'pt-[17px]' : 'pt-3.5')}>{group}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <NavRow key={item.key} item={item} active={active.item === item.key} activeChild={active.child} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Link to="/account" className="mx-4 mb-4 flex h-[60px] shrink-0 items-center gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 px-2">
        <img src="/img/peter-avatar.png" alt="" className="h-10 w-10 rounded-sm object-cover" />
        <span className="flex flex-col">
          <span className={cn('text-text-medium', account ? 'text-brand-primary' : 'text-text-subtitle')}>Peter Devian</span>
          <span className="text-text-regular text-text-body">Master Admin</span>
        </span>
      </Link>
    </nav>
  )
}

const pill = 'rounded-md border-1 border-shell-edge bg-bg-0'

function NavRow({ item, active, activeChild }: { item: NavItem; active: boolean; activeChild?: string }) {
  const open = active && item.children
  // A parent with sub-items is not itself the pill: it turns title colour and the child is lit.
  const lit = active && !item.children
  return (
    <li className="flex flex-col gap-0.5">
      <Link to={item.to} aria-current={lit ? 'page' : undefined}
        className={cn('mx-4 flex h-12 items-center gap-2 border-1 px-4',
          lit ? cn(pill, 'text-brand-primary') : 'border-transparent',
          !lit && (open ? 'text-text-title' : 'text-text-subtitle hover:text-text-title'))}>
        <item.Icon className="h-5 w-5" />
        <span className="text-body-regular">{item.label}</span>
        {item.badge && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-green-alpha15 px-2 text-text-medium text-brand-secondary">{item.badge}</span>
        )}
      </Link>
      {open && (
        <ul className="relative flex flex-col gap-0.5">
          <span aria-hidden="true" className="absolute bottom-[19px] left-10 top-0 w-0.5 rounded-full bg-shell-rail" />
          {item.children!.map((child) => {
            const on = child.key === activeChild
            return (
              <li key={child.key} className="relative">
                <span aria-hidden="true" className={cn('absolute left-[38px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full', on ? 'bg-brand-primary' : 'bg-stroke-input')} />
                <Link to={child.to} aria-current={on ? 'page' : undefined}
                  className={cn('ml-[52px] mr-4 flex h-12 items-center border-1 px-4 text-body-regular',
                    on ? cn(pill, 'text-brand-primary') : 'border-transparent text-text-subtitle hover:text-text-title')}>
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
