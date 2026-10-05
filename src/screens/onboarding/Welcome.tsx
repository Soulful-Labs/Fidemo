import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import Button from '../../components/ui/Button'
import { ChevronRight, ShieldCheck } from '../../components/ui/icons'
import { DUR, EASE, SPRING, fadeUp } from '../../lib/motion'
import { TRUST } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 4.10, Figma 915:50345. A new account starts at 50, Silver, which is
 * also what conflict 18 says the Get Started dashboard should show.
 */
export default function Welcome() {
  const navigate = useNavigate()
  const { signIn } = useStore()

  const go = (to: string) => {
    signIn()
    navigate(to, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0 bg-green-fade">
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-6">
        {/* Moment I: the verified seal is pressed in, then the welcome and the score follow. */}
        <motion.div initial="hidden" animate="shown" transition={{ staggerChildren: 0.09, delayChildren: DUR.base }}
          className="flex flex-col items-center gap-2 text-center">
          <motion.span variants={{ hidden: { opacity: 0, scale: 2.2, rotate: -14 }, shown: { opacity: 1, scale: 1, rotate: 0, transition: { duration: DUR.base, ease: EASE.in } } }} className="flex">
            <ShieldCheck className="h-12 w-12 text-state-success" />
          </motion.span>
          <motion.p variants={fadeUp} className="text-body-regular text-brand-secondary">You are verified!</motion.p>
          <motion.h1 variants={fadeUp} className="text-title-l text-text-title">Welcome to HumanLayer!</motion.h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.soft, delay: DUR.slow }}
          className="flex flex-col items-center gap-5 rounded-xl bg-bg-1 bg-yellow-fade px-4 pb-6 pt-5">
          <p className="text-title-s text-text-title">Your Trust Score</p>
          <ScoreDial score={TRUST.ONBOARDING} size="lg">
            <TierChip tier="silver" />
          </ScoreDial>
          <p className="text-center text-text-regular text-text-subtitle">
            Score and tiers climbs as you complete profile, studies, get ratings, win streaks, refer, and participate more!
          </p>
        </motion.div>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 bg-bgAlt-0 px-4 pb-6 pt-4">
        <Button variant="secondary" fullWidth onClick={() => go('/profile/edit')}>Complete Profile</Button>
        <Button fullWidth rightIcon={<ChevronRight className="h-5 w-5" />} onClick={() => go('/studies')}>
          Explore Studies
        </Button>
      </div>
    </div>
  )
}
