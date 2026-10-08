// Renders routes of the running internal console dev server at 1440 wide in headless Chromium
// over the DevTools Protocol, using nothing outside Node and the Chrome that
// is already on this machine (hard rule 7: no new packages).
//
//   node --experimental-websocket scripts/shot.mjs <route> <out.png> [options]
//   node --experimental-websocket scripts/shot.mjs --batch <jobs.json>
//
//   --full            capture the whole scrollable page, not just 375x812
//   --js "<code>"     run this in the page after load (e.g. "__hl.signIn()")
//   --wait <ms>       extra settle time after load and --js (default 400)
//   --click "<sel>"   click a selector after --js, then wait again
//   --signed-out      render without a session, so the guards send you to /signin
//
// A batch file is a JSON array of { route, out, full?, js?, wait?, click?, width?, height? }.
// Routes are given without the leading slash ("studies/st-01") because Git
// Bash rewrites a leading slash into a Windows path.

import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}

let jobs
if (args[0] === '--batch') {
  jobs = JSON.parse(readFileSync(args[1], 'utf8'))
} else {
  const [route, out] = args
  if (!route || !out) {
    console.error('usage: shot.mjs <route> <out.png> [--full] [--js code] [--wait ms] [--click sel]')
    process.exit(1)
  }
  jobs = [{ route, out, full: args.includes('--full'), js: opt('--js', ''), click: opt('--click', ''), wait: Number(opt('--wait', 400)) }]
}

// Every screen behind the sign-in guard needs a session. The demo account is
// put into localStorage before the document runs, so a render lands on the
// route it asked for instead of bouncing to /signin. --signed-out skips it.
const SIGNED_OUT = args.includes('--signed-out')
const sessionScript = (signedIn) => signedIn
  ? `try{localStorage.setItem('fi-internal-session',JSON.stringify({current:'peter@focusinsite.com'}))}catch(e){}`
  : `try{localStorage.removeItem('fi-internal-session')}catch(e){}`

// The client app is desktop: 1440 wide, as every Figma frame is drawn.
const WIDTH = 1440
const HEIGHT = 1000
const base = process.env.BASE_URL ?? 'http://localhost:5175'

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
  '--hide-scrollbars', '--disable-gpu', `--window-size=${WIDTH},${HEIGHT}`, 'about:blank',
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

async function capture(s, job) {
  const { route, out, full = false, js = '', click = '', wait = 400, width = WIDTH, height = HEIGHT } = job
  events = []
  await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width > 420 ? 1 : 2, mobile: width <= 420 })
  await s('Page.navigate', { url: base + '/' + route.replace(/^\/+/, '') })
  for (let i = 0; i < 100; i++) {
    if (events.some((e) => e.method === 'Page.loadEventFired')) break
    await sleep(100)
  }
  /**
   * Everything behind the sign-in guard needs a session, and a batch reuses
   * one browser target, so localStorage carries between jobs. Set it for this
   * job and navigate again. A reload would replay whatever the guard
   * redirected to rather than the route that was asked for.
   */
  const signedIn = !SIGNED_OUT && job.signedOut !== true
  const target = base + '/' + route.replace(/^\/+/, '')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await s('Runtime.evaluate', { expression: sessionScript(signedIn) })
    events = []
    await s('Page.navigate', { url: target + (route.includes('?') ? '&' : '?') + '_r=' + Date.now() })
    for (let i = 0; i < 100; i++) {
      if (events.some((e) => e.method === 'Page.loadEventFired')) break
      await sleep(100)
    }
    await sleep(150)
    // The guard sends a session-less render to /signin, so check we landed
    // where we asked and try again rather than capture the wrong screen.
    const { result } = await s('Runtime.evaluate', { expression: 'location.pathname', returnByValue: true })
    const asked = '/' + route.replace(/^\/+/, '').split('?')[0]
    if (!signedIn || result.value === asked || asked === '/') break
    if (attempt === 2) console.error(`[${route}] landed on ${result.value} after 3 tries`)
  }
  await s('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
  await sleep(300)
  if (js) {
    const r = await s('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) console.error(`[${route}] js error:`, r.exceptionDetails.text, r.exceptionDetails.exception?.description)
    await sleep(wait)
  }
  for (const sel of Array.isArray(click) ? click : click ? [click] : []) {
    const r = await s('Runtime.evaluate', {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'missing'; el.click(); return 'ok' })()`,
      returnByValue: true,
    })
    if (r.result.value !== 'ok') console.error(`[${route}] click target missing:`, sel)
    await sleep(wait)
  }
  await sleep(wait)

  let clip
  if (full) {
    // The app scrolls inside <main>, so grow the viewport to its scroll height.
    const { result } = await s('Runtime.evaluate', {
      // The client app scrolls the document; the respondent app scrolls inside <main>.
      expression: `(() => { const m = document.querySelector('main'); const inner = m && m.clientHeight < m.scrollHeight ? m.scrollHeight + (window.innerHeight - m.clientHeight) : 0; return Math.max(inner, document.documentElement.scrollHeight) })()`,
      returnByValue: true,
    })
    const h = Math.max(height, Math.min(result.value, 6000))
    await s('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: width > 420 ? 1 : 2, mobile: width <= 420 })
    await sleep(200)
    clip = { x: 0, y: 0, width, height: h, scale: 1 }
  }
  const shot = await s('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: full })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))
  const url = (await s('Runtime.evaluate', { expression: 'location.pathname', returnByValue: true })).result.value
  console.log(`saved ${out}  (${url})`)
}

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const s = (m, p) => send(m, p, sessionId)
  await s('Page.enable')
  await s('Runtime.enable')
  for (const job of jobs) {
    try {
      await capture(s, job)
    } catch (err) {
      console.error(`[${job.route}] failed:`, err.message)
    }
  }
} finally {
  ws.close()
  proc.kill()
}
