import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import Button from '../ui/Button'
import CtaBar from '../ui/CtaBar'
import { Check } from '../ui/icons'
import SuccessBadge from './SuccessBadge'

export interface SuccessScreenProps {
  title: string
  body?: ReactNode
  /** Ticked lines under the body, the first one highlighted (Figma 919:74342). */
  steps?: string[]
  children?: ReactNode
  actionLabel?: string
  onAction: () => void
  alt?: boolean
}

/**
 * The full-screen success state shared by Applied successfully!, Scheduled,
 * PIN confirmed, Completed successfully!, Withdrawal and Redeemed: the green
 * tick in its halo, a title, body and the Done button in the CTA bar.
 */
export default function SuccessScreen({
  title, body, steps, children, actionLabel = 'Done', onAction, alt = false,
}: SuccessScreenProps) {
  return (
    <div className={cn('flex min-h-full flex-col', alt ? 'bg-bgAlt-0' : 'bg-bg-0', 'bg-green-fade')}>
      <div className="flex flex-1 flex-col items-center gap-6 px-4 pb-6 pt-12 text-center">
        <SuccessBadge tone="success" />
        <div className="flex flex-col gap-2">
          <h1 className="text-title-l text-text-title">{title}</h1>
          {body && <p className="text-body-regular text-text-body">{body}</p>}
        </div>

        {steps && (
          <ul className="flex w-full flex-col gap-3 rounded-lg bg-bg-1 p-4 text-left">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-1',
                    i === 0 ? 'border-brand-primary bg-brand-primary text-cta-primaryText' : 'border-text-disabled text-text-disabled',
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-text-regular text-text-subtitle">{step}</span>
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>

      <CtaBar alt={alt}>
        <Button fullWidth onClick={onAction}>{actionLabel}</Button>
      </CtaBar>
    </div>
  )
}
