// The screener a client builds, followed end to end in a real browser on the
// one origin: built in the Create flow, saved on submit, read back in the
// client app after a reload, shown to the console on review, and asked of a
// respondent. Prints YES / NO for each of the four.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/screener-check.mjs
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

/** Fills three of the builder's question blocks, as a client would: text, then each option. */
const SCREENER = [
  { at: 0, text: 'Do you use a sleep tracker at the moment?', options: ['Yes, most nights', 'No'] },
  { at: 1, text: 'Which kinds of tracker have you used?', options: ['A watch', 'A ring', 'A phone app'] },
  { at: 3, text: 'How many nights a week do you wear it?', options: [] },
]
const BUILD_SCREENER = `(() => {
  const blocks = [...document.querySelectorAll('input[placeholder="Enter question text..."]')]
  for (const q of ${JSON.stringify(SCREENER)}) {
    __type(blocks[q.at], q.text)
    const opts = [...blocks[q.at].closest('.py-4').querySelectorAll('input[placeholder="Enter option"]')]
    q.options.forEach((o, i) => __type(opts[i], o))
  }
  return true })()`

/** Sets Monday to 9 to 5 in the availability composer and copies it to every day, as a client would. */
const SET_HOURS = `(async () => {
  const wait = () => new Promise((r) => setTimeout(r, 80))
  const pick = async (label, t) => { document.querySelector('[aria-label="' + label + '"]').click(); await wait(); [...document.querySelectorAll('[role=option]')].find((o) => o.textContent.trim() === t).click(); await wait() }
  await pick('Monday from', '09:00 AM'); await pick('Monday to', '05:00 PM')
  document.querySelector('[aria-label="Copy Monday"]').click(); await wait()
  return true })()`



const results = []
const say = (n, name, yes, detail = '') => { results.push(yes); console.log(`${yes ? 'YES' : 'NO '}  ${n}. ${name}${detail ? '\n       ' + detail : ''}`) }
const WANT = [
  ['Do you use a sleep tracker at the moment?', 'Single-select'],
  ['Which kinds of tracker have you used?', 'Multi-select'],
  ['How many nights a week do you wear it?', 'Number input'],
]
/** The prompts found on a screen, in the order they appear, with the type written nearest after each. */
/** The client app writes a question's type after its prompt; the console writes it in a pill above. */
const read = (typeBefore) => `(() => { const text = document.querySelector('main').innerText; const want = ${JSON.stringify(WANT)}; const kinds = ['Single-select', 'Multi-select', 'Number input']; return want.map(([p]) => { const i = text.indexOf(p); const near = i < 0 ? '' : ${typeBefore} ? text.slice(Math.max(0, i - 60), i) : text.slice(i, i + 260); const hit = kinds.filter((k) => near.includes(k)).sort((a, b) => ${typeBefore} ? near.lastIndexOf(b) - near.lastIndexOf(a) : near.indexOf(a) - near.indexOf(b))[0]; return { prompt: p, at: i, type: hit ?? '' } }) })()`
const READ = read(false)
const judge = (found) => found.every((f) => f.at >= 0) && found.every((f, i) => i === 0 || f.at > found[i - 1].at) && found.every((f, i) => f.type === WANT[i][1])
const show = (found) => found.map((f) => `${f.at < 0 ? 'MISSING' : 'found'} "${f.prompt}" as ${f.type || '?'}`).join(' | ')

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)

// Signing in resets the demo, so both sign-ins come before the study is made.
await R.open('/signin', 'localStorage.clear()')
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 1500)
await I.open('/internal/signin')
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 1200)
console.log('console signed in as', await I.ev(`document.querySelector('nav[aria-label=Main]').innerText.split('\\n').slice(-2).join(' / ')`))

// 1. the client builds the study and three questions of different types
const TITLE = 'Screener check ' + Date.now().toString(36)
await C.open('/client/studies', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)
await C.go('/client/studies/create/about')
await C.click('Video Call')
await C.ev(`(() => { __type(document.querySelector('input[placeholder="Enter title of your study"]'), ${JSON.stringify(TITLE)}); __type(document.querySelector('textarea[placeholder="Enter study description"]'), 'How people use sleep trackers.'); return true })()`)
await C.click('Continue')
// Work Function and Industry are required on the Audience step.
await C.ev(`(async () => { const f = (ph, v) => __type(document.querySelector('input[placeholder="' + ph + '"]'), v); await (async (list) => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Select work functions...').click(); await w(250); for (const t of list) { [...document.querySelectorAll('[role=menuitemcheckbox]')].find((x) => x.textContent.trim() === t).click(); await w(150) } document.querySelector('button[aria-label=Close]')?.click(); await w(150) })(['Consultation', 'Patient Care', 'Research']); f('e.g. Healthcare, Finance', 'Healthcare'); return true })()`); await sleep(150)
await C.click('Continue')
await C.ev(BUILD_SCREENER); await sleep(300)
const built = await C.ev(`[...document.querySelectorAll('input[placeholder="Enter question text..."]')].map((i, n) => ({ n: n + 1, text: i.value, type: i.closest('.py-4').querySelectorAll('button')[0].innerText.trim() })).filter((q) => q.text)`)
say(1, 'As a client, create a study and add 3 screener questions with different answer types', built.length === 3 && new Set(built.map((b) => b.type)).size === 3, built.map((b) => `block ${b.n}: "${b.text}" (${b.type})`).join(' | '))
await C.click('Continue')
await C.click('Set Timing Availability'); await C.ev(SET_HOURS); await C.click('Continue', 700); await C.click('Proceed to Publish')
// The demo client's saved card is already selected at Publish.
await C.click('Publish Study', 900)
const id = await C.ev(`(__st().studies.find((s) => s.title === ${JSON.stringify(TITLE)}) || {}).id`)
console.log('submitted:', id, 'landed on', await C.path())

// 2. reload, open the study, read its screener back
// A study in review reads back on its own screen (15 Oct 2026); the questions are on its Screener tab, each type above its question.
await C.open(`/client/studies/${id}/manage?tab=screener`)
const inClient = await C.ev(read(true))
say(2, 'Submit it, reload the page, open the study: all 3 are there, right types, right order', judge(inClient), `${await C.path()} after a full reload: ${show(inClient)}`)

// 3. the console, signed in as Peter, reviewing that study
await I.go(`/internal/studies/review/${id}?tab=screener`)
const inConsole = await I.ev(read(true))
say(3, 'As peter@focusinsite.com in the console, open that study for review: the same 3 questions appear', judge(inConsole), `${await I.path()}: ${show(inConsole)}`)
await I.click('Approve to Publish', 400); await I.click('Approve and Publish', 800)

// 4. the respondent reaches the screener and is asked those questions
await R.go(`/studies/${id}`)
if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 900); else await R.click('Apply', 900)
const asked = []
const pre = await R.ev(`__st().studies.find((s) => s.id === ${JSON.stringify(id)}).preScreener`)
for (let i = 0; i < 12 && !(await R.path()).endsWith('/applied'); i++) {
  const seen = await R.ev(`(() => {
    const text = document.querySelector('main').innerText
    const prompt = ${JSON.stringify(WANT.map((w) => w[0]))}.find((p) => text.includes(p)) || ''
    const control = document.querySelector('main input[inputmode=decimal]') ? 'Number input' : document.querySelector('[role=checkbox]') ? 'Multi-select' : document.querySelector('[role=radio]') ? 'Single-select' : document.querySelector('textarea') ? 'text' : '?'
    const options = [...document.querySelectorAll('[role=radio], [role=checkbox]')].map((o) => o.innerText.trim())
    return { prompt, control, options } })()`)
  if (seen.prompt && !asked.some((a) => a.prompt === seen.prompt)) asked.push(seen)
  await R.ev(`(() => {
    const q = ${JSON.stringify(pre)}.find((x) => __has(x.prompt)); if (q) { __click(q.passing[0]); return }
    const num = document.querySelector('main input[inputmode=decimal]'); if (num) { __type(num, '5'); return }
    const opt = [...document.querySelectorAll('[role=radio], [role=checkbox]')].find(__vis); if (opt) opt.click() })()`)
  await sleep(250)
  const next = await R.ev(`['Check eligibility', 'Submit', 'Continue'].find((t) => { const b = __q(t); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }) || ''`)
  if (!next) break
  await R.click(next, 900)
}
const right = asked.length === 3 && asked.every((a, i) => a.prompt === WANT[i][0] && a.control === WANT[i][1])
say(4, 'As a respondent, reach that study\'s screener: the same 3 questions are asked', right && (await R.path()).endsWith('/applied'),
  asked.map((a) => `"${a.prompt}" as ${a.control}${a.options.length ? ' [' + a.options.join(', ') + ']' : ''}`).join(' | ') + ` | ended at ${await R.path()}`)
const saved = await R.ev(`(() => { const s = __st().studies.find((x) => x.id === ${JSON.stringify(id)}); const p = s.participations.find((x) => x.personId === 'jonathan'); return { state: p && p.state, answers: p && p.answers } })()`)
console.log('the respondent\'s answers, as the platform holds them:', JSON.stringify(saved))

console.log(`\n${results.filter(Boolean).length} of ${results.length} yes`)
ws.close(); proc.kill()
process.exit(0)
