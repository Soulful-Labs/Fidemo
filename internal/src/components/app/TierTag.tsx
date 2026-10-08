import { CrownIcon, DiamondIcon, StarIcon, VerifiedIcon } from '../ui/icons'
import { cn } from '../../lib/cn'

export type Tier = 'Platinum' | 'Gold' | 'Silver'

const LOOK = {
  Platinum: { box: 'bg-tier-platinumBg text-tier-platinum', Icon: DiamondIcon },
  Gold: { box: 'bg-tier-goldBg text-tier-gold', Icon: CrownIcon },
  Silver: { box: 'bg-tier-silverBg text-tier-silver', Icon: StarIcon },
}

/**
 * "Profile Tiers - Clients" (Matched 1952:76970, Recruited 1952:77242): a
 * Radius/Full pill in the tier's own colour on its tint, a 16px glyph in a
 * 24px disc 4 before the name. 28 tall on cards and rows, 32 on the profile panel.
 */
export default function TierTag({ tier, size = 28 }: { tier: Tier; size?: 28 | 32 }) {
  const { box, Icon } = LOOK[tier]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full pr-2.5 text-text-regular', size === 32 ? 'h-8 pl-1' : 'h-7 pl-0.5', box)}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full border-1 border-current/20 bg-bg-0/60"><Icon className="h-4 w-4" /></span>{tier}
    </span>
  )
}

/** The "Profession-Verified" tag beside a tier: 28 tall on bgAlt-2, a green tick, subtitle text. */
export const ProfessionVerified = () => (
  <span className="inline-flex h-7 items-center gap-1 rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-subtitle">
    <VerifiedIcon className="h-4 w-4 text-state-success" />Profession-Verified
  </span>
)
