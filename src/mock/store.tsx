import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadPersisted, persist } from './persist'
import type { ReactNode } from 'react'
import { createActions } from './actions'
import type { Actions } from './actions'
import { returningUserState } from './data'
import { deriveUser } from '../lib/derive'
import type { DerivedFigures } from '../lib/derive'
import { reducer } from './reducer'
import { usePendingTransitions } from './transitions'
import { TIMINGS } from './timings'
import type { Action, AppState } from './storeTypes'
import type { AppNotification, User } from './types'

export { TIMINGS } from './timings'

/** Boot into the returning demo account; Sign Up swaps in a clean one. */
const initialState: AppState = returningUserState()

type StoreValue = Omit<AppState, 'user'> & Actions & {
  /** The stored user with every derived figure filled in (lib/derive.ts). */
  user: User & DerivedFigures
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
    user: deriveUser(state),
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
