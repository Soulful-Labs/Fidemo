// Drives the motion work in headless Chromium over CDP: plays animations,
// captures frames part way through, measures frame rate (optionally under
// CPU throttling), and can emulate prefers-reduced-motion. No packages.
//
//   node --experimental-websocket scripts/motion-probe.mjs <plan.json>
//
// A plan is a JSON array of steps:
//   { "go": "motion" }                  navigate (no leading slash)
//   { "viewport": [w, h] }              set the viewport (1x)
//   { "reduced": true }                 emulate prefers-reduced-motion: reduce
//   { "throttle": 4 }                   CPU slowdown factor (1 = off)
//   { "js": "code" }                    evaluate, result printed
//   { "tap": "Button text" }            click the first button/link whose text matches
//   { "cdp": [[method, params], ...], "gap": 16 }   raw DevTools commands (touch, mouse)
//   { "wait": 300 }
//   { "shot": "out.png", "el": "sel" }  screenshot the viewport, or clip to an element
//   { "fps": { "tap": "Text", "js": "code", "ms": 2000, "label": "x" } }
//                                       start a rAF recorder, trigger, report fps

import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const plan = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const WIDTH = 375
const HEIGHT = 812
const base = process.env.BASE_URL ?? 'http://localhost:5173'

const candidates = [
  process.env.CHROME,
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean)
const chrome = candidates.find((p) => existsSync(p))
if (!chrome) throw new Error('No Chrome found. Set CHROME=<path to chrome.exe>')

const proc = spawn(chrome, [
  '--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  ...(process.env.SCROLLBARS ? [] : ['--hide-scrollbars']), ...(process.env.GPU ? [] : ['--disable-gpu']), `--window-size=${WIDTH},${HEIGHT}`, 'about:blank',
])
const wsUrl = await new Promise((resolve, reject) => {
  let buf = ''
  proc.stderr.on('data', (d) => {
    buf += d
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
    if (m) resolve(m[1])
  })
  proc.on('exit', (c) => reject(new Error(`chrome exited ${c}\n${buf}`)))
  setTimeout(() => reject(new Error('chrome did not start\n' + buf)), 15000)
})

const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
let events = []
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
  } else if (msg.method) {
    events.push(msg)
    // Surface page errors so a blank capture explains itself.
    if (msg.method === 'Runtime.exceptionThrown') console.error('page error:', msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') console.error('console.error:', msg.params.args.map((a) => a.value ?? a.description).join(' '))
  }
}
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++seq
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))


const TAP = (text) => `(() => {
  const want = ${JSON.stringify(text)}
  const els = [...document.querySelectorAll('button, a, [role=button], [role=link]')]
  const el = els.find((e) => e.innerText.trim() === want) ?? els.find((e) => e.innerText.trim().includes(want)) ?? document.querySelector(want)
  if (!el) return 'missing: ' + want
  el.click(); return 'ok'
})()`

const RECORD = (ms) => `new Promise((done) => {
  const times = []; const t0 = performance.now()
  const tick = (t) => { times.push(t); if (t - t0 < ${ms}) requestAnimationFrame(tick); else {
    const gaps = times.slice(1).map((t, i) => t - times[i])
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
    done({ frames: gaps.length, fps: +(1000 / avg).toFixed(1), worstMs: +Math.max(...gaps).toFixed(1),
      over33: gaps.filter((g) => g > 33.4).length, over50: gaps.filter((g) => g > 50).length, long: gaps.map((g, i) => [Math.round(times[i] - t0), Math.round(g)]).filter(([, g]) => g > 33.4), p95: +[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length*0.95)].toFixed(1) })
  } }
  requestAnimationFrame(tick)
})`

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const s = (m, p) => send(m, p, sessionId)
  await s('Page.enable')
  await s('Runtime.enable')
  await s('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: true })
  const ev = async (expression) => {
    const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) return 'error: ' + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
    return r.result.value
  }
  for (const step of plan) {
    if (step.go !== undefined) {
      events = []
      await s('Page.navigate', { url: base + '/' + step.go.replace(/^\/+/, '') })
      for (let i = 0; i < 100 && !events.some((e) => e.method === 'Page.loadEventFired'); i++) await sleep(100)
      await ev('document.fonts.ready')
      await sleep(step.settle ?? 600)
    }
    if (step.viewport) { const [vw, vh] = step.viewport; await s('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 1, mobile: vw <= 420 }) }
    if (step.reduced !== undefined) await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: step.reduced ? 'reduce' : 'no-preference' }] })
    if (step.throttle !== undefined) await s('Emulation.setCPUThrottlingRate', { rate: step.throttle })
    if (step.profile === 'start') { await s('Profiler.enable'); await s('Profiler.setSamplingInterval', { interval: 200 }); await s('Profiler.start') }
    if (step.profile === 'stop') {
      const { profile } = await s('Profiler.stop')
      const self = new Map(), byId = new Map(profile.nodes.map((n) => [n.id, n]))
      const dt = profile.timeDeltas; const total = profile.endTime - profile.startTime
      profile.samples.forEach((id, i) => { const n = byId.get(id); const k = `${n.callFrame.functionName || '(anon)'} ${(n.callFrame.url.split('/').pop() || '').split('?')[0]}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0)) })
      const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, step.top ?? 18)
      console.log('profile (self ms of', Math.round(total / 1000), 'ms):'); top.forEach(([k, v]) => console.log('  ', (v / 1000).toFixed(0).padStart(5), k))
    }
    if (step.cdp) for (const [method, params] of step.cdp) { await s(method, params); if (step.gap) await sleep(step.gap) }
    if (step.js) console.log('js:', JSON.stringify(await ev(step.js)))
    if (step.tap) { const r = await ev(TAP(step.tap)); if (r !== 'ok') console.log(r) }
    if (step.wait) await sleep(step.wait)
    if (step.shot) {
      let clip
      if (step.el) {
        // Clip to an element (with a margin), scrolled into view first.
        const r = await ev(`(() => { const e = document.querySelector(${JSON.stringify(step.el)}); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height] })()`)
        if (Array.isArray(r)) { const m = step.margin ?? 24; clip = { x: Math.max(0, r[0] - m), y: Math.max(0, r[1] - m), width: r[2] + m * 2, height: r[3] + m * 2, scale: 1 } }
      }
      const shot = await s('Page.captureScreenshot', { format: 'png', clip })
      writeFileSync(step.shot, Buffer.from(shot.data, 'base64'))
      // With "frame": true, record where the app frame is, for the escape check.
      if (step.frame) writeFileSync(step.shot + '.json', JSON.stringify(await ev(`(() => { const r = document.getElementById('hl-frame').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight } })()`)))
      console.log('saved', step.shot)
    }
    if (step.fps) {
      const { ms = 2000, label = '' } = step.fps
      const rec = s('Runtime.evaluate', { expression: RECORD(ms), awaitPromise: true, returnByValue: true })
      await sleep(30)
      if (step.fps.tap) await ev(TAP(step.fps.tap))
      if (step.fps.js) await ev(step.fps.js)
      if (step.fps.cdp) for (const [method, params] of step.fps.cdp) await s(method, params)
      const r = await rec
      console.log('fps', label, JSON.stringify(r.result.value))
    }
  }
} finally {
  ws.close()
  proc.kill()
}
