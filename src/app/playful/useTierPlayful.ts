import { stagger, useAnimate, useMotionValue, useTransform } from 'framer-motion'
import type { AnimationPlaybackControls, AnimationSequence } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { DUR, EASE, SPRING, STAGGER, rollDuration } from '../../lib/motion'

const DROP_AT = DUR.base
const DROP = DUR.slow * 1.3
/** The mark hits the floor; everything after is timed off this. */
export const IMPACT = DROP_AT + DROP * 0.42
/** The mark has turned over and shows the new tier. */
export const REVEAL = IMPACT + DUR.slow * 0.9

/**
 * The PLAYFUL tier upgrade as one timeline (tap anywhere to finish it). The old
 * tier's mark falls and slams down, the camera takes the hit, then the mark
 * turns over in 3D to show the new tier while the headline flips with it, the
 * score rolls, and the benefits flip up like cards being dealt.
 */
export function useTierPlayful(fromScore: number, score: number, hooks: { impact: () => void; reveal: () => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const controls = useRef<AnimationPlaybackControls | null>(null)
  const playing = useRef(true)
  const scoreMv = useMotionValue(fromScore)
  const scoreText = useTransform(scoreMv, (v) => String(Math.round(v)))
  const cb = useRef(hooks)
  cb.current = hooks

  useLayoutEffect(() => {
    scoreMv.set(fromScore)
    const I = IMPACT
    const R = REVEAL
    const seq: AnimationSequence = [
      [scope.current, { opacity: [0, 1] }, { duration: DUR.fast, ease: EASE.out, at: 0 }],
      ['[data-t=glow]', { opacity: [0, 0.6] }, { duration: DUR.slow, ease: EASE.out, at: 0 }],
      ['[data-t=title]', { opacity: [0, 1], y: [-60, 0], scale: [1.6, 1] }, { ...SPRING.bouncy, at: DUR.fast }],
      ['[data-t=line]', { opacity: [0, 1], y: [16, 0] }, { duration: DUR.base, ease: EASE.out, at: DUR.base }],
      // The fall: from high above, spinning, accelerating, slammed flat on impact.
      ['[data-t=coin]', { opacity: [0, 1, 1, 1], y: [-320, 0, -26, 0], scale: [0.25, 1.18, 0.94, 1], rotate: [-160, 0, 0, 0] },
        { duration: DROP, times: [0, 0.42, 0.66, 1], ease: [EASE.in, EASE.out, EASE.inOut], at: DROP_AT }],
      ['[data-t=stage]', { y: [0, 14, -6, 0], rotate: [0, -1.2, 0.6, 0] }, { duration: DUR.base * 1.4, times: [0, 0.2, 0.55, 1], ease: EASE.out, at: I }],
      ['[data-t=ring]', { opacity: [0, 0.95, 0], scale: [0.7, 0.75, 2.8] }, { duration: DUR.slow, times: [0, 0.05, 1], ease: EASE.out, at: I }],
      ['[data-t=ring2]', { opacity: [0, 0.7, 0], scale: [0.7, 0.75, 3.8] }, { duration: DUR.slow * 1.4, times: [0, 0.05, 1], ease: EASE.out, at: I + DUR.fast }],
      ['[data-t=rays]', { opacity: [0, 0.6], scale: [0.4, 0.9] }, { duration: DUR.slow, ease: EASE.out, at: I }],
      // The turn: the coin and the headline flip over together, overshooting and wobbling home.
      ['[data-t=flip]', { rotateY: [0, 180 + 360] }, { ...SPRING.snappy, at: I + DUR.base }],
      ['[data-t=lineflip]', { rotateX: [0, 180] }, { ...SPRING.bouncy, at: I + DUR.base * 1.3 }],
      ['[data-t=glow]', { opacity: [0.6, 1] }, { duration: DUR.base, ease: EASE.out, at: R }],
      ['[data-t=rays]', { scale: [0.9, 1.15], opacity: [0.6, 1] }, { ...SPRING.bouncy, at: R }],
      ['[data-t=flash]', { opacity: [0, 1, 0] }, { duration: DUR.slow, ease: EASE.out, at: R }],
      ['[data-t=score]', { opacity: [0, 1], y: [10, 0] }, { duration: DUR.base, ease: EASE.out, at: R }],
      [scoreMv, score, { duration: rollDuration(score - fromScore) * 1.5, ease: EASE.out, at: R + DUR.fast }],
      ['[data-t=card]', { opacity: [0, 1], y: [60, 0], rotateX: [-70, 0] }, { ...SPRING.bouncy, at: R + DUR.base }],
      ['[data-t=pill]', { opacity: [0, 1], scale: [0.2, 1], rotate: [-12, 0] }, { ...SPRING.bouncy, at: R + DUR.base * 1.6 }],
      ['[data-t=benefit]', { opacity: [0, 1], rotateX: [-90, 0], y: [12, 0] }, { ...SPRING.bouncy, delay: stagger(STAGGER * 3), at: R + DUR.base * 2 }],
      ['[data-t=cta]', { opacity: [0, 1], y: [60, 0], scale: [0.8, 1] }, { ...SPRING.bouncy, at: R + DUR.slow * 1.2 }],
    ]
    let live = true
    let run: ReturnType<typeof animate> | undefined
    const timers: number[] = []
    const start = requestAnimationFrame(() => {
      run = animate(seq)
      controls.current = run
      timers.push(window.setTimeout(() => cb.current.impact(), I * 1000))
      timers.push(window.setTimeout(() => cb.current.reveal(), R * 1000))
      run.then(() => { if (live) playing.current = false })
    })
    return () => { live = false; cancelAnimationFrame(start); timers.forEach((t) => window.clearTimeout(t)); run?.stop() }
  }, [animate, scope, fromScore, score, scoreMv])

  /** Tap to skip: everything jumps to where it ends. */
  const skip = () => { controls.current?.complete(); playing.current = false }
  return { scope, playing, skip, scoreText }
}
