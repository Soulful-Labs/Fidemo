import { useCallback, useRef } from 'react'
import { cn } from '../../lib/cn'

export interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (next: [number, number]) => void
  /** Renders the caption, e.g. "$100-600" or "30-90 minutes". */
  format?: (value: [number, number]) => string
  label?: string
}

/**
 * Dual-thumb range slider built from divs rather than <input type="range">.
 * Native range thumbs can only be styled through ::-webkit-slider-thumb, which
 * cannot read Tailwind tokens, and this config does not emit theme CSS vars —
 * so a native input would mean hardcoded colours (hard rule 2).
 */
export default function RangeSlider({
  min, max, step = 1, value, onChange, format, label,
}: RangeSliderProps) {
  const track = useRef<HTMLDivElement>(null)
  const [low, high] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const valueAt = useCallback((clientX: number) => {
    const rect = track.current?.getBoundingClientRect()
    if (!rect) return min
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round((min + ratio * (max - min)) / step) * step
  }, [min, max, step])

  const drag = (which: 'low' | 'high') => (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const next = valueAt(ev.clientX)
      if (which === 'low') onChange([Math.min(next, high), high])
      else onChange([low, Math.max(next, low)])
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const key = (which: 'low' | 'high') => (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
    if (!delta) return
    e.preventDefault()
    if (which === 'low') onChange([Math.max(min, Math.min(low + delta, high)), high])
    else onChange([low, Math.min(max, Math.max(high + delta, low))])
  }

  const thumb = (which: 'low' | 'high', at: number) => (
    <button
      type="button"
      role="slider"
      aria-label={`${label ?? 'Range'} ${which === 'low' ? 'minimum' : 'maximum'}`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={at}
      onPointerDown={drag(which)}
      onKeyDown={key(which)}
      style={{ left: `${pct(at)}%` }}
      className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cta-primary"
    />
  )

  return (
    <div className="flex flex-col gap-3">
      {(label || format) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="text-body-regular text-text-subtitle">{label}</span>}
          {format && <span className="text-title-s font-semibold text-text-title">{format(value)}</span>}
        </div>
      )}

      <div className="relative h-5">
        <div ref={track} className={cn('absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-bg-2')}>
          <div
            className="absolute h-full rounded-full bg-cta-primary"
            style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
          />
        </div>
        {thumb('low', low)}
        {thumb('high', high)}
      </div>
    </div>
  )
}
