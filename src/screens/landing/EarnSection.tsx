import type { ReactNode } from 'react'
import { ACCENT, Glyph } from '../../app/tierParts'
import type { Tier } from '../../app/tierParts'
import { TIER_LABEL } from '../../components/app/TierChip'
import Tilt from '../../components/motion/Tilt'
import { PointsCoin, ShieldCheck } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { CERTIFICATE, POINTS, REDEEM, TIERS } from '../../lib/rules'
import Marquee from './Marquee'
import { Coin, CountUp, Heading, Section, at } from './shared'

const ORDER: Tier[] = ['silver', 'gold', 'platinum']
const SKIN: Record<Tier, string> = { silver: 'ld-tier-silver', gold: 'ld-tier-gold', platinum: 'ld-tier-platinum' }
const RING: Record<Tier, string> = { silver: 'border-tier-silver', gold: 'border-tier-gold', platinum: 'border-tier-platinum' }

/**
 * Every card in the row is built the same way: an emblem, a name, one line.
 * So they are all the same height with nothing left over, whichever tier or
 * reward they show (the Silver card used to be half empty because it listed
 * benefits and Silver has only one).
 */
const CARD = 'flex w-full flex-col items-center justify-center gap-2 rounded-xl px-2 py-4 text-center'
const points = (n: number) => `+${n}`

function Reward({ emblem, name, line, className }: { emblem: ReactNode; name: ReactNode; line: ReactNode; className?: string }) {
  return (
    <>
      <span className="flex h-16 w-16 items-center justify-center">{emblem}</span>
      <span className={cn('text-title-s leading-tight text-text-title', className)}>{name}</span>
      <span className="text-body-regular text-text-body">{line}</span>
    </>
  )
}

/** A tier, as a collectible: drag a finger across it and the holographic foil turns. The threshold is the policy's. */
function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className="ld-stage flex w-full">
      <Tilt holo={1.4} className={cn(CARD, 'ld-tier', SKIN[tier])}>
        <Reward
          emblem={<span className={cn('flex h-16 w-16 items-center justify-center rounded-full border-2 bg-bg-0', RING[tier], ACCENT[tier])}><Glyph tier={tier} size={32} /></span>}
          name={TIER_LABEL[tier].name} className={ACCENT[tier]}
          line={<>Trust Score {TIERS[tier]}+</>} />
      </Tilt>
    </div>
  )
}

/**
 * What you earn, drifting past: cash, points, the three tiers, the certificate.
 * Every figure is the policy's (lib/rules.ts).
 */
export default function EarnSection() {
  return (
    <Section id="earn" className="gap-4">
      <div className="flex flex-col gap-3">
        <Heading>What you earn</Heading>
        <p style={at(1)} className="ld-in px-4 text-title-s text-text-body">Cash and points for every study. A higher tier brings more invitations.</p>
      </div>
      <Marquee label="What you earn, six cards" i={2}>
        <div className={cn(CARD, 'bg-bg-1')}>
          <Reward emblem={<Coin className="h-14 w-14 text-title-l" />} name="Cash" line="for every study" />
        </div>
        <div className={cn(CARD, 'bg-bg-1')}>
          <Reward emblem={<PointsCoin className="h-14 w-14 text-brand-secondary" />}
            name={<><CountUp to={POINTS.STUDY_COMPLETION} format={points} /> points</>} className="text-brand-secondary"
            line={<>{REDEEM.PER_USD} points = $1</>} />
        </div>
        {ORDER.map((tier) => <TierCard key={tier} tier={tier} />)}
        <div className="ld-stage flex w-full">
          <Tilt holo={1.3} className={cn(CARD, 'bg-bg-1')}>
            <Reward emblem={<ShieldCheck className="h-16 w-16 text-state-success" />} name="Human Certificate" line={<>Valid {CERTIFICATE.VALID_MONTHS} months</>} />
          </Tilt>
        </div>
      </Marquee>
    </Section>
  )
}
