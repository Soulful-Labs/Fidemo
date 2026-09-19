import { Link } from 'react-router-dom'
import ProgressBar from '../../components/app/ProgressBar'
import ScoreDial from '../../components/app/ScoreDial'
import Tag from '../../components/ui/Tag'
import { TIERS, nextTier, tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'

const TIER_LABEL: Record<string, string> = {
  silver: 'Silver, In Top 50%',
  // Conflict 9: Trust Score Details says Top 20%, How Tiers Works says 25%.
  gold: 'Gold, In Top 20%',
  platinum: 'Platinum, In Top 5%',
}

/** PRD 5.1 Trust Score card. Tapping opens Trust Score Details. */
export default function TrustScoreCard() {
  const { user } = useStore()
  const tier = tierFor(user.trustScore)
  const next = nextTier(user.trustScore)
  const floor = tier === 'silver' ? TIERS.silver : TIERS[tier]

  return (
    <Link
      to="/trust-score"
      className="flex flex-col gap-4 rounded-lg border-1 border-stroke-2 bg-bg-1 p-4"
    >
      <div className="flex items-center gap-4">
        <ScoreDial score={user.trustScore} tier={tier} size="sm" />
        <div className="flex flex-col gap-1">
          <span className="text-text-medium text-text-body">Your Trust Score</span>
          <Tag tone={tier} size="md">{TIER_LABEL[tier]}</Tag>
        </div>
      </div>

      {next && (
        <div className="flex flex-col gap-1">
          <ProgressBar
            value={user.trustScore - floor}
            max={next.at - floor}
            size="sm"
            caption={`${next.gain} more to ${next.tier === 'gold' ? 'Gold' : 'Platinum'}...`}
          />
          <div className="flex justify-between text-label text-text-disabled">
            <span>{floor}</span>
            <span>{next.at}</span>
          </div>
        </div>
      )}
    </Link>
  )
}
