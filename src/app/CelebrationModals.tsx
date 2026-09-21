import { useEffect, useRef, useState } from 'react'
import { useStore } from '../mock/store'
import type { PointsEntry, User } from '../mock/types'
import PointsEarned from './PointsEarned'
import TierUpgrade from './TierUpgrade'

type Tier = User['tier']
const RANK: Record<Tier, number> = { silver: 0, gold: 1, platinum: 2 }

/**
 * The two drawn celebrations, fired from derived state: the tier upgrade
 * screen (Figma 1433:50005 Gold, 1433:49079 Platinum) when the Trust Score
 * crosses a tier line, and points earned (1433:50642) when a new points entry
 * lands. Both watch the store, so nothing has to remember to open them.
 */
export default function CelebrationModals() {
  const { user, pointsHistory } = useStore()
  const [tierUp, setTierUp] = useState<Tier | null>(null)
  const [earned, setEarned] = useState<PointsEntry | null>(null)
  const lastTier = useRef(user.tier)
  const seenPoints = useRef(new Set(pointsHistory.map((p) => p.id)))

  useEffect(() => {
    if (RANK[user.tier] > RANK[lastTier.current]) setTierUp(user.tier)
    lastTier.current = user.tier
  }, [user.tier])

  useEffect(() => {
    const fresh = pointsHistory.find((p) => !seenPoints.current.has(p.id) && p.amount > 0)
    pointsHistory.forEach((p) => seenPoints.current.add(p.id))
    if (fresh) setEarned(fresh)
  }, [pointsHistory])

  return (
    <>
      <TierUpgrade tier={tierUp} score={user.trustScore} onClose={() => setTierUp(null)} />
      <PointsEarned entry={earned} onClose={() => setEarned(null)} />
    </>
  )
}
