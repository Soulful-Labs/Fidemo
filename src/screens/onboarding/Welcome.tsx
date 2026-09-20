import { useNavigate } from 'react-router-dom'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import Button from '../../components/ui/Button'
import { ChevronRight, ShieldCheck } from '../../components/ui/icons'
import { TRUST } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 4.10, Figma 915:50345. A new account starts at 50, Silver, which is
 * also what conflict 18 says the Get Started dashboard should show.
 */
export default function Welcome() {
  const navigate = useNavigate()
  const { signIn } = useStore()

  const go = (to: string) => {
    signIn()
    navigate(to)
  }

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0 bg-green-fade">
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-12 w-12 text-state-success" />
          <p className="text-body-regular text-brand-secondary">You are verified!</p>
          <h1 className="text-title-l text-text-title">Welcome to HumanLayer!</h1>
        </div>

        <div className="flex flex-col items-center gap-5 rounded-xl bg-bg-1 bg-yellow-fade px-4 pb-6 pt-5">
          <p className="text-title-s text-text-title">Your Trust Score</p>
          <ScoreDial score={TRUST.ONBOARDING} size="lg">
            <TierChip tier="silver" />
          </ScoreDial>
          {/*
            Conflict 7: the drawn line credits profile completion, streaks and
            referrals to the Trust Score. They earn reward points; only study
            completion and ratings move the score (PRD 7.3). Corrected here.
          */}
          <p className="text-center text-text-regular text-text-subtitle">
            Your Trust Score climbs as you complete studies and earn good ratings. Completing your
            profile, keeping streaks and referring others earn you reward points.
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 bg-bgAlt-0 px-4 pb-6 pt-4">
        <Button variant="secondary" fullWidth onClick={() => go('/profile/edit')}>Complete Profile</Button>
        <Button fullWidth rightIcon={<ChevronRight className="h-5 w-5" />} onClick={() => go('/studies')}>
          Explore Studies
        </Button>
      </div>
    </div>
  )
}
