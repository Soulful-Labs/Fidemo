# Focus Insite, internal team console

The desktop console the Focus Insite team uses to run the platform: verify
participants and clients, review and approve studies, moderate them, answer
support, confirm refunds, set pricing and rewards, and manage sub-admins. It
lives entirely in `internal/` and shares nothing at runtime with the respondent
app (repo root) or the client app (`client/`).

Figma: file `Q83MnpAyJuc6RttXYbWudH`, page `1794:64316` ("Admin Panel Dashboard: UI").

---

## The rules

### Rule 1, Figma governs everything visible

Layout, spacing, colour, type, icons and every string come from the frame. Match
it exactly; if a frame has a typo, the typo stays. Behaviour is a later stage:
this stage is the screens.

- Use `get_screenshot` and `get_metadata` only. Never `get_design_context`: it
  floods the context window. (`get_metadata` on the whole page is 5.7 MB; it
  comes back as a file, read it with a script.)
- Every visible value comes from `internal/tailwind.config.ts`, built from
  `get_variable_defs` on this file's own frames. No new colours, no ad-hoc
  spacing, no invented type sizes. A value the frames draw without a variable is
  measured off the PNG and noted here, not guessed.
- Nothing outside `internal/`. The respondent app and `client/` are finished.

### Rule 2, the compare loop

Every screen, every turn:

1. **Screenshot the frame** with `get_screenshot` on that screen's own frame node,
   at its natural size (`maxDimension` = the frame's longer edge, so the PNG is
   1x), and download it with the curl the tool prints. Never a whole section.
2. **Build** to match the image.
3. **Render** at the design width, 1440, in headless Chromium:
   `npm run shot -- <route> <out.png> --full`.
4. **Diff**: `npm run diff -- <figma.png> <render.png>`. Report the result as a
   **percentage of differing pixels**, with where they sit.
5. **Fix and repeat** until the image and the frame match. Anything that cannot
   be matched goes in the turn report with the reason.

Measuring beats guessing: sampling pixels out of the Figma PNG settles spacing
questions in seconds, and the same script run against the render proves the fix.

### Rule 3, a shared change re-opens what it touches

When a turn changes a shared component, a token or the shell, re-run the compare
loop on every screen already signed off and report their new diff percentages.
A screen is only still signed off if it still matches. (In the client build a
CTA gradient, the panel's y-offset and a button height each silently moved every
screen already done.)

### Rule 4, push after each screen

Commit and push as soon as a screen matches, not only at the end of a turn. A
session limit has cut turns short before; a push per screen means finished work
is never lost and the branch always shows how far the turn got. Never create a
new branch.

### Rule 5, prove the render before trusting the diff

**A dead dev server does not produce an error, it produces a plausible diff of
nothing.** Before trusting a number:

- `curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/` must say 200.
- `shot.mjs` prints the route it landed on. If it is not the route you asked
  for, the image is worthless.
- A 200 is not enough: a stale server answers with old code. Check the served
  module: `curl -s http://localhost:5175/src/routes.ts | grep -c <NewScreen>`.
- `vite.config.ts` sets `strictPort`, so a second server fails loudly instead of
  quietly binding 5176 while the stale one keeps answering 5175.
- `scripts/diff.py` refuses a render that is nearly one flat colour. That guard
  was proven on the scaffold: the placeholder page is rejected, not scored.
- A harness fault looks exactly like a build fault. Reproduce any finding by
  hand with `shot.mjs --js` before believing it.

### Rule 6, a node id is a starting point, not a fact

Ids move between turns (in the client file `1627:103111` became `1769:93628`, same
frame). Every id below is where to start looking. If one returns nothing, or not
what is described, `get_metadata` the enclosing section and find the frame by
name. Report the new id when one moves.

### Rule 7, a section holds more frames than any list

Any list of frames, including the map below, is a starting point. Before
building a section, pull the whole section with `get_metadata` and report what
is there: frames, hidden frames, loose instances (dropdowns and menus drawn on
the section canvas, not inside a frame), and anything the brief did not mention.

### Rule 8, containment and clipping are different tests

A check for pixels painted outside the frame says nothing about content broken
inside it. Check both: nothing escapes the frame, and nothing inside it is
clipped, sliced, overlapping or hidden under the top bar or a panel. Look at the
render, not only the numbers.

### Rule 9, Figma outranks the console document

The internal console document (`docs/Internal-Team-Console.html`) is outdated.
Figma is the current truth for this app. Where the two disagree about what a
screen is or does, build Figma without asking.

The one thing Figma does not outrank is the signed Trust and Rewards policy
(`docs/Trust-and-Rewards-Policy.html`) on scores, tiers, points and the
certificate. Those conflicts are still reported, not resolved.

### Hidden frames

A hidden frame cannot be screenshotted: `get_screenshot` returns a **1x1 PNG**
while its JSON still reports `original_width` and `original_height` (checked
here on `2017:152956`). Only `get_metadata` can read one. Check a node renders
before planning work on it. Hidden frames are not built unless asked.

---

## Stack and tooling

Vite, React 19, TypeScript, Tailwind v4, React Router 7, Geist. No other UI
libraries. Copied from `client/` so the way of working is the same.

| | |
|---|---|
| `npm run dev` | http://localhost:5175 (respondent 5173, client 5174), `strictPort` |
| `npm run build` | `tsc -b && vite build` |
| `npm run shot -- <route> <out.png> [--full] [--js code] [--click sel]` | render at 1440 in headless Chromium |
| `npm run diff -- <figma.png> <render.png> ...` | % of differing pixels, bounding box, row bands |
| `node --experimental-websocket scripts/healthcheck.mjs` | every route in `scripts/routes.txt` renders, no errors |
| `node --experimental-websocket scripts/clickaudit.mjs` | every control does something |

The client app had no diff script; its diffs were ad hoc Python. `scripts/diff.py`
is that Python made permanent, with the Rule 5 guard. The session key the
scripts set (`fi-internal-session`) is a placeholder until sign-in exists.

---

## The shell, measured

Design width **1440**. Every console screen is the same shell, measured off
Dashboard (`1872:70720`) and Studies (`1874:72973`):

| Part | Measurement |
|---|---|
| Sidebar ("Sidebard") | 230 wide, `bg-1` (#f8f8f7), a 1px right edge #f0f0ef at x 229 (no variable) |
| Sidebar header | the H mark and "Admin Panel", text band y 20-51 |
| Sidebar groups | "Users": Dashboard, Studies, Participants, Clients, Support. "Platform": Finance, Pricing & Rewards, Sub-Admin. Item rows 50 apart (text at y 132, 181, 232, 281, 331; Platform at 419, 472, 520) |
| Active nav item | a white pill (#fcfcfc on bg-1) from x 16 to 213, about 45 tall, label and icon in `brand-primary` |
| Badges | Dashboard "2" and Support "7", green pills |
| Expanded groups | Participants opens to "All Participants" / "Verifications"; Clients to "All Clients" / "Verifications", with an orange dot on the active child |
| Account card | bottom of the sidebar, text band y 896-934: avatar, name, "Master Admin" |
| Title bar | x 230, 1210 x 70, page colour, 1px `stroke-input` (#e9e8e7) hairline at y 69. Three slots: breadcrumbs (24, 19), a centre "Stepper Slot" and "Right CTAs" |
| Content | starts x 254, y 94 (24 inside the title bar and sidebar), 1162 wide |
| Page | `bg-0` |
| Side panel | 600 wide. Modal: 460 wide |

The sidebar is a component with **12 variants** (Assets, `1857:127510`): Dashboard,
Studies, P - All Participants, P - Verifications, C - All Clients, C - Verifications,
Support, Finance, Pricing & Rewards, Sub-Admin, Account, and **P - Micro-panels,
hidden**. The title bar is its own component, `1857:131485`.

**The sidebar is 960 (or 1008) tall in every frame, never the frame's height.** On
the 1912-tall Dashboard it stops at y 959 and the page colour runs on below it. It
reads as a fixed sidebar drawn once; build it fixed to the viewport, not stretched.

---

## Primitives (turn 1), measured

All in `src/components/ui`, shown in every state on `/kitchen-sink`. Reuse them;
do not draw a second version of any of these.

| Primitive | Measured |
|---|---|
| Button (`Button.tsx`) | lg 48 / md 38 / sm 32, Radius/M. primary: gradient yellow-300 > yellow-400 (15%) > yellow-500, 1px yellow-100 top, 3px yellow-700 base. secondary: cta-secondary. tertiary: bg-0, 1px cta-tertiaryStroke. danger: #ea5a00 with a 3px #dc5500 base (`state.destructive*`, from an sds variable on 2036:146119). success: state-success |
| IconButton | 38 (and 32, 28 in panel title bars), 1px cta-tertiaryStroke, Radius/S |
| Input / PasswordInput / SearchInput / Select | label 14 subtitle in a 20 line, 4 gap, box 48, Radius/M, 1px stroke-input, bg-0, 12 in, 16px text. `size="sm"`: 38, Radius/S, 14px (dialogs). Eye 28 at md, 20 at sm |
| TextArea | same edge, 12 padding, 3 rows by default |
| Toggle | 40 x 24 track, 18 knob 3 in. Off stroke-input / subtitle knob; on brand-primary / bg-1 knob |
| Checkbox | 16, Radius/XS (from "Checkbox-default"; its checked state is not drawn) |
| Radio | 18 ring, 1px text-body (selected state is not drawn; green dot assumed) |
| UnderlineTabs | 42 tall, 16 sides, Body 16, brand-primary text and 1px underline when active over a 1px stroke-input baseline; 24px count pill, filled bgAlt-2 active, ringed idle |
| SegmentedTabs | 48 track bgAlt-2, Radius/M, 4 padding; active pill green-200, 40 tall |
| Tag | 28, Radius/Full, 10 sides, 14px; success / warning / danger / neutral / outline / info / brand |
| CountBadge | 24, Radius/Full |
| Chip | 28, Radius/S, bgAlt-2, remove cross |
| OptionTile | 48, Radius/M; selected cta-secondary, idle 1px tertiary |
| Avatar | 24 / 32 / 40 / 48 / 64, Radius/S |
| Table | 1px stroke-input box, Radius/L; header 52 on bg-1, 14 subtitle, 16px sort arrow; rows 64 with stroke-1 rules; 16 cell padding |
| Pagination | 38 squares; arrows ringed; current page yellow-300 |
| SidePanel | 600 wide, as tall as its content (the frames draw 470, 517, 597), opens top right, Radius/XL left corners; 56 title bar (Title-S, 28 close), stroke-1 rules, footer of two 48 buttons 16 apart |
| Modal | 460, Radius/XL. centred: Title-L, body max 310, 40 above and below; titled: 56 title bar, blocks 24 apart. Bottom bar 80: rule, 16, 48 buttons 16 apart |
| SuccessModal | 160 yellow-100 disc, 92 yellow-500 badge with 4px brand-primary rim, white tick; Title-L in a 35 line; one 48 button |

### The shell, as built
- Sidebar: fixed to the window, 230, bg-1, right edge `shell.edge`. Header 73 tall (mark 26 x 32, "Admin Panel" Title-L medium). The asset sheet draws a stroke-1 rule under the header; **no screen frame does**, so it is not drawn.
- Group labels: 14px text-body, 17 above "Users" and 14 above "Platform", 6 above the first row. Rows 48, 2 apart.
- The active row is a white pill with a 1px `shell.edge` ring. A parent with sub-items does not get the pill: it turns title colour and its child is lit, on a 2px `shell.rail` guide with a 6px dot.
- The account card: 60 tall, 16 in, stroke-1 ring, 40 avatar. The name is "Peter Devian"; the asset and the Dashboard and Review frames say "Peter Davian".
- **The nav lights by route, never copied from a frame** (`app/nav.ts`). Corrected: Studies Ongoing and every Review frame light Dashboard (built: Studies); the client verification detail lights Participants > Verifications (built: Clients > Verifications).

### Turn 1 diffs at 1440
Sign In 0.60%, Reset Password 0.50%, Check Email 0.75% (with the demo line), Set New Password 0.58%, Password has been updated! 4.77%, sidebar 3.8% to 4.8% (icon glyphs redrawn, text antialiasing), title bar 0.40%, Create Ticket panel 8.07%, Mark Resolved? 5.71%, Restrict 7.06%.

---

## Dashboard (turn 2)

One screen, five tab states (`/dashboard`, `?tab=onboarding|studies|support|manage`).
Measured: the four frames at 960 differ from each other by 0.62% to 2.09%, every
differing pixel at y 260 or below (the tab underline and the groups); the tiles,
heading and shell are pixel identical in all five. The section holds exactly the
five frames; hidden inside them are the title bar's back arrow, "Home /" crumb,
stepper and right-hand CTA and icon button, a trailing icon button on the tab bar,
a 16px chevron after every "View", a duplicate "24 screeners" / "32 screeners"
on the first line of two screener rows, and the rows of each collapsed group.

**What each figure counts (stage two must derive all of these from one place):**

| Figure | Drawn | Counts |
|---|---|---|
| Screeners To Review | 264 | screener applications waiting for a team decision, across all studies (workflow 29, 32) |
| Onboarding To Verify | 36 | participant identity and profession checks plus client business checks that failed automatic verification and wait for a person (workflow 3, 18) |
| Open Tickets | 7 | support tickets not answered by the automatic first line and not resolved (workflow 56); matches the Support nav badge |
| Live studies | 18 | studies approved and running; matches "18 Studies" on Studies > Ongoing |
| Tab All | 274 | every pending action below |
| Tab Onboarding | 4 | Identity Verification + Client-Business Verification |
| Tab Studies | 264 | Screeners to review (+ Refunds, which this tab also lists) |
| Tab Support | 3 | new tickets, participants + clients |
| Tab Manage | 6 | No-show verifications + Flagged/reported accounts (+ Refunds, hidden in this frame) |
| Group counts | 16, 2, 264, 2, 2, 2, 2 | the rows waiting in that group |
| Nav badge Dashboard | 2 | not explained by any frame |

**The figures disagree with each other as drawn:** the tabs add to 277, not 274;
Identity Verification is 16 on All and 2 on Onboarding; Onboarding To Verify is 36
while the Onboarding tab says 4; Open Tickets is 7 while the Support tab says 3. Each
state shows its own frame's numbers (`src/mock/dashboard.ts`).

**Shortcuts.** Every group's "View All" and every row's "View" opens the item in its
home module: Identity Verification and Flagged/reported accounts to Participants >
Verifications; Client-Business Verification to Clients > Verifications; Screeners to
review to Studies (rows to the study); New Support Tickets to Support (rows to the
ticket); Refunds for unfilled studies to Finance > Refunds (rows to the refund);
No-show verifications to Studies (rows to the study: no frame shows a no-show queue).
The tiles are not links. **No chart anywhere**; nothing needs a library.

The actions pending queue is the Dashboard. (The console document's "every live
study on a row" list is superseded, Rule 9.)

Diffs at 1440 (sidebar included): All 2.99%, Onboarding 1.80%, Studies 3.07%,
Support 1.57%, Manage 2.43%.

---

## Studies list (turn 3)

One screen, three tab states (`/studies`, `?tab=ongoing|completed`): To Review
`1978:97400`, Ongoing `1874:72973`, Completed `1906:19984`. The toolbar, count line
and table frame are in the same place on all three; between tabs only the active
segment, the sort label, the count line and the table columns change. The same six
studies appear on every tab, and the second row is drawn in its hover state
(bgAlt-1) on all three.

| Tab | Count line | Columns (width) | Row action | Row opens |
|---|---|---|---|---|
| To Review | "6 studies to be reviewed" | Study Name 445, Type 200, Participants 140, Submitted on 140, Total Cost 140, Review button | Review | the review screen, `/studies/review/:id` |
| Ongoing | "18 Studies" | Study Name 555, Type 180, Completed 125, Last Activity 140, Applications 160 (yellow chip with a chevron) | the chip | the running study, `/studies/:id` |
| Completed | "18 Studies" | Study Name 695, Type 200, Completed 140, Date 125 | none | the completed study, `/studies/:id` |

Sortable heads (the 16px arrow): Participants, Submitted on, Total Cost; Completed,
Last Activity, Applications; Completed, Date. Search: "Search studies". Filter:
"All Studies" (its options are not drawn). Sort: "Sort: Recent First" (To Review,
Completed), "Sort: More applications" (Ongoing); the other options are not drawn.

Hidden in the frames: an "18 Studies" label in the toolbar, the title bar's right
CTA and icon button, and on Ongoing a 64px column of row icon buttons (a row menu;
the "Ongoing Study options" popover drawn in the Manage sections is its likely menu).

Counts: Ongoing's "18 Studies" agrees with the Dashboard's "Live studies 18".
Completed also says "18 Studies" (a copy of Ongoing's line, as drawn). Each tab draws
six rows whatever its count. No column shows who on the team owns or last touched a
study: no assignee, no "last touched by", anywhere on the list.

Primitive changes this turn: the table's edge is stroke-2 (measured), it can draw a
row in its hover state, and the search icon is 24. Sign in and the Dashboard were
re-swept: unchanged.

Diffs at 1440: To Review 2.28%, Ongoing 2.00%, Completed 1.87%.

---

## Review a new study (turn 4)

One screen (`/studies/review/:id`, `?tab=audience|screener|study|payment|revisions`),
six tabs, the Study tab switched on the study's type, plus two overlays. Section
`1982:104844` holds 13 frames, all visible: About `1982:104845`, Audience
`1984:114713`, Screener `1984:114217` (misnamed "2.1.0 About - New Study"), Study in
six types (`1984:119698` video, `122634` survey, `129204` group video, `130558`
in-person, `132092` in-person group, 1001 tall, `134413` diary), Payment
`1984:120589`, Revisions History `1984:122012`, "This study has been published live!"
`1982:109978` (460) and Request Changes `1982:110039` (600 panel).

**Layout, measured.** This screen sits **16** inside the shell, not 24
(`<AppShell className="p-4">`). Header card 1178 x 94 on bgAlt-1: 83 x 62 thumbnail,
title, the type tag (filled), then ringed 32px pills for participants, cost and
"Submitted:". Under it an 802 panel (stroke-1, Radius/L, at least 748 tall, grows
with its content) with a 44px bg-1 tab strip (icon tabs 101, 125, 123, 100, 121, 183
wide) beside the 360 client card. Title bar: three crumbs and the two CTAs, the right
one ending 16 from the window edge.

**What each tab holds.** About: title, description, type, study time, thumbnail.
Audience: targeting as pills in three groups. Screener: the questions with each
answer's verdict (Correct / Incorrect / May Select / Must Select). Study: by type,
availability (video, in-person + address), group sessions (group video, in-person
group + address), the survey form, or the diary setup and days. Payment: overview,
billing, transactions. Revisions History: what was sent back and when.

**Actions drawn: two.** "Request Changes" opens the panel: one required-looking text
area ("Describe the required changes in detail"), Cancel / Send. "Approve to Publish"
opens the published dialog, "Done! View Details". There is no reject, no decline, no
edit, and no note on approval. No frame shows what follows Send; the Revisions History
tab draws a "Requested changes." entry, so Send lands there. "Done! View Details" goes
to the study (`/studies/:id`). Nothing drawn shows the study leaving the To Review
list or the client being notified, though the published dialog says it is "showing to
targeted participants". **Everything in the tabs is read only**: values are drawn as
text, pills and filled boxes with no edit affordance; the hidden layers confirm it
(the weekly-hours toggles, add and delete icon buttons, and the diary "add" CTA are
all switched off).

**Type variants** change the Study tab and the header's type tag, nothing else. All
six draw the same study, client, cost and breadcrumb.

**Below the fold, unreadable.** Screener and Survey hold nine question blocks and
Diary three days, but the 960 frames cut off after the fourth question (second day)
and a clipped layer screenshots as 1x1. The five further question types (a long text,
a slider with Price / Value / Description, a drag-to-rank list, a file upload and a
matrix) have their labels inside instances, so their strings cannot be read. Built:
what the frames show. "Survey Form: 10 Questions" over nine blocks, as drawn.

**Money, as drawn (stage two must reconcile):**

| Where | Figure |
|---|---|
| Header, and the list's Total Cost for this row | $12,960 |
| Payment: Total Cost | $16,510 |
| Billing lines: Platform $100 + Recruiting $500 + Incentives $2,500 + Moderation $250 | add to $3,350, not $16,510 |
| Less incentive deposit $100 x 30 = -$3000, net payable | $13,510 (16,510 - 3,000) |
| Transaction "Incentive Deposit Paid" $3,000 | captioned "$20 x 30 participants" (= $600) |
| Participants | 10 (header, Audience), 25 (billing), 30 (deposit), 75 (the list) |
| Incentive | "$700", "Suggested: $700" beside $100 a participant in billing |

Against Pricing & Rewards: Platform fee $100 and Moderation fee $10 agree; Recruiting
is $20 a participant here and $25 base there.

Hidden on every tab: a "Review this study required / Sep 10, 2026, 11:00 AM" banner
with two CTAs and an icon button, a stray "Rate John M for this study" block; on About
"Study Management Control / Manage yourself (Self-managed)"; on Payment "Less: Balance
Incentive Refund $100 x 5 participants -$500" and auto-debit text.

Shared changes this turn: the title bar (right slot 16 from the edge; crumbs written
"Label /"; without a stepper the crumbs take the free width), the success button's
3px base, a green tone on the success dialog, the type tag's `filled` look and 14px
sides, new icons. In the kitchen sink. Sign in, Dashboard and Studies re-swept:
unchanged (0.50-0.75%, 1.57-3.07%, 1.87-2.28%).

Diffs at 1440 (sidebar included, where the frames light Dashboard): About 3.08%,
Audience 3.44%, Screener 3.85%, Study video 3.52%, survey 3.71%, group video 2.83%,
in-person 4.04%, in-person group 3.97%, diary 3.57%, Payment 3.44%, Revisions 3.35%,
published dialog 4.70%, Request Changes 2.42%.

Not matched: the Receipt button does nothing yet (no receipt is drawn); icons are
redrawn; the dialog and panel sit over a dimmed page, which no frame shows.

## Manage a study (turn 5): shell, Overview, Manage Study

One screen (`/studies/:id`, `?tab=manage`, `?state=paused`) for all six types. Pulled:
the six Manage sections (`1932:106947` survey, `1952:76684` group video, `1952:80461`
video 1:1, `1961:179867` diary, `1961:182277` in-person, `1961:184932` in-person
group) and the loose Paused frame `1952:75945`. Ids unchanged from the map. Built this
turn: each section's "2.1 Study Overview - Studies" and "Manage Study" frames, the
Paused frame, the Pause Study panel `1952:76517` and the loose "Ongoing Study options"
menu. Loose on the canvases: that menu in every section (220 x 131; the diary copy
220 x 207), "Bottom Bar" instances (hidden in group video), three "Question menu"
instances and a type filter dropdown in survey.

**Each section draws a different study, and each is a row of the Studies list**, so a
list row opens its own section: st-social survey, st-fitness group video, st-goal
video 1:1, st-pay diary, st-sleep in-person, st-travel in-person group
(`src/mock/manage.ts`).

**Layout.** 24 inside the shell, except the video 1:1 frames (the ones with
"Congrats!"), which sit 16 inside: built as drawn. Header 1162 x 214 on bgAlt-1 (243 x
182 image; type tag; "Recruiting", copy-link and options buttons; Title-L; duration and
industry tags; Completed, Qualified, Days Remaining, Progress). 12 below it a panel
that fills the window: the 44px strip (Overview 101, Manage Study 139, Matched 97,
Recruited 104, Results 88, Pay 60) and the tab's content 16 in. Matched and Recruited
are turn 6, Results turn 7, Pay turn 8; they open empty for now.

**Overview:** four yellow-30 tiles (Progress with a ring, Completed, Qualified, Days
Remaining), Study Description, Share Link with Copy, Active Since, and the About
Client card (304) with "Go To Profile". **Manage Study:** four read-only blocks:
About, Audience ("Estimated Audience: 1K" and ten pills), Screener ("Screening: 8
inputs") and Study (a one-pill summary by type, "Incentive: $700").

**Banners (two drawn).** "Congrats! 30 required participants are fulfilled and
completed now!" (yellow-40, yellow-200 edge) on every video 1:1 frame: no control, its
two CTAs are hidden. "You have paused this study with stopping recruit new participants
further." (red-100, red-200 edge) with "Mark as completed" and "Resume Study"; drawn
1152 wide, 10 short of the header. The paused frame also hides a Congrats banner.

**Controls.** Live: copy link (header and Share Link), the options menu, Go To
Profile, the tabs. The menu: Copy Study Link, Pause Study, Duplicate to Drafts; the
diary copy also shows Stop-complete Study and Edit, which the other five hide. Pause
Study opens a 600 panel ("Pause Study Participation?", a Reason box, Cancel / Yes,
Pause Study). Switched off (hidden layers) on Manage Study: an Edit button on each of
the four blocks, two "Set Criteria" links, a "Study Management Control / Manage
yourself (Self-managed)" row; on Overview a "Study Control / Self-managed (DIY)" block
and a "Screened 51" figure. **Paused** adds the banner, drops the About Client card and
widens the tiles and link box to the full panel; the status tag still says
"Recruiting". Only the Pause Study panel is drawn as a way to pause.

**Figures do not agree across screens.** Every header says Completed 20 /30, Qualified
35 /60 applied, 36 days, 66%, whatever the study. The Ongoing list gives the same six
studies 20/60, 16/50, 32/80, 24/40, 18/60, 36/50 and 68, 25, 48, 54, 18, 62
applications. Review gives the goal-tracking study 10 participants and 30 minutes; its
managed header says 1 hour and a target of 30, its About block 30 minutes. The survey
Overview tile says Qualified 1000 /1200 against 35 /60 in its own header. "Congrats! 30
... fulfilled" sits over Completed 20 /30. Three About blocks carry another study's
title or description (survey, video 1:1, in-person). Titles are sentence case here and
title case on the list. Built as drawn.

Built choices, not drawn: Resume Study clears the paused state; Mark as completed goes
to Studies > Completed; Duplicate to Drafts, Stop-complete Study and Edit close the
menu and do nothing (no destination is drawn; the Edit screens are the hidden,
discarded section).

Shared changes: the study tab strip (`PanelTabs`) and `Pill` moved to
`components/app`, the content column is `min-h-screen` so a panel can fill the window,
tokens `red.100` / `red.200`. Sign in, Dashboard, Studies and Review re-swept:
unchanged.

Diffs at 1440: Overview survey 2.89%, group video 2.96%, video 1:1 3.81%, diary 3.01%,
in-person 2.84%, in-person group 2.92%, paused 2.90%; Manage Study survey 2.26%, group
video 2.28%, video 1:1 2.56%, diary 2.29%, in-person 2.28%, in-person group 2.24%;
Pause Study panel 6.06%. Nothing in these frames is cut off by its frame.

## Manage a study (turn 6): Matched and Recruited

Frames, from the six Manage sections pulled in turn 5 (ids unchanged): in every
section "Auto-Matched" and "Invited - Auto-Matched" (1440 x 1401); "Recruited" once in
survey `1932:107511` and diary `1961:180425`, twice in the four session types
(applications 1440 x 1176, scheduled or sessions 1440 x 1272). Overlays, drawn once in
the survey section: Respondent Profile Details `1932:109128` and `1932:109286` (600 x
913), "Invite to apply?" `1932:110861`, "Sent" `1932:110882`. Measured: Matched differs
between sections only in the header (2.51%, rows 29-291); the applications table is the
same in all six but for the first name (2.46-2.69% between sections, header included).

**Matched** (`?tab=matched`, `&seg=invited`): "Surfaced from the Pool who are matching
with target audience criteria." Segments Matched / Invited; dropdowns "Sort: Score",
"Tier: All", "Location: All" (options not drawn); nine cards, three across. A card:
initial, name, role, match score, tier, sometimes "Profession-Verified"; "Invite To
Study" and "View Profile". On Invited the two buttons become a flat "Invitation Sent!".
Invite asks ("Invite Ferry to apply for this study?", Cancel / Send Invite), then
confirms ("Invitation has been sent!", Done!). View Profile opens the 600 panel; its
footer is "Invite To Study" or a disabled "Invited to this study". No bulk action.
Hidden on each card: a 104px tag, a 230px line and a 38px icon button; on Invited a
163px CTA per card.

**Recruited** (`?tab=recruited`, `&view=applications`): "List of respondents applied on
this study and track their statuses".
- Survey, diary: the applications table alone, "Status: All" and "Tier: All" (38px).
- Video 1:1, in-person: segments Scheduled / Applications. Scheduled: Name, Role,
  Score, Session Time, 60px rows; the video frame draws "Join Now" on the first row.
- Group video, in-person group: segments Sessions / Applications. A session card:
  date, time, address (in person), "4 / 10 Seats", six initials, "View Participants".
- Applications: Name, Role, Status, Score with tier; ten 52px rows, pagination to 10.
Statuses drawn: **Applied, Qualified, Disqualified**. The survey Recruited frame draws
the "Congrats!" banner.

**Where rows lead (turn 7, placeholders now):** an application or booking opens the
respondent (`/studies/:id/respondents/:rid`); View Participants opens the session
(`/studies/:id/sessions/:sid`). The Qualify / Disqualify bar ("Screener CTAs"
`1932:110903`: to decide, qualified with Undo, qualified, disqualified with Undo; "The
action can be undone within 1 hour only after it is taken.") sits on the respondent's
screener page, and the no-show dialogs ("Mark [individual] as No-show", "Mark back
[individual] as Completed from No-show", the hidden "Mark all as No-show" `1952:80380`,
"Didn't everyone attend?") on the session pages. None open from these two tabs, so
they are built with those pages in turn 7, not here.

**Against the workflow.** The workflow screens in two stages (a pre-screener, then the
full screener, with a borderline answer held for review). The designs draw one
decision: Applied becomes Qualified or Disqualified when a person presses the bar. No
"held for review", no automatic pass or fail, no terminated state. "Pre-screener - Qn"
appears only as question labels on Review; a "Screened 51" figure is hidden in every
header.

Not reachable as drawn: the "Invited to this study" panel (Invited cards have no View
Profile); it is in the kitchen sink. Dead for now: "Join Now", "Reviews >" in the
panel. All three dropdown sets show only the drawn option.

Shared changes: `TierTag` (colours measured, no variable exposed), `Select size="sm"`,
tokens `bg.3`, `tier.*`, `orange.100`, `red.50`, `text.disabled`. Everything signed off
re-swept: unchanged.

Diffs at 1440: Matched survey 3.98%, group video 3.96%, Invited 3.01%; Recruited
survey 3.60%, diary 3.71%; applications group video 2.33%, video 1:1 2.31%, in-person
2.30%, in-person group 2.34%; Sessions group video 1.96%, in-person group 2.37%;
Scheduled video 1:1 2.50%, in-person 2.44%; Invite dialog 7.68%, Sent 4.66%, profile
panel 6.44% and 4.55%. Nothing is cut off by its frame.

## Manage a study (turn 7): Results, the respondent and session pages, attendance

Frames, from the six Manage sections (ids unchanged): "Results" in all six;
"Recruited respondent result" in all six (the applied respondent: Screener, Activity,
the Qualify / Disqualify bar); "Completed respondent result" (survey, diary);
"Scheduled Study respondent(s)" and "Study Result - completed" (the four session
types); "Activity of respondent" in all six; "Recruited - activity" (the two group
types). Overlays: Rate (`1932:109444`, `1952:80275`), Download Sessions Results
`1952:80341`, "Mark [individual] as No-show" (`1952:83027` one-to-one, `1952:80402`
group, `1961:188283`), "Mark back [individual] as Completed from No-show"
`1974:100123`, and three state sheets: "Screener CTAs" `1932:110903`, "Marked
Completed" `1952:83058`, "Group-session - mark all completed" `1952:80442`, "After
Started state" `1961:184899`. Hidden: "Mark all as No-show" `1952:80380`.
Measured: the applied respondent page differs 0.73-0.95% between five sections
(header only); group activity 0.56%.

**Routes.** `?tab=results` on the study. `/studies/:id/respondents/:rid`: `a*` from
Applications (applied), `b*` from Scheduled (booked), `r*` from Results (finished).
`/studies/:id/sessions/:sid`, `?state=completed`, `?tab=activity` for group sessions.

**Results.** Tiles, a summary card with Download, "Completed Study Respondents" (Tier:
All), ten rows with "Rate Now" or "Rated", pagination, and the "STUDY VERIFICATION
CERTIFICATE / 21 of 21 completions verified human" card with Download. Survey, diary,
video 1:1: Completed 20 /30 required, Avg. Trust Score 92, Rated By You 11 /20
completed. In-person: Sessions Completed 2 /3, Participants Completed 20 /30 required,
92. Group types: Completed 10 /10 required, 96, rows grouped under S1 / S2 with "View
Result". In-person types say "Notes Summaries / Get all the Notes results archive".
The wording is the client's ("Rated By You", "Rate Now", "you and other clients").

**Qualify / Disqualify** lives only under the Screener tab of an applied respondent.
"Choose Qualify for further study or Disqualify to reject from here. The action can be
undone within 1 hour only after it is taken." States drawn: to decide; qualified with
Undo; qualified, Undo gone; disqualified with Undo. Nothing drawn shows what the
decision changes elsewhere beyond the Applications status tag.

**Attendance, as drawn.** A six-digit "Verification PIN" (152438) is shown on every
session, shared with the participant; the activity log records "Verified with PIN by
... (participant)" and then "Marked as completed by client (you)". So the code is the
participant's proof and a person adds a second confirmation by hand ("Mark as
completed for an additional confirmation"). One PIN serves a whole group session.
One-to-one: "Mark No-show" / "Mark Completed", then "Marked John as completed!" or
"Marked John as No-show." each with Undo, and completed again with the Undo gone.
Group: per row "Marked completed by participant", "Marked as No-show" (video) or
"Marked No-show by client" with "Mark Completed" beside it (in person), or both
buttons; plus "Mark all as Completed".

**No-show wording.** One-to-one: "This will not allow John to get paid for this study
and will be confirmed  by our team further from Jenna as well." and after: "You have
marked John as no-show (absent) and it wll be confirmed by team." Group: "This will
not allow Jenna to get paid for this study." **Undo:** one-to-one has an Undo button
(no time limit drawn); group in-person has "Mark Completed" on a no-show row, which
opens "Had Jenna T. completed? ... This will mark Jenna as completed and will get paid
the reward incentive. This cannot be undone." Group video draws no way back.

**Policy.** No Trust Score figure, deduction or points penalty appears on any of these
frames or dialogs: the no-show dialogs speak only of payment. Nothing here to compare
with the policy's No show -4 / Late cancellation -2; if a no-show is to cost score,
no design says so at the point it is marked. There is no cancel-session control at all.

**Slips kept as drawn.** The rate panels are titled "for GLP-1 Care Plans, Oncologist
View" and "for E-commerce User Behavior Study"; the survey's finished bar says "The
diary study has been successfully completed by John."; "succefully"; the in-person
card says "Liam K." beside John M; the activity banner says "Rate Ferry" beside "Rate
John"; Download Sessions gives both sessions the same date; Sarah K is a Housewife in
the session and a Human Resource Manager on her page; group Results scores Nina S 64
Silver where the others say 82 Gold.

Built choices, not drawn: Undo returns the bar to its undecided state; Send-style
buttons with no drawn result (Download, Download Files, View Video Recording,
Transcript, Join Now, Finish, Submit on a rating) do nothing or close. "Mark all as
No-show" (hidden) and the "After Started" card states have no way in: the card states
are in the kitchen sink, the hidden dialog is not built. The uploaded-file thumbnail
is a grey block.

Shared changes: none to existing primitives (new icons; `Tile` exported). Everything
signed off re-swept: unchanged.

Diffs at 1440: Results survey 4.72%, group video 4.68%, video 1:1 5.37%, diary 4.78%,
in-person 4.67%, in-person group 4.69%. Applied respondent 5.35-5.52% (six types).
Finished: survey 5.38%, diary 5.78%, video 4.59%, in-person 4.71%. Booked: video
4.15%, in-person 3.62%. Activity: survey 3.91%, diary 5.02%, video 4.83%, in-person
4.98%, group applied 4.01% / 4.79%. Session before: 2.42% / 2.00%; after: 4.50% /
2.80%; activity 3.71% / 3.72%. Dialogs 8.8-13.2%, rate panels 4.41% / 3.51%, Download
Sessions 7.74%. Nothing is cut off by its frame.

## Manage a study (turn 8): Pay, and the completed study

Frames: the Pay frame in each of the six sections ("Pay - Due as completed"
`1932:107773` survey, "Pay while ongoing" `1952:77992` / `1961:180673` / `1961:183186` /
`1961:186246`, "Pay" `1952:81376`), identical but for the study header; and the
Completed Study Flow section `1932:96425` (survey only): Overview `1932:96426`, Results
`1932:96711`, "Pay - Due as completed" `1932:97043`, three respondent pages, "Rate
Ferry L." `1932:98073`, "RATED" `1932:98139`. Loose there: "Ongoing Study options"
`1932:98210` (200 x 92: Copy Study Link, Download All Data) and `1932:98217` (186 x 169,
misnamed: a study-type filter with checkboxes All, Survey, Video Call, Group Video
Call; the map had it as 160 x 191).

**Pay** (`?tab=pay`): "Payment Overview": $350 on a yellow-30 card, "Payment Due by Aug
10, 2026", "If not paid, will be auto-debited from •••• 4242"; Deposit Paid $3,000;
Total Cost $3,850. Billing: Platform Fee $100, Recruiting Fee $20 x 25 = $500,
Incentives $100 x 25 = $2,500, Moderation Fee $10 x 25 = $250, Total cost $3,350, Less:
Incentive Deposit $100 x 30 = -$3000, Net payable cost $350. Transactions: Incentive
Deposit Paid $3,000, "Aug 5, 2026, 10:24 AM", "$20 x 30 participants", Receipt. **It is
the client's bill, read only. The only control is Receipt. No respondent payout is
listed, approved or released here**, and nowhere else in Manage.

**The figures disagree as drawn:** the Total Cost tile says $3,850 and the list says
$3,350 (the tile is 3,350 + 500, the hidden refund line); "$20 x 30" captions a $3,000
deposit; billing counts 25 participants against a target of 30. Against Review's
Payment tab for the same study (goal-tracking): Total Cost $16,510 / net $13,510 there,
$3,850 / $350 here; the fee lines, the deposit and the "$20 x 30" caption are the same;
Review adds "Incentive $700 (Suggested: $700)" and "AutoPay On", absent here. The
Studies list says $12,960.

**Completed study** (`/studies/:id?state=completed`, `&tab=results|payments`; reached
from Studies > Completed and from "Mark as completed"). A shorter header (156 x 117
image, status "Completed", no figures), a two-item menu, and three underline tabs with
no panel: Overview (Success 100%, Completed 30 /30 required, Qualified 35 /60 applied,
Closed 15th Aug; description; share link; Duration; Audience, Screener and Study
blocks; About Client), Results (as the running one, 30 /30 required, 11 /30 completed,
three pages), Payments (Total Paid $3,350; "Total cost paid", "Paid: Incentive Deposit
-$3000", "Paid: Due Payment -$350"; two receipts, "Incentive Deposit - Paid" and
"Billed Invoice - Paid $350"). Gone: Manage Study, Matched, Recruited, the pause and
duplicate menu items. Still possible: copy the link, download all data, download
results, the certificate and receipts, rate a respondent, read a rating ("RATED": "You
have rated on Aug 24, 20206").

**Pay states drawn:** due while running (visible, all six); paid, on the completed
study (visible). Hidden: "Pay while ongoing" on the completed flow (Payment Due $1,000,
Total Cost $4,000, "As on today, 11 Aug, 2026"); "Pay - Due as completed" with "Payment
Due by 12 Aug, 2026"; and "Payment" in group video, video 1:1 and in-person: the
client's checkout ("Marked completed on 10 August, 2026, 10:00 PM", "Invoice
Breakdown", "3% merchant processing fee applies when using a credit card.") with "$350
paid successfully!" `1952:83095`. Those are the client's own pay screens. Nothing drawn
moves a study between states from the console: the client pays, or is auto-debited.

**Refunds:** not raised here. Every Pay frame hides one line, "Less: Balance Incentive
Refund / $100 x 5 participants / -$500". Refunds are in Finance (turn 14); nothing
links this tab to it.

Slips kept: the survey frame's "Payment Due byAug 10, 2026"; `1932:97043` lights
"Results" over the Payments content (built: lit by route); the completed respondent bar
says "The survey study has been successfully completed by the respondent."; the activity
banner "Rate Ferry" / "Rate John".

Built choices: "Mark as completed" on a paused study now opens the completed study;
"Download All Data", Download and Receipt do nothing; the type-filter popover is not
wired (the list's "All Studies" dropdown still shows one option); only the survey is
drawn completed, the other five use the same layout unchecked.

No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: Pay survey 2.67%, group video 2.44%, video 1:1 3.26%, diary 2.78%,
in-person 2.42%, in-person group 2.60%. Completed: Overview 4.09%, Results 4.29%,
Payments 3.12%, respondent result 5.42%, activity 3.92%, screener 5.93%; Rated panel
6.69%. Nothing is cut off by its frame.

## Participants: the All Participants list (turn 9)

Section `1992:101340` holds 28 frames (27 visible) and 9 loose instances. This turn:
"Participants - Active" `1992:101341`, "Participants - Deactivated" `2003:134529`,
Advanced Filters `2003:133781`, Reviews `1992:103368`, Invite To Study `1992:103508`,
Sent `1992:103806`. Loose, and what they really are: "Last active" `2003:133961`
(Today, Last 7 days, This Month, Last 30 days, Last 3 months), "profession verified"
`2003:134036` (All, Profession Verified), "gender" `2003:134101` (All, Male, Female,
Other), "Tiers" `2003:134356` (checkboxes: All Tiers, Platinum (90+ score), Gold (70 to
90 score), Silver (up to 70 score)); and two more named "Last active" that are action
menus: `2022:175927` (Invite To Study, Send E-mail, Deactivate Account) and
`2024:179609` (Send E-mail, Reactivate Account). Three "My Studies / Scheduled / Type
Filter" instances belong to the profile. The rest of the section is the profile and
its modals (turn 10).

**The list** (`/participants`, `?tab=deactivated`): segments Active / Deactivated
(280); the count ("126,872 active participants" / "10,572 deactivated participants");
a 38px toolbar: search 370 ("Search participants by name or role..."), "Advanced
Filters" 150, "Last Active: All" 150, "Profession verified" 164, "Gender: All" 140,
"Tier: All" 140; ten 52px rows; pagination to 10. Columns: Name (24px photo; sortable)
200, Role 250, Industry 160, Score & Tier (sortable) 150, Gender (sortable) 100,
Location 160, Last Active / Deactivated (sortable). The two frames differ 0.88%: the
segment, the count and that one heading; the same ten people and dates on both.

**Actions.** None drawn on a row or in bulk: no checkbox, no menu, no button. A row
opens the profile (`/participants/:id`, turn 10). The two action menus have no trigger
in the list frames; they belong on the profile. Hidden in both list frames: a 206 x 48
CTA and a 240 x 48 tab group in the toolbar, and the title bar's CTA and icon button.

**Marking.** Deactivated people are a separate segment, with no tag on the row.
Restricted, flagged and reported people are not marked or separable here at all: no
status column, no filter. (Reported accounts live under Verifications, turn 11.)
Certificate state does not appear. No column or mark shows who on the team acted on
anyone.

**Against the policy.** Tier bands in the filter (Silver up to 70, Gold 70 to 90,
Platinum 90+) match the policy's 50 / 70 / 90, and all ten rows sit in the right band.
Nothing disagrees.

**Panels.** Advanced Filters opens from its button: Roles, Domain, Location, Language,
each a dropdown with chips; Cancel / Save. Reviews ("Reviews of Samuel Lee", read only)
and Invite To Study ("Invite Roma To Study", three studies, Cancel / Send Invite, then
"Invitation has been sent!") are built but open from the profile, so until turn 10
they are reachable only from the kitchen sink. Restrict is not opened from this list.

Slips kept: the title bar's breadcrumb layer is named after a study but reads "All
Participants"; the invite panel is for "Roma", its confirmation for "Ferry L."; the
reviews of Samuel Lee talk about Luke, Sarah, John and Mia; all three invite studies
are tagged Healthcare.

Built choices: the four dropdowns carry their drawn options but do not filter; the
Tier menu is checkboxes in Figma and a single-choice dropdown here; Advanced Filters'
dropdowns have no options (none are drawn); search does not filter.

No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: Active 2.92%, Deactivated 2.95%, Advanced Filters 6.19%, Reviews 7.66%,
Invite To Study 8.97%, Sent 4.90%. Nothing is cut off by its frame.

## Participants: the profile (turn 10)

One screen (`/participants/:id`, `?tab=studies|wallet`, `&sub=...`,
`?state=deactivated`), three segments, ten states, plus a deactivated banner. Frames:
About `2017:148911`, deactivated About `2024:178894`; Studies: Invites To Schedule
`2017:150996`, Scheduled `2017:152230`, Applied `2017:153500`, History `2017:155171`,
Saved `2017:155992` (`2017:152956` hidden, a duplicate); Wallet: Earnings `2020:160313`,
Payouts `2021:165139`, Reward Points `2022:166544`, Referrals `2022:177272`. Dialogs:
Transaction Details `2021:165045`, two "Filters" (`2021:164690` Category + Price,
`2022:167856` Type + Points), Payout Details `2022:166340`, Deactivate Account
`2022:178767` then "Deactivate Samuel's account?" `2022:178788` then deactivated
`2024:179800`; Reactivate Account `2024:179610`, "Reactivate Samuel's account?"
`2024:179633`, reactivated `2024:179769`. Loose menus: the options menu (Invite To
Study, Send E-mail, Deactivate Account; deactivated: Send E-mail, Reactivate Account),
two period menus (All Time, This Month, Last Month, Last 3 Months, Last 6 Months) and
a sort menu (New First, Old First, Low Amount, High Amount).

Measured: Studies sub-tabs differ 1.20-1.84% (the underline, the table); Earnings vs
Referrals 3.05%; deactivated vs active About 5.43% (the banner pushes the page down
90px). The header and segments are identical in all eleven.

**Header.** Photo, name, role, place, "Cert. ID: HL-R-9F2A-3K7P", "95% profile
completed", "Profession Verified"; 95, Platinum, Reviews, copy link, options; "Last
active on Oct 5, 2026".

**What the team can do.** Reviews (read), Invite To Study, Send E-mail, Deactivate
Account, Reactivate Account. Deactivate: a form ("User will receive the deactivation
email with your given reason and won't be able to access until you activate it
back.", Reason*, the team member's password), a confirmation, then "Samuel's account
has been deactivated now and he cannot use anymore. He can contact us back to appeal
and access his account." Reactivate mirrors it, so deactivation is undoable.
**Restrict is not on this screen**, nor is flag, report, or any note field. No control
changes a score, tier, certificate, balance, points or study status: no override of
any kind is drawn.

**Deactivated** adds a banner ("Account is deactivated. This account was deactivated
as passport ID verification could not be done. Can verify it manually and reactivate.
Oct 1, 2026", buttons "Reason" and "Reactivate Account") and swaps the menu. It names
no one: not who deactivated, not whether it was a person or the system. Nothing else
on the page changes. There is no activity log of team actions anywhere on the profile.

**Trust and policy (reported, not reconciled).** The profile says 95 Platinum on every
tab; the list row for the same man says 90 Platinum; the verification detail (turn
11) draws him at 50 Silver on one tab and 95 Platinum on another. No score history is
drawn, only four ratings and three metrics. Points History against the policy: Study
+50 (policy 25), Streak +100 (policy 50), Referral +25 (policy 200), "Bonus - Joined
by referral" +100 (policy 100), "Full profile completion" +50 (policy 50). Redeem
History: "1500 points redeemed" shows -1000; all redemptions are at or above the 1,000
minimum. Payout Details: "Processing Fees $2" (policy and respondent app $2; Pricing
and Rewards draws $1.99). Earnings lists "Redeem - 10000 Reward Points ... $100",
which is the policy's 100 points to $1.

**Against the study screens.** History draws statuses In Process, Paid, Rejected, No
Show, In Review; the study side knows Applied, Qualified, Disqualified and completed /
no-show. Prices here ($100-$200) against "Rewarded the incentive $250" and "Incentive:
$700" there. Occupation is "General Physician" on About and "Software Engineer" in the
header; the same person is "Human Resource Manager" on a study's respondent page.
No-shows appear only as one History status; ratings only as percentages and Reviews.

Slips kept: the Reward Points tab is headed "Saved Payment Methods"; both account
forms say "confirm deactivation"; the email is jonathanmorgan@gmail.com; "Invite Roma",
"Ferry L. has been invited".

Built choices: Send E-mail opens a mail link; "Reason", "Download Receipt PDF", the
filter dialogs' Apply and the period / sort menus change nothing; study rows are not
links (none is drawn as one); Reviews and Invite To Study now open from the header.

No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: About 3.58%, deactivated 3.83%; Studies 3.66 / 2.03 / 3.90 / 3.75 /
4.04%; Wallet: Earnings 4.65%, Payouts 5.10%, Reward Points 4.15%, Referrals 3.63%.
Dialogs: Deactivate form 12.58%, confirm 5.64%, done 8.56%, Reactivate form 13.05%,
Transaction 5.41%, Filters 5.42% / 8.31%, Payout 8.51%. The reactivate confirmation and
outcome were not diffed. Nothing is cut off by its frame.

## Participant verifications (turn 11)

Section `2022:168588`: 32 frames, all visible, in two sub-sections ("ID" `2036:111504`,
"Profession Credential" `2036:134317`) plus the two list frames and one loose menu
(`2035:109101`, named "Last active": Invite To Study, Send E-mail, Deactivate Account;
no trigger is drawn on these screens). 14 pages, 18 dialogs.

**List** (`/participants/verifications`, `?tab=reported`): segments Onboarding /
Reported. Each is a pending table and a History table, both with a search ("Search
participants by name or role..."), one dropdown and pagination to 10.
- Onboarding `2022:168589`: "87 pending verifications"; Name, Role, Date, Flagged For
  (Identity Verification or Profession Credential, both in the one queue), Reason;
  dropdown "Flagged for All". History: Completed, Verification Remarks, Result
  (Verified / Rejected).
- Reported `2036:142437`: "65 pending applications"; adds Reported By ("System (Algo)"
  or a person); Flagged For: AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong
  Match; dropdown "Reported By All". History results: Rejected (drawn green),
  Restricted, Deactivated. **This is the queue the Dashboard's "Flagged/reported
  accounts" group leads to.** The two differ 4.42%.

**Detail** (`/participants/verifications/:id`; `iv-*` identity, `pc-*` profession,
`rp-*` report; an id ending `h` opens decided; `?tab=profile`). Measured against
identity-flagged `2035:109172`: profession 1.43% (the card and what is under it),
verified 1.36%, rejected 1.43% (the card and one note), Profile Details 2.50%.
- Identity: "Passport / Uploaded passport file could not be verified with the govt.
  records. Verify it manually." with Reject, Mark Verified, Chat; the two uploaded
  files, each with a view button; "ID Could not be verified with records!"; and
  "Selfie Verification: Selfie photo verified".
- Profession: "Medical License / ... could not be verified with the official
  records."; Occupation, License/Certificate Number, the red tag, Work Functions,
  Experience.
- Report: "Reported For / AI/Bot Activity / Study answers were found AI-generated"
  with Reject Report, Restrict Account, Deactivate Account. Decided: View Study,
  "Reported By Robert Andrew", and a note. `2036:145744` stacks four reports: three
  restrictions (15 days 1st, 15 days 2nd, 30 days 3rd) then "Deactivated the account."
- Decided verification: the card greys, the buttons become "View Support Chat", and a
  note: "Marked as verified! An OCR error, manually verified and matched with record.
  Oct 5, 2026" or "Rejected the Passport ID verification. Did not submitted the
  document as required. Oct 30, 2026".

**Decisions.** Mark Verified: a form (Verification Statement*, the team member's
password), "Mark Identity as Verified ?", then "Samuel's Identity has been verified!
Identity is now verified and Samuel's account is now fully active to participate in
studies." (profession: "... will be displayed on Samuel's profile publicly."). Reject:
one dialog with Rejection Statement*, "necessary action will be taken with impacting
this client's account". Reject Report: "cannot be undone later". Restrict: statement
and password, "restricted to participate, withdraw earnings & rewards, for 15 days as
for the 1st time". Deactivate: the profile's three-step flow. No "ask again", no
escalate; Chat is the only way to ask for a better document. No undo is drawn for any
decision. None names the team member who decided; notes carry a date only.

**Selfie.** The console only shows a result line, "Selfie photo verified", with a 24px
thumbnail; on Profile Details also "Human Verified". No selfie image to compare, no
liveness detail, no control. The respondent app captures none (legal review open).

**Certificate and score.** No frame says a certificate is issued by a decision. A
"Cert. ID: HL-R-9F2A-3K7P" is already in the header of people still unverified, and
Maya carries Samuel's id. No decision dialog mentions the Trust Score.

**Samuel Lee's score, frame by frame:** 50 Silver on `2035:109172` (identity,
Flagged), `2036:139490` (marked verified), `2036:139831` (rejected), `2036:140390` and
`2036:140464` (profession verified / rejected); **95 Platinum on `2035:110335`**
(identity, Profile Details: the only one). On his profile `2017:148911` he is 95
Platinum; on the Participants list `1992:101341` 90 Platinum. All verification frames
say "60% profile completed"; the profile says 95%. Maya Johnson is 50 Silver on every
frame but `2036:145744`, where she is 62 Silver. 50 is the policy floor, the score a
new participant starts with.

Other slips kept: every detail breadcrumb ends "Samuel Lee", Maya's included, and two
read "All Participants /" (built: Onboarding / Reported); the profession frames draw
Maya while pending and Samuel once decided; "Rejected the Passport ID verification."
on a licence; the verification rejection says "Jennifer's Business Verification has
been rejected!" and "this client's account"; "has bee restricted", "has bee rejected",
"oucome"; a second "Work Functions" on the pending profession frame; Samuel carries
"Profession Verified" while his identity is unverified.

Built choices: Chat and View Support Chat open a support ticket; Go To Full Profile
opens the participant; View Study and the documents' view buttons do nothing; the
decision flips the page to its decided state; a History row opens the decided state.

Shared: `Card`, `Field`, `File`, `Check` exported from the profile's About tab and
reused. No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: lists 4.67% / 4.82%; identity flagged 1.90%, profile 3.22%, verified
2.04%, rejected 2.14%; profession 2.04 / 3.16 / 2.02 / 2.20%; reports 1.75 / 1.67 /
1.76 / 2.98%. Dialogs: verify forms 13.27% / 5.33%, confirms 5.15 / 5.13 / 4.66%,
outcomes 5.77-9.73%, rejection forms 17.85% / 16.51%, deactivate form 10.84%. Nothing
is cut off by its frame.

## Clients (turn 12): list, profile, invoices, client verifications

**Clients section `2045:115869`:** 9 frames, all visible: Active `2049:118695`,
Deactivated `2049:118738`, About `2051:129453`, deactivated About `2051:137137`, Studies
Ongoing `2051:132253`, Studies Completed `2051:134144`, a third frame named "Studies -
Client profile page" that is the **Payments** tab `2051:135099`, and two invoice panels
(`2051:130623` paid, `2051:130751` to pay). Loose: "Last active" `2051:132223` (really
the options menu: Send E-mail, Deactivate Account) and "Ongoing Study options"
`2051:134108` (Copy Study Link, Pause Study, Duplicate to Drafts).
**Second "Participants - Verifications" section `2051:143182`:** 11 frames, all
visible, all client business verification: list Pending `2051:143183`, History
`2051:150538`; detail flagged `2051:145339`, Profile Details `2051:145410`, verified
`2051:145795`, rejected `2051:145873`; five dialogs, all participant ones reused.

Measured: Active vs Deactivated 0.92% (the segment, the count, the third dropdown, the
last heading; the same ten rows). Ongoing vs Completed studies 0.67% plus four more
rows. Verification flagged vs verified 2.17%, vs rejected 2.34%.

**List** (`/clients`, `?tab=deactivated`): "126,872 active clients" / "10,572
deactivated clients" (the same two numbers as the participants list). Search "Search
clients by name, role, industry, or company..."; "Industry: All", "Location: All",
"Last Active: All" / "Deactivated: All" (options not drawn). Columns Name (sortable),
Role, Company, Industry, Location, Last Active / Deactivated (sortable). No row or bulk
action.

**Profile** (`/clients/:id`, `?tab=studies|payments`, `&sub=completed`,
`?state=deactivated`). About: Account Details (work email, role, company, VAT (Tax)
number, website, industry, location) and Reviews ("4.5 of 1,468 reviews", each with the
client's own rating "To participant" under it, pagination to 80). Studies: Ongoing and
Completed tables (Billed, Required, Completed, Created On / Completed On, a row menu).
Payments: Due Payments $6,874 "of 5 studies", All Time Spent $25,890 "for 5 studies",
Average Study Cost $3,876 "from 15 studies"; Pending Invoices and Completed Invoices
(download, view); Saved Payment Methods, which draw **full card numbers and CVV**
("2687 4242 3247 4242 ... CVV: 235"). **No team members appear anywhere**: one person
per client account.

**What the team can do.** Send E-mail; Deactivate Account (menu); Reactivate Account
(banner on a deactivated client: "This account was deactivated as business verification
could not be done. Can verify it manually and reactivate."); on a study row Copy Study
Link, Pause Study, Duplicate to Drafts. No restrict, no approve on the profile. **No
deactivate or reactivate dialog is drawn for a client**: the participant flow is reused
here and still says "Samuel's account".

**Business verification** (`/clients/verifications`, `?tab=history`; detail
`/clients/verifications/:id`, `?tab=profile`). One queue, "87 pending verifications",
Flagged For always "Business Verification"; reasons "VAT number for business
registration could not be found" or "Website and VAT number ...". What is checked: the
VAT (Tax) number and the company website the client typed, against records. No
document is uploaded or shown. Decisions: Reject, Mark Verified, Chat; each with a
required statement, verify also with the password. After: "Marked as verified! An OCR
error, manually verified and matched with record." or "Rejected the Business
registration verification. Did not submitted the VAT number document for verification
as required."; History shows a rejected client as "Could not verify the business, hence
deactivated." **The gate, as drawn:** only clients whose automatic check failed reach
this queue; nothing shows a client waiting for approval before running studies, and no
frame blocks a pending client's studies. The frames light Participants >
Verifications; built lighting Clients > Verifications.

**Invoices against Pay and Review (reported).** The invoice panel repeats the Pay
tab's breakdown exactly: fees $100 / $500 / $2,500 / $250, total $3,350, less deposit
-$3000, net $350, "Due on Aug 10, 2026". The profile's Studies table bills the same
studies $15,085 (goal-tracking), $10,085, $17,085, $12,085, $20,698, $24,684; the
Studies list says $12,960, $23,490, $14,800, $18,230, $28,040, $24,560; Review says
$16,510 for goal-tracking. The invoice tables list $750-$3,896 pending and
$10,750-$24,833 completed, every row "INV-1024366 / Patient Trust in Telehealth". Due
Payments $6,874 "of 5 studies" against five pending rows that add to $10,390. Required
/ Completed here (40 / 37 ...) against 60 / 20 on the Studies list.

**Ratings.** Both directions are drawn on the client's About tab: respondents'
ratings of the client (stars, score, text, the 4.5 average) and the client's rating
of each respondent ("To participant: Eliza D 5.0"). The header's Reviews button opens
the participant panel "Reviews of Samuel Lee" (no client version is drawn).

Slips kept: client headers carry a participant "Cert. ID"; the decided verification
breadcrumbs read "Onboarding / Samuel Lee"; the section heading is "Profession
Credential" and the dialogs say "Mark Profession Verified ... Samuel's profession
credentials"; the banner card says the VAT number "could be found and matched" while
flagging that it could not; both invoice panels are titled "Mobile App Usability
Testing"; Completed studies use types found nowhere else (Focus Group, Interview,
Poll, Case Study); the search says "participants" on the client queue; role "Hearth
Researcher".

Built choices: Send E-mail opens a mail link; the row menu items, Download, the
invoice download and "Reason" do nothing; View Study opens the diary study; study rows
open the managed study; a decision flips the page to its decided state.

No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: list 2.43% / 2.46%; About 6.27%, deactivated 6.11%; Studies 3.83% /
4.47%; Payments 3.27%; verification list 4.37% / 4.43%; detail flagged 2.86%, Profile
Details 6.19%, verified 2.76%, rejected 3.01%; invoice panels 6.00% / 12.93%. The
verification dialogs are turn 11's. Nothing is cut off by its frame.

## Support (turn 13)

Section `2036:160943`: 9 frames, all visible, nothing loose: list New `2036:159859`,
Ongoing `2044:49967`, Closed `2044:50380`; ticket "New - User created" `2045:51486`,
"Ongoing - Team created" `2045:52936`, "Completed- User created" `2045:53435`; Mark
Resolved? `2045:52841`, Ticket Is Resolved And Closed! `2045:52876`, Create Ticket
`2045:115768`. Measured: Ongoing vs Closed list 2.35% (segment, heading, the dots and
"You:"); ticket new vs ongoing 4.18%, new vs closed 5.31%, ongoing vs closed 6.03%
(the title-bar button, the status, the thread, the composer).

**List** (`/support`, `?tab=ongoing|closed`): segments New / Ongoing / Closed;
"Pending Tickets 3", "Ongoing Tickets 4 messages", "Completed Tickets 628"; one search
"Search by name or ticket number"; no filter. Columns: Support Ticket (subject over the
last message, an orange dot when unread), From, Last Activity (sortable), Created On
(sortable), Ticket Number, a chevron. New: three rows, no pagination, and "Create
Ticket". **Nothing tells a participant's ticket from a client's**: no column, tag or
filter. (The Dashboard's Support tab groups them "Participants" / "Client"; this list
does not.) Hidden in the list frames: a Status column with a tag, a CTA column, an
email input and a second CTA in the toolbar.

**Ticket** (`/support/:id`, `?state=ongoing|closed`): number in the title bar with one
button; a bar with back, subject, status (Open / Solved), an info button, "User
profile", and on the team-created one "[Report/Verification]" (a placeholder label,
as drawn). The user's first message is a "Ticket Info" card: Subject and Message, with
an attachment. Timestamps are time of day under each message and one day heading. No
category, no priority, no study or account link beyond those two chips (the study is
only named inside the message text).
- New: Ticket Info, attachment, composer; "Mark Resolved" greyed.
- Ongoing: the team's message first, the user's replies, composer; "Mark Resolved" live.
- Closed: the full thread, "Solved", "Re-open", no composer, "This ticket has been
  resolved and closed - Sep 10, 2026, 04:26 PM".

**Actions.** Live: reply (Send, attach), Mark Resolved ("Are you sure you want to mark
this ticket as resolved? User won't be able to message further on this ticket." then
"#FI-S562357 is marked as resolved and moved to closed section."), Re-open, Create
Ticket (Subject, User Email Address, Message; "Create and Send"). Not drawn at all:
assign, escalate, transfer, internal note, canned reply, priority.

**Automatic first answer:** nothing drawn. No bot message, no FAQ suggestion, no
"answered automatically" state, no hand-off marker. The phrase the brief bans does not
appear in any Support frame. **Reply time:** nothing drawn: no SLA, timer, due time or
"waiting since". **Who handled it:** not recorded. Team messages are unsigned (the
closed list says "You:"); the resolution line carries a date and no name. Support is
not the exception.

Slips kept: the "From" names (Ronny McCoy ...) are the people speaking in the last
message, which greet "Hi Jennifer"; two tickets share FI-S562357; ongoing and closed
breadcrumbs both read "Ongoing /"; the list's later rows are office chatter (Team
Outing, Budget Approval, New Hire Announcement); "Enter you message in detail"; the
frames' title-bar breadcrumb layer is named after a study.

Built choices: Send appends the message to the thread; Mark Resolved moves the page to
its closed state and Re-open back to ongoing; Create and Send opens the ongoing ticket;
User profile opens participant p-1 and "[Report/Verification]" the identity check;
the info and attach buttons do nothing. Chat and View Support Chat on the participant
and client verifications now open the ongoing ticket. Every ticket id shows the one
thread drawn.

No primitive changed. Everything signed off re-swept: unchanged.

Diffs at 1440: list New 2.43%, Ongoing 4.13%, Closed 4.03%; ticket New 3.03%, Ongoing
3.52%, Closed 4.34%; Mark Resolved? 7.01%, resolved 5.82%, Create Ticket 4.42%. Nothing
is cut off by its frame; the closed ticket's frame is drawn scrolled to the bottom.

---

## The file, mapped

15 top-level sections and one loose frame on the page, **294 frames, 251 visible,
43 hidden**, plus loose component instances on the section canvases (option
menus, filter dropdowns, "Bottom Bar", "Question menu", "Tiers", "Last active").

| Section | Node | Frames | Visible | Pages | Panels / modals |
|---|---|---|---|---|---|
| Onboarding | `1849:111735` | 5 | 5 | 4 | 1 |
| Dashboard | `1850:115647` | 5 | 5 | 5 | 0 |
| Studies | `1874:72972` | 137 | 121 | 91 | 30 |
| Payment & Publish (loose frame) | `1982:106033` | 1 | 0 | | |
| AI | `1906:6573` | 24 | **0, whole section hidden** | | |
| Assets (sidebar sheet) | `1857:131507` | 1 | 1 | | |
| Participants - All Participants | `1992:101340` | 28 | 27 | 13 | 14 |
| Participants - Verifications | `2022:168588` | 32 | 32 | 14 | 18 |
| Participants - Verifications (**holds client verifications**) | `2051:143182` | 11 | 11 | 6 | 5 |
| Support | `2036:160943` | 9 | 9 | 6 | 3 |
| Clients | `2045:115869` | 9 | 9 | 7 | 2 |
| Finance | `2051:154237` | 13 | 13 | 8 | 5 |
| Pricing & Rewards | `2051:177074` | 9 | 8 | 7 | 1 |
| Sub-Admin | `2060:197774` | 4 | 4 | 4 | 0 |
| My Account | `2065:203731` | 6 | 6 | 3 | 3 |

A long text node, `1845:2`, sits on the page beside the sections: the module brief
(I1 Dashboard to I9 My Account) with workflow step numbers. It is the closest
thing to a spec inside the file.

### Hidden frames (43)

- **AI** `1906:6573`: the whole section, 24 frames (2.0 Studies Ongoing/Completed,
  2.1 to 2.9 study screens, popups, dialogs, toasts). An earlier generated draft of
  the Studies module, superseded by the Studies section. Not built.
- **Edit Survey Study** `1932:109519` inside Manage - Survey: the whole sub-section,
  7 frames (About, Audience, Screener, Create/Created Survey, Published, Payment &
  Publish). The console editing a study like a client; the module brief marks
  that as "(Discarded)". Not built.
- **Payment & Publish - New Study** `1982:106033`, loose on the canvas.
- **Pay / Payment frames** in the Manage sections: `1932:96864` Pay while ongoing
  (Completed flow), `1952:78171` Payment and `1952:78343` Pay - Due (group video),
  `1952:81555` Payment, `1952:81727` Pay - Due and `1952:83095` "$350 paid
  successfully!" (video 1:1), `1961:183365` Payment and `1961:183537` Pay - Due
  (in-person). The console does not pay; these are the client's payment screens
  left switched off.
- `1952:80380` Mark all as No-show (group video).
- `2017:152956` Participant profile page (a duplicate under `2017:153500`;
  screenshot returns 1x1).
- `2058:193395` Create Ticket, under Pricing & Rewards (a stray copy of the
  Support panel).

---

## Screens, after collapsing states

The same rule as the client build: a screen drawn several times with one tab,
banner or study type changed is **one screen with states**. Measured by pixel
diff (`scripts/diff.py`) between frames suspected to be the same screen. The
differences sit only in the content band; the shell is identical in every pair.

| What | Frames | Diff evidence | Verdict |
|---|---|---|---|
| Dashboard tabs All / Onboarding / Studies / Support / Manage | `1851:115853`, `1872:70720`, `71323`, `71711`, `72123` | 0.62% to 2.09% vs Onboarding, all inside x 254-1402, y 260-755 (the tab underline and the group cards) | 1 screen, 5 tab states |
| Studies To Review / Ongoing / Completed | `1978:97400`, `1874:72973`, `1906:19984` | 2.88%, 3.25%: segmented pill, column heads, last column | 1 screen, 3 tab states |
| Manage Study, six study types | `1932:107082` survey, `1952:76819` group video, `1961:180002` diary, `1961:182412` in-person, `1961:185067` in-person group, `1952:80603` video 1:1 | 3.67% to 4.00%, rows 110-291 (header: thumbnail, title, type tag) and the one Study summary row; video 1:1 6.94% because it adds a "Congrats!" banner | 1 screen switched on type, + a banner state |
| Study Overview, types | `1932:106948` survey, `1961:179868` diary | 3.96%, header and content rows only | 1 screen |
| Paused study | `1952:75945` | 8.81% vs Overview: a pause banner pushes the page down | a state of Overview |
| Review a new study: tabs About / Audience / Screener / Study / Payment / Revisions History | `1982:104845`, `1984:114713`, `1984:114217`, `1984:119698`, `1984:120589`, `1984:122012` | 1.95% to 2.65%, all inside the left content column | 1 screen, 6 tab states |
| Review, Study tab per type | `1984:119698` video, `122634` survey, `129204` group video, `130558` in-person, `132092` in-person group, `134413` diary | 0.59% (in-person) to 2.60% | 1 tab, 6 type variants |
| Participants Active / Deactivated | `1992:101341`, `2003:134529` | 0.88%: the segmented pill and the count line | 1 screen, 2 tabs |
| Participant profile: About; Studies (Invites To Schedule, Scheduled, Applied, History, Saved); Wallet (Earnings, Payouts, Reward Points, Referrals) | `2017:148911`, `150996`, `152230`, `153500`, `155171`, `155992`, `2020:160313`, `2021:165139`, `2022:166544`, `2022:177272` | Studies sub-tabs differ 1.20% to 1.84% from each other | 1 screen, 3 tabs, 10 states |
| Deactivated participant profile | `2024:178894` | 5.43% vs `2017:148911`: an "Account is deactivated." banner | a state of the profile |
| Verifications Onboarding / Reported | `2022:168589`, `2036:142437` | 4.42%: tab, columns, rows | 1 screen, 2 tabs |
| Verification detail, ID vs Profession credential | `2035:109172`, `2036:134318` | 1.43%: the flagged card (Passport vs Medical License) | 1 screen switched on check type |
| Verification detail, pending vs marked verified | `2035:109172`, `2036:139490` | 1.36%: the action card becomes "Marked as verified!" | states of one screen |
| Verification detail, Flagged vs Profile Details tab | `2035:109172`, `2035:110335` | 2.50% | 2 tabs of one screen |
| Finance Overview: All / Participant Earning / Participant Payouts / Study Payments / Client Refunds | `2051:154238`, `163894`, `165267`, `165906`, `166552` | 2.46% to 2.80%, rows 430-1077 only (the table) | 1 screen, 5 sub-tabs |
| Finance Refunds tab | `2051:167524` | 5.68% | 2nd tab of the same screen |
| Refund detail, to confirm vs confirmed | `2051:169194`, `2051:170363` | 5.24% / 5.46% vs Overview; to each other only the action band | 1 screen, 2 states |
| Pricing & Rewards: Fees / Gamification | `2051:176489`, `2058:194308` | 4.28% | 1 screen, 2 tabs |
| Edit Clients Fees / Edit Participants Fees | `2056:192920`, `2058:193936` | 3.68%, 2.83% vs the overview | 2 edit screens |
| Support New / Ongoing / Closed | `2036:159859`, `2044:49967`, `2044:50380` | 3.14%, 3.67% | 1 screen, 3 tabs |
| Ticket: new / ongoing / completed | `2045:51486`, `2045:52936`, `2045:53435` | 4.18%, 5.31% | 1 screen, 3 states |
| Clients Active / Deactivated | `2049:118695`, `2049:118738` | not diffed yet; same names and sizes as the Participants pair | 1 screen, 2 tabs (to confirm in turn 12) |

### The count

| Module | Visible frames | Unique screens (pages + panels + modals) |
|---|---|---|
| Onboarding (Sign In, Reset Password, Check Email, Set New Password, Password updated) | 5 | 5 |
| Dashboard | 5 | 1 |
| Studies list | 3 | 1 |
| Review a new study (6 tabs, 6 Study-tab type variants, Request changes panel, Published live modal) | 13 | 3 |
| Manage (6 type sections + Completed Study Flow, 110 visible) | 110 | about 22: Overview, Manage Study, Matched/Invited, Recruited (+ booked-slot state), Results, Pay states, respondent result (answers for survey/diary; scheduled + completed for session types), activity, profile panel, rate panel, Download Sessions Results, Pause, Invite to apply?, Sent, Mark [individual] as No-show, Mark back as Completed, Marked Completed, Group mark all completed, After Started, Screener CTAs |
| Participants list + Advanced Filters, Reviews, Invite To Study, Sent | 6 | 5 |
| Participant profile + Transaction Details, two Earnings Filters, Payout Details, Deactivate 1/2 and 2/2, deactivated, reactivated | 22 | 9 |
| Participant verifications: list, detail (ID / Profession / Reported), Mark verified, confirm, verified, Reject report, rejected, Restrict (3), Deactivate (3) | 32 | about 13 |
| Client verifications: list (Pending / History), detail, the same five modals | 11 | 3 + modals shared with participants |
| Support: list, ticket, Create Ticket, Mark Resolved?, Resolved | 9 | 5 |
| Clients: list, profile (About, Studies Ongoing/Completed, Payments), two invoice panels | 9 | 4 |
| Finance: overview, refund detail, three Transaction Details panels, Confirm Client Refund?, refund confirmed | 13 | 6 |
| Pricing & Rewards: overview, Edit Clients Fees, Edit Participants Fees, Edit Tiers, Edit Trust Score, Edit Reward Points, Changes published | 8 | 7 |
| Sub-Admin: list + activities, Create Profile, Profile, Edit Profile | 4 | 3 |
| My Account: Profile, Edit Profile, Sub-Admin Profile, Change Password, Logout, Password updated | 6 | 6 |
| **Total** | **251 visible** | **about 95** |

Roughly **95 unique screens from 251 visible frames**. The single largest
collapse is Manage: six study-type sections of 16 to 26 frames each are one flow
switched on type, exactly as in the client build.

---

## Where frames of one screen disagree

Each is drawn both ways in the file. Figma governs, so each screen matches its
own frame; these are listed so nobody "fixes" one into the other silently.

1. **The admin's name.** "Peter Davian" on the long Dashboard (`1851:115853`) and
   the Review frames; "Peter Devian" everywhere else, including My Account. My
   Account gives his email as `maya.thompson@humanlayer.com`.
2. **The wrong nav item lit.** Studies Ongoing (`1874:72973`) and every Review
   frame (`1982:104845` and the rest) light **Dashboard**, not Studies. The
   client verification detail (`2051:145410`) lights **Participants >
   Verifications**, not Clients.
3. **Dashboard counts.** All tab: Identity Verification **16**, second row "Jane
   D. / Selfie liveness check passed". Onboarding tab: Identity Verification
   **2**, second row "Jenny Keens / Automatic ID match didn't matched". The
   Support tab groups by Participants / Client; the All tab lists "New Support
   Tickets".
4. **Study Overview.** Survey Overview (`1932:106948`) carries an About Client
   card and Qualified "1000 /1200 applied"; the paused Overview (`1952:75945`)
   has no client card and "35 /60 applied".
5. **Review header.** The card says "About goal-tracking methods", Video Call; the
   breadcrumb says "Social media posts designing apps"; the header stays Video
   Call while the Study tab shows Survey, Diary and the rest.
6. **Frame names.** `1984:114217` "2.1.0 About - New Study" is the Screener tab.
   `2051:143182` "Participants - Verifications" holds client verifications.
   `2051:170969` in Finance is named "Samuel's Profession Credentials has been
   verified!" (check its content before building it).
7. **Participant profile.** Header "Software Engineer", About tab "Occupation:
   General Physician". The Saved sub-tab is headed "Invites To Schedule"; the
   Reward Points sub-tab is headed "Saved Payment Methods".
8. **Verification detail.** Samuel Lee is **50, Silver** on the Flagged tab
   (`2035:109172`) and **95, Platinum** on Profile Details (`2035:110335`).
   Breadcrumbs read "Onboarding / Samuel Lee" and "Verifications / Samuel Lee"
   for the same screen.
9. **Trust Score values, view vs edit.** Gamification (`2058:194308`) shows No
   Show **-4** and Cancelled Session **-4**; Edit Trust Score (`2058:196166`)
   shows No Show **-2** and Cancelled Session **-2**.
10. **Edit Tiers** (`2058:195439`) labels the three tier fields "Withdrawal",
    "Reward Points Value" and "Platinum Tier" (values 50, 70, 90).

## Against the signed Trust and Rewards policy

The policy (`docs/Trust-and-Rewards-Policy.html`) outranks Figma on scores,
tiers, points, redemption and the certificate. Where Pricing & Rewards draws a
different number, the screen still matches Figma in stage one; stage two seeds
the policy's values and the conflict is reported, never decided silently.

| Item | Figma | Policy |
|---|---|---|
| Cancelled session | -4 on Gamification, -2 on Edit | **-2** |
| No show | -4 on Gamification, -2 on Edit | **-4** |
| Study completion points | **50** ("Per study, upto 10 per year") | **25** |
| "Points have no expiry and can be redeemed anytime." | drawn | not in the policy |
| Study completion trust | "+10" (Earned For) | +1 a study, up to 10 a year, so +10 is the yearly cap |
| Onboarding +50, ratings +40 max, 5/4/3/2/1 stars +4/+3/+1/-2/-3, Late show up -2, Fraud -20, tiers 50/70/90, 100 points = $1, minimum 1,000, referral 200, being referred 100, full profile 50, streak 50 | match | match |

Fees the policy does not cover: Withdrawal **$1.99** (the respondent app charges
$2 flat), Platform fee $100, Moderation fee $10, Recruitment fee $25 base with
add-ons.

---

## Roles

The designs show two kinds of user:

- **Master Admin**: Peter Devian, the account card in the sidebar and My Account.
  Sees every module.
- **Sub-admins**, created by the master admin (Sub-Admin, `2060:197775`). Each has
  a designation and **per-module access toggles**: Dashboard, Studies,
  Participants, Clients, Support, Finance, Pricing & Rewards, Sub-Admin (Create
  Profile, `2062:201923`). Designations drawn: Studies Manager, Community Manager,
  Finance Manager, Support Executive, System Admin, Research Lead. Status Active
  or Inactive. Every sub-admin action is logged in an Activities table (module
  path, date, action by).

No frame shows the console as a sub-admin with modules hidden; the nav is always
the master admin's.

---

## Build order

One section per turn, compare loop on every screen, push after each screen.

| # | Turn |
|---|---|
| 1 | Shell and primitives: sidebar (12 variants), title bar, segmented tabs, underline tabs, table, chips, badges, 600 panel, 460 modal, success modal, plus a `/kitchen-sink`. Then Onboarding: Sign In, Reset Password, Check Email, Set New Password, Password updated |
| 2 | Dashboard, all five tab states |
| 3 | Studies list (To Review, Ongoing, Completed) |
| 4 | Review a new study: six tabs, the Study tab's six type variants, Request changes, Published live |
| 5 | Manage shell: study header and tab strip, Overview, Manage Study, the paused and "Congrats!" banners, Pause Study |
| 6 | Manage recruiting: Matched / Invited, Recruited, Respondent Profile panel, Invite to apply?, Sent, Screener CTAs |
| 7 | Manage results: Results, respondent result (answers / scheduled / completed), activity, rate panel, no-show and completed modals, Download Sessions Results, After Started |
| 8 | Manage pay states and the Completed Study Flow |
| 9 | Participants list and its panels |
| 10 | Participant profile: About, Studies (5), Wallet (4), deactivated, and its panels and modals |
| 11 | Participant verifications: list, detail (ID, Profession, Reported), all modals |
| 12 | Clients list, client profile, invoices, client verifications |
| 13 | Support: list, ticket in three states, Create Ticket, resolve |
| 14 | Finance: overview, refunds, refund detail, transaction panels, refund confirmation |
| 15 | Pricing & Rewards: overview, five edit screens, published |
| 16 | Sub-Admin and My Account |
| 17 | Sweep: every route renders (healthcheck), every control does something (click audit), every signed-off screen re-diffed |

---

## Frame inventory

Every section and frame on page `1794:64316`, from `get_metadata`, with sizes.
`page` is a 1440 frame, `panel` 600, `modal` 460. Hidden frames are marked.

### Onboarding — section `1849:111735`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Check Email | `1849:111820` | 1440x960 | page |
| Reset Password | `1849:111913` | 1440x960 | page |
| Set New Password | `1849:112001` | 1440x960 | page |
| Sign In | `1849:112091` | 1440x960 | page |
| Password has been updated! | `1849:112267` | 460x423 | modal |

### Dashboard — section `1850:115647`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Dashboard | `1851:115853` | 1440x1912 | page |
| Dashboard | `1872:70720` | 1440x960 | page |
| Dashboard | `1872:71323` | 1440x960 | page |
| Dashboard | `1872:71711` | 1440x960 | page |
| Dashboard | `1872:72123` | 1440x960 | page |

### Studies — section `1874:72972`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Studies | `1874:72973` | 1440x960 | page |
| Studies | `1906:19984` | 1440x960 | page |
| Studies | `1978:97400` | 1440x960 | page |

#### Completed Study Flow — section `1932:96425`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1932:96426` | 1440x1299 | page |
| Results | `1932:96711` | 1440x1575 | page |
| Pay while ongoing **(hidden)** | `1932:96864` | 1440x991 | page |
| Pay - Due as completed | `1932:97043` | 1440x1097 | page |
| Qualified - Recruited respondent | `1932:97240` | 1440x1365 | page |
| Completed respondent result | `1932:97554` | 1440x1365 | page |
| Activity of respondent | `1932:97868` | 1440x1365 | page |
| Rate Ferry L. | `1932:98073` | 600x705 | panel |
| RATED | `1932:98139` | 600x503 | panel |

#### Manage - Survey Study — section `1932:106947`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1932:106948` | 1440x960 | page |
| Manage Study | `1932:107082` | 1440x1401 | page |
| Auto-Matched | `1932:107233` | 1440x1401 | page |
| Invited - Auto-Matched | `1932:107375` | 1440x1401 | page |
| Recruited | `1932:107511` | 1440x1273 | page |
| Results | `1932:107613` | 1440x1642 | page |
| Pay - Due as completed | `1932:107773` | 1440x1053 | page |
| Recruited respondent result | `1932:108302` | 1440x1365 | page |
| Completed respondent result | `1932:108609` | 1440x1365 | page |
| Activity of respondent | `1932:108923` | 1440x1365 | page |
| Respondent Profile Details | `1932:109128` | 600x913 | panel |
| Respondent Profile Details | `1932:109286` | 600x913 | panel |
| Rate Ferry L. | `1932:109444` | 600x705 | panel |

##### Edit Survey Study — section `1932:109519` **(hidden)**

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1.0 About - New Study **(hidden)** | `1932:109520` | 1440x1593 | page |
| 2.1.1 Audience - New Study **(hidden)** | `1932:109642` | 1440x1756 | page |
| 2.1.2 Screener - New Study **(hidden)** | `1932:109831` | 1440x2296 | page |
| Created Survey_Study- New Study **(hidden)** | `1932:110232` | 1440x1388 | page |
| Create Survey_Study - New Study **(hidden)** | `1932:110379` | 1440x1502 | page |
| Payment & Publish - New Study **(hidden)** | `1932:110673` | 1440x980 | page |
| Published - New Study **(hidden)** | `1932:110806` | 1440x980 | page |
| Invite to apply? | `1932:110861` | 460x269 | modal |
| Sent | `1932:110882` | 460x225 | modal |
| Screener CTAs | `1932:110903` | 870x406 | overlay |
| Pause Study | `1952:76517` | 600x404 | panel |
| Paused Study - Study Details | `1952:75945` | 1440x960 | page |

#### Manage - Group Video Call (Self-Managed) — section `1952:76684`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1952:76685` | 1440x960 | page |
| Manage Study | `1952:76819` | 1440x1401 | page |
| Auto-Matched | `1952:76970` | 1440x1401 | page |
| Invited - Auto-Matched | `1952:77106` | 1440x1401 | page |
| Recruited | `1952:77242` | 1440x1176 | page |
| Recruited | `1952:77337` | 1440x1272 | page |
| Results | `1952:77477` | 1440x1688 | page |
| Pay while ongoing | `1952:77992` | 1440x1126 | page |
| Payment **(hidden)** | `1952:78171` | 1440x991 | page |
| Pay - Due as completed **(hidden)** | `1952:78343` | 1440x1097 | page |
| Recruited respondent result | `1952:78522` | 1440x1365 | page |
| Recruited - activity | `1952:78829` | 1440x1365 | page |
| Scheduled Study respondents | `1952:79052` | 1440x1472 | page |
| Study Result - completed | `1952:79377` | 1440x1204 | page |
| Activities of respondent | `1952:79703` | 1440x1365 | page |
| Respondent Profile Details | `1952:80117` | 600x913 | panel |
| Rate Sarah | `1952:80275` | 600x707 | panel |
| Download Sessions Results | `1952:80341` | 600x256 | panel |
| Mark all as No-show **(hidden)** | `1952:80380` | 460x335 | modal |
| Mark [individual] as No-show | `1952:80402` | 460x322 | modal |
| Group-session - mark all completed | `1952:80442` | 1190x205 | overlay |

#### Manage - Video Call Individual 1:1 (Self-Managed) — section `1952:80461`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1952:80462` | 1440x960 | page |
| Manage Study | `1952:80603` | 1440x1401 | page |
| Auto-Matched | `1952:80761` | 1440x1401 | page |
| Invited - Auto-Matched | `1952:80897` | 1440x1401 | page |
| Recruited | `1952:81033` | 1440x1176 | page |
| Recruited | `1952:81128` | 1440x1272 | page |
| Results | `1952:81223` | 1440x1575 | page |
| Pay | `1952:81376` | 1440x991 | page |
| Payment **(hidden)** | `1952:81555` | 1440x991 | page |
| Pay - Due as completed **(hidden)** | `1952:81727` | 1440x1097 | page |
| Recruited respondent result | `1952:81906` | 1440x1365 | page |
| Scheduled Study respondent | `1952:82213` | 1440x1108 | page |
| Study Result - completed | `1952:82396` | 1440x1275 | page |
| Activity of respondent | `1952:82580` | 1440x1365 | page |
| Respondent Profile Details | `1952:82803` | 600x913 | panel |
| Rate Ferry L. | `1952:82961` | 600x708 | panel |
| Mark [individual] as No-show | `1952:83027` | 460x338 | modal |
| Marked Completed | `1952:83058` | 870x432 | overlay |
| $350 paid successfully! **(hidden)** | `1952:83095` | 460x423 | modal |

#### Manage - Diary Study (Self-Managed) — section `1961:179867`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1961:179868` | 1440x960 | page |
| Manage Study | `1961:180002` | 1440x1401 | page |
| Auto-Matched | `1961:180153` | 1440x1401 | page |
| Invited - Auto-Matched | `1961:180289` | 1440x1401 | page |
| Recruited | `1961:180425` | 1440x1176 | page |
| Results | `1961:180520` | 1440x1575 | page |
| Pay while ongoing | `1961:180673` | 1440x1026 | page |
| Recruited respondent result | `1961:181198` | 1440x1365 | page |
| Completed respondent result | `1961:181505` | 1440x1365 | page |
| Activity of respondent | `1961:181797` | 1440x1365 | page |
| Respondent Profile Details | `1961:182044` | 600x913 | panel |
| Rate Ferry L. | `1961:182202` | 600x697 | panel |

#### Manage - In-Person_Individual (Self-Managed) — section `1961:182277`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1961:182278` | 1440x960 | page |
| Manage Study | `1961:182412` | 1440x1401 | page |
| Auto-Matched | `1961:182563` | 1440x1401 | page |
| Invited - Auto-Matched | `1961:182699` | 1440x1401 | page |
| Recruited | `1961:182835` | 1440x1176 | page |
| Recruited | `1961:182930` | 1440x1272 | page |
| Results | `1961:183025` | 1440x1575 | page |
| Pay while ongoing | `1961:183186` | 1440x1119 | page |
| Payment **(hidden)** | `1961:183365` | 1440x991 | page |
| Pay - Due as completed **(hidden)** | `1961:183537` | 1440x1097 | page |
| Recruited respondent result | `1961:183716` | 1440x1365 | page |
| Scheduled Study respondent | `1961:184023` | 1440x1252 | page |
| Study Result - completed | `1961:184231` | 1440x1252 | page |
| Activity of respondent | `1961:184419` | 1440x1365 | page |
| Respondent Profile Details | `1961:184666` | 600x913 | panel |
| Rate Ferry L. | `1961:184824` | 600x720 | panel |
| After Started state | `1961:184899` | 846x423 | overlay |

#### Manage - In-person Group (Self-Managed) — section `1961:184932`

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.1 Study Overview - Studies | `1961:184933` | 1440x960 | page |
| Manage Study | `1961:185067` | 1440x1401 | page |
| Auto-Matched | `1961:185218` | 1440x1401 | page |
| Invited - Auto-Matched | `1961:185354` | 1440x1401 | page |
| Recruited | `1961:185490` | 1440x1176 | page |
| Recruited | `1961:185585` | 1440x1272 | page |
| Results | `1961:185731` | 1440x1688 | page |
| Pay while ongoing | `1961:186246` | 1440x1050 | page |
| Recruited respondent result | `1961:186604` | 1440x1365 | page |
| Scheduled Study respondent | `1961:186911` | 1440x1774 | page |
| Study Result - completed | `1961:187259` | 1440x1774 | page |
| Activity of respondent | `1961:187587` | 1440x1365 | page |
| Respondent Profile Details | `1961:188001` | 600x913 | panel |
| Rate Sarah | `1961:188159` | 600x720 | panel |
| Download Sessions Results | `1961:188226` | 600x256 | panel |
| Mark [individual] as No-show | `1961:188283` | 460x338 | modal |
| Mark back [individual] as Completed from No-show | `1974:100123` | 460x338 | modal |
| Recruited - activity | `1961:188305` | 1440x1146 | page |

#### Review & approve new requested studies — section `1982:104844`

| Frame | Node | Size | Kind |
|---|---|---|---|
| About | `1982:104845` | 1440x960 | page |
| Audience | `1984:114713` | 1440x960 | page |
| 2.1.0 About - New Study | `1984:114217` | 1440x960 | page |

##### Study (All types) — section `1984:135107`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Study - Video Call | `1984:119698` | 1440x960 | page |
| Study - Survey | `1984:122634` | 1440x960 | page |
| Study - Group Video Call | `1984:129204` | 1440x960 | page |
| Study - In-Person | `1984:130558` | 1440x960 | page |
| Study - In-Person Group | `1984:132092` | 1440x1001 | page |
| Study - Diary Study | `1984:134413` | 1440x960 | page |
| Published live! | `1982:109978` | 460x423 | modal |
| Request changes | `1982:110039` | 600x404 | panel |
| Payment | `1984:120589` | 1440x960 | page |
| Revisions History | `1984:122012` | 1440x960 | page |

### Loose frame

| Payment & Publish - New Study **(hidden)** | `1982:106033` | 1440x980 | page |

### AI — section `1906:6573` **(hidden)**

| Frame | Node | Size | Kind |
|---|---|---|---|
| 2.0 Studies — Ongoing **(hidden)** | `1896:1965` | 1440x960 | page |
| 2.0 Studies — Completed **(hidden)** | `1896:2659` | 1440x960 | page |
| 2.1 Study Overview — Ongoing **(hidden)** | `1896:3107` | 1440x960 | page |
| 2.2 Manage Study **(hidden)** | `1896:3539` | 1440x960 | page |
| 2.2 Edit Study **(hidden)** | `1896:3954` | 1440x960 | page |
| 2.3 Matched **(hidden)** | `1896:4366` | 1440x960 | page |
| 2.4 Moderation Queue **(hidden)** | `1896:4780` | 1440x960 | page |
| 2.4 Screener Review **(hidden)** | `1896:5237` | 1440x960 | page |
| 2.5 Recruited **(hidden)** | `1896:5635` | 1440x960 | page |
| 2.6 Results **(hidden)** | `1896:6109` | 1440x960 | page |
| 2.7 Pay **(hidden)** | `1896:6524` | 1440x960 | page |
| 2.8 Completed Study Overview **(hidden)** | `1896:6921` | 1440x960 | page |
| 2.9 Paused Study Overview **(hidden)** | `1896:7322` | 1440x960 | page |
| Popup — Study actions **(hidden)** | `1896:7698` | 300x250 | overlay |
| Popup — Study filters **(hidden)** | `1896:7711` | 330x300 | overlay |
| Dialog — Pause study **(hidden)** | `1896:7728` | 460x265 | modal |
| Dialog — Complete study **(hidden)** | `1896:7735` | 460x290 | modal |
| Dialog — Qualify participant **(hidden)** | `1896:7742` | 460x285 | modal |
| Dialog — Disqualify participant **(hidden)** | `1896:7749` | 460x305 | modal |
| Dialog — Save study changes **(hidden)** | `1896:7759` | 460x285 | modal |
| Toast — Study link copied **(hidden)** | `1896:7766` | 360x92 | overlay |
| Toast — Draft created **(hidden)** | `1896:7771` | 360x92 | overlay |
| Dialog — Invite participant **(hidden)** | `1897:3818` | 460x255 | modal |
| Toast — Participant invited **(hidden)** | `1897:3830` | 360x92 | overlay |

### Assets — section `1857:131507`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Sidebard | `1857:127510` | 2772x1004 | page |

### Participants - All Participants — section `1992:101340`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Participants - Active | `1992:101341` | 1440x960 | page |
| Participants - Deactivated | `2003:134529` | 1440x960 | page |
| Active - Participant profile page | `2017:148911` | 1440x1561 | page |
| Deactivated - Participant profile page | `2024:178894` | 1440x1561 | page |
| Participant profile page | `2017:150996` | 1440x1008 | page |
| Participant profile page | `2017:152230` | 1440x1008 | page |
| Participant profile page **(hidden)** | `2017:152956` | 1440x1008 | page |
| Participant profile page | `2017:153500` | 1440x1008 | page |
| Participant profile page | `2017:155171` | 1440x1008 | page |
| Participant profile page | `2017:155992` | 1440x1702 | page |
| Participant profile page | `2020:160313` | 1440x1186 | page |
| Participant profile page | `2021:165139` | 1440x1260 | page |
| Participant profile page | `2022:177272` | 1440x1260 | page |
| Participant profile page | `2022:166544` | 1440x1727 | page |
| Advanced Filters | `2003:133781` | 600x597 | panel |
| Reviews | `1992:103368` | 600x721 | panel |
| Invite To Study | `1992:103508` | 600x517 | panel |
| Sent | `1992:103806` | 460x225 | modal |
| Transaction Details | `2021:165045` | 460x389 | modal |
| Earnings Filters pop-up | `2021:164690` | 460x394 | modal |
| Earnings Filters pop-up | `2022:167856` | 460x455 | modal |
| Payout Details | `2022:166340` | 460x615 | modal |
| Deactivate partiipant account? 1/2 | `2022:178767` | 460x502 | modal |
| Deactivate partiipant account? 1/2 | `2022:178788` | 460x445 | modal |
| Deactivate partiipant account? 1/2 | `2024:179610` | 460x486 | modal |
| Deactivate partiipant account? 1/2 | `2024:179633` | 460x445 | modal |
| Samuel’s account has been reactivated! | `2024:179769` | 460x450 | modal |
| Your account has been deactivated! | `2024:179800` | 460x472 | modal |

### Participants - Verifications — section `2022:168588`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Participants - Active | `2022:168589` | 1440x1736 | page |
| Participants - Active | `2036:142437` | 1440x1736 | page |

#### ID — section `2036:111504`

| Frame | Node | Size | Kind |
|---|---|---|---|
| ID not verified | `2035:109172` | 1440x1561 | page |
| ID not verified | `2035:110335` | 1440x1588 | page |
| Mark Identity Verified | `2036:135710` | 460x502 | modal |
| Mark Identity as Verified ? | `2036:135726` | 460x225 | modal |
| Samuel’s Identity has been verified! | `2036:135744` | 460x419 | modal |
| Marked Verified | `2036:139490` | 1440x1561 | page |
| Rejected | `2036:139831` | 1440x1561 | page |
| Reject This Report of Maya? | `2051:153898` | 460x413 | modal |
| Maya’s Report has bee rejected! | `2051:153924` | 460x472 | modal |

#### Profession Credential — section `2036:134317`

| Frame | Node | Size | Kind |
|---|---|---|---|
| ID not verified | `2036:134318` | 1440x1561 | page |
| ID not verified | `2036:134380` | 1440x1588 | page |
| Mark Profession Verified | `2036:135589` | 460x502 | modal |
| Mark Profession as Verified ? | `2036:135605` | 460x247 | modal |
| Samuel’s Profession Credentials has been verified! | `2036:135623` | 460x450 | modal |
| Marked Verified | `2036:140390` | 1440x1561 | page |
| Rejected | `2036:140464` | 1440x1561 | page |
| Reject This Report of Maya? | `2051:153971` | 460x413 | modal |
| Maya’s Report has bee rejected! | `2051:153997` | 460x472 | modal |
| Restrict Maya’s Account | `2036:146119` | 460x473 | modal |
| Restrict Maya’s Account? | `2036:146135` | 460x247 | modal |
| Reject This Report of Maya? | `2036:158926` | 460x391 | modal |
| Maya’s Account has bee restricted! | `2036:146153` | 460x441 | modal |
| Maya’s Report has bee rejected! | `2036:158944` | 460x419 | modal |
| ID not verified | `2036:144297` | 1440x960 | page |
| ID not verified | `2036:145055` | 1440x960 | page |
| ID not verified | `2036:145444` | 1440x960 | page |
| ID not verified | `2036:145744` | 1440x1646 | page |
| Deactivate partiipant account? 1/2 | `2036:158775` | 460x502 | modal |
| Deactivate partiipant account? 1/2 | `2036:158791` | 460x445 | modal |
| Your account has been deactivated! | `2036:158809` | 460x472 | modal |

### Participants - Verifications — section `2051:143182`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Clients - verifications | `2051:143183` | 1440x960 | page |
| Clients - Verification completed | `2051:150538` | 1440x960 | page |

#### Profession Credential — section `2051:145338`

| Frame | Node | Size | Kind |
|---|---|---|---|
| ID not verified | `2051:145339` | 1440x960 | page |
| ID not verified | `2051:145410` | 1440x1199 | page |
| Mark Profession Verified | `2051:145747` | 460x502 | modal |
| Mark Profession as Verified ? | `2051:145763` | 460x247 | modal |
| Samuel’s Profession Credentials has been verified! | `2051:145781` | 460x450 | modal |
| Marked Verified | `2051:145795` | 1440x960 | page |
| Rejected | `2051:145873` | 1440x960 | page |
| Reject This Report of Maya? | `2051:153825` | 460x413 | modal |
| Maya’s Report has bee rejected! | `2051:153851` | 460x472 | modal |

### Support — section `2036:160943`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Support - Active | `2036:159859` | 1440x960 | page |
| Support - Active | `2044:49967` | 1440x1252 | page |
| Support - Active | `2044:50380` | 1440x1252 | page |
| New - User created | `2045:51486` | 1440x960 | page |
| Ongoing - Team created | `2045:52936` | 1440x960 | page |
| Completed- User created | `2045:53435` | 1440x960 | page |
| Mark Resolved? | `2045:52841` | 460x269 | modal |
| Ticket Is Resolved And Closed! | `2045:52876` | 460x419 | modal |
| Create Ticket | `2045:115768` | 600x470 | panel |

### Clients — section `2045:115869`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Clients - Active | `2049:118695` | 1440x960 | page |
| Clients- Deactivated | `2049:118738` | 1440x960 | page |
| About- Client profile page | `2051:129453` | 1440x1193 | page |
| About- Client profile page | `2051:137137` | 1440x1303 | page |
| Studies - Client profile page | `2051:132253` | 1440x960 | page |
| Studies - Client profile page | `2051:134144` | 1440x1176 | page |
| Studies - Client profile page | `2051:135099` | 1440x1569 | page |
| Invoice Details (INV-1024366) - Mobile App Usability Testing | `2051:130623` | 600x931 | panel |
| Invoice Details - To Pay | `2051:130751` | 600x931 | panel |

### Finance — section `2051:154237`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Finance | `2051:154238` | 1440x1218 | page |
| Finance | `2051:167524` | 1440x1218 | page |
| Finance | `2051:169194` | 1440x1218 | page |
| Finance | `2051:170363` | 1440x1218 | page |
| Finance | `2051:165906` | 1440x1218 | page |
| Finance | `2051:166552` | 1440x1218 | page |
| Finance | `2051:165267` | 1440x1218 | page |
| Finance | `2051:163894` | 1440x1218 | page |
| Confirm Client Refund? | `2051:170322` | 460x321 | modal |
| Samuel’s Profession Credentials has been verified! | `2051:170969` | 460x441 | modal |
| Transaction Details | `2051:171000` | 600x507 | panel |
| Transaction Details | `2051:171394` | 600x471 | panel |
| Transaction Details | `2051:171506` | 600x565 | panel |

### Pricing & Rewards — section `2051:177074`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Pricing & Rewards | `2051:176489` | 1440x1218 | page |
| Pricing & Rewards | `2058:194308` | 1440x1218 | page |
| Edit Tiers | `2058:195439` | 1440x960 | page |
| Edit Reward Points | `2058:197423` | 1440x960 | page |
| Edit Trust Score | `2058:196166` | 1440x1158 | page |
| Pricing & Rewards | `2056:192920` | 1440x1218 | page |
| Pricing & Rewards | `2058:193936` | 1440x1218 | page |
| Create Ticket **(hidden)** | `2058:193395` | 600x470 | panel |
| Changes are published live! | `2058:193905` | 460x419 | modal |

### Sub-Admin — section `2060:197774`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Pricing & Rewards | `2060:197775` | 1440x1469 | page |
| Create Profile | `2062:201923` | 1440x960 | page |
| Edit Profile | `2065:203431` | 1440x960 | page |
| Profile | `2065:203055` | 1440x960 | page |

### My Account — section `2065:203731`

| Frame | Node | Size | Kind |
|---|---|---|---|
| Edit Profile | `2065:205614` | 1440x960 | page |
| Sub-Admin Profile | `2065:207638` | 1440x960 | page |
| Profile | `2065:205670` | 1440x960 | page |
| Change Password | `2065:206687` | 460x410 | modal |
| Logout | `2065:206708` | 460x285 | modal |
| Password has been updated! | `2065:206726` | 460x423 | modal |
