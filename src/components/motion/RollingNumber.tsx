import { animate } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { cn } from '../../lib/cn'
import { CSS, DUR, EASE, HAPTIC, haptic, play, prefersReduced, rollDuration } from '../../lib/motion'
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
    write(prev)

    const run = () => {
      if (float) setDelta({ n: gain, id: Date.now() })
      if (gain < 0) {
        // Moment E: the figure falls into place. One short drop, no counting down.
        done()
        play(node, [{ transform: 'translateY(-0.35em)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], CSS.base, CSS.out, delay * 1000)
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
    return () => { cancel(); controls?.stop(); shown.current = displayed }
  }, [value, key, step, float, pulse, from, delay])

  return (
    <span className={cn('relative', className)}>
      <span ref={el} className="inline-block" />
      {delta && <FloatDelta key={delta.id} n={delta.n} into={float === 'into'} delay={delay} onDone={() => setDelta(null)} text={(formatDelta ?? format)(Math.abs(delta.n))} />}
    </span>
  )
}

/** The +X that rises and fades from the figure, or the quieter -X that settles under it. */
function FloatDelta({ n, text, delay, into, onDone }: { n: number; text: string; delay: number; into: boolean; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(onDone)
  done.current = onDone
  const up = n > 0
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const a = node.animate(
      up && into
        ? [{ transform: 'translate(-50%, 18px) scale(0.9)', opacity: 0 }, { transform: 'translate(-50%, 8px) scale(1.05)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%, -6px) scale(0.6)', opacity: 0 }]
        : up
        ? [{ transform: 'translate(-50%, 4px) scale(0.8)', opacity: 0 }, { transform: 'translate(-50%, -14px) scale(1.05)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%, -34px) scale(1)', opacity: 0 }]
        : [{ transform: 'translate(-50%, -4px)', opacity: 0 }, { transform: 'translate(-50%, 6px)', opacity: 0.7, offset: 0.3 }, { transform: 'translate(-50%, 14px)', opacity: 0 }],
      { duration: (up ? DUR.slow * 2 : DUR.slow) * 1000, easing: CSS.out, fill: 'both', delay: delay * 1000 },
    )
    a.onfinish = () => done.current()
    return () => a.cancel()
  }, [up, into, delay])
  return (
    <span ref={ref} data-decor aria-hidden="true"
      className={cn('pointer-events-none absolute left-1/2 whitespace-nowrap text-body-large opacity-0',
        up && !into ? 'bottom-full text-brand-secondary' : up ? 'top-full text-brand-secondary' : 'top-full text-text-body')}>
      {up ? '+' : '-'}{text}
    </span>
  )
}
