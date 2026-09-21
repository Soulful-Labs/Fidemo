// Runs the 14 step demo script from CLAUDE.md against the dev server in
// headless Chromium, driving the real controls by their labels and checking
// the store after each step. Prints PASS/FAIL per step.
//
//   node --experimental-websocket scripts/demo.mjs

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
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
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result) }
  else if (msg.method === 'Runtime.exceptionThrown') console.error('page error:', msg.params.exceptionDetails.exception?.description)
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
const helpers = `
  window.__q = (text, root = document) => [...root.querySelectorAll('button, a, [role=radio], [role=checkbox], [role=tab], [role=option]')]
    .find((el) => el.textContent.trim().replace(/\\s+/g, ' ').startsWith(text) && el.offsetParent !== null);
  window.__click = (text) => { const el = window.__q(text); if (!el) throw new Error('no control: ' + text); el.click(); return true };
  window.__type = (selector, value) => {
    const el = document.querySelector(selector); if (!el) throw new Error('no input: ' + selector);
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); return true };
  window.__clickIn = (sel, text) => { const el = window.__q(text, document.querySelector(sel)); if (!el) throw new Error('no control in ' + sel + ': ' + text); el.click(); return true };
  window.__path = () => location.pathname;
`
const goto = async (path) => {
  await s('Page.navigate', { url: base + path })
  for (let i = 0; i < 50; i++) { await sleep(200); if (await evaluate(`Boolean(window.__hl && document.querySelector('main')?.children.length)`).catch(() => false)) break }
  await sleep(300); await evaluate(helpers)
}
const nav = async (path) => { await evaluate(`__hlNavigate(${JSON.stringify(path)})`); await sleep(600) }
const clickIn = async (sel, text, wait = 500) => { await evaluate(`__clickIn(${JSON.stringify(sel)}, ${JSON.stringify(text)})`); await sleep(wait) }
const click = async (text, wait = 500) => { await evaluate(`__click(${JSON.stringify(text)})`); await sleep(wait) }
const type = async (sel, value) => { await evaluate(`__type(${JSON.stringify(sel)}, ${JSON.stringify(value)})`); await sleep(100) }
const path = () => evaluate('__path()')
const store = (expr) => evaluate(`(() => { const st = window.__hl; return ${expr} })()`)

let fails = 0
const step = async (n, name, fn) => {
  try { await fn(); console.log(`PASS ${n}. ${name}`) }
  catch (err) { fails++; console.log(`FAIL ${n}. ${name}\n      ${err.message}  (at ${await path().catch(() => '?')})`) }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg) }

// Arriving through a coded sign-up link (workflow 12): the code is stored on the new account.
await goto('/signup?reset=1&ref=DEMO7')

await step(1, 'Sign up, verify OTP, fill all three profile steps, accept consent, land on Welcome', async () => {
  await type('input[type=email]', 'demo@example.com')
  await type('input[type=password]', 'Passw0rd!')
  await evaluate(`document.querySelector('[role=checkbox]').click()`); await sleep(200)
  await click('Sign Up')
  expect(await path() === '/verify-otp', 'expected /verify-otp')
  for (let i = 1; i <= 6; i++) await type(`input[aria-label="Digit ${i}"]`, String(i))
  await click('Submit')
  // Workflow 15: a new account lands on the dashboard and can browse; Get Started opens verification.
  expect(await path() === '/dashboard', 'expected /dashboard after OTP')
  expect(await store('st.user.sourceCode') === 'DEMO7', 'sign-up link code not stored on the user')
  expect(await store('st.user.email') === 'demo@example.com', 'email not carried from sign-up')
  await click('Get Started')
  expect(await path() === '/onboarding/about', 'expected /onboarding/about')
  await type('input[placeholder="Enter Name"]', 'Demo Person')
  await type('input[inputmode=numeric]', '06 / 05 / 1990')
  await click('Female')
  await type('input[placeholder="City, Country"]', 'NYC, USA')
  await click('Continue')
  expect(await path() === '/onboarding/professional', 'expected /onboarding/professional')
  await type('input[placeholder="E.g. Product Designer"]', 'Nurse')
  await click('Industry name'); await clickIn('[role=dialog]', 'Healthcare'); await clickIn('[role=dialog]', 'Save')
  await click('Select education'); await clickIn('[role=dialog]', 'Bachelors Degree'); await clickIn('[role=dialog]', 'Save')
  await click('Continue')
  expect(await path() === '/onboarding/identity', 'expected /onboarding/identity')
  await click('Passport'); await clickIn('[role=dialog]', 'Passport'); await clickIn('[role=dialog]', 'Save')
  await evaluate(`__hl.setOnboarding({ idFront: 'front.jpg', idBack: 'back.jpg' })`); await sleep(300)
  await click('Continue')
  await click('Save & Continue')
  expect(await path() === '/onboarding/welcome', 'expected /onboarding/welcome')
})

await step(2, 'Explore Studies, filter to Video Call, open a study, read the client rating', async () => {
  await click('Explore Studies')
  expect(await path() === '/studies', 'expected /studies')
  await evaluate(`document.querySelector('button[aria-label^=Filters]').click()`); await sleep(400)
  await click('Video Call'); await click('Apply')
  const cards = await evaluate(`document.querySelectorAll('article').length`)
  expect(cards > 0, 'no cards after filtering')
  await click('GLP-1 Care Plans')
  expect((await path()).startsWith('/studies/st-'), 'expected a study detail')
  await evaluate(`document.querySelector('a[href*=ratings]').click()`); await sleep(400)
  expect((await path()).includes('/ratings'), 'expected client ratings')
})

await step(3, 'Apply, answer the screener, exit part way, find it in Drafts, resume, submit', async () => {
  await nav('/studies/st-01')
  await click('Apply')
  expect(await path() === '/studies/st-01/screener', 'expected the screener')
  // Workflow 28: three eligibility questions first, nothing saved until they pass.
  await click('Yes, regularly'); await click('Continue')
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'available', 'pre-screener must not create an application')
  await click('Yes'); await click('Continue')
  await click('Yes'); await click('Check eligibility')
  expect(await evaluate(`document.body.textContent.includes('come from your profile')`), 'profile-derived line missing')
  await click('GLP-1 agonists'); await click('Continue')
  await evaluate(`document.querySelector('button[aria-label=Close]').click()`); await sleep(300)
  await click('Save and Exit')
  expect(await path() === '/studies/mine/drafts', 'expected drafts')
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'draft', 'status should be draft')
  await click('Resume Application')
  expect(await path() === '/studies/st-01/screener', 'expected the screener again')
  await click('Continue')
  await click('6 to 15'); await click('Continue')
  await click('Easy'); await click('Continue')
  await type('textarea', 'Guidance is thin on dose titration for oncology patients.')
  await click('Submit', 1200)
  expect(await path() === '/studies/st-01/applied', 'expected applied successfully')
})

await step(4, 'See it move to Applied, then to Invites as Invited to Schedule', async () => {
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'applied', 'should be applied')
  await nav('/studies/mine/applied')
  expect(await evaluate(`document.body.textContent.includes('GLP-1 Care Plans')`), 'not listed in Applied')
  await sleep(3200)
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'invited_to_schedule', 'should be invited_to_schedule after the delay')
  await nav('/studies/mine/invites')
  expect(await evaluate(`document.body.textContent.includes('GLP-1 Care Plans')`), 'not listed in Invites')
})

await step(5, 'Schedule it: pick a date, a slot, agree to recording, review, confirm', async () => {
  await click('Schedule Session', 1200)
  expect(await path() === '/studies/st-01/schedule', 'expected the schedule screen')
  const enabled = await evaluate(`document.querySelectorAll('.grid-cols-7 button:not([disabled])').length`)
  expect(enabled > 0, `no enabled dates; availability = ${JSON.stringify(await store(`st.studies.find((x) => x.id === 'st-01').availability`))}`)
  await evaluate(`document.querySelector('.grid-cols-7 button:not([disabled])').click()`); await sleep(200)
  // Some slots are already taken (availability differs per study), so take the first open one.
  await evaluate(`document.querySelector('.grid-cols-2 button:not([disabled])').click()`); await sleep(200)
  await click('Proceed')
  await evaluate(`document.querySelector('[role=dialog] [role=checkbox]').click()`); await sleep(200); await click('Agree & Join')
  await click('Confirm & Schedule', 800)
  expect(await path() === '/studies/st-01/schedule/done', 'expected scheduled done')
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'scheduled', 'should be scheduled')
  await click('Done')
})

await step(6, 'Open it, enter session code 407060, see it confirmed', async () => {
  expect(await path() === '/studies/st-01', 'expected the study')
  await click('Enter Session Code')
  for (const [i, d] of [...'407060'].entries()) await type(`input[aria-label="Digit ${i + 1}"]`, d)
  await click('Submit', 1200)
  expect(await path() === '/studies/st-01/pin/done', 'expected pin done')
  await click('Done')
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'pin_confirmed', 'should be pin_confirmed')
})

const before = { wallet: await store('st.user.walletBalance'), points: await store('st.user.points'), trust: await store('st.user.trustScore') }

await step(7, 'Complete it, watch it move to History and become Paid', async () => {
  await click('Complete Study', 800)
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'in_process', 'should be in_process')
  await nav('/studies/mine/history')
  expect(await evaluate(`document.body.textContent.includes('GLP-1 Care Plans')`), 'not listed in History')
  await sleep(5200)
  expect(await store(`st.studies.find((x) => x.id === 'st-01').status`) === 'paid', 'should be paid after the delay')
  expect(await store(`st.studies.find((x) => x.id === 'st-01').timeline.some((t) => t.label === 'Client approved payout')`), 'client approval missing from the timeline')
  expect(await evaluate(`document.body.textContent.includes('Reward points earned')`), 'points earned modal did not open')
  await click('Got It!')
})

await step(8, 'See the wallet balance, points and Trust Score all go up', async () => {
  const after = { wallet: await store('st.user.walletBalance'), points: await store('st.user.points'), trust: await store('st.user.trustScore') }
  expect(after.wallet === before.wallet + 150, `wallet ${before.wallet} -> ${after.wallet}`)
  expect(after.points === before.points + 25, `points ${before.points} -> ${after.points}`)
  expect(after.trust === before.trust + 1 + 4, `trust ${before.trust} -> ${after.trust} (expected +1 completion, +4 for a 5 star client rating)`)
})

await step(9, 'Rate the client, see the review recorded', async () => {
  await nav('/studies/st-01')
  await click('Rate Client')
  expect(await path() === '/studies/st-01/rate', 'expected the rate screen')
  await evaluate(`[...document.querySelectorAll('[role=radiogroup]')].forEach((g) => g.querySelectorAll('[role=radio]')[4].click())`); await sleep(200)
  await click('Submit', 1000)
  expect(await store(`Boolean(st.studies.find((x) => x.id === 'st-01').userReview)`), 'review not recorded')
  expect(await evaluate(`document.body.textContent.includes('Your review for client')`), 'review not shown')
})

await step(10, 'Redeem 1000 points, see the wallet rise and points fall', async () => {
  // A new account cannot have 1,000 points yet (100 for being referred, 25 per study), so the
  // rule shows: Confirm is disabled with the reason. The returning account then redeems.
  expect(await store('st.user.points') === 125, `new account should hold 125 points, has ${await store('st.user.points')}`)
  await nav('/points/redeem')
  await type('input[inputmode=numeric]', '1000')
  expect(await evaluate(`document.body.textContent.includes('You do not have enough points')`), 'minimum / balance reason not shown')
  await nav('/profile'); await click('Sign Out'); await click('Logout')
  await type('input[type=email]', 'jonathan.reeve@example.com')
  await type('input[type=password]', 'Passw0rd!')
  await click('Login', 1200)
  expect(await store('st.user.email') === 'jonathan.reeve@example.com', 'seed account not restored on sign-in')
  const w = await store('st.user.walletBalance'), p = await store('st.user.points')
  expect(p >= 1000, `returning account should hold at least 1,000 points, has ${p}`)
  await nav('/points/redeem')
  await type('input[inputmode=numeric]', '1000')
  await click('Confirm'); await click('Redeem', 1000)
  expect(await path() === '/points/redeem/done', 'expected redeemed done')
  expect(await store('st.user.walletBalance') === w + 10 && await store('st.user.points') === p - 1000, 'balances did not move')
})

await step(11, 'Withdraw, see the balance drop and a Processing payout appear', async () => {
  const w = await store('st.user.walletBalance'), n = await store('st.payouts.length')
  await nav('/wallet/withdraw')
  await type('input[aria-label="Amount to withdraw"]', '100')
  await click('Withdraw', 1000)
  expect(await path() === '/wallet/withdraw/done', 'expected withdrawal done')
  expect(await store('st.user.walletBalance') === w - 100, 'balance did not drop')
  expect(await store('st.payouts.length') === n + 1 && await store("st.payouts[0].status") === 'processing', 'no processing payout')
})

await step(12, 'Open Profile, change a setting, see it stick', async () => {
  await nav('/profile/settings/notifications')
  const before = await store('st.user.emailPrefs.newsletter')
  await evaluate(`document.querySelectorAll('[role=switch]')[2].click()`); await sleep(300)
  expect(await store('st.user.emailPrefs.newsletter') === !before, 'toggle did not stick')
  await nav('/profile/settings/notifications')
  expect(await evaluate(`document.querySelectorAll('[role=switch]')[2].getAttribute('aria-checked')`) === String(!before), 'toggle reset after navigation')
})

await step(13, 'Raise a support ticket, open the chat, send a message', async () => {
  await nav('/support/contact')
  await click('About money')
  await type('input[placeholder="Write subject here"]', 'Payment status')
  await type('textarea', 'What is the status of my incentive payment for the GLP-1 study?')
  await click('Submit', 1000)
  expect(await evaluate(`document.body.textContent.includes('within 1 working day')`), 'money reply time not shown')
  await click('Go To Chat')
  expect((await path()).startsWith('/support/tickets/'), 'expected the chat')
  await sleep(2800)
  expect(await evaluate(`document.body.textContent.includes('Automated reply from our guides')`), 'automated first reply missing')
  await type('input[aria-label="Write a message"]', 'Following up on this.')
  await evaluate(`document.querySelector('button[aria-label=Send]').click()`); await sleep(300)
  expect(await evaluate(`document.body.textContent.includes('Following up on this.')`), 'message not appended')
  expect(await evaluate(`document.querySelector('input[aria-label="Write a message"]').value`) === '', 'composer not cleared')
})

await step(14, 'Sign out, sign back in', async () => {
  await nav('/profile')
  await click('Sign Out'); await click('Logout')
  expect(await path() === '/signin', 'expected /signin')
  expect(await store('st.signedIn') === false, 'still signed in')
  await type('input[type=email]', 'jonathan.reeve@example.com')
  await type('input[type=password]', 'Passw0rd!')
  await click('Login', 1200)
  expect(await path() === '/dashboard', 'expected /dashboard')
})

console.log(fails === 0 ? '\nAll 14 steps passed.' : `\n${fails} step(s) failed.`)
ws.close(); proc.kill()
