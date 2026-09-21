import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadPersisted, persist } from './persist'
import type { ReactNode } from 'react'
import { createActions } from './actions'
import type { Actions } from './actions'
import {
  NOTIFICATIONS, PAYOUTS, PAYOUT_METHODS, POINTS_HISTORY, REDEEM_HISTORY,
  REFERRALS, STUDIES, TICKETS, TRANSACTIONS, USER,
} from './data'
import { reducer } from './reducer'
import { usePendingTransitions } from './transitions'
import { TIMINGS } from './timings'
import { DEFAULT_FILTERS } from './storeTypes'
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
  onboarding: {
    fullName: '', dob: '', gender: '', address: '',
    occupation: '', licenseId: '', industry: '', education: '', idType: '',
  },
  filters: DEFAULT_FILTERS,
  toasts: [],
  pending: [],
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
  const [state, dispatch] = useReducer(reducer, initialState, loadPersisted)

  // Keep the demo alive across a refresh or a phone putting the tab to sleep.
  useEffect(() => { persist(state) }, [state])

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
    ...createActions({ state, dispatch, toast }),
    dispatch,
    toast,
    dismissToast: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }),
    notify,
    signIn: () => dispatch({ type: 'SIGN_IN' }),
    signOut: () => dispatch({ type: 'SIGN_OUT' }),
  }), [state, toast, notify])

  usePendingTransitions(state, value)

  // Dev only: a handle for driving state in the browser, used by the
  // verification scripts and to reach states the seed does not start in
  // (for example the Get Started dashboard, which needs 0 completed studies).
  if (import.meta.env.DEV) {
    ;(window as unknown as { __hl?: unknown }).__hl = value
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
