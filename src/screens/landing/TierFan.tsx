import { motion } from 'framer-motion'
import { useState } from 'react'
import { ACCENT, BENEFITS, Glyph } from '../../app/tierParts'
import type { Tier } from '../../app/tierParts'
import { TIER_LABEL } from '../../components/app/TierChip'
import Tilt from '../../components/motion/Tilt'
import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { feedback } from '../../lib/feedback'
import { SPRING } from '../../lib/motion'
import { TIERS } from '../../lib/rules'
import { useSection } from './shared'

const ORDER: Tier[] = ['silver', 'gold', 'platinum']
const SKIN: Record<Tier, string> = { silver: 'ld-tier-silver', gold: 'ld-tier-gold', platinum: 'ld-tier-platinum' }
const RING: Record<Tier, string> = { silver: 'border-tier-silver', gold: 'border-tier-gold', platinum: 'border-tier-platinum' }

function TierCard({ tier }: { tier: Tier }) {
  return (
    <Tilt holo={1.4} className={cn('ld-tier flex h-80 flex-col gap-3 rounded-xl p-4', SKIN[tier])}>
      <span className={cn('flex h-16 w-16 items-center justify-center rounded-full border-2 bg-bg-0', RING[tier], ACCENT[tier])}>
        <Glyph tier={tier} size={36} />
      </span>
      <span className="flex flex-col gap-1">
        <span className={cn('text-title-l', ACCENT[tier])}>{TIER_LABEL[tier].name}</span>
        <span className="text-body-medium text-text-title">Trust Score {TIERS[tier]}+</span>
      </span>
      <ul className="flex flex-col gap-2 border-t-1 border-text-disabled pt-3">
        {BENEFITS[tier].map((line) => (
          <li key={line} className="flex items-start gap-2 text-body-regular text-text-subtitle">
            <Check className={cn('mt-1 h-4 w-4 shrink-0', ACCENT[tier])} />
            {line}
          </li>
        ))}
      </ul>
    </Tilt>
  )
}

/**
 * The three tier cards as a fanned hand. They start as one stack and spring
 * apart when the section arrives. Swipe across the fan, tap a card, or tap a
 * tier name underneath to bring it to the front; the cards themselves tilt
 * under a finger with the holographic foil (components/motion/Tilt).
 */
export default function TierFan() {
  const { seen } = useSection()
  const [front, setFront] = useState(1)
  const bring = (i: number) => {
    const next = Math.max(0, Math.min(ORDER.length - 1, i))
    if (next !== front) { feedback('select'); setFront(next) }
  }

  return (
    <div className="flex flex-col gap-5">
      <motion.div className="ld-stage relative h-88 touch-pan-y overflow-hidden"
        onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 40 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) bring(front + (info.offset.x < 0 ? 1 : -1)) }}>
        {ORDER.map((tier, i) => {
          const off = i - front
          const far = Math.abs(off)
          return (
            <motion.div key={tier} onClick={() => bring(i)} initial={false}
              animate={seen ? { x: off * 92, y: far * 18, rotate: off * 9, scale: 1 - far * 0.1 } : { x: 0, y: 40, rotate: 0, scale: 0.8 }}
              transition={{ ...SPRING.bouncy, delay: seen ? far * 0.05 : 0 }} style={{ zIndex: 10 - far }}
              className="absolute left-1/2 top-3 -ml-28 w-56 will-change-transform">
              <TierCard tier={tier} />
            </motion.div>
          )
        })}
      </motion.div>

      <div className="flex justify-center gap-2 px-4">
        {ORDER.map((tier, i) => (
          <button key={tier} type="button" aria-pressed={i === front} onClick={() => bring(i)}
            className={cn('flex h-11 items-center gap-2 rounded-full border-2 bg-bg-1 px-4 text-body-medium', i === front ? cn(RING[tier], ACCENT[tier]) : 'border-stroke-3 text-text-body')}>
            <Glyph tier={tier} size={18} />
            {TIER_LABEL[tier].name}
          </button>
        ))}
      </div>
    </div>
  )
}
