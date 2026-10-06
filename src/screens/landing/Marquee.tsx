import { Children, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { prefersReduced } from '../../lib/motion'
import { at, useSection } from './shared'

/** Pixels a second. A card takes about seven seconds to cross the clear middle of the row: slow enough to read. */
const SPEED = 22
/** How long after the last touch, or the last bit of a flick's momentum, the row waits before drifting again. */
const RESUME_MS = 1200

/**
 * A row of cards that drifts steadily sideways and loops, so there is always
 * more arriving from the right: nobody has to guess that the row continues.
 *
 * It is an ordinary scrolling row, so a swipe is the browser's own scroll and
 * always wins: touching it stops the drift at once, and the drift picks up
 * again a moment after the finger lifts and the flick has run out. The cards
 * are laid out three times over and the position wraps by one set, which is
 * what makes the loop endless in both directions.
 *
 * Both edges fade (`.ld-row`), so a card dissolves at the edge instead of
 * being cut; two cards and their gap always fit between the fades, so at least
 * one card is completely clear at every moment.
 *
 * Under reduced motion nothing drifts: the row is laid out once, swiped by
 * hand, snaps each card clear of the fade, and shows where you are in dots.
 */
export default function Marquee({ label, i = 1, children }: { label: string; i?: number; children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null)
  const { live } = useSection()
  const still = prefersReduced()
  const cards = Children.toArray(children)
  const [index, setIndex] = useState(0)

  /** How far one card is from the next, and so how long one full set is. */
  const step = () => {
    const kids = row.current?.children
    return kids && kids.length > 1 ? (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft : 0
  }

  // Start in the middle set, so there is a full set to either side.
  useLayoutEffect(() => {
    if (!still && row.current) row.current.scrollLeft = step() * cards.length
  }, [still, cards.length])

  useEffect(() => {
    const el = row.current
    if (!el || still || !live) return
    let raf = 0
    let last = 0
    let pos = el.scrollLeft
    let drifting = false
    let held = false
    let resumeAt = 0
    let wrote = el.scrollLeft
    const wait = () => { drifting = false; resumeAt = performance.now() + RESUME_MS }
    const hold = () => { held = true; drifting = false }
    const release = () => { held = false; wait() }
    // A scroll we did not cause is the person's finger, wheel or flick: keep waiting until it stops.
    const onScroll = () => { if (!drifting) wait() }
    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 0
      last = t
      // If the row is not where the drift last put it, something else moved it (keys, a scrollbar, a script): that wins too.
      if (drifting && Math.abs(el.scrollLeft - wrote) > 1.5) wait()
      if (!held && t >= resumeAt) {
        const set = step() * cards.length
        if (!drifting) { drifting = true; pos = el.scrollLeft }
        pos += (SPEED * dt) / 1000
        // Wrap by one whole set, which lands on identical pixels.
        if (set > 0) { while (pos >= set * 2) pos -= set; while (pos < set) pos += set }
        el.scrollLeft = pos
        wrote = el.scrollLeft
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    el.addEventListener('touchstart', hold, { passive: true })
    el.addEventListener('touchend', release)
    el.addEventListener('touchcancel', release)
    el.addEventListener('pointerdown', hold)
    el.addEventListener('pointerup', release)
    el.addEventListener('pointercancel', release)
    el.addEventListener('wheel', wait, { passive: true })
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('touchstart', hold); el.removeEventListener('touchend', release); el.removeEventListener('touchcancel', release)
      el.removeEventListener('pointerdown', hold); el.removeEventListener('pointerup', release); el.removeEventListener('pointercancel', release)
      el.removeEventListener('wheel', wait); el.removeEventListener('scroll', onScroll)
    }
  }, [still, live, cards.length])

  const sets = still ? 1 : 3
  return (
    <div style={at(i)} className="ld-in ld-pop flex flex-col gap-1">
      <div ref={row} role="group" aria-label={label} tabIndex={0}
        onScroll={still ? (e) => { const s = step(); if (s) setIndex(Math.min(cards.length - 1, Math.round(e.currentTarget.scrollLeft / s))) } : undefined}
        className={cn('ld-row flex overflow-x-auto pb-6 pt-2', still && 'ld-row-still')}>
        {Array.from({ length: sets }, (_, set) => cards.map((card, n) => (
          // The middle set is the real one; the copies either side are for the loop only.
          <div key={`${set}-${n}`} aria-hidden={sets > 1 && set !== 1 ? true : undefined} className="flex">{card}</div>
        )))}
      </div>
      {still && (
        <div aria-hidden="true" className="flex items-center justify-center gap-2">
          {cards.map((_, n) => (
            <span key={n} className={cn('h-2.5 rounded-full', n === index ? 'w-8 bg-brand-primary' : 'w-2.5 bg-text-body')} />
          ))}
        </div>
      )}
    </div>
  )
}
