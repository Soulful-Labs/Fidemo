import { useNavigate } from 'react-router-dom'
import StatTile from '../../components/app/StatTile'
import Button from '../../components/ui/Button'
import { money } from '../../lib/format'
import { useStore } from '../../mock/store'
import DashboardHeader from './DashboardHeader'
import RecommendedStudies from './RecommendedStudies'
import ReferEarnCard from './ReferEarnCard'
import SectionHeader from './SectionHeader'

/**
 * PRD 5.2, shown when the user has zero completed studies.
 *
 * Conflict 18: the drawn frame shows "Profile Score 70 /100" and "Ranking in
 * Top 50%" next to "Total Studies 0". A new account starts at 50, Silver, so
 * the score is not shown here at all; the Get Started button leads to the
 * profile instead.
 */
export default function GetStarted() {
  const navigate = useNavigate()
  const { user, referrals, toast } = useStore()

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader />

      <div className="flex flex-col gap-6 px-4 pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-title-m text-text-title">Welcome to HumanLayer</h1>
          <Button size="md" className="ml-auto" onClick={() => navigate('/onboarding/about')}>
            Get Started
          </Button>
        </div>

        <section className="flex flex-col gap-3">
          <SectionHeader title="Learn about HumanLayer" />
          <button
            type="button"
            onClick={() => toast('Video player is not part of this prototype')}
            className="flex aspect-video w-full items-center justify-center rounded-lg border-1 border-stroke-2 bg-bg-2 text-text-body"
          >
            <span className="flex items-center gap-2 text-text-medium">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5l12 7-12 7z" /></svg>
              Watch in full-screen
            </span>
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Total Studies" value="0" onClick={() => navigate('/studies/mine/history')} />
          <StatTile label="Studies In Review" value="0" onClick={() => navigate('/studies/mine/applied')} />
          <StatTile label="Earned This Month" value={money(0)} onClick={() => navigate('/wallet')} />
          <StatTile label="Available Earnings" value={money(user.walletBalance)} onClick={() => navigate('/wallet')} />
          <StatTile label="Streak" value={`0 /${user.streak.target} week`} onClick={() => navigate('/dashboard')} />
        </div>

        <RecommendedStudies title="Trending Studies" />

        <ReferEarnCard
          subtitle={referrals.length === 0 ? '0 referrals yet' : undefined}
        />
      </div>
    </div>
  )
}
