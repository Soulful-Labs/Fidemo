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
/**
 * `billing` (22 Oct 2026): recruiting has stopped, by Stop-complete or by the study filling, and the
 * client's bill is open. It is finished for participants; it becomes `completed` once nothing is owed.
 */
export type StudyState = 'draft' | 'in_review' | 'recruiting' | 'ongoing' | 'paused' | 'billing' | 'completed' | 'cancelled'

/** One person's journey through one study (workflow steps 24 to 52). */
export type ParticipationState =
  | 'matched' | 'invited' | 'applying' | 'draft' | 'applied'
  | 'qualified' | 'disqualified' | 'recruited' | 'scheduled'
  | 'completed' | 'no_show' | 'withdrawn'

/** Who a study takes back (workflow 57). "Prefer fresh people" was dropped on 22 Oct 2026: a study allows everyone, or excludes anyone who has taken part with the client. */
export type RepeatRule = 'allow' | 'exclude'
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
  /** A diary question asked on this entry only (1 is the first). None means it is asked on every entry. */
  day?: number
  /** The client turned Required off (question menu, 22 Oct 2026): it may be left unanswered. Absent means required. */
  optional?: boolean
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
  /** What they answered to the eligibility questions they passed (workflow 28). */
  preAnswers?: Answers
  booking?: Booking
  /** Sessions the client or the team cancelled for them (22 Oct 2026): when, the slot, who, and the reason given. */
  cancellations?: { at: string; date: string; slot: string; by: 'client' | 'team'; reason: string }[]
  /** The interview notes the client or the team writes on a one-to-one session (22 Oct 2026). */
  notes?: string
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
  /** The team processed the payout by hand in the console; the incentive is in the wallet from this moment. */
  paidAt?: string
  /** What was paid (24 Oct 2026): the incentive in force when they completed, kept so a later change never moves it. */
  paidAmount?: number
  /** When a qualify or disqualify decision was taken, for the one hour undo. */
  decidedAt?: string
  /** What happened and when, oldest first. */
  events: { label: string; at: string }[]
}

export interface Session {
  id: string; date: string; slot: string; seats: number; locationId?: string
  /** The interview notes written on a group session (22 Oct 2026). */
  notes?: string
}

export interface StudyRates { platformFee: number; recruitingPer: number; incentivePer: number; moderationPer: number }

/** Money a client has paid for, or been refunded on, a study. Balances are derived from these. */
export interface StudyPayment {
  id: string
  kind: 'deposit' | 'balance' | 'refund'
  /**
   * Which deposit of the payment structure (23 Oct 2026, shared/platform.ts PAYMENT_STAGES): the upfront
   * deposit taken at publish, or the incentive deposit taken when the team takes the study live. A deposit
   * with none recorded is the upfront one.
   */
  stage?: 'upfront' | 'incentive'
  amount: number
  at: string
  /** A refund is raised by the platform and confirmed by the team (console, Finance). */
  confirmedBy?: string
}

/**
 * Who a study is for (D38, 23 Oct 2026). Each set category must match; any
 * one value within a category is enough; a category left out is ignored.
 * A study built in the Create flow reads these off its form; a seeded study
 * carries them here. A study with none is open to everyone.
 */
export interface AudienceCriteria {
  industries?: string[]
  roles?: string[]
  functions?: string[]
  skills?: string[]
  countries?: string[]
  genders?: string[]
  education?: string[]
  ageRanges?: string[]
  ethnicity?: string[]
  areaTypes?: string[]
  experience?: string[]
  income?: string[]
  tiers?: Tier[]
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
  /** The first time the study was sent to the team; a resubmit moves `submittedAt` and leaves this. */
  firstSubmittedAt?: string
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
  /** `totalDays` and `minDays` count entries. `unit` is what one entry covers (Hour, Day or Week; a day when unset) and `frequency` how often one is asked for. */
  diary?: { totalDays: number; minDays: number; unit?: string; frequency?: string }
  /** Group studies: the sessions people book a seat in. */
  sessions?: Session[]
  setup?: StudySetup
  /** One-to-one session studies: the gap between sessions and how far ahead a slot must be booked. */
  schedule?: { bufferMins: number; noticeMins: number }
  /** Everything the client entered in the Create flow, kept whole (shared/studyForm.ts). */
  form?: StudyForm
  /** Who it is for, on a study not built in the Create flow (a built one reads its form). Read through studyForm.ts audienceOf. */
  audience?: AudienceCriteria
  participations: Participation[]
  payments: StudyPayment[]
  /** Workflow 7: changes the team asked for before approving. */
  revisions: { text: string; at: string; by: string }[]
  /** Every saved round of changes to the study after it was first submitted, by the client or the team (shared/revisions.ts). */
  edits?: StudyEdit[]
  pausedReason?: string
  /** Recruit more (19 Oct 2026): the target was met and the client chose to keep recruiting, so the "Congrats!" banner is not shown again. */
  beyondTarget?: boolean
  /** When recruiting stopped and the study went to Billing, and who stopped it: the client, the team, or the study filling its target. */
  stoppedAt?: string
  stoppedBy?: 'client' | 'team' | 'filled'
  /** The rate per participant agreed for this study, period by period (23 Oct 2026). Absent until it is submitted. */
  ratePeriods?: RatePeriod[]
  /** The participant's incentive, period by period (24 Oct 2026): a change applies to those who complete after it. `rates.incentivePer` is the one in force now. */
  incentivePeriods?: { amount: number; from: string }[]
  /** How the team quoted it from the rate card (24 Oct 2026): the segment row, the hours, and the flat add-ons picked. */
  quote?: { segmentId: string; hours: number; addOnIds: string[] }
}

/**
 * One period of a study's rate per participant (23 Oct 2026): the rate agreed from `from` on. A study is
 * priced when it is submitted; a change to its requirements can agree a new rate, which applies to the
 * participants who complete after it. Oldest first.
 */
export interface RatePeriod { rate: number; from: string }

/**
 * A client's named group of studies (23 Oct 2026, Create Group). My Studies shows each group as a section
 * with its studies, and everything else under Others. A study is in one group at most.
 */
export interface StudyGroup { id: string; clientId: string; name: string; studyIds: string[]; createdAt: string }

/** One field a round of changes touched: where it sits in the Create steps ("About", "Title"), and what it was and became. */
export interface FieldChange { path: string[]; from?: string; to?: string; added?: string[]; removed?: string[] }

/** One saved round of changes to a submitted study. `byId` is the team member when the team made it. */
export interface StudyEdit { at: string; by: 'client' | 'team'; byId?: string; changes: FieldChange[] }

// ------------------------------------------------------------------- people

/**
 * A verification check. `in_review`: submitted and waiting for the team to
 * decide in the console (decided 23 Oct 2026: nothing is verified until a
 * person approves it). `flagged`: an automatic check failed and needs a person.
 */
export type CheckState = 'not_started' | 'in_review' | 'flagged' | 'verified' | 'rejected'

/** One uploaded file, as the participant chose it: its name and size. The file itself is the server's to keep. */
export interface UploadedFile { name: string; bytes: number }

/** A manual check the automatic one could not settle (workflow 3, 17, 18). */
export interface Check {
  state: CheckState
  /** When it was submitted for review. */
  submittedAt?: string
  /** Identity: the two sides of the ID document as uploaded. */
  documents?: { front: UploadedFile; back: UploadedFile }
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
  /** What they do in their work and what they are good at. A study's audience can ask for either (shared/studyForm.ts). */
  workFunctions: string[]
  skills: string[]
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
  /** Withdrawal payouts (19 Oct 2026): every state the back end needs, though the console draws only Release (pending to paid). Older records said 'processing' / 'completed'. */
  status: PayoutStatus | 'processing' | 'completed'
  /** The withdrawal fee in force when it was requested (23 Oct 2026: the fee is a setting the team can change). */
  fee?: number
  expectedBy?: string
  /** When the team released it, and who. */
  releasedAt?: string
  releasedBy?: string
}

export type PayoutStatus = 'pending' | 'approved' | 'held' | 'paid' | 'failed'

/** `usd`: what the points were worth when redeemed (23 Oct 2026: the points value is a setting the team can change). */
export interface Redemption { id: string; at: string; points: number; reference: string; usd?: number }

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
  /**
   * Their picture. A seeded person's is a drawn figure (shared/avatar.ts); a
   * participant who uploads one replaces it. Clients and the console see it
   * only while `photoConsent` is on: read it through `sharedPhoto`, never directly.
   */
  photo?: string
  photoConsent?: boolean
  /** The first time they added a picture of their own: the points award is read from it, and it is never cleared. */
  pictureAddedAt?: string
  /** Their intro video. The file is kept in this browser's IndexedDB under `id` (shared/media.ts); only the reference lives here. */
  video?: { id: string; name: string; type: string; bytes: number }
  videoConsent?: boolean
  videoAddedAt?: string
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'restricted' | 'deactivated'
  /** Why the account is restricted or deactivated, who did it, the category (a report's reason, or "Team decision") and, for a restriction, when it ends. */
  statusNote?: { reason: string; at: string; by: string; until?: string; category?: string }
  /**
   * Every restriction ever applied, however it was applied (policy section 9).
   * The ladder reads its length: 15, 15 and 30 days, and the fourth offence
   * is a deactivation.
   */
  restrictions?: Restriction[]
  /** Policy section 7: issued when identity verification completes, generated once and never reused. Absent until then. */
  certificateId?: string
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
  /**
   * FRONT-END STAND-IN, NOT SECURITY. The password as typed, kept so the
   * screens behave (sign in, change, reset, close account). Real
   * authentication replaces this: the server holds a hash and the app never
   * sees it. Absent on an account that has none (it cannot sign in).
   */
  password?: string
  /**
   * A demo account (every seeded participant). Demo accounts may fill a
   * diary's entries ahead of their dates, so a demo can run a whole diary in
   * one sitting (23 Oct 2026). Real accounts never carry it.
   */
  demo?: boolean
}

export interface Restriction { at: string; until: string; category: string; reason: string; by: string }

/** A report raised against a participant (console, Verifications > Reported). */
/**
 * Why a participant was reported. The first four are the categories the
 * platform and the team use; the rest are what a client picks on Report
 * Participant (client 2313:83072, 19 Oct 2026).
 */
export type ReportReason =
  | 'AI/Bot Activity' | 'Abusive Behaviour' | 'Spam Apply' | 'Wrong Match'
  | 'Was asking to collaborate outside' | 'Participant is misrepresenting their identity'
  | 'Profession looks like a scam or suspicious' | 'Participant had an inappropriate behavior' | 'Other'

/** One time the team closed a study's open reports: the statement, who and when, and the chat with the client if there was one. */
export interface ReportResolution { id: string; at: string; by?: string; statement: string; ticketId?: string }

/**
 * A respondent's report about a study (respondent Report Study; console
 * Reported Studies 2314:146859). It is pending until the team marks the
 * study's reports resolved, which closes every open one together.
 */
export interface StudyReport {
  id: string
  studyId: string
  /** Who reported it. */
  personId: string
  reason: string
  detail: string
  at: string
  /** The chat the team opened with the client about these reports, before resolving them. */
  ticketId?: string
  resolution?: ReportResolution
}

export interface Report {
  id: string
  personId: string
  /** The client who reported them (22 Oct 2026: there is no automated flagging, so never the system). */
  reportedBy: string
  reason: ReportReason
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
  /** The business's US tax ID (EIN). Optional: blank when the client did not give one. */
  taxId: string
  website: string
  joinedAt: string
  lastActiveAt: string
  status: 'active' | 'deactivated'
  statusNote?: { reason: string; at: string; by: string }
  /** Workflow 3: the business check on the company website, and the tax ID where one was given. */
  business: Check
  /** The business certificate's ID, FI-C-XXXX-XXXX, issued when the business check passes. Absent until then. */
  certificateId?: string
  /**
   * Reviews written before the seed's window, kept as records. Reviews since
   * are read off the participations of the client's studies; the rating and
   * the review count are derived from both.
   */
  earlierReviews: EarlierReview[]
  cards: SavedCard[]
  /** What the platform has told this client, newest first (a study finishing, so far). */
  notifications?: ClientNotice[]
  /**
   * True when nobody is driving this client in the demo: the store then plays
   * its part (qualifies applicants, rates participants) on the timings in
   * platform.ts. The signed-in client account is never simulated.
   */
  simulated: boolean
}

/** A notification for a client, raised by the platform. */
export interface ClientNotice { id: string; title: string; body: string; studyId?: string; at: string; read: boolean }

/**
 * A notification for the internal team. `payouts`: a study has finished and
 * its participants' payouts are ready for the team to process by hand.
 */
export interface TeamNotice { id: string; kind: 'payouts'; studyId: string; title: string; body: string; at: string }

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
export interface Pending { kind: 'qualify'; studyId: string; personId: string; dueAt: number }

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
  /** What the platform has told the internal team, newest first. */
  teamNotices: TeamNotice[]
  /** Reports respondents make about a study (19 Oct 2026); the console's Reported Studies. Absent on older states. */
  studyReports?: StudyReport[]
  /**
   * Every change a master admin made to the values in Pricing & Rewards (22 Oct 2026), oldest first.
   * A value applies from the moment it was changed; what happened before keeps the value then in force.
   * Absent on older states: the policy's values hold.
   */
  settingsLog?: SettingsChange[]
  /** Clients' groups of studies (23 Oct 2026). Absent on older states: no groups. */
  studyGroups?: StudyGroup[]
}

/** What a recruitment add-on can be charged for: a study type (each covers its group form) or targeting. */
export type AddOnParameter = 'survey' | 'video_call' | 'in_person' | 'diary' | 'roles' | 'skills'
/** A recruitment add-on: charged once per completed participant when a study matches any of its parameters. */
export interface FeeAddOn { id: string; amount: number; on: AddOnParameter[] }
export interface FeeSettings { platform: number; moderation: number; recruitmentBase: number; addOns: FeeAddOn[] }
export interface TrustSettings {
  onboarding: number; studyCompletion: number; studyCap: number
  star5: number; star4: number; star3: number; star2: number; star1: number
  noShow: number; lateShowUp: number; cancelledSession: number; fraud: number
}
export interface TierSettings { silver: number; gold: number; platinum: number }
export interface PointsSettings { referral: number; beingReferred: number; studyCompletion: number; fullProfile: number; streak: number; profilePicture: number; introVideo: number }
/** A figure on the rate card: both ends of the range the sheet gives (equal when it gives one). Null is blank on the sheet. */
export interface RateRange { min: number | null; max: number | null }
/** One row of the rate card's segments table (shared/ratecard.ts): a segment at a size band, with its three prices. */
export interface RateSegment {
  id: string; section: string; segment: string; level: string; criteria: string; sizeBand: string
  /** Once per study. */
  setup: RateRange; setupNote: string
  /** Cost per recruit, per participant delivered. */
  cpr: RateRange; cprNote: string
  /** The incentive guide rate for the participant, in `incentiveUnit` (usually "per hour"). */
  incentive: RateRange; incentiveUnit: string; incentiveNote: string
}
/** One row of the rate card's fees table: a standard fee, an additional fee, an adjustment, or a written rule. */
export interface RateFee { id: string; group: string; item: string; amount: RateRange; unit: string; note: string }
/** The team's rate card (24 Oct 2026). Confidential: no client screen reads it; a client sees only the cost per interview. */
export interface RateCard { segments: RateSegment[]; fees: RateFee[] }

/** Participants Fees (23 Oct 2026): the withdrawal fee, and what 100 reward coins are worth in dollars. */
export interface ParticipantSettings { withdrawal: number; pointsValue: number }
export interface SettingsValues { fees: FeeSettings; trust: TrustSettings; tiers: TierSettings; points: PointsSettings; participants: ParticipantSettings; rateCard: RateCard }
export type SettingsGroup = keyof SettingsValues
/** One saved change: the whole group as it was and as it became, who saved it and when. */
export interface SettingsChange {
  id: string; group: SettingsGroup; at: string; by: string; before: SettingsValues[SettingsGroup]; after: SettingsValues[SettingsGroup]
  /** Where the values came from when they were not typed: an uploaded file's name (24 Oct 2026). */
  source?: string
}

export interface Refusal { ok: false; why: string }
export type Result<T = object> = ({ ok: true } & T) | Refusal
