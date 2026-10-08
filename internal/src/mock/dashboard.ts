/**
 * The Dashboard as drawn, state by state (section 1850:115647). Every number
 * and row is the frame's own text. The frames are not consistent with each
 * other (the All tab counts 16 identity verifications, the Onboarding tab 2;
 * the tab counts do not add up to All's 274), so each tab carries what its
 * own frame draws. Stage two replaces all of this with figures derived from
 * one source; CLAUDE.md, "Dashboard", names what each one counts.
 */

export interface Kpi { value: string; label: string }

/** The four tiles. Identical in all five frames. */
export const KPIS: Kpi[] = [
  { value: '264', label: 'Screeners To Review' },
  { value: '36', label: 'Onboarding To Verify' },
  { value: '7', label: 'Open Tickets' },
  { value: '18', label: 'Live studies' },
]

export interface ActionRow {
  id: string
  title: string
  /** The grey words after the title, separated by a dot ("Participant", "Nordic Field Labs"). */
  meta?: string
  /** Second line. Several parts are joined with a dot. */
  detail: string[]
  /** "124 screeners": the first part of the second line in title colour. */
  lead?: string
  thumb?: string
  when: string
  to: string
}

export interface ActionGroup {
  key: string
  title: string
  count: string
  /** Drawn collapsed: the chevron points down and the rows are hidden in the frame. */
  collapsed?: boolean
  viewAll: string
  rows: ActionRow[]
}

export type TabKey = 'all' | 'onboarding' | 'studies' | 'support' | 'manage'

export const TABS: { key: TabKey; label: string; count: string }[] = [
  { key: 'all', label: 'All', count: '274' },
  { key: 'onboarding', label: 'Onboarding', count: '4' },
  { key: 'studies', label: 'Studies', count: '264' },
  { key: 'support', label: 'Support', count: '3' },
  { key: 'manage', label: 'Manage', count: '6' },
]

const PENDING = 'Pending screeners applications to be reviewed for study'

const thomas: ActionRow = { id: 'iv-1', title: 'Thomas Rifer', detail: ['Selfie liveness check flagged for manual review.'], when: '2 hr ago', to: '/participants/verifications/iv-1' }
const nordic: ActionRow = { id: 'cv-1', title: 'Nordic Field Labs', detail: ["Tax registration number didn't match state records."], when: '1 hr ago', to: '/clients/verifications/cv-1' }
const harbor: ActionRow = { id: 'cv-2', title: 'Harborview Research', detail: ['Company website could not be reached.'], when: '16 Sep, 2:36 PM', to: '/clients/verifications/cv-2' }
const clientRows = [nordic, harbor]

const screenerRows: ActionRow[] = [
  { id: 'st-goal', title: 'About goal-tracking methods study', lead: '124 screeners', detail: [PENDING], thumb: '/img/studies/goal-tracking.png', when: '15 min ago', to: '/studies/st-goal' },
  { id: 'st-sleep', title: 'Share about your sleep cycle', lead: '86 screeners', detail: [PENDING], thumb: '/img/studies/sleep-cycle.png', when: '5 Sep, 10:16 AM', to: '/studies/st-sleep' },
  { id: 'st-pay', title: 'How do you make your digital payments mostly?', lead: '32 screeners', detail: [PENDING], thumb: '/img/studies/digital-payments.png', when: '5 Sep, 10:16 AM', to: '/studies/st-pay' },
]

const lucas: ActionRow = { id: 'tk-1', title: 'Lucas Mayfield', meta: 'Participant', detail: ['Study reward pending'], when: '8 hr ago', to: '/support/tk-1' }
const james: ActionRow = { id: 'tk-2', title: 'James Alva', meta: 'Client', detail: ['Unable to access the transcripts of sessions'], when: '1 hr ago', to: '/support/tk-2' }

const noShowRows: ActionRow[] = [
  { id: 'ns-1', title: 'Devon A.', meta: 'Nordic Field Labs', detail: ['Marked as No-show by the client'], when: '10 Sep, 10:16 AM', to: '/studies/st-goal' },
  { id: 'ns-2', title: 'Jennifer M', meta: 'Nordic Field Labs', detail: ['Marked as No-show by the client'], when: '10 Sep, 10:120 AM', to: '/studies/st-goal' },
]

const refundRows: ActionRow[] = [
  { id: 'rf-1', title: '$1,250 refund', meta: 'Wellness app feedback, Groveline Health', detail: ['Study completed underfilled by 10 participants'], when: '1 hr ago', to: '/finance/refunds/rf-1' },
  { id: 'rf-2', title: '$750 refund', meta: 'Share about your sleep cycle, ABC Pharma', detail: ['Study completed underfilled by 5 participants'], when: '10 Sep, 10:120 AM', to: '/finance/refunds/rf-2' },
]

const flaggedRows: ActionRow[] = [
  { id: 'fl-1', title: 'Devon A.', meta: 'By AI assistant', detail: ['For duplicate/multiple account', 'How do you make your digital payments mostly?'], when: '1 hr ago', to: '/participants/verifications/fl-1' },
  { id: 'fl-2', title: 'Jennifer M', meta: 'By Client: ABC Pharma,', detail: ['For abusive behavior in study session', 'How do you make your digital payments mostly?'], when: '10 Sep, 10:120 AM', to: '/participants/verifications/fl-2' },
]

const identityAll: ActionGroup = {
  key: 'identity', title: 'Identity Verification', count: '16', viewAll: '/participants/verifications',
  rows: [thomas, { id: 'iv-2', title: 'Jane D.', detail: ['Selfie liveness check passed without issues.'], when: '5 Sep, 10:16 AM', to: '/participants/verifications/iv-2' }],
}
const clientBusiness: ActionGroup = { key: 'client-business', title: 'Client-Business Verification', count: '2', viewAll: '/clients/verifications', rows: clientRows }
const screeners: ActionGroup = { key: 'screeners', title: 'Screeners to review', count: '264', viewAll: '/studies', rows: screenerRows }
const noShows: ActionGroup = { key: 'no-show', title: 'No-show verifications', count: '2', viewAll: '/studies', rows: noShowRows }
const refunds: ActionGroup = { key: 'refunds', title: 'Refunds for unfilled studies', count: '2', viewAll: '/finance/refunds', rows: refundRows }
const flagged: ActionGroup = { key: 'flagged', title: 'Flagged/reported accounts', count: '2', viewAll: '/participants/verifications', rows: flaggedRows }

/** Each tab's groups, as its own frame draws them. */
export const GROUPS: Record<TabKey, ActionGroup[]> = {
  // 1851:115853
  all: [
    identityAll,
    clientBusiness,
    screeners,
    { key: 'tickets', title: 'New Support Tickets', count: '2', viewAll: '/support', rows: [lucas, james] },
    noShows,
    refunds,
    flagged,
  ],
  // 1872:70720
  onboarding: [
    { ...identityAll, count: '2', rows: [thomas, { id: 'iv-3', title: 'Jenny Keens', detail: ['Automatic ID match didn’t matched against the submitted document.'], when: '4 Sep, 10:16 AM', to: '/participants/verifications/iv-3' }] },
    { ...clientBusiness, collapsed: true },
  ],
  // 1872:71323
  studies: [screeners, refunds],
  // 1872:71711: the Participants group's first row has its "Participant" label hidden; its second row is a client, as drawn.
  support: [
    { key: 'tickets-participants', title: 'Participants', count: '2', viewAll: '/support', rows: [{ ...lucas, meta: undefined }, james] },
    { key: 'tickets-clients', title: 'Client', count: '1', viewAll: '/support', collapsed: true, rows: [lucas, james] },
  ],
  // 1872:72123
  manage: [noShows, flagged],
}
