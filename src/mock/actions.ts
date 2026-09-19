import { STUDIES } from './studies'
import type { Action, Answers, AppState, OnboardingDraft, StudyFilters } from './storeTypes'
import type {
  AppNotification, PayoutMethod, Study, StudyStatus, Ticket, TicketMessage, User,
} from './types'
import { TIMINGS } from './timings'

/** Session study types schedule; survey and diary go straight to completing. */
const SESSION_TYPES: Study['type'][] = [
  'video_call', 'group_video_call', 'in_person', 'in_person_group',
]

export interface ActionDeps {
  state: AppState
  dispatch: React.Dispatch<Action>
  toast: (message: string) => void
  notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void
  later: (fn: () => void, ms: number) => void
}

/**
 * Every action the screens can take. The study state machine lives here: each
 * action moves a status, and the cards, tabs and detail screen derive from it.
 */
export function createActions({ state, dispatch, toast, notify, later }: ActionDeps) {
  const setStatus = (id: string, status: StudyStatus, timelineLabel?: string) =>
    dispatch({ type: 'SET_STATUS', id, status, timelineLabel })

  const find = (id: string) => state.studies.find((s) => s.id === id) ?? STUDIES.find((s) => s.id === id)

  /** Screener submitted: Applied now, invited after a short delay. */
  const submitScreener = (id: string) => {
    setStatus(id, 'applied', 'Applied')
    later(() => {
      const study = find(id)
      const session = study ? SESSION_TYPES.includes(study.type) : true
      setStatus(
        id,
        session ? 'invited_to_schedule' : 'invited_to_complete',
        session ? 'Invited to schedule' : 'Invited to complete',
      )
      notify({
        kind: 'study',
        title: session
          ? "You've been selected to complete!"
          : "Congrats! You're invited to complete study!",
        body: `${study?.title ?? 'Your study'} is ready for the next step.`,
        actionLabel: session ? 'Schedule Now' : 'Start Study',
        to: session ? `/studies/${id}/schedule` : `/studies/${id}`,
      })
      toast(session ? 'You are invited to schedule' : 'You are invited to complete')
    }, TIMINGS.screenerToInvite)
  }

  /** Completed: In Process now, Paid after a delay, with the reward and points. */
  const completeStudy = (id: string) => {
    setStatus(id, 'in_process', 'Completed')
    later(() => {
      const study = find(id)
      dispatch({ type: 'PAY_STUDY', id })
      notify({
        kind: 'money',
        title: `You've received $${study?.reward ?? 0}!`,
        body: `Your payment for ${study?.title ?? 'your study'} has been added to your wallet.`,
        to: '/wallet',
      })
      toast(`Paid $${study?.reward ?? 0}, +25 points, +1 Trust Score`)
    }, TIMINGS.completionToPaid)
  }

  return {
    // --- profile and onboarding ---
    setOnboarding: (patch: Partial<OnboardingDraft>) =>
      dispatch({ type: 'SET_ONBOARDING', patch }),
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
      setStatus(id, 'pin_confirmed', 'PIN confirmed')
    },
    completeStudy,
    completeDiaryDay: (id: string, day: number) => dispatch({ type: 'COMPLETE_DIARY_DAY', id, day }),
    rateClient: (id: string, review: NonNullable<Study['userReview']>) =>
      dispatch({ type: 'RATE_CLIENT', id, review }),
    withdraw: (amount: number, destination: string) =>
      dispatch({ type: 'WITHDRAW', amount, destination }),
    redeemPoints: (points: number) => dispatch({ type: 'REDEEM_POINTS', points }),
    addTicket: (subject: string, message: string, studyTitle?: string) => {
      const id = `FI-S${Math.floor(100000 + Math.random() * 899999)}`
      const now = new Date().toISOString()
      const ticket: Ticket = {
        id, subject, message, studyTitle, status: 'open', createdAt: now, lastActivityAt: now,
        messages: [{ id: 'm1', from: 'you', text: message, at: now }],
      }
      dispatch({ type: 'ADD_TICKET', ticket })
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
