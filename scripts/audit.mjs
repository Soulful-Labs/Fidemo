// Wiring audit: walks every route as the returning and a brand new user,
// clicks every clickable element on every screen and reports what happened,
// and checks that the card, the detail screen and the My Studies tab agree
// for every study status. Prints markdown tables; exits 0 always (it reports,
// the person decides).
//
//   node --experimental-websocket scripts/audit.mjs [routes|clicks|statuses]

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const only = process.argv[2]
const chrome = [
  process.env.CHROME,
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean).find((p) => existsSync(p))

const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--window-size=375,812', 'about:blank'])
const wsUrl = await new Promise((resolve, reject) => {
  let buf = ''
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]) })
  setTimeout(() => reject(new Error('chrome did not start')), 15000)
})
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let seq = 0
const pending = new Map()
const pageErrors = []
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result) }
  else if (msg.method === 'Runtime.exceptionThrown') pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
}
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, sessionId })) })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const s = (m, p) => send(m, p, sessionId)
await s('Page.enable'); await s('Runtime.enable')
await s('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true })

const evaluate = async (expression) => {
  const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
  return r.result.value
}
// A redirect after load can drop the injected helpers; put them back before use.
const ensure = async () => { if (await evaluate("typeof window.__snapshot === 'undefined'")) await evaluate(helpers) }
const helpers = `
  window.__clickables = () => [...document.querySelectorAll('main button, main a[href], main [role=button], main [role=tab], main [role=radio], main [role=checkbox], main [role=switch], main [role=option], nav button, nav a[href], header button, header a[href]')]
    .filter((el) => el.offsetParent !== null && !el.closest('[role=dialog]'))
    .map((el, i) => ({ i, tag: el.tagName, text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40) }));
  window.__snapshot = () => ({
    path: location.pathname,
    dialogs: document.querySelectorAll('[role=dialog]').length,
    toast: [...document.querySelectorAll('[role=status]')].map((t) => t.textContent.trim()).join(' | '),
    html: document.querySelector('main')?.innerHTML.length ?? 0,
    expanded: [...document.querySelectorAll('[aria-expanded], [aria-checked], [aria-pressed], [aria-selected]')].map((el) => el.getAttribute('aria-expanded') + el.getAttribute('aria-checked') + el.getAttribute('aria-pressed') + el.getAttribute('aria-selected')).join(''),
    tab: (document.querySelector('[role=tab][aria-selected=true]') || {}).textContent || '',
    sig: JSON.stringify([window.__hl?.signedIn, window.__hl?.studies?.map((x) => x.status + (x.saved ? 's' : '')).join(''), window.__hl?.notifications?.filter((n) => !n.read).length, window.__hl?.user?.emailPrefs, window.__hl?.user?.consent, window.__hl?.filters, window.__hl?.answers, window.__hl?.tickets?.length, window.__hl?.payoutMethods, window.__hl?.pointsHistory?.length]),
  });
  window.__text = () => (document.querySelector('main')?.innerText ?? '').replace(/\\s+/g, ' ').trim();
`
const goto = async (path, waitFor = 400) => {
  await s('Page.navigate', { url: base + path })
  for (let i = 0; i < 50; i++) { await sleep(150); if (await evaluate(`Boolean(window.__hl && document.querySelector('main')?.children.length)`).catch(() => false)) break }
  await sleep(waitFor); await evaluate(helpers)
}
const nav = async (path, wait = 500) => { await evaluate(`__hlNavigate(${JSON.stringify(path)})`); await sleep(wait) }
const store = (expr) => evaluate(`(() => { const st = window.__hl; return ${expr} })()`)

// ---------------------------------------------------------------------------
// The route map, with params filled from the seed.
await goto('/dashboard?reset=1')
const tx = await store('st.transactions[0].id'), payout = await store('st.payouts[0].id'), ticket = await store('st.tickets[0].id')
const byStatus = await store('Object.fromEntries(st.studies.map((x) => [x.status, x.id]))')
const study = byStatus.available
const ROUTES = [
  '/', '/signup', '/signin', '/verify-otp', '/forgot-password', '/check-email', '/reset-password', '/password-updated',
  '/onboarding/about', '/onboarding/professional', '/onboarding/identity', '/onboarding/welcome',
  '/dashboard', '/notifications',
  '/studies', '/studies/saved', '/studies/mine', '/studies/mine/invites', '/studies/mine/scheduled', '/studies/mine/drafts', '/studies/mine/applied', '/studies/mine/history',
  `/studies/${study}`, `/studies/${study}/screener`, `/studies/${study}/applied`,
  `/studies/${byStatus.invited_to_schedule}/schedule`, `/studies/${byStatus.invited_to_schedule}/schedule/agreement`, `/studies/${byStatus.invited_to_schedule}/schedule/review`, `/studies/${byStatus.invited_to_schedule}/schedule/done`,
  `/studies/${byStatus.scheduled}/reschedule`, `/studies/${byStatus.scheduled}/pin`, `/studies/${byStatus.scheduled}/pin/done`,
  `/studies/${byStatus.invited_to_complete}/survey`, `/studies/${byStatus.invited_to_complete}/survey/done`,
  `/studies/${byStatus.in_process}/diary`, `/studies/${byStatus.in_process}/diary/1`, `/studies/${byStatus.paid}/rate`,
  '/clients/rjp/ratings',
  '/wallet', '/wallet/withdraw', '/wallet/withdraw/method', '/wallet/withdraw/done', '/wallet/earnings', `/wallet/earnings/${tx}`, '/wallet/payouts', `/wallet/payouts/${payout}`,
  '/wallet/payout-methods', '/wallet/payout-methods/add', '/points', '/points/redeem', '/points/redeem/confirm', '/points/redeem/done', '/points/how-it-works',
  '/profile', '/profile/edit', '/profile/certificate', '/profile/referrals', '/profile/settings', '/profile/settings/password', '/profile/settings/notifications', '/profile/settings/consent', '/profile/settings/deactivate',
  '/trust-score', '/trust-score/rules', '/trust-score/tiers', '/support', '/support/tickets', `/support/tickets/${ticket}`, '/support/contact',
  '/nowhere',
]

const EMPTY = /No (invitations|scheduled|drafts|applications|history|notifications|payouts|referrals|support tickets|saved studies|studies|earnings)|not found|nothing here|Not issued yet/i

async function walkRoutes(user) {
  console.log(`\n## Routes as the ${user} user\n\n| Route | Lands on | Chars | Flags |\n|---|---|---|---|`)
  for (const route of ROUTES) {
    pageErrors.length = 0
    await goto(route)
    await ensure()
    const snap = await evaluate('__snapshot()')
    const text = await evaluate('__text()')
    const flags = []
    if (snap.html < 200) flags.push('EMPTY RENDER')
    if (/Not built yet/.test(text)) flags.push('PLACEHOLDER')
    if (/Page not found/.test(text) && route !== '/nowhere') flags.push('NOT FOUND')
    if (EMPTY.test(text)) flags.push('empty state: ' + text.match(EMPTY)[0])
    if (/\$0\b|\b0 \/|: 0\b/.test(text) && user === 'returning') flags.push('zero: ' + text.match(/.{0,18}(\$0\b|\b0 \/|: 0\b).{0,10}/)[0])
    if (pageErrors.length) flags.push('ERROR ' + pageErrors[0].slice(0, 80))
    console.log(`| ${route} | ${snap.path} | ${snap.html} | ${flags.join('; ')} |`)
  }
}

async function walkClicks() {
  console.log(`\n## Clicks as the returning user\n\n| Route | Control | Result |\n|---|---|---|`)
  const skip = new Set(['/', '/nowhere', '/studies/mine'])
  // Detail screens in every state carry different actions; click them all.
  for (const st of ['invited_to_apply', 'draft', 'applied', 'invited_to_schedule', 'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed']) {
    if (byStatus[st] && !ROUTES.includes(`/studies/${byStatus[st]}`)) ROUTES.push(`/studies/${byStatus[st]}`)
  }
  // Git Bash rewrites a leading slash into a Windows path, so the start route is given without it.
  const from = process.argv[3] ? '/' + process.argv[3].replace(/^\/+/, '') : undefined
  const list = ROUTES.filter((r) => !skip.has(r))
  const start = from ? Math.max(0, list.indexOf(from)) : 0
  for (const route of list.slice(start)) {
    await goto(route + (route.includes('?') ? '&' : '?') + 'reset=1')
    await ensure()
    const items = await evaluate('__clickables()')
    if (process.env.DEBUG) console.error(route, items.length, await evaluate('location.pathname + " " + (document.querySelector("main")?.children.length ?? "no main")'))
    for (const item of items) {
      await goto(route + '?reset=1', 250)
      await ensure()
      const before = await evaluate('__snapshot()')
      pageErrors.length = 0
      await evaluate(`(() => { const el = __clickables()[${item.i}] && document.querySelectorAll('main button, main a[href], main [role=button], main [role=tab], main [role=radio], main [role=checkbox], main [role=switch], main [role=option], nav button, nav a[href], header button, header a[href]'); return true })()`)
      const ok = await evaluate(`(() => { const list = [...document.querySelectorAll('main button, main a[href], main [role=button], main [role=tab], main [role=radio], main [role=checkbox], main [role=switch], main [role=option], nav button, nav a[href], header button, header a[href]')].filter((el) => el.offsetParent !== null && !el.closest('[role=dialog]')); const el = list[${item.i}]; if (!el) return 'missing'; el.scrollIntoView({ block: 'center' }); el.click(); return 'ok' })()`)
      await sleep(450)
      await ensure()
      const after = await evaluate('__snapshot()')
      let result
      if (ok !== 'ok') result = 'missing after reload'
      else if (after.path !== before.path) result = `→ ${after.path}`
      else if (after.dialogs > before.dialogs) result = 'opens a dialog'
      else if (after.toast && after.toast !== before.toast) result = `toast: ${after.toast.slice(0, 50)}`
      else if (after.sig !== before.sig) result = 'changes state'
      else if (after.expanded !== before.expanded || after.tab !== before.tab) result = 'toggles'
      else if (after.html !== before.html) result = 'changes the screen'
      else result = 'DEAD'
      if (pageErrors.length) result += ` ERROR ${pageErrors[0].slice(0, 60)}`
      console.log(`| ${route} | ${item.tag.toLowerCase()} "${item.text}" | ${result} |`)
    }
  }
}

async function walkStatuses() {
  console.log(`
## Status surfaces (study ${study})

| Status | Tab | Card tag | Card actions | Banner | Detail actions |
|---|---|---|---|---|---|`)
  const statuses = ['available', 'invited_to_apply', 'applying', 'draft', 'applied', 'invited_to_schedule', 'invited_to_complete', 'scheduled', 'pin_confirmed', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed']
  const LABELS = 'Open|Invited To Schedule|Invited To Complete|Invited|Applying|In Draft|In Review|Scheduled|Code Confirmed|In Process|Paid|Rejected|No Show|Late Show Up|Not needed'
  for (const status of statuses) {
    await goto('/dashboard?reset=1')
    const title = await store(`st.studies.find((x) => x.id === ${JSON.stringify(study)}).title`)
    await evaluate(`__hl.dispatch({ type: 'SET_STATUS', id: ${JSON.stringify(study)}, status: ${JSON.stringify(status)} })`)
    if (['scheduled', 'pin_confirmed', 'no_show', 'late_show'].includes(status)) await evaluate(`__hl.dispatch({ type: 'SET_BOOKING', id: ${JSON.stringify(study)}, booking: { date: new Date(Date.now() + 3 * 864e5).toISOString(), slot: '10:00 AM', rescheduleCount: 0 } })`)
    await sleep(200)
    let card = null, where = '-'
    for (const path of ['/studies', '/studies/saved', '/studies/mine/invites', '/studies/mine/scheduled', '/studies/mine/drafts', '/studies/mine/applied', '/studies/mine/history']) {
      await nav(path, 500)
      const found = await evaluate(`(() => { const a = [...document.querySelectorAll('article')].find((x) => x.textContent.includes(${JSON.stringify(title)})); if (!a) return null;
        const tag = [...a.querySelectorAll('span')].map((t) => t.textContent.trim()).find((t) => new RegExp('^(${LABELS})$').test(t));
        const buttons = [...a.querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || b.textContent).trim()).filter((t) => t && !/Save study|Remove from saved|Match score/.test(t));
        return { tag: tag || '-', actions: buttons.join(' / ') } })()`)
      if (found) { card = found; where = path.replace('/studies/mine/', '').replace('/studies', 'explore'); break }
    }
    await nav(`/studies/${study}`, 600)
    const detail = await evaluate(`(() => { const banner = document.querySelector('main .rounded-lg span.text-body-medium'); const bar = document.querySelector('main .sticky.bottom-0'); const buttons = bar ? [...bar.querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || b.textContent).trim()) : []; return { banner: banner ? banner.textContent.trim() : '-', actions: buttons.join(' / ') } })()`)
    console.log(`| ${status} | ${where} | ${card?.tag ?? 'NOT LISTED'} | ${card?.actions ?? '-'} | ${detail.banner} | ${detail.actions} |`)
  }
}

if (!only || only === 'routes') {
  await goto('/dashboard?reset=1')
  await walkRoutes('returning')
  await goto('/signup?reset=1')
  await evaluate(`__hl.signUp('brand.new@example.com')`); await sleep(300)
  await walkRoutes('new')
}
if (!only || only === 'clicks') await walkClicks()
if (!only || only === 'statuses') await walkStatuses()

ws.close(); proc.kill()
