import { matchPath } from 'react-router-dom'

/**
 * The in-app history stack, kept by AppShell from the router's navigation
 * events. Back arrows use it to return to the screen the person actually
 * came from; only when there is nothing behind (a fresh load, a deep link)
 * do they fall back to the logical parent in navigation.ts.
 */
interface Entry { key: string; path: string }
const stack: Entry[] = []

/**
 * Screens a person passes through rather than comes from: auth and
 * onboarding steps, apply / schedule / session flows, success screens.
 * Going back never lands on one of these; it skips to the screen before.
 */
const TRANSIENT = [
  '/verify-otp', '/check-email', '/reset-password', '/password-updated', '/onboarding/*',
  '/studies/:id/screener', '/studies/:id/applied', '/studies/:id/schedule/*', '/studies/:id/schedule',
  '/studies/:id/reschedule/*', '/studies/:id/reschedule', '/studies/:id/pin/*', '/studies/:id/pin',
  '/studies/:id/survey/*', '/studies/:id/survey', '/studies/:id/rate', '/studies/:id/diary/:day',
  '/wallet/withdraw/*', '/wallet/withdraw', '/wallet/payout-methods/add', '/points/redeem/*', '/points/redeem',
  '/profile/settings/deactivate', '/support/contact',
]
const isTransient = (path: string) => TRANSIENT.some((p) => matchPath({ path: p, end: true }, path) !== null)

export function recordNavigation(type: 'PUSH' | 'POP' | 'REPLACE', key: string, path: string) {
  // The first location arrives as a POP; it is the bottom of the stack.
  if (stack.length === 0) { stack.push({ key, path }); return }
  if (type === 'PUSH') stack.push({ key, path })
  else if (type === 'REPLACE') stack[stack.length - 1] = { key, path }
  else if (type === 'POP') {
    const at = stack.map((e) => e.key).lastIndexOf(key)
    if (at >= 0) stack.length = at + 1
    else stack.length = Math.max(1, stack.length - 1)
  }
}

/**
 * How many history entries to go back to reach the screen the person came
 * from: the nearest earlier entry that is neither a pass-through screen nor
 * the current path. 0 when there is none.
 */
export function stepsBack(currentPath: string): number {
  for (let i = stack.length - 2; i >= 0; i--) {
    const { path } = stack[i]
    if (path === currentPath || isTransient(path)) continue
    return stack.length - 1 - i
  }
  return 0
}

/** Test hook: forget everything (a full reload does this on its own). */
export function resetHistory() {
  stack.length = 0
}
