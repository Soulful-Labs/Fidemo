import type { StudyStatus } from '../mock/types'
import type { TagTone } from '../components/ui/Tag'

/**
 * The study state machine, in one place. The card actions, the status tag and
 * the My Studies tab a study appears in are all derived from status and nothing
 * else, per the brief.
 *
 * The numeric business rules (Trust Score, points, fees) arrive with the store
 * in turn 4.
 */

export type MyStudiesTab = 'invites' | 'scheduled' | 'drafts' | 'applied' | 'history'

export interface StatusMeta {
  /** Status tag shown on the card and in History. */
  label: string
  tone: TagTone
  /** Invite flag across the top of the card (PRD 6.4). */
  flag?: string
  /** Primary action label, absent when the study is view only. */
  primary?: string
  /** Secondary action, e.g. Join Call alongside Submit PIN. */
  secondary?: string
  /** Shown as a Reject action on invite cards. */
  rejectable?: boolean
  tab?: MyStudiesTab
}

export const STATUS: Record<StudyStatus, StatusMeta> = {
  available: { label: 'Open', tone: 'neutral', primary: 'Apply' },
  invited_to_apply: {
    label: 'Invited', tone: 'yellow', flag: "You're Invited To Apply!",
    primary: 'Accept & Apply', secondary: 'View Details', rejectable: true, tab: 'invites',
  },
  applying: { label: 'Applying', tone: 'yellow' },
  draft: { label: 'In Draft', tone: 'yellow', primary: 'Resume Application', tab: 'drafts' },
  applied: { label: 'In Review', tone: 'yellow', tab: 'applied' },
  invited_to_schedule: {
    label: 'Invited To Schedule', tone: 'green', flag: "You're Invited To Schedule!",
    primary: 'Schedule Session', rejectable: true, tab: 'invites',
  },
  invited_to_complete: {
    label: 'Invited To Complete', tone: 'green', flag: 'Invited To Complete',
    primary: 'Start Study', rejectable: true, tab: 'invites',
  },
  scheduled: {
    label: 'Scheduled', tone: 'green', primary: 'Submit PIN',
    secondary: 'Join Call', tab: 'scheduled',
  },
  pin_confirmed: {
    label: 'PIN Confirmed', tone: 'green', primary: 'Complete Study', tab: 'scheduled',
  },
  in_process: { label: 'In Process', tone: 'blue', tab: 'history' },
  // danger tone is reserved for things that are wrong, per the colour rule.
  paid: { label: 'Paid', tone: 'green', primary: 'Rate Client', tab: 'history' },
  rejected: { label: 'Rejected', tone: 'danger', tab: 'history' },
  no_show: { label: 'No Show', tone: 'danger', tab: 'history' },
}

/** Statuses listed under each My Studies sub-tab. */
export function statusesForTab(tab: MyStudiesTab): StudyStatus[] {
  return (Object.keys(STATUS) as StudyStatus[]).filter((s) => STATUS[s].tab === tab)
}

/** Explore shows what is open to apply for, plus outstanding invitations. */
export function isExplorable(status: StudyStatus): boolean {
  return status === 'available' || status === 'invited_to_apply'
}
