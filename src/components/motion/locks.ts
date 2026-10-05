import { feedback } from '../../lib/feedback'
import { CSS, play, springTo } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'
import { CONFETTI, fire } from './Confetti'

/**
 * Locked things. Without PLAYFUL: a small sideways nudge. With it: a wobble
 * and a rattle, the thing shaking on its hinges, and the rattle haptic.
 */
export function rattle(el: Element | null | undefined) {
  if (!isPlayful()) {
    play(el, [{ transform: 'none' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], CSS.base, CSS.out)
    return
  }
  play(el, [
    { transform: 'none' }, { transform: 'translateX(-7px) rotate(-4deg)' }, { transform: 'translateX(6px) rotate(3.5deg)' },
    { transform: 'translateX(-5px) rotate(-2.5deg)' }, { transform: 'translateX(4px) rotate(2deg)' },
    { transform: 'translateX(-2px) rotate(-1deg)' }, { transform: 'none' },
  ], CSS.slow * 0.8, 'linear')
  feedback('locked')
}

/** PLAYFUL: a lock giving way. The thing bursts open with a pop, a spring and a spray of confetti. */
export function burstOpen(el: Element | null | undefined) {
  if (!el || !isPlayful()) return
  const r = el.getBoundingClientRect()
  springTo(el, { transform: 'scale(1.18) rotate(-2deg)' }, 'bouncy')
  fire({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 22, colors: CONFETTI.brand, power: 620, spread: 2.4 })
  feedback('unlock')
}
