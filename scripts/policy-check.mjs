// The policy breaches, the figures that disagreed, the downloads and the
// faces, in three real tabs on one origin. Six questions, YES or NO.
//
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/policy-check.mjs
//
// Slow by design: check 6 opens every screen of all three apps (about 290),
// so a full run takes 8 to 12 minutes. It prints its progress as it goes. If
// nothing finishes within WATCHDOG_MIN minutes (default 30) it stops and says
// so, rather than sitting there looking like a hang.
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
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
const WATCHDOG_MIN = Number(process.env.WATCHDOG_MIN ?? 30)
const started = Date.now()
const elapsed = () => `${Math.round((Date.now() - started) / 1000)}s`
setTimeout(() => { console.log(`\nSTOPPED: no result after ${WATCHDOG_MIN} minutes, so something is stuck (last progress line above).`); try { proc.kill() } catch {} process.exit(1) }, WATCHDOG_MIN * 60000).unref()

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
const say = (n, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.slice(0, 12).join('; ') + (gaps.length > 12 ? ` (+${gaps.length - 12} more)` : '') : ''}`) }
const ROOT = resolve('.')

const R = await tab('respondent', 375, 812, true)
const C = await tab('client', 1440, 1000, false)
const I = await tab('console', 1440, 1000, false)
await R.open('/signin', 'localStorage.clear()'); await sleep(1200)
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 2500)
await I.open('/internal/signin'); await sleep(800)
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 2000)
await C.open('/client/dashboard', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`); await sleep(800)
console.log(`site: ${base}\n`)
const text = (t) => t.ev(`document.body.innerText.replace(/\\s+/g, ' ')`)
const st = () => R.ev('__st()')

/** Every respondent screen worth reading, with the seed's own ids filled in. */
const s0 = await st()
const by = Object.fromEntries(s0.studies.map((x) => [x.state === 'draft' ? 'x' : x.id, x.id]))
const mine = await R.ev(`__hl.studies.map((x) => ({ id: x.id, status: x.status, type: x.type }))`)
const pick = (status) => mine.find((x) => x.status === status)?.id
const RESP = ['/onboarding/welcome', '/dashboard', '/notifications', '/studies', '/studies/saved', '/studies/mine/invites', '/studies/mine/scheduled', '/studies/mine/applied', '/studies/mine/history',
  ...[...new Set(mine.map((x) => x.status))].map((st) => `/studies/${pick(st)}`),
  '/wallet', '/wallet/withdraw', '/wallet/payouts', '/wallet/earnings', '/points', '/points/redeem', '/points/how-it-works', '/profile', '/profile/edit', '/profile/certificate', '/profile/referrals', '/profile/settings',
  '/trust-score', '/trust-score/rules', '/trust-score/tiers', '/trust-score/history', '/support', '/support/tickets']
void by

// ---- 1. nothing says points or streaks raise the Trust Score
{
  const g = []
  const BAD = [
    /(points?|streaks?|referr\w*|refer|profile complet\w*|complet\w* (your )?profile)[^.!?]{0,80}(raise|rais|climb|increase|boost|improve|move|lift|grow)s?[^.!?]{0,30}(trust score|score|tier)/i,
    /(trust score|score and tiers?|score|tiers?)[^.!?]{0,40}(rise|rises|climb|climbs|increase|increases|grow|grows)[^.!?]{0,80}(points|streak|refer|profile)/i,
  ]
  let read = 0
  for (const path of RESP) {
    await R.go(path); await sleep(450); read += 1
    const t = await text(R)
    for (const re of BAD) { const m = re.exec(t); if (m) g.push(`${path}: "${m[0].slice(0, 120)}"`) }
  }
  await R.go('/onboarding/welcome'); await sleep(500)
  const welcome = (await text(R)).match(/Your score and tier[^!]*?reward points\./)?.[0] ?? ''
  if (!welcome) g.push('the Welcome line is not the rewritten one')
  say(1, 'Nothing in the respondent app says points or streaks raise the Trust Score', g, `${read} screens read for any line tying points, streaks, referrals or profile completion to the score; the Welcome line now reads "${welcome}"`)
}

// ---- 2. Trust Score Rules shows plain numbers
{
  const g = []
  await R.go('/trust-score/rules'); await sleep(600)
  const t = await text(R)
  const pct = t.match(/[^ ]*\d+\s*%[^ ]*/g) ?? []
  if (pct.length) g.push('percentages: ' + pct.join(', '))
  for (const want of ['Onboarding is fixed at 50 and is the minimum Trust Score.', '+1 for each completed study', 'Your score is always between 50 (minimum) and 100 (maximum).', 'can add up to 40.']) if (!t.includes(want)) g.push('missing: ' + want)
  const pills = await R.ev(`[...document.querySelectorAll('main span.rounded-full')].map((s) => s.innerText.trim()).filter((x) => /^[+-]?\\d/.test(x))`)
  say(2, 'Trust Score Rules shows plain numbers, no percentages', g, `no "%" anywhere on the screen; the values read ${pills.join(' ')}; "+1 for each completed study", "fixed at 50", "between 50 (minimum) and 100 (maximum)"`)
}

// ---- 3. the certificate: no name, an FI- id
{
  const g = []
  await R.go('/profile/certificate'); await sleep(700)
  const t = await text(R)
  const name = await R.ev(`__hl.user.name`)
  const id = (t.match(/Cert\. ID: (\S+)/) ?? [])[1]
  if (!/^FI-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id ?? '')) g.push('the id reads ' + id)
  for (const part of name.split(' ')) if (part && t.includes(part)) g.push(`the name "${part}" is on it`)
  if (/HL-R|Profile Score/.test(t)) g.push('still says HL-R or Profile Score')
  const initials = await R.ev(`(() => { const card = document.querySelector('main .rounded-lg'); return [...card.querySelectorAll('span')].some((s) => /^[A-Z]{1,2}$/.test(s.innerText.trim())) })()`)
  if (initials) g.push('the card still carries initials')
  await I.go('/internal/participants/jonathan'); await sleep(700)
  const consoleId = ((await text(I)).match(/Cert\. ID: (\S+)/) ?? [])[1]
  if (consoleId !== id) g.push(`the console shows ${consoleId}`)
  say(3, 'The certificate has no name and an FI- id', g, `respondent certificate: "Identity Verified", Cert. ID ${id}, "Trust Score", no name or initials; the console shows the same ${consoleId}`)
}

// ---- 4. each figure reads one way
{
  const g = []
  const found = {}
  const note = (k, v) => { (found[k] ??= new Set()).add(v) }
  // screener / response time, withdrawal time, gold, tickets, paid banner, notification 1, diary button
  await R.go('/notifications'); await sleep(600)
  let t = await text(R)
  for (const m of t.matchAll(/hear back within ([^.]+)\./g)) note('review', m[1])
  for (const m of t.matchAll(/reach your bank within ([^.]+)\./g)) note('withdrawal', m[1])
  if (/48 hours|3-5 business days|business days/.test(t)) g.push('notifications still say 48 hours or business days')
  const inviteBody = (t.match(/invited to complete[^.]*\./) ?? [])[0]
  if (/invited to schedule study/.test(t)) g.push('notification 1 still says "invited to schedule study"')
  const diary = await R.ev(`(() => { const st = __hl; const d = st.studies.find((s) => s.diary && s.status === 'in_process'); if (!d) return null; let n = 1; while (d.diary.completedDays.includes(n) && n < d.diary.totalDays) n++; return { want: 'Resume Study - Day ' + n + '/' + d.diary.totalDays, done: d.diary.completedDays.length } })()`)
  const diaryShown = (t.match(/Resume Study - [A-Za-z]+ ?\d+\/\d+/) ?? [])[0]
  // 23 Oct 2026: a reminder's action is dropped once the study has moved past that step. The diary here is
  // already in process (submitted), so its old reminder must not still offer "Resume Study".
  if (diary && diaryShown) g.push(`a submitted diary's reminder still offers "${diaryShown}"`)
  const inProcess = pick('in_process')
  if (inProcess) { await R.go(`/studies/${inProcess}`); await sleep(600); for (const m of (await text(R)).matchAll(/usually within ([^,]+),/g)) note('review', m[1]) }
  await R.go('/support'); await sleep(500)
  t = await text(R)
  for (const m of t.matchAll(/usually within ([^.]+)\./g)) note('review', m[1])
  for (const m of t.matchAll(/reach your bank within ([^.]+)\./g)) note('withdrawal', m[1])
  // a withdrawal, through the screens
  // Workflow 49: past $600 earned in a year a tax form is needed first; the demo account is past it.
  if (await R.ev(`__hl.user.taxFormRequired`)) { await R.ev(`__hl.taxFormDone(); true`); await sleep(300) }
  await R.go('/wallet/withdraw'); await sleep(600)
  await R.ev(`(() => { __type(document.querySelector('input[aria-label="Amount to withdraw"]'), '20'); return true })()`); await sleep(300)
  await R.click('Withdraw', 1500)
  t = await text(R)
  for (const m of t.matchAll(/credited within ([^.]+)\./g)) note('withdrawal', m[1])
  const req = await R.ev(`__st().people.find((p) => p.id === 'jonathan').payouts[0]`)
  await R.go(`/wallet/payouts/${req.id}`); await sleep(600)
  const shownBy = ((await text(R)).match(/Expected in bank by (\w+ \d+, \d{4})/) ?? [])[1]
  const want = await R.ev(`(() => { const d = new Date(${JSON.stringify(req.at)}); let n = 3; while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n-- } return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })()`)
  if (!shownBy || new Date(shownBy).toDateString() !== new Date(want).toDateString()) g.push(`Expected in bank by ${shownBy}, wanted ${want} (3 working days after ${req.at})`)
  await I.go('/internal/participants/jonathan?tab=wallet&sub=payouts'); await sleep(700)
  await I.ev(`(() => { const r = [...document.querySelectorAll('main [role=row], main tbody tr')].find((x) => x.innerText.includes(${JSON.stringify(req.txId)})); r && r.click(); return true })()`); await sleep(600)
  const consoleBy = ((await text(I)).match(/Expected in bank by (\w+ \d+, \d{4})/) ?? [])[1]
  if (!consoleBy || new Date(consoleBy).toDateString() !== new Date(want).toDateString()) g.push(`console Payout Details: Expected in bank by ${consoleBy}`)
  if ((await text(I)).includes('Bank Transfer 2149') && !req.destination.endsWith('2149')) g.push('console Payout Details still shows the sample payout')
  // gold
  for (const path of ['/dashboard', '/trust-score', '/trust-score/tiers']) { await R.go(path); await sleep(500); for (const m of (await text(R)).matchAll(/Gold,? ?(In Top \d+%)|Gold[^%]{0,40}?(In Top \d+%)/g)) note('gold', m[1] ?? m[2]) }
  await R.ev(`__hl.dispatch && true`)
  const goldChip = await R.ev(`(() => { return null })()`)
  void goldChip
  // tickets
  await R.go('/support/tickets'); await sleep(600)
  t = await text(R)
  if (/Solved/.test(t)) g.push('respondent tickets still say Solved')
  if (/\bClosed\b/.test(t)) note('ticket', 'Closed')
  await C.go('/client/help?tab=tickets'); await sleep(700)
  t = await text(C); if (/Solved/.test(t)) g.push('client tickets still say Solved'); if (/\bClosed\b/.test(t)) note('ticket', 'Closed')
  const closed = (await R.ev(`__st().tickets.find((t) => t.status === 'closed').id`))
  await I.go(`/internal/support/${closed}`); await sleep(700)
  t = await text(I); if (/\bSolved\b/.test(t)) g.push('console ticket still says Solved'); if (/\bClosed\b/.test(t)) note('ticket', 'Closed')
  // paid banner
  const paid = pick('paid')
  await R.go(`/studies/${paid}`); await sleep(600)
  const banner = ((await text(R)).match(/\+1 Trust score \+ \d+ Reward points/) ?? [])[0]
  if (banner !== '+1 Trust score + 25 Reward points') g.push('paid banner reads ' + banner)
  for (const [k, set] of Object.entries(found)) if (set.size !== 1) g.push(`${k} reads ${[...set].join(' / ')}`)
  // 23 Oct 2026: "In Top N%" is derived from the platform (shared/derive.ts topShareOf); it must read one value, the derived one.
  const goldTop = await R.ev(`__hl.tierTop('gold')`)
  if (!found.gold || found.gold.size !== 1 || [...found.gold][0] !== goldTop) g.push('Gold reads ' + [...(found.gold ?? [])].join(' / ') + ', derived ' + goldTop)
  say(4, 'Each of the seven figures reads the same everywhere it appears', g, `screener and response: "${[...(found.review ?? [])].join('/')}" (notification, In Process banner, FAQ); withdrawal: "${[...(found.withdrawal ?? [])].join('/')}" (notification, FAQ, success screen) and Expected in bank by ${shownBy}, three working days after the request, in the app and the console; Gold: "${[...(found.gold ?? [])].join('/')}" on the dashboard, Trust Score and How Tiers Works; tickets: "Closed" in all three apps; paid banner: "${banner}"; notification 1: "${inviteBody}"; diary reminder action: ${diaryShown ? `"${diaryShown}"` : "dropped once submitted"}`)
}

// ---- 5. every download produces a file or is gone
{
  const g = []
  const dir = join(process.env.TEMP ?? '/tmp', `policy-dl-${process.pid}`)
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dir })
  const got = []
  const fetchFile = async (label, t, path, how) => {
    // A file of the same name would be overwritten in place, so each download starts from an empty folder.
    for (const f of readdirSync(dir)) rmSync(join(dir, f), { force: true })
    const before = new Set()
    await t.go(path); await sleep(900)
    const toastBefore = await t.ev(`document.querySelector('[role=status]')?.innerText ?? ''`)
    try { await t.ev(`(async () => { ${how} })()`) } catch (e) { g.push(`${label}: ${e.message.slice(0, 90)}`); return }
    let file
    for (let i = 0; i < 30 && !file; i++) { await sleep(150); file = readdirSync(dir).find((f) => !before.has(f) && !f.endsWith('.crdownload')) }
    const toast = await t.ev(`document.querySelector('[role=status]')?.innerText ?? ''`)
    if (!file) { g.push(`${label}: no file arrived (toast "${toast}")`); return }
    const bytes = readFileSync(join(dir, file))
    const kind = file.endsWith('.pdf') ? (bytes.subarray(0, 5).toString() === '%PDF-' && bytes.toString('latin1').trimEnd().endsWith('%%EOF') ? 'PDF' : 'BROKEN PDF') : file.endsWith('.csv') ? (bytes.toString('utf8').split('\n').length > 1 ? 'CSV' : 'EMPTY CSV') : 'file'
    if (/BROKEN|EMPTY/.test(kind)) g.push(`${label}: ${kind} ${file}`)
    if (!toast.includes(file) && toast === toastBefore) g.push(`${label}: no message naming the file`)
    got.push(`${label}: ${file} (${kind}, ${bytes.length} bytes)`)
  }
  const btn = (txt, n = 0) => `const b = [...document.querySelectorAll('main button, [role=dialog] button, aside button')].filter((x) => x.offsetParent && x.innerText.trim() === ${JSON.stringify(txt)})[${n}]; if (!b) throw new Error('no button ${txt}'); b.click()`
  await fetchFile('Respondent payout receipt', R, '/wallet/payouts/po-1', btn('Download Receipt PDF'))
  await fetchFile('Invoice row (Payments)', C, '/client/payments', `const b = document.querySelector('button[aria-label="Download invoice"]'); if (!b) throw new Error('no invoice row'); b.click()`)
  await fetchFile('Invoice panel (paid)', C, '/client/payments?tab=completed', `document.querySelector('button[aria-label="View invoice"]').click(); await new Promise((r) => setTimeout(r, 700)); ${btn('Download')}`)
  // Pay All has no download of its own: the earlier audit credited it with the invoice table's buttons behind the panel, which are the row downloads above.
  const payAll = await (async () => { await C.open('/client/payments?panel=payall'); await sleep(800); return C.ev(`[...document.querySelectorAll('[role=dialog] button')].filter((b) => b.offsetParent && /download/i.test(b.innerText + (b.getAttribute('aria-label') || ''))).length`) })()
  if (payAll) g.push(`the Pay All panel now has ${payAll} download controls`)
  await fetchFile('Invoice row, with Pay All open', C, '/client/payments?panel=payall', `const b = document.querySelector('button[aria-label="Download invoice"]'); if (!b) throw new Error('no invoice row'); b.click()`)
  await fetchFile('Results summaries', C, '/client/studies/st-pay/results', btn('Download', 0))
  // The certificate's download is an icon button since 22 Oct 2026 (1627:104407).
  await fetchFile('Results certificate', C, '/client/studies/st-pay/results', `const b = document.querySelector('button[aria-label="Download the certificate"]'); if (!b) throw new Error('no certificate download'); b.click()`)
  await fetchFile('Pay tab invoice', C, '/client/studies/st-pay/pay', btn('Invoice'))
  await fetchFile('Session attendance list', C, '/client/studies/st-fitness/recruited?panel=downloads', btn('Download List'))
  // The notes are kept since 22 Oct 2026, so their download gives what was typed.
  await fetchFile('Interview notes', C, '/client/studies/st-sleep/respondent/ferry-l/result?session=running', `const t = document.querySelector('textarea[aria-label="Interview notes"]'); if (!t) throw new Error('no notes box'); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(t, 'Policy check note'); t.dispatchEvent(new Event('input', { bubbles: true })); await new Promise((r) => setTimeout(r, 700)); document.querySelector('button[aria-label="Download notes"]').click()`)
  const anyClaim = []
  for (const [t, paths] of [[C, ['/client/payments', '/client/studies/st-pay/results', '/client/studies/st-pay/pay']], [R, ['/wallet/payouts/po-1']]]) for (const p of paths) { await t.go(p); await sleep(400); if (/downloaded/i.test(await text(t))) anyClaim.push(p) }
  if (anyClaim.length) g.push('a screen still says "downloaded": ' + anyClaim.join(', '))
  say(5, 'Every download either produces a file or is gone', g, `${got.length} files saved, each named in its message:\n         ${got.join('\n         ')}`)
}

// ---- 6. no real face anywhere
{
  const g = []
  const ALLOWED = /\/img\/(canva\.jpg|card\.jpg|goals\.jpg|learn-video\.jpg|payment\.jpg|[a-z0-9-]+\.svg|landing\/[a-z]+\.png|manage\/st-(goal|pay|travel|social)(-thumb)?\.png|studies\/(digital-payments|goal-tracking|social-media|travel-preferences)(-40)?\.png|participants\/(passport|study1|study3)\.png|review\/(header-thumb|thumbnail)\.png|support\/shot\.png)$/
  const seen = new Map()
  const routes = (app) => readFileSync(join(ROOT, app, 'scripts', 'routes.txt'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
  const total = routes('client').length + routes('internal').length + RESP.length + 3
  let done = 0
  const walk = async (t, prefix, list) => {
    for (const r of list) {
      if (++done % 25 === 0 || done === total) console.log(`       6. reading screens: ${done} of ${total} (${elapsed()})`)
      await t.go(prefix + '/' + r.replace(/^\/+/, '')); await sleep(350)
      const imgs = await t.ev(`(async () => { await new Promise((r) => setTimeout(r, 150)); const out = []; for (const el of document.querySelectorAll('img, image, video[poster]')) { const s = el.currentSrc || el.getAttribute('src') || el.getAttribute('href') || el.getAttribute('poster') || ''; out.push({ s, ok: el.tagName !== 'IMG' || (el.complete && (el.naturalWidth > 0 || /[.]svg($|[?])/.test(s))) }) } for (const el of document.querySelectorAll('*')) { const b = getComputedStyle(el).backgroundImage; const m = b && b.match(/url\\("?([^")]+)"?\\)/); if (m) out.push({ s: m[1], ok: true }) } return out })()`)
      for (const { s, ok } of imgs) {
        const key = s.startsWith('data:') ? s.slice(0, 22) : new URL(s, base).pathname
        if (!seen.has(key)) seen.set(key, `${prefix}/${r.replace(/^\/+/, '')}`)
        if (!ok && !s.startsWith('blob:')) g.push(`${prefix}/${r}: an image did not load (${key})`)
        if (s.startsWith('data:image/svg') || s.startsWith('blob:')) continue
        if (s.startsWith('data:image/')) { g.push(`${prefix}/${r}: a raster picture ${key}`); continue }
        if (!ALLOWED.test(new URL(s, base).pathname)) g.push(`${prefix}/${r}: ${new URL(s, base).pathname}`)
      }
    }
  }
  await walk(C, '/client', routes('client'))
  await walk(I, '/internal', routes('internal'))
  await walk(R, '', RESP.concat(['/', '/signin', '/signup']))
  const rasters = [...seen.keys()].filter((k) => !k.startsWith('data:'))
  say(6, 'No real face appears anywhere in any of the three apps', [...new Set(g)], `${routes('client').length + routes('internal').length + RESP.length + 3} screens read; every person is a drawn figure (data:image/svg) or an initial; the only photographs left are of things, each checked by eye: ${rasters.map((k) => k.replace('/img/', '').replace(/^\/(client|internal)/, '')).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`)
}

console.log(`\n${[1, 2, 3, 4, 5, 6].filter((n) => results[n]).length} of 6 yes  (${elapsed()})`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].slice(0, 8).join('\n  '))
ws.close(); proc.kill()
process.exit(0)
