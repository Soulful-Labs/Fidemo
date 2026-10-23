/**
 * What the respondent screens call each status and each refusal. Words only:
 * the states, the moves and the rules behind them are shared/lifecycle.ts,
 * shared/derive.ts and shared/store.ts.
 */
import type { StudyStatus } from '../mock/types'
import type { TagTone } from '../components/ui/Tag'
import type { Study } from '../mock/types'

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
    label: 'Code Confirmed', tone: 'green', primary: 'Complete Study', secondary: 'Join Call', tab: 'scheduled',
  },
  in_process: { label: 'In Process', tone: 'yellow', tab: 'history' },
  // danger tone is reserved for things that are wrong, per the colour rule.
  paid: { label: 'Paid', tone: 'green', primary: 'Rate Client', tab: 'history' },
  rejected: { label: 'Rejected', tone: 'danger', tab: 'history' },
  no_show: { label: 'No Show', tone: 'danger', tab: 'history' },
  // Policy deduction: took part but arrived late. Paid, -2 Trust Score.
  late_show: { label: 'Late Show Up', tone: 'yellow', primary: 'Rate Client', tab: 'history' },
  // Workflow 44: turned up but not needed. Paid in full, no penalty.
  not_needed: { label: 'Not needed', tone: 'green', tab: 'history' },
}

/**
 * Workflow 34: every application carries one of three outcomes. Yellow means
 * still under consideration, so the person can check back.
 */
export function outcomeFor(status: StudyStatus): { colour: 'green' | 'yellow' | 'red'; label: string } | null {
  switch (status) {
    case 'applied': return { colour: 'yellow', label: 'Under consideration' }
    case 'invited_to_schedule': case 'invited_to_complete': case 'scheduled': case 'pin_confirmed':
    case 'in_process': case 'paid': case 'not_needed':
      return { colour: 'green', label: 'Selected' }
    case 'rejected': return { colour: 'red', label: 'Not selected' }
    case 'no_show': return { colour: 'red', label: 'No show' }
    case 'late_show': return { colour: 'yellow', label: 'Late show up' }
    default: return null
  }
}

/** Statuses listed under each My Studies sub-tab. */
export function statusesForTab(tab: MyStudiesTab): StudyStatus[] {
  return (Object.keys(STATUS) as StudyStatus[]).filter((s) => STATUS[s].tab === tab)
}

/** Explore shows what is open to apply for, plus outstanding invitations. */
export function isExplorable(status: StudyStatus): boolean {
  return status === 'available' || status === 'invited_to_apply'
}

/** D38: what Explore and Recommended list: open to apply, and the person is in its audience (or was invited). */
export const isListed = (s: Pick<Study, 'status' | 'fits'>): boolean => isExplorable(s.status) && s.fits

/** Why a person cannot apply to a study right now, and what to do about it. */
export interface ApplyBlocker {
  kind: 'audience' | 'verify' | 'id_review' | 'premium' | 'credential_review' | 'repeat'
  title: string
  body: string
  action?: { label: string; to: string }
}

/** The words for each verdict shared/derive.ts applyBlocker can give. */
export function applyBlockerCopy(kind: ApplyBlocker['kind'] | null, clientName: string, misses: string[] = []): ApplyBlocker | null {
  switch (kind) {
    case null: return null
    // D38: the study's audience, in the categories the profile does not meet.
    case 'audience': return {
      kind, title: 'This study is for a different audience',
      body: `${clientName} set who this study is for, and your profile does not match its ${misses.length ? misses.join(', ') : 'audience'}. Studies that fit your profile are in Explore.`,
      action: { label: 'Update Profile', to: '/profile/edit' },
    }
    case 'verify': return {
      kind, title: 'Finish verification to apply',
      body: 'Applying needs a completed profile and a verified government ID. It takes about 2 minutes and is done once, then reused for every study.',
      action: { label: 'Verify now', to: '/onboarding/about' },
    }
    case 'id_review': return {
      kind, title: 'Your ID is in review',
      body: 'Our team is checking your ID. You can apply as soon as it is verified, and we will tell you when it is.',
    }
    case 'credential_review': return {
      kind, title: 'Your credential is in review',
      body: 'Premium studies open once our team has checked your professional credential against the register. We will tell you when it is verified.',
    }
    case 'premium': return {
      kind, title: 'Premium study, locked',
      body: 'Premium studies are the highest paid on the platform and need a verified professional credential, such as a medical or nursing licence, checked against the public register.',
      action: { label: 'Add a credential', to: '/profile/edit?tab=professional' },
    }
    case 'repeat': return {
      kind, title: 'Fresh participants only',
      body: `${clientName} has set this study to exclude anyone who has taken part in one of their studies before, and you have. Other studies from this client may still be open to you.`,
    }
  }
}

/** Copy for the repeat rule row on Study Details (workflow 57). */
export const REPEAT_RULE_COPY: Record<Study['repeatRule'], { label: string; note: string }> = {
  allow: { label: 'Repeat participants welcome', note: 'You can take part even if you have done a study for this client before.' },
  exclude: { label: 'First-time participants only', note: 'Anyone who has taken part in a study for this client before is excluded.' },
}
