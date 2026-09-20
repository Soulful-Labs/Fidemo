import { cn } from '../../lib/cn'
import { Check } from './icons'

export interface StepperProps {
  /** How many steps are done. For the onboarding bar this is the current step. */
  current: number
  total: number
  /** `bar` = onboarding progress (1 of 3). `pills` = numbered streak steps. */
  variant?: 'bar' | 'pills'
  tone?: 'yellow' | 'green'
  className?: string
}

export default function Stepper({
  current,
  total,
  variant = 'bar',
  tone = 'yellow',
  className,
}: StepperProps) {
  const fill = tone === 'green' ? 'bg-brand-secondary' : 'bg-cta-primary'
  const steps = Array.from({ length: total }, (_, i) => i + 1)

  if (variant === 'bar') {
    return (
      <div
        className={cn('flex w-full items-center gap-2', className)}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {steps.map((step) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              step <= current ? fill : tone === 'green' ? 'bg-green-900/60' : 'bg-yellow-1000',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step) => {
        const done = step <= current
        return (
          <span
            key={step}
            className={cn(
              'flex h-6 flex-1 items-center justify-center gap-1 rounded-full border-1 text-label',
              done
                ? cn(fill, tone === 'green' ? 'border-green-600' : 'border-yellow-600', 'text-cta-primaryText')
                : 'border-stroke-3 bg-bg-2 text-text-disabled',
            )}
          >
            {done ? <Check className="h-3 w-3" /> : step}
          </span>
        )
      })}
    </div>
  )
}
