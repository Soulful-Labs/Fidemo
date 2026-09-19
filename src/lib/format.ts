/** Display formatters. All amounts are USD, all session times are US Eastern (PRD 13). */

/** $624.48, $150, $0 — cents only when the value has them. */
export function money(amount: number): string {
  const hasCents = !Number.isInteger(amount)
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/** Signed amount for deltas, e.g. "+$260". */
export function moneyDelta(amount: number): string {
  return `${amount >= 0 ? '+' : '-'}${money(Math.abs(amount))}`
}

/** "$150 USD", the study card reward format. */
export function reward(amount: number): string {
  return `${money(amount)} USD`
}

/** 1,244 */
export function points(value: number): string {
  return value.toLocaleString('en-US')
}

/** "45 min" */
export function duration(minutes: number): string {
  return `${minutes} min`
}

/** "18 days left", "1 day left", "Last day" */
export function daysLeft(days: number): string {
  if (days <= 0) return 'Last day'
  return `${days} day${days === 1 ? '' : 's'} left`
}

/** "Sep 30, 2026" */
export function dateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "May 13, 10:36 AM" — the timeline format. */
export function dateTime(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date}, ${time}`
}

/** "Tue, May 20 10:30 AM ET" — the scheduled booking format. */
export function bookingWhen(iso: string, slot: string): string {
  const d = new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${d} ${slot} ET`
}

/** "2h ago", "3d ago" — notification timestamps. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const secs = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000))
  const mins = Math.floor(secs / 60)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : dateLong(iso)
}

/** "Good morning" / "Good afternoon" / "Good evening" (PRD 5.1). */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
