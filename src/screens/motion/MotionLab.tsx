import { useAppNav } from '../../app/useAppNav'
import TopBar from '../../components/ui/TopBar'
import { prefersReduced } from '../../lib/motion'
import { PointsSection } from './PointsSection'
import { TierSection } from './TierSection'
import { CertificateSection } from './CertificateSection'
import { ProgressSection } from './ProgressSection'
import { DeductionSection } from './DeductionSection'
import { CompletionSection } from './CompletionSection'
import { ScreeningSection } from './ScreeningSection'
import { PayoutSection } from './PayoutSection'
import { StepsSection } from './StepsSection'
import { SmallStuffSection } from './SmallStuffSection'

/**
 * /motion: every animation from the motion turn, playable on demand, grouped
 * A to J in the order of docs/Motion.md. Demos run on local copies of the
 * figures, so nothing here changes the account.
 */
export default function MotionLab() {
  const { back } = useAppNav()
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Motion" onBack={back} />
      <div className="flex flex-col gap-6 px-4 pb-6 pt-4">
        <p className="text-text-regular text-text-body">
          Reduced motion is {prefersReduced() ? 'on: everything below jumps straight to its final state.' : 'off.'}
        </p>
        <PointsSection />
        <TierSection />
        <CertificateSection />
        <ProgressSection />
        <DeductionSection />
        <CompletionSection />
        <ScreeningSection />
        <PayoutSection />
        <StepsSection />
        <SmallStuffSection />
      </div>
    </div>
  )
}
