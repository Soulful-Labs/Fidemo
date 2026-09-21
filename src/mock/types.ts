// Data shapes for the HumanLayer respondent app, taken verbatim from the brief's
// "Data shapes" section. These are the single source of truth for the mock store.

export type StudyType =
  | 'survey'
  | 'video_call'
  | 'group_video_call'
  | 'in_person'
  | 'in_person_group'
  | 'diary'

export type StudyStatus =
  | 'available'
  | 'invited_to_apply'
  | 'applying'
  | 'draft'
  | 'applied'
  | 'invited_to_schedule'
  | 'invited_to_complete'
  | 'scheduled'
  | 'pin_confirmed'
  | 'in_process'
  | 'paid'
  | 'rejected'
  | 'no_show'
  // Workflow 44: turned up but was not needed. Paid in full, no penalty.
  | 'not_needed'

export type Question =
  | { id: string; kind: 'single'; prompt: string; options: string[] }
  | { id: string; kind: 'multi'; prompt: string; helper?: string; options: string[] }
  | { id: string; kind: 'text'; prompt: string; placeholder?: string }
  | { id: string; kind: 'image'; prompt: string }
  | { id: string; kind: 'scale'; prompt: string; options: string[] }

/**
 * Workflow 28: the three pre-set eligibility questions asked before the
 * full screener. Answering outside `passing` ends the application politely.
 */
export interface PreScreenQuestion {
  id: string
  prompt: string
  options: string[]
  passing: string[]
}

/** Workflow 57: each study sets its own rule on repeat participants. */
export type RepeatRule = 'allow' | 'prefer_fresh' | 'exclude_previous'

/** Workflow 34: every application carries one of three outcomes. */
export type Outcome = 'green' | 'yellow' | 'red'

export interface Study {
  id: string
  title: string
  description: string
  image: string
  type: StudyType
  industry: string
  matchScore: number // 0 to 100
  reward: number
  durationMins: number
  endsAt: string
  daysLeft: number
  targetProfession: string
  client: { id: string; name: string; rating: number; reviewCount: number }
  locations?: { id: string; label: string; address: string }[]
  availability?: { date: string; slots: string[] }[]
  status: StudyStatus
  saved: boolean
  /** Workflow 17: premium studies need a verified professional credential. */
  premium?: boolean
  repeatRule: RepeatRule
  /** City the in-person locations belong to. */
  city?: string
  /** Workflow 12: the coded link this study is shared with. */
  linkCode: string
  preScreener: PreScreenQuestion[]
  screener: Question[]
  tasks?: Question[] // survey and diary questions
  diary?: { totalDays: number; minDays: number; completedDays: number[] }
  booking?: { date: string; slot: string; locationId?: string; rescheduleCount: number }
  pinConfirmed?: boolean
  timeline: { label: string; at: string }[]
  clientReview?: {
    stars: number
    comment: string
    expertise: number
    reliability: number
    communication: number
    trustDelta: number
  }
  userReview?: { reliability: number; communication: number; comment?: string }
  // Set once the user has rated the client for a `paid` study (state machine note).
  ratedByUser?: boolean
}

/** Everything My Profile and Account Settings can edit (PRD 12). */
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

export interface User {
  name: string
  email: string
  phone: string
  profile: ProfileDetails
  /** Workflow 15: profile and ID are done at the point of applying, not before. */
  onboarded: boolean
  /** Workflow 49: asked for at $600 earned in a year; blocks withdrawal until done. */
  taxFormDone: boolean
  /** Workflow 12 and 14: the coded link this account arrived through. */
  sourceCode?: string
  joinedAt: string
  // The figures below are never stored as literals: lib/derive.ts computes
  // them from the transaction, points, study and payout lists on every render.
  trustScore: number // 50 to 100
  tier: 'silver' | 'gold' | 'platinum'
  profileCompletion: number
  walletBalance: number
  points: number
  allTimeEarned: number
  completedStudies: number
  streak: { current: number; target: number; month: string }
  ratings: {
    expertise: number
    reliability: number
    communication: number
    successRate: number
  }
  consent: {
    shareProfession: boolean
    shareProfile: boolean
    essentialCookies: true
    performanceCookie: boolean
  }
  emailPrefs: {
    dailyDigest: boolean
    personalizedInvitations: boolean
    newsletter: boolean
  }
  verified: { govId: boolean; livePhoto: boolean; license: boolean }
}

// ---------------------------------------------------------------------------
// Supporting shapes. The brief's Data shapes section defines Study, Question
// and User; these are the types the other seeded collections need.
// ---------------------------------------------------------------------------

export type NotificationKind =
  | 'study' | 'session' | 'money' | 'points' | 'tier' | 'trust'
  | 'support' | 'referral' | 'profile'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  /** Optional action button, e.g. "Schedule Now" (PRD 11). */
  actionLabel?: string
  /** Where the action, or the row itself, routes to. */
  to?: string
  /** Type 1 is the only one drawn with two actions. */
  secondaryActionLabel?: string
  secondaryTo?: string
}

export type EarningCategory =
  | 'Interview' | 'Focus Group' | 'Survey' | 'In-Person' | 'Redeem Points'

export interface Transaction {
  id: string
  studyId?: string
  /** Workflow 46: credited on completion, released once the client approves. */
  approved?: boolean
  title: string
  at: string
  amount: number
  txNumber: string
  category: EarningCategory
}

export type PayoutStatus = 'processing' | 'completed'

export interface Payout {
  id: string
  at: string
  amount: number
  fee: number
  net: number
  /** "****7790" */
  destination: string
  txId: string
  status: PayoutStatus
  expectedBy?: string
}

export interface PayoutMethod {
  id: string
  bankName: string
  accountNumber: string
  routingCode: string
  type: 'Savings' | 'Checking'
  isDefault: boolean
}

export type PointsKind = 'referral' | 'study' | 'streak' | 'bonus'

export interface PointsEntry {
  id: string
  kind: PointsKind
  label: string
  detail: string
  at: string
  amount: number
}

export interface RedeemEntry {
  id: string
  at: string
  points: number
  amount: number
  reference: string
}

export interface Referral {
  id: string
  name: string
  email: string
  status: 'joined' | 'completed'
  at: string
}

export interface TicketMessage {
  id: string
  from: 'you' | 'support'
  text: string
  at: string
}

export interface Ticket {
  id: string
  subject: string
  message: string
  studyTitle?: string
  /** Workflow 56: money tickets are answered within one working day, others two. */
  topic: 'money' | 'general'
  status: 'open' | 'closed'
  createdAt: string
  lastActivityAt: string
  messages: TicketMessage[]
}
