// The ten changes of 15 Oct 2026, followed in a real browser on the one
// origin: respondent at 375, console and client at 1440. Each of the
// thirteen checks answers yes or no and names the app it was checked in.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/ten-check.mjs
//   BASE_URL=https://fidemo-lyart.vercel.app node --experimental-websocket scripts/ten-check.mjs
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
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


// ---------------------------------------------------------------- the thirteen checks

const results = []
const say = (n, app, name, gaps, detail = '') => { results[n] = gaps.length === 0; console.log(`${gaps.length ? 'NO ' : 'YES'}  ${n}. [${app}] ${name}${detail ? '\n       ' + detail : ''}${gaps.length ? '\n       missing or wrong: ' + gaps.map((g) => JSON.stringify(g)).join(', ') : ''}`) }
const flat = (s) => (s ?? '').replace(/\s+/g, ' ')
const body = async (t) => flat(await t.ev('document.body.innerText'))
const clickExact = (t, text) => t.ev(`(() => { const b = [...document.querySelectorAll('button')].filter(__vis).filter((x) => x.textContent.trim() === ${JSON.stringify(text)}).pop(); if (!b) throw new Error('no button: ' + ${JSON.stringify(text)}); b.click(); return true })()`)
const st = (t, expr) => t.ev(`(() => { const s = __st(); return ${expr} })()`)
const draftOf = (t) => t.ev(`JSON.parse(localStorage.getItem('fi-client-create') || 'null')?.draft`)
const disabled = (t, text) => t.ev(`(() => { const b = [...document.querySelectorAll('button')].filter(__vis).find((x) => x.textContent.trim().startsWith(${JSON.stringify(text)})); return b ? b.disabled : null })()`)
const signOutClient = `(() => { try { const x = JSON.parse(localStorage.getItem('fi-client-session')); x.current = null; localStorage.setItem('fi-client-session', JSON.stringify(x)) } catch {} return true })()`

// Two thumbnails to upload: a real 1x1 PNG each, under different names.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const shots = resolve(process.env.CHECK_TMP ?? '.', 'ten-check-files')
mkdirSync(shots, { recursive: true })
const thumbA = join(shots, 'cover-first.png'), thumbB = join(shots, 'cover-second.png')
writeFileSync(thumbA, PNG); writeFileSync(thumbB, PNG)
async function upload(t, selector, file) {
  const { root } = await send('DOM.getDocument', { depth: -1 }, t.sid)
  const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector }, t.sid)
  await send('DOM.setFileInputFiles', { nodeId, files: [file] }, t.sid)
  await sleep(700)
}

const R = await tab('respondent', 375, 812, true)
const I = await tab('console', 1440, 1000, false)
const C = await tab('client', 1440, 1000, false)

await R.open('/signin', 'localStorage.clear()')
await R.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'jonathan.reeve@example.com'); __type(p, 'Passw0rd!'); return true })()`)
await R.click('Login', 1500)
await I.open('/internal/signin')
await I.ev(`(() => { const [e, p] = document.querySelectorAll('input'); __type(e, 'peter@focusinsite.com'); __type(p, 'demo1234'); return true })()`)
await I.click('Login', 1200)

const tag = Date.now().toString(36).slice(-4)
/** Sign up a new client and walk Organization Details. The tax ID is left empty. */
async function signUp(name, email) {
  await C.open('/client/signup', signOutClient); await C.ev(FORMS)
  await C.ev(`(() => { __ph('E.g. John Doe', ${JSON.stringify(name)}); __ph('Enter work email address', ${JSON.stringify(email)}); __ph('Enter your password', 'Passw0rd!1'); return true })()`)
  await C.click('I agree'); await C.click('Sign Up', 900)
  await C.click('Open My Email', 900); await C.ev(FORMS)
}
async function organization(company) {
  const page = await body(C)
  await C.ev(`(() => { __ph('Enter your role', 'Research Lead'); __ph('Enter organization name', ${JSON.stringify(company)}); __ph('https://', 'https://www.${company.toLowerCase().replace(/\W/g, '')}.com'); return true })()`)
  await C.click('Continue', 900)
  return page
}
async function finishOnboarding() {
  for (let i = 0; i < 20 && !(await C.path()).endsWith('/welcome'); i++) await sleep(500)
  await C.click('Let', 1200)
}
const clientId = (email) => st(C, `s.clients.find((c) => c.email === ${JSON.stringify(email)})?.id`)

// ---- 1 and 2: a new client, Tax ID optional and left empty, no card at onboarding
const emailA = `ada.${tag}@stonelabs.com`
await signUp('Ada Stone', emailA)
const orgPage = await organization(`Stone Labs ${tag}`)
const afterOrg = await C.path()
const skipShown = await C.has('Do It Later')
await C.click('Do It Later', 900)
await finishOnboarding()
const idA = await clientId(emailA)
{
  const g = []
  if (!/Tax ID \(optional\)/.test(orgPage)) g.push('onboarding does not read "Tax ID (optional)"')
  if (!afterOrg.endsWith('/payment-method')) g.push(`Continue with no tax ID did not move on (on ${afterOrg})`)
  if ((await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idA)}).taxId`)) !== '') g.push('a tax ID was stored')
  await C.go('/client/account')
  const account = await body(C)
  if (!/Tax ID \(optional\)/.test(account)) g.push('the account profile does not read "Tax ID (optional)"')
  await I.open(`/internal/clients/${idA}`)
  const record = await body(I)
  if (!/Tax ID/.test(record) || !/Not given \(optional\)/.test(record)) g.push('the console client record does not show "Tax ID: Not given (optional)"')
  await I.open('/internal/clients/verifications/cv-cl-verda')
  const verification = await body(I)
  if (!/Tax ID \(optional\)/.test(verification) || !/Tax ID Registration/.test(verification)) g.push('the console verification screen does not read Tax ID')
  const vatOnScreens = [orgPage, account, record, verification].filter((t) => /\bVAT\b/i.test(t)).length
  if (vatOnScreens) g.push(`VAT on ${vatOnScreens} screen(s)`)
  // Every shipped bundle of all three apps, the code the browser runs.
  const files = []
  const walk = (d) => { for (const f of readdirSync(d, { withFileTypes: true })) { const p = join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(js|html)$/.test(f.name)) files.push(p) } }
  walk(resolve('dist'))
  const withVat = files.filter((f) => /\bVAT\b/.test(readFileSync(f, 'utf8')))
  if (withVat.length) g.push(`"VAT" in ${withVat.join(', ')}`)
  say(1, 'client + console', 'Client and console read Tax ID, it is optional, and no VAT remains in any app', g,
    `onboarding, client account, console client record and console verification all read Tax ID; Continue passed with it empty; ${files.length} built files of the three apps searched, none says VAT`)
}
{
  const g = []
  if (!skipShown) g.push('no Do It Later on Payment Method')
  const where = await C.path()
  if (!where.endsWith('/dashboard') && !where.endsWith('/account')) g.push(`did not reach the app (on ${where})`)
  const cards = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idA)}).cards.length`)
  if (cards !== 0) g.push(`${cards} cards on file`)
  say(2, 'client', 'Client onboarding completes with no card', g, `Do It Later, then In Review, Welcome, and into the app with 0 cards on file`)
}

// ---- The skipped-card client builds a survey: duration copy, thumbnail, required fields, education, AI, delete
await C.go('/client/studies/create/about'); await C.ev(FORMS)
const aboutText = await body(C)
await C.click('Survey')
await C.ev(`(() => { __ph('Enter title of your study', 'Ten check ${tag}'); return true })()`)
// 8: upload, remove, upload again, change
const thumbs = []
await upload(C, '#thumbnail-file', thumbA)
thumbs.push(await C.ev(`[...document.querySelectorAll('img[alt="Study thumbnail"]')].length + ':' + (__has('cover-first.png') ? 'cover-first.png' : '')`))
await clickExact(C, 'Remove'); await sleep(400)
thumbs.push(await C.ev(`[...document.querySelectorAll('img[alt="Study thumbnail"]')].length + ':' + (__has('Upload Thumbnail Image') ? 'upload box' : '')`))
await upload(C, '#thumbnail-file', thumbA)
const hasChange = await C.ev(`Boolean([...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Change'))`)
await upload(C, '#thumbnail-file', thumbB)
thumbs.push(await C.ev(`[...document.querySelectorAll('img[alt="Study thumbnail"]')].length + ':' + (__has('cover-second.png') ? 'cover-second.png' : '')`))
const thumbState = (await draftOf(C))?.thumbnail
await C.click('Continue', 700); await C.ev(FORMS)

// 9: Continue with Work Function and Industry empty stays put and says why; Role and Skills left empty does not block
const onAudience = (await C.path()).endsWith('/audience')
await C.click('Continue', 700)
const blocked = { path: await C.path(), text: await body(C) }
// 10: Generate with AI from a typed description, twice, with different text
const AI_1 = 'We want to talk to 12 nurses in US hospitals, aged 25 to 45, about how they use telehealth apps on night shifts. What slows them down?'
const AI_2 = 'Interview 8 product managers at fintech companies in the UK about payment apps.'
const fill = async (text) => {
  await C.click('Fill with AI', 500)
  const box = await C.ev(`(() => { const t = document.querySelector('#ai-prompt'); return t ? { placeholder: t.placeholder, lead: document.querySelector('label[for=ai-prompt]').textContent } : null })()`)
  await C.ev(`__type(document.querySelector('#ai-prompt'), ${JSON.stringify(text)})`)
  await C.click('Fill Audience', 600)
  const d = await draftOf(C)
  return { box, d: { functions: d.functions, industries: d.industries, roles: d.roles, skills: d.skills, countries: d.countries, ageRanges: d.ageRanges, participants: d.participants, description: d.description }, note: (await body(C)).match(/From your description: [^]*?(?=Set Target Audience)/)?.[0] }
}
const ai1 = await fill(AI_1)
const ai2 = await fill(AI_2)
// 7: tick a second education level
// Education is a dropdown of checkboxes since the 15 Oct 2026 designs: open it, tick a second level.
await C.ev(`(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith("Graduate or Bachelor")).click(); return true })()`); await sleep(300)
await C.ev(`(() => { const b = [...document.querySelectorAll('[role=menu][aria-label="Level of Education"] [role=menuitemcheckbox]')].find((x) => x.textContent.includes("Master's degree")); b.click(); return true })()`); await sleep(300)
const education = await C.ev(`[...document.querySelectorAll('[role=menu][aria-label="Level of Education"] [role=menuitemcheckbox]')].map((b) => b.textContent.trim() + '=' + b.getAttribute('aria-checked'))`)
await C.ev(`(() => { document.querySelector('button[aria-label=Close].fixed')?.click(); return true })()`); await sleep(200)
const eduDraft = (await draftOf(C)).education
// Role and Skills cleared: Continue still goes on, now that Work Function and Industry are in
await C.ev(`(() => { __ph('e.g. Product Manager', ''); __ph('e.g. SQL, Figma', ''); return true })()`); await sleep(200)
await C.click('Continue', 700); await C.ev(FORMS)
const passed = await C.path()

// Screener: Generate from the same description, then delete a question in one click (11)
await C.click('Generate', 500)
const screenerPrefill = await C.ev(`document.querySelector('#ai-prompt')?.value`)
await C.click('Add Questions', 600)
const generatedQs = await C.ev(`[...document.querySelectorAll('input')].filter((e) => e.placeholder === 'Enter question text...').map((e) => e.value).filter(Boolean)`)
// Since 22 Oct 2026 each question has a three-dot menu (Required, Move up, Move down, Add question below, Delete), reversing the 15 Oct bin.
const countQ = () => C.ev(`[...document.querySelectorAll('input')].filter((e) => e.placeholder === 'Enter question text...').length`)
const menus = await C.ev(`[...document.querySelectorAll('button')].filter((b) => /^Options for /.test(b.getAttribute('aria-label') || '')).length`)
const bins = await C.ev(`[...document.querySelectorAll('button')].filter((b) => /^Delete (Q|SQ|Pre-screener)/.test(b.getAttribute('aria-label') || '')).length`)
const menuItem = (label, item) => C.ev(`(async () => { [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === ${JSON.stringify('Options for ' + label)}).click(); await new Promise((r) => setTimeout(r, 200)); const m = [...document.querySelectorAll('[role=menuitem]')].find((b) => b.textContent.trim() === ${JSON.stringify(item)}); const off = !m || m.disabled; if (m && !m.disabled) m.click(); else document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); return !off })()`)
const firstUp = await C.ev(`(async () => { [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Options for Pre-screener - Q1').click(); await new Promise((r) => setTimeout(r, 200)); const m = [...document.querySelectorAll('[role=menuitem]')].find((b) => b.textContent.trim() === 'Move up'); const off = Boolean(m?.disabled); document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); return off })()`)
await sleep(200)
const beforeDel = await countQ()
await menuItem('Q9', 'Delete'); await sleep(300)
const confirmShown = await C.has('Delete Question?')
await clickExact(C, 'Delete'); await sleep(400)
const afterDel = await countQ()
// The pre-screener's first question with options, so the screener can be asked
await C.ev(`(() => { const q = [...document.querySelectorAll('input')].filter((e) => e.placeholder === 'Enter question text...')[0]; __type(q, 'Do you work night shifts?'); const root = q.closest('.py-4'); __ph('Enter option', 'Yes', 0, root); __ph('Enter option', 'No', 1, root); return true })()`); await sleep(200)
await C.click('Continue', 700); await C.ev(FORMS)

// Study step: no AutoPay (12); survey composer delete (11)
const studyText = await body(C)
await C.click('Create Survey Questionnaire', 600); await C.ev(FORMS)
await C.ev(`(() => { __ph('Enter question text...', 'How often do you shop online?'); __ph('Enter option', 'Weekly', 0); __ph('Enter option', 'Monthly', 1); return true })()`)
await C.click('Add Question', 300)
// Add question below on SQ 1, then Move up on the new SQ 2: the typed question is now SQ 2.
const qText = () => C.ev(`[...document.querySelectorAll('input')].filter((e) => e.placeholder === 'Enter question text...').map((e) => e.value)`)
const beforeAdd = await countQ()
await menuItem('SQ 1', 'Add question below'); await sleep(300)
const afterAdd = await countQ(); const addedAt = (await qText())[1]
await menuItem('SQ 2', 'Move up'); await sleep(300)
const movedTo = (await qText()).indexOf('How often do you shop online?')
const surveyBefore = await countQ()
// Delete the blank one, now SQ 1, so the typed question is still there to submit.
await menuItem('SQ 1', 'Delete'); await sleep(300)
const surveyConfirm = await C.has('Delete Question?')
await clickExact(C, 'Delete'); await sleep(400)
const surveyAfter = await countQ()
await C.click('Save & Continue', 600)
// Study setup and pricing are two steps (15 Oct 2026): the incentive is on Pricing.
await C.click('Continue', 700); await C.ev(FORMS);
await C.ev(`(() => { __type(__al('Incentive Amount'), '$40'); return true })()`); await sleep(200)
const studyText2 = await body(C)
await C.click('Proceed to Publish', 800); await C.ev(FORMS)

// 4: no card on file, Publish disabled; a card typed in unlocks it and is kept
const pub = await body(C)
const disabledBefore = await disabled(C, 'Publish Study')
await C.ev(`(() => { __ph('0000 0000 0000 0000', '4242 4242 4242 4242'); __ph('MM / YYYY', '12 / 2028'); __ph('000', '123'); __ph('Enter name', 'Ada Stone'); return true })()`); await sleep(300)
const disabledAfter = await disabled(C, 'Publish Study')
await C.click('Publish Study', 1000)
const publishedA = (await C.path()).endsWith('/published')
const cardsA = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idA)}).cards.map((c) => c.last4).join()`)
{
  const g = []
  if (!/No card is on file yet/.test(pub)) g.push('Publish does not say no card is on file')
  if (disabledBefore !== true) g.push('Publish Study was not disabled with no card')
  if (disabledAfter !== false) g.push('a typed card did not unlock Publish Study')
  if (!publishedA) g.push('did not publish once the card was added')
  if (cardsA !== '4242') g.push(`card not kept on the account (${cardsA})`)
  say(4, 'client', 'A client who skipped the card cannot publish until they add one', g, `Publish Study disabled with "No card is on file yet"; after typing a card it unlocked, published, and the card (****${cardsA}) is now on the account`)
}

// ---- 3: a second client adds a card at onboarding; Publish has it selected
const emailB = `ben.${tag}@harborview.io`
await signUp('Ben Hart', emailB)
await organization(`Harborview ${tag}`)
await C.ev(FORMS)
await C.ev(`(() => { __ph('0000  0000  0000  0000', '4111 1111 1111 1111'); __ph('MM / YYYY', '11 / 2029'); __ph('000', '321'); __ph('Enter name', 'Ben Hart'); return true })()`)
await C.click('Continue', 900)
await finishOnboarding()
const idB = await clientId(emailB)
const cardsB = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idB)}).cards.map((c) => c.brand + ' ' + c.last4).join()`)
// The shortest valid study, then Publish
await C.go('/client/studies/create/about'); await C.ev(FORMS)
await C.click('Survey'); await C.ev(`__ph('Enter title of your study', 'Ten check B ${tag}')`); await C.click('Continue', 600); await C.ev(FORMS)
await C.ev(`(() => { __ph('e.g. Product, Engineering, Marketing', 'Engineering'); __ph('e.g. Healthcare, Finance', 'IT'); return true })()`); await sleep(200)
await C.click('Continue', 600); await C.ev(FORMS)
await C.ev(`(() => { const q = [...document.querySelectorAll('input')].filter((e) => e.placeholder === 'Enter question text...')[0]; __type(q, 'Do you write software?'); const root = q.closest('.py-4'); __ph('Enter option', 'Yes', 0, root); __ph('Enter option', 'No', 1, root); return true })()`); await sleep(200)
await C.click('Continue', 600); await C.ev(FORMS)
await C.click('Create Survey Questionnaire', 500); await C.ev(FORMS)
await C.ev(`(() => { __ph('Enter question text...', 'Which editor do you use?'); __ph('Enter option', 'VS Code', 0); __ph('Enter option', 'Vim', 1); return true })()`)
await C.click('Save & Continue', 500)
await C.click('Continue', 700); await C.ev(FORMS); await C.click('Proceed to Publish', 800); await C.ev(FORMS)
const pubB = await C.ev(`(() => ({ radio: [...document.querySelectorAll('[role=radio]')].map((r) => r.textContent.trim().replace(/\\s+/g, ' ') + '=' + r.getAttribute('aria-checked')), cardFields: [...document.querySelectorAll('input')].filter((e) => e.placeholder === '0000 0000 0000 0000').length }))()`)
const disabledB = await disabled(C, 'Publish Study')
await C.click('Publish Study', 1000)
const publishedB = (await C.path()).endsWith('/published')
const cardsBAfter = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idB)}).cards.length`)
{
  const g = []
  if (cardsB !== 'VISA 1111') g.push(`the onboarding card was not saved (${cardsB})`)
  if (!pubB.radio.some((r) => /\*\*\*\* 1111/.test(r) && r.endsWith('=true'))) g.push(`not selected at Publish: ${pubB.radio.join(' | ')}`)
  if (pubB.cardFields !== 0) g.push('the card form is shown to be filled again')
  if (disabledB !== false) g.push('Publish Study disabled')
  if (!publishedB) g.push('did not publish')
  if (cardsBAfter !== 1) g.push(`${cardsBAfter} cards after publishing (re-entered?)`)
  say(3, 'client', 'A card added at onboarding is already selected at publish, not re-entered', g, `onboarding saved ${cardsB}; Publish showed "${pubB.radio.join(' | ')}" with no card form, and published with it`)
}

// ---- 5: edit, then replace, the card from the account
await C.go('/client/account'); await C.ev(FORMS)
const accountCard1 = await body(C)
await C.click('Edit or Replace', 500)
await C.ev(`__ph('MM / YYYY', '01 / 2031')`); await clickExact(C, 'Save'); await sleep(500)
const edited = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idB)}).cards.map((c) => c.last4 + ' ' + c.expires).join()`)
const accountCard2 = await body(C)
await C.click('Edit or Replace', 500)
await C.ev(`(() => { __ph('Leave blank to keep this card', '5555 5555 5555 4444'); __ph('MM / YYYY', '02 / 2032'); return true })()`); await clickExact(C, 'Save'); await sleep(500)
const replaced = await st(C, `s.clients.find((c) => c.id === ${JSON.stringify(idB)}).cards.map((c) => c.brand + ' ' + c.last4 + ' ' + c.expires + (c.isDefault ? ' default' : '')).join()`)
const accountCard3 = await body(C)
{
  const g = []
  if (!/Payment Method/.test(accountCard1) || !/\*\*\*\* 1111/.test(accountCard1)) g.push('the account does not show the card')
  if (edited !== '1111 Expires 01/31' || !/Expires 01\/31/.test(accountCard2)) g.push(`edit: ${edited}`)
  if (replaced !== 'Mastercard 4444 Expires 02/32 default' || !/\*\*\*\* 4444/.test(accountCard3)) g.push(`replace: ${replaced}`)
  say(5, 'client', 'The card can be edited from the client\'s account', g, `Account > Payment Method > Edit or Replace: expiry changed to 01/31, then replaced with ${replaced}`)
}

// ---- 6: duration reads as an estimate
const avail = await st(R, `s.studies.find((x) => x.state === 'recruiting' && !x.participations.some((p) => p.personId === 'jonathan')).id`)
await R.go('/studies'); const explore = await body(R)
await R.go(`/studies/${avail}`); const detail = await body(R)
{
  const g = []
  for (const s of ['Expected time to complete', 'About 40 mins', 'not a time limit', 'Study End Date, the deadline', 'Participants must finish by the end date']) if (!aboutText.includes(s)) g.push(`client About lacks "${s}"`)
  if (!/About \d+ min/.test(explore)) g.push('respondent cards do not read "About N min"')
  if (!/Time to complete/.test(detail) || !/About \d+ min/.test(detail)) g.push('respondent study detail does not read "Time to complete / About N min"')
  if (/\bDuration\b/.test(detail)) g.push('respondent detail still says Duration')
  const limit = [aboutText, explore, detail].find((t) => /within (?:\d+ )?min|time limit of|must finish within|minutes left/i.test(t))
  if (limit) g.push('something reads as a limit')
  say(6, 'client + respondent', 'Duration reads as an estimate in the client create flow and in the respondent app', g,
    `client: "${aboutText.match(/Expected time to complete[^.]*\./)?.[0] ?? ''} ..."; respondent: "${explore.match(/About \d+ min/)?.[0]}" on cards, "Time to complete ${detail.match(/About \d+ min/)?.[0]}" on the detail`)
}

// ---- 7: education multi in the client, single in the respondent profile
await R.go('/profile/edit'); await R.click('Professional Info', 500)
const respEdu = await R.ev(`(() => { const lab = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Education Level'); return lab ? lab.closest('label, div')?.parentElement?.innerText : null })()`)
const respChecks = await R.ev(`[...document.querySelectorAll('[role=checkbox]')].filter((b) => /degree|school|bachelor|master|doctor/i.test(b.textContent)).length`)
await R.ev(`(() => { const lab = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Education Level'); const field = lab.closest('label') ?? lab.parentElement; (field.querySelector('button') ?? field).click(); return true })()`); await sleep(500)
const pickOne = async (name) => { await R.ev(`(() => { const o = [...document.querySelectorAll('button, [role=option]')].filter(__vis).find((b) => b.textContent.trim() === ${JSON.stringify(name)}); if (!o) throw new Error('no option ' + ${JSON.stringify(name)}); o.click(); return true })()`); await sleep(500) }
await pickOne('High School')
await R.ev(`(() => { const lab = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Education Level'); const field = lab.closest('label') ?? lab.parentElement; (field.querySelector('button') ?? field).click(); return true })()`); await sleep(500)
await pickOne('Bachelors Degree')
const respAfter = flat(await R.ev(`(() => { const lab = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Education Level'); return (lab.closest('label') ?? lab.parentElement).parentElement.innerText })()`))
{
  const g = []
  if (!education.includes("Graduate or Bachelor's=true") || !education.includes("Master's degree=true")) g.push(`client boxes: ${education.join(', ')}`)
  if (JSON.stringify(eduDraft) !== JSON.stringify(["Graduate or Bachelor's", "Master's degree"])) g.push(`stored: ${JSON.stringify(eduDraft)}`)
  if (respChecks !== 0) g.push('the respondent profile has education checkboxes')
  if (!/Bachelors Degree/.test(respAfter) || /High School/.test(respAfter)) g.push(`respondent field after two picks: "${respAfter}"`)
  say(7, 'client + respondent', 'More than one education level can be selected in the client audience step, and the respondent profile is unchanged', g,
    `client: ${education.join(', ')}; respondent My Profile > Professional Info: still one Education Level picker, picking High School then Bachelors Degree leaves only "${respAfter.replace('Education Level', '').trim()}"`)
}

// ---- 8: thumbnail
{
  const g = []
  if (thumbs[0] !== '1:cover-first.png') g.push(`after upload: ${thumbs[0]}`)
  if (thumbs[1] !== '0:upload box') g.push(`after Remove: ${thumbs[1]}`)
  if (!hasChange) g.push('no Change button')
  if (thumbs[2] !== '1:cover-second.png' || thumbState !== 'cover-second.png') g.push(`after Change: ${thumbs[2]} / ${thumbState}`)
  say(8, 'client', 'A thumbnail can be removed and replaced in the client create flow', g, 'uploaded cover-first.png, Remove brought the upload box back, uploaded again, Change put cover-second.png in its place')
}

// ---- 9: required and optional
{
  const g = []
  if (!onAudience) g.push('not on the Audience step')
  if (!blocked.path.endsWith('/audience')) g.push(`Continue with Work Function and Industry empty moved on to ${blocked.path}`)
  if (!/Enter a work function, for example Product/.test(blocked.text) || !/Enter an industry, for example Healthcare/.test(blocked.text)) g.push('the empty required fields do not say so')
  for (const s of ['Work Function (required)', 'Industry (required)', 'Role (optional)', 'Skills (optional)', "A product manager's work function is Product.", "A product manager's role is Product Manager."]) if (!blocked.text.includes(s)) g.push(`missing "${s}"`)
  if (!passed.endsWith('/screener')) g.push(`with Role and Skills empty, Continue did not move on (${passed})`)
  say(9, 'client', 'In the client audience step, Work Function and Industry are required, Role and Skills are not', g, 'empty Work Function and Industry: Continue stayed and both fields said so; with Role and Skills empty it went on to the Screener')
}

// ---- 10: Generate with AI
{
  const g = []
  if (!ai1.box?.placeholder?.startsWith('e.g. We want to talk to')) g.push('no prompt box with a placeholder')
  if (!/Describe your study/.test(ai1.box?.lead ?? '')) g.push('no line telling them what to describe')
  const want1 = { functions: 'Patient Care', industries: 'Healthcare', roles: 'Nurse', participants: '12' }
  for (const [k, v] of Object.entries(want1)) if (ai1.d[k] !== v) g.push(`1st ${k}: ${ai1.d[k]}`)
  if (ai1.d.countries.join() !== 'United States of America' || ai1.d.ageRanges.join() !== '21–29,30–39,40–54') g.push(`1st country/age: ${ai1.d.countries} / ${ai1.d.ageRanges}`)
  if (ai1.d.description !== AI_1) g.push('description not filled from the text')
  const want2 = { functions: 'Product', industries: 'Finance', roles: 'Product Manager', participants: '8' }
  for (const [k, v] of Object.entries(want2)) if (ai2.d[k] !== v) g.push(`2nd ${k}: ${ai2.d[k]}`)
  if (ai2.d.countries.join() !== 'United Kingdom') g.push(`2nd country: ${ai2.d.countries}`)
  if (screenerPrefill !== AI_2) g.push('the Screener box did not start from the same description')
  if (!generatedQs.includes('How often do you use payment apps?') || !generatedQs.includes('Which of these best describes your current role?')) g.push(`screener questions: ${generatedQs.join(' / ')}`)
  say(10, 'client', 'Generate with AI takes a typed prompt and fills the form from it', g,
    `"${AI_1}" -> ${Object.entries(ai1.d).filter(([k]) => k !== 'description').map(([k, v]) => `${k} ${Array.isArray(v) ? v.join('/') : v}`).join(', ')}\n       "${AI_2}" -> ${Object.entries(ai2.d).filter(([k]) => k !== 'description').map(([k, v]) => `${k} ${Array.isArray(v) ? v.join('/') : v}`).join(', ')}\n       Screener Generate from the same text added: ${generatedQs.slice(-5).join(' / ')}`)
}

// ---- 11: the question menu (22 Oct 2026, reversing the 15 Oct one-click bin)
{
  const g = []
  if (menus === 0 || bins !== 0) g.push(`${menus} three-dot menus, ${bins} bins left`)
  if (!firstUp) g.push('Move up is offered on the first question')
  if (!confirmShown || afterDel !== beforeDel - 1) g.push(`screener Delete: ${beforeDel} -> ${afterDel}, confirmation ${confirmShown}`)
  if (afterAdd !== beforeAdd + 1 || addedAt !== '') g.push(`Add question below: ${beforeAdd} -> ${afterAdd}, the new one is ${JSON.stringify(addedAt)}`)
  if (movedTo !== 1) g.push(`Move up did not move the blank question above the typed one (typed one at ${movedTo})`)
  if (!surveyConfirm || surveyAfter !== surveyBefore - 1) g.push(`survey Delete: ${surveyBefore} -> ${surveyAfter}, confirmation ${surveyConfirm}`)
  say(11, 'client', 'Each question has the three-dot menu: Move up is off on the first, Add question below, Move up and Delete work in both builders', g,
    `Screener: ${menus} menus, no bins, Q1's Move up off, Q9 Delete asked "Delete Question?" (${beforeDel} -> ${afterDel}). Survey: Add question below ${beforeAdd} -> ${afterAdd}, Move up put the blank question first, Delete ${surveyBefore} -> ${surveyAfter}`)
}

// ---- 12: no AutoPay; finishing a study notifies the client and the team, and the team pays by hand
const target = await st(C, `(() => { const x = s.studies.find((y) => y.clientId === 'cl-soulful' && ['recruiting', 'ongoing'].includes(y.state) && y.participations.some((p) => p.state === 'completed' && !p.paidAt && (!/call|person/.test(y.type) || (p.code?.byClient && p.code?.byParticipant)))); return x && { id: x.id, title: x.title, owed: x.participations.filter((p) => p.state === 'completed' && !p.paidAt).length } })()`)
await C.open('/client/studies?view=table', `localStorage.setItem('fi-client-session', JSON.stringify({ accounts: [], current: 'jennifer@soulfullabs.com' }))`); await C.ev(FORMS)
const paidBefore = await st(C, `s.studies.find((x) => x.id === ${JSON.stringify(target.id)}).participations.filter((p) => p.paidAt).length`)
let completeVia = 'Studies list row menu'
const onPage = await C.ev(`(() => { const row = [...document.querySelectorAll('tr')].find((r) => r.innerText.includes(${JSON.stringify(target.title)})); if (!row) return false; row.querySelector('[aria-label="Study options"]').click(); return true })()`)
if (onPage) { await sleep(300); await C.click('Stop-complete Study', 400); await C.click('Yes, Stop-complete', 800) } else {
  completeVia = 'console Manage Study, Mark as completed'
  await I.open(`/internal/studies/${target.id}`); await I.click('Mark as', 500); await I.click('Mark', 800)
}
await sleep(6500) // longer than the old 5 second payout timer
const paidAfterWait = await st(C, `s.studies.find((x) => x.id === ${JSON.stringify(target.id)}).participations.filter((p) => p.paidAt).length`)
await C.go('/client/notifications'); const clientNote = await body(C)
await I.open('/internal/dashboard'); const dash = await body(I)
await I.open('/internal/finance/payouts'); const payouts = await body(I)
await I.ev(`(() => { const row = [...document.querySelectorAll('[role=row], tr, div')].filter((r) => r.innerText?.includes(${JSON.stringify(target.title)}) && [...r.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Process Payouts')).sort((a, b) => a.innerText.length - b.innerText.length)[0]; if (!row) throw new Error('no Process Payouts row for the study'); [...row.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Process Payouts').click(); return true })()`); await sleep(500)
const modal = await body(I)
await I.ev(`(() => { const b = [...document.querySelectorAll('[role=dialog] button')].find((x) => /^Process [0-9]/.test(x.textContent.trim())); if (!b) throw new Error('no confirm button in the dialog: ' + [...document.querySelectorAll('[role=dialog]')].map((d) => d.outerHTML.slice(0, 1500)).join(' || ') + ' / buttons: ' + [...document.querySelectorAll('button')].filter(__vis).map((x) => x.textContent.trim()).filter((t) => /Process/.test(t)).join(' | ')); b.click(); return true })()`); await sleep(900)
const paidAfterTeam = await st(I, `s.studies.find((x) => x.id === ${JSON.stringify(target.id)}).participations.filter((p) => p.paidAt).length`)
await C.go(`/client/studies/${target.id}/pay`); const payTab = await body(C)
{
  const g = []
  if (/AutoPay/.test(studyText) || /AutoPay/.test(studyText2)) g.push('the Study step shows AutoPay')
  const files = []; const walk = (d) => { for (const f of readdirSync(d, { withFileTypes: true })) { const p = join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.js$/.test(f.name)) files.push(p) } }
  walk(resolve('dist/client'))
  if (files.some((f) => /AutoPay/.test(readFileSync(f, 'utf8')))) g.push('"AutoPay" is in the client bundle')
  if (/Approve Respondent Payouts|Approve \d/.test(payTab)) g.push('the client can still approve payouts')
  if (paidAfterWait !== paidBefore) g.push(`paid automatically: ${paidBefore} -> ${paidAfterWait}`)
  if (!/Your study has finished/.test(clientNote) || !clientNote.includes(target.title) || !/will now be paid/.test(clientNote)) g.push('the client notification did not arrive')
  if (!/Payouts ready to process/.test(dash) || !dash.includes(target.title)) g.push('the console dashboard does not show the team notification')
  if (!payouts.includes(target.title)) g.push('Finance > Payouts does not list the study')
  if (!/Process Payouts\?/.test(modal)) g.push('no confirmation before processing')
  if (paidAfterTeam !== paidBefore + target.owed) g.push(`after the team processed: ${paidBefore} -> ${paidAfterTeam} of ${target.owed} owed`)
  say(12, 'client + console', 'No AutoPay anywhere in the client app. When a study finishes, the client is notified and the console shows the team notification', g,
    `Study step has no AutoPay, nor does the client bundle. "${target.title}" finished via the ${completeVia}; 6.5 s later still ${paidAfterWait} paid (nothing automatic). Client: "${clientNote.match(/Your study has finished[^]{0,160}/)?.[0]}". Console dashboard: "Payouts ready to process"; Finance > Payouts > Process Payouts paid ${paidAfterTeam - paidBefore} by hand`)
}

// ---- 13: tab order. Changed 15 Oct 2026 by decision: My Studies reads Ongoing, Drafts, Completed, and Sessions is its own item under Studies in the sidebar.
await C.go('/client/studies')
const tabs = await C.ev(`[...document.querySelectorAll('main [role=tab], main a, main button')].filter(__vis).map((e) => e.textContent.trim()).filter((t) => ['Drafts', 'Ongoing', 'Completed', 'Sessions'].includes(t))`)
const side = await C.ev(`[...document.querySelectorAll('nav li li a')].map((a) => a.textContent.trim())`)
{
  const g = []
  const shown = [...new Set(tabs)]
  if (shown.join(', ') !== 'Ongoing, Drafts, Completed') g.push(`tabs read ${shown.join(', ')}`)
  if (side.join(', ') !== 'My Studies, Sessions') g.push(`sidebar under Studies reads ${side.join(', ')}`)
  say(13, 'client', 'The Studies tabs read Ongoing, Drafts, Completed, and Sessions sits under Studies in the sidebar (15 Oct 2026 decision)', g, `tabs ${shown.join(', ')}; sidebar ${side.join(', ')}`)
}

console.log(`\n${results.filter(Boolean).length} of 13 yes  (${base})`)
if (errors.length) console.log('\npage errors:\n  ' + [...new Set(errors)].join('\n  '))
ws.close(); proc.kill()
process.exit(0)
