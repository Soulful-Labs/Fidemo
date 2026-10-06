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
 * The tier upgrade as one timeline (tap anywhere to finish it). The old
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
    const roll = rollDuration(score - fromScore) * 1.5
    // Whole transform strings, not separate x/y/scale/rotate: framer hands these
    // to the compositor (WAAPI), so the timeline barely touches the main thread.
    const seq: AnimationSequence = [
      [scope.current, { opacity: [0, 1] }, { duration: DUR.fast, ease: EASE.out, at: 0 }],
      ['[data-t=glow]', { opacity: [0, 0.6] }, { duration: DUR.slow, ease: EASE.out, at: 0 }],
      ['[data-t=title]', { opacity: [0, 1], transform: ['translateY(-60px) scale(1.6)', 'translateY(0px) scale(1)'] }, { ...SPRING.bouncy, at: DUR.fast }],
      ['[data-t=line]', { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] }, { duration: DUR.base, ease: EASE.out, at: DUR.base }],
      // The fall: from high above, spinning, accelerating, slammed flat on impact.
      ['[data-t=coin]', { opacity: [0, 1, 1, 1], transform: ['translateY(-320px) scale(0.25) rotate(-160deg)', 'translateY(0px) scale(1.18) rotate(0deg)', 'translateY(-26px) scale(0.94) rotate(0deg)', 'translateY(0px) scale(1) rotate(0deg)'] },
        { duration: DROP, times: [0, 0.42, 0.66, 1], ease: [EASE.in, EASE.out, EASE.inOut], at: DROP_AT }],
      ['[data-t=stage]', { transform: ['translateY(0px) rotate(0deg)', 'translateY(14px) rotate(-1.2deg)', 'translateY(-6px) rotate(0.6deg)', 'translateY(0px) rotate(0deg)'] }, { duration: DUR.base * 1.4, times: [0, 0.2, 0.55, 1], ease: EASE.out, at: I }],
      ['[data-t=ring]', { opacity: [0, 0.95, 0], transform: ['scale(0.7)', 'scale(0.75)', 'scale(2.8)'] }, { duration: DUR.slow, times: [0, 0.05, 1], ease: EASE.out, at: I }],
      ['[data-t=ring2]', { opacity: [0, 0.7, 0], transform: ['scale(0.7)', 'scale(0.75)', 'scale(3.8)'] }, { duration: DUR.slow * 1.4, times: [0, 0.05, 1], ease: EASE.out, at: I + DUR.fast }],
      ['[data-t=rays]', { opacity: [0, 0.6], transform: ['scale(0.4)', 'scale(0.9)'] }, { duration: DUR.slow, ease: EASE.out, at: I }],
      // The turn: the coin and the headline flip over together, overshooting and wobbling home.
      ['[data-t=flip]', { transform: ['perspective(700px) rotateY(0deg)', 'perspective(700px) rotateY(540deg)'] }, { ...SPRING.snappy, at: I + DUR.base }],
      ['[data-t=lineflip]', { transform: ['rotateX(0deg)', 'rotateX(180deg)'] }, { ...SPRING.bouncy, at: I + DUR.base * 1.3 }],
      ['[data-t=glow]', { opacity: [0.6, 1] }, { duration: DUR.base, ease: EASE.out, at: R }],
      ['[data-t=rays]', { transform: ['scale(0.9)', 'scale(1.15)'], opacity: [0.6, 1] }, { ...SPRING.bouncy, at: R }],
      ['[data-t=flash]', { opacity: [0, 1, 0] }, { duration: DUR.slow, ease: EASE.out, at: R }],
      ['[data-t=score]', { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: DUR.base, ease: EASE.out, at: R }],
      [scoreMv, score, { duration: roll, ease: EASE.out, at: R + DUR.fast }],
      // The score lands: it swells and settles as the last digit arrives.
      ['[data-t=scorenum]', { transform: ['scale(1)', 'scale(1.9)', 'scale(0.92)', 'scale(1)'] }, { duration: DUR.slow, times: [0, 0.3, 0.65, 1], ease: EASE.out, at: R + DUR.fast + roll }],
      // A band of light sweeps across the whole screen as the new tier shows.
      ['[data-t=sweep]', { transform: ['translateX(-140%) skewX(-12deg)', 'translateX(240%) skewX(-12deg)'], opacity: [0, 1, 0] }, { duration: DUR.slow * 1.3, ease: EASE.inOut, at: R - DUR.fast }],
      ['[data-t=card]', { opacity: [0, 1], transform: ['translateY(60px) rotateX(-70deg)', 'translateY(0px) rotateX(0deg)'] }, { ...SPRING.bouncy, at: R + DUR.base }],
      ['[data-t=pill]', { opacity: [0, 1], transform: ['scale(0.2) rotate(-12deg)', 'scale(1) rotate(0deg)'] }, { ...SPRING.bouncy, at: R + DUR.base * 1.6 }],
      ['[data-t=benefit]', { opacity: [0, 1], transform: ['translateY(12px) rotateX(-90deg)', 'translateY(0px) rotateX(0deg)'] }, { ...SPRING.bouncy, delay: stagger(STAGGER * 3), at: R + DUR.base * 2 }],
      ['[data-t=cta]', { opacity: [0, 1], transform: ['translateY(60px) scale(0.8)', 'translateY(0px) scale(1)'] }, { ...SPRING.bouncy, at: R + DUR.slow * 1.2 }],
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
