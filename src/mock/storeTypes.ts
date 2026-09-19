import type {
  AppNotification, Payout, PayoutMethod, PointsEntry, RedeemEntry, Referral,
  Study, StudyStatus, StudyType, Ticket, TicketMessage, Transaction, User,
} from './types'

export type { Study, AppNotification } from './types'

export interface Toast {
  id: string
  message: string
}

/** Sort options from PRD 6.2. */
export type SortKey = 'default' | 'price_high' | 'price_low' | 'new_first' | 'old_first'

/** Explore search, sort and the Filters sheet (PRD 6.2, 6.3). */
export interface StudyFilters {
  query: string
  sort: SortKey
  types: StudyType[]
  price: [number, number]
  time: [number, number]
  industries: string[]
  occupations: string[]
}

export const PRICE_RANGE: [number, number] = [0, 1000]
export const TIME_RANGE: [number, number] = [0, 180]

export const DEFAULT_FILTERS: StudyFilters = {
  query: '', sort: 'default', types: [],
  price: PRICE_RANGE, time: TIME_RANGE, industries: [], occupations: [],
}

/** What the three onboarding steps collect before an account exists. */
export interface OnboardingDraft {
  fullName: string
  dob: string
  gender: string
  address: string
  introVideo?: string
  occupation: string
  licenseId: string
  industry: string
  education: string
  idType: string
  idFront?: string
  idBack?: string
}

/** One answer per screener/survey/diary question. */
export type Answers = Record<string, string | string[]>

export interface AppState {
  signedIn: boolean
  user: User
  studies: Study[]
  notifications: AppNotification[]
  transactions: Transaction[]
  payouts: Payout[]
  payoutMethods: PayoutMethod[]
  pointsHistory: PointsEntry[]
  redeemHistory: RedeemEntry[]
  referrals: Referral[]
  tickets: Ticket[]
  /** In-progress screener answers, keyed by study id. Drafts read from here. */
  answers: Record<string, Answers>
  onboarding: OnboardingDraft
  filters: StudyFilters
  toasts: Toast[]
}

export type Action =
  | { type: 'SIGN_IN' }
  | { type: 'SET_ONBOARDING'; patch: Partial<OnboardingDraft> }
  | { type: 'SET_FILTERS'; patch: Partial<StudyFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_STATUS'; id: string; status: StudyStatus; timelineLabel?: string }
  | { type: 'TOGGLE_SAVED'; id: string }
  | { type: 'SAVE_ANSWERS'; id: string; answers: Answers }
  | { type: 'SET_BOOKING'; id: string; booking: Study['booking'] }
  | { type: 'CONFIRM_PIN'; id: string }
  | { type: 'COMPLETE_DIARY_DAY'; id: string; day: number }
  | { type: 'RATE_CLIENT'; id: string; review: NonNullable<Study['userReview']> }
  | { type: 'PAY_STUDY'; id: string }
  | { type: 'CANCEL_STUDY'; id: string }
  | { type: 'WITHDRAW'; amount: number; destination: string }
  | { type: 'REDEEM_POINTS'; points: number }
  | { type: 'ADD_PAYOUT_METHOD'; method: PayoutMethod }
  | { type: 'REMOVE_PAYOUT_METHOD'; id: string }
  | { type: 'SET_DEFAULT_METHOD'; id: string }
  | { type: 'UPDATE_USER'; patch: Partial<User> }
  | { type: 'SET_CONSENT'; key: keyof User['consent']; value: boolean }
  | { type: 'SET_EMAIL_PREF'; key: keyof User['emailPrefs']; value: boolean }
  | { type: 'MARK_ALL_READ' }
  | { type: 'MARK_READ'; id: string }
  | { type: 'ADD_NOTIFICATION'; notification: AppNotification }
  | { type: 'ADD_TICKET'; ticket: Ticket }
  | { type: 'SEND_TICKET_MESSAGE'; ticketId: string; message: TicketMessage }
  | { type: 'TOAST'; toast: Toast }
  | { type: 'DISMISS_TOAST'; id: string }
