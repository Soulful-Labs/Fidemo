import { useId, useLayoutEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { CSS, haptic, play, settleTo } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'
import { rattle } from '../motion/locks'
import { feedback } from '../../lib/feedback'

export interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  description?: string
  /** Essential cookies are on and not changeable (PRD 4.9). */
  locked?: boolean
  disabled?: boolean
  /**
   * Fired instead of onChange when the toggle is locked or disabled, so a
   * blocked control can explain itself on tap (global interaction rule 7).
   */
  onBlocked?: () => void
}

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  locked = false,
  disabled = false,
  onBlocked,
}: ToggleProps) {
  const id = useId()
  const isOff = disabled || locked
  const knob = useRef<HTMLSpanElement>(null)
  const box = useRef<HTMLButtonElement>(null)
  const at = useRef<number | null>(null)

  // The knob keeps its resting position classes; on a change it is measured
  // and slid from where it was (FLIP), so only transform animates.
  useLayoutEffect(() => {
    const el = knob.current
    if (!el) return
    const x = el.offsetLeft
    if (at.current !== null && at.current !== x) {
      if (isPlayful()) settleTo(el, { transform: `translateX(${at.current - x}px)` }) // tier 2
      else play(el, [{ transform: `translateX(${at.current - x}px)` }, { transform: 'none' }], CSS.base, CSS.out)
    }
    at.current = x
  }, [checked])

  const control = (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={isOff || undefined}
      ref={box}
      onClick={() => {
        if (!isOff) { if (isPlayful()) feedback('select'); return onChange(!checked) }
        rattle(box.current)
        if (!isPlayful()) haptic([8, 40, 8])
        onBlocked?.()
      }}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border-1 transition-colors',
        checked ? 'bg-cta-primary border-yellow-600' : 'bg-bg-2 border-stroke-3',
        isOff ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <span
        ref={knob}
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full transition-colors',
          checked ? 'left-5 bg-cta-primaryText' : 'left-0.5 bg-text-disabled',
        )}
      />
    </button>
  )

  if (!label && !description) return control

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-body-medium text-text-title">
            {label}
          </label>
        )}
        {description && <p className="text-text-regular text-text-body">{description}</p>}
      </div>
      {control}
    </div>
  )
}
