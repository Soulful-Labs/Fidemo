import { cn } from '../../lib/cn'
import { Check } from '../ui/icons'

/**
 * The big tick used on every success screen and sheet: a brand circle inside
 * a faint halo (Figma 1265:83738). `tone` switches the circle to green for
 * verification screens such as Welcome.
 */
export default function SuccessBadge({
  tone = 'brand',
  className,
}: { tone?: 'brand' | 'success'; className?: string }) {
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
        <Check className="h-10 w-10" />
      </span>
    </span>
  )
}
