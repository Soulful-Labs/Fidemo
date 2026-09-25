import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Who is signed in.
 *
 * There is no backend, so this is the whole of authentication: a list of
 * accounts in `localStorage` and one of them marked current. It is real in
 * every way that matters to a demo — you cannot reach the app without signing
 * in, signing out puts you back on the sign-in screen, a refresh keeps you
 * where you were, and a brand new account is genuinely empty.
 *
 * Two kinds of account exist:
 *
 * - **the demo account**, jennifer@soulfullabs.com, which carries all the
 *   seeded studies, invoices, panels and tickets;
 * - **anyone who signs up**, who starts with nothing at all.
 *
 * Workflow steps 1 to 3 put the team between signing up and a usable account,
 * which is why `onboarded` is separate from the account existing: a new
 * account walks the onboarding flow before it reaches the app.
 */

export interface Account {
  email: string
  password: string
  name: string
  role: string
  company: string
  /** The demo account is the only one with data behind it. */
  seeded: boolean
  /** False until the onboarding flow has been walked to the end. */
  onboarded: boolean
  /** Organization Details, filled during onboarding. */
  vat?: string
  website?: string
  industry?: string
  location?: string
  /** Payment Method, filled during onboarding. */
  cardLast4?: string
}

export const DEMO_ACCOUNT: Account = {
  email: 'jennifer@soulfullabs.com',
  password: 'demo1234',
  name: 'Jennifer Lee',
  role: 'Product Manager',
  company: 'Soulful Labs',
  seeded: true,
  onboarded: true,
  cardLast4: '4242',
}

const KEY = 'fi-client-session'

interface Stored { accounts: Account[]; current: string | null }

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Stored
      /** The demo account is always present, whatever is in storage. */
      const accounts = [DEMO_ACCOUNT, ...parsed.accounts.filter((a) => a.email !== DEMO_ACCOUNT.email)]
      return { accounts, current: parsed.current }
    }
  } catch {
    /* a blocked or cleared store just means signed out */
  }
  return { accounts: [DEMO_ACCOUNT], current: null }
}

function write(s: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ accounts: s.accounts.filter((a) => !a.seeded), current: s.current }))
  } catch {
    /* nothing to do; the session simply will not survive a refresh */
  }
}

export interface AuthResult { ok: boolean; why?: string }

interface Ctx {
  account: Account | null
  accounts: Account[]
  signIn: (email: string, password: string) => AuthResult
  signUp: (input: { name: string; email: string; password: string }) => AuthResult
  signOut: () => void
  /** Saves what an onboarding step collected onto the current account. */
  update: (patch: Partial<Account>) => void
  /** The end of onboarding: the account may now reach the app. */
  finishOnboarding: () => void
}

const SessionCtx = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Stored>(read)

  useEffect(() => { write(store) }, [store])

  const account = useMemo(
    () => store.accounts.find((a) => a.email === store.current) ?? null,
    [store],
  )

  const signIn = useCallback<Ctx['signIn']>((email, password) => {
    const found = store.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (!found) return { ok: false, why: 'No account with that email address' }
    if (found.password !== password) return { ok: false, why: 'That password does not match' }
    setStore((s) => ({ ...s, current: found.email }))
    return { ok: true }
  }, [store.accounts])

  const signUp = useCallback<Ctx['signUp']>(({ name, email, password }) => {
    const clean = email.trim().toLowerCase()
    if (store.accounts.some((a) => a.email.toLowerCase() === clean)) {
      return { ok: false, why: 'An account already uses that email address' }
    }
    /** Workflow step 1: personal email addresses are not accepted. */
    const domain = clean.split('@')[1] ?? ''
    if (FREE_DOMAINS.includes(domain)) {
      return { ok: false, why: 'Please use your work email address' }
    }
    const fresh: Account = {
      email: clean, password, name: name.trim() || 'New client', role: '', company: '',
      seeded: false, onboarded: false,
    }
    setStore((s) => ({ accounts: [...s.accounts, fresh], current: fresh.email }))
    return { ok: true }
  }, [store.accounts])

  const signOut = useCallback(() => setStore((s) => ({ ...s, current: null })), [])

  const update = useCallback<Ctx['update']>((patch) => {
    setStore((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.email === s.current ? { ...a, ...patch } : a)),
    }))
  }, [])

  const finishOnboarding = useCallback(() => update({ onboarded: true }), [update])

  const value = useMemo<Ctx>(
    () => ({ account, accounts: store.accounts, signIn, signUp, signOut, update, finishOnboarding }),
    [account, store.accounts, signIn, signUp, signOut, update, finishOnboarding],
  )
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

/** Step 1: "Personal email addresses are not accepted." */
const FREE_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'live.com', 'me.com', 'proton.me', 'protonmail.com',
]

export function useSession() {
  const ctx = useContext(SessionCtx)
  if (!ctx) throw new Error('useSession outside SessionProvider')
  return ctx
}
