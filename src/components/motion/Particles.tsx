import { useLayoutEffect, useRef } from 'react'
import { earnedSlot, prefersReduced } from '../../lib/motion'
import { CONFETTI, fire } from './Confetti'

/**
 * Confetti thrown up from the parent element (which must be laid out), after
 * `delay` seconds and after any tier 3 moment already playing: real confetti on
 * the frame's canvas that falls and lands on the floor.
 */
export function Burst({ delay = 0, palette = CONFETTI.brand }: { delay?: number; palette?: string[] }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (prefersReduced()) return
    const t = window.setTimeout(() => {
      const r = ref.current?.parentElement?.getBoundingClientRect()
      if (r) fire({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 56, colors: palette, power: 1100, spread: 1.7 })
    }, Math.max(delay * 1000, earnedSlot(900)))
    return () => window.clearTimeout(t)
  }, [delay, palette])
  return <span ref={ref} className="hidden" aria-hidden="true" />
}
