import type {
  AppNotification, Payout, PayoutMethod, PointsEntry, RedeemEntry, Referral,
  Study, StudyStatus, Ticket, TicketMessage, Transaction, User,
} from './types'

export type { Study, AppNotification } from './types'

export interface Toast {
  id: string
  message: string
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
  toasts: Toast[]
}

export type Action =
  | { type: 'SIGN_IN' }
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
