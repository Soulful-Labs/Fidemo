import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { prefersReduced } from '../../lib/motion'
import { isPlayful } from '../../lib/playful'

/**
 * Confetti with real physics, on one canvas above everything (PLAYFUL only).
 * Gravity pulls, air drag slows, paper flutters side to side and turns over
 * as it falls, coins spin; everything lands on the floor, bounces a little,
 * slides to a stop and lies there for a moment before fading. One canvas is a
 * single composited layer, so a hundred pieces cost one draw per frame.
 */
import { MAX_PIECES, spawn, tick } from './confettiCore'
import type { FireOptions, Piece } from './confettiCore'

export type { FireOptions, Shape } from './confettiCore'

/** The worker when the browser can hand a canvas to one; otherwise a main-thread loop. */
let worker: Worker | null = null
let pieces: Piece[] = []
let wake: (() => void) | null = null

/** Throws confetti from a point. No-op without PLAYFUL or under reduced motion. */
export function fire(o: FireOptions) {
  if (!isPlayful() || prefersReduced()) return
  // Dev only: lets the frame-rate probe measure a moment without its confetti.
  if (import.meta.env.DEV && (window as unknown as { __noConfetti?: boolean }).__noConfetti) return
  if (worker) { worker.postMessage({ type: 'fire', o }); return }
  pieces = pieces.concat(spawn(o, window.innerHeight)).slice(-MAX_PIECES)
  wake?.()
}

/** The single canvas, mounted once by the app shell. */
export function ConfettiLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const w = () => window.innerWidth, h = () => window.innerHeight
    // Drawn at 1x: confetti is small and moving, and half the pixels is half the cost.
    const offscreen = typeof OffscreenCanvas !== 'undefined' && typeof canvas.transferControlToOffscreen === 'function'
    if (offscreen) {
      // A canvas can be handed to a worker only once, so the worker belongs to the
      // canvas element: StrictMode's rehearsal re-runs this effect and must reuse it.
      const el = canvas as HTMLCanvasElement & { __worker?: Worker; __bye?: number }
      window.clearTimeout(el.__bye)
      if (!el.__worker) {
        const off = canvas.transferControlToOffscreen()
        off.width = w(); off.height = h()
        el.__worker = new Worker(new URL('./confettiWorker.ts', import.meta.url), { type: 'module' })
        el.__worker.postMessage({ type: 'init', canvas: off }, [off])
      }
      worker = el.__worker
      const size = () => worker?.postMessage({ type: 'size', w: w(), h: h() })
      window.addEventListener('resize', size)
      return () => {
        window.removeEventListener('resize', size)
        // Terminate only on a real unmount (a rehearsal re-mounts within the same tick).
        el.__bye = window.setTimeout(() => { el.__worker?.terminate(); el.__worker = undefined; if (worker === el.__worker) worker = null }, 0)
      }
    }
    const c = canvas.getContext('2d')
    if (!c) return
    let raf = 0
    let last = 0
    const size = () => { canvas.width = w(); canvas.height = h() }
    size()
    window.addEventListener('resize', size)
    const frame = (t: number) => {
      const dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016)
      last = t
      pieces = tick(c, pieces, canvas.width, canvas.height, dt)
      if (pieces.length) raf = requestAnimationFrame(frame)
      else { raf = 0; last = 0 }
    }
    wake = () => { if (!raf) raf = requestAnimationFrame(frame) }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); wake = null }
  }, [])
  return createPortal(
    <canvas ref={ref} data-decor aria-hidden="true" className="pointer-events-none fixed inset-0 z-toast h-full w-full" />,
    document.body,
  )
}

export const CONFETTI = {
  brand: ['#fca311', '#3fb984', '#fafafa', '#fdb541'],
  gold: ['#e4b300', '#fca311', '#fdb541', '#fafafa', '#3fb984'],
  platinum: ['#9139f6', '#ac99fb', '#68b6f1', '#fafafa', '#3fb984'],
  silver: ['#b9b9b9', '#fafafa', '#68b6f1', '#3fb984'],
  green: ['#3fb984', '#00cc66', '#fafafa', '#fca311'],
  coins: ['#fca311', '#fdb541', '#e5940f'],
}

/** Two cannons from the bottom corners, crossing over the middle: the big-two salute. */
export function cannons(colors: string[], count = 70) {
  const w = window.innerWidth, h = window.innerHeight
  fire({ x: 0, y: h, angle: -Math.PI / 2 + 0.45, spread: 0.5, power: 1700, count, colors })
  fire({ x: w, y: h, angle: -Math.PI / 2 - 0.45, spread: 0.5, power: 1700, count, colors })
}

/** A gentle fall of glitter from the top edge, for a few seconds. */
export function glitter(colors: string[], seconds = 2.5) {
  const end = performance.now() + seconds * 1000
  const tick = () => {
    if (performance.now() > end) return
    fire({ x: Math.random() * window.innerWidth, y: -10, angle: Math.PI / 2, spread: 0.6, power: 120, count: 2, colors, shapes: ['paper', 'star'] })
    window.setTimeout(tick, 200)
  }
  tick()
}
