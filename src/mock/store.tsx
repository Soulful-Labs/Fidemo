import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import { createActions } from './actions'
import type { Actions } from './actions'
import {
  NOTIFICATIONS, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY,
  REFERRALS, STUDIES, TICKETS, TRANSACTIONS, USER,
} from './data'
import { reducer } from './reducer'
import { TIMINGS } from './timings'
import type { Action, AppState } from './storeTypes'
import type { AppNotification } from './types'

export { TIMINGS } from './timings'

const initialState: AppState = {
  signedIn: false,
  user: USER,
  studies: STUDIES,
  notifications: NOTIFICATIONS,
  transactions: TRANSACTIONS,
  payouts: PAYOUTS,
  payoutMethods: PAYOUT_METHODS,
  pointsHistory: POINTS_HISTORY,
  redeemHistory: REDEEM_HISTORY,
  referrals: REFERRALS,
  tickets: TICKETS,
  answers: {},
  toasts: [],
}

type StoreValue = AppState & Actions & {
  dispatch: React.Dispatch<Action>
  toast: (message: string) => void
  dismissToast: (id: string) => void
  notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void
  signIn: () => void
  signOut: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  // Never leave a pending transition running after unmount.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const toast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random()}`
    dispatch({ type: 'TOAST', toast: { id, message } })
    setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id }), TIMINGS.toast)
  }, [])

  const notify = useCallback((n: Omit<AppNotification, 'id' | 'at' | 'read'>) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: { ...n, id: `nt-${Date.now()}`, at: new Date().toISOString(), read: false },
    })
  }, [])

  const value = useMemo<StoreValue>(() => ({
    ...state,
    ...createActions({ state, dispatch, toast, notify, later }),
    dispatch,
    toast,
    dismissToast: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }),
    notify,
    signIn: () => dispatch({ type: 'SIGN_IN' }),
    signOut: () => dispatch({ type: 'SIGN_OUT' }),
  }), [state, toast, notify, later])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
