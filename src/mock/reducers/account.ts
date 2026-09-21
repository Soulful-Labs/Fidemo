import { profileCompletion } from '../../lib/profile'
import { POINTS, pointsToUsd, WITHDRAWAL_FEE } from '../../lib/rules'
import { newUserState, returningUserState } from '../data'
import { USER } from '../seed/account'
import { DEFAULT_FILTERS } from '../storeTypes'
import type { Action, AppState } from '../storeTypes'

/** Wallet, points, profile, notifications, support and toasts. */
export function accountReducer(state: AppState, action: Action): AppState | null {
  switch (action.type) {
    /** The seed account's email brings that account back; anything else signs in whoever is here. */
    case 'SIGN_IN': {
      const seed = action.email?.trim().toLowerCase() === USER.email.toLowerCase()
      if (seed && state.user.email.toLowerCase() !== USER.email.toLowerCase()) return { ...returningUserState(), signedIn: true }
      return { ...state, signedIn: true }
    }
    case 'SIGN_OUT':
      return { ...state, signedIn: false }
    /** Workflow 15: a new account starts clean, signed in, free to browse. */
    case 'SIGN_UP': {
      const code = action.sourceCode ?? state.arrivedVia
      const fresh = newUserState(action.email, code)
      // Points rule: being referred earns 100, credited when the link code is recorded.
      const referred = code
        ? [{ id: `pt-${Date.now()}`, kind: 'bonus' as const, label: 'Bonus', detail: 'Joined by referral', at: new Date().toISOString(), amount: POINTS.BEING_REFERRED }]
        : []
      return { ...fresh, pointsHistory: referred, arrivedVia: state.arrivedVia }
    }
    /** Workflow 12 and 14: the coded link the person arrived through. */
    case 'SET_SOURCE':
      return state.arrivedVia === action.code ? state : { ...state, arrivedVia: action.code }
    /** Workflow 49: the tax form is on file, withdrawals open again. */
    case 'TAX_FORM_DONE':
      return { ...state, user: { ...state.user, taxFormDone: true } }

    case 'SET_ONBOARDING':
      return { ...state, onboarding: { ...state.onboarding, ...action.patch } }

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.patch } }
    // Reset clears the sheet's filters but keeps the search and sort, which
    // live outside it on the Explore toolbar.
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { ...DEFAULT_FILTERS, query: state.filters.query, sort: state.filters.sort },
      }

    case 'WITHDRAW': {
      const now = new Date().toISOString()
      return {
        ...state,
        payouts: [
          { id: `po-${Date.now()}`, at: now, amount: action.amount, fee: WITHDRAWAL_FEE,
            net: action.amount - WITHDRAWAL_FEE, destination: action.destination,
            txId: `#${Math.floor(100000000000 + Math.random() * 899999999999)}`,
            status: 'processing' },
          ...state.payouts,
        ],
      }
    }

    /** Points leave the points history and arrive in the wallet as a transaction. */
    case 'REDEEM_POINTS': {
      const amount = pointsToUsd(action.points)
      const now = new Date().toISOString()
      const reference = `#${Math.floor(100000000 + Math.random() * 899999999)}`
      return {
        ...state,
        redeemHistory: [{ id: `rd-${Date.now()}`, at: now, points: action.points, amount, reference }, ...state.redeemHistory],
        transactions: [
          { id: `tx-rd-${Date.now()}`, title: `${action.points.toLocaleString('en-US')} points redeemed`, at: now,
            amount, txNumber: reference, category: 'Redeem Points' },
          ...state.transactions,
        ],
      }
    }

    case 'ADD_PAYOUT_METHOD':
      return { ...state, payoutMethods: [...state.payoutMethods, action.method] }
    case 'REMOVE_PAYOUT_METHOD':
      return { ...state, payoutMethods: state.payoutMethods.filter((m) => m.id !== action.id) }
    case 'SET_DEFAULT_METHOD':
      return {
        ...state,
        payoutMethods: state.payoutMethods.map((m) => ({ ...m, isDefault: m.id === action.id })),
      }

    case 'UPDATE_USER': {
      const user = { ...state.user, ...action.patch }
      // Points rule: a full profile earns 50, once.
      const full = profileCompletion(user) >= 100 && !state.pointsHistory.some((p) => p.detail === 'Full profile completion')
      return {
        ...state,
        user,
        pointsHistory: full
          ? [{ id: `pt-${Date.now()}`, kind: 'bonus' as const, label: 'Bonus', detail: 'Full profile completion', at: new Date().toISOString(), amount: POINTS.FULL_PROFILE }, ...state.pointsHistory]
          : state.pointsHistory,
      }
    }
    case 'SET_CONSENT':
      return {
        ...state,
        user: { ...state.user, consent: { ...state.user.consent, [action.key]: action.value } },
      }
    case 'SET_EMAIL_PREF':
      return {
        ...state,
        user: { ...state.user, emailPrefs: { ...state.user.emailPrefs, [action.key]: action.value } },
      }

    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n),
      }
    case 'ADD_PENDING':
      return { ...state, pending: [...state.pending.filter((t) => !(t.id === action.transition.id && t.kind === action.transition.kind)), action.transition] }
    case 'REMOVE_PENDING':
      return { ...state, pending: state.pending.filter((t) => !(t.id === action.id && t.kind === action.kind)) }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] }

    case 'ADD_TICKET':
      return { ...state, tickets: [action.ticket, ...state.tickets] }
    case 'SEND_TICKET_MESSAGE':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.ticketId
            ? { ...t, lastActivityAt: action.message.at, messages: [...t.messages, action.message] }
            : t),
      }

    case 'TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }

    default:
      return null
  }
}
