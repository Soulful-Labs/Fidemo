import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { SortIcon } from './icons'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right'
  width?: string
  render: (row: T) => ReactNode
}

/** The list table drawn on Studies, Payments and Support Tickets. */
export default function Table<T extends { id: string }>({
  columns, rows, onRowClick, empty,
}: { columns: Column<T>[]; rows: T[]; onRowClick?: (row: T) => void; empty?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border-1 border-stroke-input bg-bg">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b-1 border-stroke-input bg-bg-1">
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}
                className={cn('px-4 py-3 text-text-medium font-medium text-text-subtitle', c.align === 'right' && 'text-right')}>
                <span className="inline-flex items-center gap-1">
                  {c.header}
                  {c.sortable && <SortIcon className="h-4 w-4 text-text-body" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('border-b-1 border-stroke-input last:border-b-0', onRowClick && 'cursor-pointer hover:bg-bg-1')}>
              {columns.map((c) => (
                <td key={c.key} className={cn('px-4 py-3.5 text-text-regular text-text-title', c.align === 'right' && 'text-right')}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="px-4 py-10 text-center text-text-regular text-text-body">{empty ?? 'Nothing here yet'}</div>}
    </div>
  )
}
