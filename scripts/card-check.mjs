// Study descriptions on the whole card (hover on a pointer, press and hold on
// touch), and the re-shot landing screenshots, in real tabs at 375px. Six
// questions, YES or NO.
//
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/card-check.mjs
import { resolve } from 'node:path'
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
  const t = { sid: sessionId,
    name, ev,
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

// ---------------------------------------------------------------- the check

/** Helpers for the client's forms: fields by placeholder or label, pickers by the value they show. */
const FORMS = `
  window.__wait = (ms = 90) => new Promise((r) => setTimeout(r, ms));
  window.__all = (sel, root = document) => [...root.querySelectorAll(sel)].filter(__vis);
  window.__ph = (ph, v, n = 0, root = document) => { const el = __all('input, textarea', root).filter((e) => e.placeholder === ph)[n]; if (!el) throw new Error('no field: ' + ph + ' #' + n); return __type(el, v) };
  window.__al = (label, n = 0) => { const el = __all('[aria-label="' + label + '"]')[n]; if (!el) throw new Error('no control labelled: ' + label + ' #' + n); return el };
  window.__btn = (text, n = 0) => { const el = __all('button').filter((b) => b.textContent.trim().replace(/\\s+/g, ' ').startsWith(text))[n]; if (!el) throw new Error('no button: ' + text + ' #' + n); return el };
  window.__exact = (text) => { const el = __all('button').filter((b) => b.textContent.trim() === text).pop(); if (!el) throw new Error('no option: ' + text); return el };
  window.__choose = async (opener, ...options) => { opener.click(); await __wait(); for (const o of options) { __exact(o).click(); await __wait() } const close = __all('button[aria-label=Close]')[0]; if (close) { close.click(); await __wait() } };
  window.__time = async (label, t, n = 0) => { __al(label, n).click(); await __wait(); const o = __all('[role=option]').find((x) => x.textContent.trim() === t); if (!o) throw new Error('no time: ' + t); o.click(); await __wait() };
`
const after = (n) => new Date(Date.now() + n * 864e5)
const two = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`
const dmy = (d) => `${two(d.getDate())} / ${two(d.getMonth() + 1)} / ${d.getFullYear()}`
const heading = (d) => `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`
const tag = Date.now().toString(36).slice(-4)

const THREE = [
  { at: 0, text: 'Do you use a sleep tracker at the moment?', options: ['Yes, most nights', 'No'] },
  { at: 1, text: 'Which kinds of tracker have you used?', options: ['A watch', 'A ring', 'A phone app'] },
  { at: 3, text: 'How many nights a week do you wear it?', options: [] },
]
/** Eight of the builder's nine answer types. File Upload is left blank: a headless browser cannot choose a file for the respondent. */
const EIGHT = [
  { at: 0, text: 'Have you bought anything online this month?', options: ['Yes', 'No'] },
  { at: 1, text: 'Where do you shop?', options: ['Marketplaces', 'Brand sites', 'Social apps'] },
  { at: 2, text: 'Which shop did you use last?', options: [] },
  { at: 3, text: 'How many orders did you place last month?', options: [] },
  { at: 4, text: 'Describe your last return.', options: [] },
  { at: 5, text: 'How easy was checkout?', slider: ['1', '5', '1'] },
  { at: 6, text: 'Rank what matters most.', rank: ['Price', 'Delivery speed'] },
  { at: 8, text: 'Rate each stage.', columns: ['Poor', 'Good'], rows: ['Search', 'Checkout'] },
]
const buildScreener = (qs) => `(() => {
  const blocks = __all('input').filter((e) => e.placeholder === 'Enter question text...')
  for (const q of ${JSON.stringify(qs)}) {
    const root = blocks[q.at].closest('.py-4')
    __type(blocks[q.at], q.text)
    ;(q.options || []).forEach((o, i) => __ph('Enter option', o, i, root))
    ;(q.slider || []).forEach((v, i) => __ph('0', v, i, root))
    ;(q.rank || []).forEach((v, i) => __ph('Enter email address', v, i, root))
    if (q.columns) { const cols = __all('input', root).filter((e) => e.placeholder === 'Enter column item...'); q.columns.forEach((v, i) => __type(cols[i], v)); const rows = __all('input', root).filter((e) => e.placeholder === 'Enter row item...'); q.rows.forEach((v, i) => __type(rows[i], v)) }
  }
  return true })()`

const AUDIENCE = { participants: '', roles: 'Oncologist, Nurse', functions: 'Consultation', skills: 'Triage', industries: 'Healthcare' }
const fillAudience = (participants) => `(async () => {
  __type(__all('main input')[0], ${JSON.stringify(participants)})
  await __choose(__btn('2 countries selected'), 'United Kingdom', 'Canada')
  await __choose(__btn('All Genders'), 'Female')
  await __choose(__btn('2 range selected'), '18–20', '21–29', '30–39', '40–54')
  __ph('Choose job roles...', ${JSON.stringify(AUDIENCE.roles)}); __ph('Select job functions...', ${JSON.stringify(AUDIENCE.functions)})
  __ph('Choose skills...', ${JSON.stringify(AUDIENCE.skills)}); __ph('Choose industry domains...', ${JSON.stringify(AUDIENCE.industries)})
  __all('[role=radio]')[0].click(); await __wait()
  __btn('Select tiers...').click(); await __wait(); [...document.querySelectorAll('[role=option]')].find((o) => o.textContent.trim().startsWith('Silver Tier')).click(); await __wait()
  return true })()`
/** Education is left as the step opens with it; the pool holds one level of education, so any other would estimate an audience of none. */
const AUDIENCE_SHOWN = ['United States of America, Canada', 'Female', "Graduate or Bachelor's", '30–39, 40–54', 'Oncologist, Nurse', 'Consultation', 'Triage', 'Healthcare', 'Silver and above']

const hours = (from, to) => `await __time('Monday from', ${JSON.stringify(from)}); await __time('Monday to', ${JSON.stringify(to)}); __al('Copy Monday').click(); await __wait(); __al('Saturday').click(); await __wait(); __al('Sunday').click(); await __wait();`
const address = (street, city, zip) => `__ph('Office number, Building/Street name, Area', ${JSON.stringify(street)}); __ph('City, State', ${JSON.stringify(city)}); __ph('Zip Code', ${JSON.stringify(zip)}); await __wait(); __all('button').filter((b) => b.textContent.trim() === 'Add Address').pop().click(); await __wait();`
const session = (d, t) => `__type(__al('Session date'), ${JSON.stringify(ymd(d))}); await __time('Session start time', ${JSON.stringify(t)}); __exact('Add').click(); await __wait();`



// ------------------------------------------------------------ the six checks
const results = []
const say = (n, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.join('; ') : ''}`) }

/** A phone-width tab with a mouse (pointer device), and one with touch and no mouse. */
const P = await tab('pointer', 375, 812, false)
const T = await tab('touch', 375, 812, true)
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, T.sid)
await send('Emulation.setEmitTouchEventsForMouse', { enabled: false }, T.sid)
for (const t of [P, T]) {
  await t.open('/signin', 'localStorage.clear()'); await sleep(1200)
  await t.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
  await t.click('Login', 2500)
}
console.log(`site: ${base}\n`)

const tips = (t) => t.ev(`[...document.querySelectorAll('[role=tooltip]')].map((x) => ({ text: x.innerText, opacity: Number(getComputedStyle(x).opacity) }))`)
const centre = (t, n, part = 'body') => t.ev(`(() => { const a = document.querySelectorAll('main article')[${n}]; if (!a) return null; a.scrollIntoView({ block: 'center' }); const el = ${part === 'title' ? "a.querySelector('button.text-left') || a" : 'a'}; const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + (${part === 'title' ? 'r.height / 2' : 'Math.min(r.height - 20, 120)'})) } })()`)
const descOf = (t, n) => t.ev(`(() => { const a = document.querySelectorAll('main article')[${n}]; const s = __st().studies.find((x) => a.innerText.includes(x.title)); return s ? { id: s.id, d: s.description } : null })()`)
const mouse = (t, type, p, extra = {}) => send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'none', ...extra }, t.sid)
const touch = (t, type, p) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] }, t.sid)

// ---- 1. hover shows it, moving off hides it
{
  const g = []
  await P.go('/studies'); await sleep(800)
  const a = await centre(P, 0); const want = await descOf(P, 0)
  await mouse(P, 'mouseMoved', { x: 2, y: 2 }); await sleep(200)
  await mouse(P, 'mouseMoved', a)
  const t0 = Date.now(); let full = 0
  for (let i = 0; i < 40; i++) { const s = await tips(P); if (s[0]?.opacity >= 0.99) { full = Date.now() - t0; break } await sleep(15) }
  const on = await tips(P)
  if (on.length !== 1 || on[0].text !== want.d) g.push(`hovering showed ${JSON.stringify(on).slice(0, 120)}`)
  const pos = await P.ev(`(() => { const t = document.querySelector('[role=tooltip]').getBoundingClientRect(), a = document.querySelectorAll('main article')[0].getBoundingClientRect(); return { inside: t.left >= a.left && t.right <= a.right && t.top >= a.top, pointerEvents: getComputedStyle(document.querySelector('[role=tooltip]')).pointerEvents } })()`)
  if (!pos.inside) g.push('the popover is not over its card')
  await mouse(P, 'mouseMoved', { x: 187, y: 4 }); await sleep(300)
  const off = await tips(P)
  if (off.length) g.push('moving off left it showing')
  say(1, 'Hovering a card shows its description, moving off hides it', g, `pointer at 375px: hovering the first card showed "${want.d.slice(0, 50)}..." fully in about ${full}ms (fade and 4px lift, 160ms, ease-out, no spring), over the card with pointer-events ${pos.pointerEvents}; moving off hid it`)
}

// ---- 2. clicking the card still opens the study
{
  const g = []
  await P.go('/studies'); await sleep(700)
  const a = await centre(P, 0, 'title'); const want = await descOf(P, 0)
  await mouse(P, 'mouseMoved', a); await sleep(250)
  await mouse(P, 'mousePressed', a, { button: 'left', clickCount: 1 }); await mouse(P, 'mouseReleased', a, { button: 'left', clickCount: 1 }); await sleep(700)
  const path = await P.path()
  if (path !== `/studies/${want.id}`) g.push('a click went to ' + path)
  if ((await tips(P)).length) g.push('the popover stayed after opening the study')
  // and on touch, a quick tap
  await T.go('/studies'); await sleep(700)
  const b = await centre(T, 0, 'title'); const wantT = await descOf(T, 0)
  await touch(T, 'touchStart', b); await sleep(80); await touch(T, 'touchEnd', b); await sleep(700)
  const tpath = await T.path()
  if (tpath !== `/studies/${wantT.id}`) g.push('a quick tap went to ' + tpath)
  say(2, 'Clicking the card still opens the study', g, `a mouse click on the card opened ${path}; a quick tap on touch opened ${tpath}`)
}

// ---- 3. press and hold on touch
{
  const g = []
  await T.go('/studies'); await sleep(700)
  const a = await centre(T, 0); const want = await descOf(T, 0)
  await touch(T, 'touchStart', a); await sleep(250)
  const early = (await tips(T)).length
  await sleep(500)
  const held = await tips(T)
  await touch(T, 'touchEnd', a); await sleep(400)
  const after = await tips(T)
  const path = await T.path()
  if (early) g.push('it showed before the hold time')
  if (held.length !== 1 || held[0].text !== want.d) g.push('holding showed ' + JSON.stringify(held).slice(0, 100))
  if (after.length) g.push('lifting did not hide it')
  if (path !== '/studies') g.push('lifting after a hold opened ' + path)
  // a finger that moves is scrolling, not holding
  await touch(T, 'touchStart', a); await sleep(150)
  await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y - 40 }] }, T.sid); await sleep(600)
  const moved = (await tips(T)).length
  await touch(T, 'touchEnd', a); await sleep(200)
  if (moved) g.push('a moving finger showed it')
  const hover = await T.ev(`matchMedia('(hover: none)').matches`)
  say(3, 'Press and hold on a touch device shows it', g, `touch emulation (hover: none is ${hover}): nothing at 250ms, the description at 750ms, gone on lifting, and the lift did not open the study; a finger that moved 40px showed nothing`)
}

// ---- 4. one at a time
{
  const g = []
  await P.go('/studies'); await sleep(700)
  const counts = []
  await mouse(P, 'mouseMoved', { x: 187, y: 4 }); await sleep(150)
  for (const n of [0, 1, 2, 1, 0]) {
    const p = await centre(P, n); if (!p) continue
    await mouse(P, 'mouseMoved', p); await sleep(260)
    counts.push((await tips(P)).length)
  }
  if (counts.some((c) => c !== 1)) g.push('popovers open while moving card to card: ' + counts.join(','))
  await T.go('/studies'); await sleep(700)
  const a = await centre(T, 0); await touch(T, 'touchStart', a); await sleep(700)
  const b = await centre(T, 1)
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }, { x: b.x, y: b.y }] }, T.sid); await sleep(700)
  const two = (await tips(T)).length
  await touch(T, 'touchEnd', a); await sleep(300)
  if (two > 1) g.push(`${two} open with two fingers held`)
  say(4, 'Only one shows at a time', g, `moving the mouse across cards 1, 2, 3, 2, 1 left ${counts.join(', ')} open at each stop; holding two cards at once left ${two} open`)
}

// ---- 5. no "i" button anywhere
{
  const g = []
  const lists = ['/dashboard', '/studies', '/studies/saved', '/studies/mine/invites', '/studies/mine/scheduled', '/studies/mine/drafts', '/studies/mine/applied', '/studies/mine/history']
  let cards = 0
  for (const path of lists) {
    await P.go(path); await sleep(600)
    const r = await P.ev(`(() => { const as = [...document.querySelectorAll('main article')]; return { cards: as.length, info: as.flatMap((a) => [...a.querySelectorAll('button')].filter((b) => /about this study|description/i.test(b.getAttribute('aria-label') || '') || b.hasAttribute('aria-expanded'))).length } })()`)
    cards += r.cards
    if (r.info) g.push(`${path}: ${r.info} info buttons`)
  }
  say(5, 'No "i" button remains anywhere', g, `${cards} study cards across ${lists.length} lists (dashboard, Explore, Saved and the five My Studies tabs); none has an info button`)
}

// ---- 6. the three re-shot screenshots match the current build
{
  const g = []
  const C = await tab('client', 1440, 900, false)
  // The screenshots are taken with scrollbars hidden (scripts/shot.mjs); a visible one narrows the page by its width.
  await send('Emulation.setScrollbarsHidden', { hidden: true }, C.sid)
  await C.open('/client/dashboard', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)
  const notes = []
  for (const [file, path] of [['create', '/client/studies/create/about?reset=1'], ['matched', '/client/studies/st-pay/matched'], ['sessions', '/client/studies/st-goal/recruited']]) {
    await send('Page.navigate', { url: base + path }, C.sid); await sleep(2200)
    const { data } = await send('Page.captureScreenshot', { format: 'png' }, C.sid)
    const shipped = (await (await fetch(`${base}/client/img/landing/${file}.png`)).arrayBuffer())
    const b64 = Buffer.from(shipped).toString('base64')
    const diff = await C.ev(`(async () => {
      const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src })
      const [a, b] = await Promise.all([load('data:image/png;base64,${data}'), load('data:image/png;base64,${b64}')])
      if (a.width !== b.width || a.height !== b.height) return { size: [a.width, a.height, b.width, b.height] }
      const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data }
      const p = px(a), q = px(b); let n = 0
      for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 30) n++
      return { pct: (100 * n) / (p.length / 4) }
    })()`)
    if (diff.size) g.push(`${file}: the shot is ${diff.size[2]}x${diff.size[3]}, the screen ${diff.size[0]}x${diff.size[1]}`)
    else if (diff.pct > 0.5) g.push(`${file}: ${diff.pct.toFixed(2)}% of pixels differ from the current build`)
    notes.push(`${file}.png ${diff.pct?.toFixed(2)}% different`)
  }
  say(6, 'The three re-shot screenshots match the current build', g, `each shipped screenshot against the same screen rendered now at 1440x900: ${notes.join(', ')}`)
}

console.log(`\n${[1, 2, 3, 4, 5, 6].filter((n) => results[n]).length} of 6 yes`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].slice(0, 6).join('\n  '))
ws.close(); proc.kill()
process.exit(0)
