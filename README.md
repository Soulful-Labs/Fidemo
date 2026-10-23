# Focus Insite / HumanLayer platform: the front end

Three front-end applications that make one research participation platform.
Participants find paid studies and take part; clients create and run studies;
the Focus Insite team reviews, approves and operates everything in between.

**All three apps are built, deployed and working against a data layer that
lives in the browser. The job is to put a real back end behind them.** The
screens do not need to change. Start with `PRD-Focus-Insite-Platform.md`
Section 23, then `shared/store.ts` below.

Live prototype: https://fidemo-lyart.vercel.app (respondent),
[/client](https://fidemo-lyart.vercel.app/client),
[/internal](https://fidemo-lyart.vercel.app/internal).
Designs: [Figma file `Q83MnpAyJuc6RttXYbWudH`](https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App), one page per app.

---

## The three applications

| App | Folder | Served at | Platform | Width | PRD |
|---|---|---|---|---|---|
| Respondent app (HumanLayer) | repository root: `src/`, `public/`, `index.html` | `/` | Mobile only | 375px | Part A |
| Client app (Focus Insite) | `client/` | `/client/` | Desktop only | 1440px | Part B |
| Internal team console | `internal/` | `/internal/` | Desktop only | 1440px | Part C |

The widths are fixed for the MVP (PRD Section 0). The respondent app has no
desktop layout; opened on a desktop it shows the 375px phone frame centred. The
client app and the console are not responsive below 1440px. Neither is an
omission.

Each app is its own Vite + React 19 + TypeScript + Tailwind v4 + React Router 7
project with its own `package.json`, router and base path. Each also has a
landing page for signed-out visitors (`/`, `/client`, `/internal`) and
developer-only routes that are not part of the product: `/kitchen-sink` (every
component) in each app, and `/motion` (every animation on demand) in the
respondent app.

## The shared layer: `shared/`

All three apps import `shared/` (as `@shared/...`). It is the only thing they
have in common, and it is why a study created in the client app appears in the
console and to respondents.

| File | What it holds | For the back end |
|---|---|---|
| `shared/types.ts` | The shape of every domain object | **The API contract.** Return these shapes; map at the edge rather than changing them |
| `shared/rules.ts` | The Trust and Rewards policy values: Trust Score events, tiers, points, redemption | Move to the database so the console can edit them. Values must match PRD Section 6 |
| `shared/platform.ts` | Fees, limits, thresholds, timings, the promised waits | Same |
| `shared/lifecycle.ts` | The state machines for studies and participations | Enforce server side |
| `shared/derive.ts` | Every computed figure, and the consent gates (`sharedPhoto`, `sharedVideo`) | Compute the expensive ones server side |
| **`shared/store.ts`** | **Every read and write.** Today it keeps the whole platform in `localStorage` (`fi-platform`) and syncs open tabs with storage events | **The file to replace** with calls to a real API and database. Everything else stays |
| `shared/media.ts` | Intro videos, kept in the browser's IndexedDB (`fi-media`); the state holds only a reference | Replace with real file storage |
| `shared/files.ts` | Real PDF and CSV downloads, written in the browser | Keep, or generate on the server |
| `shared/avatar.ts` | Drawn, faceless pictures for invented people | Delete with the seed |
| `shared/seed.ts`, `shared/seed/` | The demonstration data | Delete. It exists only so the prototype has something to show |

## Install and run

Needs Node 20 or later. Each app installs separately.

```sh
npm install
npm --prefix client install
npm --prefix internal install
```

**One app at a time**, with hot reload:

```sh
npm run dev                      # respondent app   http://localhost:5173/
npm --prefix client run dev      # client app       http://localhost:5174/client/
npm --prefix internal run dev    # console          http://localhost:5175/internal/
```

Each dev server is its own origin, so its browser storage is its own: in dev,
the three apps do **not** see each other's changes.

**All three together, as deployed**, on one origin where they share one store:

```sh
npm run build:all                # builds all three, then scripts/assemble.mjs copies client and console into dist/
node scripts/serve-all.mjs       # http://localhost:5180/  /client  /internal
```

The deployment (Vercel, `vercel.json`) runs the same `build:all` and serves
`dist/` with the same three fallbacks.

## Demo sign-ins

Signing in as the demo participant or the master admin resets the demo data
for all three apps.

| App | Email | Password | Notes |
|---|---|---|---|
| Respondent | `jonathan.reeve@example.com` | `Passw0rd!` | Signs in as the demo participant, Jonathan Reeve, and restores the demo data. Any other account signs in with its own password and restores nothing; a wrong password is refused. Sign-up's one-time code is `123456`. A session's attendance PIN is `407060`, accepted once the session has started. A new participant's ID is in review until the team marks it verified in the console (Participants > Verifications). Explore lists only studies whose audience the participant fits. A diary entry opens on its own date for a new account; seeded demo accounts can fill every entry at once |
| Client | `jennifer@soulfullabs.com` | `demo1234` | Jennifer Lee, Soulful Labs |
| Console | `peter@focusinsite.com` | `demo1234` | Master admin |
| Console | `maya.thompson@humanlayer.com` | `demo1234` | Sub-admin with restricted access |

Opening any respondent app URL with `?reset=1` also restores the demo data,
for all three apps.

## Check scripts

Every check drives a real headless Chrome over the DevTools protocol, with no
extra packages. They need Google Chrome installed (or `CHROME=<path>`) and,
except where noted, the one-origin build running:

```sh
npm run build:all && node scripts/serve-all.mjs
BASE_URL=http://localhost:5180 node --experimental-websocket scripts/<check>.mjs
```

Point `BASE_URL` at `https://fidemo-lyart.vercel.app` to run them against the
live site. Each prints a pass, YES or WORKING line per item and a total.

**The regression suite**

| Command | What it checks |
|---|---|
| `npm run verify:shared` | The shared layer without a browser: every policy value, state machine, fee, consent gate and seed invariant (no server needed) |
| `scripts/journey.mjs` | The cross-app journey in three tabs: a client creates a study, the team approves it, a respondent applies, is qualified, books, attends and is paid and rated (13 steps) |
| `scripts/demo.mjs` | The respondent app's 14-step acceptance demo, sign up to sign back in |
| `scripts/console-auth.mjs` | Console sign in, sign up, sub-admin access and the activity log (22) |
| `scripts/landing-check.mjs` | The three landing pages: containment, header, where every button goes (36) |
| `scripts/create-check.mjs` | A study of each of the six types created, reloaded, and read back in all three apps (5) |
| `scripts/flow-check.mjs` | Survey and diary answers reaching the client and console; costing against the fee table; editing; reload safety (6) |
| `scripts/final-check.mjs` | No client edit on a live study, and the console's Edit; fees; blank Create; pre-screener answers; Matched; thumbnails; AutoPay (7) |
| `scripts/connected-check.mjs` | Five cross-app connections in three tabs: study, application, approval, payout, support ticket (5) |
| `scripts/media-check.mjs` | Profile picture and intro video, their points and their consent across all three apps; the client dashboard (6) |
| `scripts/policy-check.mjs` | Policy copy, one figure per wait, real downloads, and no real face on any screen (6). Takes about 8 minutes and prints its progress |
| `scripts/card-check.mjs` | Study descriptions on hover and press-and-hold; the landing screenshots against the current build (6) |
| `client/scripts/healthcheck.mjs` | Every client route renders without an error (64). Run with `BASE_URL=http://localhost:5180/client` |
| `internal/scripts/healthcheck.mjs` | Every console route renders without an error (179). Run with `BASE_URL=http://localhost:5180/internal` |
| `client/scripts/containment.mjs` | Every client screen at 1440x900 and 1440x1200: nothing wider than the window (128) |

`scripts/cleanup-check.mjs` occasionally hangs with a stuck browser. If it prints nothing for more than a few minutes, stop it and run it again on its own.

**Other tools**

| Command | What it does |
|---|---|
| `scripts/screener-check.mjs` | A client-built screener followed from Create to a respondent answering it |
| `scripts/audit.mjs [routes\|clicks]` | Respondent wiring audit: every route and every click. Study statuses are covered by `scripts/demo.mjs` |
| `client/scripts/clickaudit.mjs`, `internal/scripts/clickaudit.mjs` | Click every control on every route and list the ones that do nothing |
| `scripts/shot.mjs`, `client/scripts/shot.mjs`, `internal/scripts/shot.mjs` | Screenshot a route (respondent at 375px, the others at 1440px); `--batch` for many |
| `internal/scripts/diff.py` | How far a console render is from its Figma frame |
| `scripts/moments-walk.mjs`, `scripts/motion-probe.mjs`, `scripts/wobble.js` | The respondent app's motion: what plays where, frame rates, overshoot |
| `scripts/frame-escape.py` | Pixels painted outside the respondent app's phone frame |

## The documents

**Current.** Build from these.

| File | What it is |
|---|---|
| `PRD-Focus-Insite-Platform.md` (root and `docs/`) | The product requirements for all three apps, 21 October 2026: every screen, control, state and route; the platform workflow (Section 15); every policy value (Section 6); every decision taken (Section 16); the data shapes; acceptance tests; the technology stack (22.3); and how to build the back end (Section 23). Self-contained |
| `BRD-Focus-Insite-Platform.md` (root and `docs/`) | The business requirements: why the product exists, who it serves, the business model and processes, rules, decisions, assumptions, risks, compliance and phasing |
| `Trust-and-Rewards-Policy.html` (root and `docs/`) | The Trust and Rewards Policy of 13 October 2026. It governs scores, tiers, points, redemption, scheduling, ratings, consent, restriction and the certificate, and outranks every other source on those subjects. PRD Section 6 reproduces it |
| `docs/Screens-Not-In-Figma.md` | Every screen and piece built without a Figma frame, and what it was modelled on |
| `docs/Motion.md` | The respondent app's motion layer: what moves, how, and the tiers of motion allowed where |

**Superseded.** `docs/superseded/` holds the earlier workflow, policy, console
specification and respondent PRD. Do not build from them; its `README.md` says
what replaced each.

**Working material, not specification.** The three `CLAUDE.md` files (root,
`client/`, `internal/`) are the build briefs and running notes the prototype was
built with: frame-by-frame measurements, every deviation from Figma and why.
They are useful for understanding a screen's history and they cite the
superseded documents by name. Where they disagree with the PRD, the PRD is
right. `design/` holds PNG exports of the respondent app's Figma frames, and
`client/figma-export/` the designer's updated client screens of 13 October 2026.

## Before production

The prototype is honest about what it is: one person's browser pretending to be
a platform. All of this needs dealing with before real people use it. The full
list, with the order to build in, is PRD Section 23 and BRD Sections 10 and 11.

**The back end**

- Replace `shared/store.ts` with a real API and database returning the shapes
  in `shared/types.ts`. Live updates are required: the console's queues and a
  study approved in the console appearing in the client app without a reload.
- Enforce the state machines (`shared/lifecycle.ts`) and the access rules (PRD
  23.4) on the server. The front end hides things; it does not protect them.
- Real authentication. Today any email signs in to the respondent app, the
  client and team passwords sit in the seed in plain text, and sessions are
  `localStorage` entries.
- Real file storage for ID documents, profile pictures and intro videos (videos
  are in the browser's IndexedDB today and never leave that browser).
- Delete `shared/seed.ts`, `shared/seed/` and `shared/avatar.ts`, the
  `?reset=1` and demo-sign-in resets, and the demo codes (`123456`, `407060`).
- Loading, error, failed-save, offline and slow states. None is drawn or built,
  because the prototype never waits (PRD 23.6). Payments and uploads must
  never charge or save twice on a retry.

**Money**

- A real card processor. No card is charged today: the card forms are a demo
  that keep only the brand, the last four digits and the expiry, and the
  console shows cards masked. Card details must go to the provider, never to
  our database, and the build must not follow the Figma frames that show a
  full card number to staff or keep a CVV (BRD Section 11).
- Payouts are sent by hand through Tremendous in phase one (PRD Section 15).
  A withdrawal waits until a team member releases it in the console
  (Finance > Payouts); the release records it, and no money moves.

**Legal, to settle with counsel**

- Selfie and liveness capture is not built and must not be until the biometric
  legal review closes (decision D5).
- Retention and deletion for identity documents, recordings, pictures and
  videos, deactivated participants, closed client accounts and the activity log
  (PRD 23.5).
- Consent to show a participant's picture or video must be enforced by the
  server and take effect immediately on withdrawal.
- Every public claim must be true and evidenced: the landing pages state a $2
  withdrawal fee and payment within 2 to 3 working days, and the client
  certificate makes verification claims (BRD Section 11).

**Known gaps between the build and the current policy**

The policy of 13 October 2026 arrived after the build. Check every value in
`shared/rules.ts` and `shared/platform.ts` against PRD Section 6. Found so far:

- A participant can still cancel a booked session inside 24 hours. The policy
  allows cancelling only more than 24 hours before the session, at −2; inside
  24 hours not attending is a no show at −4.
- The deposit. The build takes 25% of recruitment plus 25% of incentives at
  submission; the policy (section 8) says the incentives for the full sample.
  Open, for Jim to decide (PRD D32).

**Integrations not yet confirmed**

- Automatic video call links (Zoom): unconfirmed. Until checked, the team issues
  links by hand and "Join" opens the session page.
- Identity verification vendor: cannot be chosen until the biometric review
  closes.
- Email: no email is sent anywhere. Every "we've emailed you" screen is a demo.
