import { feedback } from '../../lib/feedback'
import { CSS, TIER, play, settleTo } from '../../lib/motion'

/**
 * Locked things: one firm nudge (tier 2) and the locked haptic.
 */
export function rattle(el: Element | null | undefined) {
  // Tier 2: one nudge against the lock and back, passing rest at most once.
  play(el, [{ transform: 'none' }, { transform: 'translateX(-6px)', offset: 0.35 }, { transform: 'translateX(2px)', offset: 0.7 }, { transform: 'none' }], TIER.changed.ms, CSS.out)
  feedback('locked')
}

/** Tier 2: a lock giving way. The thing settles up into place once; nothing was earned, so no confetti. */
export function burstOpen(el: Element | null | undefined) {
  if (!el) return
  settleTo(el, { transform: 'scale(0.95)' })
  feedback('unlock')
}
