/**
 * The confetti engine, shared by the worker (confettiWorker.ts, the normal
 * path: physics and drawing off the main thread on an OffscreenCanvas) and
 * the main-thread fallback for browsers without OffscreenCanvas.
 */
export type Shape = 'paper' | 'dot' | 'star' | 'coin'
export interface FireOptions {
  x: number
  y: number
  count?: number
  colors: string[]
  shapes?: Shape[]
  /** Launch speed in px/s and the cone it fans across (radians, 0 = straight up). */
  power?: number
  spread?: number
  /** Where the floor is, in px from the top of the viewport. Default: the bottom. */
  floor?: number
  /** Direction of the cone's centre in radians (default straight up, -PI/2). */
  angle?: number
}

export interface Piece {
  x: number; y: number; vx: number; vy: number; r: number; vr: number; flip: number; vflip: number
  size: number; color: string; shape: Shape; rest: number; alpha: number; floor: number; wobble: number
}

const G = 2200 // px/s²
const DRAG = 1.6 // per second, in the air

/** Creates the pieces for one throw. */
export function spawn(o: FireOptions, viewportH: number): Piece[] {
  const { count = 60, power = 900, spread = 1.4, shapes = ['paper', 'paper', 'dot', 'star'] } = o
  const floor = o.floor ?? viewportH
  const out: Piece[] = []
  for (let i = 0; i < count; i++) {
    const a = (o.angle ?? -Math.PI / 2) + (Math.random() - 0.5) * spread
    const v = power * (0.45 + Math.random() * 0.75)
    out.push({
      x: o.x, y: o.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 18, flip: Math.random() * 6, vflip: 6 + Math.random() * 10,
      size: 4 + Math.random() * 7, color: o.colors[i % o.colors.length], shape: shapes[i % shapes.length],
      rest: 0, alpha: 1, floor, wobble: Math.random() * 6,
    })
  }
  return out
}

type Canvas2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas
const makeCanvas = (w: number, h: number): AnyCanvas => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c
}

/** Each shape and colour is drawn once into a small sprite; frames only stamp sprites. */
const sprites = new Map<string, AnyCanvas>()
const SPRITE = 32
function sprite(shape: Shape, color: string): AnyCanvas {
  const key = shape + color
  let sp = sprites.get(key)
  if (sp) return sp
  sp = makeCanvas(SPRITE, SPRITE)
  const c = sp.getContext('2d') as Canvas2D
  const h = SPRITE / 2
  c.translate(h, h)
  c.fillStyle = color
  if (shape === 'paper') c.fillRect(-h, -h * 0.45, SPRITE, h * 0.9)
  else if (shape === 'dot') { c.beginPath(); c.arc(0, 0, h * 0.55, 0, Math.PI * 2); c.fill() }
  else if (shape === 'coin') {
    c.beginPath(); c.arc(0, 0, h, 0, Math.PI * 2); c.fill()
    c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = h * 0.22
    c.beginPath(); c.arc(0, 0, h * 0.6, 0, Math.PI * 2); c.stroke()
  } else {
    c.beginPath()
    for (let k = 0; k < 8; k++) {
      const rr = k % 2 ? h * 0.42 : h
      c.lineTo(Math.cos((k * Math.PI) / 4) * rr, Math.sin((k * Math.PI) / 4) * rr)
    }
    c.closePath(); c.fill()
  }
  sprites.set(key, sp)
  return sp
}

function draw(c: Canvas2D, p: Piece) {
  // One transform per piece (no save/restore): rotate, then squash for the turn-over.
  const cos = Math.cos(p.r), sin = Math.sin(p.r)
  const k = p.size / (SPRITE / 2)
  const turn = p.shape === 'paper' || p.shape === 'coin' ? Math.cos(p.flip) : 1
  const sx = p.shape === 'coin' ? turn : 1
  const sy = p.shape === 'paper' ? turn : 1
  c.globalAlpha = p.alpha
  c.setTransform(cos * k * sx, sin * k * sx, -sin * k * sy, cos * k * sy, p.x, p.y)
  c.drawImage(sprite(p.shape, p.color), -SPRITE / 2, -SPRITE / 2)
}

function step(p: Piece, dt: number) {
  const onFloor = p.y >= p.floor - p.size * 0.5
  if (!onFloor) {
    p.vy += G * dt
    const drag = Math.exp(-DRAG * (p.shape === 'paper' ? 1.6 : 1) * dt)
    p.vx *= drag; p.vy *= drag
    if (p.shape === 'paper') p.vx += Math.sin((p.wobble += dt * 9)) * 260 * dt // flutter
    p.x += p.vx * dt; p.y += p.vy * dt
    p.r += p.vr * dt; p.flip += p.vflip * dt
    if (p.y >= p.floor - p.size * 0.5) {
      // Landing: a small bounce, most of the energy gone.
      p.y = p.floor - p.size * 0.5
      p.vy = -Math.abs(p.vy) * 0.28
      p.vx *= 0.5; p.vr *= 0.4
      if (Math.abs(p.vy) < 60) p.vy = 0
    }
  } else {
    // On the ground: friction to a stop, lying flat, then fading after a rest.
    p.vx *= Math.exp(-7 * dt); p.vr *= Math.exp(-7 * dt)
    p.x += p.vx * dt; p.r += p.vr * dt
    p.flip += (Math.round(p.flip / Math.PI) * Math.PI - p.flip) * Math.min(1, dt * 8)
    if (p.vy < 0) { p.vy += G * dt; p.y += p.vy * dt } else p.y = p.floor - p.size * 0.5
    p.rest += dt
    if (p.rest > 1.6) p.alpha = Math.max(0, p.alpha - dt * 1.4)
  }
}

/** Advances and draws every piece; returns the pieces still in play. */
export function tick(c: Canvas2D, pieces: Piece[], w: number, h: number, dt: number): Piece[] {
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.globalAlpha = 1
  c.clearRect(0, 0, w, h)
  for (const p of pieces) { step(p, dt); draw(c, p) }
  return pieces.filter((p) => p.alpha > 0 && p.x > -40 && p.x < w + 40)
}

export const MAX_PIECES = 260
