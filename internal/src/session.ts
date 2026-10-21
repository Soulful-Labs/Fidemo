import { useSyncExternalStore } from 'react'
import { platform } from '@shared/store'
import type { Module, TeamMember } from '@shared/types'

/**
 * Who is signed in to the console. The session is the team member's email in
 * this browser's storage, so it survives a reload and every console tab
 * shares it. The person is always read back from the shared platform: if
 * their account goes inactive, or the platform no longer holds them, the
 * session is no longer good and the guard sends them to sign in.
 *
 * There is no backend, so this is a demo's sign-in: it checks the email and
 * password the platform holds, in the browser.
 */
const KEY = 'fi-internal-session'
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

const readEmail = (): string => {
  try { return (JSON.parse(localStorage.getItem(KEY) ?? 'null') as { current?: string } | null)?.current ?? '' } catch { return '' }
}
const writeEmail = (email: string) => {
  try { if (email) localStorage.setItem(KEY, JSON.stringify({ current: email })); else localStorage.removeItem(KEY) } catch { /* private mode */ }
  emit()
}
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) emit() })

/** The signed-in team member, or nothing. */
export function currentMember(): TeamMember | undefined {
  const email = readEmail().toLowerCase()
  if (!email) return undefined
  const m = platform().getState().team.find((t) => t.email.toLowerCase() === email)
  return m?.active ? m : undefined
}
/** For the activity log: the id every console action is recorded against. */
export const currentMemberId = (): string => currentMember()?.id ?? ''

const subscribe = (l: () => void) => {
  listeners.add(l)
  const off = platform().subscribe(l)
  return () => { listeners.delete(l); off() }
}
/** The signed-in team member, live: follows sign in, sign out and changes to their profile or access. */
export function useMe(): TeamMember | undefined {
  // The member object is replaced on every platform change, so the snapshot is a stable string.
  const key = useSyncExternalStore(subscribe, () => { const m = currentMember(); return m ? `${m.id}|${m.name}|${m.role}|${m.email}|${m.access.join(',')}|${m.photo ?? ''}` : '' })
  return key ? currentMember() : undefined
}

export function signIn(email: string, password: string) {
  const res = platform().signInTeam(email, password)
  if (res.ok) { left = false; writeEmail(email.trim()) }
  return res
}
/** Set by a deliberate sign out, so the guard does not remember the page they left as somewhere to return to. */
let left = false
export const leftOnPurpose = () => left
/** Once they are on the sign-in screen the sign out is done with. */
export const arrivedAtSignIn = () => { left = false }
export const signOut = () => { left = true; writeEmail('') }
/** Kept when someone edits their own email, so they stay signed in. */
export const followEmail = (email: string) => writeEmail(email.trim())

/** Which module a console route belongs to. My Account belongs to everyone. */
const MODULE_ROUTES: [string, Module][] = [
  ['/dashboard', 'Dashboard'], ['/studies', 'Studies'], ['/participants', 'Participants'], ['/clients', 'Clients'],
  ['/support', 'Support'], ['/finance', 'Finance'], ['/pricing', 'Pricing & Rewards'], ['/sub-admin', 'Sub-Admin'],
]
export const moduleOf = (pathname: string): Module | undefined => MODULE_ROUTES.find(([p]) => pathname === p || pathname.startsWith(p + '/'))?.[1]
export const can = (m: TeamMember | undefined, module: Module): boolean => Boolean(m && (m.master || m.access.includes(module)))
/** Where someone lands: the Dashboard, or the first module they may open. */
export const landing = (m: TeamMember | undefined): string =>
  !m || can(m, 'Dashboard') ? '/dashboard' : MODULE_ROUTES.find(([, mod]) => can(m, mod))?.[0] ?? '/account'

/** The password rule the console already draws on Change Password. */
export const PASSWORD_RULE = 'At least 1 special character, 1 uppercase character, and 1 number'
export const passwordOk = (p: string) => /[^A-Za-z0-9]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p)
