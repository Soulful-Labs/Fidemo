import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'
import { TABS, activeTab } from './navigation'

/**
 * The four fixed tabs, 85px tall. Hidden on detail screens and flows.
 *
 * Uses Link rather than NavLink deliberately: a tab owns routes that do not
 * share its path (Wallet owns /points, Profile owns /trust-score and /support),
 * which NavLink's own matching cannot express, and NavLink would overwrite the
 * aria-current we set from activeTab.
 */
export default function BottomNav({ pathname }: { pathname: string }) {
  const active = activeTab(pathname)

  return (
    <nav className="flex h-nav shrink-0 items-start gap-1 border-t-1 border-stroke-2 bg-bg-1 px-2 pt-3">
      {TABS.map((tab) => {
        const isActive = active === tab.key
        return (
          <Link
            key={tab.key}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-md py-2 transition-colors',
              isActive ? 'text-brand-primary' : 'text-text-disabled hover:text-text-body',
            )}
          >
            <tab.Icon />
            <span className="text-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
