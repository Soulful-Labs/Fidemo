// Clicks every clickable element on every route and reports the ones that do
// nothing.
//
// The static scan this replaces only asked whether a handler existed. That
// missed a Copy button whose handler swallowed its own failure and a
// notification row that had no handler on the row at all. This clicks the
// thing and watches for a consequence: the URL changing, the DOM changing, or
// a toast appearing. No consequence, no pass.
//
//   node --experimental-websocket scripts/clickaudit.mjs [route ...]
//
// With no arguments it walks every route in scripts/routes.txt. A click that
// navigates ends the pass; the driver reloads and resumes at the next
// element, so every control is reached without one click hiding the rest.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5174'
const args = process.argv.slice(2)

const candidates = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
].filter(Boolean)
const chrome = candidates.find((p) => existsSync(p))
if (!chrome) {
  console.error('no chrome found; set CHROME')
  process.exit(1)
}

const ROUTES = args.length > 0 ? args : readFileSync(
  join(import.meta.dirname, 'routes.txt'), 'utf8',
).split('\n').map((l) => l.trim()).filter(Boolean)

const port = 9400 + (process.pid % 200)
const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, '--no-first-run',
  '--disable-gpu', '--hide-scrollbars', '--no-default-browser-check',
  '--user-data-dir=' + join(process.env.TEMP ?? '/tmp', `clickaudit-${process.pid}`),
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      return (await res.json()).webSocketDebuggerUrl
    } catch {
      await sleep(200)
    }
  }
  throw new Error('chrome did not start')
}

/**
 * Runs in the page. Audits clickable elements from index `FROM`, stops as
 * soon as one navigates, and reports what it found plus where it stopped.
 */
const AUDIT = `(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const label = (el) => (
    el.getAttribute('aria-label') ||
    (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 64) ||
    ('<' + el.tagName.toLowerCase() + '>')
  )
  const here = () => location.pathname + location.search
  // A hash, not a length: reordering table rows keeps the length identical
  // and would read as a dead sort header. One click per page load, so no
  // click can hide or fake the next one.
  const shape = () => {
    const html = document.body.innerHTML
    let h = 0
    for (let i = 0; i < html.length; i += 1) { h = (h * 31 + html.charCodeAt(i)) | 0 }
    return h
  }
  const pick = () => [...document.querySelectorAll('button, a[href], [role="tab"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return false
      if (el.hasAttribute('disabled')) return false
      // Deliberately inert: the tab you are on, the page you are on and a
      // choice already made are marked current or pressed, so a click that
      // changes nothing is the right behaviour, not a dead control.
      if (el.getAttribute('aria-current')) return false
      if (el.getAttribute('aria-pressed') === 'true') return false
      if (el.getAttribute('aria-checked') === 'true') return false
      if (el.getAttribute('aria-selected') === 'true') return false
      return true
    })

  const dead = []
  const all = pick()
  let i = FROM
  for (; i < all.length; i += 1) {
    const el = all[i]
    if (!el || !el.isConnected) continue
    const url0 = here()
    const dom0 = shape()
    try { el.click() } catch (e) { dead.push(label(el) + ' [threw]'); continue }
    await sleep(120)
    const navigated = here() !== url0
    const changed = shape() !== dom0
    const toast = !!document.querySelector('[role="status"]')
    if (!navigated && !changed && !toast) dead.push(label(el))
    // One click per load. Clicking on means a filter narrows the list, a
    // panel is already open or a tab is already active, and the next control
    // reads as dead when it is only redundant. Those were most of the first
    // run's findings.
    i += 1
    break
  }
  return JSON.stringify({ dead, next: i, total: all.length })
})()`

async function main() {
  const wsUrl = await endpoint()
  const ws = new globalThis.WebSocket(wsUrl)
  await new Promise((r) => { ws.onopen = r })

  let id = 0
  const waiting = new Map()
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && waiting.has(msg.id)) {
      waiting.get(msg.id)(msg.result ?? { error: msg.error })
      waiting.delete(msg.id)
    }
  }
  const send = (method, params = {}, sessionId) => new Promise((res) => {
    id += 1
    waiting.set(id, res)
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const s = (m, p) => send(m, p, sessionId)
  await s('Page.enable')
  await s('Runtime.enable')
  await s('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false })

  const SESSION = `try{localStorage.setItem('fi-client-session',JSON.stringify({accounts:[],current:'jennifer@soulfullabs.com'}))}catch(e){}`
  let total = 0

  for (const route of ROUTES) {
    const url = base + '/' + route.replace(/^\/+/, '')
    const found = []
    let from = 0
    for (let pass = 0; pass < 40; pass += 1) {
      await s('Page.navigate', { url })
      await sleep(700)
      await s('Runtime.evaluate', { expression: SESSION })
      await s('Page.navigate', { url: url + (url.includes('?') ? '&' : '?') + '_a=' + Date.now() })
      await sleep(900)
      const r = await s('Runtime.evaluate', {
        expression: `const FROM = ${from};` + AUDIT,
        awaitPromise: true,
        returnByValue: true,
      })
      if (!r || r.error || r.exceptionDetails) {
        found.push('[audit error] ' + (r?.exceptionDetails?.text ?? JSON.stringify(r?.error)))
        break
      }
      const out = JSON.parse(r.result.value)
      found.push(...out.dead)
      if (out.next >= out.total) break
      from = out.next
    }
    total += found.length
    if (found.length > 0) {
      console.log(`\n${route}  (${found.length})`)
      found.forEach((d) => console.log('    ' + d))
    } else {
      console.log(`${route}  ok`)
    }
  }
  console.log(`\ntotal dead controls: ${total}`)
  proc.kill()
  process.exit(0)
}

main().catch((e) => { console.error(e); proc.kill(); process.exit(1) })
