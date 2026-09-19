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

export type Question =
  | { id: string; kind: 'single'; prompt: string; options: string[] }
  | { id: string; kind: 'multi'; prompt: string; helper?: string; options: string[] }
  | { id: string; kind: 'text'; prompt: string; placeholder?: string }
  | { id: string; kind: 'image'; prompt: string }
  | { id: string; kind: 'scale'; prompt: string; options: string[] }

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

export interface User {
  name: string
  email: string
  phone: string
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
}

export type EarningCategory =
  | 'Interview' | 'Focus Group' | 'Survey' | 'In-Person' | 'Redeem Points'

export interface Transaction {
  id: string
  studyId?: string
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
  status: 'open' | 'closed'
  createdAt: string
  lastActivityAt: string
  messages: TicketMessage[]
}
