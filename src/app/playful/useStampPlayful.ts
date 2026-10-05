import { useAnimate } from 'framer-motion'
import type { AnimationSequence } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { DUR, EASE, SPRING } from '../../lib/motion'

const RAISE_AT = DUR.base * 1.6
const HOVER = DUR.slow * 0.9
const STRIKE = DUR.fast * 0.8
/** The seal hits the paper. */
export const STRIKE_AT = RAISE_AT + DUR.base + HOVER + STRIKE
/** The card has been shown off and the words are in. */
export const SHOWN_AT = STRIKE_AT + DUR.slow * 2.2

/**
 * The PLAYFUL certificate as one timeline (tap to finish). A collectible card
 * springs up; a heavy seal is hoisted high over it, its shadow on the paper
 * small and soft; it trembles at the top, then comes down like a hammer, its
 * shadow rushing in to meet it. The whole screen takes the blow, the card
 * squashes and ink splashes; the words write in; then the card turns over
 * once to show it off and lands with the fanfare.
 */
export function useStampPlayful(hooks: { strike: () => void; shown: () => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const playing = useRef(true)
  const controls = useRef<{ complete: () => void } | null>(null)
  const cb = useRef(hooks)
  cb.current = hooks

  useLayoutEffect(() => {
    const S = STRIKE_AT
    const seq: AnimationSequence = [
      [scope.current, { opacity: [0, 1] }, { duration: DUR.fast, ease: EASE.out, at: 0 }],
      ['[data-s=card]', { opacity: [0, 1], y: [260, 0], rotateX: [50, 0], scale: [0.8, 1] }, { ...SPRING.bouncy, at: DUR.fast }],
      ['[data-s=title]', { opacity: [0, 1], y: [-14, 0] }, { duration: DUR.base, ease: EASE.out, at: DUR.base }],
      // Hoisted: huge, tilted, high; its shadow small and faint on the paper below.
      ['[data-s=seal]', { opacity: [0, 1], scale: [5, 3.4], rotate: [-40, -22], y: [-220, -150] }, { duration: DUR.base, ease: EASE.out, at: RAISE_AT }],
      ['[data-s=shadow]', { opacity: [0, 0.25], scale: [0.4, 0.55] }, { duration: DUR.base, ease: EASE.out, at: RAISE_AT }],
      // The tremble at the top of the swing.
      ['[data-s=seal]', { rotate: [-22, -26, -19, -25, -20], y: [-150, -160, -150, -162, -152] }, { duration: HOVER, ease: EASE.inOut, at: RAISE_AT + DUR.base }],
      // Down like a hammer.
      ['[data-s=seal]', { scale: [3.4, 0.86], rotate: [-20, -3], y: [-152, 0] }, { duration: STRIKE, ease: EASE.in, at: S - STRIKE }],
      ['[data-s=shadow]', { opacity: [0.25, 0.7], scale: [0.55, 1] }, { duration: STRIKE, ease: EASE.in, at: S - STRIKE }],
      ['[data-s=seal]', { scale: [0.86, 1], rotate: [-3, -7] }, { ...SPRING.slam, at: S }],
      ['[data-s=shadow]', { opacity: [0.7, 0] }, { duration: DUR.fast, at: S + 0.02 }],
      // The blow: the screen jolts, the card squashes, ink splashes and stays behind.
      ['[data-s=stage]', { y: [0, 18, -8, 4, 0], x: [0, -6, 5, -2, 0] }, { duration: DUR.slow * 0.8, times: [0, 0.15, 0.4, 0.7, 1], ease: EASE.out, at: S }],
      ['[data-s=card]', { scaleY: [1, 0.9, 1.04, 1], scaleX: [1, 1.05, 0.99, 1] }, { duration: DUR.slow, times: [0, 0.18, 0.5, 1], ease: EASE.out, at: S }],
      ['[data-s=ink]', { opacity: [0, 0.8, 0], scale: [0.85, 0.95, 1.9] }, { duration: DUR.slow, times: [0, 0.06, 1], ease: EASE.out, at: S }],
      ['[data-s=ink2]', { opacity: [0, 0.5, 0], scale: [0.9, 1, 2.8] }, { duration: DUR.slow * 1.3, times: [0, 0.06, 1], ease: EASE.out, at: S + 0.05 }],
      ['[data-s=impression]', { opacity: [0, 0.3] }, { duration: DUR.base, ease: EASE.out, at: S }],
      // The words write in, line by line.
      ['[data-s=cover]', { x: ['0%', '101%'] }, { duration: DUR.slow, ease: EASE.inOut, at: S + DUR.base }],
      ['[data-s=tick]', { opacity: [0, 1], scale: [0.2, 1], rotate: [-60, 0] }, { ...SPRING.bouncy, at: S + DUR.slow }],
      // Shown off: the card turns over once and lands.
      ['[data-s=card]', { rotateY: [0, 360] }, { duration: DUR.slow * 1.1, ease: EASE.inOut, at: SHOWN_AT - DUR.slow * 1.1 }],
      ['[data-s=cta]', { opacity: [0, 1], y: [60, 0], scale: [0.8, 1] }, { ...SPRING.bouncy, at: SHOWN_AT }],
    ]
    let live = true
    const timers: number[] = []
    let run: ReturnType<typeof animate> | undefined
    const start = requestAnimationFrame(() => {
      run = animate(seq)
      controls.current = run
      timers.push(window.setTimeout(() => cb.current.strike(), S * 1000))
      timers.push(window.setTimeout(() => cb.current.shown(), SHOWN_AT * 1000))
      run.then(() => { if (live) playing.current = false })
    })
    return () => { live = false; cancelAnimationFrame(start); timers.forEach((t) => window.clearTimeout(t)); run?.stop() }
  }, [animate, scope])

  const skip = () => { controls.current?.complete(); playing.current = false }
  return { scope, playing, skip }
}
