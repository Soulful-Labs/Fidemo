import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { TIER_LABEL } from '../components/app/TierChip'
import { ParticleField, burst } from '../components/motion/Particles'
import Button from '../components/ui/Button'
import { useOverlay } from '../components/ui/Modal'
import { cn } from '../lib/cn'
import { ACCENT, BENEFITS, GLOW, Glyph, Rays, TierCoin } from './tierParts'
import type { Tier } from './tierParts'
import { useTierSequence } from './useTierSequence'

const BELOW: Record<Tier, Tier> = { silver: 'silver', gold: 'silver', platinum: 'gold' }

export interface TierUpgradeProps {
  tier: Tier | null
  score: number
  /** The tier being left, whose name gives way to the new one. Defaults to the one below. */
  from?: Tier
  /** The score before the change, so it rolls up to `score`. Defaults to no roll. */
  fromScore?: number
  onClose: () => void
}

/**
 * Full-screen tier upgrade as drawn (Figma 1433:50005 Gold, 1433:49079
 * Platinum), now arriving as moment B of docs/Motion.md. Resting layout and
 * every string are unchanged; tap anywhere while it plays to skip to the end.
 */
export default function TierUpgrade(props: TierUpgradeProps) {
  useOverlay(props.tier !== null, props.onClose)
  // Mounted fresh on every open, so each upgrade plays from the top.
  return props.tier ? <Celebration {...props} tier={props.tier} /> : null
}

function Celebration({ tier, score, from, fromScore, onClose }: TierUpgradeProps & { tier: Tier }) {
  const particles = useMemo(() => burst(30, tier === 'platinum' ? 9 : 4), [tier])
  const { scope, playing, skip, scoreText } = useTierSequence(particles, fromScore ?? score, score)
  const gold = tier === 'gold'
  const accent = ACCENT[tier]
  const old = from ?? BELOW[tier]
  const line = (t: Tier) => <>You&apos;ve reached to {TIER_LABEL[t].name} Tier!</>

  return (
    <div ref={scope} role="dialog" aria-modal="true" aria-label={`You've reached ${TIER_LABEL[tier].name} Tier`}
      style={{ opacity: 0 }} onClickCapture={(e) => { if (playing.current) { e.stopPropagation(); skip() } }}
      className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-bg-0 px-4 pb-6 pt-12 text-center">
      <span data-t="glow" style={{ opacity: 0 }} className={cn('pointer-events-none absolute inset-0 will-change-[opacity]', GLOW[tier])} />
      <span data-t="flash" data-decor style={{ opacity: 0 }} className={cn('pointer-events-none absolute inset-0 will-change-[opacity]', GLOW[tier])} />

      <h1 data-t="title" style={{ opacity: 0 }} className="relative text-title-l text-brand-primary">Congratulations!!</h1>
      <p className="relative mt-2 grid w-full text-title-m text-text-title">
        {/* The old tier's line stays in the same grid cell, invisible, once it has given way. */}
        {old !== tier && <span data-t="old" aria-hidden="true" style={{ opacity: 0 }} className="col-start-1 row-start-1">{line(old)}</span>}
        <span data-t="new" style={{ opacity: 0 }} className="col-start-1 row-start-1">{line(tier)}</span>
      </p>

      <div className="relative mt-8">
        <Rays tier={tier} />
        <span data-decor aria-hidden="true" className={cn('pointer-events-none absolute inset-0', accent)}>
          <span data-t="ring" style={{ opacity: 0 }} className="absolute inset-0 rounded-full border-4 border-current will-change-transform" />
          <span data-t="ring2" style={{ opacity: 0 }} className="absolute inset-0 rounded-full border-2 border-current will-change-transform" />
          {[[-70, -20, 0], [76, 10, 0.8], [-52, 120, 1.5], [60, 128, 0.4]].map(([x, y, d]) => (
            <span key={`${x}`} className="hl-twinkle absolute left-1/2 top-0 block h-2 w-2 rounded-full bg-current"
              style={{ translate: `${x}px ${y}px`, animationDelay: `${2 + d}s` }} />
          ))}
        </span>
        <ParticleField name="tier" particles={particles} tones={[accent, 'text-brand-primary', 'text-text-title']} />
        <TierCoin tier={tier} />
      </div>
      <p data-t="score" style={{ opacity: 0 }} className="relative mt-8 text-body-regular text-text-subtitle">
        Your Trust score is <motion.span className="text-brand-primary">{scoreText}</motion.span>
      </p>

      <div className="relative mt-8 w-full">
        <span data-t="pill" style={{ opacity: 0 }}
          className={cn('absolute left-1/2 top-0 z-10 flex h-14 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full border-1 px-4 pr-6',
            gold ? 'border-yellow-700 bg-yellow-1000' : tier === 'platinum' ? 'border-tier-platinum/60 bg-tier-platinum/20' : 'border-tier-silver/60 bg-bg-2')}>
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', gold ? 'bg-yellow-900' : tier === 'platinum' ? 'bg-tier-platinum/30' : 'bg-tier-silver/20', accent)}>
            <Glyph tier={tier} size={20} />
          </span>
          <span className="flex flex-col items-start whitespace-nowrap">
            <span className={cn('text-title-s leading-tight', accent)}>{TIER_LABEL[tier].name}</span>
            <span className="text-text-regular text-text-subtitle">You are in {TIER_LABEL[tier].top.replace('In ', '')}</span>
          </span>
        </span>
        <div data-t="card" style={{ opacity: 0 }} className="flex flex-col items-center gap-3 rounded-lg bg-bgAlt-2/70 bg-green-fade px-4 pb-5 pt-10">
          <p className="text-title-s text-text-title">Benefits</p>
          {BENEFITS[tier].map((benefit, i) => (
            <p key={benefit} data-t="benefit" style={{ opacity: 0 }} className="flex flex-col items-center gap-3 text-text-regular text-brand-secondary">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-text-disabled" />}
              {benefit}
            </p>
          ))}
        </div>
      </div>

      <div data-t="cta" style={{ opacity: 0 }} className="relative mt-auto w-full pt-6">
        <Button fullWidth onClick={onClose}>Yayy! Start Earning More!</Button>
      </div>
    </div>
  )
}
