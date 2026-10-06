import { animate } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { cn } from '../../lib/cn'
import { CSS, EASE, HAPTIC, earnedSlot, haptic, play, prefersReduced, rollDuration, springTo } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'
import { feedback } from '../../lib/feedback'
import { spinDigits } from './odometer'
import FloatDelta from './FloatDelta'
import { whenClear } from '../../lib/overlays'
import { lastSeen, markSeen } from '../../lib/seen'
import { useSeenKey } from './useSeen'

export interface RollingNumberProps {
  value: number
  /** The app's own formatter (points, money). Every frame, and the last one, goes through it. */
  format: (n: number) => string
  /** Remembers the last value seen under this name, so a remount animates from there. */
  memory?: string
  /** Smallest step shown while rolling: 1 for points and scores, 0.01 for money. */
  step?: number
  /**
   * Shows a +X on a gain (and a quiet -X settling on a fall). `true` rises off
   * the figure; `'into'` rises from below and is absorbed into it, for figures
   * at the very top of a screen where there is no room above.
   */
  float?: boolean | 'into'
  /** Formats the floating delta; defaults to the figure's own formatter. */
  formatDelta?: (n: number) => string
  /** Something to give one pulse when a gain lands, e.g. the points badge. */
  pulse?: RefObject<Element | null>
  /** Where to roll from on first mount when nothing has been seen yet (the /motion demos). */
  from?: number
  /** Seconds to hold the old value before rolling, so the roll starts once its screen has arrived. */
  delay?: number
  className?: string
}

/**
 * Moment A and moment E. A gain rolls up from the old value to the new one,
 * at a speed that scales with the size of the gain, then the badge pulses.
 * A fall does not count down: the new figure drops into place, shorter and
 * quieter, with no colour beyond the figure's own. The final text is always
 * exactly `format(value)`; animation never invents or rounds the result.
 */
export default function RollingNumber({
  value, format, memory, step = 1, float = false, formatDelta, pulse, from, delay = 0, className,
}: RollingNumberProps) {
  const el = useRef<HTMLSpanElement>(null)
  const shown = useRef<number | undefined>(undefined)
  const fmt = useRef(format)
  fmt.current = format
  const key = useSeenKey(memory)
  const [delta, setDelta] = useState<{ n: number; id: number } | null>(null)

  useLayoutEffect(() => {
    const node = el.current
    if (!node) return
    const prev = shown.current ?? (key ? lastSeen(key) : undefined) ?? from
    let displayed = prev ?? value
    const write = (n: number) => { displayed = n; node.textContent = fmt.current(n) }
    const done = () => { write(value); shown.current = value; if (key) markSeen(key, value) }

    if (prev === undefined || prev === value || prefersReduced()) { done(); return }

    const gain = value - prev
    const round = (n: number) => Math.round(n / step) * step
    let controls: ReturnType<typeof animate> | undefined
    let stopSpin = () => undefined as void
    write(prev)

    const run = () => {
      if (float) setDelta({ n: gain, id: Date.now() })
      if (gain < 0) {
        // Moment E: the figure falls into place. One short drop, no counting down.
        done()
        play(node, [{ transform: 'translateY(-0.35em)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], CSS.base, CSS.out, delay * 1000)
        if (isPlayful()) feedback('deduct')
        return
      }
      if (isPlayful()) {
        // PLAYFUL: the digits tumble like a counter, then the figure lands with a spring.
        // Several figures gaining at once (a paid study) tumble one after another, not together.
        const spin = rollDuration(gain / step) * 1300
        const turn = earnedSlot(spin + 350)
        const wait = window.setTimeout(() => {
          const cancelSpin = spinDigits(node, fmt.current(prev), fmt.current(value), spin, () => {
            done()
            feedback('gain')
            // The figure lands with a pop; the badge around it no longer pulses as well.
            springTo(node, { transform: 'scale(1.4)' })
          })
          stopSpin = () => { cancelSpin(); write(displayed) }
        }, delay * 1000 + turn)
        stopSpin = () => window.clearTimeout(wait)
        return
      }
      controls = animate(prev, value, {
        duration: rollDuration(gain / step),
        delay,
        ease: EASE.out,
        onUpdate: (n) => write(round(n)),
        onComplete: () => {
          done()
          haptic(HAPTIC.gain)
          play(pulse?.current, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)', offset: 0.35 }, { transform: 'scale(1)' }], CSS.slow, CSS.out)
        },
      })
    }
    // A live figure waits for any overlay to close, so the change is seen. The
    // short beat first lets a celebration the same change triggers open.
    let cancel = () => undefined as void
    if (key) {
      const beat = window.setTimeout(() => { cancel = whenClear(run) }, CSS.fast)
      cancel = () => window.clearTimeout(beat)
    } else run()
    // Interrupted (a newer value, or StrictMode's rehearsal): carry on from what is on screen.
    return () => { cancel(); controls?.stop(); stopSpin(); shown.current = displayed }
  }, [value, key, step, float, pulse, from, delay])

  return (
    <span className={cn('relative', className)}>
      <span ref={el} className="inline-block" />
      {delta && <FloatDelta key={delta.id} n={delta.n} into={float === 'into'} delay={delay} onDone={() => setDelta(null)} text={(formatDelta ?? format)(Math.abs(delta.n))} />}
    </span>
  )
}
