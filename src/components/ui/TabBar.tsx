import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

export interface TabItem {
  key: string
  label: string
  count?: number
  /** When set the tab is a route link; otherwise it is controlled via onChange. */
  to?: string
}

export interface TabBarProps {
  items: TabItem[]
  /** Controlled selection, used when items have no `to`. */
  value?: string
  onChange?: (key: string) => void
  /** `boxes` = equal outlined boxes (Gender). */
  variant?: 'segmented' | 'underline' | 'boxes'
  /** Sub-tab rows (My Studies has five) scroll sideways. */
  scrollable?: boolean
  className?: string
}

const SEGMENT_ON = 'bg-cta-primary text-cta-primaryText'
const SEGMENT_OFF = 'text-text-body hover:text-text-title'
const BOX_ON = 'border-cta-primary bg-yellow-1000/40 text-brand-primary'
const BOX_OFF = 'border-stroke-3 text-text-title hover:border-cta-tertiaryStroke'
const UNDER_ON = 'text-text-title border-cta-primary'
const UNDER_OFF = 'text-text-body border-transparent hover:text-text-title'

export default function TabBar({
  items,
  value,
  onChange,
  variant = 'segmented',
  scrollable = false,
  className,
}: TabBarProps) {
  const segmented = variant === 'segmented'
  const boxes = variant === 'boxes'

  const shell = cn(
    'flex items-center',
    segmented && 'gap-1 rounded-full border-1 border-stroke-3 bg-bg-1 p-1',
    boxes && 'gap-2',
    variant === 'underline' && 'gap-1 border-b-1 border-stroke-3',
    scrollable && 'overflow-x-auto',
    className,
  )

  const itemClass = (active: boolean) =>
    cn(
      'flex items-center justify-center gap-1 whitespace-nowrap transition-colors',
      segmented && cn('h-btn-sm flex-1 rounded-full px-4 text-text-medium', active ? SEGMENT_ON : SEGMENT_OFF),
      boxes && cn('h-input flex-1 rounded-md border-1 px-3 text-body-regular', active ? BOX_ON : BOX_OFF),
      variant === 'underline' && cn('h-12 px-4 text-text-medium border-b-2', active ? UNDER_ON : UNDER_OFF),
    )

  const label = (item: TabItem) => (
    <>
      {item.label}
      {item.count != null && <span className="text-label opacity-70">({item.count})</span>}
    </>
  )

  return (
    <nav className={shell} role="tablist">
      {items.map((item) =>
        item.to ? (
          <NavLink key={item.key} to={item.to} end className={({ isActive }) => itemClass(isActive)}>
            {label(item)}
          </NavLink>
        ) : (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={value === item.key}
            onClick={() => onChange?.(item.key)}
            className={itemClass(value === item.key)}
          >
            {label(item)}
          </button>
        ),
      )}
    </nav>
  )
}
