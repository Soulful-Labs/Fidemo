// Walks the real app (not /motion) and confirms each earned or changed moment
// actually plays where it lives: at every stop it samples which elements move
// (transforms, opacity, running animations) and saves a frame to OUT.
//
//   OUT=<dir> node --experimental-websocket scripts/moments-walk.mjs

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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

// REAL=1 drives the page the way a person does: a tap at the element's on-screen
// position and keystrokes into the focused field, so an overlay covering a button
// or a field that swallows input shows up as a failure.
const REAL = process.env.REAL === '1'
const tap = async (finder) => {
  const box = await evaluate(`(() => { const el = ${finder}; if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
  if (!box) throw new Error('no element for: ' + finder)
  const hit = await evaluate(`(() => { const el = ${finder}; const top = document.elementFromPoint(${box.x}, ${box.y}); return el.contains(top) || top?.contains(el) ? 'ok' : 'covered by ' + (top?.tagName + '.' + (top?.className || '').toString().slice(0, 40)) })()`)
  if (hit !== 'ok') throw new Error(`${finder} is ${hit}`)
  await s('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 })
  await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 })
}
const clickIn = async (sel, text, wait = 500) => {
  if (REAL) await tap(`__q(${JSON.stringify(text)}, document.querySelector(${JSON.stringify(sel)}))`)
  else await evaluate(`__clickIn(${JSON.stringify(sel)}, ${JSON.stringify(text)})`)
  await sleep(wait)
}
const click = async (text, wait = 500) => {
  if (REAL) await tap(`__q(${JSON.stringify(text)})`)
  else await evaluate(`__click(${JSON.stringify(text)})`)
  await sleep(wait)
}
const clickSel = async (sel, wait = 300) => {
  if (REAL) await tap(`document.querySelector(${JSON.stringify(sel)})`)
  else await evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`)
  await sleep(wait)
}
const clickNth = async (sel, n, wait = 300) => {
  if (REAL) await tap(`document.querySelectorAll(${JSON.stringify(sel)})[${n}]`)
  else await evaluate(`document.querySelectorAll(${JSON.stringify(sel)})[${n}].click()`)
  await sleep(wait)
}
const type = async (sel, value) => {
  if (REAL) {
    await tap(`document.querySelector(${JSON.stringify(sel)})`)
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); el.focus(); el.select?.(); return true })()`)
    await s('Input.insertText', { text: value })
    await evaluate(`document.activeElement?.blur()`)
  } else await evaluate(`__type(${JSON.stringify(sel)}, ${JSON.stringify(value)})`)
  await sleep(100)
}
const path = () => evaluate('__path()')
const store = (expr) => evaluate(`(() => { const st = window.__hl; return ${expr} })()`)


const OUT = process.env.OUT ?? 'moments'
mkdirSync(OUT, { recursive: true })
let n = 0
const shot = async (name) => {
  const r = await s('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}/${String(++n).padStart(2, '0')}-${name}.png`, Buffer.from(r.data, 'base64'))
}
// Samples, for `ms`, every element that moves (a running animation, or a
// transform/opacity that changes) and returns short names for them.
const SAMPLER = `window.__moving = (ms) => new Promise((done) => {
  const seen = new Map(); const last = new Map(); const t0 = performance.now()
  const name = (el) => (el.getAttribute?.('data-t') || el.getAttribute?.('data-s') || '') + ' ' + el.tagName.toLowerCase() + '.' + ((el.getAttribute?.('class') || '').split(' ').filter(Boolean).slice(0, 3).join('.'))
  const tick = () => {
    for (const a of document.getAnimations()) { const t = a.effect?.target; if (t instanceof Element) seen.set(t, (a.animationName || a.transitionProperty || 'anim')) }
    for (const el of document.querySelectorAll('#hl-frame [style*="transform"], #hl-frame [style*="opacity"]')) {
      const cs = getComputedStyle(el); const v = cs.transform + '|' + cs.opacity
      if (last.has(el) && last.get(el) !== v) seen.set(el, seen.get(el) || 'style'); last.set(el, v)
    }
    if (performance.now() - t0 < ms) requestAnimationFrame(tick)
    else done([...seen].map(([el, k]) => name(el).trim() + ' (' + k + ')').filter((x, i, a) => a.indexOf(x) === i))
  }
  requestAnimationFrame(tick)
})`
const moving = async (ms) => { await evaluate(SAMPLER); return evaluate(`__moving(${ms})`) }
const report = (label, list, must) => {
  const hit = must ? list.filter((x) => must.test(x)) : list
  const ok = must ? hit.length > 0 : true
  console.log(`${ok ? 'SEEN' : 'NOT SEEN'}  ${label}${hit.length ? ':  ' + hit.slice(0, 6).join(' ; ') + (hit.length > 6 ? ` (+${hit.length - 6})` : '') : ''}`)
  return ok
}
const visible = () => evaluate(`[...document.querySelectorAll('button, a')].filter(e => e.offsetParent).map(e => e.textContent.trim().replace(/\\s+/g,' ').slice(0,30)).filter(Boolean).join(' | ')`)
const clickAny = async (texts, wait = 500) => {
  for (const t of texts) { try { await click(t, wait); return t } catch { /* next */ } }
  throw new Error('none of ' + texts.join(', ') + ' on ' + await path() + ' -- visible: ' + await visible())
}
const has = (sel) => evaluate(`Boolean(document.querySelector(${JSON.stringify(sel)}))`)
// Answers whatever question screen is showing (text, radios, checkboxes) and
// presses the next button (Continue, Check eligibility, Submit, Submit
// Progress), until `done` is true. `last` picks the last option (to fail a
// pre-screener on purpose) instead of the first.
const answerAll = async (done, last = false) => {
  const finished = typeof done === 'string' ? async () => (await path()).endsWith(done) : done
  for (let i = 0; i < 16 && !(await finished()); i++) {
    await evaluate(`(() => { const opts = [...document.querySelectorAll('main [role=radio], main [role=checkbox]')].filter(e => e.offsetParent); const t = document.querySelector('main textarea, main input[type=text]'); if (t) { const p = t.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(t, 'A short honest answer.'); t.dispatchEvent(new Event('input', { bubbles: true })) } const o = ${last} ? opts[opts.length - 1] : opts[0]; o?.click(); return 1 })()`)
    await sleep(300)
    await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(e => e.offsetParent && /^(Continue|Check eligibility|Submit)/.test(e.textContent.trim())); b?.click(); return Boolean(b) })()`)
    await sleep(1000)
  }
}
const now = async (label) => console.log(`      ${label}: trust`, await store('st.user.trustScore'), await store('st.user.tier'), '| points', await store('st.user.points'), '| wallet', await store('st.user.walletBalance'), '| streak', await store('st.user.streak.current'))

const step = async (name, fn) => { try { await fn() } catch (err) { console.log(`ERROR in ${name}: ${err.message.slice(0, 300)}`) } }

// ---------------- Walk A: the returning demo account ----------------
console.log('\n== Walk A: returning account, fresh seed ==')
await goto('/signin?reset=1')
await step('sign in', async () => {
  const seedEmail = await store('st.user.email')
  await type('input[type=email]', seedEmail); await type('input[type=password]', 'Passw0rd!')
  await evaluate(SAMPLER)
  const m = evaluate('__moving(900)')
  await click('Login', 50)
  report('Sign in: route change (tier 1, calm)', await m, /main/)
  await now('start')
  await sleep(800); await shot('dashboard-start')
  // Visit the screens once, so each remembers what it showed (first sight is still).
  for (const p of ['/profile', '/trust-score', '/wallet', '/points', '/studies/st-31/diary', '/dashboard']) { await nav(p); await sleep(400) }
  report('Dashboard with content at rest (idle should be still)', await moving(1200))
})

await step('study completed', async () => {
  console.log('\n-- A study completed (survey st-09) --')
  await nav('/studies/st-09')
  await clickAny(['Start Study', 'Start Survey', 'Start'])
  await answerAll('/survey/done')
  let m = moving(1600); await sleep(700); await shot('survey-completed'); report('F: Completed successfully lands (badge, confetti)', await m, /div|span/)
  await click('Done', 400)
  let tier = false
  for (let i = 0; i < 30 && !tier; i++) { await sleep(300); tier = await has('[role=dialog][aria-label^="You\'ve reached"]') }
  report('B: tier upgrade opened when the score crossed 90', tier ? ['tier dialog present'] : [], /tier/)
  m = moving(2400); await sleep(1400); await shot('tier-upgrade'); report('B: tier upgrade plays (coin fall, flip, rings)', await m, /coin|flip|ring|title/)
  await sleep(2500); await click('Yayy! Start Earning More!', 600)
  const earned = await evaluate(`document.body.textContent.includes('Reward Points!')`)
  m = moving(1600); await sleep(800); await shot('points-earned'); report('A: points earned modal after the tier closes (coin flip, count up)', earned ? await m : [], /span|div/)
  await click('Done!', 600)
  m = moving(2600); await sleep(1200); await shot('paid-banner'); report('G/F: Paid banner reveal on the study', await m, /div|span|p\./)
})

await step('payment moved', async () => {
  console.log('\n-- What the payment moved, screen by screen --')
  await nav('/dashboard'); let m = moving(7000); await sleep(1200); await shot('dashboard-1s'); await sleep(2200); await shot('dashboard-3s')
  report('A/D: dashboard (points chip, wallet tile, this month, studies, dial, streak)', await m, /span|ellipse/)
  await now('after payment')
  await nav('/trust-score'); m = moving(3500); await sleep(1000); await shot('trust-details'); report('D: Trust Score Details (dial, rating bars, stats)', await m, /ellipse|div\.h-full|span/)
  await nav('/profile'); report('D: Profile dial', await moving(3000), /ellipse|span/)
  await nav('/wallet'); m = moving(5000); await sleep(1200); await shot('wallet'); report('A/H: Wallet (balance, all time earned, points row)', await m, /span/)
  await nav('/points'); m = moving(4000); await sleep(1200); await shot('reward-points'); report('A: Reward Points (balance, all time earned)', await m, /span/)
  await evaluate(`(() => { const el = [...document.querySelectorAll('main section span')].find(e => /text-title-l/.test(e.className)); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); return 1 })()`)
  await sleep(250); await shot('points-toy')
})

await step('diary', async () => {
  console.log('\n-- A bar that fills: the diary --')
  // Answer a diary day, then watch the overview from the moment Submit Progress is pressed.
  const day = async (n, label, must) => {
    await clickAny([`Resume Study Day ${n}`], 900)
    await evaluate(`(() => { const t = document.querySelector('main textarea'); if (t) { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, 'Planned dinners and shopped once.'); t.dispatchEvent(new Event('input', { bubbles: true })) } document.querySelector('main [role=radio]')?.click(); return 1 })()`)
    await sleep(300)
    await evaluate(SAMPLER); const m = evaluate('__moving(2600)')
    await click('Submit Progress', 50)
    await sleep(1500); await shot(`diary-${n}of5`)
    report(label, await m, must)
    console.log('      days', JSON.stringify(await store("st.studies.find(s => s.id === 'st-31').diary.completedDays")))
  }
  await nav('/studies/st-31/diary')
  await day(4, 'D (tier 2): diary bar fills 3 to 4 of 5, edge settles', /div\.h-full|pf-cap/)
  await day(5, 'D (tier 3): diary bar reaches the end (flash, bulge)', /div\.relative\.w-full|span\.pointer-events-none\.absolute\.inset-0|div\.h-full/)
})

await step('applied', async () => {
  console.log('\n-- Screening: applied, then qualified --')
  await nav('/studies/st-04'); await clickAny(['Accept & Apply', 'Apply'], 800)
  await answerAll('/applied')
  let m = moving(1200); await sleep(500); await shot('applied'); report('G (tier 3): Applied successfully lands with a burst', await m, /div|span/)
  await click('Done', 300)
  for (let i = 0; i < 20 && (await store("st.studies.find(s => s.id === 'st-04').status")) === 'applied'; i++) await sleep(300)
  m = moving(1800); await sleep(600); await shot('qualified-banner'); report('G: qualified banner reveal (pop and glint)', await m, /div|span/)
})

await step('not a match', async () => {
  console.log('\n-- Screening: not a match --')
  await nav('/studies/st-01'); await clickAny(['Apply', 'Accept & Apply'], 800)
  const notMatch = () => evaluate(`document.body.textContent.includes('Not a match this time')`)
  // Answer up to the last question, then watch the result arrive.
  const atLast = () => evaluate(`[...document.querySelectorAll('button')].some(e => e.offsetParent && e.textContent.trim().startsWith('Check eligibility'))`)
  await answerAll(atLast, true)
  await evaluate(`(() => { const o = [...document.querySelectorAll('main [role=radio]')].filter(e => e.offsetParent); o[o.length - 1]?.click(); return 1 })()`); await sleep(300)
  await evaluate(SAMPLER); const m = evaluate('__moving(1800)')
  await evaluate(`[...document.querySelectorAll('button')].find(e => e.offsetParent && e.textContent.trim().startsWith('Check eligibility')).click()`)
  await sleep(900); await shot('not-a-match'); report('G: not a match settles in calmly', (await notMatch()) ? await m : [], /div|span/)
})

await step('cancel', async () => {
  console.log('\n-- A deduction: cancel a scheduled session --')
  await nav('/studies/st-10'); await clickAny(['Cancel Study', 'Cancel'])
  await clickIn('[role=dialog]', 'Cancel Study', 600).catch(async () => { await clickIn('[role=dialog]', 'Yes', 600) })
  await nav('/dashboard'); const m = moving(2500); await sleep(500); await shot('dashboard-after-cancel'); report('E: the dial falls quietly', await m, /ellipse|span/)
  await now('after cancel')
})

await step('redeem', async () => {
  console.log('\n-- Spending: redeem --')
  await nav('/points/redeem'); await type('main input', '1000'); await clickAny(['Confirm']); await clickIn('[role=dialog]', 'Redeem', 1200)
  let m = moving(1200); await sleep(500); await shot('redeemed'); report('H (tier 3): Redeemed lands, coins drop into the badge', await m, /div|span/)
  await click('Done', 300); report('E-style: points balance falls', await moving(1500), /span/)
  await nav('/wallet'); m = moving(4000); await sleep(1500); await shot('wallet-after-redeem'); report('H: wallet rises by the redeemed amount', await m, /span/)
})

await step('profile ring', async () => {
  console.log('\n-- Profile ring --')
  await nav('/profile/edit'); await type('textarea', 'Physician who enjoys sharing what works in clinic.'); await clickAny(['Save'], 700)
  await nav('/profile'); const m = moving(1500); await sleep(400); await shot('profile-ring'); report('D: profile ring and % fill', await m, /circle|span/)
})

await step('small stuff', async () => {
  console.log('\n-- Small stuff, for real --')
  await nav('/profile/settings/notifications'); await evaluate(SAMPLER); let m = evaluate('__moving(800)')
  await clickSel('[role=switch]', 50); report('J (tier 2): toggle settles once', await m, /span/)
  await nav('/profile/settings/consent'); await evaluate(SAMPLER); m = evaluate('__moving(800)')
  await evaluate(`(() => { const t = [...document.querySelectorAll('[role=switch]')].find(e => e.getAttribute('aria-disabled') === 'true'); t?.click(); return Boolean(t) })()`)
  report('J (tier 2): a locked control nudges once', await m, /button/)
})

// ---------------- Walk B: a new account (sign up) ----------------
console.log('\n== Walk B: signing up ==')
await goto('/signup?reset=1&ref=DEMO7')
await step('sign up', async () => {
  await type('input[type=email]', 'new.person@example.com'); await type('input[type=password]', 'Passw0rd!')
  await clickSel('[role=checkbox]', 200); await click('Sign Up')
  for (let i = 1; i <= 6; i++) await type(`input[aria-label="Digit ${i}"]`, String(i))
  await click('Submit')
  let bonus = false
  for (let i = 0; i < 25 && !bonus; i++) { await sleep(400); bonus = await evaluate(`document.body.textContent.includes('For Being Referred')`) }
  const m = moving(1400); await sleep(700); await shot('signup-bonus'); report('A: being-referred points arrive (modal)', bonus ? await m : [], /span|div/)
  await click('Done!'); await click('Get Started')
})
await step('onboarding', async () => {
  await evaluate(SAMPLER); let m = evaluate('__moving(800)')
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Continue').click()`)
  report('J (tier 2): blocked Continue nudges once', await m, /button/)
  await type('input[placeholder="Enter Name"]', 'New Person'); await type('input[inputmode=numeric]', '06 / 05 / 1990')
  await click('Female'); await type('input[placeholder="City, Country"]', 'NYC, USA')
  await evaluate(SAMPLER); m = evaluate('__moving(1000)'); await click('Continue', 50)
  report('I: onboarding step 2 of 3 fills in', await m, /span|main/)
  await type('input[placeholder="E.g. Product Designer"]', 'Nurse')
  await click('Industry name'); await clickIn('[role=dialog]', 'Healthcare'); await clickIn('[role=dialog]', 'Save')
  await click('Select education'); await clickIn('[role=dialog]', 'Bachelors Degree'); await clickIn('[role=dialog]', 'Save')
  await click('Continue')
  await click('Passport'); await clickIn('[role=dialog]', 'Passport'); await clickIn('[role=dialog]', 'Save')
  writeFileSync(`${OUT}/id.jpg`, 'x')
  const { root } = await s('DOM.getDocument', { depth: -1 })
  const { nodeIds } = await s('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'input[type=file]' })
  await evaluate(SAMPLER); m = evaluate('__moving(1200)')
  for (const id of nodeIds) { await s('DOM.setFileInputFiles', { nodeId: id, files: [`${process.cwd().replace(/\\/g, '/')}/${OUT}/id.jpg`] }); await sleep(200) }
  report('I: picked ID files tick in', await m, /span/)
})
await step('certificate', async () => {
  await click('Continue'); await click('Save & Continue', 50)
  let cert = false
  for (let i = 0; i < 20 && !cert; i++) { await sleep(150); cert = await has('[role=dialog][aria-label="Human Certificate"]') }
  const m = moving(3800); await sleep(1300); await shot('certificate-hoist'); await sleep(700); await shot('certificate-strike')
  report('C: the certificate seal on unlock', cert ? await m : [], /seal|card|ink|stage/)
  await sleep(2500); await click('Done', 300)
  await shot('welcome'); report('I: Welcome seal and score', await moving(1200))
})

ws.close(); proc.kill()
