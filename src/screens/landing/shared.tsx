import { animate, useInView } from 'framer-motion'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { DUR, EASE, rollDuration } from '../../lib/motion'

/** Lets a section tell the page it is the one in front, for the progress segments and the pinned actions. */
export const LandingCtx = createContext<(id: string) => void>(() => undefined)

const SectionCtx = createContext({ seen: false, live: false })
/** `seen` turns true once, when the section first comes into view; `live` follows whether it is on screen now. */
export const useSection = () => useContext(SectionCtx)

/**
 * Arrival order for a piece of a section (landing.css, "Arrivals"): `i` is its
 * place in the stagger, `d` an extra delay in milliseconds.
 */
export const at = (i: number, d = 0) => ({ '--i': i, '--d': `${d}ms` }) as CSSProperties

/**
 * One screen of the page: as tall as the frame, edge to edge, and a snap
 * point. Its `ld-in` pieces arrive the first time it comes into view.
 */
export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { amount: 0.35, once: true })
  const live = useInView(ref, { amount: 0.02 })
  const front = useInView(ref, { amount: 0.5 })
  const setActive = useContext(LandingCtx)
  useEffect(() => { if (front) setActive(id) }, [front, id, setActive])
  return (
    <section ref={ref} data-section={id} data-seen={seen} data-live={live}
      className={cn('relative flex min-h-[var(--screen)] snap-start flex-col overflow-hidden', className)}>
      <SectionCtx.Provider value={{ seen, live }}>{children}</SectionCtx.Provider>
    </section>
  )
}

/**
 * Section headings: the app's big type, landing with weight as one piece. (Only
 * the hero lands word by word: a section arrives while the page is moving, and
 * one layer per heading keeps that scroll smooth on a slow phone.)
 */
export function Heading({ children, i = 0, className }: { children: string; i?: number; className?: string }) {
  return <h2 style={at(i)} className={cn('ld-in ld-slam origin-bottom-left px-4 text-display-s text-text-title', className)}>{children}</h2>
}

export function Lead({ children, i = 4, className }: { children: ReactNode; i?: number; className?: string }) {
  return <p style={at(i)} className={cn('ld-in px-4 text-title-s text-text-body', className)}>{children}</p>
}

/** Counts up to a real figure when its section is first seen. At rest, and under reduced motion, it simply is the figure. */
export function CountUp({ to, format = String, className }: { to: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { seen } = useSection()
  useEffect(() => {
    if (!seen) return
    const run = animate(0, to, {
      duration: rollDuration(to), ease: EASE.out, delay: DUR.base,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = format(Math.round(v)) },
    })
    return () => run.stop()
  }, [seen, to, format])
  return <span ref={ref} className={cn('tabular-nums', className)}>{format(to)}</span>
}

/** A coin, drawn: used wherever money is shown arriving. */
export function Coin({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <span className={cn('ld-coin flex items-center justify-center rounded-full bg-brand-primary font-semibold text-yellow-1000', className)}>
      {children ?? '$'}
    </span>
  )
}

/** Dots under a swipeable row: the long one is where you are. */
export function Pager({ count, index }: { count: number; index: number }) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cn('h-2 w-6 origin-center rounded-full transition-transform duration-300', i === index ? 'bg-brand-primary' : 'scale-x-[0.34] bg-text-disabled')} />
      ))}
    </div>
  )
}

/** Which card a swipeable row has snapped to, from its scroll position. */
export function useRowIndex(count: number) {
  const row = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const onScroll = () => {
    const el = row.current
    if (!el) return
    const span = el.scrollWidth - el.clientWidth
    setIndex(span > 0 ? Math.round((el.scrollLeft / span) * (count - 1)) : 0)
  }
  return { row, index, onScroll }
}
