import { useRef } from 'react'
import { cn } from '../../lib/cn'

export interface OtpInputProps {
  value: string
  onChange: (next: string) => void
  length?: number
  error?: boolean
}

/** Six single character boxes (PRD 4.4). Typing advances, backspace retreats. */
export default function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, '').slice(-1)
    const next = (value.padEnd(length, ' ').slice(0, index) + (clean || ' ') +
      value.padEnd(length, ' ').slice(index + 1)).trimEnd()
    onChange(next.replace(/\s/g, ''))
    if (clean && index < length - 1) refs.current[index + 1]?.focus()
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          value={value[i] ?? ''}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            'h-12 w-12 rounded-md border-1 bg-bg-1 text-center text-title-s text-text-title outline-none',
            error ? 'border-state-danger' : 'border-stroke-3 focus:border-cta-primary',
          )}
        />
      ))}
    </div>
  )
}
