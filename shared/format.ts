/**
 * How the client app and the console write dates and money. Presentation
 * only: nothing here counts or adds anything up.
 */
const fmt = (iso: string, o: Intl.DateTimeFormatOptions, locale = 'en-US') => new Date(iso).toLocaleDateString(locale, o)

/** "30 Jul, 2026" */
export const dayMonthYear = (iso?: string): string =>
  iso ? fmt(iso, { day: '2-digit', month: 'short', year: 'numeric' }, 'en-GB').replace(/ (\d{4})$/, ', $1') : ''

/** "Jan 25" */
export const monthDay = (iso?: string): string => (iso ? fmt(iso, { month: 'short', day: 'numeric' }) : '')

/** "Aug 10, 2026" */
export const monthDayYear = (iso?: string): string => (iso ? fmt(iso, { month: 'short', day: 'numeric', year: 'numeric' }) : '')

/** "10 August, 2026" */
export const dayLongMonthYear = (iso?: string): string =>
  iso ? fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' }, 'en-GB').replace(/ (\d{4})$/, ', $1') : ''

/** "04:26 PM" */
export const clockTime = (iso?: string): string =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

/** "Aug 5, 2026, 10:24 AM" */
export const monthDayYearTime = (iso?: string): string => (iso ? `${monthDayYear(iso)}, ${clockTime(iso)}` : '')

/** "July 10, 2026, 02:30 PM" */
export const longDateTime = (iso?: string): string =>
  iso ? `${fmt(iso, { month: 'long', day: 'numeric', year: 'numeric' })}, ${clockTime(iso)}` : ''

/** "August 12, 2026, Wednesday" */
export const longDay = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
}

/** "12 Aug, Wed" */
export const slotDay = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.toLocaleDateString('en-US', { weekday: 'short' })}`
}

/** "Aug 16, Sunday" */
export const dayHeading = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
}

/** "Today" for today, otherwise "Oct 1, 2026". */
export const dayOrToday = (iso?: string, now: Date = new Date()): string =>
  !iso ? '' : new Date(iso).toDateString() === now.toDateString() ? 'Today' : monthDayYear(iso)

/** "$3,350", "$124.8", "-$500" */
export const money = (n: number): string => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`

export const count = (n: number): string => n.toLocaleString('en-US')

/** "1 study", "5 studies" */
export const plural = (n: number, one: string, many = `${one}s`): string => `${count(n)} ${n === 1 ? one : many}`
