import { useMemo } from 'react'
import { cn } from '../../lib/cn'

/** A small seeded random, so a burst looks the same on every render. */
export function seeded(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export interface Particle {
  dx: number
  dy: number
  /** How far it sinks after the burst, like something with weight. */
  fall: number
  spin: number
  size: number
  star: boolean
  tone: number
}

/**
 * Burst geometry: `count` pieces flung out from the centre, biased upwards
 * (`lift`), then sinking a little. Positions only; the caller animates them.
 */
export function burst(count: number, seed: number, reach: [number, number] = [70, 170], lift = 0.35): Particle[] {
  const rnd = seeded(seed)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rnd() * 0.5
    const dist = reach[0] + rnd() * (reach[1] - reach[0])
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist * 0.85 - dist * lift,
      fall: 30 + rnd() * 50,
      spin: (rnd() - 0.5) * 540,
      size: 4 + Math.round(rnd() * 6),
      star: rnd() > 0.55,
      tone: Math.floor(rnd() * 3),
    }
  })
}

/**
 * The particle elements, parked at the centre of their (relative) parent and
 * invisible until something animates them. `tones` are three text-* token
 * classes. Decorative: hidden under reduced motion.
 */
export function ParticleField({ particles, tones, name }: { particles: Particle[]; tones: [string, string, string]; name: string }) {
  const nodes = useMemo(() => particles.map((p, i) => (
    <span key={i} data-p={name} data-i={i}
      className={cn('absolute left-1/2 top-1/2 block opacity-0 will-change-transform', tones[p.tone])}
      style={{ width: p.size * 2, height: p.size * 2, marginLeft: -p.size, marginTop: -p.size }}>
      {p.star
        ? <svg viewBox="0 0 10 10" className="h-full w-full"><path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" fill="currentColor" /></svg>
        : <span className="block h-full w-full scale-50 rounded-full bg-current" />}
    </span>
  )), [particles, tones, name])
  return <span data-decor aria-hidden="true" className="pointer-events-none absolute inset-0">{nodes}</span>
}
