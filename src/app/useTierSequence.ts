import { stagger, useAnimate, useMotionValue, useTransform } from 'framer-motion'
import type { AnimationPlaybackControls, AnimationSequence } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import type { Particle } from '../components/motion/Particles'
import { DUR, EASE, HAPTIC, SPRING, STAGGER, haptic, rollDuration } from '../lib/motion'

/** When the mark hits, in seconds from the start: everything else is timed off it. */
const DROP_AT = DUR.base
const DROP = DUR.slow * 1.4
export const LANDS_AT = DROP_AT + DROP * 0.42

/**
 * The tier upgrade as one timeline, so a tap can finish all of it at once.
 * The glow and rays rise, the title drops, the mark falls with weight and
 * lands, a ring and a burst go out from it, the old tier name gives way to the
 * new, the score rolls up to where it now is, and the benefits follow.
 */
export function useTierSequence(particles: Particle[], fromScore: number, score: number) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const controls = useRef<AnimationPlaybackControls | null>(null)
  // A ref, not state: finishing must not re-render a screen full of moving parts.
  const playing = useRef(true)
  const scoreMv = useMotionValue(fromScore)
  const scoreText = useTransform(scoreMv, (v) => String(Math.round(v)))

  useLayoutEffect(() => {
    scoreMv.set(fromScore)
    const L = LANDS_AT
    const seq: AnimationSequence = [
      [scope.current, { opacity: [0, 1] }, { duration: DUR.fast, ease: EASE.out, at: 0 }],
      ['[data-t=glow]', { opacity: [0, 1] }, { duration: DUR.slow, ease: EASE.out, at: 0 }],
      ['[data-t=title]', { opacity: [0, 1], y: [-24, 0] }, { duration: DUR.base, ease: EASE.out, at: DUR.fast }],
      ['[data-t=old]', { opacity: [0, 1] }, { duration: DUR.base, ease: EASE.out, at: DUR.base }],
      // The fall: accelerating in, a hard landing a touch past full size, a small rebound, rest.
      ['[data-t=coin]', { opacity: [0, 1, 1, 1], y: [-170, 0, -12, 0], scale: [0.3, 1.08, 0.97, 1], rotate: [-28, 0, 0, 0] },
        { duration: DROP, times: [0, 0.42, 0.66, 1], ease: [EASE.in, EASE.out, EASE.inOut], at: DROP_AT }],
      ['[data-t=rays]', { opacity: [0, 1], scale: [0.4, 1] }, { duration: DUR.slow, ease: EASE.out, at: L }],
      ['[data-t=flash]', { opacity: [0, 0.9, 0] }, { duration: DUR.slow, ease: EASE.out, at: L }],
      // In one timeline a value holds its first keyframe from t=0, so everything that bursts starts at 0.
      ['[data-t=ring]', { opacity: [0, 0.9, 0], scale: [0.7, 0.75, 2.4] }, { duration: DUR.slow, times: [0, 0.05, 1], ease: EASE.out, at: L }],
      ['[data-t=ring2]', { opacity: [0, 0.6, 0], scale: [0.7, 0.75, 3.2] }, { duration: DUR.slow * 1.4, times: [0, 0.05, 1], ease: EASE.out, at: L + DUR.fast }],
      ...particles.map((p, i): AnimationSequence[number] => [
        `[data-p=tier][data-i="${i}"]`,
        { x: [0, 0, p.dx, p.dx * 1.08], y: [0, 0, p.dy, p.dy + p.fall], opacity: [0, 1, 1, 0], scale: [0.3, 0.3, 1, 0.5], rotate: [0, 0, p.spin * 0.6, p.spin] },
        { duration: DUR.slow * 1.8, times: [0, 0.01, 0.4, 1], ease: [EASE.out, EASE.out, EASE.in], at: L + (i % 4) * 0.02 },
      ]),
      ['[data-t=old]', { opacity: 0, y: -14 }, { duration: DUR.base, ease: EASE.in, at: L }],
      ['[data-t=new]', { opacity: [0, 1], y: [14, 0], scale: [0.96, 1] }, { duration: DUR.base, ease: EASE.out, at: L + DUR.fast * 0.6 }],
      ['[data-t=score]', { opacity: [0, 1], y: [10, 0] }, { duration: DUR.base, ease: EASE.out, at: L + DUR.fast }],
      [scoreMv, score, { duration: rollDuration(score - fromScore), ease: EASE.out, at: L + DUR.base }],
      ['[data-t=card]', { opacity: [0, 1], y: [28, 0] }, { duration: DUR.base, ease: EASE.out, at: L + DUR.base * 1.2 }],
      ['[data-t=pill]', { opacity: [0, 1], scale: [0.7, 1] }, { ...SPRING.snappy, at: L + DUR.base * 1.5 }],
      ['[data-t=benefit]', { opacity: [0, 1], y: [10, 0] }, { duration: DUR.base, ease: EASE.out, delay: stagger(STAGGER * 2.5), at: L + DUR.base * 1.8 }],
      ['[data-t=cta]', { opacity: [0, 1], y: [20, 0] }, { duration: DUR.base, ease: EASE.out, at: L + DUR.slow * 1.4 }],
    ]
    // Start a frame after mounting, so the mount and the first moving frame
    // are not paid for in the same frame.
    let live = true
    let run: ReturnType<typeof animate> | undefined
    let thud = 0
    const start = requestAnimationFrame(() => {
      run = animate(seq)
      controls.current = run
      thud = window.setTimeout(() => haptic(HAPTIC.land), L * 1000)
      run.then(() => { if (live) playing.current = false })
    })
    return () => { live = false; cancelAnimationFrame(start); window.clearTimeout(thud); run?.stop() }
  }, [animate, scope, particles, fromScore, score, scoreMv])

  /** Tap to skip: everything jumps to where it ends. */
  const skip = () => { controls.current?.complete(); playing.current = false }

  return { scope, playing, skip, scoreText }
}
