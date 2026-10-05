import { motion } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { SPRING, STAGGER } from '../../lib/motion'
import { lastSeen, markSeen } from '../../lib/seen'
import FillSegment from '../motion/FillSegment'
import { useSeenKey } from '../motion/useSeen'
import { Check } from './icons'

export interface StepperProps {
  /** How many steps are done. For the onboarding bar this is the current step. */
  current: number
  total: number
  /** `bar` = onboarding progress (1 of 3). `pills` = numbered streak steps. */
  variant?: 'bar' | 'pills'
  tone?: 'yellow' | 'green'
  className?: string
  /** Remembers the step last seen, so only the steps completed since then animate in (moment I). */
  memory?: string
}

export default function Stepper({
  current,
  total,
  variant = 'bar',
  tone = 'yellow',
  className,
  memory,
}: StepperProps) {
  const fill = tone === 'green' ? 'bg-brand-secondary' : 'bg-cta-primary'
  const steps = Array.from({ length: total }, (_, i) => i + 1)
  const key = useSeenKey(memory)
  // Read once per mount: the step this person had reached when they last saw this stepper.
  const before = useRef<number | undefined>(undefined)
  if (before.current === undefined) before.current = key ? lastSeen(key) ?? current : current
  if (key) queueMicrotask(() => markSeen(key, current))
  const fresh = (step: number) => step > (before.current ?? current) && step <= current
  const order = (step: number) => step - (before.current ?? current) - 1

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
          <FillSegment key={step} className="h-1 flex-1" on={step <= current} animate={fresh(step)} delay={order(step) * STAGGER * 4000}
            track={tone === 'green' ? 'bg-green-900/60' : 'bg-yellow-1000'} fill={fill} />
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
              'flex h-8 flex-1 items-center justify-center rounded-full text-body-medium',
              done ? cn(fill, 'text-cta-primaryText') : 'bg-bg-0 text-text-title',
            )}
          >
            {done ? (
              <motion.span className="flex" initial={fresh(step) ? { scale: 0.3, rotate: -30, opacity: 0 } : false}
                animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...SPRING.snappy, delay: order(step) * STAGGER * 4 + 0.2 }}>
                <Check className="h-4 w-4" />
              </motion.span>
            ) : step}
          </span>
        )
      })}
    </div>
  )
}
