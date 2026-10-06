import { ACCENT, BENEFITS, Glyph } from '../../app/tierParts'
import type { Tier } from '../../app/tierParts'
import { TIER_LABEL } from '../../components/app/TierChip'
import Tilt from '../../components/motion/Tilt'
import { Check, PointsCoin, ShieldCheck } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { CERTIFICATE, POINTS, REDEEM, TIERS } from '../../lib/rules'
import { Carousel, CountUp, Heading, Section } from './shared'

const ORDER: Tier[] = ['silver', 'gold', 'platinum']
const SKIN: Record<Tier, string> = { silver: 'ld-tier-silver', gold: 'ld-tier-gold', platinum: 'ld-tier-platinum' }
const RING: Record<Tier, string> = { silver: 'border-tier-silver', gold: 'border-tier-gold', platinum: 'border-tier-platinum' }

/** Every card in the row is the same size, so the row does not jump as it turns. */
const CARD = 'flex h-64 flex-col gap-3 rounded-xl p-4'
const plus = (n: number) => `+${n}`

/** Money and points. The figures are the policy's (lib/rules.ts). */
function PointsCard() {
  return (
    <div className={cn(CARD, 'bg-bg-1')}>
      <span className="text-title-m leading-tight text-text-title">Cash for every study</span>
      <span className="flex items-center gap-3 text-display text-brand-secondary">
        <PointsCoin className="h-12 w-12" />
        <CountUp to={POINTS.STUDY_COMPLETION} format={plus} />
      </span>
      <span className="text-body-regular text-text-body">reward points on top, each time you complete one.</span>
      <span className="mt-auto flex flex-col gap-1 border-t-1 border-stroke-3 pt-3">
        <span className="text-body-large text-text-title">{REDEEM.PER_USD} points = $1</span>
        <span className="text-body-regular text-text-body">Redeem from {REDEEM.MINIMUM.toLocaleString('en-US')} points.</span>
      </span>
    </div>
  )
}

/** A tier, with the holographic tilt: drag a finger across it. Thresholds are the policy's; the benefit lines are the app's own. */
function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className="ld-stage">
      <Tilt holo={1.4} className={cn(CARD, 'ld-tier', SKIN[tier])}>
        <span className="flex items-center gap-3">
          <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-bg-0', RING[tier], ACCENT[tier])}>
            <Glyph tier={tier} size={30} />
          </span>
          <span className="flex flex-col">
            <span className={cn('text-title-l', ACCENT[tier])}>{TIER_LABEL[tier].name}</span>
            <span className="pt-1 text-body-medium text-text-title">Trust Score {TIERS[tier]}+</span>
          </span>
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
    </div>
  )
}

/** The Human Certificate. The facts are the policy's (section 2); the ID is shown as a pattern, not a made-up number. */
function CertificateCard() {
  return (
    <div className="ld-stage">
      <Tilt holo={1.3} className={cn(CARD, 'items-center bg-bg-1 text-center')}>
        <span className="text-title-l text-text-title">Human Certificate</span>
        <ShieldCheck className="h-20 w-20 text-state-success" />
        <span className="text-body-regular text-text-body">Cert. ID: <span className="text-text-title">HL-R-XXXX-XXXX</span></span>
        <span className="flex items-center gap-2 text-body-medium text-text-title">
          <Check className="h-5 w-5 text-brand-secondary" />
          Government ID Verified
        </span>
        <span className="mt-auto text-body-regular text-text-body">Valid for {CERTIFICATE.VALID_MONTHS} months.</span>
      </Tilt>
    </div>
  )
}

/** What you earn: money and points, then the three tiers, then the certificate. One whole card at a time. */
export default function EarnSection() {
  return (
    <Section id="earn" className="gap-4">
      <Heading>What you earn</Heading>
      <Carousel label="What you earn, five cards">
        <PointsCard />
        {ORDER.map((tier) => <TierCard key={tier} tier={tier} />)}
        <CertificateCard />
      </Carousel>
    </Section>
  )
}
