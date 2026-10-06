import { useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CSS, play } from '../../lib/motion'
import { TIERS } from '../../lib/rules'
import RollingNumber from '../motion/RollingNumber'
import { useArrival } from '../motion/useArrival'

export interface ScoreDialProps {
  /** Trust Score, always 50 to 100 (PRD 7.3). */
  score: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  /** Small circular variant used for the study match score badge. */
  compact?: boolean
  /** Rendered under the "/100", e.g. the tier chip on Welcome. */
  children?: ReactNode
  className?: string
  /** Remembers the score last seen, so the dots and number move from there (moment D). */
  memory?: string
}

const DOTS = 21
const SWEEP = 240 // degrees, open at the bottom
const START = 210 // degrees, lower left
const R = 90
const CX = 100
const CY = 100

/** Positions of the pill dots along the arc, in SVG units. */
const dots = Array.from({ length: DOTS }, (_, i) => {
  const angle = START - (i * SWEEP) / (DOTS - 1)
  const rad = (angle * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad), rotate: -angle }
})

const arc = (from: number, to: number, r: number) => {
  const a = (from * Math.PI) / 180
  const b = (to * Math.PI) / 180
  const large = Math.abs(from - to) > 180 ? 1 : 0
  return `M ${CX + r * Math.cos(a)} ${CY - r * Math.sin(a)} A ${r} ${r} 0 ${large} 1 ${CX + r * Math.cos(b)} ${CY - r * Math.sin(b)}`
}

const WIDTHS = { sm: 'w-dial-sm', md: 'w-dial-md', lg: 'w-dial-lg' } as const
const NUMBER = { sm: 'text-display-s', md: 'text-display-s', lg: 'text-display' } as const

/**
 * The Trust Score gauge as drawn in Figma: 21 pill dots on a 220° arc, lit
 * up to the score, over a thin track. `compact` keeps the small ring used by
 * the match score badge on study cards.
 */
export default function ScoreDial({
  score, max = 100, size = 'md', compact = false, children, className, memory,
}: ScoreDialProps) {
  const pct = Math.min(1, Math.max(0, score / (max || 1)))
  const lit = Math.round(pct * DOTS)
  const wrap = useRef<HTMLDivElement>(null)
  const litDots = useRef<(SVGEllipseElement | null)[]>([])
  useDots(compact ? 0 : score, max, compact ? undefined : memory, wrap, litDots)

  if (compact) {
    const r = 16
    const c = 2 * Math.PI * r
    return (
      <span
        className={cn('relative inline-flex h-10 w-10 shrink-0 items-center justify-center', className)}
        role="img" aria-label={`Match score ${score}`}
      >
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="2.5" stroke="currentColor" className="text-green-900" />
          <circle cx="20" cy="20" r={r} fill="none" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="text-brand-secondary" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-text-medium text-brand-secondary">{score}</span>
      </span>
    )
  }

  const litAngle = START - pct * SWEEP

  return (
    <div ref={wrap} className={cn('relative shrink-0', WIDTHS[size], className)} role="img" aria-label={`Score ${score} out of ${max}`}>
      {/* A glow behind the dial that grows with the score (50 is barely lit, 100 blazes). */}
      <span data-decor aria-hidden="true" className="pf-dial-glow pointer-events-none absolute inset-[6%] rounded-full"
        style={{ opacity: 0.12 + 0.88 * Math.max(0, (score - 50) / 50) ** 1.3 }} />
      <svg viewBox="0 0 200 172" className="relative block w-full">
        <path d={arc(START, litAngle, 74)} fill="none" strokeWidth="2" stroke="currentColor" className="text-yellow-700" />
        <path d={arc(litAngle, START - SWEEP, 74)} fill="none" strokeWidth="2" stroke="currentColor" className="text-yellow-1000" />
        {/* Unlit dots underneath, lit dots on top: lighting one up is an opacity change only. */}
        {dots.map((d, i) => (
          <ellipse key={i} cx={d.x} cy={d.y} rx="6" ry="8.5" transform={`rotate(${d.rotate} ${d.x} ${d.y})`} className="fill-yellow-900" />
        ))}
        {dots.map((d, i) => (
          <ellipse key={`lit-${i}`} ref={(el) => { litDots.current[i] = el }}
            cx={d.x} cy={d.y} rx="6" ry="8.5" transform={`rotate(${d.rotate} ${d.x} ${d.y})`}
            className="fill-brand-primary" style={{ opacity: i < lit ? 1 : 0 }} />
        ))}
      </svg>
      <div className="absolute inset-x-0 top-1/4 flex flex-col items-center">
        <span className={cn('font-semibold leading-none text-brand-primary', NUMBER[size])}>
          {memory ? <RollingNumber value={score} format={String} memory={memory} float /> : score}
        </span>
        <span className="pt-1 text-body-regular text-text-body">/{max}</span>
        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  )
}

const litCount = (score: number, max: number) => Math.round(Math.min(1, Math.max(0, score / (max || 1))) * DOTS)

/**
 * Lights the dots between the score last seen and this one, one after
 * another and in step with the number, or lets them go out, quieter and
 * quicker, on a fall. Crossing a tier line gives the dial one pulse.
 */
function useDots(score: number, max: number, memory: string | undefined, wrap: React.RefObject<HTMLDivElement | null>, lit: React.RefObject<(SVGEllipseElement | null)[]>) {
  useArrival(score, memory, (from, to) => {
    const els = lit.current ?? []
    const now = litCount(to, max)
    if (from === undefined || from === to) {
      els.forEach((el, i) => { if (el) el.style.opacity = i < litCount(from ?? to, max) ? '1' : '0' })
      return
    }
    const was = litCount(from, max)
    const gain = now > was
    const changing = gain ? els.slice(was, now) : els.slice(now, was).reverse()
    const step = (gain ? CSS.slow : CSS.base) / Math.max(1, changing.length)
    changing.forEach((el, i) => {
      if (!el) return
      el.style.opacity = gain ? '1' : '0'
      play(el, gain ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], CSS.fast, CSS.out, i * step)
    })
    const crossed = gain && [TIERS.gold, TIERS.platinum].some((t) => from < t && to >= t)
    if (crossed) play(wrap.current, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', offset: 0.3 }, { transform: 'scale(1)' }], CSS.slow, CSS.out, CSS.slow)
  })
}
