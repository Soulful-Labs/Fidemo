import { useLayoutEffect, useRef } from 'react'
import { feedback } from '../../lib/feedback'
import { CSS, play, prefersReduced } from '../../lib/motion'

const COINS = [
  { x: -6, at: 0, spin: 200 },
  { x: 10, at: 1, spin: -260 },
  { x: -12, at: 2, spin: 320 },
  { x: 4, at: 3, spin: -180 },
  { x: 0, at: 4, spin: 240 },
]

/**
 * Moment H: money arriving. Coins drop one after another into the thing
 * they are paid into (the parent, which must be `relative`), each landing
 * with a small knock to `target` and a haptic tick. Decorative: under reduced
 * motion nothing is drawn and the screen simply shows its result.
 */
export default function CoinRain({ target, delay = 0 }: { target: React.RefObject<Element | null>; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (prefersReduced()) return
    const gap = CSS.fast * 0.9
    const timers: number[] = []
    const runs = [...(ref.current?.children ?? [])].map((el, i) => {
      const c = COINS[i]
      const start = delay * 1000 + c.at * gap
      timers.push(window.setTimeout(() => {
        feedback('press')
        play(target.current, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)', offset: 0.3 }, { transform: 'scale(1)' }], CSS.base, CSS.out)
      }, start + CSS.base * 0.8))
      return (el as HTMLElement).animate([
        { transform: `translate(${c.x * 3}px, -120px) rotate(0deg) scale(0.9)`, opacity: 0 },
        { transform: `translate(${c.x * 2}px, -96px) rotate(${c.spin * 0.3}deg) scale(0.9)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${c.x}px, 0) rotate(${c.spin}deg) scale(0.75)`, opacity: 1, offset: 0.8 },
        { transform: `translate(${c.x}px, 6px) rotate(${c.spin}deg) scale(0.3)`, opacity: 0 },
      ], { duration: CSS.base, easing: CSS.in, delay: start, fill: 'both' })
    })
    return () => { runs.forEach((a) => a.cancel()); timers.forEach((t) => window.clearTimeout(t)) }
  }, [target, delay])

  return (
    <span ref={ref} data-decor aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {COINS.map((_, i) => (
        <span key={i} className="absolute flex h-9 w-9 items-center justify-center rounded-full border-2 border-yellow-700 bg-brand-primary opacity-0 shadow-glow shadow-yellow-700 will-change-transform">
          <span className="h-5 w-5 rounded-full border-2 border-yellow-600" />
        </span>
      ))}
    </span>
  )
}
