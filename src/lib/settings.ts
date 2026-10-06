import { useSyncExternalStore } from 'react'

/**
 * The one demo setting: sound (lib/sound.ts), off by default, switched from
 * /motion. It never autoplays; it only sounds after someone switches it on.
 * (The app is always playful; there is no switch for that.)
 */
const KEY = 'hl:sound'

let on = (() => { try { return localStorage.getItem(KEY) === '1' } catch { return false } })()
const listeners = new Set<() => void>()

export function setSound(value: boolean) {
  on = value
  try { localStorage.setItem(KEY, value ? '1' : '0') } catch { /* private mode: this session only */ }
  listeners.forEach((l) => l())
}

export const soundOn = () => on

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

/** The sound setting, live. */
export function useSound(): boolean {
  return useSyncExternalStore(subscribe, () => on)
}
