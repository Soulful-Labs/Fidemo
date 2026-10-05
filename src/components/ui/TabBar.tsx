import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { SPRING } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'
import { feedback } from '../../lib/feedback'

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

// The selected fill and underline are drawn by Indicator, which slides between tabs.
const SEGMENT_ON = 'text-text-title'
const SEGMENT_OFF = 'text-text-subtitle hover:text-text-title'
const BOX_ON = 'border-cta-primary bg-yellow-1000/40 text-brand-primary'
const BOX_OFF = 'border-stroke-3 text-text-title hover:border-cta-tertiaryStroke'
const UNDER_ON = 'text-text-title border-transparent'
const UNDER_OFF = 'text-text-body border-transparent hover:text-text-title'

/** The selected fill (segmented) or underline, sliding to whichever tab is selected. */
function Indicator({ id, segmented }: { id: string; segmented: boolean }) {
  return (
    <motion.span layoutId={id} transition={isPlayful() ? SPRING.bouncy : SPRING.soft} aria-hidden="true"
      className={segmented ? 'absolute inset-0 -z-10 rounded-md bg-green-segment' : 'absolute inset-x-0 -bottom-0.5 h-0.5 bg-cta-primary'} />
  )
}

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
    segmented && 'gap-1 rounded-md bg-bg-1 p-1',
    boxes && 'gap-2',
    variant === 'underline' && 'gap-1 border-b-1 border-stroke-3',
    scrollable && 'overflow-x-auto',
    className,
  )

  const itemClass = (active: boolean) =>
    cn(
      'relative isolate flex items-center justify-center gap-1 whitespace-nowrap transition-colors',
      segmented && cn('h-10 flex-1 rounded-md px-4 text-body-medium', active ? SEGMENT_ON : SEGMENT_OFF),
      boxes && cn('h-input flex-1 rounded-md border-1 px-3 text-body-regular', active ? BOX_ON : BOX_OFF),
      variant === 'underline' && cn('h-12 px-4 text-text-medium border-b-2', active ? UNDER_ON : UNDER_OFF),
    )

  // Shared by every TabBar showing the same tabs, so the Explore / My Studies /
  // Saved fill slides across even though each is its own screen.
  const group = items.map((i) => i.key).join('|')

  const label = (item: TabItem, on: boolean) => (
    <>
      {on && !boxes && <Indicator id={`tab-${variant}-${group}`} segmented={segmented} />}
      {item.label}
      {item.count != null && <span className="text-label opacity-70">({item.count})</span>}
    </>
  )

  return (
    <nav className={shell} role="tablist">
      {items.map((item) =>
        item.to ? (
          <NavLink key={item.key} to={item.to} end className={({ isActive }) => itemClass(isActive)}>
            {({ isActive }) => label(item, isActive)}
          </NavLink>
        ) : (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={value === item.key}
            onClick={() => { if (isPlayful() && value !== item.key) feedback('select'); onChange?.(item.key) }}
            className={itemClass(value === item.key)}
          >
            {label(item, value === item.key)}
          </button>
        ),
      )}
    </nav>
  )
}
