import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { PlatformState } from '@shared/types'
import { PlatformClock, usePlatform } from '../platform'
import { arrivedAtSignIn, can, landing, leftOnPurpose, moduleOf, useMe } from '../session'
import AppShell from './AppShell'

/**
 * Every console route sits behind this. Signed out, you are sent to sign in
 * and brought back to where you were going. Signed in as a sub-admin, a
 * module you have not been given says so rather than opening: the access
 * toggles on a sub-admin's profile decide it (Sub-Admin, 2062:201923).
 */
/** A detail route names a record. After a reset, or in an empty console, it may not be there. */
function missing(state: PlatformState, pathname: string): boolean {
  const [, a, b, c] = pathname.split('/')
  const study = (id?: string) => !state.studies.some((s) => s.id === id)
  if (a === 'studies' && b === 'reported') return c ? study(c) : false
  if (a === 'studies' && b) return study(b === 'review' ? c : b)
  if (a === 'participants' && b === 'verifications' && c) return c.startsWith('rp') ? !state.reports.some((r) => r.id === c) : !state.people.some((p) => p.id === c.replace(/^(iv|pc)-/, ''))
  if (a === 'participants' && b && b !== 'verifications') return !state.people.some((p) => p.id === b)
  if (a === 'clients' && b === 'verifications' && c) return !state.clients.some((x) => x.id === c.replace(/^cv-/, ''))
  if (a === 'clients' && b && b !== 'verifications') return !state.clients.some((x) => x.id === b)
  if (a === 'support' && b) return !state.tickets.some((t) => t.id === b)
  if (a === 'finance' && b === 'refunds' && c) return study(c)
  if (a === 'sub-admin' && b && b !== 'new') return !state.team.some((t) => t.id === b)
  return false
}

export default function Guard({ children }: { children: ReactNode }) {
  const me = useMe()
  const state = usePlatform()
  const { pathname, search } = useLocation()
  if (!me) return <Navigate to="/signin" replace state={leftOnPurpose() ? null : { from: pathname + search }} />
  const module = moduleOf(pathname)
  if (module && !can(me, module)) {
    return (
      <AppShell crumbs={[{ label: module }]}>
        <div className="rounded-lg bg-bg-1 p-6">
          <h1 className="text-title-s leading-[25px] text-text-title">You do not have access to {module}</h1>
          <p className="pt-2 text-body-regular text-text-subtitle">Your account opens {me.access.length ? me.access.join(', ') : 'no modules yet'}. The master admin can change this on your sub-admin profile.</p>
          <Link to={landing(me)} className="mt-4 inline-flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-3 text-text-medium text-text-title">Go back</Link>
        </div>
      </AppShell>
    )
  }
  if (missing(state, pathname)) {
    return (
      <AppShell crumbs={[{ label: module ?? 'Not found' }]}>
        <div className="rounded-lg bg-bg-1 p-6">
          <h1 className="text-title-s leading-[25px] text-text-title">Nothing to show here</h1>
          <p className="pt-2 text-body-regular text-text-subtitle">This record is not on the platform. It may have gone when the demo was reset.</p>
          <Link to={landing(me)} className="mt-4 inline-flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-3 text-text-medium text-text-title">Go back</Link>
        </div>
      </AppShell>
    )
  }
  return <><PlatformClock />{children}</>
}

/** Sign in, sign up and the reset screens: someone already signed in goes straight to where they land. */
export function SignedOut({ children }: { children: ReactNode }) {
  const me = useMe()
  const { state } = useLocation() as { state: { from?: string } | null }
  useEffect(() => { if (!me) arrivedAtSignIn() }, [me])
  if (me) return <Navigate to={state?.from ?? landing(me)} replace />
  return <>{children}</>
}
