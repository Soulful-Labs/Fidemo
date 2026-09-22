import { useState } from 'react'
import DashboardHeader from './DashboardHeader'
import GetStarted from './GetStarted'
import MonthlyStreakCard from './MonthlyStreakCard'
import OverviewTiles from './OverviewTiles'
import RecommendedStudies from './RecommendedStudies'
import ReferEarnCard from './ReferEarnCard'
import StreakDetailModal from './StreakDetailModal'
import TrustScoreCard from './TrustScoreCard'
import UpdatesSection from './UpdatesSection'
import { greeting } from '../../lib/format'
import { useStore } from '../../mock/store'

/** PRD 5.1, with the Get Started variant at zero completed studies (PRD 5.2). */
export default function Dashboard() {
  const { user } = useStore()
  const [streak, setStreak] = useState(false)

  if (user.completedStudies === 0) return <GetStarted />

  const firstName = user.name.trim().split(' ')[0]

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader />

      <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
        <h1 className="text-title-m text-text-title">
          {firstName ? <>{greeting()}, <span className="text-brand-secondary">{firstName}!</span></> : `${greeting()}!`}
        </h1>

        <TrustScoreCard />
        <OverviewTiles />
        <UpdatesSection />
        <MonthlyStreakCard onOpen={() => setStreak(true)} />
        <RecommendedStudies />
        <ReferEarnCard />
      </div>

      <StreakDetailModal open={streak} onClose={() => setStreak(false)} />
    </div>
  )
}
