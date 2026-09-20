import { cn } from '../../lib/cn'
import { ChevronRight } from '../ui/icons'
import type { User } from '../../mock/types'

type Tier = User['tier']

/** "In Top" labels per PRD 7.4 (Gold uses 20%, the value on the dashboard). */
export const TIER_LABEL: Record<Tier, { name: string; top: string }> = {
  silver: { name: 'Silver', top: 'In Top 50%' },
  gold: { name: 'Gold', top: 'In Top 20%' },
  platinum: { name: 'Platinum', top: 'In Top 5%' },
}

const TIER_TEXT: Record<Tier, string> = {
  silver: 'text-tier-silver',
  gold: 'text-tier-gold',
  platinum: 'text-tier-platinum',
}

function TierIcon({ tier }: { tier: Tier }) {
  if (tier === 'gold') {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }
  if (tier === 'platinum') {
    return (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <path d="m12 3 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The tier pill drawn inside the gauge (Welcome, Trust Score Details) and,
 * with `card`, the boxed variant on the dashboard that links to the details.
 */
export default function TierChip({
  tier, card = false, onClick, className,
}: { tier: Tier; card?: boolean; onClick?: () => void; className?: string }) {
  const { name, top } = TIER_LABEL[tier]
  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-3 text-left',
        card
          ? 'w-full rounded-lg border-1 border-yellow-700/60 bg-yellow-fade bg-bg-1 px-3 py-3'
          : 'rounded-full border-1 border-stroke-3 bg-bgAlt-2 py-1.5 pl-1.5 pr-4',
        className,
      )}
    >
      <span className={cn('flex items-center justify-center rounded-full', card ? 'h-12 w-12 bg-yellow-1000/60' : 'h-8 w-8 bg-bg-2', TIER_TEXT[tier])}>
        <TierIcon tier={tier} />
      </span>
      <span className="flex flex-col">
        <span className={cn('flex items-center gap-1', card ? 'text-title-s' : 'text-body-medium', TIER_TEXT[tier])}>
          {name}
          {card && <ChevronRight className="h-4 w-4" />}
        </span>
        <span className={cn(card ? 'text-text-regular text-text-subtitle' : 'text-label text-text-body')}>{top}</span>
      </span>
    </Tag>
  )
}
