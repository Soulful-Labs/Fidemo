import type { NotificationKind } from '../../mock/types'

const PATHS: Record<NotificationKind, string> = {
  study: 'M6 3h9l4 4v14H6zM14 3v5h5',
  session: 'M3 7h11v10H3zM14 11l7-4v10l-7-4',
  money: 'M3 8a2 2 0 0 1 2-2h12v3M3 8v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M3 8h16a2 2 0 0 1 2 2v1h-5a2 2 0 0 0 0 4h5',
  points: 'M12 3l2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8z',
  tier: 'M5 7l4 3 3-5 3 5 4-3-2 11H7z',
  trust: 'M12 3l7 3v6c0 4.4-3 8.2-7 9-4-.8-7-4.6-7-9V6z',
  support: 'M4 5h16v11H9l-5 4z',
  referral: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M17 8h4M19 6v4',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-6 8-6s8 2 8 6',
}

/** One icon per notification kind (PRD 5.3: icon, title, body, timestamp). */
export default function NotificationIcon({ kind }: { kind: NotificationKind }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className="shrink-0">
      <path d={PATHS[kind]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
