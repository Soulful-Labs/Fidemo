import { DECISION_UNDO_MS } from '@shared/platform'
import { platform } from '@shared/store'
import type { Participation } from '@shared/types'
import { TEAM, say } from '../platform'

/**
 * The team's attendance and screener decisions, through the shared store.
 * Every one is logged under the team member's name; a refused one says why.
 */

/** Workflow 42: "no code, no payment". The console confirms the session code shown on the page, then completes. */
export function markCompleted(studyId: string, personId: string): boolean {
  const p = platform()
  const part = p.getState().studies.find((s) => s.id === studyId)?.participations.find((x) => x.personId === personId)
  if (part?.code && !part.code.byClient) {
    if (!say(p.enterClientCode(studyId, personId, part.code.value))) return false
  }
  return say(p.complete(studyId, personId, TEAM))
}

/**
 * Workflow 43: a no-show is not paid. Someone already marked completed but
 * not yet paid is first marked back, then as a no-show; once paid it is refused.
 */
export function markNoShow(studyId: string, personId: string): boolean {
  const p = platform()
  const part = p.getState().studies.find((s) => s.id === studyId)?.participations.find((x) => x.personId === personId)
  if (part?.state === 'completed' && !part.paidAt && !say(p.uncomplete(studyId, personId, TEAM))) return false
  return say(p.markNoShow(studyId, personId, TEAM))
}

/** Undo of either mark: back to the booked session. */
export const undoAttendance = (studyId: string, part: Participation) =>
  say(part.state === 'no_show' ? platform().undoNoShow(studyId, part.personId, TEAM) : platform().uncomplete(studyId, part.personId, TEAM))

export const decide = (studyId: string, personId: string, to: 'qualified' | 'disqualified' | 'applied') => say(platform().decide(studyId, personId, to, TEAM))

/** The one hour the store allows a screener decision to be undone in. */
export const canUndoDecision = (part: Participation, now = Date.now()) =>
  (part.state === 'qualified' || part.state === 'disqualified') && Boolean(part.decidedAt) && now - new Date(part.decidedAt!).getTime() <= DECISION_UNDO_MS

export const rate = (studyId: string, personId: string, d: { expertise: number; reliability: number; communication: number; comment?: string }) =>
  say(platform().rateParticipant(studyId, personId, 'dimensions', d, TEAM))
