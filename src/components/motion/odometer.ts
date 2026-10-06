import { EASE } from '../../lib/motion'

/**
 * The counter: each digit of the new figure becomes a little wheel that
 * tumbles from its old digit to its new one, the lower places spinning
 * further (as a mechanical counter does), the higher ones stepping once.
 * Separators ($ , .) stay still. When every wheel has stopped the caller
 * writes the exact formatted text back, so the resting figure is exactly the
 * app's own text, never the wheels.
 */
export function spinDigits(node: HTMLElement, fromText: string, toText: string, ms: number, onDone: () => void): () => void {
  const lh = parseFloat(getComputedStyle(node).lineHeight) || node.getBoundingClientRect().height || 20
  const digits = (t: string) => Number(t.replace(/\D/g, '') || '0')
  const fromN = digits(fromText)
  const toN = digits(toText)
  node.textContent = ''
  const runs: Animation[] = []
  let place = [...toText].filter((ch) => /\d/.test(ch)).length

  for (const ch of toText) {
    if (!/\d/.test(ch)) { node.append(ch); continue }
    place -= 1
    const unit = 10 ** place
    const steps = Math.min(30, Math.max(0, Math.floor(toN / unit) - Math.floor(fromN / unit)))
    const end = Number(ch)
    const wheel = document.createElement('span')
    wheel.style.cssText = `display:inline-block;height:${lh}px;overflow:hidden;vertical-align:bottom;`
      + 'mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);-webkit-mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent)'
    const strip = document.createElement('span')
    strip.style.cssText = 'display:block;will-change:transform'
    for (let i = steps; i >= 0; i--) {
      const line = document.createElement('span')
      line.style.cssText = `display:block;height:${lh}px`
      line.textContent = String((((end - i) % 10) + 10) % 10)
      strip.append(line)
    }
    wheel.append(strip)
    node.append(wheel)
    if (steps > 0) {
      runs.push(strip.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${-steps * lh}px)` }],
        { duration: ms * (0.7 + 0.3 * Math.min(1, steps / 10)), easing: `cubic-bezier(${EASE.out.join(',')})`, fill: 'forwards' },
      ))
    }
  }
  let finished = false
  const finish = () => { if (!finished) { finished = true; onDone() } }
  if (runs.length === 0) finish()
  else Promise.all(runs.map((r) => r.finished)).then(finish, () => undefined)
  return () => { finished = true; runs.forEach((r) => r.cancel()) }
}
