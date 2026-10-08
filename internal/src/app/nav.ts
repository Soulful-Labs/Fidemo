import type { ComponentType, SVGProps } from 'react'
import { matchPath } from 'react-router-dom'
import {
  ClientsIcon, DashboardIcon, FinanceIcon, ParticipantsIcon, PricingIcon, StudiesIcon, SubAdminIcon, SupportIcon,
} from '../components/ui/icons'

export interface NavChild { key: string; label: string; to: string; owns: string[] }
export interface NavItem {
  key: string
  label: string
  to: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: string
  /** Route prefixes this item lights up for. */
  owns: string[]
  children?: NavChild[]
}

/**
 * The two groups in the Sidebar asset (1857:127510), in order. Badges are the
 * numbers drawn on every frame: Dashboard 2, Support 7.
 */
export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Users',
    items: [
      { key: 'dashboard', label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon, badge: '2', owns: ['/dashboard'] },
      { key: 'studies', label: 'Studies', to: '/studies', Icon: StudiesIcon, owns: ['/studies'] },
      {
        key: 'participants', label: 'Participants', to: '/participants', Icon: ParticipantsIcon, owns: ['/participants'],
        children: [
          { key: 'participants-all', label: 'All Participants', to: '/participants', owns: ['/participants'] },
          { key: 'participants-verifications', label: 'Verifications', to: '/participants/verifications', owns: ['/participants/verifications'] },
        ],
      },
      {
        key: 'clients', label: 'Clients', to: '/clients', Icon: ClientsIcon, owns: ['/clients'],
        children: [
          { key: 'clients-all', label: 'All Clients', to: '/clients', owns: ['/clients'] },
          { key: 'clients-verifications', label: 'Verifications', to: '/clients/verifications', owns: ['/clients/verifications'] },
        ],
      },
      { key: 'support', label: 'Support', to: '/support', Icon: SupportIcon, badge: '7', owns: ['/support'] },
    ],
  },
  {
    group: 'Platform',
    items: [
      { key: 'finance', label: 'Finance', to: '/finance', Icon: FinanceIcon, owns: ['/finance'] },
      { key: 'pricing', label: 'Pricing & Rewards', to: '/pricing', Icon: PricingIcon, owns: ['/pricing'] },
      { key: 'sub-admin', label: 'Sub-Admin', to: '/sub-admin', Icon: SubAdminIcon, owns: ['/sub-admin'] },
    ],
  },
]

const owned = (owns: string[], pathname: string) =>
  owns.some((p) => matchPath({ path: p, end: false }, pathname) !== null)

/**
 * Which item and sub-item a route lights. Decided by the route, never copied
 * from a frame: several frames light the wrong item (Studies Ongoing and every
 * Review frame light Dashboard; the client verification detail lights
 * Participants > Verifications), and the nav corrects them. The most specific
 * child wins, so /participants/verifications lights Verifications, not All.
 */
export function activeNav(pathname: string): { item?: string; child?: string } {
  for (const { items } of NAV) {
    for (const item of items) {
      if (!owned(item.owns, pathname)) continue
      const child = item.children
        ?.filter((c) => owned(c.owns, pathname))
        .sort((a, b) => b.to.length - a.to.length)[0]
      return { item: item.key, child: child?.key }
    }
  }
  return {}
}
