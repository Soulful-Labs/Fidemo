import { feedback } from '../../lib/feedback'
import { springTo } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'
import { CONFETTI, fire } from './Confetti'

/**
 * PLAYFUL toy: tapping a points badge squashes it and pops a few coins out
 * that fall and land. Every time. Pure play; nothing in the account changes.
 */
export function popCoins(e: React.PointerEvent<Element>) {
  if (!isPlayful()) return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  springTo(el, { transform: 'scale(0.82, 1.12)' }, 'bouncy')
  fire({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 7, colors: CONFETTI.coins, shapes: ['coin'], power: 780, spread: 1.1 })
  feedback('toy')
}
