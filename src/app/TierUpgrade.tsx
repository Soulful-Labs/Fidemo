import { TIER_LABEL } from '../components/app/TierChip'
import Button from '../components/ui/Button'
import { useOverlay } from '../components/ui/Modal'
import { cn } from '../lib/cn'
import type { User } from '../mock/types'

type Tier = User['tier']

/**
 * The "Benefits" lines as drawn (1433:50005, 1433:49079). The two drawn fee
 * lines ("25% / 50% less fees on withdrawals") are left out: the policy owns
 * fees and the wallet charges a flat $2. Flagged in the turn report.
 */
const BENEFITS: Record<Tier, string[]> = {
  // Silver is where everyone starts, so Figma never drew its screen; the line is Silver's from How Tiers Works.
  silver: ["You're rising on your way up!"],
  gold: ['Get more visibility to researcher clients', 'Receive more invitations to apply'],
  platinum: ['Get access to high-paying studies', 'Fast and priority help support access', 'Higher chances to qualify studies'],
}

const COIN: Record<Tier, { ring: string; disc: string }> = {
  gold: { ring: 'border-yellow-700/70 bg-yellow-900/70 text-tier-gold shadow-tier-gold', disc: 'bg-yellow-700/80 text-yellow-400' },
  platinum: { ring: 'border-tier-platinum/50 bg-tier-platinum/30 text-tier-platinum shadow-tier-platinum', disc: 'bg-tier-platinum/70 text-accent-purple' },
  silver: { ring: 'border-tier-silver/50 bg-tier-silver/20 text-tier-silver shadow-tier-silver', disc: 'bg-tier-silver/60 text-text-title' },
}

function Glyph({ tier, size }: { tier: Tier; size: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' } as const
  if (tier === 'gold') return <svg viewBox="0 0 24 24" width={size} height={size}><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" {...common} /></svg>
  if (tier === 'platinum') return <svg viewBox="0 0 24 24" width={size} height={size}><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" {...common} /></svg>
  return <svg viewBox="0 0 24 24" width={size} height={size}><path d="m12 3 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8L12 3Z" {...common} /></svg>
}

function TierCoin({ tier }: { tier: Tier }) {
  return (
    <span className={cn('flex h-36 w-36 items-center justify-center rounded-full border-4 shadow-glow', COIN[tier].ring)}>
      <span className={cn('flex h-28 w-28 items-center justify-center rounded-full', COIN[tier].disc)}>
        <Glyph tier={tier} size={64} />
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
  const accent = gold ? 'text-tier-gold' : tier === 'platinum' ? 'text-tier-platinum' : 'text-tier-silver'
  const glow = gold ? 'bg-gold-glow' : tier === 'platinum' ? 'bg-platinum-glow' : 'bg-silver-glow'

  return (
    <div role="dialog" aria-modal="true" aria-label={`You've reached ${TIER_LABEL[tier].name} Tier`}
      className={cn('fixed inset-0 z-50 flex flex-col items-center bg-bg-0 px-4 pb-6 pt-12 text-center', glow)}>
      <h1 className="text-title-l text-brand-primary">Congratulations!!</h1>
      <p className="mt-2 text-title-m text-text-title">You&apos;ve reached to {TIER_LABEL[tier].name} Tier!</p>

      <div className="mt-8"><TierCoin tier={tier} /></div>
      <p className="mt-8 text-body-regular text-text-subtitle">Your Trust score is <span className="text-brand-primary">{score}</span></p>

      <div className="relative mt-8 w-full">
        <span className={cn('absolute left-1/2 top-0 z-10 flex h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full border-1 px-4 pr-6',
          gold ? 'border-yellow-700 bg-yellow-1000' : tier === 'platinum' ? 'border-tier-platinum/60 bg-tier-platinum/20' : 'border-tier-silver/60 bg-bg-2')}>
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', gold ? 'bg-yellow-900' : tier === 'platinum' ? 'bg-tier-platinum/30' : 'bg-tier-silver/20', accent)}>
            <Glyph tier={tier} size={20} />
          </span>
          <span className="flex flex-col items-start whitespace-nowrap">
            <span className={cn('text-title-s leading-tight', accent)}>{TIER_LABEL[tier].name}</span>
            <span className="text-text-regular text-text-subtitle">You are in {TIER_LABEL[tier].top.replace('In ', '')}</span>
          </span>
        </span>
        <div className="flex flex-col items-center gap-3 rounded-lg bg-bgAlt-2/70 bg-green-fade px-4 pb-5 pt-10">
          <p className="text-title-s text-text-title">Benefits</p>
          {BENEFITS[tier].map((line, i) => (
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
