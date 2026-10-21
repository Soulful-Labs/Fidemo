// The two landing pages (client at /client, console at /internal), checked in
// a real browser on the one origin at 1440 x 900 and 1440 x 1200: containment,
// the sticky header, where every button goes, and that nobody signed in ever
// sees them. Prints PASS / FAIL per check.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/landing-check.mjs
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5180'
const chrome = [process.env.CHROME, join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean).find((p) => existsSync(p))
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', 'about:blank'])
const wsUrl = await new Promise((resolve, reject) => {
  let buf = ''
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]) })
  setTimeout(() => reject(new Error('chrome did not start')), 15000)
})
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
const errors = []
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result) }
  else if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description?.split('\n')[0])
}
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, sessionId })) })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const HELPERS = `
  window.__vis = (el) => el && el.offsetParent !== null;
  window.__q = (text, root = document) => [...root.querySelectorAll('button, a, [role=radio], [role=checkbox], [role=tab], [role=option], [role=row]')]
    .find((el) => el.textContent.trim().replace(/\\s+/g, ' ').startsWith(text) && __vis(el));
  window.__click = (text, root) => { const el = __q(text, root); if (!el) throw new Error('no control: ' + text); if (el.disabled || el.getAttribute('aria-disabled') === 'true') throw new Error('disabled: ' + text); el.click(); return true };
  window.__type = (el, value) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); return true };
  window.__push = (path) => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); return true };
  window.__has = (t) => document.body.innerText.includes(t);
  window.__st = () => JSON.parse(localStorage.getItem('fi-platform'));
`
async function tab(name, width, height, mobile) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const s = (m, p) => send(m, p, sessionId)
  await s('Page.enable'); await s('Runtime.enable')
  await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
  const ev = async (expression) => {
    const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(`[${name}] ` + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text).split('\n')[0])
    return r.result.value
  }
  const t = {
    name, ev, targetId,
    /** A full load: used once per tab, to open it. */
    open: async (path, before = '') => {
      await s('Page.navigate', { url: base + path }); await sleep(1500)
      if (before) { await ev(before); await s('Page.navigate', { url: base + path }); await sleep(1500) }
      await ev(HELPERS)
    },
    /** In-app navigation: the router moves, the page does not reload. */
    go: async (path) => { await ev(HELPERS); await ev(`__push(${JSON.stringify(path)})`); await sleep(700) },
    click: async (text, wait = 500) => { await ev(HELPERS); await ev(`__click(${JSON.stringify(text)})`); await sleep(wait) },
    has: async (text) => { await ev(HELPERS); return ev(`__has(${JSON.stringify(text)})`) },
    path: () => ev('location.pathname'),
    /** Waits up to `ms` for the text to appear, without reloading. */
    waitFor: async (text, ms = 4000) => { for (let i = 0; i < ms / 200; i++) { if (await t.has(text)) return true; await sleep(200) } return false },
    /** Proof the tab never reloaded: a marker set at open survives. */
    mark: () => ev('window.__alive = true'),
    alive: () => ev('window.__alive === true'),
  }
  return t
}



const results = []
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }

/** Runs in the page: containment, clipping, overlap and word-fit, for whatever is on screen. */
const CONTAIN = `(() => {
  const vw = innerWidth, out = { outside: [], clipped: [], overlap: [], sliced: [], images: [] }
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
  const name = (el) => (el.tagName.toLowerCase() + ':' + (el.textContent || el.alt || '').trim().replace(/\\s+/g, ' ').slice(0, 40))
  const all = [...document.querySelectorAll('body *')].filter(vis)
  for (const el of all) { const r = el.getBoundingClientRect(); if (r.left < -0.5 || r.right > vw + 0.5) out.outside.push(name(el)) }
  if (document.documentElement.scrollWidth > vw) out.outside.push('document is ' + document.documentElement.scrollWidth + ' wide')
  // text boxes: an element holding its own text
  const texty = all.filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
  const canvas = document.createElement('canvas').getContext('2d')
  for (const el of texty) {
    const s = getComputedStyle(el)
    if ((el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && (s.overflowX !== 'visible' || s.overflowY !== 'visible')) out.clipped.push(name(el))
    if (s.wordBreak === 'break-all' || s.overflowWrap === 'anywhere') out.sliced.push('breaks anywhere: ' + name(el))
    canvas.font = s.fontWeight + ' ' + s.fontSize + ' ' + s.fontFamily
    // Measure as drawn: the type styles carry a negative letter spacing that a bare measureText leaves out.
    canvas.letterSpacing = s.letterSpacing === 'normal' ? '0px' : s.letterSpacing
    const inner = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)
    for (const w of el.textContent.split(/\\s+/)) if (w && s.display !== 'inline' && canvas.measureText(w).width > inner + 2) { out.sliced.push('word wider than its box: "' + w + '" in ' + name(el)); break }
  }
  // overlap: leaf blocks (text holders, buttons, images) that intersect without one containing the other
  const leaves = all.filter((el) => (texty.includes(el) || el.tagName === 'IMG' || el.tagName === 'BUTTON') && !el.closest('header'))
  for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
    const a = leaves[i], b = leaves[j]
    if (a.contains(b) || b.contains(a)) continue
    const p = a.getBoundingClientRect(), q = b.getBoundingClientRect()
    const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)
    if (w > 2 && h > 2) out.overlap.push(name(a) + ' x ' + name(b))
  }
  for (const img of document.images) if (!img.complete || img.naturalWidth === 0) out.images.push(img.getAttribute('src'))
  return out
})()`

const SIZES = [[1440, 900], [1440, 1200]]
const summary = (c) => ['outside', 'clipped', 'overlap', 'sliced', 'images'].filter((k) => c[k].length).map((k) => `${k}: ${c[k].slice(0, 3).join(' | ')}`).join('; ')

// ------------------------------------------------------------------ the client landing page, signed out
for (const [w, h] of SIZES) {
  const T = await tab('client', w, h, false)
  await T.open('/client/', 'localStorage.clear()')
  const at = `client ${w}x${h}`
  ok(`${at}: signed out, /client shows the landing page`, await T.has('Recruit verified participants') && await T.path() === '/client/')
  const c = await T.ev(CONTAIN)
  ok(`${at}: nothing outside the frame, sliced, clipped or overlapping; every image loaded`, !summary(c), summary(c))
  const fold = await T.ev(`(() => { const hero = document.querySelector('main section'); const els = [hero.querySelector('h1'), ...hero.querySelectorAll('p, button')]; return { bottom: Math.max(...els.map((e) => e.getBoundingClientRect().bottom)), top: hero.querySelector('p').getBoundingClientRect().top, header: document.querySelector('header').getBoundingClientRect().bottom, buttons: [...hero.querySelectorAll('button')].map((b) => b.textContent) } })()`)
  ok(`${at}: hero complete above the fold, under the header (headline, line, Sign Up, Log In)`, fold.bottom <= h && fold.top >= fold.header && fold.buttons.join() === 'Sign Up,Log In', `hero ends at ${Math.round(fold.bottom)} of ${h}`)
  // sticky at every position, and nothing hidden behind it
  const max = await T.ev(`document.documentElement.scrollHeight - innerHeight`)
  const stuck = []
  for (const y of [0, 240, 900, 1800, 2700, max]) {
    await T.ev(`scrollTo(0, ${y})`); await sleep(120)
    const s = await T.ev(`(() => { const hd = document.querySelector('header'); const r = hd.getBoundingClientRect(); const top = document.elementFromPoint(720, 35); const btn = document.elementFromPoint(1238, 35); return { top: r.top, on: hd.contains(top), signUp: btn && btn.textContent.trim() } })()`)
    if (s.top !== 0 || !s.on || s.signUp !== 'Sign Up') stuck.push(`at ${y}: ${JSON.stringify(s)}`)
  }
  ok(`${at}: header stays fixed at the top, uncovered, with Sign Up reachable, at six scroll positions`, stuck.length === 0, stuck.join('; '))
  const hidden = await T.ev(`(() => { const hb = document.querySelector('header').getBoundingClientRect().bottom; const bad = []; for (const s of document.querySelectorAll('main section')) { s.scrollIntoView(); const first = s.querySelector('h1, h2, p'); const t = first.getBoundingClientRect().top; if (t < hb - 0.5 && t > -1) bad.push(first.textContent.slice(0, 30) + ' at ' + Math.round(t)) } scrollTo(0, 0); return bad })()`)
  ok(`${at}: no section starts hidden behind the sticky header`, hidden.length === 0, hidden.join('; '))
  // every section, scrolled into view, passes containment too
  const per = []
  const count = await T.ev(`document.querySelectorAll('main section').length`)
  for (let i = 0; i < count; i++) { await T.ev(`document.querySelectorAll('main section')[${i}].scrollIntoView()`); await sleep(100); const s = summary(await T.ev(CONTAIN)); if (s) per.push(`section ${i + 1}: ${s}`) }
  ok(`${at}: every section readable when scrolled to`, per.length === 0, per.join('; '))
  await send('Target.closeTarget', { targetId: T.targetId }).catch(() => {})
}

// ------------------------------------------------------------------ the console entrance, signed out
for (const [w, h] of SIZES) {
  const T = await tab('console', w, h, false)
  await T.open('/internal/', 'localStorage.clear()')
  const at = `console ${w}x${h}`
  ok(`${at}: signed out, /internal shows the entrance`, await T.has('Focus Insite team console') && await T.path() === '/internal/')
  const c = await T.ev(CONTAIN)
  ok(`${at}: nothing outside the frame, sliced, clipped or overlapping`, !summary(c), summary(c))
  const fit = await T.ev(`({ doc: document.documentElement.scrollHeight, view: innerHeight, card: document.querySelector('main > div > div').getBoundingClientRect().bottom })`)
  ok(`${at}: one screen, no scrolling`, fit.doc <= fit.view && fit.card <= fit.view, `card ends at ${Math.round(fit.card)} of ${h}`)
  const words = await T.ev(`({ buttons: [...document.querySelectorAll('button')].map((b) => b.textContent), links: document.querySelectorAll('a').length })`)
  ok(`${at}: only Log In, nothing else to click (no sign-up since 22 Oct 2026)`, words.buttons.join() === 'Log In' && words.links === 0, JSON.stringify(words))
}

// ------------------------------------------------------------------ where the buttons go
{
  const T = await tab('client', 1440, 900, false)
  const reach = async (label, press, want) => { await T.open('/client/', 'localStorage.clear()'); await T.ev(press); await sleep(500); ok(`client: ${label} reaches ${want}`, await T.path() === want, await T.path()) }
  const nth = (sel, text, n) => `(() => { const b = [...document.querySelectorAll('${sel}')].filter((x) => x.textContent.trim() === '${text}'); b[${n}].click(); return true })()`
  await reach('header Sign Up', nth('header button', 'Sign Up', 0), '/client/signup')
  await reach('header Log In', nth('header button', 'Log In', 0), '/client/signin')
  await reach('hero Sign Up', nth('main button', 'Sign Up', 0), '/client/signup')
  await reach('hero Log In', nth('main button', 'Log In', 0), '/client/signin')
  await reach('closing Sign Up', nth('main button', 'Sign Up', 1), '/client/signup')
  await reach('closing Log In', nth('main button', 'Log In', 1), '/client/signin')
  await reach('footer Sign Up', nth('footer a', 'Sign Up', 0), '/client/signup')
  await reach('footer Log In', nth('footer a', 'Log In', 0), '/client/signin')
  await reach('footer participant app link', `(() => { [...document.querySelectorAll('footer a')].at(-1).click(); return true })()`, '/')
  await T.open('/client/', 'localStorage.clear()')
  const links = await T.ev(`[...document.querySelectorAll('a')].map((a) => a.getAttribute('href'))`)
  ok('client: no dead links (every link has a real address)', links.every((x) => x && x !== '#'), links.join(' '))
  const primary = await T.ev(`[...document.querySelectorAll('button')].filter((b) => getComputedStyle(b).backgroundImage.includes('gradient')).map((b) => b.textContent.trim())`)
  ok('client: one primary action, Sign Up (header, hero, close)', primary.length === 3 && primary.every((x) => x === 'Sign Up'), primary.join(','))

  await T.open('/client/', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)
  ok('client: signed in as a client, /client does NOT show the landing page', await T.path() === '/client/dashboard' && !(await T.has('Recruit verified participants')), await T.path())

  const I = await tab('console', 1440, 900, false)
  await I.open('/internal/', 'localStorage.clear()')
  await I.click('Log In', 500); ok('console: Log In reaches sign in', await I.path() === '/internal/signin', await I.path())
  await I.open('/internal/'); ok('console: no Sign Up on the entrance (accounts are made by a master admin)', !(await I.has('Sign Up')), 'Sign Up is on the entrance')
  await I.open('/internal/signin')
  await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`); await I.click('Login', 900)
  await I.open('/internal/')
  ok('console: signed in as peter@focusinsite.com, /internal does NOT show the entrance', await I.path() === '/internal/dashboard' && !(await I.has('Focus Insite team console')), await I.path())

  const R = await tab('respondent', 375, 812, true)
  await R.open('/', 'localStorage.clear()')
  ok('respondent: its landing page still shows at /', await R.path() === '/' && (await R.ev(`document.getElementById('root').innerText.length`)) > 300)
}

console.log(`\n${results.filter(Boolean).length} of ${results.length} passed`)
ws.close(); proc.kill()
process.exit(0)
