import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { CSS, STAGGER, play, springTo } from '../../lib/motion'
import { isPlayful, usePlayful } from '../../lib/playful'
import { nextSlot } from '../../lib/seen'
import { useArrival } from '../motion/useArrival'

export interface ProgressBarProps {
  value: number
  max?: number
  /** Caption above the bar, e.g. "Monthly Goal". */
  label?: string
  /** Right-aligned caption, e.g. "$342.60 of $500". */
  caption?: string
  tone?: 'yellow' | 'green'
  size?: 'sm' | 'md'
  /** Track colour behind the fill; the tier bar uses the next tier's colour. */
  track?: 'default' | 'platinum' | 'gold'
  /** Remembers where this bar was last seen, so it moves from there on the next visit. */
  memory?: string
}

const at = (pct: number) => `translateX(${pct - 100}%)`

/**
 * Used for profile completion, the monthly goal, diary days and tier progress.
 *
 * Moment D: the fill is a full-width bar slid into place by transform, so it
 * animates on the compositor. It moves from where the person last saw it
 * (never from zero), several bars arriving together stagger, a fall is
 * quieter and shorter than a gain, and reaching the end is acknowledged with
 * a pulse of the track and a glint along it.
 */
export default function ProgressBar({
  value, max = 100, label, caption, tone = 'yellow', size = 'md', track = 'default', memory,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))
  const trackEl = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const glint = useRef<HTMLSpanElement>(null)
  const mounted = useRef(false)
  const cap = useRef<HTMLSpanElement>(null)
  const flash = useRef<HTMLSpanElement>(null)
  const playful = usePlayful()

  useArrival(pct, memory, (from, to) => {
    const el = fill.current
    if (!el) return
    const delay = mounted.current ? 0 : nextSlot() * STAGGER * 2000
    mounted.current = true
    el.style.transform = at(to)
    if (from === undefined) {
      // PLAYFUL: nothing moved, so nothing animates.
      if (isPlayful()) return
      // First sight: no earlier value to move from, so it settles in place instead.
      play(el, [{ opacity: 0.35 }, { opacity: 1 }], CSS.slow, CSS.out, delay)
      play(glint.current, [{ transform: 'translateX(-100%)', opacity: 1 }, { transform: 'translateX(400%)', opacity: 1 }], CSS.slow, CSS.inOut, delay + CSS.base)
      return
    }
    if (from === to) return
    const gain = to > from
    const a = el.animate([{ transform: at(from) }, { transform: at(to) }],
      { duration: gain ? CSS.slow : CSS.base, easing: CSS.out, delay, fill: 'backwards' })
    const crossed = gain && to >= 100 && from < 100
    a.onfinish = () => {
      if (isPlayful()) {
        // PLAYFUL: the liquid's leading edge sloshes as it arrives...
        springTo(cap.current, { transform: gain ? 'scaleX(2.6)' : 'scaleX(0.4)' }, 'bouncy')
        // ...and crossing the line flashes the whole bar its own colour and bulges it.
        if (crossed) {
          play(flash.current, [{ opacity: 0.9 }, { opacity: 0 }], CSS.slow, CSS.out)
          springTo(trackEl.current, { transform: 'scaleY(2.4)' }, 'bouncy')
        }
      } else if (crossed) {
        play(trackEl.current, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.9)', offset: 0.3 }, { transform: 'scaleY(1)' }], CSS.base, CSS.out)
      }
      if (crossed) play(glint.current, [{ transform: 'translateX(-100%)', opacity: 1 }, { transform: 'translateX(400%)', opacity: 1 }], CSS.slow, CSS.inOut)
    }
    return () => a.cancel()
  })

  return (
    <div className="flex w-full flex-col gap-2">
      {(label || caption) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-text-medium text-text-subtitle">{label}</span>}
          {caption && <span className="text-label text-text-body">{caption}</span>}
        </div>
      )}
      <div
        ref={trackEl}
        className={cn(
          'relative w-full overflow-hidden rounded-full',
          size === 'sm' ? 'h-1' : 'h-2',
          track === 'platinum' ? 'bg-tier-platinum/50' : track === 'gold' ? 'bg-tier-gold/40' : 'bg-bg-2',
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
      >
        <div
          ref={fill}
          className={cn('h-full w-full rounded-full will-change-transform', tone === 'green' ? 'bg-brand-secondary' : 'bg-tier-gold', playful && 'relative overflow-hidden')}
          style={{ transform: at(pct) }}
        >
          {playful && (
            <>
              {/* A bright leading edge. (No travelling shimmer: a screen being read stays still.) */}
              <span ref={cap} data-decor aria-hidden="true" className="pf-cap pointer-events-none absolute inset-y-0 right-0 w-4 origin-right rounded-full" />
            </>
          )}
        </div>
        {playful && <span ref={flash} data-decor aria-hidden="true" className={cn('pointer-events-none absolute inset-0 opacity-0', tone === 'green' ? 'bg-brand-secondary' : 'bg-tier-gold')} />}
        <span ref={glint} data-decor aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-text-title/60 to-transparent opacity-0" />
      </div>
    </div>
  )
}
