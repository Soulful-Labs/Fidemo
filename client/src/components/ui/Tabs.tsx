import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

export interface TabItem { key: string; label: string; to?: string }

/**
 * Two tab treatments are drawn in the client file:
 * `underline` for the study tabs (Overview, Manage Study, Matched, …) and
 * `segmented` for the pill pairs (Matched / Invited, Ongoing / Drafts / Completed).
 */
export default function Tabs({
  items, value, onChange, variant = 'underline', className,
}: { items: TabItem[]; value?: string; onChange?: (key: string) => void; variant?: 'underline' | 'segmented'; className?: string }) {
  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex items-center gap-1 rounded-sm bg-bg-1 p-1', className)} role="tablist">
        {items.map((t) => {
          const on = t.key === value
          const inner = cn('flex h-btn items-center rounded-sm px-4 text-text-medium transition-colors', on ? 'bg-bgAlt-2 text-green-700' : 'text-text-subtitle hover:text-text-title')
          return t.to
            ? <NavLink key={t.key} to={t.to} role="tab" aria-selected={on} className={inner}>{t.label}</NavLink>
            : <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onChange?.(t.key)} className={inner}>{t.label}</button>
        })}
      </div>
    )
  }
  return (
    <div className={cn('flex items-center gap-6 border-b-1 border-stroke-input', className)} role="tablist">
      {items.map((t) => {
        const on = t.key === value
        const inner = cn('-mb-px border-b-2 px-1 pb-3 text-text-medium transition-colors', on ? 'border-cta-primary text-brand-primary' : 'border-transparent text-text-subtitle hover:text-text-title')
        return t.to
          ? <NavLink key={t.key} to={t.to} role="tab" aria-selected={on} className={inner}>{t.label}</NavLink>
          : <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onChange?.(t.key)} className={inner}>{t.label}</button>
      })}
    </div>
  )
}
