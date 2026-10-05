import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { DUR, SPRING } from '../../lib/motion'
import { Check } from '../ui/icons'

/**
 * The big tick used on every success screen and sheet: a brand circle inside
 * a faint halo (Figma 1265:83738). `tone` switches the circle to green for
 * verification screens such as Welcome.
 *
 * The tick pops in a beat after the badge appears, wherever the badge is used.
 * `delay` holds it back further when the badge itself is still landing.
 */
export default function SuccessBadge({
  tone = 'brand',
  className,
  delay = DUR.fast,
}: { tone?: 'brand' | 'success'; className?: string; delay?: number }) {
  return (
    <span
      className={cn(
        'flex h-halo w-halo items-center justify-center rounded-full',
        tone === 'brand' ? 'bg-yellow-1000/40' : 'bg-green-900/40',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full text-text-title',
          tone === 'brand' ? 'bg-brand-primary' : 'bg-state-success',
        )}
      >
        <motion.span initial={{ opacity: 0, scale: 0.3, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...SPRING.snappy, delay }} className="flex">
          <Check className="h-10 w-10" />
        </motion.span>
      </span>
    </span>
  )
}
