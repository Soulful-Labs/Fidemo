import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { TIER_LABEL } from '../../components/app/TierChip'
import Tilt from '../../components/motion/Tilt'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { feedback } from '../../lib/feedback'
import { ACCENT, BENEFITS, FlipCoin, GLOW, Rays, TierPill } from '../tierParts'
import type { Tier } from '../tierParts'
import { useTierPlayful } from './useTierPlayful'

export interface TierPlayfulProps { tier: Tier; old: Tier; score: number; fromScore: number; onClose: () => void }

/**
 * Moment B under PLAYFUL. Same words in the same places as the tier screen;
 * everything about how it arrives is louder: the old tier's coin falls from
 * the top of the screen and slams down, the camera takes the hit, the coin
 * turns over in 3D to the new tier with the headline flipping alongside, and
 * the landed coin is a collectible you can tilt. Tap anywhere to skip.
 */
export default function TierPlayful({ tier, old, score, fromScore, onClose }: TierPlayfulProps) {
  const accent = ACCENT[tier]
  const line = (t: Tier) => <>You&apos;ve reached to {TIER_LABEL[t].name} Tier!</>
  const { scope, playing, skip, scoreText } = useTierPlayful(fromScore, score, {
    impact: () => feedback('land'),
    reveal: () => feedback('celebrate'),
  })

  return createPortal(
    <div ref={scope} role="dialog" aria-modal="true" aria-label={`You've reached ${TIER_LABEL[tier].name} Tier`} data-playful="on"
      style={{ opacity: 0 }} onClickCapture={(e) => { if (playing.current) { e.stopPropagation(); skip() } }}
      className="fixed inset-0 z-50 overflow-hidden bg-bg-0 text-center">
      <span data-t="glow" style={{ opacity: 0 }} className={cn('pointer-events-none absolute inset-0 will-change-[opacity]', GLOW[tier])} />
      <span data-t="flash" data-decor style={{ opacity: 0 }} className={cn('pointer-events-none absolute inset-0 will-change-[opacity]', GLOW[tier])} />

      <div data-t="stage" className="relative flex h-full flex-col items-center px-4 pb-6 pt-12">
        <h1 data-t="title" style={{ opacity: 0 }} className="relative text-title-l text-brand-primary">Congratulations!!</h1>
        <p data-t="line" style={{ opacity: 0 }} className="relative mt-2 grid w-full text-title-m text-text-title [perspective:600px]">
          <span data-t="lineflip" className="col-start-1 row-start-1 grid [transform-style:preserve-3d]">
            <span aria-hidden="true" className="col-start-1 row-start-1 [backface-visibility:hidden]">{line(old)}</span>
            <span className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateX(180deg)]">{line(tier)}</span>
          </span>
        </p>

        <div className="relative mt-8">
          <Rays tier={tier} />
          <span data-decor aria-hidden="true" className={cn('pointer-events-none absolute inset-0', accent)}>
            <span data-t="ring" style={{ opacity: 0 }} className="absolute inset-0 rounded-full border-4 border-current will-change-transform" />
            <span data-t="ring2" style={{ opacity: 0 }} className="absolute inset-0 rounded-full border-2 border-current will-change-transform" />
          </span>
          <span data-t="coin" style={{ opacity: 0 }} className="relative block will-change-transform">
            <Tilt holo={1.2} className="rounded-full">
              <FlipCoin from={old} to={tier} />
            </Tilt>
          </span>
        </div>
        <p data-t="score" style={{ opacity: 0 }} className="relative mt-8 text-body-regular text-text-subtitle">
          Your Trust score is <motion.span className="text-brand-primary">{scoreText}</motion.span>
        </p>

        <div className="relative mt-8 w-full [perspective:800px]">
          <TierPill tier={tier} label={TIER_LABEL[tier]} />
          <div data-t="card" style={{ opacity: 0 }} className="flex flex-col items-center gap-3 rounded-lg bg-bgAlt-2/70 bg-green-fade px-4 pb-5 pt-10 [transform-origin:top]">
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
    </div>,
    document.body,
  )
}
