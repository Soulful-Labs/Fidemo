// Containment on every client screen, at 1440 x 900 and 1440 x 1200: nothing is
// wider than the window, and nothing that can be seen sits outside it sideways.
// Routes come from scripts/routes.txt. Run against a served build:
//
//   BASE_URL=http://localhost:5180/client node --experimental-websocket scripts/containment.mjs
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5174/client'
const routes = readFileSync(new URL('./routes.txt', import.meta.url), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
const chrome = [process.env.CHROME, join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean).find((p) => existsSync(p))
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--hide-scrollbars', 'about:blank'])
const wsUrl = await new Promise((resolve, reject) => {
  let buf = ''
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]) })
  setTimeout(() => reject(new Error('chrome did not start')), 15000)
})
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result) } }
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, sessionId })) })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const s = (m, p) => send(m, p, sessionId)
await s('Page.enable'); await s('Runtime.enable')
const ev = async (expression) => (await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value

// Elements that leave the window sideways and can be seen. Anything inside a scroller of its own is that scroller's business.
const PROBE = `(() => {
  const W = innerWidth, out = []
  if (document.documentElement.scrollWidth > W + 1) out.push('page is ' + document.documentElement.scrollWidth + ' wide')
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed' && cs.inset === '0px') continue
    if (r.right > W + 1 || r.left < -1) {
      let p = el.parentElement, clipped = false
      while (p) { const o = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(o.overflowX)) { clipped = true; break } p = p.parentElement }
      if (!clipped) out.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : '') + ' ' + Math.round(r.left) + '..' + Math.round(r.right))
    }
  }
  return out.slice(0, 4) })()`

let faults = 0, checked = 0
for (const [w, h] of [[1440, 900], [1440, 1200]]) {
  await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
  await s('Page.navigate', { url: base + '/' }); await sleep(900)
  await ev(`localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)
  for (const route of routes) {
    await s('Page.navigate', { url: `${base}/${route}` }); await sleep(650)
    const found = await ev(PROBE)
    checked += 1
    if (found.length) { faults += 1; console.log(`OUT  ${w}x${h}  ${route}\n       ${found.join('\n       ')}`) }
  }
}
console.log(`\ncontainment: ${checked - faults} of ${checked} screen renders contained (${routes.length} routes at two sizes)`)
ws.close(); proc.kill()
process.exit(faults ? 1 : 0)
