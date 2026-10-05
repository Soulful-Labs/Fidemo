/// <reference lib="webworker" />
import { MAX_PIECES, spawn, tick } from './confettiCore'
import type { FireOptions, Piece } from './confettiCore'

/**
 * Confetti off the main thread: the canvas was handed over with
 * transferControlToOffscreen, so physics and drawing happen here, on another
 * core, and never compete with the app's own frames.
 */
let ctx: OffscreenCanvasRenderingContext2D | null = null
let canvas: OffscreenCanvas | null = null
let pieces: Piece[] = []
let running = false
let last = 0
const raf: (cb: (t: number) => void) => void =
  typeof requestAnimationFrame === 'function' ? (cb) => requestAnimationFrame(cb) : (cb) => setTimeout(() => cb(performance.now()), 16)

function frame(t: number) {
  if (!ctx || !canvas) return
  const dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016)
  last = t
  pieces = tick(ctx, pieces, canvas.width, canvas.height, dt)
  if (pieces.length) raf(frame)
  else { running = false; last = 0 }
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data as { type: 'init'; canvas: OffscreenCanvas } | { type: 'size'; w: number; h: number } | { type: 'fire'; o: FireOptions }
  if (m.type === 'init') { canvas = m.canvas; ctx = canvas.getContext('2d') }
  else if (m.type === 'size' && canvas) { canvas.width = m.w; canvas.height = m.h }
  else if (m.type === 'fire' && canvas) {
    pieces = pieces.concat(spawn(m.o, canvas.height)).slice(-MAX_PIECES)
    if (!running) { running = true; raf(frame) }
  }
}
