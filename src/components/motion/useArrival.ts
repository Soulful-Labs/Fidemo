import { useLayoutEffect, useRef } from 'react'
import { CSS, prefersReduced } from '../../lib/motion'
import { whenClear } from '../../lib/overlays'
import { lastSeen, markSeen } from '../../lib/seen'
import { useSeenKey } from './useSeen'

/**
 * Calls `play(from, to)` whenever `value` arrives somewhere new, where `from`
 * is what the person last saw: the previous render, or the remembered value
 * under `name` on a fresh mount. `from` is undefined the very first time, so
 * nothing ever animates up from zero as if progress had been reset.
 *
 * Remembered (named) figures wait for any open overlay to close first, so a
 * change is seen rather than played behind a modal. Under reduced motion
 * `from` always equals `to`. Survives StrictMode's double effects.
 */
export function useArrival(
  value: number,
  name: string | undefined,
  play: (from: number | undefined, to: number) => void | (() => void),
) {
  const key = useSeenKey(name)
  const shown = useRef<number | undefined>(undefined)
  const cb = useRef(play)
  cb.current = play

  useLayoutEffect(() => {
    const from = prefersReduced() ? value : shown.current ?? (key ? lastSeen(key) : undefined)
    let stop: void | (() => void)
    let cancelWait = () => undefined as void
    // The value only counts as "seen" once its arrival actually starts. (Marking it
    // on a timer let StrictMode's delayed second run of this effect find it already
    // seen and skip the animation, so nothing moved on a screen you came back to.)
    const go = () => { stop = cb.current(from, value); shown.current = value; if (key) markSeen(key, value) }

    if (key && from !== undefined && from !== value) {
      cb.current(from, from) // hold the old value on screen while waiting
      const beat = window.setTimeout(() => { cancelWait = whenClear(go) }, CSS.fast)
      cancelWait = () => window.clearTimeout(beat)
    } else go()

    return () => { cancelWait(); if (typeof stop === 'function') stop() }
  }, [value, key])
}
