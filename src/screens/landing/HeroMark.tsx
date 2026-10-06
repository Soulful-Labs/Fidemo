import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { feedback } from '../../lib/feedback'
import { SPRING } from '../../lib/motion'

/** The "H" from components/app/Logo.tsx (Figma 915:51184), drawn once and shown in three clipped pieces. */
const H = 'M0 3.15987C0 1.41472 1.41472 0 3.15987 0C4.90503 0 6.31975 1.41472 6.31975 3.15987V8.6395C6.31975 10.5855 7.89728 12.163 9.84326 12.163C11.7892 12.163 13.3668 10.5855 13.3668 8.6395V3.15987C13.3668 1.41472 14.7815 0 16.5266 0C18.2718 0 19.6865 1.41472 19.6865 3.15987V20.8401C19.6865 22.5853 18.2718 24 16.5266 24C14.7815 24 13.3668 22.5853 13.3668 20.8401V17.2915C13.3668 15.3456 11.7892 13.768 9.84326 13.768C7.89728 13.768 6.31975 15.3456 6.31975 17.2915V20.8401C6.31975 22.5853 4.90503 24 3.15987 24C1.41472 24 0 22.5853 0 20.8401V3.15987Z'

/** The mark, whole and still. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.6865 24" fill="none" aria-hidden="true" className={className}>
      <path d={H} className="fill-brand-primary" />
      <circle cx="9.84315" cy="8.63955" r="1.96865" className="fill-brand-secondary" />
    </svg>
  )
}

/**
 * Each piece: the slice of the mark it shows, where it comes in from, and when it lands.
 * The travel is short on purpose: every piece stays inside the hero's stage the whole way,
 * so nothing is ever clipped by the stage or hidden behind the progress bar mid-flight.
 */
const PIECES = [
  { clip: 'inset(0 67.7% 0 0)', from: { y: -28, rotate: -24, scale: 0.7 }, spring: SPRING.slam, at: 0.15 },
  { clip: 'inset(0 0 0 67.7%)', from: { y: 28, rotate: 24, scale: 0.7 }, spring: SPRING.slam, at: 0.32 },
  { clip: 'inset(0 32.1% 0 32.1%)', from: { scaleX: 0, scaleY: 0.4 }, spring: SPRING.bouncy, at: 0.56 },
] as const

/** When the green dot drops in: the last piece, and the beat everything answers. */
const DOT_AT = 0.86

/**
 * The money shot: the HumanLayer mark assembles itself. The left leg slams
 * down from above, the right one up from below, the bridge springs across
 * between them, and the green dot drops into its seat, which knocks the whole
 * mark and rings once. (No confetti here: it would fall across the headline
 * and pile up on the buttons.) Under reduced motion it is simply the
 * mark, whole.
 */
export default function HeroMark() {
  useEffect(() => {
    const land = window.setTimeout(() => feedback('land'), PIECES[0].at * 1000 + 120)
    const seat = window.setTimeout(() => feedback('stamp'), DOT_AT * 1000 + 160)
    return () => { window.clearTimeout(land); window.clearTimeout(seat) }
  }, [])

  return (
    <motion.span initial={{ scale: 1 }} animate={{ scale: [1, 1.12, 1] }}
      transition={{ duration: 0.42, times: [0, 0.3, 1], delay: DOT_AT + 0.16 }}
      className="relative block aspect-[19.6865/24] h-40 will-change-transform">
      {PIECES.map((p) => (
        <motion.svg key={p.clip} viewBox="0 0 19.6865 24" fill="none" aria-hidden="true"
          initial={{ opacity: 0, ...p.from }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }}
          transition={{ ...p.spring, delay: p.at, opacity: { duration: 0.12, delay: p.at } }}
          style={{ clipPath: p.clip }} className="absolute inset-0 h-full w-full will-change-transform">
          <path d={H} className="fill-brand-primary" />
        </motion.svg>
      ))}

      {/* The ring the dot throws as it seats. */}
      <motion.span data-decor aria-hidden="true" initial={{ opacity: 0, scale: 1 }} animate={{ opacity: [0, 0.8, 0], scale: [1, 3.6] }}
        transition={{ duration: 0.72, delay: DOT_AT + 0.14, ease: 'easeOut' }}
        className="absolute left-[40%] top-[27.8%] aspect-square w-1/5 rounded-full border-2 border-brand-secondary" />

      <motion.svg viewBox="0 0 19.6865 24" fill="none" aria-hidden="true"
        initial={{ opacity: 0, y: -56, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING.bouncy, delay: DOT_AT, opacity: { duration: 0.1, delay: DOT_AT } }}
        style={{ transformOrigin: '50% 36%' }} className="absolute inset-0 h-full w-full will-change-transform">
        <circle cx="9.84315" cy="8.63955" r="1.96865" className="fill-brand-secondary" />
      </motion.svg>
    </motion.span>
  )
}
