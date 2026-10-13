/**
 * Every entity on the platform, defined once. The respondent app, the client
 * app and the internal console all read these and nothing else.
 *
 * Two rules shape this file:
 *   - A person carries the inputs to their Trust Score, never the score.
 *   - A study carries its target and its participations, never its progress.
 * Anything that can be counted or added up is not a field here; it is a
 * function in derive.ts.
 */

// ------------------------------------------------------------------ studies

import type { StudyForm } from './studyForm'

export type StudyType = 'survey' | 'video_call' | 'group_video_call' | 'in_person' | 'in_person_group' | 'diary'

/** The study's own state (workflow steps 5 to 11, 45, 53). */
export type StudyState = 'draft' | 'in_review' | 'recruiting' | 'ongoing' | 'paused' | 'completed' | 'cancelled'

/** One person's journey through one study (workflow steps 24 to 52). */
export type ParticipationState =
  | 'matched' | 'invited' | 'applying' | 'draft' | 'applied'
  | 'qualified' | 'disqualified' | 'recruited' | 'scheduled'
  | 'completed' | 'no_show' | 'withdrawn'

export type RepeatRule = 'allow' | 'prefer_fresh' | 'exclude'
export type Tier = 'silver' | 'gold' | 'platinum'
export type Stars = 1 | 2 | 3 | 4 | 5
/** The client's rating control (policy sign-off, workflow 52). Stored as stars, see rules.ts. */
export type RatingState = 'poor' | 'good' | 'excellent'

/**
 * What a question built in the client's Create flow carries beyond how it is
 * asked (shared/questions.ts): the answer type the client chose, the verdict
 * they gave each option, and whether a text answer is a number.
 */
export interface QuestionMeta {
  /** The client builder's answer type, e.g. "Number input". Absent on seeded questions. */
  authored?: string
  /** Option text to the builder's verdict: Correct, Incorrect, May Select or Must Select. */
  marks?: Record<string, string>
  format?: 'number'
}

export type Question = QuestionMeta & (
  | { id: string; kind: 'single'; prompt: string; options: string[] }
  | { id: string; kind: 'multi'; prompt: string; helper?: string; options: string[] }
  | { id: string; kind: 'text'; prompt: string; placeholder?: string }
  | { id: string; kind: 'image'; prompt: string }
  | { id: string; kind: 'scale'; prompt: string; options: string[] }
)

/** Workflow 28: the eligibility questions asked before the full screener. */
export interface PreScreenQuestion { id: string; prompt: string; options: string[]; passing: string[] }

/** A number question's answer is kept as a number (shared/store.ts, tidyAnswers). */
export type Answers = Record<string, string | string[] | number>

export interface Location { id: string; label: string; address: string; short?: string }

export interface Booking {
  /** ISO day of the session. */
  date: string
  /** "10:30 AM" */
  slot: string
  locationId?: string
  /** Group studies book a seat in a session. */
  sessionId?: string
  rescheduleCount: number
}

/** The client's rating of a participant. Five stars are stored because the policy's score table is in stars. */
export interface ParticipantRating {
  stars: Stars
  /** What the client actually pressed, when the rating came through the three-state control. */
  state?: RatingState
  comment?: string
  expertise?: number
  reliability?: number
  communication?: number
  at: string
}

/** The participant's review of the client (respondent app, Rate Client). */
export interface ClientReview { reliability: number; communication: number; comment?: string; at: string }

export interface Participation {
  personId: string
  state: ParticipationState
  /** Workflow 28. */
  prescreener?: 'passed' | 'terminated'
  /** Workflow 29: a borderline answer is held for review rather than rejected. */
  heldForReview?: boolean
  /** Screener answers, kept while a draft and after submission. */
  answers?: Answers
  booking?: Booking
  /** Workflow 42: a code at the end of every session, entered by both sides. */
  code?: { value: string; byParticipant: boolean; byClient: boolean }
  /** Diary studies: the days filled in. */
  diaryDays?: number[]
  /** A survey's answers, by question id, as the participant submitted them. */
  taskAnswers?: Answers
  /** A diary's answers: one set per day filled in, keyed by the day's number. */
  diaryAnswers?: Record<string, Answers>
  /** Took part but arrived late: paid, with the policy's late show up deduction. */
  lateShow?: boolean
  /** Workflow 44: turned up but was not needed. Paid in full, no penalty. */
  notNeeded?: boolean
  rating?: ParticipantRating
  clientReview?: ClientReview
  completedAt?: string
  /** Workflow 46: the client approved the payout; the incentive is in the wallet from this moment. */
  paidAt?: string
  /** When a qualify or disqualify decision was taken, for the one hour undo. */
  decidedAt?: string
  /** What happened and when, oldest first. */
  events: { label: string; at: string }[]
}

export interface Session { id: string; date: string; slot: string; seats: number; locationId?: string }

export interface StudyRates { platformFee: number; recruitingPer: number; incentivePer: number; moderationPer: number }

/** Money a client has paid for, or been refunded on, a study. Balances are derived from these. */
export interface StudyPayment {
  id: string
  kind: 'deposit' | 'balance' | 'refund'
  amount: number
  at: string
  /** A refund is raised by the platform and confirmed by the team (console, Finance). */
  confirmedBy?: string
}

/** The Create flow's four steps as the Manage and Review screens read them back. */
export interface StudySetup {
  estimatedAudience: string
  audience: { label?: string; value: string; icon?: string }[]
  screenerSummary: string
  studySummary: { label: string; value: string }
}

export interface Study {
  id: string
  clientId: string
  title: string
  description: string
  image?: string
  type: StudyType
  state: StudyState
  industry: string
  durationMins: number
  createdAt: string
  /** Workflow 7: when the client submitted it for review. */
  submittedAt?: string
  /** Workflow 11: when the team took it live. */
  approvedAt?: string
  completedAt?: string
  /** When recruiting closes. Days remaining is derived from this. */
  endsAt: string
  /** The sample size the client asked for. Every count on every screen is against this. */
  required: number
  repeatRule: RepeatRule
  /** Priced by platform.ts when the study is submitted. */
  rates: StudyRates
  /** Workflow 17: needs a verified professional credential. */
  premium?: boolean
  targetProfession: string
  /** Workflow 12: the coded link this study is shared with. */
  linkCode: string
  city?: string
  locations?: Location[]
  availability?: { date: string; slots: string[] }[]
  preScreener: PreScreenQuestion[]
  screener: Question[]
  /** Survey and diary questions. */
  tasks?: Question[]
  /** `unit` and `frequency` are kept as the client chose them; entries are counted in days. */
  diary?: { totalDays: number; minDays: number; unit?: string; frequency?: string }
  /** Group studies: the sessions people book a seat in. */
  sessions?: Session[]
  setup?: StudySetup
  /** One-to-one session studies: the gap between sessions and how far ahead a slot must be booked. */
  schedule?: { bufferMins: number; noticeMins: number }
  /** The client's choice on the Study step. Payouts are still approved by hand in this build. */
  autoPay?: boolean
  /** Everything the client entered in the Create flow, kept whole (shared/studyForm.ts). */
  form?: StudyForm
  participations: Participation[]
  payments: StudyPayment[]
  /** Workflow 7: changes the team asked for before approving. */
  revisions: { text: string; at: string; by: string }[]
  pausedReason?: string
}

// ------------------------------------------------------------------- people

export type CheckState = 'not_started' | 'flagged' | 'verified' | 'rejected'

/** A manual check the automatic one could not settle (workflow 3, 17, 18). */
export interface Check {
  state: CheckState
  /** Why the automatic check failed. */
  reason?: string
  flaggedAt?: string
  /** The team's statement when it was decided. */
  note?: string
  decidedAt?: string
  decidedBy?: string
}

export interface ProfileDetails {
  gender: string
  address: string
  areaType: string
  aboutMe: string
  languages: string[]
  nationality: string
  income: string
  ethnicity: string
  pets: string[]
  homeOwner: '' | 'Yes' | 'No'
  occupation: string
  experience: string
  licenseId: string
  industry: string
  education: string
  topics: string[]
  dob: string
  idType: string
  introVideo?: string
}

/** A Trust Score deduction that is not a participation state of its own (cancelled session, fraud). */
export interface TrustEvent { kind: 'cancelled_session' | 'fraud'; detail?: string; studyId?: string; at: string }

export interface PayoutMethod {
  id: string
  bankName: string
  accountNumber: string
  routingCode: string
  type: 'Savings' | 'Checking'
  isDefault: boolean
}

export interface Payout {
  id: string
  at: string
  amount: number
  /** "****7790" */
  destination: string
  txId: string
  status: 'processing' | 'completed'
  expectedBy?: string
}

export interface Redemption { id: string; at: string; points: number; reference: string }

export interface Referral { id: string; name: string; email: string; status: 'joined' | 'completed'; at: string }

export type NotificationKind = 'study' | 'session' | 'money' | 'points' | 'tier' | 'trust' | 'support' | 'referral' | 'profile'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  actionLabel?: string
  to?: string
  secondaryActionLabel?: string
  secondaryTo?: string
}

export interface Person {
  id: string
  name: string
  email: string
  phone: string
  photo?: string
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'restricted' | 'deactivated'
  /** Why the account is restricted or deactivated, and who did it. */
  statusNote?: { reason: string; at: string; by: string; until?: string }
  profile: ProfileDetails
  /** Location as the pool and the console list it: "New York, US". */
  location: string
  onboarded: boolean
  /** Workflow 49: asked for at $600 earned in a year; blocks withdrawal until done. */
  taxFormDone: boolean
  /** Workflow 12 and 14: the coded link this account arrived through. */
  sourceCode?: string
  identity: Check
  profession: Check
  /** Selfie capture is blocked pending legal review; stays false. */
  livePhoto: boolean
  consent: { shareProfession: boolean; shareProfile: boolean; essentialCookies: true; performanceCookie: boolean }
  emailPrefs: { dailyDigest: boolean; personalizedInvitations: boolean; newsletter: boolean }
  /**
   * Trust Score inputs from before the seed's window: studies completed this
   * year and the ratings received, oldest first. Everything since is read off
   * the person's participations.
   */
  prior: { completedThisYear: number; stars: Stars[] }
  trustEvents: TrustEvent[]
  /** Set once, when the profile first reached 100% (the points award is derived from it). */
  fullProfileAt?: string
  payoutMethods: PayoutMethod[]
  payouts: Payout[]
  redemptions: Redemption[]
  referrals: Referral[]
  savedStudyIds: string[]
  notifications: AppNotification[]
}

/** A report raised against a participant (console, Verifications > Reported). */
export interface Report {
  id: string
  personId: string
  /** 'system' or a client id. */
  reportedBy: string
  reason: 'AI/Bot Activity' | 'Abusive Behaviour' | 'Spam Apply' | 'Wrong Match'
  detail: string
  studyId?: string
  at: string
  outcome?: 'rejected' | 'restricted' | 'deactivated'
  note?: string
  decidedAt?: string
  decidedBy?: string
}

// ------------------------------------------------------------------ clients

export interface SavedCard { brand: string; last4: string; expires: string; isDefault?: boolean }

/** A review of a client from before the seed's window, with the client's rating of that participant. */
export interface EarlierReview {
  id: string
  study: string
  stars: number
  at: string
  comment?: string
  participant: { name: string; stars: number; comment?: string }
}

export interface Client {
  id: string
  /** The person who holds the account. */
  name: string
  role: string
  company: string
  email: string
  photo?: string
  industry: string
  location: string
  vat: string
  website: string
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'deactivated'
  statusNote?: { reason: string; at: string; by: string }
  /** Workflow 3: the business check on the VAT number and website. */
  business: Check
  /**
   * Reviews written before the seed's window, kept as records. Reviews since
   * are read off the participations of the client's studies; the rating and
   * the review count are derived from both.
   */
  earlierReviews: EarlierReview[]
  cards: SavedCard[]
  /**
   * True when nobody is driving this client in the demo: the store then plays
   * its part (qualifies applicants, rates participants) on the timings in
   * platform.ts. The signed-in client account is never simulated.
   */
  simulated: boolean
}

// ------------------------------------------------------------------ support

export interface TicketMessage {
  id: string
  from: 'user' | 'team' | 'auto'
  /** The team member who wrote it. */
  by?: string
  text: string
  /** A file sent with the message, by name. */
  attachment?: string
  at: string
}

export interface Ticket {
  id: string
  /** Who raised it, or who it was raised for when the team created it. */
  owner: { kind: 'participant' | 'client'; id: string }
  createdByTeam?: boolean
  subject: string
  message: string
  studyTitle?: string
  /** Workflow 56: money tickets are answered within one working day, others two. */
  topic: 'money' | 'general'
  status: 'open' | 'closed'
  createdAt: string
  lastActivityAt: string
  closedAt?: string
  messages: TicketMessage[]
}

// --------------------------------------------------------------------- team

export type Module = 'Dashboard' | 'Studies' | 'Participants' | 'Clients' | 'Support' | 'Finance' | 'Pricing & Rewards' | 'Sub-Admin'

export interface TeamMember {
  id: string
  name: string
  /** A free-text job title; access comes only from `access`. */
  role: string
  email: string
  photo?: string
  master?: boolean
  access: Module[]
  active: boolean
  /**
   * What they sign in to the console with. Plain text, because this build has
   * no backend to hash it on: a demo credential, never a real one.
   */
  password?: string
}

/** One line of the console's activity log. Written by the store, never by a screen. */
export interface Activity { id: string; what: string; path: string; at: string; by: string }

// -------------------------------------------------------------------- state

/** A simulated server step waiting to fire, kept in the state so a reload or another tab still runs it. */
export interface Pending { kind: 'qualify' | 'pay'; studyId: string; personId: string; dueAt: number }

export interface PlatformState {
  version: number
  /** When this state was seeded; the seed's dates are relative to it. */
  seededAt: string
  people: Person[]
  clients: Client[]
  studies: Study[]
  reports: Report[]
  tickets: Ticket[]
  team: TeamMember[]
  activity: Activity[]
  pending: Pending[]
}

export interface Refusal { ok: false; why: string }
export type Result<T = object> = ({ ok: true } & T) | Refusal
