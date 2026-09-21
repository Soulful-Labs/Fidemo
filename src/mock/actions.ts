import { autoReply } from '../lib/support'
import type { Action, Answers, AppState, OnboardingDraft, StudyFilters } from './storeTypes'
import type {
  PayoutMethod, Study, StudyStatus, Ticket, TicketMessage, User,
} from './types'
import { TIMINGS } from './timings'

export interface ActionDeps {
  state: AppState
  dispatch: React.Dispatch<Action>
  toast: (message: string) => void
}

/**
 * Every action the screens can take. The study state machine lives here: each
 * action moves a status, and the cards, tabs and detail screen derive from it.
 */
export function createActions({ state, dispatch, toast }: ActionDeps) {
  const setStatus = (id: string, status: StudyStatus, timelineLabel?: string) =>
    dispatch({ type: 'SET_STATUS', id, status, timelineLabel })

  /**
   * Screener submitted: Applied now, invited after a short delay. The delay
   * is a pending transition in the store (see transitions.ts), so it fires
   * even if the page is reloaded in between.
   */
  const submitScreener = (id: string) => {
    setStatus(id, 'applied', 'Applied')
    dispatch({ type: 'ADD_PENDING', transition: { id, kind: 'invite', dueAt: Date.now() + TIMINGS.screenerToInvite } })
  }

  /** Completed: In Process now, Paid after a delay, with the reward and points. */
  const completeStudy = (id: string) => {
    setStatus(id, 'in_process', 'Completed')
    dispatch({ type: 'ADD_PENDING', transition: { id, kind: 'pay', dueAt: Date.now() + TIMINGS.completionToPaid } })
  }

  return {
    // --- profile and onboarding ---
    setOnboarding: (patch: Partial<OnboardingDraft>) =>
      dispatch({ type: 'SET_ONBOARDING', patch }),
    /** Workflow 15: a new account, signed in and free to browse. */
    signUp: (email: string, sourceCode?: string) => dispatch({ type: 'SIGN_UP', email, sourceCode }),
    /** Workflow 12 and 14: remember the coded link the person arrived through. */
    setSource: (code: string) => dispatch({ type: 'SET_SOURCE', code }),
    /** Workflow 49: the tax form is on file. */
    taxFormDone: () => dispatch({ type: 'TAX_FORM_DONE' }),
    setFilters: (patch: Partial<StudyFilters>) => dispatch({ type: 'SET_FILTERS', patch }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    updateUser: (patch: Partial<User>) => dispatch({ type: 'UPDATE_USER', patch }),
    setConsent: (key: keyof User['consent'], value: boolean) =>
      dispatch({ type: 'SET_CONSENT', key, value }),
    setEmailPref: (key: keyof User['emailPrefs'], value: boolean) =>
      dispatch({ type: 'SET_EMAIL_PREF', key, value }),
    markAllRead: () => dispatch({ type: 'MARK_ALL_READ' }),
    markRead: (id: string) => dispatch({ type: 'MARK_READ', id }),
    addPayoutMethod: (method: PayoutMethod) => dispatch({ type: 'ADD_PAYOUT_METHOD', method }),
    removePayoutMethod: (id: string) => dispatch({ type: 'REMOVE_PAYOUT_METHOD', id }),
    setDefaultPayoutMethod: (id: string) => dispatch({ type: 'SET_DEFAULT_METHOD', id }),

    studyById: (id?: string) => state.studies.find((s) => s.id === id),
    toggleSaved: (id: string) => dispatch({ type: 'TOGGLE_SAVED', id }),
    applyToStudy: (id: string) => setStatus(id, 'applying', 'Application started'),
    saveDraft: (id: string, answers: Answers) => {
      dispatch({ type: 'SAVE_ANSWERS', id, answers })
      setStatus(id, 'draft')
    },
    submitScreener,
    /** Rejecting an invitation takes it out of Invites, back to Explore. */
    rejectInvitation: (id: string) => setStatus(id, 'available'),
    scheduleStudy: (id: string, booking: NonNullable<Study['booking']>, isReschedule = false) => {
      dispatch({ type: 'SET_BOOKING', id, booking })
      setStatus(id, 'scheduled', isReschedule ? 'Rescheduled' : 'Scheduled')
    },
    cancelStudy: (id: string) => {
      dispatch({ type: 'CANCEL_STUDY', id })
      toast('Study cancelled, 2 Trust Score deducted')
    },
    confirmPin: (id: string) => {
      dispatch({ type: 'CONFIRM_PIN', id })
      setStatus(id, 'pin_confirmed', 'Session code confirmed')
    },
    completeStudy,
    completeDiaryDay: (id: string, day: number) => dispatch({ type: 'COMPLETE_DIARY_DAY', id, day }),
    rateClient: (id: string, review: NonNullable<Study['userReview']>) =>
      dispatch({ type: 'RATE_CLIENT', id, review }),
    withdraw: (amount: number, destination: string) =>
      dispatch({ type: 'WITHDRAW', amount, destination }),
    redeemPoints: (points: number) => dispatch({ type: 'REDEEM_POINTS', points }),
    addTicket: (subject: string, message: string, studyTitle?: string, topic: Ticket['topic'] = 'general') => {
      const id = `FI-S${Math.floor(100000 + Math.random() * 899999)}`
      const now = new Date().toISOString()
      const ticket: Ticket = {
        id, subject, message, studyTitle, topic, status: 'open', createdAt: now, lastActivityAt: now,
        messages: [{ id: 'm1', from: 'you', text: message, at: now }],
      }
      dispatch({ type: 'ADD_TICKET', ticket })
      // Workflow 56: the first answer is automatic, from the FAQs and guides.
      setTimeout(() => dispatch({
        type: 'SEND_TICKET_MESSAGE', ticketId: id,
        message: { id: `m-${Date.now()}`, from: 'support', text: autoReply(subject, message, topic), at: new Date().toISOString() },
      }), TIMINGS.autoReply)
      return id
    },
    sendTicketMessage: (ticketId: string, text: string) => {
      const message: TicketMessage = {
        id: `m-${Date.now()}`, from: 'you', text, at: new Date().toISOString(),
      }
      dispatch({ type: 'SEND_TICKET_MESSAGE', ticketId, message })
    },
  }
}

export type Actions = ReturnType<typeof createActions>
