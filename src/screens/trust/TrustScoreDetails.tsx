import { useNavigate } from 'react-router-dom'
import ProgressBar from '../../components/app/ProgressBar'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import Button from '../../components/ui/Button'
import TopBar from '../../components/ui/TopBar'
import { ChevronRight, Info } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { money } from '../../lib/format'
import { TIERS, nextTier, tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'

const RATINGS: { key: 'expertise' | 'reliability' | 'communication' | 'successRate'; label: string; hint: string }[] = [
  { key: 'expertise', label: 'Expertise', hint: 'How clients rate your subject knowledge' },
  { key: 'reliability', label: 'Reliability', hint: 'Sessions attended on time' },
  { key: 'communication', label: 'Communication', hint: 'How clearly you share your insights' },
  { key: 'successRate', label: 'Success Rate', hint: 'Studies completed out of those started' },
]

/** "Performance Ratings" rows, shared with the Human Certificate. */
export function PerformanceRatings({ alt = true }: { alt?: boolean }) {
  const { user, toast } = useStore()
  return (
    <div className={cn('flex flex-col gap-4 rounded-lg p-4', alt ? 'bg-bgAlt-2' : 'bg-bg-1')}>
      {RATINGS.map((r) => (
        <div key={r.key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => toast(r.hint)} className="flex items-center gap-1 text-text-regular text-text-title">
              {r.label}<Info className="h-4 w-4 text-text-body" />
            </button>
            <span className="text-text-medium text-brand-secondary">{user.ratings[r.key]}%</span>
          </div>
          <ProgressBar value={user.ratings[r.key]} tone="green" size="sm" />
        </div>
      ))}
    </div>
  )
}

/** PRD 7.1 Trust Score Details, Figma 1114:95266. */
export default function TrustScoreDetails() {
  const navigate = useNavigate()
  const { user } = useStore()
  const tier = tierFor(user.trustScore)
  const next = nextTier(user.trustScore)
  const floor = TIERS[tier]
  const tierName = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Trust Score Details" onBack={() => navigate('/profile')}
        right={<button type="button" aria-label="Trust Score Rules" onClick={() => navigate('/trust-score/rules')} className="text-text-title"><Info className="h-6 w-6" /></button>} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <section className="flex flex-col items-center gap-4 rounded-lg bg-bgAlt-2 bg-yellow-fade p-4">
          <button type="button" onClick={() => navigate('/trust-score/rules')} className="flex items-center gap-1 text-text-regular text-text-subtitle">
            <Info className="h-4 w-4" />Trust Score<ChevronRight className="h-4 w-4" />
          </button>
          <ScoreDial score={user.trustScore} size="md">
            <TierChip tier={tier} onClick={() => navigate('/trust-score/tiers')} />
          </ScoreDial>
          {next && (
            <div className="flex w-full flex-col gap-2 pt-6">
              <div className="flex justify-between text-text-medium">
                <span className="text-tier-gold">{tierName(tier)}</span>
                <span className={next.tier === 'gold' ? 'text-tier-gold' : 'text-tier-platinum'}>{tierName(next.tier)}</span>
              </div>
              <ProgressBar value={user.trustScore - floor} max={next.at - floor} track={next.tier === 'gold' ? 'gold' : 'platinum'} />
              <div className="flex justify-between text-text-regular text-text-body">
                <span className="text-tier-gold">{floor}</span>
                <span>Gain {next.gain} to next tier</span>
                <span className={next.tier === 'gold' ? 'text-tier-gold' : 'text-tier-platinum'}>{next.at}</span>
              </div>
            </div>
          )}
          <Button variant="tertiary" fullWidth leftIcon={<Info className="h-4 w-4" />} onClick={() => navigate('/trust-score/tiers')}>
            Learn More About Tiers
          </Button>
        </section>

        <h2 className="text-body-medium text-text-title">Performance Ratings</h2>
        <PerformanceRatings />

        <h2 className="text-body-medium text-text-title">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-bgAlt-2 p-4">
            <span className="text-text-regular text-text-body">Completed Studies</span>
            <span className="text-body-medium text-text-title">{user.completedStudies}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-bgAlt-2 p-4">
            <span className="text-text-regular text-text-body">Lifetime Earnings</span>
            <span className="text-body-medium text-text-title">{money(user.allTimeEarned)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
