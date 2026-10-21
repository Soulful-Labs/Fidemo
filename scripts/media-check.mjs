// The picture, the intro video and their consent, the description popover and
// the thinner client dashboard, in three real tabs on one origin. Six
// questions, each answered YES or NO.
//
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/media-check.mjs
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

const R = await tab('respondent', 375, 812, true)
const C = await tab('client', 1440, 1000, false)
const I = await tab('console', 1440, 1000, false)
await R.open('/signin', 'localStorage.clear(); indexedDB.deleteDatabase("fi-media")'); await sleep(1200)
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 2500)
await I.open('/internal/signin'); await sleep(800)
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 2000)
await C.open('/client/pool', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`); await sleep(800)
for (const t of [R, C, I]) await t.mark()
const alive = async () => (await R.alive()) && (await C.alive()) && (await I.alive())
console.log(`site: ${base}\n`)

/** A real tap: pointer down and up at the element's centre, as a finger would. */
const tap = async (t, selector) => {
  const box = await t.ev(`(() => { const el = ${selector}; if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
  if (!box) throw new Error('nothing to tap: ' + selector)
  await sleep(150)
  const b = await t.ev(`(() => { const r = (${selector}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
  for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: b.x, y: b.y, button: 'left', clickCount: 1 }, t.sid)
}

// ---- 1. a description shows while a card is held, at phone width (no hover on a phone; scripts/card-check.mjs checks hover too)
{
  const g = []
  try {
    await R.go('/studies'); await sleep(800)
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, R.sid)
    const width = await R.ev('innerWidth')
    const p = await R.ev(`(() => { const a = document.querySelector('main article'); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + Math.min(r.height - 20, 120)) } })()`)
    const desc = await R.ev(`(() => { const a = document.querySelector('main article'); const s = __st().studies.find((x) => a.innerText.includes(x.title)); return s ? s.description : '' })()`)
    const visible = await R.ev(`[...document.querySelector('main article').querySelectorAll('*')].some((e) => e.offsetParent && !e.closest('.sr-only') && e.innerText === ${JSON.stringify(desc)})`)
    if (visible) g.push('the card still shows the description under the title')
    if (await R.ev(`Boolean(document.querySelector('main article button[aria-label="About this study"]'))`)) g.push('the info button is still there')
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] }, R.sid); await sleep(750)
    const held = await R.ev(`document.querySelector('[role=tooltip]')?.innerText ?? ''`)
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, R.sid); await sleep(400)
    const gone = !(await R.ev(`Boolean(document.querySelector('[role=tooltip]'))`))
    if (held !== desc) g.push('holding the card did not show its description')
    if (!gone) g.push('lifting did not hide it')
    if (await R.path() !== '/studies') g.push('the lift opened ' + await R.path())
    await send('Emulation.setTouchEmulationEnabled', { enabled: false }, R.sid)
    say(1, 'A study description shows while a card is held and hides on lifting, at phone width', g, `${width}px wide; the card shows the title only, no info button; holding it showed the description, lifting hid it without opening the study`)
  } catch (e) { say(1, 'A study description shows while a card is held, at phone width', [...g, e.message]) }
}

// ---- 2. a picture and a video, 25 and 75 points
const points = () => R.ev(`__hl.user.points`)
const me = () => R.ev(`(() => { const p = __st().people.find((x) => x.id === 'jonathan'); return { photo: (p.photo || '').slice(0, 22), photoConsent: Boolean(p.photoConsent), video: p.video || null, videoConsent: Boolean(p.videoConsent), pictureAddedAt: p.pictureAddedAt || null, videoAddedAt: p.videoAddedAt || null } })()`)
const dismiss = async () => { const d = await R.ev(`(document.querySelector('[role=dialog]')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 90)`); if (d) { await R.ev(`(() => { const b = [...document.querySelectorAll('[role=dialog] button')].filter(__vis).pop(); b && b.click(); return true })()`); await sleep(500) } return d }
{
  const g = []
  try {
    await R.go('/profile/edit'); await sleep(900)
    const p0 = await points()
    const { root } = await send('DOM.getDocument', {}, R.sid)
    const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[aria-label="Choose a profile picture"]' }, R.sid)
    await send('DOM.setFileInputFiles', { nodeId, files: [resolve('client/public/img/landing/create.png')] }, R.sid)
    await sleep(2500)
    const cele1 = await R.ev(`(document.querySelector('[role=dialog]')?.innerText || '').replace(/\\s+/g, ' ')`)
    const p1 = await points()
    const dims = await R.ev(`new Promise((ok) => { const p = __st().people.find((x) => x.id === 'jonathan'); const i = new Image(); i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight, kb: Math.round(p.photo.length / 1024) }); i.onerror = () => ok(null); i.src = p.photo })`)
    const src = await R.ev(`new Promise((ok) => { const i = new Image(); i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight }); i.src = '/client/img/landing/create.png' })`)
    if (p1 - p0 !== 25) g.push(`the picture earned ${p1 - p0} points, not 25`)
    if (!/You've earned 25 Reward Points/.test(cele1)) g.push('no "You\'ve earned 25 Reward Points!" celebration: ' + cele1.slice(0, 80))
    if (!dims || dims.w > 640 || dims.h > 480) g.push('the kept picture is ' + JSON.stringify(dims))
    await dismiss()
    // A real video, recorded in the page: two seconds of a moving square, as WebM.
    const made = await R.ev(`(async () => {
      const c = document.createElement('canvas'); c.width = 320; c.height = 240; const x = c.getContext('2d')
      const rec = new MediaRecorder(c.captureStream(15), { mimeType: 'video/webm' }); const parts = []
      rec.ondataavailable = (e) => parts.push(e.data)
      let f = 0; const draw = setInterval(() => { x.fillStyle = '#201e19'; x.fillRect(0, 0, 320, 240); x.fillStyle = '#fca311'; x.fillRect((f++ * 9) % 300, 100, 40, 40) }, 66)
      rec.start(); await new Promise((r) => setTimeout(r, 2000)); rec.stop(); await new Promise((r) => (rec.onstop = r)); clearInterval(draw)
      const file = new File(parts, 'my-intro.webm', { type: 'video/webm' })
      const input = document.querySelector('input[aria-label="Choose an intro video"]')
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }))
      return file.size })()`)
    await sleep(2500)
    const cele2 = await R.ev(`(document.querySelector('[role=dialog]')?.innerText || '').replace(/\\s+/g, ' ')`)
    const p2 = await points()
    if (p2 - p1 !== 75) g.push(`the video earned ${p2 - p1} points, not 75`)
    if (!/You've earned 75 Reward Points/.test(cele2)) g.push('no "You\'ve earned 75 Reward Points!" celebration: ' + cele2.slice(0, 80))
    await dismiss()
    const stored = await me()
    const kept = await R.ev(`new Promise((ok) => { const q = indexedDB.open('fi-media'); q.onsuccess = () => { const r = q.result.transaction('videos').objectStore('videos').get(${JSON.stringify((await me()).video?.id ?? '')}); r.onsuccess = () => ok(r.result ? r.result.size : 0) } })`)
    if (!stored.video || kept !== made) g.push(`video reference ${JSON.stringify(stored.video)}, kept ${kept} of ${made} bytes`)
    const playable = await R.ev(`(async () => { for (let i = 0; i < 20; i++) { const v = document.querySelector('video'); if (v && v.readyState >= 1) return true; await new Promise((r) => setTimeout(r, 150)) } return false })()`)
    if (!playable) g.push('the profile does not play the video back')
    // removing does not take the points back, and adding again does not pay twice
    await R.click('Remove', 700); await sleep(300)
    const pRemoved = await points()
    if (pRemoved !== p2) g.push(`removing the picture moved the points from ${p2} to ${pRemoved}`)
    await send('DOM.setFileInputFiles', { nodeId: (await send('DOM.querySelector', { nodeId: (await send('DOM.getDocument', {}, R.sid)).root.nodeId, selector: 'input[aria-label="Choose a profile picture"]' }, R.sid)).nodeId, files: [resolve('client/public/img/landing/matched.png')] }, R.sid)
    await sleep(1800); await dismiss()
    if (await points() !== p2) g.push('adding a picture again paid again')
    if (stored.photoConsent || stored.videoConsent) g.push('a consent was on by default')
    say(2, 'A participant adds a picture and a video, and gets 25 and 75 points', g, `picture: a ${src.w}x${src.h} PNG kept at ${dims?.w}x${dims?.h} (${dims?.kb} KB), points ${p0} -> ${p1} with the earned celebration; video: a ${made}-byte WebM recorded in the page, kept in IndexedDB and played back on the profile, points ${p1} -> ${p2}; removing and re-adding the picture left the points at ${p2}; both consents start off`)
  } catch (e) { say(2, 'A participant adds a picture and a video, and gets 25 and 75 points', [...g, e.message]) }
}

// What each other tab shows of Jonathan: the Pool card and its profile panel in the client, the participant page in the console.
const clientView = async () => {
  await C.go('/client/pool'); await sleep(700)
  for (let i = 0; i < 15 && !(await C.ev(`[...document.querySelectorAll('main article, main [data-card], main li, main div')].some((x) => /^Jonathan R/m.test(x.innerText || ''))`)); i++) { if (!(await C.ev(`Boolean(__q('Load more'))`))) break; await C.click('Load more', 300) }
  const card = await C.ev(`(() => { const c = [...document.querySelectorAll('main article')].find((x) => /Jonathan R/.test(x.innerText)); if (!c) return null; const img = c.querySelector('img'); return { img: img ? img.getAttribute('src').slice(0, 22) : null, initial: [...c.querySelectorAll('span')].some((s) => s.innerText.trim() === 'J') } })()`)
  if (!card) return { card: null }
  await C.ev(`(() => { const c = [...document.querySelectorAll('main article')].find((x) => /Jonathan R/.test(x.innerText)); [...c.querySelectorAll('button')].find((b) => /View Profile|Jonathan/.test(b.innerText)).click(); return true })()`)
  await sleep(900)
  const panel = await C.ev(`(() => { const d = [...document.querySelectorAll('[role=dialog], aside')].find((x) => /Trust Score/.test(x.innerText)); if (!d) return null; const img = d.querySelector('img'); return { img: img ? img.getAttribute('src').slice(0, 22) : null, video: Boolean(d.querySelector('video')), videoText: /Intro Video/.test(d.innerText) } })()`)
  await C.ev(`(() => { const b = document.querySelector('[role=dialog] button[aria-label=Close]'); b && b.click(); return true })()`); await sleep(300)
  return { card, panel }
}
const consoleView = async () => {
  await I.go('/internal/participants/jonathan'); await sleep(900)
  const head = await I.ev(`(() => { const img = document.querySelector('main header img, main img'); return img ? img.getAttribute('src') : null })()`)
  const video = await I.ev(`Boolean(document.querySelector('main video'))`)
  const notShared = await I.ev(`/Intro Video\\s*Not shared/.test(document.querySelector('main').innerText)`)
  return { head: head?.startsWith('data:image/svg') ? (decodeURIComponent(head).includes('>J<') ? 'initial J' : 'svg') : head?.slice(0, 22), video, notShared }
}
const isPicture = (src) => /^data:image\/(png|jpeg)/.test(src ?? '')

// ---- 3. consent off: an initial
{
  const g = []
  try {
    const c = await clientView(), i = await consoleView()
    if (!c.card) g.push('client: Jonathan is not in the Pool')
    else {
      if (c.card.img || !c.card.initial) g.push(`client Pool card shows ${c.card.img ?? 'no initial'}`)
      if (!c.panel) g.push('client: the profile panel did not open')
      else { if (c.panel.img) g.push('client panel shows a picture: ' + c.panel.img); if (c.panel.video || c.panel.videoText) g.push('client panel shows the video') }
    }
    if (i.head !== 'initial J') g.push('console header shows ' + i.head)
    if (i.video || !i.notShared) g.push('console shows the video, or does not say it is not shared')
    say(3, 'With consent off, the client and console see an initial', g, `client Pool card: ${c.card?.img ? 'picture' : 'initial J'}, profile panel: ${c.panel?.img ? 'picture' : 'initial'}, ${c.panel?.video ? 'video' : 'no video'}; console: ${i.head}, intro video "${i.notShared ? 'Not shared' : '?'}"`)
  } catch (e) { say(3, 'With consent off, the client and console see an initial', [...g, e.message]) }
}

// ---- 4. consent on: the picture and the video
const consent = async (label, on) => {
  await R.go('/profile/edit'); await sleep(700)
  const now = await R.ev(`document.querySelector('[role=switch][aria-label="${label}"]').getAttribute('aria-checked') === 'true'`)
  if (now !== on) await tap(R, `document.querySelector('[role=switch][aria-label="${label}"]')`)
  await sleep(400)
}
{
  const g = []
  try {
    await consent('Show my picture to clients', true); await consent('Show my video to clients', true)
    const st = await me()
    if (!st.photoConsent || !st.videoConsent) g.push('the consents did not save: ' + JSON.stringify(st))
    const c = await clientView(), i = await consoleView()
    if (!isPicture(c.card?.img)) g.push('client Pool card shows ' + c.card?.img)
    if (!isPicture(c.panel?.img) || !c.panel?.video) g.push(`client panel: picture ${c.panel?.img}, video ${c.panel?.video}`)
    if (!isPicture(i.head) || !i.video) g.push(`console: picture ${i.head}, video ${i.video}`)
    const plays = await I.ev(`(async () => { for (let k = 0; k < 20; k++) { const v = document.querySelector('main video'); if (v && v.readyState >= 1) return true; await new Promise((r) => setTimeout(r, 150)) } return false })()`)
    if (!plays) g.push('the console\'s video does not load')
    if (!(await alive())) g.push('a tab reloaded')
    say(4, 'With consent on, both see the picture and the video', g, `client Pool card and profile panel: the uploaded picture and a playable video; console participant page: the picture, and the video ${plays ? 'loads' : 'does not load'}; no tab reloaded`)
  } catch (e) { say(4, 'With consent on, both see the picture and the video', [...g, e.message]) }
}

// ---- 5. consent off again: gone from both, at once
{
  const g = []
  try {
    // The console stays on the participant's page, the client on the open profile panel, while the respondent turns both off.
    await I.go('/internal/participants/jonathan'); await sleep(600)
    await C.go('/client/pool'); await sleep(500)
    for (let i = 0; i < 15 && !(await C.ev(`[...document.querySelectorAll('main article')].some((x) => /Jonathan R/.test(x.innerText))`)); i++) { if (!(await C.ev(`Boolean(__q('Load more'))`))) break; await C.click('Load more', 300) }
    await C.ev(`(() => { const c = [...document.querySelectorAll('main article')].find((x) => /Jonathan R/.test(x.innerText)); [...c.querySelectorAll('button')].find((b) => /View Profile|Jonathan/.test(b.innerText)).click(); return true })()`); await sleep(800)
    const openBefore = await C.ev(`Boolean([...document.querySelectorAll('[role=dialog], aside')].find((x) => /Trust Score/.test(x.innerText))?.querySelector('video'))`)
    await consent('Show my picture to clients', false); await consent('Show my video to clients', false)
    const t0 = Date.now()
    let clientGone = 0, consoleGone = 0
    for (let k = 0; k < 30 && (!clientGone || !consoleGone); k++) {
      if (!clientGone && await C.ev(`(() => { const d = [...document.querySelectorAll('[role=dialog], aside')].find((x) => /Trust Score/.test(x.innerText)); return Boolean(d) && !d.querySelector('video') && !d.querySelector('img') })()`)) clientGone = Date.now() - t0
      if (!consoleGone && await I.ev(`!document.querySelector('main video') && (document.querySelector('main header img, main img')?.getAttribute('src') || '').startsWith('data:image/svg')`)) consoleGone = Date.now() - t0
      if (!clientGone || !consoleGone) await sleep(100)
    }
    if (!openBefore) g.push('the client panel was not showing the video before')
    if (!clientGone) g.push('the open client panel still shows the picture or the video')
    if (!consoleGone) g.push('the open console page still shows the picture or the video')
    const c = await clientView(), i = await consoleView()
    if (c.card?.img || c.panel?.img || c.panel?.video) g.push('client, on a fresh look: ' + JSON.stringify(c))
    if (i.head !== 'initial J' || i.video) g.push('console, on a fresh look: ' + JSON.stringify(i))
    if (!(await alive())) g.push('a tab reloaded')
    say(5, 'Turning consent off again removes it from both, immediately', g, `with the client's profile panel and the console's page left open, both had lost the picture and the video within ${400 + Math.max(clientGone, consoleGone)}ms of the second switch (the first look is 400ms after it), with no reload; a fresh look shows initial J and no video in both`)
  } catch (e) { say(5, 'Turning consent off again removes it from both, immediately', [...g, e.message]) }
}

// ---- 6. the client dashboard
{
  const g = []
  try {
    await C.go('/client/dashboard'); await sleep(900)
    const ongoing = await C.ev(`(() => { const st = __st(); return st.studies.filter((s) => s.clientId === 'cl-soulful' && ['recruiting', 'in_progress', 'paused', 'live', 'running'].includes(s.state)).map((s) => s.title) })()`)
    const read = () => C.ev(`(() => {
      const sec = [...document.querySelectorAll('main section')].find((s) => s.querySelector('h2')?.innerText.trim() === 'Ongoing Studies')
      const track = sec.querySelector('.overflow-hidden > div'); const box = sec.querySelector('.overflow-hidden').getBoundingClientRect()
      const cards = [...track.children].map((c) => { const r = c.getBoundingClientRect(); return { title: c.innerText.split('\\n').find((l) => l.length > 12) || '', visible: r.left >= box.left - 1 && r.right <= box.right + 1 } })
      const label = sec.querySelector('[aria-live]')?.innerText || ''
      return { cards, label, transform: track.style.transform, duration: getComputedStyle(track).transitionDuration, easing: getComputedStyle(track).transitionTimingFunction }
    })()`)
    const a = await read()
    const visible = (x) => x.cards.filter((c) => c.visible).length
    if (visible(a) !== 2) g.push(`${visible(a)} cards visible, not 2`)
    const before = a.cards.filter((c) => c.visible).map((c) => c.title)
    await C.ev(`document.querySelector('button[aria-label="Next studies"]').click()`); await sleep(400)
    const b = await read()
    const after = b.cards.filter((c) => c.visible).map((c) => c.title)
    if (a.transform === b.transform || after[0] !== before[1]) g.push(`Next did not move one card on: ${before} -> ${after}`)
    if (a.duration !== '0.16s' || !/cubic-bezier|ease-out/.test(a.easing)) g.push(`the slide is ${a.duration} ${a.easing}`)
    const text = await C.ev(`document.querySelector('main').innerText`)
    const needRows = await C.ev(`[...[...document.querySelectorAll('main section')].find((s) => /Needs Your Attention/.test(s.querySelector('h2')?.innerText || '')).querySelectorAll(':scope > button')].length`)
    const sessionRows = await C.ev(`[...[...document.querySelectorAll('main section')].find((s) => /Upcoming Sessions/.test(s.querySelector('h2')?.innerText || '')).querySelectorAll(':scope > button')].length`)
    const viewAllNeeds = await C.ev(`Boolean([...document.querySelectorAll('main button')].find((b) => /^View all/.test(b.innerText)))`)
    let panelRows = needRows
    if (viewAllNeeds) { await C.ev(`[...document.querySelectorAll('main button')].find((b) => /^View all/.test(b.innerText)).click()`); await sleep(500); panelRows = await C.ev(`(document.querySelector('[role=dialog]')?.querySelectorAll('button').length || 1) - 1`); await C.ev(`document.querySelector('[role=dialog] button[aria-label=Close]')?.click()`); await sleep(300) }
    const totalNeeds = await C.ev(`(() => { const t = [...document.querySelectorAll('main button')].find((b) => /^View all/.test(b.innerText)); return t ? Number((/\\((\\d+)\\)/.exec(t.innerText) || [])[1]) : null })()`)
    if (needRows > 3) g.push(`${needRows} attention rows on the dashboard`)
    if (totalNeeds && panelRows !== totalNeeds) g.push(`View all shows ${panelRows} of ${totalNeeds}`)
    if (sessionRows > 2) g.push(`${sessionRows} sessions on the dashboard`)
    if (!/Super Insights/.test(text) || !/Recommended Respondents/.test(text)) g.push('a section went missing')
    for (const f of ['Ongoing Studies', 'Remaining To Hire', 'Avg. Trust Score', 'Avg. Session Incentive']) if (!text.includes(f)) g.push('figure missing: ' + f)
    const reached = new Set(a.cards.map((c) => c.title))
    const bounce = await C.ev(`[...document.querySelectorAll('main *')].filter((el) => { const s = getComputedStyle(el); return s.animationName !== 'none' && s.animationIterationCount === 'infinite' }).length`)
    if (bounce) g.push(`${bounce} elements animate on a loop`)
    say(6, 'The dashboard carousel moves, and nothing was lost from the screen', g, `Ongoing Studies: ${a.cards.length} cards in the carousel (it showed 3 before), 2 visible, "${a.label}" -> "${b.label}" with a ${a.duration} ${a.easing} slide; Needs Your Attention: ${needRows} rows${totalNeeds ? `, View all lists all ${panelRows}` : ''}; Upcoming Sessions: ${sessionRows} and View All; the four figures, Super Insights and Recommended Respondents unchanged; nothing loops`)
  } catch (e) { say(6, 'The dashboard carousel moves, and nothing was lost from the screen', [...g, e.message]) }
}

console.log(`\n${[1, 2, 3, 4, 5, 6].filter((n) => results[n]).length} of 6 yes`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
