// Everything a client builds in the Create flow, followed in a real browser on
// the one origin: a study of each type is built step by step, then read back
// in the client app after a reload, in the console's Review, and by a
// respondent; and a draft is saved, left and reopened. Prints yes or no.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/create-check.mjs
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

// ---------------------------------------------------------------- the check

/** Helpers for the client's forms: fields by placeholder or label, pickers by the value they show. */
const FORMS = `
  window.__wait = (ms = 90) => new Promise((r) => setTimeout(r, ms));
  window.__all = (sel, root = document) => [...root.querySelectorAll(sel)].filter(__vis);
  window.__ph = (ph, v, n = 0, root = document) => { const el = __all('input, textarea', root).filter((e) => e.placeholder === ph)[n]; if (!el) throw new Error('no field: ' + ph + ' #' + n); return __type(el, v) };
  window.__al = (label, n = 0) => { const el = __all('[aria-label="' + label + '"]')[n]; if (!el) throw new Error('no control labelled: ' + label + ' #' + n); return el };
  window.__btn = (text, n = 0) => { const el = __all('button').filter((b) => b.textContent.trim().replace(/\\s+/g, ' ').startsWith(text))[n]; if (!el) throw new Error('no button: ' + text + ' #' + n); return el };
  window.__exact = (text) => { const el = __all('button').filter((b) => b.textContent.trim() === text).pop() ?? __all('button').filter((b) => [...b.querySelectorAll('span')].some((x) => x.textContent.trim() === text)).pop(); if (!el) throw new Error('no option: ' + text); return el };
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

// D38: applying checks the audience, and the respondent in these checks is Jonathan (a male physician, 38, Gold), so every field targets him.
const AUDIENCE = { participants: '', roles: 'Physician, Nurse', functions: 'Consultation', skills: 'Triage', industries: 'Healthcare' }
const fillAudience = (participants) => `(async () => {
  __type(__all('main input')[0], ${JSON.stringify(participants)})
  await __choose(__btn('All Genders'), 'Male')
  await __choose(__btn('2 range selected'), '18–20', '21–29', '30–39', '40–54')
  __ph('e.g. Product Manager', ${JSON.stringify(AUDIENCE.roles)}); await __choose(__btn('Select work functions...'), ...${JSON.stringify(AUDIENCE.functions)}.split(', '))
  __ph('e.g. SQL, Figma', ${JSON.stringify(AUDIENCE.skills)}); __ph('e.g. Healthcare, Finance', ${JSON.stringify(AUDIENCE.industries)})
  __all('[role=radio]')[0].click(); await __wait()
  await __choose(__btn('Any tier'), 'Gold Tier')
  return true })()`
/** Education is left as the step opens with it; the pool holds one level of education, so any other would estimate an audience of none. */
const AUDIENCE_SHOWN = ['United States of America', 'Male', "Graduate or Bachelor's", '30–39, 40–54', 'Physician, Nurse', 'Consultation', 'Triage', 'Healthcare', 'Gold']

const hours = (from, to) => `await __time('Monday from', ${JSON.stringify(from)}); await __time('Monday to', ${JSON.stringify(to)}); __al('Copy Monday').click(); await __wait(); __al('Saturday').click(); await __wait(); __al('Sunday').click(); await __wait();`
const address = (street, city, zip) => `__ph('Office number, Building/Street name, Area', ${JSON.stringify(street)}); __ph('City, State', ${JSON.stringify(city)}); __ph('Zip Code', ${JSON.stringify(zip)}); await __wait(); __all('button').filter((b) => b.textContent.trim() === 'Add Address').pop().click(); await __wait();`
const session = (d, t) => `__type(__al('Session date'), ${JSON.stringify(ymd(d))}); await __time('Session start time', ${JSON.stringify(t)}); __exact('Add').click(); await __wait();`

const off = after(9)
/** Six studies, one of each type, each with its own step 4. `setup` runs with the composer open; `expect` is what the study must then show. */
const STUDIES = [
  {
    key: 'survey', card: 'Survey', duration: 20, participants: '12', incentive: 700, screener: EIGHT, opener: 'Create Survey Questionnaire', submit: 'Save & Continue',
    setup: `__ph('Enter question text...', 'How often do you shop online?'); __ph('Enter option', 'Weekly', 0); __ph('Enter option', 'Monthly', 1);
      __btn('Add Question').click(); await __wait(); await __choose(__all('button').filter((b) => b.textContent.trim() === 'Single-select').pop(), 'Multi-line input'); __ph('Enter question text...', 'What stops you buying?', 5);`,
    typeLabel: 'Survey', summary: '2 inputs',
    client: ['How often do you shop online?', 'Weekly · Monthly', 'What stops you buying?'],
    console: ['How often do you shop online?', 'Weekly', 'Monthly', 'What stops you buying?'],
    tasks: ['How often do you shop online?', 'What stops you buying?'],
  },
  {
    key: 'video 1:1', card: 'Video Call', duration: 45, participants: '8', incentive: 700, screener: THREE, opener: 'Set Timing Availability', submit: 'Continue',
    setup: `await __choose(__btn('15 minutes'), '10 minutes'); __type(__al('Minimum notice'), '1'); await __wait(); await __choose(__btn('Minutes'), 'Hours'); ${hours('09:00 AM', '05:00 PM')}
      __al('Add hours to Tuesday').click(); await __wait(); await __time('Tuesday from', '06:00 PM', 1); await __time('Tuesday to', '08:00 PM', 1);
      __click('Add Override'); await __wait(300); __type(__al('Override from'), ${JSON.stringify(ymd(off))}); __type(__al('Override to'), ${JSON.stringify(ymd(off))}); __al('Mark Unavailable For Full Day').click(); await __wait(); __click('Save override'); await __wait(300);`,
    typeLabel: 'Video Call', summary: 'available 5 days/week, custom timings, 1 day overrides',
    client: ['10 minutes', '1 Hour', '09:00 AM to 05:00 PM, 06:00 PM to 08:00 PM', 'Unavailable', `Override ${off.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`],
    console: ['Monday', 'Tuesday', 'Friday', '09:00 AM', '05:00 PM', '06:00 PM', '08:00 PM', '10 minutes', '1 Hour'],
    slots: ['09:00 AM', '09:55 AM', '10:50 AM'], closed: off,
  },
  {
    key: 'group video', card: 'Video Call', group: 0, duration: 60, participants: '10', incentive: 700, screener: THREE, opener: 'Set Timing Availability', submit: 'Continue',
    setup: `__type(__al('Seats per session'), '6 seats'); ${session(after(5), '10:00 AM')} ${session(after(7), '02:00 PM')}`,
    typeLabel: 'Group Video Call', summary: '2 sessions, 6 seats per session',
    client: ['6 seats', `${after(5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' })}, 10:00 AM`, `${after(7).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' })}, 02:00 PM`],
    console: ['6 seats', 'Session 1', 'Session 2', '10:00 AM', '02:00 PM'],
    sessions: [[after(5), '10:00 AM'], [after(7), '02:00 PM']],
  },
  {
    key: 'in-person 1:1', card: 'In-Person', duration: 30, participants: '6', incentive: 700, screener: THREE, opener: 'Set Address & Availability', submit: 'Continue',
    setup: `${address('12 Main St', 'Austin, Texas', '73301')} ${address('4 Dock Road', 'Houston, Texas', '77002')} __type(__al('Minimum notice'), '1'); await __wait(); await __choose(__btn('Minutes'), 'Days'); ${hours('10:00 AM', '04:00 PM')}`,
    typeLabel: 'In-Person', summary: '2 addresses, available 5 days/week, custom timings',
    client: ['12 Main St, Austin, Texas, 73301', '4 Dock Road, Houston, Texas, 77002', '15 minutes', '1 Day', '10:00 AM to 04:00 PM'],
    console: ['12 Main St, Austin, Texas, 73301', '4 Dock Road, Houston, Texas, 77002', '10:00 AM', '04:00 PM', '1 Day'],
    slots: ['10:00 AM', '10:45 AM'], noticeHours: 24, places: ['12 Main St, Austin, Texas, 73301', '4 Dock Road, Houston, Texas, 77002'],
  },
  {
    key: 'in-person group', card: 'In-Person', group: 1, duration: 90, participants: '8', incentive: 700, screener: THREE, opener: 'Set Address & Availability', submit: 'Continue',
    setup: `__type(__al('Seats per session'), '4 seats'); ${address('9 Canal St', 'Leeds, UK', 'LS1 4AP')} ${session(after(6), '11:00 AM')} ${session(after(8), '03:30 PM')}`,
    typeLabel: 'In-Person Group', summary: '2 sessions, 4 seats per session, 1 address',
    client: ['4 seats', '9 Canal St, Leeds, UK, LS1 4AP', `${after(6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' })}, 11:00 AM`, `${after(8).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' })}, 03:30 PM`],
    console: ['4 seats', '9 Canal St, Leeds, UK, LS1 4AP', '11:00 AM', '03:30 PM'],
    sessions: [[after(6), '11:00 AM'], [after(8), '03:30 PM']], places: ['9 Canal St, Leeds, UK, LS1 4AP'],
  },
  {
    key: 'diary', card: 'Diary Study', duration: 15, participants: '9', incentive: 700, screener: THREE, opener: 'Create Survey Questionnaire', submit: 'Save & Continue',
    // Since 21 Oct 2026 (1518:94904) the schedule is set inside the diary form, and each day has its own questions.
    // Policy section 5, four fifths of the entries: a 7-day diary's minimum moves to 6 by itself and nothing lower is offered.
    setup: `await __choose(__btn('Every 2 days'), 'Every 3 days'); await __choose(__btn('5 days'), '7 days');
      __ph('Enter question text...', 'What did you eat today?', 0); __ph('Enter question text...', 'How did you feel afterwards?', 1);
      for (let d = 2; d <= 7; d++) __ph('Enter question text...', 'What did you eat on day ' + d + '?', d);`,
    typeLabel: 'Diary Study', summary: '8 questions, 7 days logs',
    client: ['Every 3 days', '7 days', '6 days', 'Day', 'What did you eat today?', 'How did you feel afterwards?', 'What did you eat on day 7?'],
    console: ['What did you eat today?', 'How did you feel afterwards?', 'What did you eat on day 7?', '7 days', '6 days', 'Every 3 days'],
    tasks: ['What did you eat today?', 'How did you feel afterwards?', ...[2, 3, 4, 5, 6, 7].map((d) => `What did you eat on day ${d}?`)], diaryDays: 7,
    // Day 2 asks its own question, and not day 1's.
    day2: { asks: 'What did you eat on day 2?', not: 'How did you feel afterwards?' },
  },
].map((s) => ({ ...s, title: `CC ${s.key} ${tag}`, description: `Created by the create check to follow a ${s.key} study through all three apps.`, end: after(30) }))

/** Every string a screen should be showing, and the ones it is not. */
const missing = async (t, strings) => { const text = await t.ev('document.body.innerText'); return strings.filter((x) => !text.includes(x)) }
const durationShown = (m) => (m === 60 ? ['1 hour'] : m === 90 ? ['1'] : [`${m} min`])
const promptsOf = (qs) => qs.flatMap((q) => [q.text, ...(q.options || [])])

const tally = { 1: [], 2: [], 3: [], 4: [], 5: [] }
const note = (n, key, gaps) => { tally[n].push({ key, gaps }); console.log(`   ${gaps.length ? 'NO ' : 'yes'}  ${key}${gaps.length ? '   missing: ' + gaps.map((g) => JSON.stringify(g)).join(', ') : ''}`) }

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)

// Signing in resets the demo, so both sign-ins come before anything is made.
await R.open('/signin', 'localStorage.clear()')
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 1500)
await I.open('/internal/signin')
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 1200)
await C.open('/client/studies', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)

/** Steps 1 to 3 of the Create flow, the same for every type. */
async function aboutToScreener(s) {
  await C.go('/client/studies/create/about'); await C.ev(FORMS)
  await C.click(s.card)
  if (s.group !== undefined) await C.ev(`__all('[role=switch]').filter((e) => e.getAttribute('aria-label') === 'Group session')[${s.group}].click()`)
  await C.ev(`(() => { __type(__al('Duration'), '${s.duration}'); __ph('DD / MM / YYYY', ${JSON.stringify(dmy(s.end))}); __ph('Enter title of your study', ${JSON.stringify(s.title)}); __ph('Enter study description', ${JSON.stringify(s.description)}); return true })()`)
  await C.click('Continue')
  await C.ev(fillAudience(s.participants)); await sleep(200)
  await C.click('Continue')
  await C.ev(buildScreener(s.screener)); await sleep(200)
  await C.click('Continue')
}
/** Step 4: the type's own settings, then the incentive. */
async function studyStep(s) {
  if (s.before) { await C.ev(`(async () => { ${s.before} return true })()`); await sleep(150) }
  await C.click(s.opener, 500)
  await C.ev(`(async () => { ${s.setup} return true })()`); await sleep(200)
  await C.click(s.submit, 700)
  const stuck = s.submit === 'Continue'
    ? await C.ev(`Boolean(document.querySelector('[data-submit-availability]'))`)
    : await C.ev(`Boolean(__all('button').find((b) => b.textContent.trim() === ${JSON.stringify(s.submit)}))`)
  if (stuck) throw new Error(`${s.key}: the composer did not accept ${s.submit}: ` + await C.ev(`document.querySelector('[role=status], [role=alert]')?.innerText ?? '(no reason shown)'`))
  // The incentive and costs sit under the study settings on the Study step (22 Oct 2026, every Create frame).
  await C.ev(FORMS);
}

console.log('\n1. Create a study of each type, filling in every step')
for (const s of STUDIES) {
  try {
    await aboutToScreener(s)
    await studyStep(s)
    await C.click('Proceed to Publish', 600)
    const summary = await C.ev(`document.querySelector('main').innerText`)
    s.publishShows = { type: summary.includes(s.typeLabel), audience: (/Estimated Audience:\s*([\d,]+|1K)/.exec(summary) || [])[1], summary: summary.includes(s.summary) }
    // The demo client's saved card is already selected at Publish; nothing is typed again.
    await C.click('Publish Study', 900)
    s.id = await C.ev(`(__st().studies.find((x) => x.title === ${JSON.stringify(s.title)}) || {}).id`)
    const where = await C.path()
    note(1, s.key, s.id && where.endsWith('/published') ? [] : [`not published (on ${where}): ` + await C.ev(`document.querySelector('[role=status], [role=alert]')?.innerText ?? ''`)])
  } catch (e) { note(1, s.key, [String(e.message)]) }
}
console.log('   Publish summary, from what was built:')
for (const s of STUDIES) console.log(`      ${s.key}: type chip ${s.publishShows?.type ? 'says' : 'DOES NOT say'} "${s.typeLabel}", Estimated Audience ${s.publishShows?.audience ?? '?'}, study chip ${s.publishShows?.summary ? 'says' : 'DOES NOT say'} "${s.summary}"`)

console.log('\n2. Reload, open each one: everything entered is still there (client app, Manage Study)')
for (const s of STUDIES.filter((x) => x.id)) {
  // A study in review reads back on its own six-tab screen (15 Oct 2026): every tab is read.
  let text = ''
  for (const t of ['about', 'audience', 'screener', 'study', 'payment']) { await C.open(`/client/studies/${s.id}/manage?tab=${t}`); text += ' ' + await C.ev('document.body.innerText') }
  const formRow = s.tasks ? [`${s.tasks.length} Question`] : [s.summary]
  const want = [s.title, s.description, ...durationShown(s.duration), dmy(s.end), s.participants, ...AUDIENCE_SHOWN, ...promptsOf(s.screener), s.typeLabel, ...formRow, ...s.client]
    .flatMap((x) => (x.includes(' · ') ? x.split(' · ') : [x]))
  note(2, s.key, want.filter((x) => !text.includes(x)))
}

console.log('\n3. The console sees the same (Review, every tab)')
for (const s of STUDIES.filter((x) => x.id)) {
  let text = ''
  for (const t of ['about', 'audience', 'screener', 'study', 'payment']) { await I.go(`/internal/studies/review/${s.id}?tab=${t}`); text += '\n' + await I.ev('document.body.innerText') }
  // The console writes the end date as "Nov 12, 2026" and splits the notice into a number and a unit, so both sides are compared without spaces.
  const want = [s.title, s.description, ...durationShown(s.duration), s.participants, ...AUDIENCE_SHOWN, ...promptsOf(s.screener), ...s.console, s.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })]
  const squashed = text.replace(/\s+/g, '')
  note(3, s.key, want.filter((x) => !squashed.includes(x.replace(/\s+/g, ''))))
  await I.click('Approve to Publish', 400); await I.click('Approve and Publish', 800)
}

console.log('\n4. A respondent sees the same')
for (const s of STUDIES.filter((x) => x.id)) {
  const gaps = []
  try {
    await R.go(`/studies/${s.id}`)
    gaps.push(...await missing(R, [s.title, `$${s.incentive}`]))
    if (!(await R.ev('document.body.innerText')).includes(s.description.slice(0, 40))) gaps.push('description')
    if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 900); else await R.click('Apply', 900)
    // An in-person study shows its addresses before the screener (PRD 6.8).
    if (await R.ev(`Boolean(__q('Got It!'))`)) { gaps.push(...(await missing(R, s.places ?? [])).map((x) => 'address not shown before applying: ' + x)); await R.click('Got It!', 900) }
    const pre = await R.ev(`__st().studies.find((x) => x.id === ${JSON.stringify(s.id)}).preScreener`)
    const asked = new Set()
    for (let i = 0; i < 16 && !(await R.path()).endsWith('/applied'); i++) {
      const text = await R.ev(`document.querySelector('main').innerText`)
      for (const q of s.screener) if (text.includes(q.text)) asked.add(q.text)
      await R.ev(`(() => {
        const q = ${JSON.stringify(pre)}.find((x) => __has(x.prompt)); if (q) { __click(q.passing[0]); return }
        const num = document.querySelector('main input[inputmode=decimal]'); if (num) { __type(num, '5'); return }
        const opt = [...document.querySelectorAll('main [role=radio], main [role=checkbox]')].find(__vis); if (opt) { opt.click(); return }
        const box = document.querySelector('main textarea, main input'); if (box) __type(box, 'A short answer') })()`)
      await sleep(250)
      const next = await R.ev(`['Check eligibility', 'Submit', 'Continue'].find((t) => { const b = __q(t); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }) || ''`)
      if (!next) break
      await R.click(next, 900)
    }
    for (const q of s.screener) if (!asked.has(q.text)) gaps.push('screener question not asked: ' + q.text)
    if (!(await R.path()).endsWith('/applied')) gaps.push('application did not go through, stopped on ' + await R.path())
    // The team qualifies them in the console, which is what opens scheduling or the study itself.
    await I.go(`/internal/studies/${s.id}/respondents/jonathan`); await I.click('Qualify', 800)
    if (s.slots || s.sessions) {
      await R.go(`/studies/${s.id}/schedule`); await sleep(400)
      const days = await R.ev(`[...document.querySelectorAll('.grid-cols-7 button')].map((b) => ({ on: b.getAttribute('aria-disabled') !== 'true', text: b.innerText.replace(/\\s+/g, ' ') }))`)
      if (s.sessions) {
        const offered = await R.ev(`__hl.studyById(${JSON.stringify(s.id)}).availability.map((a) => new Date(a.date).toDateString() + ' ' + a.slots.join())`)
        for (const [d, t] of s.sessions) if (!offered.includes(d.toDateString() + ' ' + t)) gaps.push(`session ${heading(d)} ${t} not offered`)
        if (offered.length !== s.sessions.length) gaps.push(`offered ${offered.length} sessions, built ${s.sessions.length}`)
      }
      // A day's notice closes the next 24 hours, so the first full day is the second one open.
      if (s.noticeHours) {
        const soonest = await R.ev(`(() => { const a = __hl.studyById(${JSON.stringify(s.id)}).availability.find((x) => x.slots.length); const d = new Date(a.date); const m = /([0-9]+):([0-9]+) (AM|PM)/.exec(a.slots[0]); d.setHours((Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0), Number(m[2]), 0, 0); return (d.getTime() - Date.now()) / 36e5 })()`)
        if (soonest < s.noticeHours) gaps.push(`a slot is offered ${soonest.toFixed(1)} hours ahead, inside the ${s.noticeHours} hour notice`)
      }
      await R.ev(`[...document.querySelectorAll('.grid-cols-7 button:not([aria-disabled=true])')][${s.noticeHours ? 1 : 0}].click()`); await sleep(300)
      const open = await R.ev(`[...document.querySelectorAll('.grid-cols-2 button')].filter((b) => !b.disabled && b.getAttribute('aria-disabled') !== 'true').map((b) => b.innerText.trim())`)
      for (const t of s.slots ?? [s.sessions[0][1]]) if (!open.includes(t)) gaps.push(`time ${t} not offered on the first day (${open.slice(0, 6).join(', ')})`)
      if (s.slots && days.length && !days.some((d) => d.on)) gaps.push('no day is open')
      if (s.closed) {
        const offered = await R.ev(`__hl.studyById(${JSON.stringify(s.id)}).availability.map((a) => new Date(a.date).toDateString())`)
        if (offered.includes(s.closed.toDateString())) gaps.push('the overridden day is still offered')
        if (offered.some((d) => d.startsWith('Sat') || d.startsWith('Sun'))) gaps.push('a weekend day is offered')
      }
      for (const p of s.places ?? []) {
        const shown = (await R.ev('document.body.innerText')).includes(p) || await R.ev(`(async () => { const b = __q('Change Location'); if (!b) return false; b.click(); await new Promise((r) => setTimeout(r, 400)); const ok = document.body.innerText.includes(${JSON.stringify(p)}); return ok })()`)
        if (!shown) gaps.push('address not shown: ' + p)
      }
    }
    if (s.tasks) {
      await R.go(s.diaryDays ? `/studies/${s.id}/diary` : `/studies/${s.id}/survey`); await sleep(500)
      if (s.diaryDays) {
        const text = await R.ev('document.body.innerText')
        const n = (text.match(/Day \d+/g) || []).length
        if (!text.includes(`Day ${s.diaryDays}`) || text.includes(`Day ${s.diaryDays + 1}`)) gaps.push(`diary should run ${s.diaryDays} days (${n} day labels found)`)
        await R.go(`/studies/${s.id}/diary/1`); await sleep(500)
      }
      const held = await R.ev(`__hl.studyById(${JSON.stringify(s.id)}).tasks.map((q) => q.prompt)`)
      const first = await R.ev('document.body.innerText')
      if (!first.includes(s.tasks[0])) gaps.push('first question not on screen: ' + s.tasks[0])
      for (const t of s.tasks) if (!held.includes(t)) gaps.push('question not in the study the respondent has: ' + t)
      if (held.length !== s.tasks.length) gaps.push(`respondent is asked ${held.length} questions, built ${s.tasks.length}`)
      if (s.day2) {
        await R.go(`/studies/${s.id}/diary/2`); await sleep(500)
        const day2 = await R.ev('document.body.innerText')
        if (!day2.includes(s.day2.asks)) gaps.push('day 2 does not ask its own question: ' + s.day2.asks)
        if (day2.includes(s.day2.not)) gaps.push('day 2 asks a day 1 question: ' + s.day2.not)
      }
    }
  } catch (e) { gaps.push(String(e.message)) }
  note(4, s.key, gaps)
}
const numbers = await R.ev(`__st().studies.filter((x) => x.title.endsWith(${JSON.stringify(tag)})).map((x) => { const p = x.participations.find((y) => y.personId === 'jonathan'); const q = x.screener.find((y) => y.format === 'number'); return { study: x.title, answer: p && q ? p.answers[q.id] : undefined, type: p && q ? typeof p.answers[q.id] : 'none' } })`)
console.log('   The number answers, as the platform holds them: ' + numbers.map((n) => `${JSON.stringify(n.answer)} (${n.type})`).join(', '))

console.log('\n5. Save a draft, leave, come back: nothing was lost')
{
  const s = { ...STUDIES[3], title: `CC draft ${tag}`, description: 'A draft left half way.' }
  const gaps = []
  try {
    await aboutToScreener(s)
    await C.click(s.opener, 500)
    await C.ev(`(async () => { ${s.setup} return true })()`); await sleep(200)
    await C.click(s.submit, 700)
    await C.ev(FORMS);
    await C.click('Save Draft & Exit', 800)
    if (!(await C.path()).endsWith('/studies/drafts')) gaps.push('did not land on Drafts: ' + await C.path())
    // Leave: a full reload, then somewhere else in the app.
    await C.open('/client/dashboard'); await C.ev(FORMS)
    await C.go('/client/studies/drafts')
    if (!(await C.has(s.title))) gaps.push('the draft is not in the Drafts list')
    await C.click(s.title, 700)
    const read = async () => C.ev(`(() => ({ text: document.querySelector('main').innerText, values: __all('main input, main textarea').map((e) => e.value) }))()`)
    const seen = (page, x) => page.text.includes(x) || page.values.includes(x)
    const need = async (step, strings) => { const page = await read(); for (const x of strings) if (!seen(page, x)) gaps.push(`${step}: ${x}`) }
    await need('About', [s.title, s.description, dmy(s.end), `${s.duration} mins`])
    if (!(await C.ev(`[...document.querySelectorAll('[aria-pressed=true]')].some((b) => b.innerText.startsWith('In-Person'))`))) gaps.push('About: the study type')
    await C.click('Continue')
    await need('Audience', [s.participants, 'United States of America', 'Male', "Graduate or Bachelor's", '30–39', '40–54', AUDIENCE.roles, AUDIENCE.functions, AUDIENCE.skills, AUDIENCE.industries, 'Gold'])
    if (!(await C.ev(`__all('[role=radio]')[0].getAttribute('aria-checked') === 'true'`))) gaps.push('Audience: the condition')
    await C.click('Continue')
    await need('Screener', promptsOf(s.screener))
    await C.click('Continue')
    await need('Study', [s.summary])
    await C.click('Update Address & Availability', 500)
    await need('Availability', ['12 Main St, Austin, Texas, 73301', '4 Dock Road, Houston, Texas, 77002'])
    const times = await C.ev(`({ from: __al('Monday from').innerText.trim(), to: __al('Friday to').innerText.trim(), sat: __al('Saturday').getAttribute('aria-checked'), notice: __al('Minimum notice').value === '1' && Boolean(__all('button').find((b) => b.textContent.trim() === 'Days')) })`)
    if (times.from !== '10:00 AM' || times.to !== '04:00 PM') gaps.push(`Availability: hours read ${times.from} to ${times.to}`)
    if (times.sat !== 'false') gaps.push('Availability: Saturday is switched on')
    if (!times.notice) gaps.push('Availability: the minimum notice')
    const count = await C.ev(`__st().studies.filter((x) => x.title === ${JSON.stringify(s.title)}).length`)
    if (count !== 1) gaps.push(`${count} studies carry the draft's title`)
  } catch (e) { gaps.push(String(e.message)) }
  note(5, 'in-person draft, reopened after a reload', gaps)
}

console.log('')
const LINES = ['Create a study of each type, filling in every step properly', 'Reload, open each one: every single thing entered is still there', 'The console sees the same', 'A respondent sees the same', 'Save a draft, leave, come back: nothing was lost']
for (const n of [1, 2, 3, 4, 5]) { const bad = tally[n].filter((x) => x.gaps.length); console.log(`${bad.length || tally[n].length === 0 ? 'NO ' : 'YES'}  ${n}. ${LINES[n - 1]}${bad.length ? `   (${bad.map((b) => b.key).join(', ')})` : ''}`) }
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
