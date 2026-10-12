// The console's sign in, sign up, access and activity log, driven in a real
// browser on the one origin. Prints WORKING / BROKEN per check.
//
//   npm run build:all && node scripts/serve-all.mjs
//   node --experimental-websocket scripts/console-auth.mjs
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


const results = []
const step = async (name, fn) => {
  try { const note = await fn(); results.push(true); console.log(`WORKING ${name}${note ? '  — ' + note : ''}`) }
  catch (err) { results.push(false); console.log(`BROKEN  ${name}\n          ${err.message}\n          at ${await T.path().catch(() => '?')}: ${await T.ev(`(document.querySelector('main') || document.body).innerText.replace(/\\s+/g, ' ').slice(0, 240)`).catch(() => '')}`) }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg) }

const T = await tab('console', 1440, 1000, false)
const B = '/internal'
const fill = (pairs) => T.ev(`(() => { ${HELPERS}; for (const [ph, v] of ${JSON.stringify(pairs)}) { const el = document.querySelector('input[placeholder="' + ph + '"]'); if (!el) throw new Error('no input: ' + ph); __type(el, v) } return true })()`)
const login = async (email, password) => { await fill([['Enter email address', email], ['Enter your password', password]]); await T.click('Login', 900) }
const logout = async () => {
  await T.go(B + '/account'); await T.click('Logout', 400)
  await T.ev(`(() => { const b = [...document.querySelectorAll('button')].filter((x) => x.textContent.trim() === 'Logout'); b[b.length - 1].click(); return true })()`); await sleep(600)
}
const st = () => T.ev(`JSON.parse(localStorage.getItem('fi-platform'))`)
const nav = () => T.ev(`[...document.querySelectorAll('nav[aria-label=Main] ul > li > a')].filter((a) => a.closest('ul').parentElement.tagName === 'DIV').map((a) => a.textContent.replace(/\\d+$/, '').trim())`)
const lastLog = async () => { const s = await st(); const a = s.activity[0]; return a ? `${a.what} | ${s.team.find((t) => t.id === a.by)?.name}` : '' }
const PETER = 'peter@focusinsite.com', MAYA = 'maya.thompson@humanlayer.com', PW = 'demo1234'

await T.open(B + '/finance', 'localStorage.clear()')

await step('A signed-out person opening a console route is sent to sign in', async () => {
  expect(await T.path() === B + '/signin', 'landed on ' + await T.path())
})
await step('The sign-in screen shows both demo logins and says they are demo accounts', async () => {
  expect(await T.has(PETER) && await T.has(MAYA) && await T.has(PW) && await T.has('demo accounts'), 'demo lines missing')
})
await step('A wrong email is refused with an error under the field', async () => {
  await login('nobody@nowhere.com', PW)
  expect(await T.has('No team account uses that email address') && await T.path() === B + '/signin', 'no refusal')
})
await step('A wrong password is refused with an error under the field', async () => {
  await login(PETER, 'wrong-password')
  expect(await T.has('That password is not right') && await T.path() === B + '/signin', 'no refusal')
})
await step('An inactive account is refused', async () => {
  await login('robert.mayfield@humanlayer.com', PW)
  expect(await T.has('This account is inactive'), 'no refusal')
})
await step('Signing in returns them to where they were going', async () => {
  await login(PETER, PW)
  expect(await T.path() === B + '/finance', 'landed on ' + await T.path())
})
await step('Signing in from the sign-in page itself lands on the Dashboard', async () => {
  await logout(); expect(await T.path() === B + '/signin', 'logout landed on ' + await T.path())
  await login(PETER, PW)
  expect(await T.path() === B + '/dashboard', 'landed on ' + await T.path())
})
await step('The session survives a reload', async () => {
  await T.open(B + '/studies')
  expect(await T.path() === B + '/studies' && await T.has('Peter Devian'), 'after reload: ' + await T.path())
})
await step('The master admin sees all eight modules', async () => {
  const n = await nav(); expect(n.length === 8, n.join(', ')); return n.join(', ')
})
await step('An action is logged under the signed-in master admin', async () => {
  await T.go(B + '/studies/st-social/respondents/ferry-l'); await T.click('Qualify', 600)
  const l = await lastLog(); expect(l.includes('Qualified') && l.endsWith('Peter Devian'), l); return l
})
await step('Sign out ends the session and returns to sign in; routes are closed again', async () => {
  await logout(); expect(await T.path() === B + '/signin', 'landed on ' + await T.path())
  await T.go(B + '/dashboard'); expect(await T.path() === B + '/signin', 'dashboard opened signed out')
  await T.open(B + '/participants'); expect(await T.path() === B + '/signin', 'participants opened after a reload')
})
await step('A sub-admin sees only their permitted modules, and lands on the first of them', async () => {
  await login(MAYA, PW)
  const n = await nav()
  expect(JSON.stringify(n) === JSON.stringify(['Studies', 'Participants']), 'sidebar: ' + n.join(', '))
  expect(await T.has('Maya Thompson') && await T.has('Studies Manager'), 'the account card is not hers')
  return `sidebar: ${n.join(', ')}; landed on ${await T.path()}`
})
await step('A module she has not been given is refused by its address too', async () => {
  await T.go(B + '/finance'); expect(await T.has('You do not have access to Finance'), 'finance opened')
  await T.go(B + '/sub-admin'); expect(await T.has('You do not have access to Sub-Admin'), 'sub-admin opened')
  await T.go(B + '/dashboard'); expect(await T.has('You do not have access to Dashboard'), 'dashboard opened')
})
await step('Her actions are logged under her name', async () => {
  await T.go(B + '/studies/st-social/respondents/james-k'); await T.click('Qualify', 600)
  const l = await lastLog(); expect(l.includes('Qualified') && l.endsWith('Maya Thompson'), l); return l
})
await step('The access toggles decide it: the master admin gives her Finance, and she then has it', async () => {
  await logout(); await login(PETER, PW)
  await T.go(B + '/sub-admin/tm-maya/edit')
  await T.ev(`(() => { const l = [...document.querySelectorAll('label')].find((x) => x.textContent.trim() === 'Finance'); l.querySelector('[role=switch]').click(); return true })()`); await sleep(200)
  await T.click('Save', 700)
  await logout(); await login(MAYA, PW)
  const n = await nav(); expect(n.includes('Finance'), 'sidebar: ' + n.join(', '))
  await T.go(B + '/finance'); expect(!(await T.has('You do not have access')), 'finance still refused')
  return 'sidebar: ' + n.join(', ')
})

await step('Sign up refuses a weak password, a mismatch and a taken email', async () => {
  await logout(); await T.go(B + '/signup')
  await fill([['Enter your name', 'Nia Okafor'], ['Enter work email address', PETER], ['Enter a password', 'weak'], ['Re-enter the password', 'other']])
  await T.click('Sign Up', 500)
  expect(await T.has('A team account already uses that email address') && await T.has('The two passwords do not match') && await T.path() === B + '/signup', 'not refused')
})
await step('Sign up, then the six-digit code: a wrong code is refused, 123456 is accepted', async () => {
  await fill([['Enter work email address', 'nia@newteam.io'], ['Enter a password', 'Fresh#Start1'], ['Re-enter the password', 'Fresh#Start1']])
  await T.click('Sign Up', 600)
  expect(await T.path() === B + '/signup/verify', 'landed on ' + await T.path())
  expect(await T.has('no email is sent'), 'the no-email line is missing')
  await fill([['000000', '000000']]); await T.click('Verify and Continue', 500)
  expect(await T.has('That code is not right'), 'wrong code accepted')
  await fill([['000000', '123456']]); await T.click('Verify and Continue', 900)
  expect(await T.path() === B + '/dashboard', 'landed on ' + await T.path())
})
await step('The new master admin console is completely empty', async () => {
  const s = await st()
  const n = { studies: s.studies.length, people: s.people.length, clients: s.clients.length, tickets: s.tickets.length, reports: s.reports.length, activity: s.activity.length, team: s.team.length }
  expect(n.studies + n.people + n.clients + n.tickets + n.reports + n.activity === 0 && n.team === 1 && s.team[0].master, JSON.stringify(n))
  expect(await T.has('Nia Okafor') && (await nav()).length === 8, 'card or sidebar wrong')
  return JSON.stringify(n)
})
const EMPTY = [
  ['/dashboard', 'Nothing is waiting here.'],
  ['/studies', 'Studies that clients submit for review will appear here.'], ['/studies?tab=ongoing', 'Studies you approve will appear here while they run.'], ['/studies?tab=completed', 'Studies will appear here once they are completed.'],
  ['/participants', 'Participants will appear here once they sign up.'], ['/participants?tab=deactivated', 'Participants whose accounts are deactivated will appear here.'],
  ['/participants/verifications', 'Identity and profession checks that need a person will appear here.'], ['/participants/verifications', 'Verifications you have decided will appear here.'],
  ['/participants/verifications?tab=reported', 'Participants reported by a client or by the system will appear here.'], ['/participants/verifications?tab=reported', 'Reports you have decided will appear here.'],
  ['/clients', 'Clients will appear here once they sign up.'], ['/clients?tab=deactivated', 'Clients whose accounts are deactivated will appear here.'],
  ['/clients/verifications', 'Business checks that need a person will appear here.'], ['/clients/verifications?tab=history', 'Business verifications you have decided will appear here.'],
  ['/support', 'New tickets from participants and clients will appear here.'], ['/support?tab=ongoing', 'Tickets you have replied to will appear here.'], ['/support?tab=closed', 'Resolved tickets will appear here.'],
  ['/finance', 'Payments, earnings, payouts and refunds will appear here as they happen.'], ['/finance/refunds', 'Refunds for underfilled studies will appear here to be confirmed.'],
  ['/sub-admin', 'Sub-admins you add will appear here.'], ['/sub-admin', 'Actions taken in the console will appear here.'],
]
await step(`Every list in the empty console says what will appear there, and every figure is zero (${EMPTY.length} checked)`, async () => {
  const wrong = []
  for (const [route, text] of EMPTY) {
    await T.go(B + route)
    if (!(await T.has(text))) wrong.push(`${route}: missing "${text}"`)
    const nums = await T.ev(`[...document.querySelectorAll('main *')].filter((e) => !e.children.length && e.tagName !== 'BUTTON' && e.offsetParent !== null).map((e) => e.textContent.trim()).filter((t) => /^\\$?[\\d,]{1,9}%?$/.test(t) && !/^\\$?0%?$/.test(t))`)
    if (nums.length) wrong.push(`${route}: figures not zero: ${nums.slice(0, 6).join(' ')}`)
  }
  expect(wrong.length === 0, wrong.join('\n          '))
})
await step('The new admin\'s own actions are logged under their name', async () => {
  await T.go(B + '/sub-admin/new')
  await fill([['Full name of sub-admin', 'Sam Rivera'], ['Enter email address', 'sam@newteam.io'], ['Enter the designation of sub-admin', 'Support Lead']])
  await T.click('Create', 700)
  const l = await lastLog(); expect(l.includes('Sam Rivera') && l.endsWith('Nia Okafor'), l)
  await T.go(B + '/sub-admin'); expect(await T.has('Nia Okafor') && await T.has('Sam Rivera'), 'not on the Sub-Admin page')
  return l
})
await step('The new account signs out and back in, and its console is still its own', async () => {
  await logout(); await login('nia@newteam.io', 'Fresh#Start1')
  const s = await st(); expect(await T.path() === B + '/dashboard' && s.studies.length === 0 && s.team.length === 2, `at ${await T.path()}, studies ${s.studies.length}, team ${s.team.length}`)
})
await step('Signing in with the demo master admin puts the demo data back', async () => {
  await logout()
  await T.ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Master admin:')); b.click(); return true })()`); await sleep(900)
  const s = await st(); expect(await T.path() === B + '/dashboard' && s.studies.length > 40 && await T.has('Peter Devian'), `at ${await T.path()}, studies ${s.studies.length}`)
  return `${s.studies.length} studies, ${s.people.length} people, ${s.team.length} team members`
})

console.log(`\n${results.filter(Boolean).length} of ${results.length} working`)
ws.close(); proc.kill()
process.exit(0)
