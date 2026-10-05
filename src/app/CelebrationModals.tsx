import { useEffect, useRef, useState } from 'react'
import { useStore } from '../mock/store'
import { TIMINGS } from '../mock/timings'
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
  const [tierUp, setTierUp] = useState<{ tier: Tier; from: Tier; fromScore: number } | null>(null)
  const [earned, setEarned] = useState<PointsEntry | null>(null)
  const lastTier = useRef(user.tier)
  const lastScore = useRef(user.trustScore)
  const seenPoints = useRef(new Set(pointsHistory.map((p) => p.id)))
  const account = useRef(user.email)
  const pause = useRef<number | undefined>(undefined)

  // Signing into a different account is not a change worth celebrating: reset the
  // baselines. A brand new account (just signed up) keeps its first points entry,
  // the being-referred bonus, so that one still shows.
  const switched = account.current !== user.email
  useEffect(() => {
    if (!switched) return
    account.current = user.email
    lastTier.current = user.tier
    lastScore.current = user.trustScore
    const brandNew = Date.now() - Date.parse(user.joinedAt) < 60_000
    seenPoints.current = new Set(brandNew ? [] : pointsHistory.map((p) => p.id))
    if (!brandNew) return
    // Let the dashboard land first: the sign-up bonus is celebrated after a pause.
    const fresh = pointsHistory.find((p) => p.amount > 0)
    pointsHistory.forEach((p) => seenPoints.current.add(p.id))
    if (!fresh) return
    window.clearTimeout(pause.current)
    pause.current = window.setTimeout(() => setEarned(fresh), TIMINGS.signUpCelebration)
  }, [switched, user.email, user.tier, user.joinedAt, pointsHistory])
  useEffect(() => () => window.clearTimeout(pause.current), [])

  useEffect(() => {
    if (switched) return
    if (RANK[user.tier] > RANK[lastTier.current]) setTierUp({ tier: user.tier, from: lastTier.current, fromScore: lastScore.current })
    lastTier.current = user.tier
    lastScore.current = user.trustScore
  }, [user.tier, user.trustScore, switched])

  useEffect(() => {
    if (switched) return
    const fresh = pointsHistory.find((p) => !seenPoints.current.has(p.id) && p.amount > 0)
    pointsHistory.forEach((p) => seenPoints.current.add(p.id))
    if (fresh) setEarned(fresh)
  }, [pointsHistory, switched])

  return (
    <>
      <TierUpgrade tier={tierUp?.tier ?? null} from={tierUp?.from} fromScore={tierUp?.fromScore} score={user.trustScore} onClose={() => setTierUp(null)} />
      <PointsEarned entry={earned} onClose={() => setEarned(null)} />
    </>
  )
}
