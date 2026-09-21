import { TIER_LABEL } from '../components/app/TierChip'
import Button from '../components/ui/Button'
import { useOverlay } from '../components/ui/Modal'
import { cn } from '../lib/cn'
import type { User } from '../mock/types'

type Tier = User['tier']

/**
 * The drawn "Benefits" list (fee discounts, priority support, more
 * invitations) is in no source and the policy states no tier benefits, so
 * the card carries only what the policy says a tier is (sections 2 and 3).
 */
const POLICY_LINES = [
  'Tier is determined by your current Trust Score.',
  'The tier on your certificate moves up or down after every study.',
]

function TierCoin({ tier }: { tier: Tier }) {
  const gold = tier === 'gold'
  return (
    <span className={cn('flex h-36 w-36 items-center justify-center rounded-full border-4 shadow-glow',
      gold ? 'border-yellow-700/70 bg-yellow-900/70 text-tier-gold shadow-tier-gold' : 'border-tier-platinum/50 bg-tier-platinum/30 text-tier-platinum shadow-tier-platinum')}>
      <span className={cn('flex h-28 w-28 items-center justify-center rounded-full', gold ? 'bg-yellow-700/80 text-yellow-400' : 'bg-tier-platinum/70 text-accent-purple')}>
        {gold ? (
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64"><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64"><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
        )}
      </span>
    </span>
  )
}

/**
 * Full-screen tier upgrade as drawn (Figma 1433:50005 Gold, 1433:49079
 * Platinum). Not a route: it sits over whatever screen the score changed on.
 */
export default function TierUpgrade({ tier, score, onClose }: { tier: Tier | null; score: number; onClose: () => void }) {
  useOverlay(tier !== null, onClose)
  if (!tier) return null
  const gold = tier === 'gold'
  const accent = gold ? 'text-tier-gold' : 'text-tier-platinum'

  return (
    <div role="dialog" aria-modal="true" aria-label={`You've reached ${TIER_LABEL[tier].name} Tier`}
      className={cn('fixed inset-0 z-50 flex flex-col items-center bg-bg-0 px-4 pb-6 pt-12 text-center', gold ? 'bg-gold-glow' : 'bg-platinum-glow')}>
      <h1 className="text-title-l text-brand-primary">Congratulations!!</h1>
      <p className="mt-2 text-title-m text-text-title">You&apos;ve reached to {TIER_LABEL[tier].name} Tier!</p>

      <div className="mt-8"><TierCoin tier={tier} /></div>
      <p className="mt-8 text-body-regular text-text-subtitle">Your Trust score is <span className="text-brand-primary">{score}</span></p>

      <div className="relative mt-8 w-full">
        <span className={cn('absolute left-1/2 top-0 z-10 flex h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full border-1 px-4 pr-6',
          gold ? 'border-yellow-700 bg-yellow-1000' : 'border-tier-platinum/60 bg-tier-platinum/20')}>
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', gold ? 'bg-yellow-900' : 'bg-tier-platinum/30', accent)}>
            {gold ? (
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            )}
          </span>
          <span className="flex flex-col items-start whitespace-nowrap">
            <span className={cn('text-title-s leading-tight', accent)}>{TIER_LABEL[tier].name}</span>
            <span className="text-text-regular text-text-subtitle">{TIER_LABEL[tier].top}</span>
          </span>
        </span>
        <div className="flex flex-col items-center gap-3 rounded-lg bg-bgAlt-2/70 bg-green-fade px-4 pb-5 pt-10">
          <p className="text-title-s text-text-title">What this means</p>
          {POLICY_LINES.map((line, i) => (
            <p key={line} className="flex flex-col items-center gap-3 text-text-regular text-brand-secondary">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-text-disabled" />}
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-auto w-full pt-6">
        <Button fullWidth onClick={onClose}>Yayy! Start Earning More!</Button>
      </div>
    </div>
  )
}
