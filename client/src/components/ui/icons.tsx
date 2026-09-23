import { cn } from '../../lib/cn'

interface IconProps { className?: string }
const base = 'shrink-0'
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const icon = (path: React.ReactNode, viewBox = '0 0 24 24') =>
  function Icon({ className }: IconProps) {
    return <svg viewBox={viewBox} width="20" height="20" className={cn(base, className)} aria-hidden="true">{path}</svg>
  }

// ----- Left navigation (826:85021) -----
export const DashboardIcon = icon(<><rect x="3" y="3" width="7" height="7" rx="2" {...stroke} /><rect x="14" y="3" width="7" height="7" rx="2" {...stroke} /><rect x="3" y="14" width="7" height="7" rx="2" {...stroke} /><rect x="14" y="14" width="7" height="7" rx="2" {...stroke} /></>)
export const StudiesIcon = icon(<><rect x="5" y="3" width="14" height="18" rx="3" {...stroke} /><path d="M9 8h6M9 12h6M9 16h4" {...stroke} /></>)
export const PoolIcon = icon(<><circle cx="9" cy="8" r="3.2" {...stroke} /><path d="M3 19c0-3.2 2.7-5 6-5s6 1.8 6 5" {...stroke} /><path d="M16 5.5a3 3 0 0 1 0 5.8M18 19c0-2.4-.9-4-2.4-5" {...stroke} /></>)
export const PaymentsIcon = icon(<><rect x="3" y="6" width="18" height="13" rx="3" {...stroke} /><path d="M3 10.5h18" {...stroke} /></>)
export const BellIcon = icon(<><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" {...stroke} /><path d="M10.5 20a2 2 0 0 0 3 0" {...stroke} /></>)
export const HelpIcon = icon(<><circle cx="12" cy="12" r="9" {...stroke} /><path d="M9.6 9.3a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.4M12 16.6v.4" {...stroke} /></>)

// ----- Chrome -----
export const ChevronRight = icon(<path d="m9 5 7 7-7 7" {...stroke} />)
export const ChevronLeft = icon(<path d="m15 5-7 7 7 7" {...stroke} />)
export const ChevronDown = icon(<path d="m5 9 7 7 7-7" {...stroke} />)
export const Close = icon(<path d="m6 6 12 12M18 6 6 18" {...stroke} />)
export const Plus = icon(<path d="M12 5v14M5 12h14" {...stroke} />)
export const Search = icon(<><circle cx="11" cy="11" r="7" {...stroke} /><path d="m16.5 16.5 4 4" {...stroke} /></>)
export const MoreVertical = icon(<><circle cx="12" cy="5.5" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="18.5" r="1.4" fill="currentColor" /></>)
export const LinkIcon = icon(<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" {...stroke} />)
export const SortIcon = icon(<path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" {...stroke} />)
export const GridIcon = icon(<><rect x="4" y="4" width="7" height="7" rx="1.5" {...stroke} /><rect x="13" y="4" width="7" height="7" rx="1.5" {...stroke} /><rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} /><rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} /></>)
export const Star = icon(<path d="m12 4 2.5 5.2 5.5.8-4 4 .9 5.6L12 17l-4.9 2.6.9-5.6-4-4 5.5-.8L12 4Z" {...stroke} />)
export const Calendar = icon(<><rect x="3.5" y="5" width="17" height="16" rx="3" {...stroke} /><path d="M8 3v4m8-4v4M3.5 10h17" {...stroke} /></>)
export const Clock = icon(<><circle cx="12" cy="12" r="9" {...stroke} /><path d="M12 7.5V12l3 2" {...stroke} /></>)
export const Check = icon(<path d="m5 13 4.5 4.5L19 7" {...stroke} />)
export const CheckCircle = icon(<><circle cx="12" cy="12" r="9" {...stroke} /><path d="m8.5 12.5 2.5 2.5 4.5-5" {...stroke} /></>)
export const Info = icon(<><circle cx="12" cy="12" r="9" {...stroke} /><path d="M12 11v5.5M12 7.8v.4" {...stroke} /></>)
export const Upload = icon(<><path d="M12 16V4m0 0-4 4m4-4 4 4" {...stroke} /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" {...stroke} /></>)
export const Edit = icon(<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" {...stroke} />)
export const Trash = icon(<><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" {...stroke} /></>)
export const Copy = icon(<><rect x="8" y="8" width="12" height="12" rx="2.5" {...stroke} /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" {...stroke} /></>)

// ----- Study type tags (the card and table tags) -----
export const SurveyIcon = icon(<><path d="M6 20V10m6 10V4m6 16v-7" {...stroke} /></>)
export const VideoIcon = icon(<><rect x="3" y="6" width="12" height="12" rx="3" {...stroke} /><path d="m15 11 6-3.5v9L15 13" {...stroke} /></>)
export const GroupVideoIcon = icon(<><rect x="2.5" y="7" width="11" height="10" rx="2.5" {...stroke} /><path d="m13.5 11 5-3v8l-5-3" {...stroke} /><circle cx="19" cy="17" r="2" {...stroke} /></>)
export const InPersonIcon = icon(<><circle cx="12" cy="7.5" r="3.2" {...stroke} /><path d="M5.5 20c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5" {...stroke} /></>)
export const InPersonGroupIcon = icon(<><circle cx="9" cy="8" r="3" {...stroke} /><circle cx="17" cy="9" r="2.4" {...stroke} /><path d="M3 19c0-3 2.6-4.8 6-4.8s6 1.8 6 4.8M16 14.5c2.7 0 5 1.5 5 4.5" {...stroke} /></>)
export const DiaryIcon = icon(<><rect x="5" y="3" width="14" height="18" rx="3" {...stroke} /><path d="M9 8h6M9 12h6M9 16h3" {...stroke} /><path d="M5 7h3" {...stroke} /></>)

// ----- Tier and score marks -----
export const TrustMark = icon(<><circle cx="12" cy="12" r="8" {...stroke} /><path d="M12 8.2 13.4 11l3.1.4-2.3 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.3-2.1 3.1-.4L12 8.2Z" {...stroke} /></>)
export const PlatinumMark = icon(<path d="M7 5h10l4 5-9 9-9-9 4-5Z" {...stroke} />)
export const GoldMark = icon(<path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" {...stroke} />)
export const SilverMark = icon(<path d="m12 4 2.5 5.2 5.5.8-4 4 .9 5.6L12 17l-4.9 2.6.9-5.6-4-4 5.5-.8L12 4Z" {...stroke} />)
export const VerifiedMark = icon(<><circle cx="12" cy="12" r="8.5" {...stroke} /><path d="m8.5 12.3 2.4 2.4 4.6-5" {...stroke} /></>)
export const MoneyMark = icon(<><circle cx="12" cy="12" r="8.5" {...stroke} /><path d="M12 7.5v9M14.2 9.8c0-1-1-1.7-2.2-1.7s-2.2.7-2.2 1.7 1 1.7 2.2 1.7 2.2.7 2.2 1.7-1 1.7-2.2 1.7-2.2-.7-2.2-1.7" {...stroke} /></>)
