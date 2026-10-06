import { motion } from 'framer-motion'
import { useRef } from 'react'
import RollingNumber from '../components/motion/RollingNumber'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { PointsCoin } from '../components/ui/icons'
import { dateLong, points } from '../lib/format'
import { DUR, EASE, SPRING, fadeUp } from '../lib/motion'
import type { PointsEntry } from '../mock/types'

/** The reason pill's icon per points kind. */
function KindIcon({ kind }: { kind: PointsEntry['kind'] }) {
  if (kind === 'study') {
    return <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  }
  if (kind === 'streak') {
    return <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5.5 1.5 1.5 2 2 2 0-3 .5-5.5 1-7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  }
  return <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 19c0-3 2.7-5 6-5s6 2 6 5M17 6v6M20 9h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
}

const REASON: Record<PointsEntry['kind'], (e: PointsEntry) => string> = {
  referral: (e) => `For Referring ${e.detail}`,
  study: () => 'For Completing a Study',
  streak: () => 'For Your Monthly Streak',
  bonus: (e) => (e.detail === 'Joined by referral' ? 'For Being Referred' : `For ${e.detail}`),
}

/** Reward points earned, as drawn (Figma 1433:50642): coin, amount, reason pill, Done. */
export default function PointsEarned({ entry, onClose }: { entry: PointsEntry | null; onClose: () => void }) {
  const coin = useRef<HTMLSpanElement>(null)
  return (
    <Modal open={entry !== null} onClose={onClose} showClose={false} alt footer={<Button fullWidth onClick={onClose}>Done!</Button>}>
      {entry && (
        <motion.div initial="hidden" animate="shown" transition={{ staggerChildren: 0.09, delayChildren: DUR.base }}
          className="-mx-4 -mt-4 flex flex-col items-center gap-4 rounded-t-lg bg-green-glow px-4 pb-2 pt-8 text-center">
          <motion.span ref={coin} variants={{ hidden: { opacity: 0, scale: 0.4 }, shown: { opacity: 1, scale: 1, transition: SPRING.heavy } }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-900/60">
            <motion.span data-decor aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-brand-secondary"
              initial={{ opacity: 0.8, scale: 0.7 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: DUR.slow, ease: EASE.out, delay: DUR.base * 1.6 }} />
            {/* The coin turns over twice as it lands, like one being flipped into a hand. */}
            <motion.span initial={{ rotateY: 0 }} animate={{ rotateY: 720 }} style={{ transformPerspective: 400 }} transition={{ duration: DUR.slow * 1.4, ease: EASE.out, delay: DUR.base }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-600 bg-brand-secondary shadow-glow shadow-green-700">
              <PointsCoin className="h-9 w-9 text-brand-secondary [&>path]:stroke-bg-0" />
            </motion.span>
          </motion.span>
          <motion.p variants={fadeUp} className="text-title-s text-text-subtitle">You&apos;ve earned</motion.p>
          <motion.p variants={fadeUp} className="flex items-center gap-2 text-title-l text-brand-secondary">
            <PointsCoin className="h-6 w-6" />
            <RollingNumber value={entry.amount} from={0} format={points} delay={DUR.slow} /> <span className="text-text-title">Reward Points!</span>
          </motion.p>
          <motion.span variants={fadeUp} className="mt-2 flex items-center gap-3 rounded-full border-1 border-stroke-3 bg-bg-1/60 py-2 pl-2 pr-5 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-900/60 text-brand-secondary"><KindIcon kind={entry.kind} /></span>
            <span className="flex flex-col">
              <span className="text-body-medium text-text-title">{REASON[entry.kind](entry)}</span>
              <span className="text-text-regular text-text-body">{dateLong(entry.at)}</span>
            </span>
          </motion.span>
        </motion.div>
      )}
    </Modal>
  )
}
