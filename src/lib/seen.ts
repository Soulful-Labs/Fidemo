/**
 * The last value the person actually saw for each animated figure, so that a
 * number or bar animates from where they last left it, never from zero.
 * Kept in localStorage so a reload does not replay a gain as a reset. Keys are
 * scoped to the account by useSeenKey (components/motion/useSeen.ts), so
 * switching accounts never animates one person's balance into another's.
 */
const STORE = 'hl:seen'

let cache: Record<string, number> | null = null

function load(): Record<string, number> {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Record<string, number> } catch { cache = {} }
  return cache
}

export function lastSeen(key: string): number | undefined {
  const v = load()[key]
  return typeof v === 'number' ? v : undefined
}

export function markSeen(key: string, value: number) {
  const all = load()
  if (all[key] === value) return
  all[key] = value
  try { localStorage.setItem(STORE, JSON.stringify(all)) } catch { /* private mode: memory only */ }
}

/** Lets the /motion page replay an arrival from a chosen earlier value. */
export function forgetSeen(prefix: string) {
  const all = load()
  for (const k of Object.keys(all)) if (k.startsWith(prefix)) delete all[k]
  try { localStorage.setItem(STORE, JSON.stringify(all)) } catch { /* ignore */ }
}

/**
 * Several bars or dials mounting together arrive one after another rather
 * than all at once. Anything mounting within a frame or two of the previous
 * one joins its batch and takes the next slot.
 */
let batch = { at: 0, n: 0 }
export function nextSlot(): number {
  const now = performance.now()
  batch = now - batch.at < 60 ? { at: now, n: batch.n + 1 } : { at: now, n: 0 }
  return batch.n
}
