import { createContext, useContext, useSyncExternalStore } from 'react'

/**
 * Two demo switches, both readable and settable from /motion:
 *
 * PLAYFUL (default on): the game-feel layer, meaning depth, surfaces, tilt, bounce and the
 * louder celebrations. Off, the app renders exactly as it did before that layer
 * existed (commit 5c42eb5). Every playful style in index.css is keyed on
 * `[data-playful=on]` (set on <html>) and every playful behaviour reads
 * `usePlayful()`, so nothing leaks through when it is off.
 *
 * SOUND (default off): the synthesized sound set in lib/sound.ts. Never
 * autoplays; it only ever sounds after someone has switched it on.
 */
type Flags = { playful: boolean; sound: boolean }
const KEY = 'hl:flags'

function read(): Flags {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Flags>
    return { playful: raw.playful ?? true, sound: raw.sound ?? false }
  } catch {
    return { playful: true, sound: false }
  }
}

let flags = read()
const listeners = new Set<() => void>()

function apply() {
  if (typeof document !== 'undefined') document.documentElement.dataset.playful = flags.playful ? 'on' : 'off'
}
apply()

export function setFlag(name: keyof Flags, value: boolean) {
  flags = { ...flags, [name]: value }
  try { localStorage.setItem(KEY, JSON.stringify(flags)) } catch { /* private mode: this session only */ }
  apply()
  listeners.forEach((l) => l())
}

export const isPlayful = () => flags.playful
export const soundOn = () => flags.sound

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

/** The global flags, live. */
export function useFlags(): Flags {
  return useSyncExternalStore(subscribe, () => flags)
}

/**
 * A local override, so /motion can play the big two with the layer off and on
 * side by side. Wrap a subtree in <PlayfulScope.Provider value={false}> and give
 * its root `data-playful="off"`, which the CSS respects.
 */
export const PlayfulScope = createContext<boolean | null>(null)

/** Is the playful layer on here? (The global flag, unless a PlayfulScope says otherwise.) */
export function usePlayful(): boolean {
  const local = useContext(PlayfulScope)
  const { playful } = useFlags()
  return local ?? playful
}
