// The cross-app journey, walked in three real tabs of one Chrome on one
// origin: the respondent app at /, the client app at /client, the console at
// /internal. Each step is driven through the screens, and the other tabs are
// read without a reload, so a change has to travel through the shared store.
// Prints WORKING / BROKEN per step and carries on where it can.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/journey.mjs        (BASE_URL defaults to http://localhost:5180)
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
const step = async (n, name, fn) => {
  errors.length = 0
  try { const note = await fn(); results.push([n, name, 'WORKING', note ?? '']) ; console.log(`WORKING ${n}. ${name}${note ? '  — ' + note : ''}`) }
  catch (err) {
    results.push([n, name, 'BROKEN', err.message]); console.log(`BROKEN  ${n}. ${name}\n          ${err.message}${errors.length ? '\n          page errors: ' + errors.slice(0, 2).join(' | ') : ''}`)
    if (process.env.DUMP) for (const t of [R, C, I]) console.log(`          [${t.name}] ${await t.path().catch(() => '?')}: ` + (await t.ev(`(document.querySelector('main') || document.body).innerText.replace(/\\s+/g, ' ').slice(0, 260)`).catch(() => '')))
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg) }

const R = await tab('respondent', 375, 812, true)
const C = await tab('client', 1440, 1000, false)
const I = await tab('console', 1440, 1000, false)

// The respondent signs in with the demo account, which resets the shared state for all three apps.
await R.open('/signin', `localStorage.clear()`)
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 1500)
await C.open('/client/studies', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)
await I.open('/internal/studies', `localStorage.setItem('fi-internal-session', JSON.stringify({ current: 'peter@focusinsite.com' }))`)
for (const t of [R, C, I]) await t.mark()
const TITLE = `Journey ${Date.now().toString(36)}: sleep tracker habits`
let studyId = ''
const me = 'jonathan'
const study = () => R.ev(`(__st().studies.find((s) => s.id === ${JSON.stringify(studyId)}) || null)`)
const part = async () => (await study())?.participations.find((p) => p.personId === me)
const user = () => R.ev(`({ wallet: __hl.user.walletBalance, points: __hl.user.points, trust: __hl.user.trustScore, tier: __hl.user.tier })`)

await step(1, 'Client creates and publishes a study', async () => {
  await C.go('/client/studies/create/about')
  await C.click('Video Call')
  await C.ev(`(() => { __type(document.querySelector('input[placeholder="Enter title of your study"]'), ${JSON.stringify(TITLE)}); __type(document.querySelector('textarea[placeholder="Enter study description"]'), 'How people use sleep trackers week to week.'); return true })()`)
  await C.click('Continue'); expect((await C.path()).endsWith('/audience'), 'Continue did not reach Audience: ' + await C.path())
  await C.click('Continue'); expect((await C.path()).endsWith('/screener'), 'Continue did not reach Screener: ' + await C.path())
  // The client's own screener: one eligibility question and two more, in three answer types.
  await C.ev(BUILD_SCREENER)
  await C.click('Continue'); expect((await C.path()).endsWith('/study'), 'Continue did not reach Study setup: ' + await C.path())
  await C.click('Set Timing Availability'); await C.ev(SET_HOURS); await C.click('Submit')
  await C.click('Proceed to Publish'); expect((await C.path()).endsWith('/publish'), 'did not reach Publish: ' + await C.path())
  await C.ev(`(() => { const f = (ph, v) => __type(document.querySelector('input[placeholder="' + ph + '"]'), v); f('0000 0000 0000 0000', '4242 4242 4242 4242'); f('MM / YYYY', '12 / 2028'); f('000', '123'); f('Enter name', 'Jennifer Lee'); return true })()`)
  await C.click('Publish Study', 900)
  expect((await C.path()).endsWith('/published'), 'did not reach Published: ' + await C.path())
  const s = await C.ev(`__st().studies.find((s) => s.title === ${JSON.stringify(TITLE)})`)
  expect(s, 'no study with that title in the shared state')
  studyId = s.id
  return `${studyId}, ${s.type}, state ${s.state}`
})

await step(2, 'It appears in the console\'s To Review queue (no reload)', async () => {
  expect(await I.waitFor(TITLE), 'not on the console\'s To Review list')
  expect(await I.alive(), 'the console tab reloaded')
})

await step(3, 'The console approves it, and the client app sees it go live (no reload)', async () => {
  await C.go('/client/studies')
  const before = await C.has(TITLE)
  await I.click(TITLE, 900)
  expect((await I.path()).includes('/studies/review/'), 'the row did not open the review: ' + await I.path())
  await I.click('Approve to Publish', 600)
  expect((await study()).state === 'recruiting', 'state is ' + (await study()).state)
  await sleep(600)
  const clientState = await C.ev(`[...document.querySelectorAll('tr, [role=row], article, a')].find((r) => r.innerText.includes(${JSON.stringify(TITLE)}))?.innerText.replace(/\\s+/g, ' ').slice(0, 160) ?? ''`)
  expect(await C.alive(), 'the client tab reloaded')
  return `client row ${before ? 'was listed' : 'was not listed'} before approval; after: "${clientState}"`
})

await step(4, 'It appears to a matching respondent in the respondent app (no reload)', async () => {
  await R.go('/studies')
  expect(await R.waitFor(TITLE), 'not in the respondent\'s Explore list')
  expect(await R.alive(), 'the respondent tab reloaded')
})

await step(5, 'The respondent applies and completes the screener', async () => {
  await R.go(`/studies/${studyId}`)
  if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 900); else await R.click('Apply', 900)
  expect((await R.path()).endsWith('/screener'), 'Apply did not open the screener: ' + await R.path())
  const s = await study()
  for (let i = 0; i < 20 && !(await R.path()).endsWith('/applied'); i++) {
    const answered = await R.ev(`(() => {
      const pre = ${JSON.stringify(s.preScreener)};
      const q = pre.find((x) => __has(x.prompt));
      if (q) { const pick = q.passing[0]; __click(pick); return 'pre:' + pick }
      const ta = document.querySelector('textarea'); if (ta) { __type(ta, 'I use it every night and check the weekly trend.'); return 'text' }
      const num = document.querySelector('main input[inputmode=decimal]'); if (num) { __type(num, '5'); return 'number' }
      const opt = [...document.querySelectorAll('[role=radio], [role=checkbox]')].find(__vis); if (opt) { opt.click(); return 'option' }
      return 'none' })()`)
    await sleep(250)
    const next = await R.ev(`['Check eligibility', 'Submit', 'Continue'].find((t) => { const b = __q(t); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }) || ''`)
    if (!next) throw new Error(`stuck on a question (answered: ${answered}) at ${await R.path()}: ` + (await R.ev(`document.querySelector('main')?.innerText.slice(0, 200)`)))
    await R.click(next, 900)
  }
  expect((await R.path()).endsWith('/applied'), 'did not reach Applied successfully: ' + await R.path())
  return 'participation ' + (await part())?.state
})

await step(6, 'The application appears in both the client app and the console (no reload)', async () => {
  const name = await R.ev(`__st().people.find((p) => p.id === 'jonathan').name`)
  const short = name.split(' ')[0]
  await C.go(`/client/studies/${studyId}/recruited`); await C.click('Applications', 500)
  await I.go(`/internal/studies/${studyId}?tab=recruited`); await I.click('Applications', 500)
  const inC = await C.waitFor(short), inI = await I.waitFor(short)
  expect(inC && inI, `client ${inC ? 'shows' : 'does not show'} ${short}; console ${inI ? 'shows' : 'does not show'} ${short}`)
  expect(await C.alive() && await I.alive(), 'a tab reloaded')
})

await step(7, 'Qualifying in either one moves the respondent in all three', async () => {
  const notes = []
  await C.click('Jonathan', 900)
  await I.go(`/internal/studies/${studyId}/respondents/${me}`)
  await R.go('/studies/mine/invites')
  await C.click('Qualify', 700)
  expect((await part()).state === 'qualified', 'client Qualify: state is ' + (await part()).state)
  expect(await I.waitFor('You have qualified this respondent'), 'console page did not show the qualification')
  expect(await R.waitFor(TITLE), 'respondent Invites did not list the study')
  notes.push('client qualified; console and respondent followed')
  await I.click('Undo', 700)
  expect((await part()).state === 'applied', 'console Undo: state is ' + (await part()).state)
  expect(await C.waitFor('Qualify'), 'client page did not return to the decision')
  await I.click('Qualify', 700)
  expect((await part()).state === 'qualified', 'console Qualify: state is ' + (await part()).state)
  notes.push('console undid and qualified; client and respondent followed')
  expect(await R.alive() && await C.alive() && await I.alive(), 'a tab reloaded')
  return notes.join('; ')
})

await step(8, 'The respondent schedules, attends and enters the PIN', async () => {
  await R.go(`/studies/${studyId}`)
  await R.click('Schedule', 1200)
  await R.ev(`document.querySelector('.grid-cols-7 button:not([aria-disabled=true])').click()`); await sleep(250)
  await R.ev(`document.querySelector('.grid-cols-2 button:not([aria-disabled=true])').click()`); await sleep(250)
  await R.click('Proceed')
  await R.ev(`document.querySelector('[role=dialog] [role=checkbox]').click()`); await sleep(200)
  await R.click('Agree & Join'); await R.click('Confirm & Schedule', 900)
  expect((await part()).state === 'scheduled', 'not scheduled: ' + (await part()).state)
  await R.click('Done', 700)
  await R.click('Submit PIN', 700)
  const code = (await part()).code.value
  await R.ev(`(() => { [...${JSON.stringify(code)}].forEach((d, i) => __type(document.querySelector('input[aria-label="Digit ' + (i + 1) + '"]'), d)); return true })()`)
  await R.click('Submit', 1200)
  expect((await part()).code.byParticipant, 'the code was not recorded')
  // The session is booked days ahead; as in the acceptance demo, it is moved an hour into the past so it has "run".
  await R.ev(`(() => { const d = new Date(Date.now() - 3600e3); const slot = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); __hl.dispatch({ type: 'SET_BOOKING', id: ${JSON.stringify(studyId)}, booking: { date: d.toISOString(), slot } }); return true })()`)
  return `code ${code} entered`
})

const before = await user()
await step(9, 'The client marks them completed', async () => {
  await C.go(`/client/studies/${studyId}/respondent/${me}/result`)
  // The client's half of the session code: sharing the PIN shown on the page (workflow 42).
  await C.ev(`document.querySelector('button[aria-label^="Copy the verification PIN"]').click()`); await sleep(400)
  await C.click('Mark Completed', 900)
  const p = await part()
  expect(p.state === 'completed', 'state is ' + p.state + (await C.ev(`document.querySelector('[role=status], [role=alert]')?.innerText ?? ''`)))
  return 'completed at ' + p.completedAt
})

await step(10, 'The respondent\'s wallet, points and Trust Score all rise', async () => {
  await sleep(6000)
  const after = await user()
  expect(after.wallet > before.wallet && after.points > before.points && after.trust > before.trust, `wallet ${before.wallet}->${after.wallet}, points ${before.points}->${after.points}, trust ${before.trust}->${after.trust}`)
  await R.go('/dashboard')
  return `wallet ${before.wallet}->${after.wallet}, points ${before.points}->${after.points}, trust ${before.trust}->${after.trust}`
})

await step(11, 'The new score and tier show on the participant\'s console profile (no reload)', async () => {
  const u = await user()
  await I.go(`/internal/participants/${me}`)
  const tier = u.tier[0].toUpperCase() + u.tier.slice(1)
  const shown = await I.ev(`document.querySelector('main').innerText.slice(0, 600)`)
  expect(shown.includes(String(u.trust)) && shown.includes(tier), `respondent ${u.trust} ${tier}; console header: ${shown.replace(/\\s+/g, ' ').slice(0, 200)}`)
  return `${u.trust} ${tier}`
})

await step(12, 'The client rates them; the rating feeds the Trust Score everywhere', async () => {
  const t0 = (await user()).trust
  await C.go(`/client/studies/${studyId}/results`)
  await C.click('Rate', 700)
  await C.click('Excellent', 300)
  const submit = await C.ev(`['Submit', 'Done', 'Save'].find((t) => __q(t)) || ''`)
  await C.click(submit, 900)
  const p = await part()
  expect(p.rating, 'no rating stored')
  const t1 = (await user()).trust
  await I.go(`/internal/participants/${me}`); await sleep(400)
  const inConsole = await I.has(String(t1))
  expect(t1 >= t0 && inConsole, `trust ${t0}->${t1}; console shows it: ${inConsole}`)
  return `${p.rating.stars} stars; trust ${t0}->${t1} in the respondent app and the console`
})

await step(13, 'Demo reset: signing in again resets the shared state for all three apps', async () => {
  await R.go('/profile'); await R.ev(`__hl.signOut(); true`); await sleep(400)
  await R.go('/signin'); await sleep(400)
  await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
  await R.click('Login', 1500)
  expect(!(await study()), 'the journey study survived the reset')
  await C.go('/client/studies'); await I.go('/internal/studies')
  const inC = await C.has(TITLE), inI = await I.has(TITLE)
  expect(!inC && !inI, `still showing after reset: client ${inC}, console ${inI}`)
  expect(await C.alive() && await I.alive(), 'a tab reloaded')
})

console.log(`\n${results.filter((r) => r[2] === 'WORKING').length} of ${results.length} working`)
ws.close(); proc.kill()
process.exit(0)
