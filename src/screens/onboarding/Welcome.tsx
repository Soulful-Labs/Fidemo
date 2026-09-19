import { useNavigate } from 'react-router-dom'
import ScoreDial from '../../components/app/ScoreDial'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import { Check } from '../../components/ui/icons'
import { TRUST } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 4.10. A new account starts at 50, Silver, which is also what conflict 18
 * says the Get Started dashboard should show rather than 70.
 */
export default function Welcome() {
  const navigate = useNavigate()
  const { signIn } = useStore()

  const go = (to: string) => {
    signIn()
    navigate(to)
  }

  return (
    <div className="flex min-h-full flex-col gap-6 px-4 py-6">
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900 text-brand-secondary">
          <Check />
        </span>
        <p className="text-body-medium text-brand-secondary">You are verified!</p>
        <h1 className="text-title-l text-text-title">Welcome to HumanLayer!</h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 p-5">
        <p className="text-body-medium text-text-subtitle">Your Trust Score</p>
        <ScoreDial score={TRUST.ONBOARDING} tier="silver" />
        <Tag tone="silver" size="md">Silver, In Top 50%</Tag>
      </div>

      {/*
        Conflict 7: the drawn line credits profile completion, streaks and
        referrals to the Trust Score. They earn reward points; only study
        completion and ratings move the score (PRD 7.3). Corrected here.
      */}
      <p className="text-center text-text-regular text-text-body">
        Your Trust Score climbs as you complete studies and earn good ratings. Completing your
        profile, keeping streaks and referring others earn you reward points.
      </p>

      <div className="mt-auto flex flex-col gap-3 pb-2">
        <Button fullWidth onClick={() => go('/profile/edit')}>Complete Profile</Button>
        <Button variant="tertiary" fullWidth onClick={() => go('/studies')}>Explore Studies</Button>
      </div>
    </div>
  )
}
