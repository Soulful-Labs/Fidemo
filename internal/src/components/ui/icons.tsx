import type { SVGProps } from 'react'

/**
 * The console's line icons, redrawn on a 24px grid at the 1.5px stroke the
 * frames use. Each takes `className` for size and colour (currentColor).
 */
type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p })

export const DashboardIcon = (p: P) => (
  <svg {...base(p)}><rect x="3.5" y="3.5" width="7" height="7" rx="3.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="3.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="3.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="3.5" /></svg>
)
export const StudiesIcon = (p: P) => (
  <svg {...base(p)}><rect x="4.5" y="4" width="15" height="17" rx="3" /><path d="M8.5 2.5v3M15.5 2.5v3M8.5 10h7M8.5 13.5h7M8.5 17h4" /></svg>
)
export const ParticipantsIcon = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M14.5 4.8a3.5 3.5 0 0 1 0 6.4M17.5 14.6c2.3.7 4 2.7 4 5.4" /></svg>
)
export const ClientsIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 21h18M5 21V5.5L13 3v18M13 8l6 1.5V21" /><path d="M8 8h2M8 11.5h2M8 15h2M16 12.5h0M16 16h0" /></svg>
)
export const SupportIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="2" /><rect x="17" y="13" width="4" height="6" rx="2" /><path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2" /></svg>
)
export const FinanceIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 3v18M16.5 7.5c0-1.9-2-3.2-4.5-3.2S7.5 5.6 7.5 7.5s2 2.9 4.5 3.5 4.5 1.6 4.5 3.5-2 3.2-4.5 3.2-4.5-1.3-4.5-3.2" /></svg>
)
export const PricingIcon = (p: P) => (
  <svg {...base(p)}><path d="M3.5 6h1M8 6h12.5M3.5 12h1M8 12h12.5M3.5 18h1M8 18h12.5" /></svg>
)
export const SubAdminIcon = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.4 0 2.6.3 3.6.9" /><circle cx="17.5" cy="17.5" r="2" /><path d="M17.5 13.5v1.5M17.5 20v1.5M13.5 17.5H15M20 17.5h1.5" /></svg>
)
export const BellIcon = (p: P) => (
  <svg {...base(p)}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg>
)
export const EyeIcon = (p: P) => (
  <svg {...base(p)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const CloseIcon = (p: P) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
export const ChevronDown = (p: P) => <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
export const ChevronRight = (p: P) => <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
export const ChevronLeft = (p: P) => <svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>
export const ChevronUp = (p: P) => <svg {...base(p)}><path d="m6 15 6-6 6 6" /></svg>
export const SearchIcon = (p: P) => <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
export const SortIcon = (p: P) => <svg {...base(p)}><path d="M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5" /></svg>
export const CheckIcon = (p: P) => <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
export const LinkIcon = (p: P) => (
  <svg {...base(p)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" /></svg>
)
export const DotsIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="5.5" r=".8" fill="currentColor" /><circle cx="12" cy="12" r=".8" fill="currentColor" /><circle cx="12" cy="18.5" r=".8" fill="currentColor" /></svg>
)
export const MailCheckIcon = (p: P) => (
  <svg {...base(p)}><path d="M21 12V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h7" /><path d="m3.5 6.5 7.3 5a2 2 0 0 0 2.4 0l7.3-5" /><path d="m15.5 18.5 2 2 4-4" /></svg>
)
