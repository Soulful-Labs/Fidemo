import { useState } from 'react'
import TierUpgrade from '../../app/TierUpgrade'
import type { Tier } from '../../app/tierParts'
import { RATING_DELTA, TIERS, TRUST } from '../../lib/rules'
import { Group, Play, Plays } from './LabBits'

/** One completed study with a 5 star rating: what usually carries someone over a line. */
const STEP = TRUST.STUDY_COMPLETION + RATING_DELTA[5]

/** B: the tier upgrade. Tap anywhere while it plays to skip to the end. */
export function TierSection() {
  const [show, setShow] = useState<{ tier: Tier; from: Tier; fromScore: number; score: number } | null>(null)
  const open = (tier: Tier, from: Tier) => {
    const score = TIERS[tier] + 1
    setShow({ tier, from, score, fromScore: score - STEP })
  }
  return (
    <Group letter="B" title="Tier upgrade">
      <p className="text-text-regular text-text-body">The score crosses a tier line after a 5 star study. Tap while it plays to skip.</p>
      <Plays>
        <Play onClick={() => open('gold', 'silver')}>Silver to Gold</Play>
        <Play onClick={() => open('platinum', 'gold')}>Gold to Platinum</Play>
      </Plays>
      <TierUpgrade tier={show?.tier ?? null} from={show?.from} fromScore={show?.fromScore} score={show?.score ?? 0} onClose={() => setShow(null)} />
    </Group>
  )
}
