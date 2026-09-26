import type { NotificationRow } from '../mock/dashboard'

/**
 * Where a notification goes when you click it.
 *
 * The rows were not clickable at all: the whole row did nothing and the
 * action button only closed the panel. Each kind now routes to the screen it
 * is about, which is what the PRD's notification table asks for — a row with
 * an action goes where the action says, and a row without one goes to the
 * related screen.
 *
 * The seeded rows name studies that are not in the study list (the frame's
 * own copy), so each kind falls back to the study the client is most likely
 * to mean: the one that notification would have been raised on.
 */
export function notificationRoute(n: NotificationRow, studyIds: string[]): string {
  const first = studyIds[0] ?? 'st-pay'
  const completed = studyIds[2] ?? first
  switch (n.icon) {
    case 'study':
      /** "Your study is live" — open the study. */
      return `/studies/${first}`
    case 'respondent':
      /** "New respondent applied" / Review Screener — the recruiting tab. */
      return `/studies/${first}/recruited`
    case 'session':
    case 'reminder':
      /** A booking or a session about to start — the scheduled list. */
      return `/studies/${first}/recruited`
    case 'completion':
    case 'target':
      /** "View Results" — the results tab. */
      return `/studies/${completed}/results`
    case 'invoice':
      /** "Pay Invoice" — the invoices. */
      return '/payments'
    case 'message':
      /** "View Message" — the support thread. */
      return '/help?tab=tickets'
    default:
      return '/notifications'
  }
}
