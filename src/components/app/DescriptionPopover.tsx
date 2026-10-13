import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { DUR, EASE } from '../../lib/motion'

/**
 * A study's description, over its card, so lists can show the title alone.
 * A phone has no hover: a tap opens it, and a tap anywhere else (another card
 * included), Escape or scrolling the page closes it. Opening is getting
 * around, tier 1: a short fade and lift, no bounce.
 */
export default function DescriptionPopover({ open, onClose, text, title, anchor }: {
  open: boolean; onClose: () => void; text: string; title: string
  /** The button that opened it: tapping that again is its own toggle, not "elsewhere". */
  anchor: React.RefObject<HTMLElement | null>
}) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: Event) => {
      const t = e.target as Node
      if (box.current?.contains(t) || anchor.current?.contains(t)) return
      onClose()
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', away, true)
    document.addEventListener('scroll', onClose, true)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', away, true)
      document.removeEventListener('scroll', onClose, true)
      document.removeEventListener('keydown', key)
    }
  }, [open, onClose, anchor])

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={box} role="region" aria-label={`About ${title}`}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: DUR.fast, ease: EASE.out }}
          className="absolute inset-x-3 top-full z-30 -mt-2 rounded-md border-1 border-stroke-3 bg-bg-2 p-3 shadow-glow shadow-bg-0">
          <p className="text-body-regular text-text-subtitle">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
