import { motion } from 'framer-motion'
import { feedback } from '../../lib/feedback'
import { isPlayful, usePlayful } from '../../lib/playful'
import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { DUR, EASE, SPRING, STAGGER, AROUND, CHANGED } from '../../lib/motion'
import CoinRain from '../motion/CoinRain'
import { Burst, burst } from '../motion/Particles'
import { CONFETTI } from '../motion/Confetti'
import Button from '../ui/Button'
import CtaBar from '../ui/CtaBar'
import { Check } from '../ui/icons'
import SuccessBadge from './SuccessBadge'

export interface SuccessScreenProps {
  title: string
  body?: ReactNode
  /** Ticked lines under the body, the first one highlighted (Figma 919:74342). */
  steps?: string[]
  children?: ReactNode
  actionLabel?: string
  onAction: () => void
  alt?: boolean
  /** Replaces the green tick, e.g. the brand badge for a neutral outcome. */
  badge?: ReactNode
  /**
   * How the result arrives. `win` (moment F): the badge lands with weight and
   * throws a small burst, then the rest follows. `calm` (moment G, a result
   * that is not a win): everything settles in slowly, no overshoot, no burst.
   * `money` (moment H): lands like `win`, then coins drop into the badge.
   */
  mood?: 'win' | 'calm' | 'money'
  /**
   * PLAYFUL only: 3 (default) when something was earned, 2 when something just
   * changed (applied, scheduled, a withdrawal requested). Tier 2 arrives with one
   * small settle: no burst, no coins, no landing thud. Without PLAYFUL it is ignored.
   */
  tier?: 2 | 3
}

/**
 * The full-screen success state shared by Applied successfully!, Scheduled,
 * PIN confirmed, Completed successfully!, Withdrawal and Redeemed: the green
 * tick in its halo, a title, body and the Done button in the CTA bar.
 */
export default function SuccessScreen({
  title, body, steps, children, actionLabel = 'Done', onAction, alt = false, badge, mood = 'win', tier = 3,
}: SuccessScreenProps) {
  const changed = usePlayful() && tier === 2
  const win = !changed && mood !== 'calm'
  const money = !changed && mood === 'money'
  const purse = useRef<HTMLDivElement>(null)
  const sparks = useMemo(() => burst(14, 7, [60, 110], 0.2), [])
  useEffect(() => { if (win) { const t = window.setTimeout(() => feedback(isPlayful() && mood === 'money' ? 'gain' : 'land'), DUR.base * 1000); return () => window.clearTimeout(t) } }, [win])

  const arrive = win
    ? { hidden: { opacity: 0, scale: 0.4, y: -40 }, shown: { opacity: 1, scale: 1, y: 0, transition: SPRING.heavy } }
    : changed
      // Tier 2: the badge settles in once and that is all.
      ? { hidden: { opacity: 0, scale: 0.92 }, shown: { opacity: 1, scale: 1, transition: CHANGED } }
      : { hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } } }
  const follow = {
    hidden: { opacity: 0, y: win ? 14 : changed ? 4 : 8 },
    shown: { opacity: 1, y: 0, transition: changed ? AROUND : { duration: win ? DUR.base : DUR.slow, ease: EASE.out } },
  }
  const after = win ? DUR.slow * 0.6 : changed ? DUR.fast : DUR.base

  return (
    <div className={cn('flex min-h-full flex-col', alt ? 'bg-bgAlt-0' : 'bg-bg-0', 'bg-green-fade')}>
      <motion.div initial="hidden" animate="shown" transition={{ staggerChildren: win ? STAGGER * 2 : STAGGER * 3, delayChildren: after }}
        className="flex flex-1 flex-col items-center gap-6 px-4 pb-6 pt-12 text-center">
        <motion.div ref={purse} variants={arrive} transition={{ delay: 0 }} className="relative">
          {win && !money && <Burst particles={sparks} delay={DUR.base * 0.8} palette={CONFETTI.green} tones={['text-state-success', 'text-brand-primary', 'text-text-title']} />}
          {badge ?? <SuccessBadge tone="success" delay={win ? DUR.base : DUR.slow} />}
          {/* Drawn over the badge, so each coin is seen going in. */}
          {money && <CoinRain target={purse} delay={DUR.slow} />}
        </motion.div>
        <motion.div variants={follow} className="flex flex-col gap-2">
          <h1 className="text-title-l text-text-title">{title}</h1>
          {body && <p className="text-body-regular text-text-body">{body}</p>}
        </motion.div>

        {steps && (
          <motion.ul variants={follow} transition={{ staggerChildren: STAGGER * 3, delayChildren: DUR.fast }}
            className="flex w-full flex-col gap-3 rounded-lg bg-bg-1 p-4 text-left">
            {steps.map((step, i) => (
              <motion.li key={step} variants={follow} className="flex items-start gap-3">
                <motion.span
                  variants={i === 0 && win ? { hidden: { scale: 0.3, opacity: 0 }, shown: { scale: 1, opacity: 1, transition: SPRING.snappy } } : follow}
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-1',
                    i === 0 ? 'border-brand-primary bg-brand-primary text-cta-primaryText' : 'border-text-disabled text-text-disabled',
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.span>
                <span className="text-text-regular text-text-subtitle">{step}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {children}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.base, ease: EASE.out, delay: after + DUR.base }} className="sticky bottom-0 z-20 shrink-0">
        <CtaBar alt={alt}>
          <Button fullWidth onClick={onAction}>{actionLabel}</Button>
        </CtaBar>
      </motion.div>
    </div>
  )
}
