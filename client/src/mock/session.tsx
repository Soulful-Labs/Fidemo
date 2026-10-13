import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { clientById } from '@shared/derive'
import { DEMO_CLIENT_EMAIL, DEMO_CLIENT_ID } from '@shared/seed'
import { platform } from '@shared/store'

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
  /** This account's record on the shared platform: its studies, tickets and cards hang off it. */
  clientId?: string
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
  /** The account's picture, where there is one. Only the demo account has one; anyone else shows their initials. */
  photo?: string
}

/** The demo sign-in. Who she is, her company and her card are the shared seed's; only the password lives here. */
export const DEMO_ACCOUNT: Account = {
  email: DEMO_CLIENT_EMAIL,
  password: 'demo1234',
  clientId: DEMO_CLIENT_ID,
  name: '', role: '', company: '',
  seeded: true,
  onboarded: true,
  photo: '/img/jennifer.png',
}

/** An account with the name, role and company the platform holds for it. */
function withClient(a: Account): Account {
  const c = a.clientId ? clientById(platform().getState(), a.clientId) : undefined
  return c ? { ...a, name: c.name, role: c.role, company: c.company, vat: c.vat, website: c.website, industry: c.industry, location: c.location, cardLast4: c.cards.find((x) => x.isDefault)?.last4 ?? a.cardLast4 } : a
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

  const world = useSyncExternalStore(platform().subscribe, platform().getState)
  const account = useMemo(() => {
    const found = store.accounts.find((a) => a.email === store.current)
    return found ? withClient(found) : null
    // `world` is read through withClient; the account follows the platform.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, world])

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
    /** A new client is a new record on the platform, so the console's Clients list has them too. */
    const made = platform().signUpClient({ name: name.trim() || 'New client', email: clean })
    const fresh: Account = {
      email: clean, password, name: name.trim() || 'New client', role: '', company: '',
      clientId: made.ok ? made.id : undefined, seeded: false, onboarded: false,
    }
    setStore((s) => ({ accounts: [...s.accounts, fresh], current: fresh.email }))
    return { ok: true }
  }, [store.accounts])

  const signOut = useCallback(() => setStore((s) => ({ ...s, current: null })), [])

  const update = useCallback<Ctx['update']>((patch) => {
    const mine = store.accounts.find((a) => a.email === store.current)?.clientId
    const { name, role, company, vat, website, industry, location } = patch
    if (mine) platform().updateClient(mine, Object.fromEntries(Object.entries({ name, role, company, vat, website, industry, location }).filter(([, v]) => v !== undefined)))
    setStore((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.email === s.current ? { ...a, ...patch } : a)),
    }))
  }, [store.accounts, store.current])

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
