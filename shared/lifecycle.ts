/**
 * The two state machines the platform runs on, and which moves are legal.
 *
 * The 58 step workflow governs behaviour, so the states and the moves come
 * from it. A state is what a thing is; what each app calls it is a label,
 * and the labels sit apart at the bottom so each app keeps its frames' words.
 */
import type { Participation, ParticipationState, Study, StudyState, StudyType } from './types'
import { isSessionType } from './platform'

// ---------------------------------------------------------------- the study

/**
 * Workflow 7, 9 and 11: the client submits, the team reviews, and only the
 * team takes it live. A study never goes from draft straight to recruiting.
 */
export const STUDY_MOVES: Record<StudyState, StudyState[]> = {
  draft: ['in_review', 'cancelled'],
  in_review: ['recruiting', 'draft', 'cancelled'],
  recruiting: ['ongoing', 'paused', 'completed', 'cancelled'],
  ongoing: ['paused', 'completed', 'cancelled'],
  paused: ['recruiting', 'ongoing', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const canMoveStudy = (from: StudyState, to: StudyState): boolean => STUDY_MOVES[from].includes(to)

/** A study respondents can see and apply to. */
export const isLive = (s: StudyState): boolean => s === 'recruiting' || s === 'ongoing'

/** A study the team has approved at some point. */
export const isApproved = (s: StudyState): boolean => s !== 'draft' && s !== 'in_review' && s !== 'cancelled'

/** Client app: which Studies tab a study is listed under. */
export const studyTab = (s: StudyState): 'drafts' | 'ongoing' | 'completed' =>
  s === 'draft' || s === 'in_review' ? 'drafts' : s === 'completed' || s === 'cancelled' ? 'completed' : 'ongoing'

/** Console: which Studies tab a study is listed under. Drafts are the client's own and never reach the console. */
export const consoleStudyTab = (s: StudyState): 'review' | 'ongoing' | 'completed' | null =>
  s === 'in_review' ? 'review' : s === 'draft' ? null : s === 'completed' || s === 'cancelled' ? 'completed' : 'ongoing'

// ---------------------------------------------------------- the participation

/**
 * Workflow 24 to 52.
 *   matched     the shortlist the search produced (24, 31)
 *   invited     the client selected them and the platform sent the invitation (26, 27)
 *   applying    the person is answering the screener (28, 29)
 *   draft       they saved and left part way
 *   applied     pre-screener and screener both passed; waiting on a decision (29, 34 yellow)
 *   qualified   a person on the client's side or the team confirmed them (32, 34 green)
 *   recruited   the incentive has been charged for them (33)
 *   scheduled   a session is booked (38)
 *   completed   they took part; the session code proves it for session studies (42)
 *   no_show     they did not turn up (43)
 *   disqualified  the screener or a person ruled them out (34 red)
 *   withdrawn   they turned the invitation down or cancelled
 *
 * Being rated and being paid are facts about a completed participation
 * (`rating`, `paidAt`), not states of their own.
 */
export const PARTICIPATION_MOVES: Record<ParticipationState, ParticipationState[]> = {
  matched: ['invited', 'applying'],
  invited: ['applying', 'withdrawn', 'disqualified'],
  applying: ['draft', 'applied', 'disqualified', 'withdrawn'],
  draft: ['applying', 'applied', 'withdrawn'],
  applied: ['qualified', 'disqualified'],
  /** `applied` is the undo of a qualify. */
  qualified: ['recruited', 'scheduled', 'completed', 'disqualified', 'applied', 'withdrawn'],
  /** `applied` is the undo of a disqualify. */
  disqualified: ['applied'],
  recruited: ['scheduled', 'completed', 'no_show', 'withdrawn'],
  /** `recruited` is the booking being released; `scheduled` again is a reschedule. */
  scheduled: ['scheduled', 'completed', 'no_show', 'recruited', 'withdrawn'],
  /** `scheduled` is the undo of Mark Completed, allowed until the payout is approved. */
  completed: ['scheduled'],
  /** The undo of a no-show, and "Mark back as Completed from No-show". */
  no_show: ['scheduled', 'completed'],
  withdrawn: ['applying', 'invited'],
}

export const canMoveParticipation = (from: ParticipationState, to: ParticipationState): boolean =>
  PARTICIPATION_MOVES[from].includes(to)

/** Has answered the screener and been put forward. */
export const hasApplied = (s: ParticipationState): boolean =>
  s === 'applied' || s === 'qualified' || s === 'disqualified' || s === 'recruited' || s === 'scheduled' || s === 'completed' || s === 'no_show'

/** Confirmed by the client or the team. */
export const hasQualified = (s: ParticipationState): boolean =>
  s === 'qualified' || s === 'recruited' || s === 'scheduled' || s === 'completed' || s === 'no_show'

/** Workflow 33: the incentive is charged once the shortlist is confirmed. */
export const isCharged = (s: ParticipationState): boolean =>
  s === 'recruited' || s === 'scheduled' || s === 'completed' || s === 'no_show'

/** Workflow 46: only someone who finished is on the payout list. */
export const isPayable = (s: ParticipationState): boolean => s === 'completed'

/** Workflow 34: every applicant is given a status of red, yellow or green. */
export const applicantLight = (s: ParticipationState): 'red' | 'yellow' | 'green' => {
  if (s === 'disqualified' || s === 'no_show' || s === 'withdrawn') return 'red'
  if (s === 'applied' || s === 'invited' || s === 'matched' || s === 'applying' || s === 'draft') return 'yellow'
  return 'green'
}

/** Client app and console: which recruiting tab a participation appears under. */
export const recruitingTab = (s: ParticipationState): 'matched' | 'invited' | 'recruited' | 'results' | null => {
  if (s === 'matched') return 'matched'
  if (s === 'invited') return 'invited'
  if (s === 'applied' || s === 'qualified' || s === 'disqualified' || s === 'recruited' || s === 'scheduled') return 'recruited'
  if (s === 'completed' || s === 'no_show') return 'results'
  return null
}

// ------------------------------------------------------------------- labels

/** Client app: what a frame calls each study state. */
export const STUDY_TAG: Record<StudyState, string> = {
  draft: 'Draft', in_review: 'In Review', recruiting: 'Recruiting', ongoing: 'Ongoing',
  paused: 'Paused', completed: 'Completed', cancelled: 'Cancelled',
}

/**
 * Client app: the tag on a participation. "Rated" is a completed
 * participation the client has rated, so it is read off the record.
 */
export type ClientTag = ParticipationState | 'rated'
export const clientTag = (p: Participation): ClientTag => (p.state === 'completed' && p.rating ? 'rated' : p.state)
export const CLIENT_TAG: Record<ClientTag, string> = {
  matched: 'Matched', invited: 'Invited', applying: 'Applying', draft: 'Applying', applied: 'Applied',
  qualified: 'Qualified', disqualified: 'Disqualified', recruited: 'Recruited', scheduled: 'Scheduled',
  completed: 'Completed', no_show: 'No-show', withdrawn: 'Withdrawn', rated: 'Rated',
}

/** Console: the Applications table draws three statuses only. */
export const consoleApplicationTag = (s: ParticipationState): 'Applied' | 'Qualified' | 'Disqualified' =>
  s === 'applied' ? 'Applied' : s === 'disqualified' ? 'Disqualified' : 'Qualified'

/**
 * Respondent app: what the person sees of their own participation. The
 * respondent PRD's fifteen statuses are a view of the participation record,
 * not a second state machine.
 */
export type RespondentStatus =
  | 'available' | 'invited_to_apply' | 'applying' | 'draft' | 'applied'
  | 'invited_to_schedule' | 'invited_to_complete' | 'scheduled' | 'pin_confirmed'
  | 'in_process' | 'paid' | 'rejected' | 'no_show' | 'late_show' | 'not_needed'

export function respondentStatus(type: StudyType, p: Participation | undefined): RespondentStatus {
  if (!p) return 'available'
  switch (p.state) {
    /** Being shortlisted is not something the person is told. */
    case 'matched': case 'withdrawn': return 'available'
    case 'invited': return 'invited_to_apply'
    case 'applying': return 'applying'
    case 'draft': return 'draft'
    case 'applied': return 'applied'
    case 'qualified': case 'recruited': return isSessionType(type) ? 'invited_to_schedule' : 'invited_to_complete'
    case 'scheduled': return p.code?.byParticipant ? 'pin_confirmed' : 'scheduled'
    case 'completed':
      if (!p.paidAt) return 'in_process'
      return p.notNeeded ? 'not_needed' : p.lateShow ? 'late_show' : 'paid'
    case 'disqualified': return 'rejected'
    case 'no_show': return 'no_show'
  }
}

/** The participation of one person on a study, if any. */
export const participationOf = (study: Study, personId: string): Participation | undefined =>
  study.participations.find((p) => p.personId === personId)
