import { useLayoutEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { CSS, TIER, play } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'

/**
 * One segment of a stepped progress bar. Done segments are a fill laid over
 * the track; when a segment becomes done it sweeps in from the left (scaleX,
 * compositor only) with a glint as it completes. `delay` staggers several.
 * The resting picture is exactly the old flat colour.
 */
export default function FillSegment({ on, animate, delay = 0, track, fill, className }: {
  on: boolean
  /** Sweep in now, rather than simply being shown done. */
  animate: boolean
  delay?: number
  track: string
  fill: string
  className?: string
}) {
  const el = useRef<HTMLSpanElement>(null)
  const glint = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (!on || !animate) return
    if (isPlayful()) play(el.current, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], TIER.changed.ms, CSS.out, delay) // tier 2
    else play(el.current, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], CSS.slow, CSS.out, delay)
    play(glint.current, [{ transform: 'translateX(-100%)', opacity: 1 }, { transform: 'translateX(300%)', opacity: 1 }], CSS.base, CSS.inOut, delay + CSS.slow * 0.8)
  }, [on, animate, delay])
  return (
    <span className={cn('relative overflow-hidden rounded-full', track, className)}>
      <span ref={el} className={cn('absolute inset-0 origin-left rounded-full will-change-transform', fill, !on && 'opacity-0')} />
      <span ref={glint} data-decor aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-text-title/70 to-transparent opacity-0" />
    </span>
  )
}
