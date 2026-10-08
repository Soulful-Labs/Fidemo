import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ChevronLeft, ChevronRight, SortIcon } from './icons'

export interface Column<T> {
  key: string
  header: ReactNode
  width?: number | string
  sortable?: boolean
  render: (row: T) => ReactNode
  className?: string
}

/**
 * The list table, measured on Studies (1978:97400): a 1px stroke-2 box
 * with Radius/L; a 52px header row on bg-1 in Text-Regular subtitle with the
 * 16px "sort-arrow" after sortable heads; body rows 64 tall with a 1px
 * stroke-1 rule between them; cells padded 16px. Column widths are the
 * frame's, passed per table.
 */
export default function Table<T>({ columns, rows, rowKey, onRowClick, rowHeight = 64, className, highlight }: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; rowHeight?: number; className?: string
  /** A row drawn in its hover state (bgAlt-1), as the Studies frames draw their second row. */
  highlight?: string
}) {
  const widths = columns.map((c) => (typeof c.width === 'number' ? `${c.width}px` : c.width ?? '1fr')).join(' ')
  return (
    <div role="table" className={cn('overflow-hidden rounded-lg border-1 border-stroke-2 bg-bg-0', className)}>
      <div role="row" className="grid h-[52px] items-center bg-bg-1" style={{ gridTemplateColumns: widths }}>
        {columns.map((c) => (
          <div role="columnheader" key={c.key} className={cn('flex items-center gap-1 px-4 text-text-regular text-text-subtitle', c.className)}>
            {c.header}{c.sortable && <SortIcon className="h-4 w-4 text-text-body" />}
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div role="row" key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined}
          className={cn('grid items-center border-t-1 border-stroke-1', onRowClick && 'cursor-pointer hover:bg-bgAlt-1', rowKey(r) === highlight && 'bg-bgAlt-1')}
          style={{ gridTemplateColumns: widths, height: rowHeight }}>
          {columns.map((c) => (
            <div role="cell" key={c.key} className={cn('min-w-0 px-4 text-text-regular text-text-title', c.className)}>{c.render(r)}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * "Pagination List" (217 x 38): 38px squares. Arrows carry a 1px
 * cta-tertiaryStroke ring; page numbers are bare Body 16; the current page is
 * filled yellow-300; an ellipsis stands in for the gap.
 */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange?: (p: number) => void }) {
  const list: (number | '…')[] = pages <= 6 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, 2, 3, '…', pages - 1, pages]
  const sq = 'flex h-[38px] min-w-[38px] items-center justify-center rounded-sm px-2 text-body-regular text-text-title'
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button type="button" aria-label="Previous page" onClick={() => onChange?.(Math.max(1, page - 1))} className={cn(sq, 'border-1 border-cta-tertiaryStroke')}><ChevronLeft className="h-5 w-5" /></button>
      {list.map((p, i) => p === '…'
        ? <span key={`e${i}`} className="px-1 text-body-regular text-text-title">…</span>
        : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange?.(p)} className={cn(sq, p === page && 'bg-yellow-300')}>{p}</button>)}
      <button type="button" aria-label="Next page" onClick={() => onChange?.(Math.min(pages, page + 1))} className={cn(sq, 'border-1 border-cta-tertiaryStroke')}><ChevronRight className="h-5 w-5" /></button>
    </nav>
  )
}
