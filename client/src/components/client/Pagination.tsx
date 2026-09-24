import { ChevronLeft, ChevronRight } from '../ui/icons'
import { cn } from '../../lib/cn'

/** The pager under the Recruited tables (1627:96535): ‹ 1 2 3 … 9 10 ›. */
export default function Pagination({ page = 1, pages = [1, 2, 3, '…', 9, 10], onPage }: {
  page?: number; pages?: (number | string)[]; onPage?: (p: number) => void
}) {
  return (
    <nav className="flex items-center gap-2 pt-3" aria-label="Pagination">
      <button type="button" aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => (
        typeof p === 'number' ? (
          <button key={i} type="button" onClick={() => onPage?.(p)}
            className={cn('flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-text-regular',
              p === page ? 'bg-cta-primary text-cta-primaryText' : 'text-text-title hover:bg-bg-1')}>
            {p}
          </button>
        ) : (
          <span key={i} className="flex h-9 w-6 items-center justify-center text-text-regular text-text-subtitle">{p}</span>
        )
      ))}
      <button type="button" aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
