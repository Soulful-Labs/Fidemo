// Injected by the walk: samples, every frame for `ms`, the transform of every
// element that is animating (WAAPI, CSS, framer). For each it reports how many
// times it crossed its final value (0 = straight in, 1 = one settle, 2+ = wobble)
// and the largest overshoot past the end.
window.__wobble = (ms = 1200) => new Promise((done) => {
  const series = new Map()
  const name = (el) => (el.getAttribute?.('data-t') || el.getAttribute?.('data-s') || '') + ' ' + el.tagName + '.' + ((el.getAttribute?.('class') || '').split(' ').filter(Boolean).slice(0, 4).join('.'))
  const t0 = performance.now()
  const tick = () => {
    const els = new Set()
    for (const a of document.getAnimations()) if (a.effect?.target instanceof Element) els.add(a.effect.target)
    document.querySelectorAll('[style*="transform"]').forEach((e) => els.add(e))
    for (const el of els) {
      const cs = getComputedStyle(el)
      const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform)
      const sc = cs.scale && cs.scale !== 'none' ? parseFloat(cs.scale) : 1
      const v = [m.m41, m.m42, Math.hypot(m.m11, m.m12) * sc]
      if (!series.has(el)) series.set(el, [])
      series.get(el).push(v)
    }
    if (performance.now() - t0 < ms) requestAnimationFrame(tick)
    else {
      const out = []
      for (const [el, s] of series) {
        if (s.length < 3) continue
        const end = s[s.length - 1]
        let worst = { crossings: -1, over: 0, axis: '' }
        ;[0, 1, 2].forEach((k) => {
          const thr = k === 2 ? 0.004 : 0.4
          const d = s.map((v) => v[k] - end[k])
          const start = d.find((x) => Math.abs(x) > thr)
          if (start === undefined) return
          let crossings = 0, over = 0, sign = Math.sign(start)
          for (const x of d) {
            if (Math.abs(x) <= thr) continue
            if (Math.sign(x) !== sign) { crossings++; sign = Math.sign(x) }
            if (Math.sign(x) !== Math.sign(start)) over = Math.max(over, Math.abs(x))
          }
          if (crossings > worst.crossings || (crossings === worst.crossings && over > worst.over)) worst = { crossings, over, axis: ['x', 'y', 'scale'][k] }
        })
        if (worst.axis) out.push({ el: name(el).trim(), ...worst, over: +worst.over.toFixed(3) })
      }
      done(out.sort((a, b) => b.crossings - a.crossings))
    }
  }
  requestAnimationFrame(tick)
})
