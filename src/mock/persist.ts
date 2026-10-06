import { forgetSeen } from '../lib/seen'
import type { AppState } from './storeTypes'

/**
 * The whole mock store lives in memory, so a page refresh (or a phone
 * reloading a backgrounded tab) would throw the demo back to the seed. It is
 * mirrored into localStorage instead. Open any URL with ?reset=1 to start
 * over from the seed; bump VERSION when the seed shape changes.
 */
const KEY = 'hl-respondent-demo'
// 3: the demo starting state was tuned so an ordinary walk earns things (docs/Motion.md, "Demo walk").
const VERSION = 3

export function loadPersisted(seed: AppState): AppState {
  try {
    if (new URLSearchParams(window.location.search).has('reset')) {
      localStorage.removeItem(KEY)
      // Back to the seed: forget the figures last seen, so nothing animates as if it had fallen.
      forgetSeen('')
      return seed
    }
    const raw = localStorage.getItem(KEY)
    if (!raw) { forgetSeen(''); return seed }
    const saved = JSON.parse(raw) as { version: number; state: AppState }
    if (saved.version !== VERSION) { forgetSeen(''); return seed }
    return { ...seed, ...saved.state, toasts: [] }
  } catch {
    return seed
  }
}

export function persist(state: AppState): void {
  try {
    const { toasts: _toasts, ...rest } = state
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state: rest }))
  } catch {
    // Storage can be unavailable in private mode; the demo still runs in memory.
  }
}
