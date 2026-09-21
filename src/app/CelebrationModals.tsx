import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TIER_LABEL } from '../components/app/TierChip'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { PointsCoin } from '../components/ui/icons'
import { cn } from '../lib/cn'
import { points } from '../lib/format'
import { TIERS } from '../lib/rules'
import { useStore } from '../mock/store'
import type { PointsEntry, User } from '../mock/types'

type Tier = User['tier']
const RANK: Record<Tier, number> = { silver: 0, gold: 1, platinum: 2 }
const TIER_COPY: Record<Tier, string> = {
  silver: "You're rising on your way up!",
  gold: "You're in most trusted participants!",
  platinum: "You're in top expert participants.",
}

function TierBadge({ tier }: { tier: Tier }) {
  const gold = tier === 'gold'
  return (
    <span className={cn('flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-glow',
      gold ? 'border-tier-gold bg-yellow-1000/60 text-tier-gold shadow-tier-gold' : 'border-tier-platinum bg-bg-2 text-tier-platinum shadow-tier-platinum')}>
      {gold ? (
        <svg viewBox="0 0 24 24" fill="none" width="44" height="44"><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" width="44" height="44"><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
      )}
    </span>
  )
}

/**
 * The two drawn celebrations that fire from derived state: a tier upgrade
 * (Figma 1433:50005 Gold, 1433:49079 Platinum) when the Trust Score crosses a
 * tier line, and points earned (1433:50642) when a new points entry lands.
 * Both watch the store, so nothing has to remember to open them.
 */
export default function CelebrationModals() {
  const navigate = useNavigate()
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
      <Modal open={tierUp !== null} onClose={() => setTierUp(null)} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setTierUp(null); navigate('/trust-score/tiers') }}>How Tiers Work</Button>
            <Button className="flex-1" onClick={() => setTierUp(null)}>Got It!</Button>
          </div>
        }>
        {tierUp && (
          <div className="flex flex-col items-center gap-3 pt-4 text-center">
            <TierBadge tier={tierUp} />
            <p className="text-label uppercase tracking-widest text-text-body">Tier upgrade</p>
            <h2 className={cn('text-title-l', tierUp === 'gold' ? 'text-tier-gold' : 'text-tier-platinum')}>You've reached {TIER_LABEL[tierUp].name}!</h2>
            <p className="text-body-regular text-text-subtitle">Trust Score {TIERS[tierUp]}+ • {TIER_LABEL[tierUp].top}</p>
            <p className="text-text-regular text-text-body">{TIER_COPY[tierUp]} Higher tiers unlock better opportunities and rewards.</p>
          </div>
        )}
      </Modal>

      <Modal open={earned !== null} onClose={() => setEarned(null)} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setEarned(null); navigate('/points') }}>View Points</Button>
            <Button className="flex-1" onClick={() => setEarned(null)}>Got It!</Button>
          </div>
        }>
        {earned && (
          <div className="flex flex-col items-center gap-3 pt-4 text-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-brand-secondary bg-green-900/50 text-brand-secondary shadow-glow shadow-green-700">
              <PointsCoin className="h-11 w-11" />
            </span>
            <p className="text-label uppercase tracking-widest text-text-body">Reward points earned</p>
            <h2 className="text-title-l text-brand-secondary">+{points(earned.amount)} points</h2>
            <p className="text-body-regular text-text-subtitle">{earned.label} • {earned.detail}</p>
            <p className="text-text-regular text-text-body">Your balance is now {points(user.points)} points. 100 points = $1, redeem from 1,000.</p>
          </div>
        )}
      </Modal>
    </>
  )
}
