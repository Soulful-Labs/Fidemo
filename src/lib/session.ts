import type { Study } from '../mock/types'
import { sessionNotStarted } from '@shared/derive'
import { bookingShort } from './format'

/**
 * Why "Complete Study" is not available yet on a code-confirmed session:
 * the session has not started. Null once it has.
 */
export function completeBlocker(study: Study, now: Date = new Date()): string | null {
  if (study.status !== 'pin_confirmed' || !study.booking) return null
  return sessionNotStarted(study.booking, now)
    ? `Your session starts ${bookingShort(study.booking.date, study.booking.slot)}. Complete the study once it has run.`
    : null
}
