import { pointsToUsd, WITHDRAWAL_FEE } from '../../lib/rules'
import type { Action, AppState } from '../storeTypes'

/** Wallet, points, profile, notifications, support and toasts. */
export function accountReducer(state: AppState, action: Action): AppState | null {
  switch (action.type) {
    case 'SIGN_IN':
      return { ...state, signedIn: true }
    case 'SIGN_OUT':
      return { ...state, signedIn: false }

    case 'WITHDRAW': {
      const now = new Date().toISOString()
      return {
        ...state,
        user: { ...state.user, walletBalance: state.user.walletBalance - action.amount },
        payouts: [
          { id: `po-${Date.now()}`, at: now, amount: action.amount, fee: WITHDRAWAL_FEE,
            net: action.amount - WITHDRAWAL_FEE, destination: action.destination,
            txId: `#${Math.floor(100000000000 + Math.random() * 899999999999)}`,
            status: 'processing' },
          ...state.payouts,
        ],
      }
    }

    case 'REDEEM_POINTS': {
      const amount = pointsToUsd(action.points)
      return {
        ...state,
        user: {
          ...state.user,
          points: state.user.points - action.points,
          walletBalance: state.user.walletBalance + amount,
        },
        redeemHistory: [
          { id: `rd-${Date.now()}`, at: new Date().toISOString(), points: action.points, amount,
            reference: `#${Math.floor(100000000 + Math.random() * 899999999)}` },
          ...state.redeemHistory,
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

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.patch } }
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
