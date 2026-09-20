import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../components/app/ProgressBar'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import { cn } from '../../lib/cn'
import { TIERS, nextTier, tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 5.1 Trust Score card, Figma 918:69716: the gauge on the left, the tier
 * box and "20 more to Platinum..." progress on the right. Tapping anything
 * opens Trust Score Details.
 */
export default function TrustScoreCard() {
  const navigate = useNavigate()
  const { user } = useStore()
  const tier = tierFor(user.trustScore)
  const next = nextTier(user.trustScore)
  const floor = TIERS[tier]

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate('/trust-score')}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/trust-score')}
      className="flex cursor-pointer items-center gap-3 rounded-lg bg-bg-1 bg-yellow-fade p-3"
    >
      <ScoreDial score={user.trustScore} size="sm" />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <TierChip tier={tier} card />
        {next && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-text-regular text-text-subtitle">
                {next.gain} more to {next.tier === 'gold' ? 'Gold' : 'Platinum'}...
              </span>
              <span className={cn('text-body-medium', next.tier === 'gold' ? 'text-tier-gold' : 'text-tier-platinum')}>
                {next.at}
              </span>
            </div>
            <ProgressBar value={user.trustScore - floor} max={next.at - floor} track={next.tier === 'gold' ? 'gold' : 'platinum'} />
          </div>
        )}
      </div>
    </div>
  )
}
