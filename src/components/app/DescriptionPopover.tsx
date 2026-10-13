import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { DUR, EASE } from '../../lib/motion'

/** How long a finger rests on a card before its description shows. */
const HOLD_MS = 450
/** A finger that travels further than this is scrolling, not holding. */
const SLOP_PX = 10

/** One description open at a time: opening one closes whichever was open. */
let closeOpen: (() => void) | null = null

/**
 * A study's description over its card, so lists can show the title alone.
 * On a mouse or pen it shows while the pointer is over the card. On touch,
 * where there is no hover, it shows while a finger is held on the card and
 * hides when it lifts; the tap that ends a hold does not open the study.
 * A plain tap or click still opens it. Opening is getting around, tier 1: a
 * 160ms fade and lift, no bounce.
 *
 * Returns the handlers for the card's outer element and the popover itself,
 * drawn in a portal over the top of the card with pointer events off, so it
 * never covers the card's buttons or gets clipped by a scrolling rail.
 */
export function useCardDescription(text: string | undefined, title: string) {
  const card = useRef<HTMLElement | null>(null)
  const [at, setAt] = useState<{ top: number; left: number; width: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  /** A hold just showed the description: swallow the click its lift produces. */
  const held = useRef(false)
  /** Whether this card's description is showing, read without waiting for a render. */
  const showing = useRef(false)

  const hide = useCallback(() => {
    window.clearTimeout(timer.current)
    start.current = null
    showing.current = false
    setAt(null)
    if (closeOpen === hide) closeOpen = null
  }, [])
  const show = useCallback(() => {
    const r = card.current?.getBoundingClientRect()
    if (!r || !text) return
    if (closeOpen && closeOpen !== hide) closeOpen()
    closeOpen = hide
    showing.current = true
    setAt({ top: r.top + 12, left: r.left + 12, width: r.width - 24 })
  }, [text, hide])

  // A description belongs where its card was: scrolling, Escape or leaving the page hides it.
  useEffect(() => {
    if (!at) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
    document.addEventListener('scroll', hide, true)
    document.addEventListener('keydown', key)
    window.addEventListener('blur', hide)
    return () => { document.removeEventListener('scroll', hide, true); document.removeEventListener('keydown', key); window.removeEventListener('blur', hide) }
  }, [at, hide])
  useEffect(() => hide, [hide])

  const handlers = {
    ref: (el: HTMLElement | null) => { card.current = el },
    onPointerEnter: (e: ReactPointerEvent) => { if (e.pointerType !== 'touch') show() },
    onPointerLeave: (e: ReactPointerEvent) => { if (e.pointerType !== 'touch') hide() },
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.pointerType !== 'touch' || !text) return
      held.current = false
      start.current = { x: e.clientX, y: e.clientY }
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => { held.current = true; show() }, HOLD_MS)
    },
    onPointerMove: (e: ReactPointerEvent) => {
      // A scroll hides it while the pointer stays put; the next movement over the card shows it again.
      if (e.pointerType !== 'touch') { if (!showing.current) show(); return }
      if (!start.current) return
      if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > SLOP_PX) hide()
    },
    onPointerUp: (e: ReactPointerEvent) => { if (e.pointerType === 'touch') hide() },
    onPointerCancel: (e: ReactPointerEvent) => { if (e.pointerType === 'touch') hide() },
    /** The long press is ours: no callout menu on the image, no study opened by the lift. */
    onContextMenu: (e: ReactMouseEvent) => { if (start.current || held.current) e.preventDefault() },
    onClickCapture: (e: ReactMouseEvent) => { if (held.current) { held.current = false; e.preventDefault(); e.stopPropagation() } },
  }

  const popover = typeof document === 'undefined' ? null : createPortal(
    <AnimatePresence>
      {at && text && (
        <motion.div role="tooltip" aria-label={`About ${title}`}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: DUR.fast, ease: EASE.out }}
          style={{ top: at.top, left: at.left, width: at.width }}
          className="pointer-events-none fixed z-50 rounded-md border-1 border-stroke-3 bg-bg-2 p-3 shadow-glow shadow-bg-0">
          <p className="text-body-regular text-text-subtitle">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )

  return { handlers, popover, open: Boolean(at) }
}
