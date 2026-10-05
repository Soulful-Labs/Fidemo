/**
 * How many overlays (modals, sheets, celebrations) are open. A live figure
 * that changes while one is up, such as the points chip behind the points
 * earned modal, waits until it closes, so the roll-up is actually seen.
 */
let depth = 0
const waiting = new Set<() => void>()

export function overlayOpened() { depth += 1 }

export function overlayClosed() {
  depth = Math.max(0, depth - 1)
  if (depth > 0) return
  // Let the closing overlay start leaving before the figure starts moving.
  const run = [...waiting]
  waiting.clear()
  setTimeout(() => run.forEach((fn) => fn()), 120)
}

/** Runs `fn` now, or once the last open overlay closes. Returns a cancel. */
export function whenClear(fn: () => void): () => void {
  if (depth === 0) { fn(); return () => undefined }
  waiting.add(fn)
  return () => { waiting.delete(fn) }
}
