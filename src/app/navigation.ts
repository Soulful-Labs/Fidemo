import { matchPath } from 'react-router-dom'
import type { ComponentType } from 'react'
import { HomeIcon, ProfileIcon, StudiesIcon, WalletIcon } from './navIcons'

export interface Tab {
  key: string
  label: string
  to: string
  Icon: ComponentType<{ className?: string }>
  /** Any route under these prefixes lights this tab up. */
  owns: string[]
}

/** The four fixed tabs (PRD 3). */
export const TABS: Tab[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', Icon: HomeIcon,
    owns: ['/dashboard', '/notifications'] },
  { key: 'studies', label: 'Studies', to: '/studies', Icon: StudiesIcon,
    owns: ['/studies', '/clients'] },
  { key: 'wallet', label: 'Wallet', to: '/wallet', Icon: WalletIcon,
    owns: ['/wallet', '/points'] },
  { key: 'profile', label: 'Profile', to: '/profile', Icon: ProfileIcon,
    owns: ['/profile', '/trust-score', '/support'] },
]

/**
 * Global interaction rule 1: the nav shows on the four tab roots and on list
 * screens, and hides on detail screens, flows and modals. Listing the screens
 * that keep it is safer than trying to describe the ones that lose it.
 */
const NAV_ROUTES = [
  '/dashboard', '/notifications',
  '/studies', '/studies/saved', '/studies/mine', '/studies/mine/:tab',
  '/wallet', '/wallet/earnings', '/wallet/payouts', '/wallet/payout-methods',
  '/points',
  '/profile', '/profile/settings',
  '/support', '/support/tickets',
]

export function showsNav(pathname: string): boolean {
  return NAV_ROUTES.some((route) => matchPath({ path: route, end: true }, pathname) !== null)
}

/** Screens on the green-tinted palette: Trust Score, Reward Points and Wallet. */
export function isAltPalette(pathname: string): boolean {
  return ['/wallet', '/points', '/trust-score'].some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function activeTab(pathname: string): string | undefined {
  return TABS.find((tab) =>
    tab.owns.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  )?.key
}

/**
 * Global interaction rule 2: back goes to the logical parent, not browser
 * history. Patterns are tried in order; anything unlisted falls back to
 * dropping the last path segment.
 */
const PARENTS: [pattern: string, parent: string][] = [
  // Auth and onboarding run as a chain.
  ['/verify-otp', '/signup'],
  ['/check-email', '/forgot-password'],
  ['/reset-password', '/check-email'],
  ['/password-updated', '/signin'],
  ['/forgot-password', '/signin'],
  ['/onboarding/about', '/signup'],
  ['/onboarding/professional', '/onboarding/about'],
  ['/onboarding/identity', '/onboarding/professional'],
  ['/onboarding/welcome', '/dashboard'],
  // Tab roots and list screens.
  ['/notifications', '/dashboard'],
  ['/studies/saved', '/studies'],
  ['/studies/mine/:tab', '/studies'],
  ['/studies/mine', '/studies'],
  ['/clients/:clientId/ratings', '/studies'],
  ['/points', '/wallet'],
  ['/trust-score', '/profile'],
  ['/support', '/profile'],
  // Study flows return to the study, not to the previous step.
  ['/studies/:id/schedule/:step', '/studies/:id'],
  ['/studies/:id/reschedule/:step', '/studies/:id'],
  ['/studies/:id/pin/done', '/studies/:id'],
  ['/studies/:id/survey/done', '/studies/:id'],
  ['/studies/:id/diary/:day', '/studies/:id/diary'],
  ['/studies/:id/:step', '/studies/:id'],
  ['/studies/:id', '/studies'],
]

export function parentOf(pathname: string): string {
  for (const [pattern, parent] of PARENTS) {
    const match = matchPath({ path: pattern, end: true }, pathname)
    if (!match) continue
    // Substitute :params from the matched route into the parent template.
    return parent.replace(/:(\w+)/g, (_, key: string) => match.params[key] ?? '')
  }
  const trimmed = pathname.replace(/\/[^/]+$/, '')
  return trimmed || '/dashboard'
}
