import { animate, useInView } from 'framer-motion'
import { Children, createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { DUR, EASE, prefersReduced, rollDuration } from '../../lib/motion'

/** Lets a screen tell the page it is the one in front, for the progress segments. */
export const LandingCtx = createContext<(id: string) => void>(() => undefined)

const SectionCtx = createContext({ seen: false, live: false })
/** `seen` turns true once, when the screen first comes into view; `live` follows whether it is on screen now. */
export const useSection = () => useContext(SectionCtx)

/**
 * Arrival order for a piece of a screen (landing.css, "Arrivals"): `i` is its
 * place in the stagger, `d` an extra delay in milliseconds.
 */
export const at = (i: number, d = 0) => ({ '--i': i, '--d': `${d}ms` }) as CSSProperties

/**
 * One screen of the page: exactly as tall as the app's scroller and a snap
 * point. Its content lives between the progress bar at the top and the pinned
 * buttons at the bottom (`ld-screen` pads for both), centred in what is left,
 * so nothing ever sits under either. Its `ld-in` pieces arrive the first time
 * it comes into view.
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
      className={cn('ld-screen relative flex min-h-[var(--screen)] snap-start snap-always flex-col justify-center bg-bg-0', className)}>
      <SectionCtx.Provider value={{ seen, live }}>{children}</SectionCtx.Provider>
    </section>
  )
}

/** Screen headings: the app's big type, landing with weight as one piece. */
export function Heading({ children, i = 0, className }: { children: string; i?: number; className?: string }) {
  return <h2 style={at(i)} className={cn('ld-in ld-slam origin-bottom-left px-4 text-display-s text-text-title', className)}>{children}</h2>
}

/** Counts up to a real figure when its screen is first seen. At rest, and under reduced motion, it simply is the figure. */
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

/**
 * One whole card at a time. Each slide is the full width of the frame with the
 * app's 16px gutter inside it, so the card on screen is complete and its
 * neighbours are entirely off screen: nothing peeks, nothing is sliced. It
 * snaps, shows where you are in dots, and while nobody has touched it turns to
 * the next card by itself, which is what tells you there are more.
 */
export function Carousel({ label, i = 1, children }: { label: string; i?: number; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [touched, setTouched] = useState(false)
  const { live } = useSection()
  const count = Children.count(children)

  useEffect(() => {
    if (!live || touched || prefersReduced()) return
    const t = window.setInterval(() => {
      const el = row.current
      if (!el) return
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % count
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, 3200)
    return () => window.clearInterval(t)
  }, [live, touched, count])

  return (
    <div style={at(i)} className="ld-in ld-pop flex flex-col">
      <div ref={row} role="group" aria-label={label} tabIndex={0}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={() => setTouched(true)} onKeyDown={() => setTouched(true)}
        className="flex snap-x snap-mandatory overflow-x-auto">
        {Children.map(children, (child) => <div className="w-full shrink-0 snap-center snap-always px-4 pb-6 pt-2">{child}</div>)}
      </div>
      <div aria-hidden="true" className="flex items-center justify-center">
        {Array.from({ length: count }, (_, n) => (
          <span key={n} className={cn('h-2 w-6 rounded-full transition-transform duration-300', n === index ? 'bg-brand-primary' : 'scale-x-[0.34] bg-text-disabled')} />
        ))}
      </div>
    </div>
  )
}
