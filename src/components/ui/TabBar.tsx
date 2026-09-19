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
  variant?: 'segmented' | 'underline'
  /** Sub-tab rows (My Studies has five) scroll sideways. */
  scrollable?: boolean
  className?: string
}

const SEGMENT_ON = 'bg-cta-primary text-cta-primaryText'
const SEGMENT_OFF = 'text-text-body hover:text-text-title'
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

  const shell = cn(
    'flex items-center gap-1',
    segmented ? 'rounded-full border-1 border-stroke-3 bg-bg-1 p-1' : 'border-b-1 border-stroke-3',
    scrollable && 'overflow-x-auto',
    className,
  )

  const itemClass = (active: boolean) =>
    cn(
      'flex items-center justify-center gap-1 whitespace-nowrap transition-colors',
      segmented
        ? cn('h-btn-sm flex-1 rounded-full px-4 text-text-medium', active ? SEGMENT_ON : SEGMENT_OFF)
        : cn('h-12 px-4 text-text-medium border-b-2', active ? UNDER_ON : UNDER_OFF),
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
