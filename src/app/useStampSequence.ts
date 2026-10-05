import { useAnimate } from 'framer-motion'
import type { AnimationSequence } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import type { Particle } from '../components/motion/Particles'
import { DUR, EASE, HAPTIC, SPRING, haptic } from '../lib/motion'

/** The seal is raised, held for a beat, then brought down hard. Everything else is timed off the strike. */
const LIFT_AT = DUR.base * 1.6
const STRIKE = DUR.fast
export const STRIKES_AT = LIFT_AT + DUR.base + STRIKE

/**
 * Moment C as one timeline. Unlike the tier upgrade, nothing rises or glows
 * in: a paper card slides up, a seal is lifted over it, held, and stamped
 * down. The card gives under the blow, ink spreads and stays as a faint
 * impression, a few specks scatter low, and only then does the text on the
 * card write itself in, line by line.
 */
export function useStampSequence(specks: Particle[]) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const playing = useRef(true)
  const controls = useRef<{ complete: () => void } | null>(null)

  useLayoutEffect(() => {
    const S = STRIKES_AT
    const seq: AnimationSequence = [
      [scope.current, { opacity: [0, 1] }, { duration: DUR.fast, ease: EASE.out, at: 0 }],
      ['[data-s=card]', { opacity: [0, 1], y: [40, 0] }, { duration: DUR.base, ease: EASE.out, at: DUR.fast }],
      ['[data-s=title]', { opacity: [0, 1] }, { duration: DUR.base, ease: EASE.out, at: DUR.base }],
      // Lifted into view large and tilted, hovering over the paper...
      ['[data-s=seal]', { opacity: [0, 0.9], scale: [3.2, 2.5], rotate: [-26, -16], y: [-40, -28] }, { duration: DUR.base, ease: EASE.out, at: LIFT_AT }],
      // ...then struck down: accelerating, a touch past flat on impact, back to rest.
      ['[data-s=seal]', { opacity: 1, scale: [2.5, 0.9], rotate: [-16, -4], y: [-28, 0] }, { duration: STRIKE, ease: EASE.in, at: S - STRIKE }],
      ['[data-s=seal]', { scale: [0.9, 1], rotate: [-4, -6] }, { ...SPRING.snappy, at: S }],
      ['[data-s=card]', { scale: [1, 0.975, 1], y: [0, 3, 0] }, { duration: DUR.base, times: [0, 0.2, 1], ease: [EASE.out, EASE.out], at: S }],
      ['[data-s=ink]', { opacity: [0, 0.55, 0], scale: [0.9, 1.0, 1.5] }, { duration: DUR.slow, times: [0, 0.08, 1], ease: EASE.out, at: S }],
      ['[data-s=impression]', { opacity: [0, 0.22] }, { duration: DUR.base, ease: EASE.out, at: S }],
      ...specks.map((p, i): AnimationSequence[number] => [
        `[data-p=speck][data-i="${i}"]`,
        { x: [0, 0, p.dx], y: [0, 0, p.dy], opacity: [0, 0.9, 0], scale: [0.6, 0.6, 1] },
        { duration: DUR.base * 1.6, times: [0, 0.01, 1], ease: EASE.out, at: S },
      ]),
      // The writing: each line uncovered left to right by a sliding paper-coloured cover.
      ['[data-s=cover]', { x: ['0%', '101%'] }, { duration: DUR.slow, ease: EASE.inOut, at: S + DUR.base }],
      ['[data-s=tick]', { opacity: [0, 1], scale: [0.4, 1] }, { ...SPRING.snappy, at: S + DUR.slow }],
      ['[data-s=cta]', { opacity: [0, 1], y: [20, 0] }, { duration: DUR.base, ease: EASE.out, at: S + DUR.slow + DUR.base }],
    ]
    let live = true
    let thud = 0
    let run: ReturnType<typeof animate> | undefined
    const start = requestAnimationFrame(() => {
      run = animate(seq)
      controls.current = run
      thud = window.setTimeout(() => haptic(HAPTIC.stamp), S * 1000)
      run.then(() => { if (live) playing.current = false })
    })
    return () => { live = false; cancelAnimationFrame(start); window.clearTimeout(thud); run?.stop() }
  }, [animate, scope, specks])

  const skip = () => { controls.current?.complete(); playing.current = false }
  return { scope, playing, skip }
}
