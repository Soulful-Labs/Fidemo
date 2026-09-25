# Focus Insite, client app

The desktop app a research client uses to create studies, recruit from the pool, manage sessions and pay. It lives entirely in `client/` and shares nothing at runtime with the respondent app in the repo root.

Figma: file `Q83MnpAyJuc6RttXYbWudH`, client designs start at node `826:85016`.

---

## Rule 1, above everything else

**Figma governs everything visible.** Layout, spacing, colour, type, icons and every string come from the frame. Match it exactly. If Figma has a typo, keep the typo. Behaviour comes in stage two; this stage is the screens.

Corollaries:

- Use `get_screenshot` and `get_metadata` only. Never `get_design_context`: it fills the context window.
- Every visible value comes from `client/tailwind.config.ts`, which was built from `get_variable_defs` on client frames. No new colours, no ad-hoc spacing, no invented type sizes.
- Build a screen, render it at 1440 in headless Chromium (`npm run shot -- <route> <out.png> --full`), compare against the frame, fix the differences, then move on.
- Do not touch anything outside `client/`. The respondent app is finished.

---

## Rule 2, the compare loop

Every screen, every turn:

1. **Before building**, call `get_screenshot` on that screen's own frame node and build to match the image. Screenshot individual frames, never whole sections. `get_screenshot` and `get_metadata` only, never `get_design_context`.
2. **After building**, render the screen at 1440 wide in headless Chromium (`npm run shot -- <route> <out.png> --full`) and put it beside the Figma screenshot.
3. **List every difference**, fix them, and only then move on.

A screen is not done until the rendered image and the frame look the same. Anything that cannot be matched goes in the turn report with the reason.

Measuring beats guessing: sampling pixels out of the Figma PNG (panel edges, row pitch, column starts, pill bounds) settles spacing questions in seconds, and the same script run against the render proves the fix.

---

## Rule 3, a shared change re-opens what it touches

When a turn changes a shared component, a token or the shell, re-run the compare
loop on the screens already signed off and report their new diff percentages.
A screen is only still signed off if it is still matching.

Three turns running, a fix to a shared component or to the shell changed every
screen already built: the primary CTA gradient, the panel's y-offset, and the
button heights that `className` could never override.

---

## Rule 6, a node id is a starting point, not a fact

**Node ids in this file are not stable.** `1627:103111` became `1769:93628`
between two turns, same frame, same content, different id. Every id from the
original inventory is where to start looking, not proof of what is there. If an
id returns nothing, or returns something the brief did not describe, call
`get_metadata` on the enclosing section and find the frame by name before
concluding the screen is gone or that the brief is wrong. Report the new id
when one moves.

## Hidden frames

**Frames switched off in the file are common, and a node id is not proof a screen
exists.** Four found so far: `826:86322` and `826:85659` (an older copy of the
populated dashboard, briefed as the empty state), `1518:92891` (Video Call Setup
- Platform Managed) and `1518:93673` (a 2642px reference board of pasted
bitmaps). The tell is that `get_screenshot` returns a **1x1 image** while the
JSON still reports the node's real `original_width` and `original_height`. A
hidden frame cannot be rendered at any size or with `contentsOnly`, and its
children cannot be rendered either, so the only way to read one is
`get_metadata`, which gives layer names, text and geometry but not the label of
any component instance inside it. Check a node renders before planning work on
it, and say so in the report when one does not.

---

## Rule 5, prove the render before trusting the diff

**A dead dev server does not produce an error, it produces a plausible diff of
nothing.** `scripts/shot.mjs` will happily capture a blank or redirected page
and the diff will come back as a believable number. Before trusting any diff,
confirm the render captured the route you asked for: the script prints the route
it landed on, so `(/)` when you asked for `/studies/create/study` means the app
redirected and the image is worthless. If a diff jumps and you cannot name the
reason, run `curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/`
before changing a single pixel. A `000` means the server is gone; restart it and
re-measure rather than chasing the phantom.

**A 200 is not enough.** A dev server can stay up while its module graph goes
stale, so it answers happily with code from an hour ago and a new screen renders
as the old Placeholder. Check the served module, not just the port:
`curl -s http://localhost:5174/src/routes.ts | grep -c <NewScreen>`. If that
disagrees with the file on disk, the server is stale. Restarting is not enough
either: `npm run dev` quietly binds 5175 when 5174 is taken and the stale server
keeps answering, so kill whatever holds the port first
(`Get-NetTCPConnection -LocalPort 5174 -State Listen`) and check the restart
says 5174.

---

## Rule 4, push after each screen

Commit and push as soon as a screen matches, not only at the end of the turn.
A session limit has interrupted two turns already; a push per screen means
finished work is never lost and the state of the branch always shows exactly
how far the turn got.

---

## Stack

Vite, React 19, TypeScript, Tailwind v4, React Router 7. No other UI libraries. `npm run dev` serves on **5174** so both apps can run side by side.

Desktop first at **1440**: a 240px left navigation, a 68px top bar, **600px** side panels, **460px** modals.

Chrome, measured off the Studies frames: the navigation, the top bar and the page behind the content are all `yellow-20` (#f7f4f0); the content panel is `bg-0` (#fdfdfc) inset 8px from the nav and the right edge and starting at y=78 (68 of top bar, its hairline, then 9 of page); the Dashboard panel is `bgAlt-0` (#fbfefd) instead; the active nav item is a white pill. The Create frames keep the same nav; their top bar carries the same `yellow-20` tint (69px, hairline under it, then 8px before the panel) and only the four step chips are pills — white, with the active one `bgAlt-2`. Table rows and header bands are 52px with 22px cell padding; the segmented tab group is 343×48 with 112px tabs, `bgAlt-2` track and a `green-200` pill. The page panel has 25px of padding above its first element (24 on the Create frames). The primary CTA is a vertical gradient, #fdc86f to #fca311, with a 2px `yellow-700` bottom edge; its height is per frame, so `Button` carries them as sizes: `md` 40, `row` 38 (top bar, Create bar, notification rows), `sm` 32, `none` when the caller sets its own (36 in a banner, 48 in a dialog). `cn` is a plain join, so a height in `className` will not beat a size class — pass `size="none"`. The 460px dialog is `bg-0`: 40px sides, 44 above the 24px title, a 330px body column, 38 below it, then the hairline, 16, and 48px buttons 16 apart.

---

## The structural rule: Manage and Create are one flow each

The file is organised as six Manage sections and five Create sections, one per study type. They are not six flows and five flows. They are **one Manage flow and one Create flow**, driven by study type.

### Manage, one flow

Every Manage section holds the same frames, with the same names, in the same order, at the same sizes. `Manage Study` for Diary (1627:96085), In-Person Individual (1627:101069) and Survey (1645:131565) differ in **3.2% of pixels**: the study-type tag and the one summary row at the bottom of the Study card.

Build once, switch on `study.type`:

| Screen | Node (diary section) | What the type changes |
|---|---|---|
| Study Overview | 1627:95956 | type tag only |
| Manage Study | 1627:96085 | type tag; the "Study" summary row ("Diary Study Form: 5 questions, 5 days logs" / "In-Person: 2 addresses, available 5 days/week, custom timings, 2 days overrides" / "Survey Form: 10 inputs") |
| Matched | 1627:96237 | nothing |
| Invited | 1627:96329 | nothing |
| Recruited | 1627:96535 | session types add a second state with the booked slot (1627:101612) |
| Results | 1627:96628 | group types are taller (1688 vs 1575): a session block per group |
| Pay while ongoing / Payment / Pay due | 1627:96779 / 96956 / 97128 | nothing |
| Respondent result | 1627:97305 | **the one real fork**: survey and diary show `Completed respondent result` (answers); session types show `Scheduled Study respondent` + `Study Result - completed` (slot, attendance, recording) |
| Activity of respondent | 1627:97901 | nothing |
| Respondent Profile Details (panel) | 1627:98130 | nothing |
| Rate respondent (panel) | 1627:98286 | nothing |

Type-only extras: **Download Sessions Results** (600px panel, group types: 1627:107040), **Mark all as No-show** and **Mark [individual] as No-show** (460px modals, session types: 1697:63643), **After Started state** (in-person: 1627:103111).

### Create, one flow

Every Create section holds the same `2.1.0 About` (1440×1315), `2.1.1 Audience` (1440×1756), `2.1.2 Screener` (1440×2320) and the same seven filter popovers, at identical sizes. About for In-Person (1622:81504) and Survey (1518:90995) differ in **0.31% of pixels** — and that difference is *which study-type card is selected on the screen itself*. The study type is chosen on step 1; it is not a separate flow.

Five steps, the fourth switching on type:

| Step | Node | Type-specific |
|---|---|---|
| 1 About | 1622:81504 | the selected type card: Survey / Video Call (+Group toggle) / In-Person (+Group toggle) / Diary Study |
| 2 Audience | 1622:81615 | no |
| 3 Screener | 1622:81771 | no |
| 4 Study | 1518:91922 | **yes, the top card only**: Survey Settings → Create Survey Questionnaire; Diary Study Settings → duration unit, frequency, minimum required, then the form; Video Call Settings → Set Timing Availability; In-Person Interview Settings → Set Address & Availability (a 600px panel: address, limits, weekly hours, date overrides, completion verification). Incentive Payments, Costing Summary and Payment below are identical for all four. |
| 5 Payment & Publish | 1622:87629 | no |

### The screen count

| | Frames in the file | Unique screens to build |
|---|---|---|
| Manage (6 sections) | 96 | 14 pages + 2 panels + 3 type extras = **19** |
| Create (5 sections) | 41 | 5 pages + 1 saved/edit variant + 7 popovers + 2 panels = **15** |
| Everything else | 79 | **56** |
| **Total** | **216** | **90** |

Roughly **90 unique screens**, not 216: 126 frames are the same screen drawn once per study type, or a state of a screen already counted.

---

## Route map

`page` = full 1440 screen, `panel` = 600px side panel, `modal` = 460px dialog, `popover` = small menu anchored to a control. Node ids are the Figma frames; where a screen is drawn once per type, the diary section's node is given.

### Onboarding — section 1484:81318
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/signup` | Sign Up | 1484:81319 | page |
| `/check-email` | Check Email | 1484:81337 | page |
| `/signin` | Sign In | 1484:81364 | page |
| `/organization` | Organization Details | 1484:81382 | page |
| `/pricing` | Select Pricing Plan | 1484:81400 | page |
| `/payment-method` | Payment Method | 1512:68177 | page |
| `/in-review` | In Review | 1484:81502 | page |
| `/welcome` | Welcome | 1484:81512 | page |

### Create, the three shared steps

About, Audience and Screener are one 600px column of `Section` blocks: the green
glyph in a 20px gutter, the copy and fields at +28, a `stroke-1` divider between
sections, and the heading at 18 (`title-s`). About centres its column in the
panel; Audience and Screener put a 488px aside at x 920 with a 48px gutter. The
Create top bar carries **Save Draft & Exit + Continue** on these three steps.

**The two Audience drawings disagree.** 1622:81615 (the numbered step) and
1518:91273 (its no-match state) differ on the field list — Country with flag
chips vs Location, Skills vs Organization size, two conditions vs three, and
Trust Score only in the no-match frame — on the forecast, which only the
no-match frame gives a "No matching respondents?" block, and on the top-bar
button, Continue vs a disabled Publish Study. They are built as two screens so
each matches its own frame; the numbered step is the canonical one.

### Create step 4, Study setup

One step, four variants, driven by the type chosen on step 1. Each variant is
the same three sections — Incentive Payments, Costing Summary, Payment, all
identical across types — under a settings section of its own, and each is drawn
in **states, not separate screens**: the thing still to set up, set up, and the
composer open beside the settings in a two-column split. The top bar's primary
becomes **Proceed to Publish**, drawn disabled.

Survey 1518:91922 / 91779 / 92064. Diary 1518:94580 / 94742 / 94904. Video Call
1518:92729 / 93042 (1:1) / 93335 (focus group). In-Person 1518:93678 / 93998 /
94157 / 94316. The group flavour of a session study swaps seats per session for
the meeting buffer and scheduled sessions for weekly hours.

**Two frames in this section are switched off in the file and cannot be
rendered.** `1518:92891`, Video Call Setup - Platform Managed, and `1518:93673`,
Study Setup & Pricing — the latter is a 2642px reference board holding three
pasted bitmaps and no text, not a screen.

### Create step 5, Payment and Publish

**The four Payment and Publish frames are one screen.** Survey (1518:92247),
video (1622:84446) and diary (1622:86775) are pixel identical — 0 differing
pixels between them. In-person (1622:87629) differs in 4,093 pixels, all inside
the top-bar button box at rows 16-53, cols 1313-1423: Publish Study is drawn
enabled there and disabled on the other three. Same label, size and position.
It is built once, as a state.

Published (1518:92376) ends the flow: the top bar keeps the step chips and drops
both buttons, and Track and manage studies goes to the Studies list.

**The two panels over step 4 and 5, and what opens them.** Add an override
(1518:93557) is opened by **Add Override** on the Date Overrides card, which
sits under Weekly Hours in the availability composer. Payment Breakdown
(1627:95310) is opened by **View Breakdown** on the Payment Summary card on
Payment and Publish, and is the step-4 Costing Summary and Payment sections
lifted into a panel.

### Dashboard — section 826:85653

Only one dashboard state is drawn. `826:86322` (and the `826:85659` inside it) is
**hidden in the file** and holds an older copy of the populated dashboard, not an
empty state, so it cannot be screenshotted and there is nothing to match a
no-studies screen against. The dashboard and the Studies cards view draw the same
`StudyCard`, at 376 and 368 wide.
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/dashboard` | Dashboard | 826:85021 | page |
| `/dashboard/empty` | Dashboard, no studies yet | **not drawn** | page |
| `/notifications` (panel form) | Notifications | 1518:71845 | panel |
| — | Respondent Profile Details | 1704:141690 | panel |

### Studies — section 1518:72486
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/studies` | Studies, Ongoing (table, and cards via the view toggle) | 1518:90600, 1518:90966 | page |
| `/studies/drafts` | Studies, Drafts | 1518:90624 | page |
| `/studies/completed` | Studies, Completed | 1518:90760 | page |
| — | Ongoing study options | 1518:90959, 1726:77013, 1726:57600, 1518:90965 | popover |
| — | Delete Study? | 1726:77088 | modal |
| — | Pause Study Participation? | 1713:144170 | modal |

### Create study — one flow, sections 1518:91778 / 92410 / 93677 / 94579
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/studies/create/about` | About | 1622:81504 | page |
| `/studies/create/audience` | Audience | 1622:81615 | page |
| `/studies/create/audience/no-match` | No matching audience | 1518:91273 | page |
| `/studies/create/screener` | Screener | 1622:81771 | page |
| `/studies/create/study` | Study setup (4 type cards) | 1518:91922 | page |
| `/studies/create/publish` | Payment & Publish | 1622:87629 | page |
| `/studies/create/published` | Published | 1518:92376 | page |
| — | Set Address & Availability | in 1518:93678 | panel |
| — | Add an override | 1518:93557 | panel |
| — | Payment Breakdown | 1627:95310 | panel |
| — | Country Location, Age, Education, Genders, Profile Tiers, Question menu ×2 | 1622:82163–82169 | popover |

### The Manage shell

Every Manage screen sits in `StudyFrame`: the study header (240x182 thumbnail,
type tag, status, title, duration and industry chips, and the four figures
Completed / Qualified / Days Remaining / Progress) on a `bgAlt-1` card, then a
bordered `stroke-1` content card whose top is the six-tab strip — Overview,
Manage Study, Matched, Recruited, Results, Pay — 45px, `bg-1`, with a
`neutral-500` hairline and a 1px `cta-primary` underline on the active tab.
Every tab after the active one is drawn `text-disabled` while a study is paused
(1704:143783) and live otherwise. The paused study is the same frame with a
banner passed in and `muted`.

**The collapse holds at this level of detail, measured.** Study Overview and
Manage Study for diary (1627:95956, 1627:96085) and survey (1645:131436,
1645:131565) differ in 3.49% and 3.26% of pixels, and every differing band is
seeded content — a different study name, description, thumbnail and Roles chip —
plus the one summary row the type changes ("Diary Study Form: 5 questions, 5
days logs" vs "Survey Form: 10 inputs"). The same two components, given a survey
seed, match the survey frames at 1.14% and 1.92%.

**Overview and Manage Study are two jobs, not two views.** Overview is how the
study is running: progress tiles, description, share link, active since. Manage
Study is what the study is: the four Create steps read back as cards, each with
an Edit that returns to that step.

**One contradiction.** The Manage header and the Create About card draw Diary as
a book with a pencil; only the Studies cards frame (1518:90966) draws it as
bars. `StudyTypeTag` takes an `icon` override so each keeps its frame's glyph.

### The recruiting tabs

**Matched and Invited are one tab, not two screens.** 1627:96237 and 1627:96329
share the heading, the description, the three filters and the same nine cards;
only each card's action row changes — `Invite To Study` + `View Profile` become
one disabled `Invitation Sent!`. They are built as a segmented switch and the
route map keeps both node ids on `/studies/:id/matched`.

**Recruited has three flavours, and the type chooses between them**, not a
query or a second screen: a survey or diary lists applications (Name / Role /
Status / Score, Status and Tier filters, a pager); an individual session study
adds a `Scheduled | Applications` switch whose first table is Name / Role /
Score / Session Time with `Join Now` on the imminent slot; a group session study
switches `Sessions | Applications` and lists the sessions as cards with a seats
chip, `View Participants` and an overlapped avatar stack. The two session
frames are drawn on their own studies — In-Person on "Share about your sleep
cycle" and Group Video Call on "Fitness tracker apps experience" — so
`mock/studies.ts` seeds both and `managedStudy(id)` resolves them.

**Cards and rows are different components, deliberately.** Matched and Invited
reuse `RespondentCard`; Recruited is a table. Nothing forces one component to
do both.

**Table geometry is per table, not global.** These two tables use **18px** cell
padding, not the 22 the Studies list uses, and their columns are measured
percentages: applications 16.1 / 32.1 / 14.3 / 37.5, scheduled 14.3 / 28.6 / 17
/ 40.1, with the Session Time cell dropping to 8px on the right so `Join Now`
sits where the frame puts it.

**The frames' left nav is pinned to a 1024 viewport.** Every Manage frame draws
the account card with its avatar at y 895 whatever the artboard height — 1176,
1272 or 1401. The app puts it at the bottom of a sidebar that fills the page, so
on any frame taller than about 1024 the card lands lower than the frame draws
it, costing roughly 1,800 differing pixels (0.1%). This is the frame being a
1024 screenshot pasted onto a long artboard, not a layout error, and it is left
alone.

### Results and the respondent screens

**Results** (1627:96628) is three figures, an AI summaries card, the completed
respondents on 70px rows with `Rate Now` or a flat `Rated` per row, and the
study verification certificate. Its table takes a fifth, unlabelled column for
the button; the pager is `‹ 1 2 ›`.

**Everything behind one respondent is a single screen with three tabs**, not
three screens: Screener, Study Result and Activity, on routes
`/studies/:id/respondent/:rid`, `/result` and `/activity`. The study strip, the
profile rail and the bottom bar are shared; only the tab body and the bar
change. `?state=recruited` drops the Study Result tab and swaps the bar for
Qualify / Disqualify, which is how 1627:97305 differs from 1627:97609.

**The fork is the Study Result tab and nothing else.** Survey and diary list
the answers (the diary under `DAY n` bars); a session study shows the booked
slot, the verification PIN and a rich-text interview notes card instead
(1627:102694, 1627:102902). The Screener tab, the Activity tab, the rail and
the strip are identical for every type. **There is no recording anywhere in
these frames** — the session fork is slot, PIN, notes and a completion
confirmation with `Mark No-show` / `Mark Completed`.

**The slot has three states**, and `1627:103111` from the first inventory no
longer exists: the fragment is now **`1769:93628`, 846x423**, sitting on the
canvas on top of the Scheduled Study respondent frame. It is not a screen, it
is the same session card drawn twice more — running, with `Finish` and a
`0:25:16` timer, and finished, greyed out with a `Completed` chip. Built as
`?session=running` and `?session=finished`.

**Respondent Profile Details is the Dashboard's panel.** 1627:98130 and
1704:141690 differ in 2.43% of pixels: the four Verified items are ordered
column-major on the Dashboard and row-major here, the meta line reads 10 years
on one and 12 on the other, and the Manage frame is 24px taller. Same panel,
same footer (`Invite To Study`, `Save To Micropanel`), so it is imported, not
forked.

**Rate (1627:98286) asks for three things and no arithmetic.** Expertise,
Reliability and Communication at five stars each, plus an optional written
review, then Submit / Cancel. The frame shows no weighting, no resulting score
and nothing about the Trust Score, so the panel records stars and stops there.

**Three frames of one screen disagree.** The left card is 824px wide on
1627:97305 and 836px on 1627:97609 and 1627:97901, which moves the gutter to
the rail from 25 to 13; the breadcrumb reads "Ferry L" while the rail and the
strip name John M; and the Rate panel and the Results breadcrumb name the
survey study on a diary frame. The build keeps one card width (824, the
recruited frame), names the row from Results and the profile from the rail, and
leaves the rest as the frames have it.

### The money screens and the end states

**Two of the three Pay frames are one tab; the third is a different screen.**
1627:96779 and 1627:97128 differ only in five things — the due label gains a
date, the amount, the Total Cost figure, the "As on today" line disappears and
a Net payable cost row appears — and the balance button turns from disabled to
payable. 1627:96956 is not a Pay state at all: 112,993 pixels differ from
1627:96779. It drops the study tabs, drops Create Study from the top bar, and
is routed separately as `/studies/:id/payment`.

**What the client is doing.** The Pay tab is a statement, not an approval: it
reads Payment Due, Deposit Paid and Total Cost, itemises the billing and lists
the transactions already settled. Nothing on it approves a respondent's
earnings — there is no per-respondent row, no approve control and no payout
list. The only action is Pay Balance, drawn unpayable while the study is
recruiting and payable once it is marked completed, and it opens Bill Payment,
which is a card checkout against the invoice: the deposit is netted off and the
client pays the remainder. `AppShell` gained `hideCreate` for that top bar.

**The no-show modals.** 1697:63643, Mark [individual] as No-show, is the 460px
dialog behind `Mark No-show` on a session respondent's Study Result bar. It
names the person four times and warns in red that the respondent will not be
paid. 1697:63580, Mark all as No-show, is the same dialog for a whole session
and is **switched off in the file**: `get_metadata` gives the title bar, the
heading "Didn’t everyone attend?" and the geometry, but names both body texts
"Error", so their content cannot be read and is left unfilled. Both are session
types only; a survey or diary has no session to miss. **No frame draws the
trigger for the "all" variant.**

**Download Sessions Results is one panel with one type-dependent word.**
1627:110569 and 1627:107040 differ in 1,534 pixels: each session yields "Notes"
on the in-person group frame and "Recordings + Transcript" on the group video
call frame. Group types only. **No frame draws its trigger either**, so both it
and the Mark-all modal are reachable in the build through a query parameter
until one turns up.

### The Completed Study Flow section is states, not screens

`1697:61093` holds twelve frames and **every one of them is a screen already
built, drawn with a completed study**. The sizes match frame for frame: Study
Overview 960, Manage Study 1401, Results 1575, the three respondent screens
1365, Pay - Due as completed 1097. Study Overview differs from its ongoing twin
(1627:95956) in 2.83% of pixels, and every differing band is the seed — a
different study name, thumbnail, description and share link — plus the status
tag reading **Completed** instead of Recruiting. Its Pay while ongoing frame
(1697:55119) is switched off, which fits: a completed study has nothing ongoing
to draw.

Two things in it are worth a turn of their own. `1746:95917` **RATED** is a
genuinely new state, the Rate panel read back after submitting: the stars
given, the review, no footer. It is built as `RatePanel rated`. And the two
`Ongoing Study options` popovers in the section are 200x92 and 160x191, both
different from the four already built for the Studies list, so a completed
study's row menu is shorter.

### Manage study — one flow, sections 1627:95955 / 98349 / 100939 / 103596 / 107079 / 1645:131435
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/studies/:id` | Study Overview | 1627:95956 | page |
| `/studies/:id/manage` | Manage Study | 1627:96085 | page |
| `/studies/:id/matched` | Matched | 1627:96237 | page |
| `/studies/:id/invited` | Invited | 1627:96329 | page |
| `/studies/:id/recruited` | Recruited | 1627:96535 | page |
| `/studies/:id/results` | Results | 1627:96628 | page |
| `/studies/:id/pay` | Pay while ongoing | 1627:96779 | page |
| `/studies/:id/pay/due` | Pay, due as completed | 1627:97128 | page |
| `/studies/:id/payment` | Payment | 1627:96956 | page |
| `/studies/:id/respondent/:rid` | Respondent result | 1627:97305 (survey/diary), 1627:102694 + 102902 (session) | page |
| `/studies/:id/respondent/:rid/activity` | Activity of respondent | 1627:97901 | page |
| `/studies/:id/paused` | Paused study | 1704:143783 | page |
| — | Respondent Profile Details | 1627:98130 | panel |
| — | Rate respondent | 1627:98286 | panel |
| — | Download Sessions Results (group) | 1627:107040 | panel |
| — | Mark [individual] as No-show | 1697:63643 | modal |
| — | Completed study flow | 1697:54314–56276 | page |

### Pool, what collapsed and what it lets a client do

**The section holds 24 top-level frames, not the 13 the inventory listed.**
The extras are `1777:98738` Pool - Filters Hidden, a second Invite To Study
(`1779:104093`), two Sent modals (`1777:99979`, `1779:104132`), Discard the
micro-panel? (`1777:100042`) and Delete Micro-Panels? (`1779:101116`). Two more
lessons for Rule 6: a frame's **name** is not a fact either — `1645:162132` is
called "My Panel - Matched" and draws the **Panel Details** tab — and Create
and Edit Micro-panel differ in **0.31%** of pixels, so they are one screen.

**Pool is one screen in four states.** A segmented toggle picks Participants
Pool or Micro-Panels; the pool side shows or hides its 245px filter rail
(1645:161430 / 1777:98738), the panels side switches My Panels
(1645:161580) and Featured Public Panels (1645:162272), which adds a category
chip row. Create Micro-panel is drawn primary on the panels side and tertiary
on the pool side.

**A micro-panel is a saved list the client builds and then recruits from.**
Create Micro-panel is a targeting form — name, domain, role, education,
experience, an NPI-verified toggle, then profile score, gender, location, age,
language and last-active — with a forecast that updates beside it (~1.5K
eligible members, tier split, average score, recommended incentive, time to
fill, rebook rate). Proceed shows the criteria read back and **Create Panel**
makes it. Afterwards the panel has three tabs: **Members**, **Eligible
Matches** (respondents the criteria match, each with `Add To This Panel`) and
**Panel Details** (the criteria and the forecast). From its header the client
can **Invite All To Study** or **Launch Study**.

**My Panel and Featured Panel are the same screen.** A featured panel adds a
description line and a fifth figure (Last Updated), and drops Eligible
Matches, Launch Study and the kebab — a client can invite from a featured
panel but cannot edit its membership.

**Respondent Profile Details is the panel already built.** The Pool frame
(1645:162885, repeated at 1645:163223) is the Dashboard/Manage panel with the
title "Profile of Ferry L."; its `Reviews ›` link opens **Reviews**
(1645:163046), a second page of the same panel listing, per study, the stars
and text the client left **and** the rating the respondent left the client
back ("To client: Google Labs ★ 5.0 …").

**What this section says the client can do, for the scope question.** These
frames give the client, unaided: search the whole participant pool by natural
language and by nine filters; see each respondent's profile score, tier,
verification, full profile and review history; invite any individual to a live
study; build and edit their own micro-panels from live criteria with a
forecast; save respondents into them; invite a whole panel at once; and launch
a study from a panel. Nothing in the section routes a request through Focus
Insite staff, and nothing marks micro-panels as a later phase.

### Pool — section 1645:161429
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/pool` | Pool | 1645:161580 | page |
| `/pool/empty` | Pool, empty | **check: 1645:161430 draws the populated Pool** | page |
| `/pool/panels/:id/members` | My Panel, Members | 1645:161734 | page |
| `/pool/panels/:id/matched` | My Panel, Matched | 1645:162050 | page |
| `/pool/featured/:id` | Featured Panel, Details | 1645:161904 | page |
| `/pool/featured/:id/members` | Featured Panel, Members | 1645:161816 | page |
| `/pool/panels/new` | Create Micro-panel | 1645:162404 | page |
| `/pool/panels/:id/edit` | Edit Micro-panel | 1645:162594 | page |
| — | Respondent Profile Details | 1645:162885 | panel |
| — | Reviews | 1645:163046 | panel |
| — | Invite To Study | 1645:163182 | panel |
| — | Save to micro-panel | 1651:177206 | panel |

### Payments and Notifications, what collapsed

**The Payments section holds 11 frames, not the 6 inventoried.** The extras are
a **third Payments frame that is switched off** (`1663:103724`), a Profile
Tiers popover (`1666:128049`, 320x184), and two modals: `$350 paid
successfully!` (`1779:104245`) and `Remove **** 4242 Card?` (`1779:104288`).

**Payments is one page in two states, not three tabs.** 1663:103326 and
1663:103525 differ in 1.62% of pixels: the segmented toggle switches Pending
and Completed, the third column header changes from "Due Date (auto-debit)" to
"Date", and `Pay Invoice` comes off each row leaving download and view. The
saved cards sit on the **same page** under the table, so there is no separate
methods tab; the hidden third frame may once have been one, but it cannot be
read.

**Invoice Details is one panel in two states.** 1664:127262 and 1663:103948
differ in 8.33%, all in one block: unpaid draws a warm notice — the amount,
"Due on Aug 10, 2026" and "If not paid manually, will be auto-debited from
[Mastercard 4242]" — with **Make Payment** in the footer; paid draws a green
receipt — "Paid $350 successfully!", the card, the timestamp — with
**Download**. The study card, the invoice number, the breakdown and "Net Total
Paid" are identical. (The paid frame names the study "Mobile App Usability
Testing" where the unpaid one uses its title; the same seed slip as elsewhere.)

**Make Payment is not the study checkout.** Bill Payment (1627:96956) is a full
screen with a card form, reached from a study's Pay tab. Make Payment
(1666:127878) is a 375px panel with **no form**: the amount, a link back to
Invoice Details, the saved card already chosen with `Change method`, and
`Pay $350`. It is raised from the Invoice Details panel, which the Payments
table's eye and `Pay Invoice` open. Paying there raises the `$350 paid
successfully!` modal.

**The Notifications page is the panel's content in a page.** 1663:104077 draws
the same rows as 1518:71845 — same icons, titles, bodies, ages and action
buttons, same warm tint on the two unread ones — in a centred 600px column with
the same heading, count chip and "Mark all as read". `NotificationsPanel`'s row
is exported as `NotificationItem` and the page imports it; nothing is drawn
twice. It matches at **0.41%**, the closest screen in the build.

**The four Pool modals.** `Invitation has been sent!` is **one modal raised
from two places**, not two states: a respondent's Invite To Study names the
person (1777:99979), a panel's Invite All To Study names the panel and its
member count (1779:104132). `Discard the micro-panel?` is drawn a size down
from the other dialogs — a 20px title on 33px of padding, not 24 on 44 — so
`Modal` gained `compact`; `Delete Micro-Panels?` is the standard dialog with a
red confirm.

### Payments — section 1663:103325
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/payments` | Payments | 1663:103326 | page |
| `/payments/history` | Payments, history | 1663:103525 | page |
| `/payments/methods` | Payments, methods | 1663:103724 | page |
| — | Add New Card | 1663:103923 | panel |
| — | Make Payment | 1666:127878 | panel |
| — | Invoice Details | 1663:103948, 1664:127262 | panel |

### Notifications — section 1663:104076
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/notifications` | Notifications | 1663:104077 | page |

### Help, what it holds and what a ticket carries

**The section holds 8 frames, and two are switched off**: `1663:104538`
Question menu (165x92) and `1663:104539` Mark as solved? (460x285). The second
is on the brief's build list, so it is built from what `get_metadata` gives —
the check mark, the title and the geometry — with its body text left unfilled,
because that node is named "Error" and its wording cannot be read.

**Help and Support Tickets are one screen.** A 320px segmented toggle swaps the
FAQ list for the tickets table. Beyond the tickets, Help holds **nine FAQs**
under a "Search your queries" field, the first drawn open, and a **Need Direct
Help?** card — narrow beside the FAQs, wide under the tickets — whose Contact
Support raises Ask Support. There are no guides, articles, videos or phone
routes drawn anywhere; the only route to a person is that one form.

**A ticket carries** a subject, a one-line preview of the latest reply prefixed
with who wrote it ("Ronny:" or "You:"), an unread dot, a status of **Open** or
**Solved**, Last Activity, Created On and a number (FI-S562357). Inside, the
thread opens with a **Ticket Info** card the client filled — Subject and
Message, the message naming the study — then attachments, then replies. Each
message carries a time (04:26 PM) under it, and the frame groups an attachment
with the message above it under **one** timestamp, not two.

**Ticket Chat is one screen in two states**, 0.40% apart: the status tag, and
whether the composer is drawn. A **Solved** ticket has no composer — it cannot
be replied to. Open shows attach, "Write a message..." and Send.

**No reply time or response expectation is drawn.** No SLA, no "we reply
within", no queue position, no business hours. The only thing said about timing
is on the Sent successfully! dialog: "Our team and assistants will review and
reach out to you shortly."

**The respondent app's answer-first pattern does appear here.** The first reply
in the thread is tagged **"FI-Smart Assitant here!"** (the frame's own spelling)
on a warm bubble, and the success dialog says "Our team **and assistants**".
Nothing on the frames shows FAQ or guide articles being quoted into a reply, a
handover step, or an escalation control — the badge on the reply and that one
word in the dialog are the whole of it.

### Help — section 1663:104190
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/help` | Help | 1663:104191 | page |
| `/help/tickets` | Support Tickets | 1663:104228 | page |
| `/help/tickets/:id` | Ticket Chat | 1663:104436, 1663:104484 | page |
| — | Ask Support | 1663:104557 | panel |
| — | Mark as solved? | 1663:104539 | modal |
| — | Sent successfully! | 1663:104580 | modal |

### Account — section 1663:104599
| Route | Screen | Node | Kind |
|---|---|---|---|
| `/account` | Profile | 1663:104600 | page |
| `/account/reviews` | Rating & Reviews | 1663:104635 | page |
| `/account/certificate` | Certificate | 1663:104813 | page |
| `/account/settings` | Settings | 1663:104876 | page |
| — | Change Password | 1663:104917 | modal |
| — | Deactivate Account | 1663:104938 | modal |
| — | Logout | 1663:104959 | modal |
| — | Password has been updated! | 1671:129377 | modal |
| — | Your account has been deactivated! | 1684:129405 | modal |
| — | Alert: your account has active studies! | 1684:129433 | modal |

### Dev
`/kitchen-sink` renders every repeating component on one page.

---

## Build order

One section per turn, each ending with renders compared against the frames.

| # | Turn | Nodes |
|---|---|---|
| 1 | **Foundation** (done): folder, tokens, shell, components, kitchen sink, this map | 826:85021, 290:16858 |
| 2 | **Studies list** (done): Ongoing table and cards, Drafts, Completed, the four row menus, Pause and Delete dialogs, Paused study, and the Audience no-match screen | 1518:90600–90966, 1726:77088, 1713:144170, 1704:143783, 1518:91273 |
| 3 | Dashboard, both states, plus the notification panel and the respondent panel it opens | 826:85021, 826:85659, 1518:71845, 1704:141690 |
| 4 | Create, steps 1–3: About, Audience (no-match already built), Screener, with the seven popovers | 1622:81504, 81615, 81771 |
| 5 | Create, steps 4–5: the four type setups, Set Address & Availability, overrides, Payment & Publish, Published | 1518:91922, 93678, 92729, 94580, 1622:87629 |
| 6 | Manage, the study frame: Overview, Manage Study, the tab bar, the type summary row | 1627:95956, 96085 |
| 7 | Manage, recruiting: Matched, Invited, Recruited (both states), the profile and invite panels | 1627:96237, 96329, 96535, 101612, 98130 |
| 8 | Manage, results: Results (individual and group), respondent result both forks, Activity, Rate, Download Sessions | 1627:96628, 97305, 102694, 102902, 97901, 98286, 107040 |
| 9 | Manage, money and end states: Pay while ongoing, Pay due, Payment, Paused, No-show dialogs, Completed study flow | 1627:96779, 96956, 97128, 1704:143783, 1697:63643, 54314–56276 |
| 10 | Pool: list, empty, my panels, featured panels, create and edit micro-panel, the four panels | 1645:161430–163223 |
| 11 | Payments: the three tabs, Add New Card, Make Payment, Invoice Details | 1663:103326–103948 |
| 12 | Notifications and Help: notifications, help, tickets, chat, Ask Support, its dialogs | 1663:104077–104580 |
| 13 | Account: profile, reviews, certificate, settings, the six dialogs | 1663:104600–1684:129433 |
| 14 | Onboarding: sign up through welcome, and pricing | 1484:81318–81512, 1512:68177 |
| 15 | Sweep: walk every route at 1440 against its frame, fix the differences, list what is still off | all |

Stage two, wiring the behaviour to the 58-step workflow, starts after that.
