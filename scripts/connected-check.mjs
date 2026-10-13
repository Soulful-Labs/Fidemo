// Connectedness, in three real tabs of one browser on one origin: the client
// app, the console and the respondent app. Five questions, each answered YES
// or NO from what the other tabs show without a reload.
//
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/connected-check.mjs
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
  await __choose(__btn('2 range selected'), '18–20', '21–29', '30–39', '40–49')
  __ph('Choose job roles...', ${JSON.stringify(AUDIENCE.roles)}); __ph('Select job functions...', ${JSON.stringify(AUDIENCE.functions)})
  __ph('Choose skills...', ${JSON.stringify(AUDIENCE.skills)}); __ph('Choose industry domains...', ${JSON.stringify(AUDIENCE.industries)})
  __all('[role=radio]')[1].click(); await __wait()
  await __choose(__btn('Select tiers...'), 'Silver and above')
  return true })()`
/** Education is left as the step opens with it; the pool holds one level of education, so any other would estimate an audience of none. */
const AUDIENCE_SHOWN = ['United States of America, Canada', 'Female', "Graduate or Bachelor's", '30–39, 40–49', 'Oncologist, Nurse', 'Consultation', 'Triage', 'Healthcare', 'Prefer fresh people', 'Silver and above']

const hours = (from, to) => `await __time('Monday from', ${JSON.stringify(from)}); await __time('Monday to', ${JSON.stringify(to)}); __al('Copy Monday').click(); await __wait(); __al('Saturday').click(); await __wait(); __al('Sunday').click(); await __wait();`
const address = (street, city, zip) => `__ph('Office number, Building/Street name, Area', ${JSON.stringify(street)}); __ph('City, State', ${JSON.stringify(city)}); __ph('Zip Code', ${JSON.stringify(zip)}); await __wait(); __all('button').filter((b) => b.textContent.trim() === 'Add Address').pop().click(); await __wait();`
const session = (d, t) => `__type(__al('Session date'), ${JSON.stringify(ymd(d))}); await __time('Session start time', ${JSON.stringify(t)}); __exact('Add').click(); await __wait();`


// ------------------------------------------------------------ the five checks
const results = []
const say = (n, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.join('; ') : ''}`) }

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)
await R.open('/signin', 'localStorage.clear()'); await sleep(1500)
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 2500)
await I.open('/internal/signin'); await sleep(1000)
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 2000)
await C.open('/client/studies', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`); await sleep(1000)
for (const t of [R, C, I]) await t.mark()
console.log(`site: ${base}\ntabs: respondent ${await R.path()}, console ${await I.path()}, client ${await C.path()}\n`)

const S = { title: `Connected ${tag}`, incentive: 60 }
const study = () => R.ev(`(__st().studies.find((s) => s.title === ${JSON.stringify(S.title)}) || null)`)
const part = async () => (await study())?.participations.find((p) => p.personId === 'jonathan')
const alive = async () => (await R.alive()) && (await C.alive()) && (await I.alive())

// ---- 1. a study created in the client app appears in the console and to respondents
{
  const g = []
  try {
    await I.go('/internal/studies')
    await C.click('Create Study', 800); await C.ev(FORMS)
    await C.click('Survey')
    await C.ev(`(() => { __type(__al('Duration'), '15'); __ph('Enter title of your study', ${JSON.stringify(S.title)}); __ph('Enter study description', 'A short survey made to follow one study through all three apps.'); return true })()`)
    await C.click('Continue'); await C.click('Continue')
    await C.ev(buildScreener(THREE)); await sleep(200)
    await C.click('Continue')
    await C.click('Create Survey Questionnaire', 500)
    await C.ev(`(async () => { __ph('Enter question text...', 'How often do you shop online?'); __ph('Enter option', 'Weekly', 0); __ph('Enter option', 'Monthly', 1); return true })()`); await sleep(200)
    await C.click('Submit Survey', 500)
    await C.ev(`(() => { __type(__al('Incentive Amount'), '$${S.incentive}'); return true })()`); await sleep(150)
    // AutoPay off, so the payout in check 4 waits for the client.
    await C.ev(`__al('AutoPay').click()`); await sleep(150)
    await C.click('Proceed to Publish', 700); await C.ev(FORMS)
    await C.ev(`(() => { __ph('0000 0000 0000 0000', '4242 4242 4242 4242'); __ph('MM / YYYY', '12 / 2028'); __ph('000', '123'); __ph('Enter name', 'Jennifer Lee'); return true })()`)
    await C.click('Publish Study', 1200)
    const s = await study()
    if (!s) g.push('the client app did not store the study')
    else S.id = s.id
    const inQueue = await I.waitFor(S.title, 5000)
    if (!inQueue) g.push('console: not on the To Review list')
    await R.go('/studies')
    const early = await R.has(S.title)
    if (early) g.push('respondent: listed before the team approved it')
    await I.click(S.title, 1000)
    if (!(await I.path()).includes('/studies/review/')) g.push('console: the row did not open the review, went to ' + await I.path())
    await I.click('Approve to Publish', 1000)
    S.afterApproval = (await study())?.state
    const listed = await R.waitFor(S.title, 6000)
    if (!listed) g.push('respondent: not in Explore after approval')
    if (!(await alive())) g.push('a tab reloaded')
    say(1, 'A study created in the client app appears in the console and to respondents', g, `"${S.title}" (${S.id}): on the console's To Review list ${inQueue ? 'yes' : 'no'}; hidden from the respondent until approved ${early ? 'no' : 'yes'}; in the respondent's Explore after approval ${listed ? 'yes' : 'no'}`)
  } catch (e) { say(1, 'A study created in the client app appears in the console and to respondents', [...g, e.message]) }
}

// ---- 3 (first half). a console approval appears in the client app: the study going live
const g3 = []
let liveRow = ''
try {
  await C.go('/client/studies'); await sleep(500)
  liveRow = await C.ev(`[...document.querySelectorAll('tr, [role=row], article, a')].find((r) => r.innerText.includes(${JSON.stringify(S.title)}))?.innerText.replace(/\\s+/g, ' ').slice(0, 140) ?? ''`)
  if (!liveRow) g3.push('client: the approved study is not on the Studies list')
  if (S.afterApproval !== 'recruiting') g3.push('the study is ' + S.afterApproval + ' after approval')
} catch (e) { g3.push(e.message) }

// ---- 2. a respondent's application appears in the client app and the console
{
  const g = []
  try {
    // Session studies split Recruited into Scheduled and Applications; a survey lists its applicants directly.
    await C.go(`/client/studies/${S.id}/recruited`); await C.click('Applications', 500).catch(() => {})
    await I.go(`/internal/studies/${S.id}?tab=recruited`); await I.click('Applications', 500).catch(() => {})
    const before = { c: await C.has('Jonathan'), i: await I.has('Jonathan') }
    await R.go(`/studies/${S.id}`)
    if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 1000); else await R.click('Apply', 1000)
    const s = await study()
    for (let i = 0; i < 20 && !(await R.path()).endsWith('/applied'); i++) {
      await R.ev(`(() => {
        const pre = ${JSON.stringify(s.preScreener)};
        const q = pre.find((x) => __has(x.prompt));
        if (q) { __click(q.passing[0]); return 'pre' }
        const ta = document.querySelector('textarea'); if (ta) { __type(ta, 'Most nights, and I check the weekly trend.'); return 'text' }
        const num = document.querySelector('main input[inputmode=decimal]'); if (num) { __type(num, '5'); return 'number' }
        const opt = [...document.querySelectorAll('[role=radio], [role=checkbox]')].find(__vis); if (opt) { opt.click(); return 'option' }
        return 'none' })()`)
      await sleep(300)
      const next = await R.ev(`['Check eligibility', 'Submit', 'Continue'].find((t) => { const b = __q(t); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }) || ''`)
      if (!next) throw new Error('stuck on a screener question at ' + await R.path())
      await R.click(next, 1000)
    }
    if (!(await R.path()).endsWith('/applied')) g.push('respondent: did not reach Applied successfully, at ' + await R.path())
    const inC = await C.waitFor('Jonathan', 5000), inI = await I.waitFor('Jonathan', 5000)
    if (before.c || before.i) g.push('Jonathan was listed before applying')
    if (!inC) g.push('client: the application is not on Recruited, Applications')
    if (!inI) g.push('console: the application is not on Recruited, Applications')
    if (!(await alive())) g.push('a tab reloaded')
    say(2, "A respondent's application appears in the client app and the console", g, `Jonathan applied to "${S.title}" (participation ${(await part())?.state}): client lists him ${inC ? 'yes' : 'no'}, console lists him ${inI ? 'yes' : 'no'}, neither listed him before`)
  } catch (e) { say(2, "A respondent's application appears in the client app and the console", [...g, e.message]) }
}

// ---- 3 (second half). the console qualifying the applicant appears in the client app
try {
  await C.click('Jonathan', 900)
  const decisionOpen = await C.ev(`Boolean(__q('Qualify'))`)
  await I.go(`/internal/studies/${S.id}/respondents/jonathan`); await sleep(500)
  await I.click('Qualify', 900)
  if ((await part())?.state !== 'qualified') g3.push('console Qualify left the participation ' + (await part())?.state)
  await sleep(800)
  const clientNow = await C.ev(`document.querySelector('main').innerText.replace(/\\s+/g, ' ')`)
  const stillAsking = await C.ev(`Boolean(__q('Qualify'))`)
  if (stillAsking) g3.push('client: still offers Qualify after the console qualified him')
  if (!/qualified/i.test(clientNow)) g3.push('client: the page does not say he is qualified')
  if (!(await alive())) g3.push('a tab reloaded')
  say(3, 'A console approval appears in the client app', g3, `study approval: the client's Studies list shows "${liveRow}"; applicant approval: the client's page offered Qualify ${decisionOpen ? 'before' : '(not before)'} and after the console qualified him it ${stillAsking ? 'still does' : 'no longer does'}`)
} catch (e) { say(3, 'A console approval appears in the client app', [...g3, e.message]) }

// ---- 4. a payout approved in the client app reaches the respondent's wallet
{
  const g = []
  try {
    const wallet = () => R.ev(`__hl.user.walletBalance`)
    await R.go(`/studies/${S.id}/survey`); await sleep(600)
    await R.ev(`[...document.querySelectorAll('[role=radio]')].find((o) => o.innerText.trim() === 'Weekly').click()`); await sleep(300)
    await R.click('Submit', 1500)
    const before = await wallet()
    await sleep(8000)
    const waited = await part()
    if (waited?.state !== 'completed') g.push('the survey was not completed: ' + waited?.state)
    if (waited?.paidAt || await wallet() !== before) g.push('paid before the client approved, with AutoPay off')
    await R.go('/wallet'); await sleep(500)
    const shownBefore = await R.ev(`document.querySelector('main').innerText.replace(/\\s+/g, ' ').slice(0, 60)`)
    await C.go(`/client/studies/${S.id}/pay`); await sleep(700)
    await C.click('Approve 1', 1200)
    if (!(await part())?.paidAt) g.push('approving on the Pay tab did not pay him: ' + await C.ev(`document.querySelector('[role=status], [role=alert]')?.innerText ?? ''`))
    await sleep(2500)
    const after = await wallet()
    if (after !== before + S.incentive) g.push(`the wallet went from ${before} to ${after}, not up by ${S.incentive}`)
    const shownAfter = await R.ev(`document.querySelector('main').innerText.replace(/\\s+/g, ' ').slice(0, 60)`)
    if (shownAfter === shownBefore) g.push('the Wallet screen did not change without a reload')
    if (!(await alive())) g.push('a tab reloaded')
    say(4, "A payout approved in the client app reaches the respondent's wallet", g, `8 seconds after completing: not paid, wallet $${before}. The client approved 1 payout on the Pay tab: wallet $${after} (+$${after - before}). Wallet screen before: "${shownBefore}" and after: "${shownAfter}"`)
  } catch (e) { say(4, "A payout approved in the client app reaches the respondent's wallet", [...g, e.message]) }
}

// ---- 5. a support ticket raised in the respondent app appears in the console
{
  const g = []
  try {
    const subject = `Payout question ${tag}`
    await I.go('/internal/support'); await sleep(500)
    const was = await I.has(subject)
    await R.go('/support/contact'); await sleep(500)
    await R.ev(`(() => { __type(document.querySelector('input[placeholder="Write subject here"]'), ${JSON.stringify(subject)}); __type(document.querySelector('textarea'), 'When does a payout the client approved reach my bank?'); return true })()`); await sleep(300)
    await R.click('Submit', 1500)
    const made = await R.ev(`(__st().tickets || []).find((t) => t.subject === ${JSON.stringify(subject)}) || null`)
    if (!made) g.push('respondent: no ticket was stored')
    const shown = await I.waitFor(subject, 5000)
    if (was) g.push('console listed it before it was raised')
    if (!shown) g.push('console: the ticket is not on Support')
    let opened = ''
    if (shown) { await I.click(subject, 900).catch(() => {}); opened = await I.path(); if (!(await I.has('When does a payout the client approved reach my bank?'))) g.push('console: opening the ticket does not show the message, at ' + opened) }
    if (!(await alive())) g.push('a tab reloaded')
    say(5, 'A support ticket raised in the respondent app appears in the console', g, `"${subject}" (${made?.id}): on the console's Support list ${shown ? 'yes' : 'no'}; opens at ${opened || '-'} with the respondent's message`)
  } catch (e) { say(5, 'A support ticket raised in the respondent app appears in the console', [...g, e.message]) }
}

console.log(`\n${[1, 2, 3, 4, 5].filter((n) => results[n]).length} of 5 yes`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
