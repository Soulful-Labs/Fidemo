import { feedback } from '../../lib/feedback'
import { CSS, TIER, play, settleTo } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'

/**
 * Locked things. Without PLAYFUL: a small sideways nudge. With it: one firmer
 * nudge (tier 2) and the locked haptic.
 */
export function rattle(el: Element | null | undefined) {
  if (!isPlayful()) {
    play(el, [{ transform: 'none' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], CSS.base, CSS.out)
    return
  }
  // Tier 2: one nudge against the lock and back, passing rest at most once.
  play(el, [{ transform: 'none' }, { transform: 'translateX(-6px)', offset: 0.35 }, { transform: 'translateX(2px)', offset: 0.7 }, { transform: 'none' }], TIER.changed.ms, CSS.out)
  feedback('locked')
}

/** PLAYFUL, tier 2: a lock giving way. The thing settles up into place once; nothing was earned, so no confetti. */
export function burstOpen(el: Element | null | undefined) {
  if (!el || !isPlayful()) return
  settleTo(el, { transform: 'scale(0.95)' })
  feedback('unlock')
}
