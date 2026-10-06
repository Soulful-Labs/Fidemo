import { haptic } from './motion'
import { sound } from './sound'

/**
 * Haptics and sound as a language: each kind of event has its own vibration
 * pattern (and, when sound is switched on, its own synthesized sound).
 * docs/Motion.md lists them.
 */
export type Feedback = 'select' | 'press' | 'gain' | 'deduct' | 'land' | 'celebrate' | 'stamp' | 'locked' | 'unlock' | 'swell' | 'toy'

/** navigator.vibrate patterns, in milliseconds: on, off, on, ... */
export const HAPTICS: Record<Feedback, number[]> = {
  select: [7],                                   // a light tick
  press: [5],                                    // the lightest touch
  gain: [14, 70, 22],                            // a double tap
  deduct: [55],                                  // one short low pulse
  land: [28, 40, 12],                            // a thud and a settle
  celebrate: [20, 50, 20, 50, 40, 70, 120],      // a drum roll into a long hit
  stamp: [70, 30, 18],                           // one heavy blow
  locked: [12, 50, 12],                          // a knock against the lock
  unlock: [12, 40, 35],                          // click, then release
  swell: [18],                                   // a soft nudge as it swells
  toy: [6, 30, 6],                               // a tiny double click
}

export function feedback(kind: Feedback) {
  haptic(HAPTICS[kind])
  sound(kind)
}
