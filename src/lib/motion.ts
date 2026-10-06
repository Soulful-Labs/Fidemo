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

/**
 * soft = sheets and toasts, snappy = presses and pops, heavy = things that land
 * with weight. Two more, for tier 3 only: bouncy = earned things springing
 * back past rest and settling; slam = the big two's hardest landings, a lot
 * of mass arriving fast.
 */
export const SPRING = {
  soft: { type: 'spring', stiffness: 380, damping: 36, mass: 1 },
  snappy: { type: 'spring', stiffness: 600, damping: 26, mass: 0.6 },
  heavy: { type: 'spring', stiffness: 260, damping: 14, mass: 1.4 },
  bouncy: { type: 'spring', stiffness: 520, damping: 13, mass: 0.8 },
  slam: { type: 'spring', stiffness: 900, damping: 24, mass: 2.4 },
} as const satisfies Record<string, Transition>

/**
 * A spring as a CSS easing: the step response sampled into `linear()`, with
 * the time it takes to settle. Lets CSS transitions and WAAPI spring too
 * (press release, route changes) without a JS loop per frame.
 */
export function springCurve(name: keyof typeof SPRING, points = 48): { easing: string; ms: number } {
  const { stiffness: k, damping: c, mass: m } = SPRING[name]
  const dt = 1 / 240
  let x = 0, v = 0, t = 0
  const trace: number[] = []
  while (t < 3) {
    const a = (-k * (x - 1) - c * v) / m
    v += a * dt
    x += v * dt
    t += dt
    trace.push(x)
    if (t > 0.1 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break
  }
  const step = (trace.length - 1) / (points - 1)
  const values = Array.from({ length: points }, (_, i) => +trace[Math.round(i * step)].toFixed(4))
  values[0] = 0
  values[points - 1] = 1
  return { easing: `linear(${values.join(', ')})`, ms: Math.round(t * 1000) }
}

/** CSS custom properties for the springs, so stylesheets can use them: --spring-bouncy, --spring-bouncy-ms and so on. */
export function installSpringVars() {
  if (typeof document === 'undefined') return
  for (const name of ['bouncy', 'snappy', 'soft', 'slam'] as const) {
    const { easing, ms } = springCurve(name)
    document.documentElement.style.setProperty(`--spring-${name}`, easing)
    document.documentElement.style.setProperty(`--spring-${name}-ms`, `${ms}ms`)
  }
}

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

/** Tier 1: a plain modal opens and closes calmly. A small fade and scale, no overshoot. */
export const dialogPlayful: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 6 },
  shown: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: EASE.out } },
  gone: { opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: EASE.in } },
}

/** Tier 3: a modal that confirms something finished drops in with weight and settles. */
export const dialogEarned: Variants = {
  hidden: { opacity: 0, scale: 1.18, rotateX: 22, y: -24 },
  shown: { opacity: 1, scale: 1, rotateX: 0, y: 0, transition: { ...SPRING.bouncy, opacity: { duration: DUR.fast } } },
  gone: { opacity: 0, scale: 0.98, rotateX: 0, y: 0, transition: { duration: 0.12, ease: EASE.in } },
}

/** Tier 1: a sheet rises and sinks without passing its line. */
export const sheetPlayful: Variants = {
  hidden: { y: '100%' },
  shown: { y: 0, transition: { duration: 0.18, ease: EASE.out } },
  gone: { y: '100%', transition: { duration: 0.16, ease: EASE.in } },
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
/**
 * Motion is earned (docs/Motion.md, "Tiers"). Every animation
 * belongs to exactly one tier:
 *  1 AROUND  getting around: fast and calm, ease out, a small fade and slide,
 *            never an overshoot.
 *  2 CHANGED something changed: one small settle that may pass rest once, and ends.
 *  3 EARNED  something was earned: springs, overshoot, confetti, flips, fanfare.
 *            Only tier 3 uses the bouncy and slam springs.
 */
export const TIER = {
  around: { ms: 160, easing: CSS.out, slide: 8 },
  changed: { ms: 240, easing: 'cubic-bezier(0.3, 1.32, 0.6, 1)' },
} as const

/** Framer transitions for tiers 1 and 2. */
export const AROUND = { duration: TIER.around.ms / 1000, ease: EASE.out } as const
export const CHANGED = { duration: TIER.changed.ms / 1000, ease: [0.3, 1.32, 0.6, 1] } as const

/** Tier 1: from `from` back to rest, calm and quick, no overshoot. */
export function around(el: Element | null | undefined, from: Keyframe, to: Keyframe = { transform: 'none' }) {
  return play(el, [from, to], TIER.around.ms, TIER.around.easing)
}

/** Tier 2: one small settle from `from` to rest (at most one pass beyond it). */
export function settleTo(el: Element | null | undefined, from: Keyframe, to: Keyframe = { transform: 'none' }) {
  return play(el, [from, to], TIER.changed.ms, TIER.changed.easing)
}

/**
 * Tier 3 moments that happen together (a paid study: the points chip and the
 * wallet tumbling, then confetti) take turns instead of landing at once. Each
 * asks for a slot of `ms` and gets back how long to wait before starting; slots
 * are served in the order they were asked for, with a short breath between.
 */
let earnedFreeAt = 0
export function earnedSlot(ms: number): number {
  const now = performance.now()
  const wait = Math.max(0, earnedFreeAt - now)
  earnedFreeAt = now + wait + ms + 120
  return wait
}

const curves = new Map<string, { easing: string; ms: number }>()
/** springCurve, cached: the same five springs are asked for again and again. */
export function springEase(name: keyof typeof SPRING) {
  let c = curves.get(name)
  if (!c) { c = springCurve(name); curves.set(name, c) }
  return c
}

/**
 * Moves an element from `from` to `to` (default: its resting state) on a
 * spring, with real overshoot, through WAAPI and a linear() easing, so it runs
 * on the compositor. Skipped under reduced motion.
 */
export function springTo(el: Element | null | undefined, from: Keyframe, name: keyof typeof SPRING = 'bouncy', delay = 0, to: Keyframe = { transform: 'none' }) {
  const { easing, ms } = springEase(name)
  return play(el, [from, to], ms, easing, delay)
}

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
