import { useOverlay } from '../components/ui/Modal'
import TierPlayful from './playful/TierPlayful'
import type { Tier } from './tierParts'

const BELOW: Record<Tier, Tier> = { silver: 'silver', gold: 'silver', platinum: 'gold' }

export interface TierUpgradeProps {
  tier: Tier | null
  score: number
  /** The tier being left, whose coin falls and flips to the new one. Defaults to the one below. */
  from?: Tier
  /** The score before the change, so it rolls up to `score`. Defaults to no roll. */
  fromScore?: number
  onClose: () => void
}

/**
 * The tier upgrade (moment B, docs/Motion.md). Opened by CelebrationModals when
 * the derived tier rises. Same words in the same places as Figma's tier screen
 * (1433:50005 Gold, 1433:49079 Platinum); see playful/TierPlayful for how it plays.
 */
export default function TierUpgrade(props: TierUpgradeProps) {
  useOverlay(props.tier !== null, props.onClose)
  // Mounted fresh on every open, so each upgrade plays from the top.
  if (!props.tier) return null
  return <TierPlayful tier={props.tier} old={props.from ?? BELOW[props.tier]} score={props.score}
    fromScore={props.fromScore ?? props.score} onClose={props.onClose} />
}
