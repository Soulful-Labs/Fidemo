import type { Study } from '../mock/types'
import { bookingShort } from './format'

/** The moment a booked session starts: the booked day at the slot's time. */
export function sessionStartsAt(booking: NonNullable<Study['booking']>): Date {
  const d = new Date(booking.date)
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(booking.slot.trim())
  if (m) {
    let h = Number(m[1]) % 12
    if (m[3].toUpperCase() === 'PM') h += 12
    d.setHours(h, Number(m[2]), 0, 0)
  }
  return d
}

/**
 * Why "Complete Study" is not available yet on a code-confirmed session:
 * the session has not started. Null once it has.
 */
export function completeBlocker(study: Study, now: Date = new Date()): string | null {
  if (study.status !== 'pin_confirmed' || !study.booking) return null
  return sessionStartsAt(study.booking) > now
    ? `Your session starts ${bookingShort(study.booking.date, study.booking.slot)}. Complete the study once it has run.`
    : null
}
