import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/app/StudyCard'
import CoinRain from '../../components/motion/CoinRain'
import { money } from '../../lib/format'
import { WITHDRAWAL_FEE } from '../../lib/rules'
import { STUDIES } from '../../mock/data'
import type { Study } from '../../mock/types'
import { Coin, CountUp, Heading, Section, at, useSection } from './shared'

/** One of the app's own seeded studies, shown as it would be listed in Explore. An example, and labelled as one. */
const SAMPLE: Study = { ...STUDIES.find((s) => s.id === 'st-02')!, status: 'available', saved: false }

/** The sample's reward arriving in a wallet: the coins drop in, the figure counts up to the card's own number. */
function Payout() {
  const purse = useRef<HTMLSpanElement>(null)
  const { seen } = useSection()
  return (
    <div style={at(3)} className="ld-in ld-pop mx-4 flex items-center gap-4 rounded-xl bg-bg-1 p-4">
      <span ref={purse} className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-900 will-change-transform">
        <Coin className="h-9 w-9 text-title-s" />
        {seen && <CoinRain target={purse} delay={0.7} />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-body-regular text-text-body">Finish this one and</span>
        <span className="text-title-m leading-tight text-text-title">
          <CountUp to={SAMPLE.reward} format={money} className="text-brand-primary" /> lands in your wallet
        </span>
      </span>
    </div>
  )
}

/**
 * Proof it is real: the same StudyCard every list in the app uses, with a
 * seeded study in it, so what is promised is exactly what is inside. Here the
 * whole card is one big target that goes to sign up; its small inner controls
 * (bookmark, match score) are switched off, since nobody is signed in to use them.
 */
export default function ProofSection() {
  const navigate = useNavigate()
  return (
    <Section id="proof" className="justify-center gap-4 bg-bg-0 pb-28 pt-12">
      <Heading>This is what a study looks like.</Heading>
      <div style={at(1)} className="ld-in ld-pop flex flex-col gap-3 px-4">
        <span className="flex h-9 items-center self-start rounded-full bg-yellow-1000/70 px-4 text-body-medium text-brand-primary">Sample study</span>
        <div role="link" tabIndex={0} aria-label={`Sample study: ${SAMPLE.title}. Sign up to apply.`}
          onClick={() => navigate('/signup')} onKeyDown={(e) => { if (e.key === 'Enter') navigate('/signup') }}>
          <div inert className="pointer-events-none"><StudyCard study={SAMPLE} showActions={false} /></div>
        </div>
      </div>
      <Payout />
      <p style={at(4)} className="ld-in px-4 text-body-regular text-text-body">
        Rewards and length vary by study. Withdrawals carry a flat ${WITHDRAWAL_FEE} fee and are credited within 2-3 working days.
      </p>
    </Section>
  )
}
