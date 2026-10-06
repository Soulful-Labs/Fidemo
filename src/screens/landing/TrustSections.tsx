import { motion } from 'framer-motion'
import { Burst } from '../../components/motion/Particles'
import { CONFETTI } from '../../components/motion/Confetti'
import Tilt from '../../components/motion/Tilt'
import { Check, ShieldCheck } from '../../components/ui/icons'
import { SPRING } from '../../lib/motion'
import { CERTIFICATE } from '../../lib/rules'
import TierFan from './TierFan'
import { Heading, Lead, Section, at, useSection } from './shared'

/** What you earn, part two: standing. The tier cards, fanned. */
export function TiersSection() {
  return (
    <Section id="tiers" className="justify-center gap-5 bg-bg-0 bg-purple-fade pb-28 pt-12">
      <div className="flex flex-col gap-3">
        <Heading>Do good work. Move up.</Heading>
        <Lead i={1}>Your Trust Score takes you from Silver to Gold to Platinum.</Lead>
      </div>
      <TierFan />
    </Section>
  )
}

/** The seal comes down on the certificate once the card has arrived, and the ink rings out. */
function Seal() {
  const { seen } = useSection()
  return (
    <span className="relative flex h-28 w-28 items-center justify-center">
      <motion.span data-decor aria-hidden="true" initial={false} animate={seen ? { scale: [0.6, 1.9], opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.72, delay: 0.62, ease: 'easeOut' }} className="absolute inset-2 rounded-full border-4 border-state-success" />
      <motion.span initial={false} animate={seen ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 3.2, rotate: -32, opacity: 0 }}
        transition={{ ...SPRING.slam, delay: 0.5, opacity: { duration: 0.1, delay: 0.5 } }}
        className="relative text-state-success drop-shadow-[0_6px_0_var(--pf-green-900)] will-change-transform">
        <ShieldCheck className="h-28 w-28" />
      </motion.span>
      {seen && <Burst delay={0.62} palette={CONFETTI.green} />}
    </span>
  )
}

/**
 * What you earn, part three: the Human Certificate, stamped in front of you.
 * The facts are the policy's (section 2): issued the moment the ID passes,
 * valid twelve months, renews on its own. The ID is shown as a pattern, not a
 * made-up number.
 */
export function CertificateSection() {
  return (
    <Section id="certificate" className="justify-center gap-6 bg-bg-0 bg-green-fade pb-28 pt-12">
      <div style={at(0)} className="ld-in ld-pop ld-stage px-4">
        <Tilt holo={1.3} className="flex flex-col items-center gap-4 rounded-xl bg-bg-1 px-4 pb-6 pt-6 text-center">
          <h3 className="text-title-l text-text-title">Human Certificate</h3>
          <Seal />
          <span className="text-body-regular text-text-body">Cert. ID: <span className="text-text-title">HL-R-XXXX-XXXX</span></span>
          <span style={at(6)} className="ld-in flex items-center gap-2 text-body-medium text-text-title">
            <Check className="h-5 w-5 text-brand-secondary" />
            Government ID Verified
          </span>
        </Tilt>
      </div>
      <div className="flex flex-col gap-3">
        <Heading i={2}>Proof that you are a real person.</Heading>
        <Lead i={3}>Pass the ID check and your certificate is issued on the spot. It is valid for {CERTIFICATE.VALID_MONTHS} months and renews on its own.</Lead>
      </div>
    </Section>
  )
}
