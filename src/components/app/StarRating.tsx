import { Star } from '../ui/icons'
import { cn } from '../../lib/cn'

export interface StarRatingProps {
  value: number
  onChange?: (next: number) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const SIZES = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const

/**
 * Five stars, read-only or tappable. Half values render as a half-filled
 * star on Client Ratings.
 */
export default function StarRating({ value, onChange, size = 'md', label }: StarRatingProps) {
  return (
    <span className={cn('inline-flex items-center', onChange ? 'gap-2' : 'gap-0.5')} role={onChange ? 'radiogroup' : 'img'} aria-label={label ?? `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n
        const half = !filled && value >= n - 0.5
        const star = (
          <span className="relative inline-flex">
            <Star filled={filled} className={cn(SIZES[size], filled ? 'text-brand-primary' : 'text-text-disabled')} />
            {half && (
              <span className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className={cn(SIZES[size], 'text-brand-primary')} />
              </span>
            )}
          </span>
        )
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)}>
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        )
      })}
    </span>
  )
}
