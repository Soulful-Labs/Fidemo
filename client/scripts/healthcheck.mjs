// Renders every route and reports anything that is not a working screen:
// a route that falls through to Not Found, a React error, or a console error.
//
//   node --experimental-websocket scripts/healthcheck.mjs [route ...]
//
// This catches a different fault from the click audit. The audit asks whether
// a control does something; this asks whether the screen is there at all.
// /help/tickets and /studies/:id/pay/due were both in the route map, both
// drew the Not-Found placeholder, and no click audit would have said so.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5174'
const args = process.argv.slice(2)

const chrome = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
].filter(Boolean).find((p) => existsSync(p))
if (!chrome) { console.error('no chrome found; set CHROME'); process.exit(1) }

const ROUTES = args.length > 0 ? args : readFileSync(
  join(import.meta.dirname, 'routes.txt'), 'utf8',
).split('\n').map((l) => l.trim()).filter(Boolean)

const port = 9700 + (process.pid % 200)
const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, '--no-first-run',
  '--disable-gpu', '--hide-scrollbars', '--no-default-browser-check',
  '--user-data-dir=' + join(process.env.TEMP ?? '/tmp', `health-${process.pid}`),
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function endpoint() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      return (await res.json()).webSocketDebuggerUrl
    } catch { await sleep(200) }
  }
  throw new Error('chrome did not start')
}

async function main() {
  const ws = new globalThis.WebSocket(await endpoint())
  await new Promise((r) => { ws.onopen = r })

  let id = 0
  const waiting = new Map()
  const errors = []
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push((m.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160))
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push('THROWN: ' + (m.params.exceptionDetails?.exception?.description ?? '').split('\n')[0].slice(0, 160))
    }
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result ?? { error: m.error }); waiting.delete(m.id) }
  }
  const send = (method, params = {}, sessionId) => new Promise((res) => {
    id += 1; waiting.set(id, res); ws.send(JSON.stringify({ id, method, params, sessionId }))
  })

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const s = (m, p) => send(m, p, sessionId)
  await s('Page.enable')
  await s('Runtime.enable')
  await s('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false })

  const SESSION = `try{localStorage.setItem('fi-client-session',JSON.stringify({accounts:[],current:'jennifer@soulfullabs.com'}))}catch(e){}`
  let bad = 0

  for (const route of ROUTES) {
    const url = base + '/' + route.replace(/^\/+/, '')
    errors.length = 0
    await s('Page.navigate', { url })
    await sleep(500)
    await s('Runtime.evaluate', { expression: SESSION })
    await s('Page.navigate', { url: url + (url.includes('?') ? '&' : '?') + '_h=' + Date.now() })
    await sleep(900)
    const r = await s('Runtime.evaluate', {
      expression: `JSON.stringify({
        path: location.pathname,
        notFound: /Not built yet|Not Found/.test(document.body.textContent),
        empty: document.body.textContent.trim().length < 200,
        controls: document.querySelectorAll('button, a[href]').length,
      })`,
      returnByValue: true,
    })
    const out = JSON.parse(r.result.value)
    const faults = []
    if (out.notFound) faults.push('NOT FOUND')
    if (out.empty) faults.push('page is empty')
    if (out.path !== '/' + route.replace(/^\/+/, '').split('?')[0]) faults.push(`landed on ${out.path}`)
    // React key and prop warnings are errors worth naming; a failed asset is not.
    const real = [...new Set(errors)].filter((e) => !/favicon|net::ERR/.test(e))
    if (real.length > 0) faults.push(...real.map((e) => 'console: ' + e))
    if (faults.length > 0) {
      bad += 1
      console.log(`\n${route}`)
      faults.forEach((f) => console.log('    ' + f))
    } else {
      console.log(`${route}  ok  (${out.controls} controls)`)
    }
  }
  console.log(`\nroutes with faults: ${bad} of ${ROUTES.length}`)
  proc.kill()
  process.exit(0)
}

main().catch((e) => { console.error(e); proc.kill(); process.exit(1) })
