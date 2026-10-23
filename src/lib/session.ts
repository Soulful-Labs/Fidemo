import type { Study } from '../mock/types'
import { sessionNotStarted } from '@shared/derive'
import { bookingShort } from './format'

/**
 * Why the next step on a booked session is not available yet: the session
 * has not started. On a scheduled session that step is Submit PIN (the
 * interviewer gives the code during the session); on a code-confirmed one it
 * is Complete Study. Null once the session has started.
 */
export function completeBlocker(study: Study, now: Date = new Date()): string | null {
  if ((study.status !== 'pin_confirmed' && study.status !== 'scheduled') || !study.booking) return null
  if (!sessionNotStarted(study.booking, now)) return null
  const when = bookingShort(study.booking.date, study.booking.slot)
  return study.status === 'scheduled'
    ? `Your session starts ${when}. Your interviewer gives you the code during the session.`
    : `Your session starts ${when}. Complete the study once it has run.`
}
