import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { SPRING, prefersReduced } from '../../lib/motion'

const MAX = 16 // degrees
const ASKED = 'hl:orient-asked'

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Asks for device orientation once, in context: on the first touch of a collectible card, and only where a browser needs asking. */
async function askOnce() {
  const ctor = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : undefined) as OrientationCtor | undefined
  if (!ctor?.requestPermission) return
  try {
    if (localStorage.getItem(ASKED)) return
    localStorage.setItem(ASKED, '1')
    await ctor.requestPermission()
  } catch { /* declined or unavailable: the finger still tilts it */ }
}

export interface TiltProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** How strong the holographic sheen is (0 to 1). */
  holo?: number
}

/**
 * A physical collectible card. It tilts in 3D to follow the
 * finger dragged across it (and the phone's own tilt where the device reports
 * it), with a holographic sheen and a glare that move against the tilt. Under
 * reduced motion it is the plain <div> it replaces.
 */
export default function Tilt({ children, className, holo = 1, ...rest }: TiltProps) {
  if (prefersReduced()) return <div className={className} {...rest}>{children}</div>
  return <TiltOn className={className} holo={holo} {...rest}>{children}</TiltOn>
}

function TiltOn({ children, className, holo = 1, ...rest }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0) // -1 .. 1 across
  const py = useMotionValue(0) // -1 .. 1 down
  // Follows the finger smoothly: a soft spring with no visible overshoot.
  const sx = useSpring(px, SPRING.soft)
  const sy = useSpring(py, SPRING.soft)
  const rotateY = useTransform(sx, (v) => v * MAX)
  const rotateX = useTransform(sy, (v) => -v * MAX)
  // The sheen slides the opposite way to the tilt, the glare follows the light.
  const sheenX = useTransform(sx, (v) => `${-v * 30}%`)
  const sheenY = useTransform(sy, (v) => `${-v * 30}%`)
  const glareX = useTransform(sx, (v) => `${v * 45}%`)
  const glareY = useTransform(sy, (v) => `${v * 45}%`)
  // The foil catches the light as the card turns: faint at rest, bright when tilted.
  const foil = useTransform([sx, sy], ([x, y]: number[]) => (0.05 + 0.25 * Math.min(1, Math.hypot(x, y))) * holo)
  const glare = useTransform([sx, sy], ([x, y]: number[]) => 0.25 + 0.75 * Math.min(1, Math.hypot(x, y)))
  const holding = useRef(false)

  // The phone's own tilt, when the device reports it and nobody is touching the card.
  useEffect(() => {
    const onTurn = (e: DeviceOrientationEvent) => {
      if (holding.current || e.gamma == null || e.beta == null) return
      // Damped: small hand movements while reading leave the card still; only a deliberate tilt moves it, and gently.
      const dead = (v: number) => (Math.abs(v) < 0.35 ? 0 : (v - Math.sign(v) * 0.35) * 0.5)
      px.set(dead(Math.max(-1, Math.min(1, e.gamma / 30))))
      py.set(dead(Math.max(-1, Math.min(1, (e.beta - 40) / 30))))
    }
    window.addEventListener('deviceorientation', onTurn)
    return () => window.removeEventListener('deviceorientation', onTurn)
  }, [px, py])

  const follow = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const settle = () => { holding.current = false; px.set(0); py.set(0) }

  return (
    <motion.div ref={ref} {...(rest as object)}
      className={cn(className, 'relative isolate')}
      style={{ rotateX, rotateY, transformPerspective: 700, transformStyle: 'preserve-3d' }}
      onPointerDown={(e) => { holding.current = true; askOnce(); follow(e); rest.onPointerDown?.(e as never) }}
      onPointerMove={(e) => { if (holding.current || e.pointerType === 'mouse') follow(e) }}
      onPointerUp={settle} onPointerLeave={settle} onPointerCancel={settle}>
      {children}
      {/* Holographic foil from the app's own hues, sliding against the tilt. */}
      {/* The foil is clipped to the card on its own layer, so the card's contents can overhang it. */}
      <span data-decor aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
        <motion.span style={{ x: sheenX, y: sheenY, opacity: foil }} className="hl-holo absolute -inset-1/2" />
        <motion.span style={{ x: glareX, y: glareY, opacity: glare }} className="hl-glare absolute -inset-1/4" />
      </span>
    </motion.div>
  )
}
