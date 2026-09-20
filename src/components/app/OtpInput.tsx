import { useRef } from 'react'
import { cn } from '../../lib/cn'

export interface OtpInputProps {
  value: string
  onChange: (next: string) => void
  length?: number
  error?: boolean
}

/**
 * Six digits in one bordered field with "X" placeholders, as drawn in Figma
 * (915:50175). Typing advances, backspace retreats.
 */
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
    <div
      className={cn(
        'flex h-input items-center justify-between rounded-md border-1 px-4',
        error ? 'border-state-danger' : 'border-stroke-3 focus-within:border-cta-primary',
      )}
    >
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
          placeholder="X"
          aria-label={`Digit ${i + 1}`}
          className="h-full w-6 bg-transparent text-center text-body-medium text-text-title outline-none placeholder:text-text-body"
        />
      ))}
    </div>
  )
}
