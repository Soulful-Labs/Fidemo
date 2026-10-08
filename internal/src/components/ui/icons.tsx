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

/* Review a new study (turn 4): the tab icons and the small glyphs in its tags and rows. */
export const InfoIcon = (p: P) => <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.01" /></svg>
export const AudienceIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="10" r="2.5" /><path d="M8 16.5c.8-1.6 2.2-2.5 4-2.5s3.2.9 4 2.5" /></svg>
)
export const ScreenerIcon = (p: P) => <svg {...base(p)}><rect x="3.5" y="4.5" width="17" height="15" rx="3.5" /><path d="M7.5 9.5h1M11.5 9.5h5M7.5 14.5h1M11.5 14.5h5" /></svg>
export const ClipboardIcon = (p: P) => <svg {...base(p)}><rect x="5" y="4.5" width="14" height="16" rx="3" /><path d="M9 3.5h6v3H9zM9 11h6M9 15h6" /></svg>
export const CardIcon = (p: P) => <svg {...base(p)}><rect x="3" y="5.5" width="18" height="13" rx="3.5" /><path d="M3 10h18M7 14.5h3" /></svg>
export const HistoryIcon = (p: P) => <svg {...base(p)}><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9M4.5 5v4h4M12 8.5V12l2.5 1.5" /></svg>
export const UsersIcon = (p: P) => <svg {...base(p)}><circle cx="9.5" cy="8.5" r="3" /><path d="M3.5 19c.6-3 2.9-4.8 6-4.8s5.4 1.800 6 4.8M15 6a3 3 0 0 1 0 5.500M17.500 14.800c1.600.700 2.700 2.100 3 4.200" /></svg>
export const ReceiptIcon = (p: P) => <svg {...base(p)}><rect x="5" y="3.5" width="14" height="17" rx="2.500" /><path d="M12 7.500v9M14.200 9.700c-.400-.800-1.200-1.200-2.200-1.200-1.300 0-2.200.700-2.200 1.700 0 2.400 4.600 1.200 4.600 3.600 0 1-1 1.700-2.400 1.700-1.100 0-2-.500-2.400-1.300" /></svg>
export const CalendarIcon = (p: P) => <svg {...base(p)}><rect x="4" y="5.500" width="16" height="15" rx="3" /><path d="M4 10h16M8.500 3.500v4M15.500 3.500v4M8.500 14h.01M12 14h.01M15.500 14h.01M8.500 17h.01M12 17h.01" /></svg>
export const MailIcon = (p: P) => <svg {...base(p)}><rect x="3.500" y="5.500" width="17" height="13" rx="3" /><path d="m4.500 8 7.500 5 7.500-5" /></svg>
export const VerifiedIcon = (p: P) => <svg {...base(p)}><circle cx="12" cy="12" r="8.500" /><path d="m8.500 12.300 2.400 2.400 4.800-5" /></svg>
export const ClockIcon = (p: P) => <svg {...base(p)}><circle cx="12" cy="12" r="8.500" /><path d="M12 7.500V12l3 2" /></svg>
export const PinIcon = (p: P) => <svg {...base(p)}><path d="M12 21s6.500-5.600 6.500-11a6.500 6.500 0 0 0-13 0c0 5.400 6.500 11 6.500 11Z" /><circle cx="12" cy="10" r="2.500" /></svg>
export const DownloadIcon = (p: P) => <svg {...base(p)}><path d="M12 4v11M7.500 11l4.500 4.500 4.500-4.500M5 19.500h14" /></svg>

/* Manage a study (turn 5). */
export const CopyIcon = (p: P) => <svg {...base(p)}><rect x="8.500" y="8.500" width="11" height="11" rx="2.500" /><path d="M15.500 8.500V7a2.500 2.500 0 0 0-2.500-2.500H7A2.500 2.500 0 0 0 4.500 7v6A2.500 2.500 0 0 0 7 15.500h1.500" /></svg>
export const ExternalIcon = (p: P) => <svg {...base(p)}><path d="M11 5.500H8A3.500 3.500 0 0 0 4.500 9v7A3.500 3.500 0 0 0 8 19.500h7a3.500 3.500 0 0 0 3.500-3.500v-3M13.500 4.500h6v6M19.500 4.500 11 13" /></svg>
