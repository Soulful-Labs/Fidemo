import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

export interface TabItem { key: string; label: string; to?: string; /** Drawn greyed, as the study tabs are while a study is paused. */ muted?: boolean }

/**
 * Two tab treatments are drawn in the client file:
 * `underline` for the study tabs (Overview, Manage Study, Matched, …) and
 * `segmented` for the pill pairs (Matched / Invited, Ongoing / Drafts / Completed).
 */
export default function Tabs({
  items, value, onChange, variant = 'underline', className,
}: { items: TabItem[]; value?: string; onChange?: (key: string) => void; variant?: 'underline' | 'segmented'; className?: string }) {
  if (variant === 'segmented') {
    /**
     * Measured off every segmented toggle in the file: the track is a fixed
     * width per instance and its segments divide it equally, 4px of padding
     * around a 40px pill. The segments were a hardcoded 112px, which is why
     * "Participants Pool" wrapped to two lines inside its pill instead of
     * sitting on one, centred. `flex-1` and `whitespace-nowrap` fix it for
     * every toggle at once; the caller gives the track its width.
     */
    return (
      <div className={cn('inline-flex items-center rounded-full bg-bgAlt-2 p-1', className)} role="tablist">
        {items.map((t) => {
          const on = t.key === value
          const inner = cn('flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full px-2 text-body-regular transition-colors', on ? 'bg-green-200 text-text-title' : 'text-text-subtitle hover:text-text-title')
          return t.to
            ? <NavLink key={t.key} to={t.to} role="tab" aria-selected={on} className={inner}>{t.label}</NavLink>
            : <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onChange?.(t.key)} className={inner}>{t.label}</button>
        })}
      </div>
    )
  }
  /*
   * Same geometry as the study tab bar (1627:96023): 40px tabs flush against
   * each other with 16px of their own padding, 16px text sitting 2px above
   * the tab's centre, and #9d9d9d when inactive. It was drawn with a 24px gap
   * and 4px of padding, which put the underline and every label off.
   */
  return (
    <div className={cn('flex items-end border-b-1 border-neutral-500', className)} role="tablist">
      {items.map((t) => {
        const on = t.key === value
        const inner = cn('-mb-px flex h-10 items-center border-b-1 px-4 pb-1 text-body-regular transition-colors',
          on ? 'border-cta-primary text-brand-primary'
            : t.muted ? 'border-transparent text-text-disabled'
              : 'border-transparent text-text-body hover:text-text-title')
        return t.to
          ? <NavLink key={t.key} to={t.to} role="tab" aria-selected={on} className={inner}>{t.label}</NavLink>
          : <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onChange?.(t.key)} className={inner}>{t.label}</button>
      })}
    </div>
  )
}
