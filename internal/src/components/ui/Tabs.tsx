import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface TabItem { key: string; label: ReactNode; count?: number | string }

/**
 * The underline "Tabs" component (1869:66618, 1162 x 42): 16px-padded labels
 * in Body 16, text-body when idle and brand-primary when active, a 1px
 * brand-primary underline the width of the active tab over a 1px stroke-input
 * baseline. A count sits in a 24px pill: filled bgAlt-2 when active, a
 * stroke-input ring when not.
 */
export function UnderlineTabs({ items, value, onChange, className }: { items: TabItem[]; value: string; onChange?: (k: string) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('flex h-[42px] border-b-1 border-stroke-input', className)}>
      {items.map((t) => {
        const on = t.key === value
        return (
          <button key={t.key} role="tab" type="button" aria-selected={on} onClick={() => onChange?.(t.key)}
            className={cn('-mb-px flex items-center gap-2 border-b-1 px-4 text-body-regular',
              on ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-body hover:text-text-subtitle')}>
            {t.label}
            {t.count !== undefined && (
              <span className={cn('flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-text-regular text-text-title',
                on ? 'bg-bgAlt-2' : 'border-1 border-stroke-input')}>{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * The segmented "Tab-premitives" group (Studies: 380 x 48): a bgAlt-2 track
 * with Radius/M and 4px padding; the active segment is a green-200 pill 40
 * tall; labels Body 16, title when active, subtitle when not.
 */
export function SegmentedTabs({ items, value, onChange, className, segmentClassName }: {
  items: TabItem[]; value: string; onChange?: (k: string) => void; className?: string; segmentClassName?: string
}) {
  return (
    <div role="tablist" className={cn('inline-flex h-12 items-center gap-0 rounded-md bg-bgAlt-2 p-1', className)}>
      {items.map((t) => {
        const on = t.key === value
        return (
          <button key={t.key} role="tab" type="button" aria-selected={on} onClick={() => onChange?.(t.key)}
            className={cn('flex h-10 min-w-[120px] items-center justify-center rounded-sm px-4 text-body-regular',
              on ? 'bg-green-200 text-text-title' : 'text-text-subtitle hover:text-text-title', segmentClassName)}>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
