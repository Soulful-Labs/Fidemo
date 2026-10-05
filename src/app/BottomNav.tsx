import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { feedback } from '../lib/feedback'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'
import { SPRING, springTo } from '../lib/motion'
import { isPlayful, usePlayful } from '../lib/playful'
import { TABS, activeTab } from './navigation'

/**
 * The four fixed tabs, 85px tall, as drawn in Figma: rounded top corners, a
 * hairline, and the active tab sitting on a soft yellow tint.
 *
 * Uses Link rather than NavLink deliberately: a tab owns routes that do not
 * share its path (Wallet owns /points, Profile owns /trust-score and /support),
 * which NavLink's own matching cannot express, and NavLink would overwrite the
 * aria-current we set from activeTab.
 */
export default function BottomNav({ pathname, alt = false }: { pathname: string; alt?: boolean }) {
  const active = activeTab(pathname)
  const playful = usePlayful()
  const icons = useRef(new Map<string, HTMLSpanElement | null>())
  const last = useRef(active)
  // PLAYFUL: the newly selected tab's icon squashes and bounces back up, with a selection tick.
  useEffect(() => {
    if (last.current === active) return
    last.current = active
    if (!playful || !active) return
    springTo(icons.current.get(active), { transform: 'translateY(5px) scale(1.4, 0.6)' }, 'bouncy')
    feedback('select')
  }, [active, playful])

  return (
    <nav className={cn('flex h-nav shrink-0 items-start gap-2 rounded-t-xl border-t-1 border-stroke-3 px-2 pt-2', alt ? 'bg-bgAlt-0' : 'bg-bg-0')}>
      {TABS.map((tab) => {
        const isActive = active === tab.key
        return (
          <Link
            key={tab.key}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative isolate flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors',
              isActive ? 'text-brand-primary' : 'text-text-subtitle hover:text-text-title',
            )}
          >
            {/* The tint slides from tab to tab. */}
            {isActive && <motion.span layoutId="nav-tint" transition={isPlayful() ? SPRING.bouncy : SPRING.soft} aria-hidden="true" className="absolute inset-0 -z-10 rounded-lg bg-yellow-1000/40" />}
            {playful ? <span ref={(el) => { icons.current.set(tab.key, el) }} className="flex"><tab.Icon /></span> : <tab.Icon />}
            <span className="text-text-regular">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
