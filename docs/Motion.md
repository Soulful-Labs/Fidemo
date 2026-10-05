# Motion

The respondent app's motion layer: what moves, how, and why. Everything here is
playable on demand at **`/motion`**, grouped A to J in the same order as below.

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
