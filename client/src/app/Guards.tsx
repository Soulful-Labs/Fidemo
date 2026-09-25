import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../mock/session'

/** Where an unsigned visitor is sent, and where a signed-in one lands. */
export const SIGN_IN = '/signin'
export const HOME = '/dashboard'

/**
 * The app itself. Nothing behind this is reachable without an account, and
 * an account that has not finished onboarding is sent back to the step it
 * stopped at rather than into a half-built app.
 */
export function RequireAccount({ children }: { children: ReactNode }) {
  const { account } = useSession()
  const location = useLocation()
  if (!account) {
    return <Navigate to={SIGN_IN} replace state={{ from: location.pathname + location.search }} />
  }
  if (!account.onboarded) return <Navigate to={nextOnboardingStep(account)} replace />
  return <>{children}</>
}

/**
 * The onboarding screens. Somebody already signed in and onboarded has no
 * business on a sign-up form, so they are sent home.
 */
export function RequireNoAccount({ children }: { children: ReactNode }) {
  const { account } = useSession()
  if (account?.onboarded) return <Navigate to={HOME} replace />
  return <>{children}</>
}

/** The steps, in the order the frames put them. */
export function nextOnboardingStep(account: { company?: string; cardLast4?: string }) {
  if (!account.company) return '/organization'
  if (!account.cardLast4) return '/payment-method'
  return '/in-review'
}

/** `/` is a decision, not a screen: home when signed in, sign-in when not. */
export function Root() {
  const { account } = useSession()
  if (!account) return <Navigate to={SIGN_IN} replace />
  if (!account.onboarded) return <Navigate to={nextOnboardingStep(account)} replace />
  return <Navigate to={HOME} replace />
}
