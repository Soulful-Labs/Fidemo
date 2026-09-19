import type { ReactNode } from 'react'
import Button from '../../components/ui/Button'
import TopBar from '../../components/ui/TopBar'
import { Info } from '../../components/ui/icons'

export interface OnboardingLayoutProps {
  title: string
  step: number
  heading?: string
  children: ReactNode
  onBack: () => void
  onInfo?: () => void
  onContinue: () => void
  continueDisabled?: boolean
  onBlocked?: () => void
  continueLabel?: string
}

/** Shared frame for the three profile steps: progress bar, helper, bottom CTA. */
export default function OnboardingLayout({
  title, step, heading, children, onBack, onInfo, onContinue,
  continueDisabled, onBlocked, continueLabel = 'Continue',
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={title}
        onBack={onBack}
        progress={{ current: step, total: 3 }}
        helper="Just 2 minutes, then you are browsing studies."
        right={
          onInfo && (
            <button type="button" onClick={onInfo} aria-label="What these details are for?" className="text-text-body hover:text-text-title">
              <Info />
            </button>
          )
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-4 py-6">
        {heading && <h2 className="text-title-s text-text-title">{heading}</h2>}
        {children}
      </div>

      <div className="sticky bottom-0 bg-bg-0 px-4 pb-6 pt-2">
        <Button fullWidth disabled={continueDisabled} onClick={onContinue} onBlocked={onBlocked}>
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
