import { cn } from '../lib/cn'
import type { User } from '../mock/types'

export type Tier = User['tier']

/**
 * The "Benefits" lines as drawn (1433:50005, 1433:49079). The two drawn fee
 * lines ("25% / 50% less fees on withdrawals") are left out: the policy owns
 * fees and the wallet charges a flat $2. Flagged in the turn report.
 */
export const BENEFITS: Record<Tier, string[]> = {
  // Silver is where everyone starts, so Figma never drew its screen; the line is Silver's from How Tiers Works.
  silver: ["You're rising on your way up!"],
  gold: ['Get more visibility to researcher clients', 'Receive more invitations to apply'],
  platinum: ['Get access to high-paying studies', 'Fast and priority help support access', 'Higher chances to qualify studies'],
}

export const ACCENT: Record<Tier, string> = { gold: 'text-tier-gold', platinum: 'text-tier-platinum', silver: 'text-tier-silver' }
export const GLOW: Record<Tier, string> = { gold: 'bg-gold-glow', platinum: 'bg-platinum-glow', silver: 'bg-silver-glow' }

const COIN: Record<Tier, { ring: string; disc: string }> = {
  gold: { ring: 'border-yellow-700/70 bg-yellow-900/70 text-tier-gold shadow-tier-gold', disc: 'bg-yellow-700/80 text-yellow-400' },
  platinum: { ring: 'border-tier-platinum/50 bg-tier-platinum/30 text-tier-platinum shadow-tier-platinum', disc: 'bg-tier-platinum/70 text-accent-purple' },
  silver: { ring: 'border-tier-silver/50 bg-tier-silver/20 text-tier-silver shadow-tier-silver', disc: 'bg-tier-silver/60 text-text-title' },
}

export function Glyph({ tier, size }: { tier: Tier; size: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round' } as const
  if (tier === 'gold') return <svg viewBox="0 0 24 24" width={size} height={size}><path d="M4 18h16M4 18 3 8l5 3 4-6 4 6 5-3-1 10" {...common} /></svg>
  if (tier === 'platinum') return <svg viewBox="0 0 24 24" width={size} height={size}><path d="M7 4h10l4 5-9 11L3 9l4-5Zm-4 5h18M9 4l3 16m3-16-3 16" {...common} /></svg>
  return <svg viewBox="0 0 24 24" width={size} height={size}><path d="m12 3 2.6 5.5 5.9.8-4.3 4.2 1 6-5.2-2.8L6.8 19.5l1-6L3.5 9.3l5.9-.8L12 3Z" {...common} /></svg>
}

/** The tier mark, with a band of light that passes across it once it has landed. */
export function TierCoin({ tier }: { tier: Tier }) {
  return (
    <span data-t="coin" style={{ opacity: 0 }}
      className={cn('relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 shadow-glow will-change-transform', COIN[tier].ring)}>
      <span className={cn('flex h-28 w-28 items-center justify-center rounded-full', COIN[tier].disc)}>
        <Glyph tier={tier} size={64} />
      </span>
      <span data-decor aria-hidden="true" className="hl-sheen-loop pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-text-title/35 to-transparent" />
    </span>
  )
}

/** Slow light rays behind the mark, in the tier's own colour. Decorative. */
export function Rays({ tier }: { tier: Tier }) {
  const wedges = Array.from({ length: 14 }, (_, i) => i * (360 / 14))
  return (
    <span data-decor aria-hidden="true" className={cn('pointer-events-none absolute left-1/2 top-1/2 h-0 w-0', ACCENT[tier])}>
      <span data-t="rays" style={{ opacity: 0 }} className="absolute -left-48 -top-48 block h-96 w-96 will-change-transform">
        <svg viewBox="-100 -100 200 200" className="hl-sway h-full w-full">
          <defs>
            <radialGradient id={`rays-${tier}`}>
              <stop offset="0.15" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          {wedges.map((a) => (
            <path key={a} d="M0 0 L-7 -100 L7 -100 Z" transform={`rotate(${a})`} fill={`url(#rays-${tier})`} />
          ))}
        </svg>
      </span>
    </span>
  )
}

/** One face of the tier mark, as drawn, without any of the timeline hooks. */
export function CoinFace({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span className={cn('flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 shadow-glow [backface-visibility:hidden]', COIN[tier].ring, className)}>
      <span className={cn('flex h-28 w-28 items-center justify-center rounded-full', COIN[tier].disc)}>
        <Glyph tier={tier} size={64} />
      </span>
    </span>
  )
}

/**
 * PLAYFUL: the tier mark as a two-sided coin. The old tier is on the front,
 * the new tier on the back; the timeline turns it over (`data-t="flip"`).
 */
export function FlipCoin({ from, to }: { from: Tier; to: Tier }) {
  return (
    <span data-t="flip" className="relative block h-36 w-36 [transform-style:preserve-3d]" style={{ transform: 'perspective(700px)' }}>
      <CoinFace tier={from} className="absolute inset-0" />
      <CoinFace tier={to} className="absolute inset-0 [transform:rotateY(180deg)]" />
    </span>
  )
}

/** The tier name pill that sits on the benefits card (same strings as the tier screen). */
export function TierPill({ tier, label }: { tier: Tier; label: { name: string; top: string } }) {
  const gold = tier === 'gold'
  return (
    <span data-t="pill" style={{ opacity: 0 }}
      className={cn('absolute left-1/2 top-0 z-10 flex h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full border-1 px-4 pr-6',
        gold ? 'border-yellow-700 bg-yellow-1000' : tier === 'platinum' ? 'border-tier-platinum/60 bg-tier-platinum/20' : 'border-tier-silver/60 bg-bg-2')}>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', gold ? 'bg-yellow-900' : tier === 'platinum' ? 'bg-tier-platinum/30' : 'bg-tier-silver/20', ACCENT[tier])}>
        <Glyph tier={tier} size={20} />
      </span>
      <span className="flex flex-col items-start whitespace-nowrap">
        <span className={cn('text-title-s leading-tight', ACCENT[tier])}>{label.name}</span>
        <span className="text-text-regular text-text-subtitle">You are in {label.top.replace('In ', '')}</span>
      </span>
    </span>
  )
}
