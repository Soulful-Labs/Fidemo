// Seven faults fixed on 13 Oct 2026 (third pass), followed in a real browser on
// the one origin: no Edit on a live study, the fee on Publish is the fee
// taken, Create Study starts blank, pre-screener answers are kept and shown,
// Matched is the audience that was set, an uploaded thumbnail is the study's
// picture, and nothing is paid until the team processes the payout by hand.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/final-check.mjs
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


// ---------------------------------------------------------- the seven checks

const flat = (s) => s.replace(/\s+/g, '')
const results = []
const say = (n, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.map((g) => JSON.stringify(g)).join(', ') : ''}`) }
const short = (name) => { const [first, ...rest] = name.trim().split(/\s+/); return rest.length ? `${first} ${rest.at(-1)[0]}` : first }

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
const titles = () => C.ev(`__st().studies.map((x) => x.title + '|' + x.state)`)
const aboutTitle = () => C.ev(`(__all('input').find((e) => e.placeholder === 'Enter title of your study') || {}).value`)

// ---- 3. Create Study always starts a new study
const g3 = []
const LEFT = `Left half way ${tag}`
await C.click('Create Study', 600); await C.click('Fill from scratch instead', 700); await C.ev(FORMS)
if (await aboutTitle() !== '') g3.push('the first Create Study did not open blank')
await C.click('Video Call')
await C.ev(`(() => { __ph('Enter title of your study', ${JSON.stringify(LEFT)}); __ph('Enter study description', 'Typed, then left.'); return true })()`); await sleep(200)
await C.go('/client/dashboard'); await sleep(300)
await C.click('Create Study', 700); await C.click('Fill from scratch instead', 700); await C.ev(FORMS)
if (!(await C.path()).endsWith('/create/about')) g3.push('Create Study went to ' + await C.path())
const blank1 = { title: await aboutTitle(), description: await C.ev(`document.querySelector('textarea').value`), type: await C.ev(`[...document.querySelectorAll('[aria-pressed=true]')].map((b) => b.innerText.split('\\n')[0]).join()`) }
if (blank1.title !== '' || blank1.description !== '') g3.push('with work in progress it opened holding ' + JSON.stringify(blank1))
const kept = (await titles()).filter((t) => t === `${LEFT}|draft`).length
if (kept !== 1) g3.push(`the study that was in progress is in Drafts ${kept} times, not once`)
// and with a saved draft open for editing
await C.go('/client/studies/drafts'); await sleep(300)
await C.click(LEFT, 700)
if (await aboutTitle() !== LEFT) g3.push('the draft did not reopen from Drafts')
await C.go('/client/studies'); await sleep(300)
await C.click('Create Study', 700); await C.click('Fill from scratch instead', 700); await C.ev(FORMS)
if (await aboutTitle() !== '') g3.push('with a draft open for editing it opened holding ' + JSON.stringify(await aboutTitle()))
if ((await titles()).filter((t) => t.startsWith(LEFT)).length !== 1) g3.push('editing then Create Study left ' + (await titles()).filter((t) => t.startsWith(LEFT)).length + ' copies of the draft')
say(3, 'Create Study opens blank even with a draft in progress', g3, `the unfinished study went to Drafts once, as "${LEFT}", and reopened from there`)

// ---- build the study the other checks follow: a survey, a narrow audience, a real picture
const S = { title: `Final ${tag}`, description: 'A survey with a narrow audience and its own picture.', participants: '6', incentive: 80 }
const picture = resolve('client/public/img/landing/create.png')
await C.click('Survey')
const { root } = await send('DOM.getDocument', {}, C.sid)
const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: '#thumbnail-file' }, C.sid)
await send('DOM.setFileInputFiles', { nodeId, files: [picture] }, C.sid); await sleep(900)
await C.ev(`(() => { __type(__al('Duration'), '20'); __ph('Enter title of your study', ${JSON.stringify(S.title)}); __ph('Enter study description', ${JSON.stringify(S.description)}); return true })()`)
const chosen = await C.ev(`({ shown: Boolean(document.querySelector('main img[src^="data:image/jpeg"]')), name: document.body.innerText.includes('create.png') })`)
await C.click('Continue')
// Men in healthcare, anywhere, any age (D38: Jonathan, who applies below, has to fit): countries and age ranges cleared, gender and industry set.
await C.ev(`(async () => {
  __type(__all('main input')[0], ${JSON.stringify(S.participants)})
  await __choose(__btn('All Genders'), 'Male')
  await __choose(__btn('2 range selected'), '18–20', '21–29')
  __ph('e.g. Healthcare, Finance', 'Healthcare'); await __choose(__btn('Select work functions...'), 'Consultation', 'Patient Care', 'Research')
  return true })()`); await sleep(300)
// The Audience step forecast is drawn as Coming soon (19 Oct 2026); Publish's Estimated Audience is the count.
await C.click('Continue')
await C.ev(buildScreener(THREE)); await sleep(200)
await C.click('Continue')
await C.click('Create Survey Questionnaire', 500)
await C.ev(`(async () => { __ph('Enter question text...', 'How often do you shop online?'); __ph('Enter option', 'Weekly', 0); __ph('Enter option', 'Monthly', 1); return true })()`); await sleep(200)
await C.click('Save & Continue', 500)
// The incentive and costs sit under the study settings on the Study step (22 Oct 2026, every Create frame).
await C.ev(FORMS);
await C.ev(`(() => { __type(__al('Incentive Amount'), '$${S.incentive}'); return true })()`); await sleep(150)
await C.click('Proceed to Publish', 600)

// ---- 2. the fee shown on Publish is the fee taken
const g2 = []
const publishText = await C.ev('document.body.innerText')
const upfront = (/To pay upfront\s*\$([\d,]+(?:\.\d+)?)/.exec(publishText) || [])[1]
const total = (/Total Study Cost\s*\$([\d,]+)/.exec(publishText) || [])[1]
if (/3%|processing fee/i.test(publishText)) g2.push('Publish still mentions a processing fee')
const audienceChip = (/Estimated Audience:\s*([\d,]+)/.exec(publishText) || [])[1]
await C.ev(FORMS) // the demo client's saved card is already selected
await C.click('Publish Study', 900)
S.id = await C.ev(`(__st().studies.find((x) => x.title === ${JSON.stringify(S.title)}) || {}).id`)
const stored = await C.ev(`(() => { const s = __st().studies.find((x) => x.id === ${JSON.stringify(S.id)}); return { payments: s.payments.map((p) => p.kind + ' ' + p.amount), image: (s.image || '').slice(0, 30), bytes: (s.image || '').length, rates: s.rates, required: s.required } })()`)
if (stored.payments.join() !== `deposit ${Number((upfront || '').replace(/,/g, ''))}`) g2.push(`Publish said $${upfront} upfront; the store took ${stored.payments.join() || 'nothing'}`)
const fromRates = stored.rates.platformFee + (stored.rates.recruitingPer + stored.rates.incentivePer + stored.rates.moderationPer) * stored.required
if (fromRates !== Number((total || '').replace(/,/g, ''))) g2.push(`Publish said a total of $${total}; the study's rates come to $${fromRates}`)
await C.go('/client/studies/st-sleep/payment'); await sleep(500)
if (/3%|processing fee/i.test(await C.ev('document.body.innerText'))) g2.push('Bill Payment still mentions a processing fee')
say(2, 'The fee shown on Publish is the fee taken', g2, `Publish: total $${total}, upfront $${upfront}, no processing fee mentioned; the store took ${stored.payments.join()} and holds rates that come to $${fromRates}`)

// The team takes it live, which is when the platform matches people to it.
await I.go(`/internal/studies/review/${S.id}`); await I.click('Approve to Publish', 400); await I.click('Approve and Publish', 900)

// ---- 5. Matched is the people who fit the audience
const g5 = []
const people = await C.ev(`(() => { const st = __st(); const s = st.studies.find((x) => x.id === ${JSON.stringify(S.id)}); const of = (id) => st.people.find((p) => p.id === id); const pool = st.people.filter((p) => p.status === 'active' && p.identity.state === 'verified')
  return { pool: pool.length, matched: s.participations.filter((x) => x.state === 'matched').map((x) => { const p = of(x.personId); return { name: p.name, gender: p.profile.gender, industry: p.profile.industry } }), outsiders: pool.filter((p) => p.profile.gender !== 'Male' || !p.profile.industry.toLowerCase().includes('healthcare')).map((p) => p.name),
    fitting: pool.filter((p) => p.profile.gender === 'Male' && p.profile.industry.toLowerCase().includes('healthcare') && /bachelor/i.test(p.profile.education)).length } })()`)
if (people.matched.length === 0) g5.push('nobody was matched')
if (people.matched.length !== people.fitting) g5.push(`${people.matched.length} matched, but ${people.fitting} people in the pool fit`)
for (const m of people.matched) if (m.gender !== 'Male' || !/healthcare/i.test(m.industry)) g5.push(`${m.name} is matched and does not fit (${m.gender}, ${m.industry})`)
await C.go(`/client/studies/${S.id}/matched`); await sleep(600)
for (let i = 0; i < 12 && await C.ev(`Boolean(__q('Load more'))`); i++) await C.click('Load more', 300)
const clientText = await C.ev(`document.querySelector('main').innerText`)
const shownNames = people.matched.filter((m) => clientText.includes(short(m.name)))
if (shownNames.length !== people.matched.length) g5.push(`client Matched shows ${shownNames.length} of the ${people.matched.length} matched`)
const matchedShort = new Set(people.matched.map((m) => short(m.name)))
const strangers = people.outsiders.map(short).filter((n) => !matchedShort.has(n) && new RegExp(`(^|\\n)${n}(\\n|$)`).test(clientText))
if (strangers.length) g5.push('client Matched shows people who do not fit: ' + strangers.slice(0, 5).join(', '))
await I.go(`/internal/studies/${S.id}?tab=matched`); await sleep(700)
const consoleText = await I.ev('document.body.innerText')
const consoleStrangers = people.outsiders.filter((n) => !people.matched.some((m) => m.name === n) && consoleText.includes(n))
if (!people.matched.slice(0, 3).every((m) => consoleText.includes(m.name) || consoleText.includes(short(m.name)))) g5.push('console Matched does not list the matched people')
if (consoleStrangers.length) g5.push('console Matched shows people who do not fit: ' + consoleStrangers.slice(0, 5).join(', '))
if (String(people.matched.length) !== audienceChip) g5.push(`Publish estimated ${audienceChip}; ${people.matched.length} were matched`)
say(5, 'With a narrow audience, Matched only shows people who fit it', g5, `audience: men in healthcare. ${people.matched.length} of the ${people.pool} people in the pool fit; Publish estimated ${audienceChip}, and Matched lists those ${people.matched.length} in the client app and the console`)

// ---- 1. a live study has no Edit anywhere
const g1 = []
await C.go(`/client/studies/${S.id}/manage`); await sleep(500)
const liveEdits = await C.ev(`__all('button, a').filter((b) => /^Edit\\b/.test(b.textContent.trim())).length`)
if (liveEdits) g1.push(`Manage Study shows ${liveEdits} Edit controls`)
await C.go(`/client/studies/${S.id}`); await sleep(400)
if (await C.ev(`__all('button, a').filter((b) => /^Edit\\b/.test(b.textContent.trim())).length`)) g1.push('Study Overview shows an Edit control')
await C.ev(`(__all('button').find((b) => /options/i.test(b.getAttribute('aria-label') || '')) || { click() {} }).click()`); await sleep(300)
const headerMenu = await C.ev(`__all('button').map((b) => b.textContent.trim()).filter((t) => /Edit|View billing|Back to all studies/.test(t))`)
if (headerMenu.some((t) => /^Edit/.test(t))) g1.push('the study header menu offers ' + headerMenu.join(', '))
await C.go('/client/studies?view=table'); await sleep(400)
await C.ev(`(() => { const row = [...document.querySelectorAll('tr')].find((r) => r.innerText.includes(${JSON.stringify(S.title)})); row.querySelector('[aria-label="Study options"]').click(); return true })()`); await sleep(300)
const rowMenu = await C.ev(`__all('button').map((b) => b.textContent.trim()).filter((t) => ['Copy Study Link', 'Pause Study', 'Stop-complete Study', 'Edit', 'Duplicate to Drafts'].includes(t))`)
if (rowMenu.includes('Edit')) g1.push('the row menu still offers Edit')
if (!rowMenu.includes('Pause Study')) g1.push('the row menu did not open: ' + rowMenu.join(', '))
await I.go(`/internal/studies/${S.id}`); await sleep(500)
await I.ev(`document.querySelector('[aria-label="Study options"]').click()`); await sleep(300)
const consoleMenu = await I.ev(`[...document.querySelectorAll('[role=menuitem]')].map((b) => b.textContent.trim())`)
// 21 Oct 2026: the team may edit a live study in the console (money and bookings locked); the client still may not.
if (!consoleMenu.includes('Edit')) g1.push('the console\'s study menu has lost Edit')
if (consoleMenu.length === 0) g1.push('the console\'s study menu did not open')
say(1, 'A live study has no Edit in the client app, and the console can edit it', g1, `client row menu: ${rowMenu.join(', ')}; client header menu: ${headerMenu.join(', ')}; console study menu: ${consoleMenu.join(', ')}; no Edit button on Manage Study or Study Overview`)

// ---- 6. the picture, everywhere the study appears
const g6 = []
if (!chosen.shown || !chosen.name) g6.push('About did not show the chosen picture and its name')
if (!stored.image.startsWith('data:image/jpeg')) g6.push('the study holds no picture: ' + JSON.stringify(stored.image))
const sameImage = (t) => t.ev(`(() => { const want = __st().studies.find((x) => x.id === ${JSON.stringify(S.id)}).image; return [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src') === want && i.naturalWidth > 0 && __vis(i)).length })()`)
const PLACES = [
  [C, 'client, Studies cards', '/client/studies', async () => { await C.ev(`(__all('button').find((b) => /grid|cards/i.test(b.getAttribute('aria-label') || '')) || { click() {} }).click()`); await sleep(400) }],
  [C, 'client, Study Overview', `/client/studies/${S.id}`], [C, 'client, Manage Study', `/client/studies/${S.id}/manage`],
  [I, 'console, Study', `/internal/studies/${S.id}`], [I, 'console, Studies list', '/internal/studies?tab=ongoing'],
  [R, 'respondent, Explore', '/studies'], [R, 'respondent, Study Detail', `/studies/${S.id}`],
]
const seenAt = []
for (const [t, name, path, before] of PLACES) {
  await t.go(path); await sleep(600); if (before) await before()
  const n = await sameImage(t)
  if (n) seenAt.push(name); else g6.push('not shown on: ' + name)
}
say(6, 'An uploaded thumbnail is the study\'s picture everywhere it appears', g6, `create.png was read in the browser and kept as a ${Math.round(stored.bytes / 1024)} KB JPEG; seen on: ${seenAt.join('; ')}`)

// ---- 4. the pre-screener answers
const g4 = []
await R.go(`/studies/${S.id}`)
if (await R.ev(`Boolean(__q('Accept and Apply'))`)) await R.click('Accept and Apply', 900); else await R.click('Apply', 900)
const pre = await R.ev(`__st().studies.find((x) => x.id === ${JSON.stringify(S.id)}).preScreener`)
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
const answer = pre[0].passing[0]
const held = await R.ev(`__st().studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((x) => x.personId === 'jonathan')`)
if (held?.preAnswers?.[pre[0].id] !== answer) g4.push('the platform holds ' + JSON.stringify(held?.preAnswers))
await C.go(`/client/studies/${S.id}/respondent/jonathan?state=recruited`); await sleep(600)
const clientAnswers = flat(await C.ev(`document.querySelector('main').innerText`))
if (!clientAnswers.includes(flat(pre[0].prompt + 'Ans.' + answer))) g4.push(`client: "${answer}" is not written under "${pre[0].prompt}"`)
if (/Passed/.test(clientAnswers)) g4.push('client: still writes "Passed" in place of the answer')
await I.go(`/internal/studies/${S.id}/respondents/jonathan`); await sleep(600)
const consoleAnswers = flat(await I.ev('document.body.innerText'))
if (!consoleAnswers.includes(flat(pre[0].prompt)) || !consoleAnswers.includes(flat(answer))) g4.push(`console: "${answer}" is not shown for "${pre[0].prompt}"`)
say(4, 'A respondent\'s pre-screener answers are visible to the client and the console', g4, `"${pre[0].prompt}" answered "${answer}", shown above the rest of the screener answers in both`)

// ---- 7. Payouts: never automatic; the team processes them once the study finishes
const g7 = []
await I.click('Qualify', 800)
await R.go(`/studies/${S.id}/survey`); await sleep(500)
await R.ev(`[...document.querySelectorAll('[role=radio]')].find((o) => o.innerText.trim() === 'Weekly').click()`); await sleep(250)
await R.click('Submit', 1500)
const wallet = () => R.ev(`__hl.user.walletBalance`)
const mine = () => R.ev(`(() => { const p = __st().studies.find((x) => x.id === ${JSON.stringify(S.id)}).participations.find((x) => x.personId === 'jonathan'); return { state: p.state, paidAt: p.paidAt || null } })()`)
const before = await wallet()
await sleep(8000)
const waited = await mine()
if (waited.state !== 'completed') g7.push('the survey was not completed: ' + waited.state)
if (waited.paidAt || await wallet() !== before) g7.push('they were paid automatically, 8 seconds after completing')
await C.go(`/client/studies/${S.id}/pay`); await sleep(600)
if (await C.has('Approve ')) g7.push('the client can still approve payouts on the Pay tab')
await C.go('/client/studies?view=table'); await sleep(400)
await C.ev(`(() => { const row = [...document.querySelectorAll('tr')].find((r) => r.innerText.includes(${JSON.stringify(S.title)})); row.querySelector('[aria-label="Study options"]').click(); return true })()`); await sleep(300)
await C.click('Stop-complete Study', 400); await C.click('Yes, Stop-complete', 900)
if ((await mine()).paidAt) g7.push('finishing the study paid them without the team')
await I.go('/internal/finance/payouts'); await sleep(500)
await I.ev(`(() => { const row = [...document.querySelectorAll('div')].filter((r) => r.innerText?.includes(${JSON.stringify(S.title)}) && [...r.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Process Payouts')).sort((a, b) => a.innerText.length - b.innerText.length)[0]; [...row.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Process Payouts').click(); return true })()`); await sleep(400)
await I.ev(`(() => { [...document.querySelectorAll('[role=dialog] button')].find((x) => /^Process [0-9]/.test(x.textContent.trim())).click(); return true })()`); await sleep(900)
const paidNow = await mine()
if (!paidNow.paidAt) g7.push('processing the payout in the console did not pay them')
await sleep(600)
if (await wallet() !== before + S.incentive) g7.push(`the wallet went from ${before} to ${await wallet()}, not up by ${S.incentive}`)
say(7, 'Payouts are processed by the team, never automatically', g7, `8 seconds after completing, not paid; the Pay tab has no approve; the client finished the study, still not paid; paid $${S.incentive} the moment the team processed it in Finance > Payouts`)

console.log(`\n${[1, 2, 3, 4, 5, 6, 7].filter((n) => results[n]).length} of 7 yes`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
