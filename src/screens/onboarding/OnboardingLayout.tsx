import type { ReactNode } from 'react'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import TopBar from '../../components/ui/TopBar'
import { Info } from '../../components/ui/icons'

export interface OnboardingLayoutProps {
  title: string
  step: number
  children: ReactNode
  onBack: () => void
  onInfo?: () => void
  onContinue: () => void
  continueDisabled?: boolean
  onBlocked?: () => void
  continueLabel?: string
}

/**
 * Shared frame for the three profile steps (Figma 915:50231): 93px title bar
 * with the progress segments and helper line, the form 16px below, and the
 * 96px CTA bar pinned to the bottom.
 */
export default function OnboardingLayout({
  title, step, children, onBack, onInfo, onContinue,
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
            <button
              type="button"
              onClick={onInfo}
              aria-label="What these details are for?"
              className="flex h-8 w-8 items-center justify-center text-text-title hover:text-text-body"
            >
              <Info className="h-6 w-6" />
            </button>
          )
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">{children}</div>

      <CtaBar>
        <Button fullWidth disabled={continueDisabled} onClick={onContinue} onBlocked={onBlocked}>
          {continueLabel}
        </Button>
      </CtaBar>
    </div>
  )
}
