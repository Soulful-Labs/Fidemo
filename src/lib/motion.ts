import { MotionGlobalConfig } from 'framer-motion'
import type { Transition, Variants } from 'framer-motion'

/**
 * The whole motion vocabulary. Every animation in the app imports from here:
 * three durations, three easings, three springs, one stagger. If a screen
 * seems to need a fourth of anything, the vocabulary is wrong, not short.
 *
 * Only transform and opacity are ever animated, so everything stays on the
 * compositor at 375px on a mid-range phone. docs/Motion.md explains each moment.
 */

/** Seconds. fast = feedback, base = arrivals and exits, slow = the moments that matter. */
export const DUR = { fast: 0.16, base: 0.32, slow: 0.72 } as const

/** out = things arriving, in = things leaving or landing hard, inOut = loops and sweeps. */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 0.85, 0.3],
  inOut: [0.65, 0, 0.35, 1],
} as const

/** soft = sheets and toasts, snappy = presses and pops, heavy = things that land with weight. */
export const SPRING = {
  soft: { type: 'spring', stiffness: 380, damping: 36, mass: 1 },
  snappy: { type: 'spring', stiffness: 600, damping: 26, mass: 0.6 },
  heavy: { type: 'spring', stiffness: 260, damping: 14, mass: 1.4 },
} as const satisfies Record<string, Transition>

/** Seconds between siblings arriving one after another. */
export const STAGGER = 0.045

/** The CSS twins of the above, for keyframes and WAAPI (milliseconds, cubic-bezier strings). */
export const CSS = {
  fast: DUR.fast * 1000,
  base: DUR.base * 1000,
  slow: DUR.slow * 1000,
  out: `cubic-bezier(${EASE.out.join(',')})`,
  in: `cubic-bezier(${EASE.in.join(',')})`,
  inOut: `cubic-bezier(${EASE.inOut.join(',')})`,
} as const

/**
 * How long a number takes to roll up. Scales with the size of the gain so a
 * big win feels big: a +1 takes `base`, a +25 most of `slow`, and anything in
 * the thousands stretches to twice `slow`. Derived from the three durations,
 * never a fourth constant.
 */
export function rollDuration(gain: number): number {
  const size = Math.min(1, Math.log10(Math.abs(gain) + 1) / 3.5)
  return DUR.base + (DUR.slow * 2 - DUR.base) * size
}

// --- Named variants ---------------------------------------------------------

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: DUR.base, ease: EASE.out } },
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  shown: { opacity: 1, scale: 1, transition: SPRING.snappy },
}

/** Lands from above with weight: completion badges, the tier coin. */
export const land: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: -48 },
  shown: { opacity: 1, scale: 1, y: 0, transition: SPRING.heavy },
}

/** The calm reveal for a result that is not a win: slower, no overshoot. */
export const settle: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

export const staggerChildren = (delay = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER, delayChildren: delay } },
})

/** Dialogs: scale up from slightly small. Sheets: rise from the bottom edge. */
export const dialog: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  shown: { opacity: 1, scale: 1, y: 0, transition: SPRING.soft },
  gone: { opacity: 0, scale: 0.96, transition: { duration: DUR.fast, ease: EASE.in } },
}

export const sheet: Variants = {
  hidden: { y: '100%' },
  shown: { y: 0, transition: SPRING.soft },
  gone: { y: '100%', transition: { duration: DUR.base, ease: EASE.in } },
}

export const scrim: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: DUR.base, ease: EASE.out } },
  gone: { opacity: 0, transition: { duration: DUR.fast, ease: EASE.in } },
}

// --- Reduced motion, enforced once for the whole app ------------------------

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

/** True while the person has asked their device for less motion. */
export function prefersReduced(): boolean {
  return Boolean(query?.matches)
}

/**
 * Called once at boot. Reduced motion turns every framer-motion animation and
 * every `animate()` number roll into an instant jump to the final value (so no
 * state is ever lost), and index.css does the same for CSS keyframes. The
 * decorative pieces (particles, sheens, idle loops, floating +X) also check
 * `prefersReduced()` / `useReducedMotion()` and do not render at all.
 */
export function installReducedMotion() {
  const apply = () => { MotionGlobalConfig.skipAnimations = prefersReduced() }
  apply()
  query?.addEventListener('change', apply)
}

/**
 * Web Animations for the small imperative touches (a nudge, a pulse). Skipped
 * entirely under reduced motion, so nothing per screen has to remember to check.
 */
export function play(el: Element | null | undefined, keyframes: Keyframe[], ms: number = CSS.base, easing: string = CSS.out, delay = 0) {
  if (!el || prefersReduced() || typeof (el as HTMLElement).animate !== 'function') return
  // `backwards`: while waiting out its delay the element already shows the first frame.
  return (el as HTMLElement).animate(keyframes, { duration: ms, easing, delay, fill: 'backwards' })
}

/** A short haptic tick where the device supports it. Silent everywhere else. */
export function haptic(pattern: number | readonly number[] = 8) {
  try { if ('vibrate' in navigator) navigator.vibrate(pattern as number | number[]) } catch { /* not allowed before a gesture */ }
}

export const HAPTIC = { press: 6, gain: [10, 30, 16], land: [24, 40, 12], stamp: 36 } as const
