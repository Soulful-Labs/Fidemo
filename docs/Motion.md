# Motion

The respondent app's motion layer: what moves, how, and why. Everything here is
playable on demand at **`/motion`**, grouped A to J in the same order as below.

The app has one motion system. The sections up to "Gamification ideas" describe the
first, Figma-faithful pass; the second half ("PLAYFUL", the name it was built under)
describes the game-feel layer that now always runs on top of it, and "Tiers" says
which motions are allowed where. There is no switch: the app is always playful. The
Figma-faithful reference lives in git history at `b001385`.

Ground rules this layer keeps:

- **No strings, layout, rules, numbers or colours changed.** Motion happens on the
  way in, on the way out and on interaction. Settled screens were compared pixel for
  pixel against the pre-motion build (`f6b7924`) on 26 routes: 23 are identical, and
  the other 3 differ only in the antialiasing of the rounded ends of progress-bar fills,
  which now slide into place instead of being sized.
- **Transform and opacity only.** Nothing animates width, height, top, left, colour
  or stroke. The two places that used to (the toggle knob's `left`, progress fills'
  `width`) now use transforms.
- **The policy owns every number.** Animation shows a number arriving. The final
  frame of every roll is exactly the app's own formatter applied to the real value;
  intermediate frames are only ever between the old and new real values.
- **One dependency**, `framer-motion`, used where a timeline or presence is needed.
  CSS keyframes and the Web Animations API do the rest.

---

## The vocabulary (`src/lib/motion.ts`)

Everything imports from here. CSS twins live at the top of the motion block in
`src/index.css` (`--dur-*`, `--ease-*`).

| | Value | Used for |
|---|---|---|
| `DUR.fast` | 160ms | Press feedback, exits, beats between steps |
| `DUR.base` | 320ms | Arrivals, route changes, list rows, falls |
| `DUR.slow` | 720ms | The moments that matter: gains, reveals, sweeps |
| `EASE.out` | `cubic-bezier(.22,1,.36,1)` | Anything arriving |
| `EASE.in` | `cubic-bezier(.55,0,.85,.3)` | Anything leaving, or landing hard (the seal strike, a coin drop) |
| `EASE.inOut` | `cubic-bezier(.65,0,.35,1)` | Loops and sweeps (sheens, idle drift, ray sway) |
| `SPRING.soft` | k380 c36 | Sheets, dialogs, toasts, tab indicators |
| `SPRING.snappy` | k600 c26 m.6 | Pops: ticks, pills, the unlocked banner |
| `SPRING.heavy` | k260 c14 m1.4 | Things with weight: completion badges, the earned coin |
| `STAGGER` | 45ms | Siblings arriving one after another |

`rollDuration(gain)` is the one scaled value: a roll-up takes `base` for +1, most of
`slow` for +25, and stretches to `2 × slow` for gains in the thousands. It is derived
from the three durations, not a fourth.

Named variants: `fadeUp`, `fadeIn`, `popIn`, `land`, `settle`, `dialog`, `sheet`,
`scrim`, `staggerChildren()`.

Helpers: `play()` (a WAAPI one-shot that does nothing under reduced motion),
`haptic()` (`navigator.vibrate` where supported, silent elsewhere), `HAPTIC`
patterns (press, gain, land, stamp).

Supporting modules:

- `src/lib/seen.ts`: the last value the person *saw* for each animated figure,
  in localStorage and scoped to the account. This is what makes a figure animate from
  where they left it, and never from zero.
- `src/lib/overlays.ts`: counts open overlays. A remembered figure that changes while
  a modal is up waits until it closes, so the gain is seen rather than played behind a
  scrim.
- `src/components/motion/useArrival.ts`: the shared hook behind bars, the dial
  and the profile ring (memory, overlay wait, StrictMode-safe, reduced motion).

---

## Reduced motion

Enforced once, at boot, so no screen can forget it:

1. `installReducedMotion()` (`src/main.tsx`) sets framer-motion's global
   `skipAnimations` from `prefers-reduced-motion` and keeps it in sync if the setting
   changes. Every motion component, every timeline and every `animate()` number roll then
   jumps straight to its final value. **No state is lost**: the final value is always
   written.
2. `index.css` resolves every CSS transition and keyframe in 1ms, stops idle loops, and
   hides everything marked `data-decor` (particles, sheens, rays, ink rings, floating
   +X / −X, glints).
3. `play()` and the WAAPI effects check `prefersReduced()` and do nothing.

A loading spinner still turns: it is information, not decoration. Haptics still fire;
vibration is not motion.

Verified by emulating the setting in headless Chromium: the tier upgrade and certificate
open with every element at full opacity and no decorative layer drawn, a 2,000-point
roll lands on its final figure on the first frame, a deduction resolves at once, and
modals open and close instantly.

---

## The moments

### A. Points arriving
`components/motion/RollingNumber.tsx`, on the dashboard points chip, Reward Points
balance, Wallet balance and Reward Points row, and the dashboard Wallet tile.

- The figure rolls up from the last value seen to the new one. Speed scales with the
  gain (`rollDuration`), so a +25 is quick and a referral-sized gain takes its time.
- A **+X** rises and fades off the figure. In the dashboard header, where there is no room
  above, it rises from below and is absorbed into the chip (`float="into"`).
- When the roll lands, the badge it belongs to gives **one pulse** and a short haptic.
- If the gain happens behind an overlay (the points-earned modal opens at the same
  moment), the roll waits for the overlay to close.
- The points-earned modal itself: the coin lands on a heavy spring and turns over twice,
  a ring goes out from it, and the amount rolls up from 0 to the amount earned.

### B. Tier upgrade
`app/TierUpgrade.tsx`, `app/useTierSequence.ts`, `app/tierParts.tsx`.

One timeline, so a tap anywhere finishes all of it:

1. The screen fades up; the tier glow and slow-swaying rays rise.
2. "Congratulations!!" drops in; the old tier's line ("You've reached to Silver Tier!")
   appears.
3. The tier mark falls with weight (accelerating in, landing slightly past full size,
   a small rebound, rest). A haptic thud on impact.
4. On impact: two rings go out, the glow flashes, 30 particles burst up and out and sink,
   and the old tier name crossfades to the new one in place.
5. "Your Trust score is N" rolls from the score before to the score now.
6. The benefits card rises, the tier pill pops onto it, the benefit lines stagger in, the
   button rises last.
7. A band of light crosses the mark every few seconds while it is on screen; four small
   sparks twinkle around it.

Triggered by `CelebrationModals` when the derived tier rises; it now passes the previous
tier and score.

### C. Certificate unlock
`app/CertificateUnlock.tsx`, `app/useStampSequence.ts`. Deliberately the opposite of B:
nothing glows or rises. It is pressed.

1. A paper card slides up and "Human Certificate" appears.
2. The seal is lifted over the paper, large and tilted, and held for a beat.
3. It is struck down: accelerating, a touch past flat on impact, then settling. The card
   gives under the blow, an ink ring spreads, a faint off-true impression is left
   behind, a few specks scatter low, and a single heavy haptic fires.
4. Then the card writes itself in: "Cert. ID: …" and "Government ID Verified" are
   uncovered left to right, and the verified tick pops.
5. Done rises.

Triggered when `user.verified.govId` turns true (the policy issues the certificate the
moment the ID check passes), so it plays over Welcome at the end of onboarding. **It uses
only strings already in the app**, and shows the certificate ID exactly as the
Certificate screen does (the HL-R form; the policy's FI form is still an open question).

### D. Progress
`ProgressBar`, `ScoreDial`, the profile completion ring, the question progress bar.

- Bars slide the fill by transform from the last value seen. On a first ever sight there
  is no earlier value, so the bar settles in place with a glint instead of growing from 0.
- Several bars mounting together (the four performance ratings) stagger.
- Reaching the end acknowledges it: the track gives one pulse and a glint runs along it.
- The Trust Score dial lights its dots one after another in step with the rolling number
  (lit dots sit on top of unlit ones, so it is opacity only). Crossing a tier line (70,
  90, from `TIERS`) gives the dial one pulse.
- The tier progress bar remembers per tier range, so crossing a tier never plays as the
  bar resetting; the tier upgrade celebrates the crossing instead.
- The profile ring glows the newly earned arc in over the old one (opacity only), and the
  "% completed" figure rolls.

### E. Deductions
The four policy deductions (No show −4, Cancelled session −2, Late show up −2, Fraud −20).

- The figure **falls**: it drops into place once, rather than counting down.
- It is quieter and shorter than a gain: `base` instead of `slow`, no pulse, no haptic.
- The dial's dots go out quickly, in reverse.
- A quiet **−X** in the body colour settles beside the figure and fades.
- Nothing shakes, flashes or turns red. The only red stays where it already was (the
  existing deduction pill and No Show / Rejected banners).
- The 50 floor holds: at 50, a further deduction changes nothing, so nothing moves.

### F. Session and study completion
`SuccessScreen` (completed, PIN confirmed, scheduled, applied, withdrawal, redeemed).

- The badge drops in on a heavy spring and a small burst goes out from it, with a
  haptic. The tick pops a beat later (`SuccessBadge`, everywhere it is used).
- Title and body, then each step line with its tick, then the Done bar rise in turn.
- **What it earned** arrives when the client approves (five seconds later in the
  demo): the points-earned modal (A), the wallet and points rolling (A, H), the dial
  climbing (D), and the study's Paid banner, which pops its "Earned $X!" line and throws a
  small burst the first time it is seen (G).

### G. Screening result
`screens/studies/detail/BannerReveal.tsx`, and `SuccessScreen mood="calm"`.

The first time a study is seen in a new status, its banner reveals it in that status's
register (statuses already seen just appear):

- **Qualified** (invited to schedule or complete): pops in, a band of light crosses it.
- **Paid**: pops, then the earned line pops with a small burst.
- **Rejected, No Show, Late Show Up**: settle in slowly, with no overshoot and nothing added.
- **"Not a match this time"** (the pre-screener): the calm success screen, where everything
  settles slowly with no burst, no bounce and no haptic. It must never feel like a failure
  animation, and it does not.

### H. Payout
- On the withdrawal and redeemed screens, after the badge lands, five coins drop one
  after another into it. Each landing gives the badge a small knock and a haptic tick.
- Wallet figures roll in cents with a +$ rising off them, and the coin badge pulses.
- Earning history, payout history, payout methods and the points history arrive row by
  row, so the new Processing payout is seen landing.

### I. Verification and onboarding steps
- Stepped progress (onboarding, survey and screener questions, the streak pills) fills
  each newly reached step from the left with a glint. Only the steps completed since the
  person last looked animate (remembered per account).
- A new streak pill pops its tick.
- A file picked on this visit ticks in, with a haptic.
- Welcome presses the verified seal in, then the welcome lines and the score card follow.
- Buttons that become available (Continue once a step is valid) visibly unlock (J).

### J. The small stuff
- **Press feedback** on everything tappable (`scale: .97` on `:active`, via the separate
  `scale` property so it never fights other transforms), plus a short haptic on every
  press of a live control.
- **Route transitions**: forward slides in from the right, back from the left; moving
  between tab roots or replacing a step fades up.
- **Lists** rise in row by row (`data-stagger`): studies, notifications, updates, wallet
  and points histories, payout methods, score history, referrals, support tickets.
- **Modals and sheets** spring in and play out on close with their last content (so a
  modal never empties mid-exit). **Toasts** rise in and drop away.
- **Empty states** rise in, and their title drifts gently while they wait.
- **Locked things**: a locked button (or toggle) answers a tap with a small sideways nudge
  and a double tick, then says why. When it unlocks it gives one pop.
- **Toggle knob** slides by transform (measured, so its resting position is untouched).
- **Tab indicators**: the segmented fill, the underline and the bottom-nav tint slide
  to the selected tab, including across the Explore / My Studies / Saved screens.
- **Skeletons**: the app has none (it uses spinners). `.hl-skeleton` pulses and is
  ready for the first one.

---

## Measured

Headless Chromium at 375px, frame times from a `requestAnimationFrame` recorder
(`scripts/motion-probe.mjs`). "4× CPU" is DevTools CPU throttling, used as a stand-in
for a mid-range Android. Not measured on a real phone.

| Moment | Unthrottled | 4× CPU |
|---|---|---|
| Points roll-up (+2,000) | 60.0 fps, worst frame 16.8ms, 0 over 33ms | 60 fps, worst 16.8ms, 0 over 33ms |
| Tier upgrade (3.2s) | 60.0 fps, worst 16.8ms, 0 over 33ms | 51–55 fps over three runs; 3–6 frames over 33ms; the worst (67–167ms) is the mount frame, which is hidden because the screen opens at opacity 0 |
| Certificate unlock | | 59.6 fps, 1 frame over 33ms |
| Completion screen | | 55 fps, 1 frame over 33ms (mount) |
| Money screen (coins) | | 58.2 fps |
| Dial roll / 4 bars | | 56 / 55 fps |

Tier upgrade tuning that got it there: full-screen glows and moving parts promoted to
their own layers, 30 particles instead of 38, the timeline started one frame after mount,
and finishing no longer re-renders the screen. Before that it measured 43 fps at 4×.

Bundle: framer-motion adds 184 kB raw / 61 kB gzipped (631 → 815 kB). The over-500 kB
chunk warning was already there before this turn.

---

## Wanted to do, chose not to

- **Card-to-detail shared element** (a study card growing into its detail page). It needs
  layout animation across routes and on the card's size, which is a layout change in all
  but name.
- **Animating list reorders** when sorting or filtering (framer `layout`). It risks
  resting-layout drift on every list, for a small gain.
- **Ring and arc fills by stroke**. The profile ring and the dial's thin arc would read
  better drawn on, but that animates `stroke-dashoffset`. They crossfade instead.
- **Continuously spinning rays**. They need linear easing, which is not in the
  vocabulary, so they sway instead.
- **A tier-down moment**. Losing a tier is a deduction; it stays quiet (E) rather than
  getting a screen of its own.
- **Code-splitting framer-motion** (`LazyMotion`) to win back bundle size. Worth doing
  before launch, but it touches every motion import.
- **Sound.** Out of scope, and it needs a mute setting the app does not have.

## Gamification ideas that need a new rule (proposals, not built)

Each of these would add a threshold, milestone or reward the policy does not have:

1. **"Almost there" nudge** when the score is within a few points of the next tier, a
   new threshold. (The app already shows "N more to Gold", which is derived and stays.)
2. **Milestone badges**: first study, 10 studies, first payout. These are new milestones.
3. **Streak multiplier**, where points per study rise with the monthly streak. This is a
   new reward rule; the policy pays a flat 50 for the streak.
4. **Screener speed bonus** for answering quickly. This is a new reward, and it might
   reward rushing.
5. **Daily check-in streak.** This is a new streak rule.
6. **"You can redeem now" moment** the first time points cross 1,000. The threshold is
   already the policy's (`REDEEM.MINIMUM`), so only a new string stands in the way. It is
   the cheapest of these to add if copy is approved.


---

# PLAYFUL

A game-feel layer on top of the base layer: chunky, tactile, bouncy, slightly 3D.
Figma is not binding on its look. Words, rules, numbers and resting positions are
unchanged.

## Tiers: motion is earned

Under PLAYFUL every animation belongs to exactly one tier (`TIER`, `AROUND`,
`CHANGED`, `around()`, `settleTo()` in `lib/motion.ts`). The bounce, overshoot,
confetti, flips and fanfare only ever mean one thing: something was earned.

**Tier 1, getting around.** No bounce, no overshoot, no oscillation. 120–180ms, ease
out, a small fade and a small slide.

| What | How it moves now |
|---|---|
| Opening a screen, going back | 160ms: fade from 0 and an 8px slide (forward from the right, back from the left) |
| Switching tabs (the four tab roots) | Only the nav tint moves (160ms tween); the screen and the icons do not animate |
| Segmented / underline tab indicator | 160ms tween to the new tab |
| Pressing a surface (button, card, tile, row) | Down by exactly its edge on press; back to rest in 120ms, ease out, no spring past rest |
| Pressing anything else | Gives to 0.97× and comes straight back, 120ms |
| Plain modal | 160ms fade and a scale from 0.97; closes in 120ms; the page behind stays put |
| Sheet | Rises in 180ms and sinks in 160ms, never passing its line |
| Scrolling, rubber band, pull to refresh | The list comes home in about 220ms, ease out, no bounce |
| Long press on a card | Swells slowly to 1.04×, then eases back in 160ms |
| List rows | Do not animate in; opening the screen is the one motion |
| Cards when touched | Keep their depth but no longer lift (the thing pressed inside is the motion) |
| Collectible tilt (tier card on Trust Score Details, the certificate) | Follows the finger on a soft spring with no visible overshoot; the phone's own tilt is damped (a dead zone, then half strength), so a card being read stays still |
| Points badge toy | On the Reward Points balance only (a tap that navigates just navigates): a 0.95× dip and three small coins that hop out and drop |

**Tier 2, something changed.** One small settle (240ms, a curve that passes rest at
most once), and it ends.

| What | How it moves now |
|---|---|
| Toggle flipped | The knob slides and settles once (no stretch); the "Saved" toast only fades in |
| Something saved (toast) | A 140ms fade, no movement (it always follows a tap that already moved something) |
| A button becoming available (form valid, step complete) | Settles up once from 0.95×; no confetti |
| Tapping something locked | One nudge (6px and back, passing rest once) and one knock haptic `[12,50,12]` |
| A bar's value changing | Fill moves (ease out, never past its value); the bright edge settles once |
| A form step completed (onboarding, screener and survey segments) | The segment fills in 240ms, ease out |
| A deduction | The figure drops into place once (unchanged from the base layer) |

**Tier 3, something was earned.** Unchanged: this is where all the springs, overshoot,
confetti, particles, flips and fanfare live.

| What | |
|---|---|
| Points or money gained | Counter tumble, landing pop, +X, gain haptic and pop (no badge pulse) |
| Tier upgrade | The whole playful sequence (falling coin, 3D flip, cannons, fanfare) |
| Certificate unlock | The whole playful stamp |
| Study completed, PIN (attendance) confirmed, Applied, Scheduled / Rescheduled | Badge lands, confetti burst |
| Withdrawal requested, Redeemed | Badge lands, coins drop into it |
| Password Updated, support ticket Submitted, Points earned (modals) | The dialog drops in with weight and settles (`dialogEarned`, the `earned` prop on `Modal`); every other modal stays a calm fade |
| Screening passed (invited), study paid | Banner reveal with glint / burst |
| A bar reaching its end, the dial crossing a tier line | Flash and bulge / dial pulse |
| A streak day ticked | The pill pops its tick |
| Points earned modal | Coin flip, ring, count-up |

**Stacked tier 3 takes turns.** When several earned moments fire together (a study
is paid: the points chip and the wallet both gain, and the Paid banner throws
confetti), they no longer land together. `earnedSlot()` in `lib/motion.ts` queues them:
each counter tumbles in turn, the badge no longer pulses on top, and confetti waits for
the tumble (and on the banner, for the earned line) to finish. Measured on the dashboard
after a payment: the points chip lands at about 4.1s, the wallet tile at about 5.7s.

**Idle motion.** A screen with content on it is still: no travelling shimmer on bars, no
first-sight glint, no tilt on cards you scroll past, and the phone's own tilt is
damped. Things only move on their own on a genuinely empty state (the breathing,
drifting, blinking scene) and inside the tier 3 celebrations while they play.

Checked by walking the app as a person would (sign in, dashboard, switching tabs,
opening a study, applying, the wallet, withdraw, the profile, settings, a toggle,
sign out). `scripts/wobble.js` records every moving element's transform each frame
and counts how often it crosses its resting value. Every tier 1 step: 0 crossings, one
moving thing per tap. The toggle: 1 crossing of 0.6px (tier 2). Tier 3 still swings
3 to 5 times: points gain, tier upgrade, certificate and study completed.

## No switch

PLAYFUL used to be a runtime flag with a toggle and Before/After buttons on `/motion`.
It is gone: no flag, no context, no storage, no query parameter, no toggle. The app is
playful everywhere, always. To see the Figma-faithful build, check out `b001385`. The
one remaining demo setting is **Sound** (`lib/settings.ts`), off by default.

## Where each moment really lives

`/motion` is a gallery, not the home of anything. Every moment on it plays in the real
app, from the same component, and `scripts/moments-walk.mjs` walks the real screens and
checks each one moves (`OUT=<dir> node --experimental-websocket scripts/moments-walk.mjs`).

| Moment | Real home | Seen playing there |
|---|---|---|
| A. Points arrive (coin flip, count up) | Points earned modal after a study pays; after sign up with a referral link | yes |
| A. Counters tumble | Dashboard points chip and tiles, Wallet balance and All Time Earned, Reward Points balance | yes |
| A. Points toy (long press) | Reward Points balance only | yes |
| B. Tier upgrade | Over whatever screen you are on when the score crosses 70 or 90 | yes, 85 to 90, Platinum |
| C. Certificate seal | Onboarding, when the ID is accepted (step 3 of 3, after Consent) | yes |
| D. Liquid bar | Diary overview, Trust Score Details rating bars, tier bar, onboarding step bar, question flows | yes |
| D. Bar reaches the end (flash, bulge) | Diary overview at 5 of 5 | yes |
| D. Dial dots light one by one | Dashboard, Profile, Trust Score Details (Certificate uses the same dial, not walked) | yes, on the first three |
| D. Profile ring | Profile, after saving My Profile | yes |
| E. Deduction (quiet fall, no bounce) | Dashboard dial and Trust Score Details after Cancel Study | yes, 90 to 88 |
| F. Completed successfully | `/studies/:id/survey/done`, PIN confirmed | yes |
| F/G. Paid banner (earned line, small burst) | Study Detail, first time it is seen as Paid | yes |
| G. Applied (badge lands, burst) | `/studies/:id/applied` | yes |
| G. Qualified (pop and glint) | Study Detail banner, first time seen as invited | yes |
| G. Not a match (calm) | Screener result | yes |
| H. Redeemed, Withdrawal sent (badge lands, coins drop in) | `/points/redeem/done`, `/wallet/withdraw/done` | yes |
| F. Scheduled, Rescheduled (badge lands, burst) | `/studies/:id/schedule/done` | yes |
| Password Updated, ticket Submitted (dialog lands) | Change Password, Contact us | yes, Password Updated |
| I. Step fills, file ticks in, Welcome seal | Onboarding 1 to 3 and Welcome | yes |
| J. Toggle settle, locked nudge, blocked button nudge, toast | Email Notifications, Consent and Cookies, any disabled Continue | yes |

**One bug this turned up.** Bars, dial dots and the profile ring animated on `/motion`,
where the value changes under a mounted component, and did nothing on a real screen you
came back to. `useArrival` marked the new value as seen on a 0 ms timer, before the
short beat that precedes the animation, so by the time it was due the change looked
already seen. A value is now marked seen only when its arrival starts.

**Remembered, not replayed.** A bar, dial or counter animates from the value you last
saw on *that* screen. A screen you have never opened just shows the figure. So in a
demo, look at a screen before the thing that changes it.

### No real home

- **List row stagger replay.** Lists are tier 1 and stay still. Removed from `/motion`.
- **Skeleton shimmer demo.** Loading in the app is a 600 ms spinner; there is no
  skeleton screen to put it on. Removed from `/motion`.
- **Sound.** Works everywhere, but its switch is only on `/motion`. Account Settings
  has no row for it in the PRD, and adding one needs a new string.

## The demo walk

Starting state only was changed (three seeded client reviews are 5 star, the diary is
three days in). No rule, threshold or point value moved. Open `/signin?reset=1` to
start clean.

1. **Sign in** as the seeded account. Dashboard: Trust Score 85, Gold, 1,250 points, $473.
2. **Look around first**, so the screens remember: Profile, Trust Score, Wallet,
   Reward Points, then My Studies, Invites, Weekend meal planning diary (3/5).
3. **Invites, Wellness app first impressions, Start Study.** Answer the survey, Submit.
   Completed successfully: badge and confetti.
4. About five seconds later the study pays. **Tier upgrade, Gold to Platinum** (the
   completion is +1 and the 5 star review is +4, 85 to 90). Close it.
5. **Points earned** follows on its own: +25, coin flip, count up.
6. Back on the study: the **Paid banner** pops its earned line with a small burst.
7. **Dashboard:** points chip tumbles 1,250 to 1,275, wallet $473 to $548, dial lights
   to 90, streak 0 to 1.
8. **Trust Score:** dial dots light, rating bars fill, history shows +1 and +4.
   **Profile**, **Wallet** and **Reward Points** each tumble once, the first time you return.
9. **Reward Points:** long press the balance for the toy.
10. **Diary:** Resume Study Day 4, submit: bar fills 3 to 4, edge settles. Day 5: bar
    reaches the end, flash and bulge. Complete Study pays again.
11. **Explore, Telehealth triage, Accept & Apply,** pass the screener: Applied lands
    with a burst; three seconds later the detail shows the **qualified** pop and glint.
12. **GLP-1 Care Plans,** answer the last option each time: **not a match**, calm.
13. **Scheduled, Nurse staffing software review, Cancel Study:** dial falls 90 to 88,
    quietly, back to Gold. No bounce, no red flash.
14. **Redeem 1,000 points:** the badge lands and coins drop into it; points fall, wallet rises $10.
15. **Profile, My Profile, save About Me:** the ring fills.
16. **Sign out. Sign up** from a referral link (`/signup?ref=DEMO7`): being referred
    points arrive after OTP; step bar fills 1 to 3; ID files tick in; after Consent the
    **certificate seal** strikes; then Welcome.

Withdrawing after step 4: this year's earnings pass $600, so the app asks for the tax
form first. That is the policy, not a bug; upload it and Withdraw works.

## Landing: the one loud screen

`/` for a signed-out person is the landing page (`src/screens/landing`). A signed-in
person never sees it: `RootRedirect` still sends them to `/dashboard`. It is the
exception to the tier rule: navigation inside the app stays calm, this page may show off.

**It is a phone screen, not a website.** One column, edge to edge, inside the app
frame like every other screen. No header, no footer, no breakpoint, no wide layout.

**Measured off the frame.** No `vw`, `vh`, `dvh`, `svh` or `lvh`. `Landing.tsx` reads
the height of the app's own scroller (`<main>`) with a `ResizeObserver` and hands it to
the sections as `--screen`; each section is `min-height: var(--screen)`.

**Eight screens, one scroll.** Each is a snap point (`scroll-snap-type: y proximity` on
`<main>`, so a screen taller than a short phone still scrolls freely).

| Screen | What moves |
|---|---|
| Hero | The mark assembles: left leg slams down, right leg up, the bridge springs across, the green dot drops in, knocks the mark, rings and throws confetti. Tap the mark to play it again. Headline lands word by word. Glow breathes, rays sway, coins drift. Scrolling away moves the layers at different speeds |
| What this is | A token that is an opinion on one face and a coin on the other, turning over, between two rows of the six study types crossing the frame |
| How it works | Four cards you swipe; each acts its step out (ID scanned and stamped, the matching study lifting out, answers ticking, coins dropping into a wallet) |
| Points | The app's five ways to earn as a swipe row, each figure counting up; what points are worth |
| Tiers | Silver, Gold, Platinum as a fanned hand that springs apart. Swipe, tap a card or tap a name to bring one forward. Each card tilts with the holographic foil (`Tilt`) |
| Certificate | The seal slams onto the certificate, rings and throws confetti |
| A sample study | The app's own `StudyCard` with a seeded study; coins drop into a wallet and the figure counts up to the card's reward |
| Close | Confetti cannons once; Sign Up, Log In, researcher client |

**Pinned.** Sign Up and Log In stay at the thumb on every screen except the last, which
carries its own; progress segments run along the top edge.

**How it stays smooth.** There is no scroll listener.
- Arrivals are CSS animations on transform and opacity, with the app's springs as
  `linear()` easings (`--spring-*`), started by `data-seen` on the section. They run on
  the compositor. Section headings land as one piece; only the hero lands word by word.
- The hero's depth is a CSS view timeline (`.ld-par`), not script. Where a browser has
  no scroll timelines the hero scrolls flat.
- Which screen is in front comes from `IntersectionObserver` (`useInView`).
- Loops pause while their screen is off screen (`data-live`).
- The marquee is the only linear motion in the app: a marquee is the one place a
  constant speed is right.

**Reduced motion.** A still page that still reads: the mark whole, type in place, the
token shown as both faces side by side with an arrow, no particles, no parallax,
no running animations (measured: 0).

**Measured** (production build, 375 by 812, a scripted scroll through all eight screens
at 800px a second):

| | fps | worst frame |
|---|---|---|
| No throttle | 60 | 17ms |
| 4x CPU throttle | 51 to 53 | 50 to 67ms |
| 6x CPU throttle | 37 to 39 | 117ms |

For comparison, the same scripted scroll at 4x on `/motion` holds 60 and on
`/kitchen-sink` 58. The first version of this page managed 36 at 4x with 250ms stalls;
moving arrivals from JavaScript springs to compositor animations and dropping the
scroll listener is what recovered it.

**Weight.** No dependency, no image, no font. About 8.7 kB gzipped of code and 2.3 kB
of CSS. The sample card's picture is one of the app's existing 640 byte SVGs.

**Numbers.** Every figure on the page comes from `lib/rules.ts` or the seed data: tier
thresholds 50, 70, 90; points 25, 200, 100, 50, 50; 100 points to $1; minimum 1,000;
$2 withdrawal fee; certificate valid 12 months; the sample study's $120, 20 min and
match score. Nothing is invented. The certificate ID is shown as a pattern.

## 1. Depth

**The edge.** Every pressable thing with a surface gets a solid bottom edge in a
darker shade of its own fill. It is a `box-shadow`, so it paints outside the box and
moves nothing:

| Surface | Fill | Edge |
|---|---|---|
| Primary button | `cta-gradient` | `yellow.700` (5px); its old border becomes the fill's own end colour |
| Secondary | `cta.secondary` #513303 | that, 52% mixed with black |
| Tertiary / outline | transparent, `cta.tertiaryStroke` rim | the rim colour 70% with black, plus a 1.5px inner rim (reads as a 2.5px border) |
| Danger | `state.dangerBg` | that, 45% with black |
| Cards, rows, tiles (warm) | `bg.1` / `bg.2` | `bg.2` 40% with black, plus a 1.5px rim of the title white at 6% |
| Cards, rows, tiles (green) | `bgAlt.2` | `bgAlt.2` 45% with black, rim of green at 10% |
| Points chip | `green.900` at 40% | `green.900` |
| Selected tab fill / nav tint | `green-segment` / `yellow.1000` | `green.900` / `yellow.1000` darker |

**The press.** On `:active` the thing moves down by exactly its edge height and the
edge is removed: it is pushed into the page. Press-down is instant. Release comes
straight back to rest in 120ms, ease out (tier 1: it used to spring past rest). The edge
is swapped once per press, not animated per frame; everything that moves per frame
is a transform.

**Cards** (non-pressable panels) get a 4px slab edge, a tight contact shadow and a soft
ambient one. (They used to lift when touched; that made two things move per tap, so it is gone.) **Corners** are rounder
(8→10, 12→15, 16→20, 24→30). **Inputs** are sunken wells with a confident rim.
**Toggles** have a sunken track and a raised knob. **Locked** (disabled) buttons sit
flat and sunken, so unlocking visibly raises them.

**Colour derivations.** No new hue. Every colour is an existing token, a shade of one
(`color-mix(in oklab, token, black)`), or a tint of one (`color-mix` with the title
white or with transparent). The tokens are mirrored as `--pf-*` variables at the top
of `playful.css`, because Tailwind's legacy config does not expose them. Things placed
side by side are different hues (the holographic foil runs purple, blue, green,
yellow, each a separate hue). The one deliberate shade-on-shade pairing is an edge
under its own face, which was asked for. Red appears only where it already did:
destructive buttons, deduction pills, No Show and Rejected.

## 2. 3D and tilt

- **Collectible cards** (`components/motion/Tilt.tsx`): the Trust Score card on the
  dashboard, the Trust Score Details tier card, the Human Certificate, and the coin and
  certificate inside the big two. They tilt up to 16° in 3D to follow a dragged finger
  (or the mouse), and to the phone's own tilt where `deviceorientation` reports it.
  Permission is asked once, on the first touch of a card, and only where the browser
  requires asking (iOS); everything works without it. A holographic foil (bands of the
  app's own hues) slides against the tilt and a glare follows it; both are faint at rest
  and brighten as the card turns. The foil sits on its own clipped layer, so a lifted
  seal can overhang the card.
- **Tier reveal flip**: the coin has the old tier on its front and the new tier on its
  back, and turns over in real 3D (`backface-visibility`, `preserve-3d`), spinning one
  and a half turns. The headline flips on its X axis with it.
- **Z push**: under PLAYFUL, modals and sheets are portalled to `<body>`. While any
  overlay is open, the screen and nav recede (scale 0.93, dimmed) and dialogs arrive
  from in front of the glass (from scale 1.18, tipped back 22°) on the bouncy spring.

## 3. Springs

Two springs join the vocabulary in `lib/motion.ts`: **bouncy** (k520 c13 m0.8, about 34%
overshoot, settles in 0.87s) for everything you touch, and **slam** (k900 c24 m2.4)
for the hardest landing. `springCurve()` samples any spring into a CSS `linear()`
easing, published as `--spring-*` variables, and `springTo()` plays one through WAAPI.
Under PLAYFUL every interactive motion springs: the press release, route changes
(in from 48px, past −15px, home in 0.8s), the toggle knob (with a stretch), unlocks,
badge pulses, step segments, tab and nav indicators, toasts and list rows. Fades and
background loops keep their curves.

## 4. Physical numbers

- **Counter**: a gain tumbles each digit on its own wheel (`components/motion/odometer.ts`),
  the lower places spinning further like a mechanical counter, with masked edges. When
  the wheels stop, the exact formatted text is written back and the figure swells to
  1.4× and springs home.
- **Liquid bars**: a shimmer travels along the filled part, the bright leading edge
  sloshes (scaleX spring) as the fill arrives, and crossing the end flashes the whole
  bar its own colour and bulges it to 2.4× height. The fill position itself does not
  overshoot: a bar never shows a value it does not have.
- **Dial glow**: a glow behind the Trust Score dial whose opacity follows the score (50
  barely lit, 100 blazing).
- **Confetti** (`Confetti.tsx`, `confettiCore.ts`, `confettiWorker.ts` in
  `components/motion`): gravity 2200px/s², air drag, paper that flutters side to side
  and turns over as it falls, coins that spin on their edge, stars and dots in varied
  sizes. Pieces land on the floor, bounce once, slide to a stop and lie there for 1.6s
  before fading. It is drawn on one canvas that is handed to a Web Worker
  (OffscreenCanvas), so physics and drawing run off the main thread. Shapes are
  pre-rendered sprites, the canvas is 1×, and at most 260 pieces are in play. Browsers
  without OffscreenCanvas run the same engine on the main thread.

## 5. Fun to touch

- **Points badge toy**: tapping the dashboard chip or the Reward Points balance
  squashes it and pops seven coins out that fall and land. Every time; it changes nothing.
- **Rubber banding**: lists stretch at both ends with iOS-style resistance and spring
  back; the wheel does the same on a laptop. **Pull to refresh**: pulling down from the
  top drops a coin that stretches the further you pull and turns past the line; let go
  there and it spins briefly (there is nothing to fetch) and snaps back.
- **Long press**: holding a card for 420ms swells it slowly with a soft haptic;
  releasing springs it back, and the tap it would have made is swallowed.
- **Locks**: locked buttons and toggles wobble and rattle (rotate and shake, with the
  rattle haptic). A button that unlocks bursts open: a spring, a spray of confetti and
  the unlock haptic.
- **Empty states**: a glow that breathes, motes that drift, two stars that blink.
- **Tab bar**: the new tab's icon squashes and bounces back; the tint travels on the
  bouncy spring; tabs, toggles and the nav give a selection tick.

## 6. Haptic language

All haptics go through `lib/feedback.ts`. `navigator.vibrate` patterns, in ms (on, off, on, …):

| Event | Pattern | Feels like |
|---|---|---|
| select (tab, toggle, nav, picked file) | `[7]` | a light tick |
| press (any live control) | `[5]` | the lightest touch |
| gain (points, money) | `[14, 70, 22]` | a double tap |
| deduct | `[55]` | one short low pulse |
| land (tier coin impact, completion) | `[28, 40, 12]` | a thud and a settle |
| celebrate (tier upgrade, certificate, a newly paid study) | `[20, 50, 20, 50, 40, 70, 120]` | a drum roll into a long hit |
| stamp (the seal) | `[70, 30, 18]` | one heavy blow |
| locked | `[12, 50, 12]` | one knock against the lock (tier 2; was a five-pulse rattle) |
| unlock | `[12, 40, 35]` | click, then release |
| swell (long press) | `[18]` | a soft nudge |
| toy (coin badge) | `[6, 30, 6]` | a tiny double click |

(There used to be a set of quieter patterns for when PLAYFUL was off; with the flag gone, these are the only patterns.)

## 7. Sound

`lib/sound.ts`, synthesized with the Web Audio API; no audio files ship. **Muted by
default.** It never autoplays: the AudioContext is only created inside the tap that
switches sound on at `/motion` (or the first tap of a later visit, if it was left on).
Sound plays only with PLAYFUL on.

| Event | Sound |
|---|---|
| select / press | a soft triangle tick (2.4→1.8kHz, 35ms) / a quieter one |
| gain | a rising pop: a 520→1040Hz glide, then a bright note a third above |
| deduct | a low thunk: 150→70Hz with a little filtered noise, soft-edged |
| land | a deep thud: 110→48Hz plus low noise |
| celebrate | the fanfare: a C–E–G–C arpeggio into a held, slightly detuned five-note chord, sparkling high notes and a shimmer of high noise |
| stamp | a heavy blow (90→40Hz) and a band-passed slap of paper |
| locked / unlock | a three-click rattle / a click and a rising chime |
| swell / toy | a soft filtered whoosh / a two-note coin bling |

Checked by counting oscillators: none while muted, one per tick, two per gain, fourteen
for the tier upgrade (thud plus fanfare).

## 8. The big two

**Tier upgrade** (`app/playful/TierPlayful.tsx`, `useTierPlayful.ts`). The title slams
in from above. The old tier's coin drops from the top of the screen spinning and slams
down. On impact dust kicks up, the camera jolts and two rings go out. The coin turns
over in 3D to the new tier while the headline flips with it. On the reveal the screen
flashes, a band of light sweeps across, rays bloom, confetti bursts from the coin and
fires from both bottom corners, and glitter falls for three seconds. The score rolls
and swells as it lands, the benefits are dealt like cards (rotating up from −90°), the
button bounces in, and the landed coin floats and tilts as a collectible. Haptic land
then celebrate; fanfare.

**Certificate** (`app/playful/CertificatePlayful.tsx`, `useStampPlayful.ts`). The card
springs up, tipping forward, as a collectible. A huge seal is hoisted high over it,
with its shadow small and faint on the paper; it trembles at the top, then comes down
like a hammer as the shadow rushes in. The screen takes the blow, the card squashes,
ink splashes twice and leaves its off-true impression, and green specks fly. The words
write in line by line, the tick spins in, and the card turns over once to show off,
landing to the fanfare and corner cannons.

Both are single timelines written as whole `transform` strings, which framer hands to
the compositor (49 WAAPI animations run during the tier upgrade), and a tap anywhere
finishes them.

## Reduced motion, with PLAYFUL

Everything above stops cleanly. The press travel and card lift are removed; the depth,
edges and surfaces stay, since they are not motion. Confetti, foil, glare, glows, idle
scenes and the pull indicator are not drawn. Tilt is a plain card. Both big moments
open complete, with every element at full opacity and identity transform and the coin
already turned to the new tier. Counters jump to their final figure. Checked by
emulating the setting in the browser.

## Measured (PLAYFUL on)

Headless Chromium at 375px, frame times from a `requestAnimationFrame` recorder
(`scripts/motion-probe.mjs`), with and without GPU rasterisation. "4× CPU" is DevTools
CPU throttling, used as a stand-in for a mid-range Android. Not measured on a real phone.

| Moment | Unthrottled | 4× CPU |
|---|---|---|
| Tier upgrade (4.2s) | **60 fps**, worst frame 16.8ms, 0 over 33ms | **49–49.5 fps**; 13–15 frames over 33ms, the worst being the mount (behind the fade-in) |
| Certificate (4.5s) | **60 fps**, 0 over 33ms | **48–52 fps** |
| Points roll-up (+2,000, tumbling counter) | **60 fps**, 0 over 33ms | **58.5–59 fps**, 1 frame over 33ms |
| Long list scroll (Earning History, 2,600px touch fling) | **60 fps**, 0 over 33ms | **60 fps**, 0 over 33ms |

The big two started at 25–30 fps (tier) and 34–38 (certificate) at 4×. What got them there:

- confetti moved into a Web Worker on an OffscreenCanvas
- pre-rendered sprites drawn at 1×
- both timelines rewritten as whole transform strings, so they run on the compositor
- no `mix-blend-mode` on the foil
- fewer confetti pieces, capped at 260

A CPU profile at the end showed our JavaScript as a small share; the remainder was the
browser's own paint and compositing, which a real phone's GPU handles far better than
headless software rasterisation.

Bundle: 815 → 853 kB (+38 kB), plus a 2.8 kB worker. No new dependency.

## PLAYFUL: chose not to do

- **Animating the edge itself.** It is swapped on press rather than animated, because
  box-shadow animation is paint, not compositing.
- **Overshooting progress fills.** The leading edge sloshes, but the fill never passes
  the real value: a bar should not show progress the person does not have.
- **Confetti or bounce on deductions.** Deductions stay honest and quiet: a low pulse
  and a thunk, nothing celebratory and nothing punishing.
- **A playful layout.** Positions stay where Figma put them; only surfaces, depth and
  motion changed.
- **Device-orientation tilt everywhere.** It is only on the collectible cards; on every
  card it would make the whole app swim when the phone moves.
- **Sound without PLAYFUL, or sound on by default.** The first was a choice and the
  second was ruled out by the brief and by autoplay etiquette.
- **A scoped "before".** Superseded: there is no before at runtime any more; the reference is `b001385`.