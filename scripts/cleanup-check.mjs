// The final clean-up brief of 14 Oct 2026, followed in a real browser on the
// one origin, three tabs (respondent 375, console and client 1440). Each of
// the twelve checks answers yes or no.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/cleanup-check.mjs
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/cleanup-check.mjs
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

// ---------------------------------------------------------------- the twelve checks

const results = []
const say = (n, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.map((g) => JSON.stringify(g)).join(', ') : ''}`) }
const flat = (s) => (s ?? '').replace(/\s+/g, ' ')

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)

/** Signing in as the demo participant puts the demo data back for all three apps. */
async function fresh() {
  // Not localStorage.clear(): the three apps share one origin, and that would sign the console out too.
  await R.open('/signin'); await R.ev('__hl.signOut(); true'); await sleep(400); await R.open('/signin')
  await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
  await R.click('Login', 1500)
}
/** Edits the shared state in place, then reloads the tabs so every app reads it. */
async function patch(code, paths = {}) {
  await R.ev(`(() => { const s = __st(); const me = s.people.find((x) => x.id === 'jonathan'); ${code}; localStorage.setItem('fi-platform', JSON.stringify(s)); return true })()`)
  for (const [t, path] of [[R, paths.R], [C, paths.C], [I, paths.I]]) if (path) await t.open(path)
}
const st = (expr) => R.ev(`(() => { const s = __st(); const me = s.people.find((x) => x.id === 'jonathan'); return ${expr} })()`)
const slotAt = (hours) => `(() => { const d = new Date(Date.now() + ${hours} * 3600e3); d.setMinutes(0, 0, 0); const H = d.getHours(); return { date: d.toISOString(), slot: (H % 12 || 12) + ':00 ' + (H < 12 ? 'AM' : 'PM') } })()`
const trust = () => R.ev('__hl.user.trustScore')
const body = (t) => t.ev('document.body.innerText')
const clickExact = (t, text) => t.ev(`(() => { const b = [...document.querySelectorAll('button')].filter(__vis).filter((x) => x.textContent.trim() === ${JSON.stringify(text)}).pop(); if (!b) throw new Error('no button: ' + ${JSON.stringify(text)}); b.click(); return true })()`)
const typeIn = (t, selector, value, n = 0) => t.ev(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].filter(__vis)[${n}]; if (!el) throw new Error('no field ' + ${JSON.stringify(selector)}); return __type(el, ${JSON.stringify(value)}) })()`)

await R.open('/signin', 'localStorage.clear()')
await I.open('/internal/signin')
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 1200)
await fresh()

// The participant's booked one-to-one session, not yet confirmed with the code.
const S = await st(`(() => { const x = s.studies.find((y) => !/group/.test(y.type) && y.participations.some((p) => p.personId === 'jonathan' && p.state === 'scheduled' && !p.code?.byParticipant)); const c = s.clients.find((k) => k.id === x.clientId); return { id: x.id, type: x.type, title: x.title, clientEmail: c.email } })()`)
// The client tab signs in as the demo client, so the study is handed to her for the check.
console.log(`booked study: ${S.title} (${S.type})`)
const clientSession = (email) => `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: ${JSON.stringify(email)} }))`
const myState = () => st(`s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((p) => p.personId === 'jonathan').state`)

// ---- 1. Inside 24 hours a participant cannot cancel; not attending is a no-show at -4
{
  const g = []
  await patch(`const p = s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((q) => q.personId === 'jonathan'); s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).clientId = 'cl-soulful'; Object.assign(p.booking, ${slotAt(3)})`, { R: `/studies/${S.id}` })
  await sleep(500)
  const btn = await R.ev(`(() => { const b = [...document.querySelectorAll('button')].filter(__vis).find((x) => x.textContent.trim() === 'Cancel'); return b ? { disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null })()`)
  if (!btn) g.push('no Cancel button on the booked study')
  else {
    if (!btn.disabled) g.push('Cancel is enabled 3 hours before the session')
    await clickExact(R, 'Cancel'); await sleep(600)
    const said = flat(await body(R))
    if (!/24 hours/.test(said)) g.push('tapping it does not say why')
    if (!/-4/.test(said)) g.push('it does not say a no-show costs 4')
  }
  if (await myState() !== 'scheduled') g.push('the booking did not survive')
  const t0 = await trust()
  await patch(`const p = s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((q) => q.personId === 'jonathan'); s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).clientId = 'cl-soulful'; Object.assign(p.booking, ${slotAt(-2)})`,
    { C: `/client/studies/${S.id}/respondent/jonathan/result` })
  await C.ev(clientSession('jennifer@soulfullabs.com')); await C.open(`/client/studies/${S.id}/respondent/jonathan/result`)
  await C.click('Mark No-show', 600)
  await clickExact(C, 'Mark as No-Show'); await sleep(900)
  await R.open('/dashboard'); await sleep(400)
  const t1 = await trust()
  if (await myState() !== 'no_show') g.push('the client could not mark the no-show: ' + await myState())
  if (t1 !== t0 - 4) g.push(`trust ${t0} -> ${t1}, not -4`)
  say(1, 'A participant cannot cancel inside 24 hours, and not attending is a no-show at -4', g, `3 hours out: Cancel is disabled and says why on tap; after the session the client marked a no-show: Trust Score ${t0} -> ${t1}`)
}

// ---- 2. A client cancelling costs nothing, and the participant is told
{
  const g = []
  await fresh()
  await patch(`const p = s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((q) => q.personId === 'jonathan'); s.studies.find((x) => x.id === ${JSON.stringify(S.id)}).clientId = 'cl-soulful'; Object.assign(p.booking, ${slotAt(3)})`, { R: '/dashboard' })
  const t0 = await trust()
  await C.ev(clientSession('jennifer@soulfullabs.com')); await C.open(`/client/studies/${S.id}/recruited`)
  await C.click('Scheduled', 500)
  await C.ev(`(() => { const b = [...document.querySelectorAll('main button')].filter(__vis).find((x) => x.textContent.trim() === 'Cancel'); if (!b) throw new Error('no Cancel on the scheduled row'); b.click(); return true })()`); await sleep(400)
  const modal = flat(await body(C))
  if (!/costs \w+ nothing/.test(modal)) g.push('the confirmation does not say it costs them nothing')
  await clickExact(C, 'Yes, Cancel Session'); await sleep(900)
  await R.open('/notifications'); await sleep(500)
  const t1 = await trust()
  if (t1 !== t0) g.push(`trust ${t0} -> ${t1}`)
  if (await myState() === 'scheduled') g.push('the session is still booked')
  if (!(await R.has('Study cancelled by client'))) g.push('no notification for the participant')
  say(2, 'A client cancelling costs the participant nothing, and the participant is told', g, `cancelled 3 hours before, inside the participant's 24-hour window: Trust Score ${t0} -> ${t1}; state ${await myState()}; "Study cancelled by client" in their notifications`)
}

// ---- 3. A restricted participant cannot redeem, apply, attend or submit, and is told why and until when
const report = (id) => `s.reports.push({ id: '${id}', personId: 'jonathan', reportedBy: 'system', reason: 'Spam Apply', detail: 'Applied to 12 unrelated studies within an hour', at: new Date().toISOString() })`
async function restrictInConsole(id, statement) {
  await I.open(`/internal/participants/verifications/${id}`)
  await I.click('Restrict Account', 500)
  const note = flat(await I.ev(`[...document.querySelectorAll('[role=dialog]')].map((d) => d.innerText).join(' ')`))
  await typeIn(I, 'textarea', statement)
  await typeIn(I, 'input[type=password]', 'demo1234')
  const go = await I.ev(`[...document.querySelectorAll('[role=dialog] button')].filter(__vis).map((b) => b.textContent.trim()).pop()`)
  await clickExact(I, go); await sleep(400)
  await clickExact(I, 'Yes'); await sleep(700)
  const done = flat(await I.ev(`[...document.querySelectorAll('[role=dialog]')].map((d) => d.innerText).join(' ')`))
  if (await I.has('Done')) await clickExact(I, 'Done')
  return { note, done }
}
{
  const g = []
  await fresh()
  await patch(report('rp-ck1'))
  await restrictInConsole('rp-ck1', 'Repeated spam applications')
  const until = await st('me.statusNote?.until')
  const untilText = new Date(until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  await R.open('/dashboard'); await sleep(500)
  if (!(await R.has('Account restricted until'))) g.push('no restriction banner')
  const avail = await R.ev(`__hl.studies.find((x) => x.status === 'available')?.id`)
  const survey = await R.ev(`__hl.studies.find((x) => x.status === 'invited_to_complete' && x.type === 'survey')?.id`)
  const blocked = []
  const tries = [
    ['apply', async () => { await R.go(`/studies/${avail}`); await clickExact(R, 'Apply'); await sleep(800) }],
    ['attend (PIN)', async () => { await R.go(`/studies/${S.id}/pin`) }],
    ['submit (survey)', async () => { await R.go(`/studies/${survey}/survey`) }],
    ['redeem', async () => { await R.go('/points/redeem') }],
    ['withdraw', async () => { await R.go('/wallet/withdraw') }],
  ]
  for (const [what, run] of tries) {
    await run(); await sleep(400)
    const text = flat(await body(R))
    const told = /Your account is restricted until/.test(text) && text.includes(untilText) && text.includes('Spam Apply') && text.includes('Repeated spam applications')
    if (!told) g.push(`${what}: not blocked with the reason and date (${(await R.path())})`)
    else blocked.push(what)
  }
  say(3, 'A restricted participant cannot redeem, apply, attend or submit, and is told why and until when', g, `restricted from the console on report rp-ck1: ${blocked.join(', ')} each blocked with "restricted until ${untilText}", the category Spam Apply and the team's statement`)
}

// ---- 4. A restriction ends on its date
{
  const g = []
  await patch(`me.statusNote.until = new Date(Date.now() - 60e3).toISOString(); me.restrictions[me.restrictions.length - 1].until = me.statusNote.until`, { R: '/dashboard' })
  await sleep(1500)
  if (await st('me.status') !== 'active') g.push('status is still ' + await st('me.status'))
  if (await R.has('Account restricted until')) g.push('the banner is still shown')
  await R.go('/points/redeem'); await sleep(400)
  if (await R.has('Your account is restricted')) g.push('redeem is still blocked')
  await R.go('/notifications'); await sleep(400)
  if (!(await R.has('Your restriction has ended'))) g.push('they were not told')
  say(4, 'A restriction ends on its date', g, 'end date moved into the past: within a second the status is active, the banner gone, Redeem open, and "Your restriction has ended" in their notifications')
}

// ---- 5. A fourth offence deactivates
{
  const g = []
  await fresh()
  await patch(['rp-ck1', 'rp-ck2', 'rp-ck3', 'rp-ck4'].map(report).join(';'))
  const said = []
  const expect = [/15 days as for the 1st time/, /15 days as for the 2nd time/, /30 days as for the 3rd time/, /fourth offence/]
  for (let i = 0; i < 4; i++) {
    const { note } = await restrictInConsole(`rp-ck${i + 1}`, `Offence ${i + 1}`)
    if (!expect[i].test(note)) g.push(`offence ${i + 1}: the dialog said "${note.slice(0, 140)}"`)
    said.push(await st('me.status'))
  }
  if (said.join() !== 'restricted,restricted,restricted,deactivated') g.push('statuses ' + said.join(', '))
  await R.open('/dashboard'); await sleep(600)
  const screen = flat(await body(R))
  if (!/Your account has been deactivated/.test(screen) || !/Offence 4/.test(screen)) g.push('the participant is not shown the written reason')
  await typeIn(R, 'textarea', 'I was applying for my household; please look again.')
  await R.click('Send Appeal', 700)
  if (!(await R.has('Appeal sent'))) g.push('the appeal was not sent')
  const ticket = await st(`s.tickets.find((t) => t.owner.id === 'jonathan' && /Appeal/.test(t.subject))?.id`)
  if (!ticket) g.push('no appeal ticket reached the team')
  say(5, 'A fourth offence deactivates', g, `four reports decided as Restrict in the console: ${said.join(', ')}; the dialog named 15 / 15 / 30 days, then the fourth offence; the participant sees the reason and appealed (ticket ${ticket})`)
}

// ---- 6. An unverified participant cannot open a certificate
{
  const g = []
  await fresh()
  await patch(`me.identity.state = 'flagged'`, { R: '/profile/certificate' })
  await sleep(500)
  const text = flat(await body(R))
  if (!/Not issued yet/.test(text)) g.push('no "Not issued yet"')
  if (/FI-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(text)) g.push('a certificate id is shown')
  await I.open('/internal/participants/jonathan'); await sleep(500)
  const consoleText = flat(await body(I))
  if (/Cert\. ID: FI-/.test(consoleText)) g.push('the console still shows a certificate id')
  say(6, 'An unverified participant cannot open a certificate', g, 'identity set back to flagged: the certificate screen says "Not issued yet" with no id, and the console header shows none')
}

// ---- 7. Changing an email does not change the certificate ID
{
  const g = []
  await fresh()
  await R.go('/profile/certificate'); await sleep(500)
  const before = (flat(await body(R)).match(/FI-[A-Z0-9]{4}-[A-Z0-9]{4}/) ?? [])[0]
  await R.go('/profile/settings'); await sleep(500)
  await typeIn(R, 'input[type=email]', 'jonathan.new@example.com')
  await clickExact(R, 'Save'); await sleep(1200)
  const email = await st('me.email')
  if (email !== 'jonathan.new@example.com') g.push('the email did not change: ' + email)
  await R.go('/profile/certificate'); await sleep(500)
  const after = (flat(await body(R)).match(/FI-[A-Z0-9]{4}-[A-Z0-9]{4}/) ?? [])[0]
  if (!before || before !== after) g.push(`id ${before} -> ${after}`)
  say(7, 'Changing an email does not change the certificate ID', g, `email changed on Account Settings to ${email}; certificate ${before} before and ${after} after`)
}

// ---- 8. The client rates on five stars across three dimensions
{
  const g = []
  await fresh()
  await C.ev(clientSession('jennifer@soulfullabs.com'))
  const target = await st(`(() => { const x = s.studies.find((y) => y.clientId === 'cl-soulful' && y.participations.some((p) => p.state === 'completed' && !p.rating)); return x.id })()`)
  const before = await st(`s.studies.find((x) => x.id === '${target}').participations.filter((p) => p.rating).map((p) => p.personId)`)
  await C.open(`/client/studies/${target}/results`)
  await C.click('Rate Now', 700)
  const groups = await C.ev(`[...document.querySelectorAll('[role=radiogroup]')].filter(__vis).map((r) => r.getAttribute('aria-label') + ':' + r.querySelectorAll('[role=radio]').length)`)
  if (groups.join() !== 'Expertise:5,Reliability:5,Communication:5') g.push('rows: ' + groups.join(', '))
  for (const [d, n] of [['Expertise', 4], ['Reliability', 5], ['Communication', 3]]) { await C.ev(`document.querySelector('[aria-label="${d} ${n} stars"]').click()`); await sleep(150) }
  await clickExact(C, 'Submit'); await sleep(900)
  const rated = await st(`s.studies.find((x) => x.id === '${target}').participations.find((p) => p.rating && !${JSON.stringify(before)}.includes(p.personId))?.rating`)
  if (!rated) g.push('no rating stored')
  say(8, 'The client rates on five stars across three dimensions', g, `three five-star rows (${groups.join(', ')}); stored ${JSON.stringify(rated)}`)
}

// ---- 9. Referral points land when the referred person joins
{
  const g = []
  await fresh()
  const p0 = await R.ev('__hl.user.points')
  // The link Copy Link puts on the clipboard: the same code, read from the copy handler's source of truth.
  await R.go('/profile/referrals'); await sleep(500)
  const code = await R.ev(`(() => { let got = ''; const orig = navigator.clipboard?.writeText; try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { got = t } }, configurable: true }) } catch {} ; [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Copy Link').click(); return new Promise((r) => setTimeout(() => r((got.match(/ref=([A-Z0-9]+)/) || [])[1] || ''), 200)) })()`)
  if (!code) g.push('no referral link from Copy Link')
  const session = await R.ev(`localStorage.getItem('hl-respondent-session')`)
  await R.ev('__hl.signOut(); true'); await sleep(300)
  await R.open(`/signup?ref=${code}`); await sleep(400)
  const friend = `friend.${Date.now().toString(36)}@example.com`
  // The friend signs up through the real screens: Sign Up, then the emailed code.
  await R.ev(`(() => { __type([...document.querySelectorAll('input')].find((e) => e.placeholder === 'Enter email address'), ${JSON.stringify(friend)}); __type([...document.querySelectorAll('input')].find((e) => e.placeholder === 'Enter your password'), 'Passw0rd!x'); document.querySelector('[role=checkbox]').click(); return true })()`); await sleep(300)
  await clickExact(R, 'Sign Up'); await sleep(700)
  for (let i = 0; i < 6; i++) { await R.ev(`__type([...document.querySelectorAll('input[inputmode=numeric]')][${i}], '${'123456'[i]}')`); await sleep(120) }
  await clickExact(R, 'Submit'); await sleep(1200)
  const joined = await st(`me.referrals.find((r) => r.email === ${JSON.stringify(friend)})?.status`)
  await R.ev(`localStorage.setItem('hl-respondent-session', ${JSON.stringify(session)}); true`)
  await R.open('/profile/referrals'); await sleep(600)
  const p1 = await R.ev('__hl.user.points')
  if (joined !== 'joined') g.push('the friend is not on the referrer\'s list: ' + joined)
  if (p1 !== p0 + 200) g.push(`points ${p0} -> ${p1}`)
  if (!(await R.has(friend.split('@')[0]))) g.push('the friend is not shown on Refer and Earn')
  say(9, 'Referral points land when the referred person joins', g, `a new account signed up through ?ref=${code} (Sign Up, then the code), finishing nothing else: the referrer's points ${p0} -> ${p1}, the friend listed as joined`)
}

// ---- 10. Roles and skills targeting is charged the add-ons
{
  const g = []
  await C.ev(clientSession('jennifer@soulfullabs.com')); await C.open('/client/studies')
  await C.click('Create Study', 700)
  await C.click('Survey', 300)
  const recruit = async () => { await C.go('/client/studies/create/study'); await sleep(500); return flat(await C.ev(`(() => { const el = [...document.querySelectorAll('*')].find((e) => e.children.length < 6 && /^Recruitment Cost/.test(e.innerText ?? '')); return el ? el.innerText : '' })()`)) }
  const setAud = async (roles, skills) => { await C.go('/client/studies/create/audience'); await sleep(500); await C.ev(FORMS); await C.ev(`(() => { __ph('e.g. Product Manager', ${JSON.stringify(roles)}); __ph('e.g. SQL, Figma', ${JSON.stringify(skills)}); return true })()`); await sleep(200) }
  await setAud('', ''); const none = await recruit()
  await setAud('Nurse', ''); const roles = await recruit()
  await setAud('', 'Python'); const skills = await recruit()
  await setAud('Nurse', 'Python'); const both = await recruit()
  const rate = (t) => Number((t.match(/x \$([0-9.]+)/) ?? [])[1])
  const got = [none, roles, skills, both].map(rate)
  if (got.join() !== '25,50,45,70') g.push('recruitment per participant: ' + got.join(', '))
  await C.ev(`localStorage.removeItem('fi-client-create'); true`)
  say(10, 'Roles and skills targeting is charged the add-ons', g, `a survey's recruitment per participant on Costing Summary: none $${got[0]}, roles $${got[1]}, skills $${got[2]}, both $${got[3]}`)
}

// ---- 11. A Pricing & Rewards change either saves or says it cannot
{
  const g = []
  await I.open('/internal/pricing/client-fees'); await sleep(500)
  if (!(await I.has('cannot be changed from the console'))) g.push('the screen does not say up front')
  await typeIn(I, 'main input', '999')
  await I.click('Save Changes', 600)
  const dialog = flat(await I.ev(`[...document.querySelectorAll('[role=dialog]')].map((d) => d.innerText).join(' ')`))
  if (!/Changes not saved/.test(dialog) || !/Nothing was saved/.test(dialog)) g.push('the dialog: ' + dialog.slice(0, 120))
  if (/published live|are updated/i.test(dialog)) g.push('it still claims a save')
  await clickExact(I, 'Back to Pricing & Rewards'); await sleep(500)
  if (await I.has('$999')) g.push('the typed value appears on the overview')
  say(11, 'A Pricing & Rewards change either saves or says plainly it cannot', g, `the edit screen says the values cannot be changed here; Save Changes opens "Changes not saved"; the overview keeps the policy's values`)
}

// ---- 12. /kitchen-sink and /motion are unreachable
{
  const g = []
  const seen = []
  for (const [t, path] of [[R, '/kitchen-sink'], [R, '/motion'], [C, '/client/kitchen-sink'], [C, '/client/motion'], [I, '/internal/kitchen-sink'], [I, '/internal/motion']]) {
    await t.open(path); await sleep(400)
    const text = flat(await body(t))
    const shown = t === R ? !/Page not found/.test(text) : /Kitchen Sink|Every animation/i.test(text)
    seen.push(`${path} ${shown ? 'RENDERS' : 'not found'}`)
    if (shown) g.push(path)
  }
  say(12, '/kitchen-sink and /motion are unreachable', g, seen.join('; '))
}

console.log(`\n${results.filter(Boolean).length} of 12 yes  (${base})`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
