import { ChevronLeft, ChevronRight } from '../ui/icons'
import { cn } from '../../lib/cn'

/** The pager under the Recruited tables (1627:96535): ‹ 1 2 3 … 9 10 ›. */
export default function Pagination({ page = 1, pages = [1, 2, 3, '…', 9, 10], onPage }: {
  page?: number; pages?: (number | string)[]; onPage?: (p: number) => void
}) {
  const last = pages.filter((p): p is number => typeof p === 'number').pop()
  return (
    <nav className="flex items-center gap-2 pt-3" aria-label="Pagination">
      {/* On the first page there is nowhere back to go, and the page you are
          on is not a link; both say so rather than looking clickable. */}
      <button type="button" aria-label="Previous page" disabled={page <= 1}
        onClick={() => onPage?.(Math.max(1, page - 1))}
        className={cn('flex h-[38px] w-[38px] items-center justify-center rounded-sm border-1 border-stroke-input bg-bg',
          page <= 1 ? 'cursor-not-allowed text-text-disabled' : 'text-text-subtitle hover:text-text-title')}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => (
        typeof p === 'number' ? (
          p === page ? (
            <span key={i} aria-current="page"
              className="flex h-[38px] min-w-[38px] items-center justify-center rounded-full bg-cta-primary px-2 text-text-regular text-cta-primaryText">
              {p}
            </span>
          ) : (
            <button key={i} type="button" onClick={() => onPage?.(p)}
              className="flex h-[38px] min-w-[38px] items-center justify-center rounded-full px-2 text-text-regular text-text-title hover:bg-bg-1">
              {p}
            </button>
          )
        ) : (
          <span key={i} className="flex h-[38px] w-6 items-center justify-center text-text-regular text-text-subtitle">{p}</span>
        )
      ))}
      <button type="button" aria-label="Next page" disabled={last !== undefined && page >= last}
        onClick={() => onPage?.(page + 1)}
        className={cn('flex h-[38px] w-[38px] items-center justify-center rounded-sm border-1 border-stroke-input bg-bg',
          last !== undefined && page >= last ? 'cursor-not-allowed text-text-disabled' : 'text-text-subtitle hover:text-text-title')}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
