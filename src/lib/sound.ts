import type { Feedback } from './feedback'
import { soundOn } from './settings'

/**
 * The sound set, synthesized with the Web Audio API: no files ship. Muted by
 * default and it never autoplays: the AudioContext is only created inside the
 * tap that switches sound on (/motion), and every call is silent until then.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null

/** Call from the click that turns sound on: browsers only allow audio to start inside a gesture. */
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  void ctx.resume()
}

/** One shaped tone: a frequency glide with a quick attack and exponential decay. */
function tone(at: number, f0: number, f1: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  if (!ctx || !master) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(f0, at)
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(vol, at + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(master)
  o.start(at)
  o.stop(at + dur + 0.02)
}

/** A burst of filtered noise: thuds, paper, whooshes. */
function noise(at: number, dur: number, vol: number, freq: number, q = 0.8, type: BiquadFilterType = 'lowpass') {
  if (!ctx || !master) return
  const len = Math.ceil(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const src = ctx.createBufferSource()
  src.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = type; f.frequency.value = freq; f.Q.value = q
  const g = ctx.createGain()
  g.gain.value = vol
  src.connect(f).connect(g).connect(master)
  src.start(at)
}

const NOTE = (n: number) => 440 * 2 ** ((n - 69) / 12) // MIDI note to Hz

const SET: Record<Feedback, (t: number) => void> = {
  // A soft tick for selection.
  select: (t) => tone(t, 2400, 1800, 0.035, 0.05, 'triangle'),
  press: (t) => tone(t, 1600, 1300, 0.025, 0.025, 'triangle'),
  // A rising pop for a gain: a glide up, then a bright second note a third above.
  gain: (t) => { tone(t, 520, 1040, 0.09, 0.16); tone(t + 0.07, NOTE(84), NOTE(84), 0.16, 0.09, 'triangle') },
  // A low thunk for a deduction: short, soft-edged, nothing alarming.
  deduct: (t) => { tone(t, 150, 70, 0.16, 0.22); noise(t, 0.06, 0.08, 400) },
  land: (t) => { tone(t, 110, 48, 0.22, 0.3); noise(t, 0.12, 0.2, 260) },
  // The fanfare, for the tier upgrade and the certificate: a rising arpeggio into a held, shimmering chord.
  celebrate: (t) => {
    ;[72, 76, 79, 84].forEach((n, i) => tone(t + i * 0.085, NOTE(n), NOTE(n), 0.18, 0.13, 'triangle'))
    ;[72, 76, 79, 84, 88].forEach((n) => tone(t + 0.36, NOTE(n), NOTE(n) * 1.003, 0.9, 0.06, 'sawtooth'))
    ;[0, 0.12, 0.25, 0.4].forEach((d) => tone(t + 0.4 + d, NOTE(96), NOTE(100), 0.08, 0.04))
    noise(t + 0.36, 0.5, 0.05, 6000, 0.5, 'highpass')
  },
  // The seal: a heavy blow and the slap of paper.
  stamp: (t) => { tone(t, 90, 40, 0.3, 0.4); noise(t, 0.09, 0.35, 900, 1.2, 'bandpass') },
  locked: (t) => [0, 0.06, 0.12].forEach((d) => tone(t + d, 240, 200, 0.03, 0.09, 'square')),
  unlock: (t) => { tone(t, 1200, 900, 0.03, 0.08, 'square'); tone(t + 0.05, NOTE(79), NOTE(91), 0.18, 0.12) },
  swell: (t) => noise(t, 0.4, 0.06, 900, 0.7, 'bandpass'),
  toy: (t) => { tone(t, NOTE(88), NOTE(88), 0.08, 0.07); tone(t + 0.05, NOTE(93), NOTE(93), 0.12, 0.06) },
}

/** Plays the sound for an event, if (and only if) someone has switched sound on. */
export function sound(kind: Feedback) {
  if (!soundOn() || !ctx || ctx.state !== 'running') return
  SET[kind](ctx.currentTime + 0.005)
}

// If sound was left on last visit, it comes back on the first tap of this one
// (inside that gesture, so still never autoplaying).
if (typeof document !== 'undefined') {
  const wake = () => { if (soundOn()) unlockAudio(); document.removeEventListener('pointerdown', wake, true) }
  document.addEventListener('pointerdown', wake, true)
}
