// The seven faults fixed on 13 Oct 2026, followed in a real browser on the one
// origin: a respondent's survey and diary answers reach the client app and the
// console; the money screens match the fee table and what the store takes;
// Edit opens the study being edited; work in progress survives a reload; and
// the console's review shows the whole study. Prints YES or NO for each.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/flow-check.mjs
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
  await __choose(__btn('All Genders'), 'Female')
  await __choose(__btn('2 range selected'), '18–20', '21–29', '30–39', '40–54')
  __ph('e.g. Product Manager', ${JSON.stringify(AUDIENCE.roles)}); await (async (list) => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Select work functions...').click(); await w(250); for (const t of list) { [...document.querySelectorAll('[role=menuitemcheckbox]')].find((x) => x.textContent.trim() === t).click(); await w(150) } document.querySelector('button[aria-label=Close]')?.click(); await w(150) })(${JSON.stringify(AUDIENCE.functions)}.split(', '))
  __ph('e.g. SQL, Figma', ${JSON.stringify(AUDIENCE.skills)}); __ph('e.g. Healthcare, Finance', ${JSON.stringify(AUDIENCE.industries)})
  __all('[role=radio]')[0].click(); await __wait()
  await __choose(__btn('Any tier'), 'Silver Tier')
  return true })()`
/** Education is left as the step opens with it; the pool holds one level of education, so any other would estimate an audience of none. */
const AUDIENCE_SHOWN = ['United States of America', 'Female', "Graduate or Bachelor's", '30–39, 40–54', 'Oncologist, Nurse', 'Consultation', 'Triage', 'Healthcare', 'Silver']

const hours = (from, to) => `await __time('Monday from', ${JSON.stringify(from)}); await __time('Monday to', ${JSON.stringify(to)}); __al('Copy Monday').click(); await __wait(); __al('Saturday').click(); await __wait(); __al('Sunday').click(); await __wait();`
const address = (street, city, zip) => `__ph('Office number, Building/Street name, Area', ${JSON.stringify(street)}); __ph('City, State', ${JSON.stringify(city)}); __ph('Zip Code', ${JSON.stringify(zip)}); await __wait(); __all('button').filter((b) => b.textContent.trim() === 'Add Address').pop().click(); await __wait();`
const session = (d, t) => `__type(__al('Session date'), ${JSON.stringify(ymd(d))}); await __time('Session start time', ${JSON.stringify(t)}); __exact('Add').click(); await __wait();`


// ------------------------------------------------------------ the six checks

/** The fee table (shared/platform.ts FEES), written out so the figures on screen are checked against it and not against the code that draws them. */
const FEE = { platform: 100, moderation: 10, recruitment: 25, typeAddon: 25 }
const usd = (n) => '$' + n.toLocaleString('en-US')
const costOf = (surveyType, n, incentive) => {
  const rec = FEE.recruitment + (surveyType ? 0 : FEE.typeAddon)
  const c = { incentives: n * incentive, recruitment: n * rec, moderation: n * FEE.moderation, platform: FEE.platform, rec }
  // The deposit (15 Oct 2026): 25% of the incentive cost and 25% of the recruitment cost, for the full sample.
  const depInc = Math.round(c.incentives * 25) / 100, depRec = Math.round(c.recruitment * 25) / 100
  return { ...c, total: c.incentives + c.recruitment + c.moderation + c.platform, depInc, depRec, deposit: depInc + depRec }
}
const flat = (s) => s.replace(/\s+/g, '')
const lacks = async (t, strings) => { const text = flat(await t.ev('document.body.innerText')); return strings.filter((x) => !text.includes(flat(x))) }
const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const results = []
const say = (n, name, gaps, detail = '') => { results.push(gaps.length === 0); console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.map((g) => JSON.stringify(g)).join(', ') : ''}`) }

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)
await R.open('/signin', 'localStorage.clear()')
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 1500)
await I.open('/internal/signin')
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 1200)
await C.open('/client/studies', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`)

const end = after(30)
const SURVEY = { card: 'Survey', title: `FC survey ${tag}`, description: 'A survey followed from the answers back to the client and the team.', duration: 20, participants: '12', incentive: 60 }
const DIARY = { card: 'Diary Study', title: `FC diary ${tag}`, description: 'A diary followed from each day back to the client and the team.', duration: 15, participants: '9', incentive: 75 }
const PLACE = { card: 'In-Person', title: `FC in-person ${tag}`, description: 'An in-person study with every setting filled in.', duration: 45, participants: '8', incentive: 150 }
const idOf = (s) => C.ev(`(__st().studies.find((x) => x.title === ${JSON.stringify(s.title)}) || {}).id`)
// The demo client's saved card is already selected at Publish; the form is only there when it is not.
const card = `(() => { if (!__all('input').some((e) => e.placeholder === '0000 0000 0000 0000')) return true; __ph('0000 0000 0000 0000', '4242 4242 4242 4242'); __ph('MM / YYYY', '12 / 2028'); __ph('000', '123'); __ph('Enter name', 'Jennifer Lee'); return true })()`

async function about(s) {
  await C.go('/client/studies/create/about'); await C.ev(FORMS)
  await C.click(s.card)
  await C.ev(`(() => { __type(__al('Duration'), '${s.duration}'); __ph('DD / MM / YYYY', ${JSON.stringify(dmy(end))}); __ph('Enter title of your study', ${JSON.stringify(s.title)}); __ph('Enter study description', ${JSON.stringify(s.description)}); return true })()`)
  await C.click('Continue')
  // Work Function and Industry are required (Role and Skills are not, and add to the price).
  await C.ev(`(async () => { __type(__all('main input')[0], ${JSON.stringify(s.participants)}); await (async (list) => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Select work functions...').click(); await w(250); for (const t of list) { [...document.querySelectorAll('[role=menuitemcheckbox]')].find((x) => x.textContent.trim() === t).click(); await w(150) } document.querySelector('button[aria-label=Close]')?.click(); await w(150) })(['Engineering']); __ph('e.g. Healthcare, Finance', 'IT'); return true })()`); await sleep(150)
  await C.click('Continue')
  await C.ev(buildScreener(THREE)); await sleep(200)
}
/** The figures a money screen should show for this study, and the ones it does not. */
async function money(s, surveyType, where) {
  const c = costOf(surveyType, Number(s.participants), s.incentive)
  const n = s.participants
  const want = where === 'summary'
    ? [`Total Study Cost${usd(c.total)}`, `To pay upfront${usd(c.deposit)}`]
    : [`${n}x participants`, `Incentive Cost•${n} x ${usd(s.incentive)}${usd(c.incentives)}`, `Recruitment Cost•${n} x ${usd(c.rec)}${usd(c.recruitment)}`, `Moderation Cost•${n} x ${usd(FEE.moderation)}${usd(c.moderation)}`,
        `Platform Fee•one-time${usd(c.platform)}`, `Total Study Cost${usd(c.total)}`, `Incentive deposit•25% of cost${usd(c.depInc)}`, `Recruitment deposit•25% of cost${usd(c.depRec)}`, `To pay upfront${usd(c.deposit)}`]
  const text = flat(await C.ev('document.body.innerText'))
  const gaps = want.filter((x) => !text.includes(flat(x))).map((x) => `${where}: ${x}`)
  if (text.includes('$1,900') || text.includes('$475')) gaps.push(`${where}: still shows $1,900 or $475`)
  return { gaps, c }
}

// ---- 5. reload mid-creation
const g5 = []
await about(SURVEY)
const beforeReload = await C.ev(`__all('input').filter((e) => e.placeholder === 'Enter question text...').map((e) => e.value).filter(Boolean)`)
await C.open('/client/studies/create/screener'); await C.ev(FORMS)
const afterReload = await C.ev(`__all('input').filter((e) => e.placeholder === 'Enter question text...').map((e) => e.value).filter(Boolean)`)
if (beforeReload.length !== 3 || JSON.stringify(beforeReload) !== JSON.stringify(afterReload)) g5.push(`screener questions before ${beforeReload.length}, after ${afterReload.length}`)
const optionsBack = await C.ev(`__all('input').filter((e) => e.placeholder === 'Enter option').map((e) => e.value)`)
for (const x of ['Yes, most nights', 'A phone app']) if (!optionsBack.includes(x)) g5.push('Screener option: ' + x)
await C.go('/client/studies/create/about'); await sleep(300)
const aboutValues = await C.ev(`__all('main input, main textarea').map((e) => e.value)`)
for (const x of [SURVEY.title, SURVEY.description, dmy(end)]) if (!aboutValues.includes(x)) g5.push('About: ' + x)
if (!(await C.ev(`[...document.querySelectorAll('[aria-pressed=true]')].some((b) => b.innerText.startsWith('Survey'))`))) g5.push('About: the study type')
await C.go('/client/studies/create/audience'); await sleep(300)
if (!(await C.ev(`__all('main input').map((e) => e.value)`)).includes(SURVEY.participants)) g5.push('Audience: participants')
say(5, 'Reload mid-creation: nothing is lost', g5, `a full page reload on the Screener step; ${afterReload.length} of ${beforeReload.length} questions, the title, description, end date, type and sample size came back`)

// ---- 3. the money, on a survey (no type add-on) and later on an in-person study (with it)
const g3 = []
await C.go('/client/studies/create/study'); await C.ev(FORMS); await sleep(300)
await C.click('Create Survey Questionnaire', 500)
await C.ev(`(async () => { __ph('Enter question text...', 'How often do you shop online?'); __ph('Enter option', 'Weekly', 0); __ph('Enter option', 'Monthly', 1);
  __btn('Add Question').click(); await __wait(); await __choose(__all('button').filter((b) => b.textContent.trim() === 'Single-select').pop(), 'Multi-line input'); __ph('Enter question text...', 'What stops you buying?', 5); return true })()`)
await sleep(200); await C.click('Save & Continue', 500)
// Study setup and pricing are two steps (15 Oct 2026): the incentive is on Pricing.
await C.click('Continue', 700); await C.ev(FORMS);
await C.ev(`(() => { __type(__al('Incentive Amount'), '$${SURVEY.incentive}'); return true })()`); await sleep(200)
const m1 = await money(SURVEY, true, 'Study step'); g3.push(...m1.gaps)
await C.click('Proceed to Publish', 600)
g3.push(...(await money(SURVEY, true, 'summary')).gaps)
await C.click('View Breakdown', 500)
g3.push(...(await money(SURVEY, true, 'Breakdown panel')).gaps)
await C.ev(`(document.querySelector('[aria-label="Close panel"], [aria-label=Close]') || { click() {} }).click()`); await sleep(300)
await C.ev(FORMS); await C.ev(card)
await C.click('Publish Study', 900)
SURVEY.id = await idOf(SURVEY)
const taken1 = await C.ev(`__st().studies.find((x) => x.id === ${JSON.stringify(SURVEY.id)}).payments.map((p) => p.kind + ' ' + p.amount).join()`)
if (taken1 !== `deposit ${m1.c.deposit}`) g3.push(`the store took "${taken1}", the screens said ${m1.c.deposit}`)

// ---- 4. editing: a submitted study from Manage Study, then a draft from Drafts
const g4 = []
await C.go(`/client/studies/${SURVEY.id}/manage`); await sleep(400)
// A study in review has one edit pencil on its own screen (Manage Study, 15 Oct 2026); it opens the Create flow with everything in it.
const pencil = await C.ev(`Boolean(document.querySelector('[aria-label="Edit study"]'))`)
if (!pencil) g4.push('a study in review has no edit pencil')
await C.ev(`document.querySelector('[aria-label="Edit study"]').click()`); await sleep(500)
if (!(await C.path()).endsWith('/create/about')) g4.push('the edit pencil opened ' + await C.path())
await C.go('/client/studies/create/screener'); await sleep(400)
const reopened = await C.ev(`__all('input').filter((e) => e.placeholder === 'Enter question text...').map((e) => e.value).filter(Boolean)`)
if (JSON.stringify(reopened) !== JSON.stringify(THREE.map((q) => q.text))) g4.push('the screener that opened is not this study\'s: ' + JSON.stringify(reopened))
await C.go('/client/studies/create/about'); await C.ev(FORMS); await sleep(300)
if (!(await C.ev(`__all('main input').map((e) => e.value)`)).includes(SURVEY.title)) g4.push('About did not open with this study\'s title')
const revised = SURVEY.description + ' Revised.'
await C.ev(`(() => { __ph('Enter study description', ${JSON.stringify(revised)}); return true })()`)
await C.go('/client/studies/create/publish'); await sleep(400)
await C.click('Publish Study', 900)
const sameStudy = await C.ev(`(() => { const all = __st().studies.filter((x) => x.title === ${JSON.stringify(SURVEY.title)}); return { n: all.length, id: all[0] && all[0].id, description: all[0] && all[0].description, state: all[0] && all[0].state, payments: all[0] && all[0].payments.length } })()`)
if (sameStudy.n !== 1 || sameStudy.id !== SURVEY.id || sameStudy.description !== revised || sameStudy.state !== 'in_review' || sameStudy.payments !== 1) g4.push('editing did not save over the same study: ' + JSON.stringify(sameStudy))

// The diary, straight through. A 3-day diary's minimum is 3 by itself: four fifths, rounded up (policy section 5).
await about(DIARY)
await C.click('Continue'); await C.ev(FORMS)
// Since 21 Oct 2026 (1518:94904) the schedule is set inside the diary form, and each day has its own
// questions: the same two are written on each of the three days, using each day's own Add Question.
await C.click('Create Survey Questionnaire', 500)
await C.ev(`(async () => { await __choose(__btn('Every 2 days'), 'Every 3 days'); await __choose(__btn('5 days'), '3 days'); return true })()`); await sleep(150)
await C.ev(`(async () => { __btn('Add Question', 1).click(); await __wait(); __btn('Add Question', 2).click(); await __wait()
  for (let d = 0; d < 3; d++) { __ph('Enter question text...', 'What did you eat today?', d * 2); __ph('Enter question text...', 'How did you feel afterwards?', d * 2 + 1) }
  return true })()`); await sleep(200)
await C.click('Save & Continue', 500)
// Study setup and pricing are two steps (15 Oct 2026): the incentive is on Pricing.
await C.click('Continue', 700); await C.ev(FORMS);
await C.ev(`(() => { __type(__al('Incentive Amount'), '$${DIARY.incentive}'); return true })()`); await sleep(150)
await C.click('Proceed to Publish', 600); await C.ev(FORMS); await C.ev(card); await C.click('Publish Study', 900)
DIARY.id = await idOf(DIARY)

// The in-person study: built, saved as a draft, reopened from Drafts, then published.
await about(PLACE)
await C.click('Continue'); await C.ev(FORMS)
await C.click('Set Address & Availability', 500)
await C.ev(`(async () => { ${address('12 Main St', 'Austin, Texas', '73301')} ${address('4 Dock Road', 'Houston, Texas', '77002')} await __choose(__btn('15 minutes'), '10 minutes'); await __choose(__btn('10 Minutes'), '1 Hour'); ${hours('09:00 AM', '05:00 PM')}
  __al('Add hours to Tuesday').click(); await __wait(); await __time('Tuesday from', '06:00 PM', 1); await __time('Tuesday to', '08:00 PM', 1); return true })()`)
// Since 22 Oct 2026 the composer has no Submit: Continue submits the availability and moves to Pricing.
await sleep(200); await C.click('Continue', 900); await C.ev(FORMS);
await C.ev(`(() => { __type(__al('Incentive Amount'), '$${PLACE.incentive}'); return true })()`); await sleep(150)
await C.click('Save Draft & Exit', 800)
await C.open('/client/studies/drafts'); await C.ev(FORMS)
await C.click(PLACE.title, 700)
if (!(await C.path()).endsWith('/create/about')) g4.push('the draft opened ' + await C.path())
const draftAbout = await C.ev(`__all('main input, main textarea').map((e) => e.value)`)
for (const x of [PLACE.title, PLACE.description, dmy(end)]) if (!draftAbout.includes(x)) g4.push('draft, About: ' + x)
await C.go('/client/studies/create/study'); await C.ev(FORMS); await sleep(300)
g4.push(...(await lacks(C, ['2 addresses, available 5 days/week, custom timings'])).map((x) => 'draft, Study: ' + x))
// The costs are on the Pricing step now (15 Oct 2026).
await C.click('Continue', 700); await C.ev(FORMS)
const m2 = await money(PLACE, false, 'Study step'); g3.push(...m2.gaps)
await C.click('Proceed to Publish', 600)
g3.push(...(await money(PLACE, false, 'summary')).gaps)
await C.ev(FORMS); await C.ev(card); await C.click('Publish Study', 900)
PLACE.id = await idOf(PLACE)
const taken2 = await C.ev(`(() => { const all = __st().studies.filter((x) => x.title === ${JSON.stringify(PLACE.title)}); return all.length + ' study, ' + all[0].payments.map((p) => p.kind + ' ' + p.amount).join() })()`)
if (taken2 !== `1 study, deposit ${m2.c.deposit}`) g3.push(`in-person: the store holds "${taken2}", the screens said ${m2.c.deposit}`)
say(3, 'Every figure on Costing, Payment and Payment Summary matches the fee table', g3,
  `survey 12 x $60: total ${usd(m1.c.total)}, upfront ${usd(m1.c.deposit)}, and the store took ${usd(m1.c.deposit)}; in-person 8 x $150: total ${usd(m2.c.total)}, upfront ${usd(m2.c.deposit)}, and the store took ${usd(m2.c.deposit)}`)

// ---- 6. the console shows the whole study
const g6 = []
let text = ''
for (const t of ['about', 'study']) { await I.go(`/internal/studies/review/${PLACE.id}?tab=${t}`); text += flat(await I.ev('document.body.innerText')) }
const FIELDS = [
  ['end date', [`Study End Date${shortDate(end)}`]], ['buffer', ['Buffer between meetings10 minutes']], ['minimum notice', ['Minimum notice duration1Hour']],
  ['every address', ['12 Main St, Austin, Texas, 73301', '4 Dock Road, Houston, Texas, 77002']],
  ['weekly hours as hours', ['Monday09:00 AMTO05:00 PM', 'Tuesday09:00 AMTO05:00 PM06:00 PMTO08:00 PM', 'Friday09:00 AMTO05:00 PM']],
]
for (const [name, want] of FIELDS) for (const x of want) if (!text.includes(flat(x))) g6.push(`${name}: ${x}`)
if (/\d+slots?/.test(text)) g6.push('weekly hours: slot counts are still shown')
if (text.includes('Saturday') || text.includes('Sunday')) g6.push('weekly hours: a closed day is listed')
await I.go(`/internal/studies/review/${DIARY.id}?tab=study`)
const diaryText = flat(await I.ev('document.body.innerText'))
if (!diaryText.includes(flat('Frequency:Every 3 days'))) g6.push('diary frequency: Every 3 days')
if (diaryText.includes(flat('Every day'))) g6.push('diary frequency: still says Every day')
await I.go(`/internal/studies/review/${DIARY.id}?tab=about`)
g6.push(...(await lacks(I, [`Study End Date${shortDate(end)}`])).map((x) => 'diary end date: ' + x))
say(6, 'The console shows the missing fields', g6, 'end date, buffer, minimum notice, every address, weekly hours as hours, and the diary frequency as chosen')

// The team takes the survey and the diary live.
for (const s of [SURVEY, DIARY]) { await I.go(`/internal/studies/review/${s.id}`); await I.click('Approve to Publish', 400); await I.click('Approve and Publish', 800) }
await C.go(`/client/studies/${SURVEY.id}/manage`); await sleep(500)
const liveEdit = await C.ev(`__all('button').filter((b) => b.textContent.trim() === 'Edit').length`)
if (liveEdit !== 0) g4.push(`a live study still shows ${liveEdit} Edit buttons`)
say(4, 'Editing a study opens that study', g4, 'Edit on a study in review opened its own screener and title and saved over the same study; a saved draft reopened with its own steps; a live study has no Edit button')

/** Applies, answers the screener and is qualified by the team in the console. */
async function recruit(s) {
  await R.go(`/studies/${s.id}`)
  if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 900); else await R.click('Apply', 900)
  const pre = await R.ev(`__st().studies.find((x) => x.id === ${JSON.stringify(s.id)}).preScreener`)
  for (let i = 0; i < 12 && !(await R.path()).endsWith('/applied'); i++) {
    await R.ev(`(() => {
      const q = ${JSON.stringify(pre)}.find((x) => __has(x.prompt)); if (q) { __click(q.passing[0]); return }
      const num = document.querySelector('main input[inputmode=decimal]'); if (num) { __type(num, '5'); return }
      const opt = [...document.querySelectorAll('main [role=radio], main [role=checkbox]')].find(__vis); if (opt) opt.click() })()`)
    await sleep(250)
    const next = await R.ev(`['Check eligibility', 'Submit', 'Continue'].find((t) => { const b = __q(t); return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' }) || ''`)
    if (!next) break
    await R.click(next, 900)
  }
  await I.go(`/internal/studies/${s.id}/respondents/jonathan`); await I.click('Qualify', 800)
}

// ---- 1. a survey's answers
const g1 = []
const WHY = `Delivery costs too much ${tag}.`
try {
  await recruit(SURVEY)
  await R.go(`/studies/${SURVEY.id}/survey`); await sleep(500)
  await R.ev(`[...document.querySelectorAll('[role=radio]')].find((o) => o.innerText.trim() === 'Monthly').click()`); await sleep(250)
  await R.click('Continue', 700)
  await R.ev(`(() => { __type(document.querySelector('main textarea, main input'), ${JSON.stringify(WHY)}); return true })()`); await sleep(250)
  await R.click('Submit', 1500)
  if (!(await R.path()).endsWith('/survey/done')) g1.push('the survey did not submit, stopped on ' + await R.path())
  await C.go(`/client/studies/${SURVEY.id}/results`); await sleep(500)
  if (!(await C.has('Jonathan'))) g1.push('client Results does not list the respondent')
  await C.go(`/client/studies/${SURVEY.id}/respondent/jonathan/result`); await sleep(600)
  g1.push(...(await lacks(C, ['How often do you shop online?', 'Monthly', 'What stops you buying?', WHY])).map((x) => 'client: ' + x))
  await I.go(`/internal/studies/${SURVEY.id}/respondents/jonathan?tab=result`); await sleep(600)
  g1.push(...(await lacks(I, ['How often do you shop online?', 'Monthly', 'What stops you buying?', WHY])).map((x) => 'console: ' + x))
} catch (e) { g1.push(String(e.message)) }
say(1, 'A respondent answers a survey; the client sees the answers in Results, and so does the console', g1, `answered "Monthly" and "${WHY}"`)

// ---- 2. a diary's answers
const g2 = []
const ENTRY = (d, n) => `Day ${d} answer ${n} ${tag}`
try {
  await recruit(DIARY)
  const fill = async (d) => {
    await R.go(`/studies/${DIARY.id}/diary/${d}`); await sleep(500)
    await R.ev(`(() => { [...document.querySelectorAll('main textarea, main input')].filter(__vis).forEach((el, n) => __type(el, ${JSON.stringify(`Day ${d} answer `)} + (n + 1) + ${JSON.stringify(' ' + tag)})); return true })()`); await sleep(250)
    await R.click('Submit Progress', 1500)
  }
  await fill(1); await fill(2)
  // A 3-day diary needs all 3 (four fifths, rounded up): with two, Complete Study is not open.
  await R.go(`/studies/${DIARY.id}/diary`); await sleep(400)
  if (await R.ev(`(() => { const b = [...document.querySelectorAll('button')].filter(__vis).find((x) => x.textContent.trim().startsWith('Complete Study')); return Boolean(b) && !b.disabled && b.getAttribute('aria-disabled') !== 'true' })()`)) g2.push('respondent: Complete Study is open with 2 of 3 days')
  await fill(3)
  await R.go(`/studies/${DIARY.id}/diary`); await sleep(400)
  await R.click('Complete Study', 1500)
  const want = ['DAY 1', 'DAY 2', 'DAY 3', 'What did you eat today?', 'How did you feel afterwards?', ENTRY(1, 1), ENTRY(1, 2), ENTRY(2, 1), ENTRY(2, 2), ENTRY(3, 1), ENTRY(3, 2)]
  await C.go(`/client/studies/${DIARY.id}/respondent/jonathan/result`); await sleep(600)
  g2.push(...(await lacks(C, want)).map((x) => 'client: ' + x))
  await I.go(`/internal/studies/${DIARY.id}/respondents/jonathan?tab=result`); await sleep(600)
  g2.push(...(await lacks(I, want)).map((x) => 'console: ' + x))
} catch (e) { g2.push(String(e.message)) }
say(2, 'The same for a diary study', g2, 'Complete Study stays shut at 2 of 3 days; all three filled in, two answers each, read back by the client and the console')

console.log(`\n${results.filter(Boolean).length} of ${results.length} yes`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
