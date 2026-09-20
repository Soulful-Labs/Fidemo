import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

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
  score, max = 100, size = 'md', compact = false, children, className,
}: ScoreDialProps) {
  const pct = Math.min(1, Math.max(0, score / (max || 1)))

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

  const lit = Math.round(pct * DOTS)
  const litAngle = START - pct * SWEEP

  return (
    <div className={cn('relative shrink-0', WIDTHS[size], className)} role="img" aria-label={`Score ${score} out of ${max}`}>
      <svg viewBox="0 0 200 172" className="block w-full">
        <path d={arc(START, litAngle, 74)} fill="none" strokeWidth="2" stroke="currentColor" className="text-yellow-700" />
        <path d={arc(litAngle, START - SWEEP, 74)} fill="none" strokeWidth="2" stroke="currentColor" className="text-yellow-1000" />
        {dots.map((d, i) => (
          <ellipse
            key={i}
            cx={d.x} cy={d.y} rx="6" ry="8.5"
            transform={`rotate(${d.rotate} ${d.x} ${d.y})`}
            className={i < lit ? 'fill-brand-primary' : 'fill-yellow-900'}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 top-1/4 flex flex-col items-center">
        <span className={cn('font-semibold leading-none text-brand-primary', NUMBER[size])}>{score}</span>
        <span className="pt-1 text-body-regular text-text-body">/{max}</span>
        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  )
}
