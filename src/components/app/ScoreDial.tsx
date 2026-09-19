import { cn } from '../../lib/cn'

export interface ScoreDialProps {
  /** Trust Score, always 50 to 100 (PRD 7.3). */
  score: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  tier?: 'silver' | 'gold' | 'platinum'
  /** Small circular variant used for the study match score badge. */
  compact?: boolean
}

const TIER_STROKE = {
  silver: 'text-tier-silver',
  gold: 'text-tier-gold',
  platinum: 'text-tier-platinum',
} as const

const DIMENSIONS = { sm: 64, md: 96, lg: 128 } as const

/** Trust Score dial, e.g. "72 /100". Also renders the match score badge. */
export default function ScoreDial({
  score,
  max = 100,
  size = 'md',
  tier,
  compact = false,
}: ScoreDialProps) {
  const px = compact ? 40 : DIMENSIONS[size]
  const radius = compact ? 16 : 40
  const stroke = compact ? 3 : 8
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(1, Math.max(0, score / (max || 1)))
  const box = compact ? 40 : 96
  const centre = box / 2

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: px, height: px }}
      role="img"
      aria-label={`Score ${score} out of ${max}`}
    >
      <svg viewBox={`0 0 ${box} ${box}`} className="h-full w-full -rotate-90">
        <circle
          cx={centre} cy={centre} r={radius} fill="none" strokeWidth={stroke}
          className="text-bg-2" stroke="currentColor"
        />
        <circle
          cx={centre} cy={centre} r={radius} fill="none" strokeWidth={stroke}
          strokeLinecap="round" stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className={cn('transition-all', tier ? TIER_STROKE[tier] : 'text-brand-primary')}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-text-title', compact ? 'text-label' : 'text-title-m')}>{score}</span>
        {!compact && <span className="text-label text-text-body">/{max}</span>}
      </div>
    </div>
  )
}
