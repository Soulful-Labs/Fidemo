/**
 * The respondent app's view of the shared platform (../../shared).
 *
 * Nothing is defined twice: the entities are shared/types.ts, and the shapes
 * the screens read are what shared/derive.ts produces for one person. This
 * file only names them the way the respondent screens always have.
 */
import type { PayoutRow, PersonFigures, PointsRow, RedeemRow, RespondentStudy, WalletRow } from '@shared/derive'
import type { Person } from '@shared/types'

export type {
  StudyType, Question, PreScreenQuestion, RepeatRule, ProfileDetails, AppNotification, NotificationKind, PayoutMethod, Referral,
} from '@shared/types'
export type { RespondentStatus as StudyStatus } from '@shared/lifecycle'
export type { EarningCategory, PointsKind } from '@shared/derive'

/** One study as this person sees it: the study plus their own part in it (shared/derive.ts, respondentStudy). */
export type Study = RespondentStudy
export type Transaction = WalletRow
export type Payout = PayoutRow
export type PointsEntry = PointsRow
export type RedeemEntry = RedeemRow

/** Workflow 34: every application carries one of three outcomes. */
export type Outcome = 'green' | 'yellow' | 'red'

/** The signed-in person, with every figure the platform derives for them. */
export type User = Pick<Person, 'name' | 'email' | 'phone' | 'profile' | 'onboarded' | 'taxFormDone' | 'sourceCode' | 'joinedAt' | 'consent' | 'emailPrefs' | 'photo' | 'photoConsent' | 'video' | 'videoConsent'>
  & { verified: { govId: boolean; livePhoto: boolean; license: boolean } }
  & PersonFigures

export interface TicketMessage { id: string; from: 'you' | 'support'; text: string; at: string }

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
