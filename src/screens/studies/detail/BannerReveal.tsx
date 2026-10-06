import { motion } from 'framer-motion'
import { feedback } from '../../../lib/feedback'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Burst } from '../../../components/motion/Particles'
import { useSeenKey } from '../../../components/motion/useSeen'
import { DUR, EASE, SPRING } from '../../../lib/motion'
import { lastSeen, markSeen } from '../../../lib/seen'
import type { StudyStatus } from '../../../mock/types'

/** How a status is revealed when it is new to the person (moment G and the earned half of F). */
const KIND: Partial<Record<StudyStatus | 'late_show' | 'not_needed', 'qualified' | 'earned' | 'calm'>> = {
  invited_to_schedule: 'qualified',
  invited_to_complete: 'qualified',
  paid: 'earned',
  not_needed: 'earned',
  // Not a win, never a failure animation: these settle in slowly and quietly.
  rejected: 'calm',
  no_show: 'calm',
  late_show: 'calm',
}

/** Stable numbers for the seen-memory, which stores numbers only. */
const ORDER = ['available', 'invited_to_apply', 'applying', 'draft', 'applied', 'invited_to_schedule', 'invited_to_complete',
  'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed']

/**
 * Wraps the status card. The first time a study is seen in a new status, the
 * card reveals that status in its own register: a qualification pops in and a
 * band of light crosses it; a payment pops its earned line and throws a small
 * burst; a rejection or no show settles in, slowly, with no overshoot. A
 * status already seen just appears.
 */
export function useBannerReveal(studyId: string | undefined, status: string) {
  const key = useSeenKey(studyId ? `banner-${studyId}` : undefined)
  const code = ORDER.indexOf(status)
  const fresh = useRef<boolean | null>(null)
  if (fresh.current === null) fresh.current = Boolean(key) && lastSeen(key!) !== code
  if (key && fresh.current) queueMicrotask(() => markSeen(key, code))
  const kind = fresh.current ? KIND[status as StudyStatus] : undefined
  return kind
}

export function RevealCard({ kind, className, children }: { kind: ReturnType<typeof useBannerReveal>; className: string; children: ReactNode }) {
  const glint = useRef<HTMLSpanElement>(null)
  const from = kind === 'calm' ? { opacity: 0, y: 8 } : kind ? { opacity: 0, scale: 0.94, y: 6 } : { opacity: 0 }
  const transition = kind === 'calm' ? { duration: DUR.slow, ease: EASE.out }
    : kind ? SPRING.snappy : { duration: DUR.fast, ease: EASE.out }

  return (
    <motion.div initial={from} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...transition, delay: kind ? DUR.fast : 0 }}
      onAnimationComplete={() => { if (kind === 'qualified' || kind === 'earned') feedback(kind === 'earned' ? 'celebrate' : 'gain') }}
      className={className + (kind === 'qualified' ? ' relative overflow-hidden' : kind === 'earned' ? ' relative' : '')}>
      {children}
      {kind === 'qualified' && (
        <motion.span ref={glint} data-decor aria-hidden="true" initial={{ x: '-120%' }} animate={{ x: '420%' }}
          transition={{ duration: DUR.slow * 1.4, ease: EASE.inOut, delay: DUR.base * 1.5 }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-linear-to-r from-transparent via-text-title/15 to-transparent" />
      )}
      {kind === 'earned' && (
        <span className="pointer-events-none absolute left-8 top-6">
          <Burst delay={DUR.base * 1.4 + DUR.slow * 0.6} />
        </span>
      )}
    </motion.div>
  )
}

/** The earned line on a newly paid banner pops after the card has arrived. */
export function EarnedLine({ kind, className, children }: { kind: ReturnType<typeof useBannerReveal>; className: string; children: ReactNode }) {
  if (kind !== 'earned') return <p className={className}>{children}</p>
  return (
    <motion.p initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING.snappy, delay: DUR.base * 1.4 }} className={className + ' origin-left'}>
      {children}
    </motion.p>
  )
}
