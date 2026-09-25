/**
 * The two state machines stage two runs on.
 *
 * Rule 7: the 58 step workflow governs behaviour, so the states and the moves
 * between them come from the workflow, not from the frames. Figma still
 * governs every label, which is why `STUDY_TAG` and `RESPONDENT_TAG` sit
 * apart from the states themselves — a state is what a thing *is*, a tag is
 * what a frame *calls* it, and the two are not one to one.
 */

// ---------------------------------------------------------------- the study

export type StudyState =
  | 'draft'
  | 'in_review'
  | 'recruiting'
  | 'ongoing'
  | 'paused'
  | 'completed'
  | 'cancelled'

/**
 * Workflow steps 7, 9 and 11: the client submits, the team configures and
 * prices it, and **the team takes it live**. A study can never go from draft
 * straight to recruiting, which is why Publish Study lands on `in_review`.
 */
export const STUDY_MOVES: Record<StudyState, StudyState[]> = {
  draft: ['in_review', 'cancelled'],
  in_review: ['recruiting', 'draft', 'cancelled'],
  recruiting: ['ongoing', 'paused', 'completed', 'cancelled'],
  ongoing: ['paused', 'completed', 'cancelled'],
  paused: ['recruiting', 'ongoing', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const canMoveStudy = (from: StudyState, to: StudyState) => STUDY_MOVES[from].includes(to)

/** Which Studies tab a study is listed under. One state, one tab, never both. */
export const studyTab = (s: StudyState): 'drafts' | 'ongoing' | 'completed' =>
  s === 'draft' || s === 'in_review' ? 'drafts' : s === 'completed' || s === 'cancelled' ? 'completed' : 'ongoing'

// ------------------------------------------------------------ the respondent

export type RespondentState =
  | 'matched'
  | 'invited'
  | 'applied'
  | 'qualified'
  | 'disqualified'
  | 'recruited'
  | 'scheduled'
  | 'completed'
  | 'no_show'
  | 'rated'

/**
 * Workflow steps 24 to 52. `matched` is the AI shortlist (24, 31), `invited`
 * is the client selecting and the platform sending (26, 27), `applied` means
 * the pre-screener and the full screener are both passed (28, 29),
 * `qualified` is the team confirming the shortlist (32), `recruited` is the
 * incentive charged (33), and `completed` needs the session code from both
 * sides (42). Nothing skips a step.
 */
export const RESPONDENT_MOVES: Record<RespondentState, RespondentState[]> = {
  matched: ['invited'],
  invited: ['applied', 'disqualified'],
  applied: ['qualified', 'disqualified'],
  qualified: ['recruited', 'disqualified'],
  disqualified: [],
  recruited: ['scheduled', 'completed', 'no_show'],
  scheduled: ['completed', 'no_show', 'recruited'],
  completed: ['rated'],
  no_show: [],
  rated: [],
}

export const canMoveRespondent = (from: RespondentState, to: RespondentState) =>
  RESPONDENT_MOVES[from].includes(to)

/**
 * Which recruiting tab a respondent appears under. Matched and Invited are
 * the two halves of one tab; Recruited holds everyone the team confirmed;
 * Results holds everyone who finished. A respondent is in exactly one.
 */
export const respondentTab = (s: RespondentState): 'matched' | 'invited' | 'recruited' | 'results' | null => {
  if (s === 'matched') return 'matched'
  if (s === 'invited') return 'invited'
  if (s === 'applied' || s === 'qualified' || s === 'disqualified' || s === 'recruited' || s === 'scheduled') return 'recruited'
  if (s === 'completed' || s === 'rated' || s === 'no_show') return 'results'
  return null
}

/** Step 34: every applicant is given a status of red, yellow or green. */
export const applicantLight = (s: RespondentState): 'red' | 'yellow' | 'green' => {
  if (s === 'disqualified' || s === 'no_show') return 'red'
  if (s === 'applied' || s === 'invited' || s === 'matched') return 'yellow'
  return 'green'
}

/**
 * Step 46: the platform builds the payout list from verification, attendance
 * and completion. Only someone who finished is on it, and a no-show is not.
 */
export const isPayable = (s: RespondentState) => s === 'completed' || s === 'rated'

/** Step 33: the incentive is charged once the shortlist is confirmed. */
export const isCharged = (s: RespondentState) =>
  s === 'recruited' || s === 'scheduled' || s === 'completed' || s === 'rated' || s === 'no_show'

// ------------------------------------------------------------------- labels

/**
 * What a frame calls each state. Figma governs the words, so these are the
 * strings the status pill is drawn with. Two states have no frame at all —
 * `in_review` and `cancelled` are behaviour the workflow requires and the
 * designs never drew, and both are flagged in docs/Stage-Two-Conflicts.md.
 * Figma's "Billing" pill is not here because billing is not a state: it is a
 * completed study with a balance outstanding, derived in `statusTag`.
 */
export const STUDY_TAG: Record<StudyState, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  recruiting: 'Recruiting',
  ongoing: 'Ongoing',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/** What a frame calls each respondent state. */
export const RESPONDENT_TAG: Record<RespondentState, string> = {
  matched: 'Matched',
  invited: 'Invited',
  applied: 'Applied',
  qualified: 'Qualified',
  disqualified: 'Disqualified',
  recruited: 'Recruited',
  scheduled: 'Scheduled',
  completed: 'Completed',
  no_show: 'No-show',
  rated: 'Rated',
}
