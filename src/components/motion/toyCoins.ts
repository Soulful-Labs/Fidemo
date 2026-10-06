import { feedback } from '../../lib/feedback'
import { around } from '../../lib/motion'
import { CONFETTI, fire } from './Confetti'

/**
 * Toy: tapping a points badge squashes it and pops a few coins out
 * that fall and land. Every time. Pure play; nothing in the account changes.
 */
export function popCoins(e: React.PointerEvent<Element>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  // Subtle: a small dip and three little coins that hop out and drop.
  around(el, { transform: 'scale(0.95)' })
  fire({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 3, colors: CONFETTI.coins, shapes: ['coin'], power: 380, spread: 0.9 })
  feedback('toy')
}
