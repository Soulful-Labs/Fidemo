# Product Requirements Document
# Focus Insite / HumanLayer Platform

**22 October 2026 · Soulful Labs**

**The front end for all three apps is built, deployed and working. The job is to put a real back end behind it.** Section 23 is written for that.

**This document and the BRD are self-contained.** The workflow is in Section 15, every policy value is in Section 6, and every decision is in Section 16. Five decisions are open, and are recorded as open in Section 16 (D32 to D36). Nothing else is left open.

---

## 0. Scope and sources

This document describes **three front-end applications** that together make one platform: what each screen is, what every control does, what states the system can be in, and what rule governs each number on screen.

**Platforms, and this is fixed for the MVP.**

| App | Platform | Width |
|---|---|---|
| Respondent app | Mobile only | 375px |
| Client app | Desktop only | 1440px |
| Internal team console | Desktop only | 1440px |

**No other version of any app is being built.** The respondent app has no desktop version, and opening it on a desktop browser shows the mobile layout. The client app and the console have no mobile or tablet version and are not responsive below 1440px. This holds for the MVP and is not an omission to be corrected.

**In scope:** everything a user sees and does. Screens, routes, states, controls, validation, copy, navigation, and the rules that decide what appears.

**Also in scope:** what the back end has to provide, in **Section 23**. The data contract, what each resource must support, access rules, retention, the states nothing is drawn for, and what to build in what order.

**Deliberately not specified:** how the database tables are designed, and how the back-end code is organised internally. Those are the developer's decisions.

This document describes each step and what the screens show around it, not how to implement the step. For example, where it says "the system verifies the ID against government records", it is recording that this step exists and what the participant sees before, during and after it. How that verification is carried out is not prescribed.

**The technology stack is in Section 22.3**, with the options considered and the current preference for each. It is an estimation rather than an instruction. The final stack is the developer's to choose, and should be confirmed back to Soulful Labs.

**Where the figures come from.** A working front-end prototype of all three apps exists and is deployed. Every screen described here has been built and measured against its Figma frame. Every number, string and measurement came from the design file or the built code.

| Source | Governs |
|---|---|
| The Figma design file | Appearance and every visible string |
| **Section 15 of this document** | Behaviour: what happens, in what order, who does it. This is the current workflow and supersedes any earlier workflow document |
| The Trust and Rewards policy, version 2 (22 October 2026) | Scores, tiers, points, redemption, scheduling, ratings, consent, restriction, the certificate and client fees. Governs the other two on those subjects. **It is reproduced in full in Section 6**, so no separate policy document is required |

Where they disagreed, **Section 16** records the decision taken and why. The five open decisions are marked as open there. Read Section 16 before building anything involving money, scores or approvals.

**Working prototype.** All three apps run on one origin and share one data layer, so a change in one appears in the others.

| App | Link |
|---|---|
| Respondent (mobile) | https://fidemo-lyart.vercel.app |
| Client (desktop) | https://fidemo-lyart.vercel.app/client |
| Internal team console (desktop) | https://fidemo-lyart.vercel.app/internal |

**The designs.** All three apps are in one Figma file, on separate pages.

| Page | Link |
|---|---|
| Whole file | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App |
| Respondent app (mobile) | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=204-6318 |
| Client app (desktop) | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=826-85016 |
| Internal team console (desktop) | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=1794-64316 |

**The code.** Repository `Soulful-Labs/Fidemo`, branch `claude/dreamy-carson-x5ctvp`. The respondent app is at the root, the client app in `client/`, the console in `internal/`, and the shared data layer in `shared/`.

**Demo sign-ins.** Shown on each app's own sign-in screen. The console uses `peter@focusinsite.com` for a master admin and `maya.thompson@humanlayer.com` for a restricted sub-admin, both with the password `demo1234`. The respondent app's demo participant is `jonathan.reeve@example.com` with the password `Passw0rd!`, the same password every seeded participant has. Signing in as the master admin or the demo participant resets the demo data; any other account signs in with its own password and resets nothing. Participant passwords are a front-end stand-in for real authentication (Section 23.8).

**All data currently lives in the browser's own storage.** Nothing is shared between devices or people. Replacing that is the job. See Section 23.

---

## 1. The product in one page

**HumanLayer** is the platform being built. It is a market research participation platform.

**Focus Insite** is the company that already carries out this research, today by hand. HumanLayer is being built to automate that work, and Focus Insite will operate it. Where this document refers to "the team", it means Focus Insite's own team.

Three groups of people use the platform.

**Participants (respondents)** are ordinary verified people who get paid to take part in research studies: filling in surveys, joining video calls, attending in-person sessions, or keeping a diary over several days. They use a **mobile app**. They build up a Trust Score and a tier, earn cash and reward points, and withdraw money to a bank account.

**Clients** are companies who need to hear from specific kinds of people. They use a **desktop app**. They create a study, describe who they want, write screening questions, set an incentive, pay, and then watch the study fill up and collect the results.

**The Focus Insite team** operates the platform. They use a **desktop console**. They verify people's identity and professional credentials, verify client businesses, review and approve every new study before it goes live, change a live study when it needs it, moderate reported accounts and reported studies, answer support tickets, release participant withdrawals, confirm refunds, and set the platform's fees and reward values.

The central idea: **a verified human**. The platform's value is that a client talking to 30 people knows those 30 people are real, are who they say they are, and have the professional background they claim. Every feature serves that: identity verification, professional credential verification, the Trust Score, the tier system, the human certificate, and the team sitting in the middle checking things machines could not.

---

## 2. Glossary

Read this before anything else. Several words mean something specific here.

| Term | Meaning |
|---|---|
| **Participant / Respondent** | A person who takes part in studies and gets paid. The two words are used interchangeably across the three apps; the mobile app says "participant", the client and console apps say "respondent". They are the same thing. |
| **Client** | A company or researcher who pays for a study. One person per client account; there are no team seats. |
| **Study** | One piece of research. Has a type, a target audience, a screener, an incentive and a participant target. |
| **Study type** | One of six: Survey, Video Call (1:1), Group Video Call, In-Person (1:1), In-Person Group, Diary. The type changes what a participant does and how scheduling works. It does **not** create a separate flow anywhere; every screen switches on type. |
| **Screener** | A set of questions a participant answers when applying. Each answer carries a verdict set by the client: Correct, Incorrect, May Select, Must Select. |
| **Matched** | A participant the platform surfaced from the pool because they fit the study's audience criteria. They have not applied. |
| **Invited** | A matched participant the client has invited to apply. |
| **Applied** | A participant who completed the screener and is waiting for a decision. |
| **Qualified / Disqualified** | The decision on an applied participant. |
| **Recruited** | The set of people who applied, in all their states. |
| **Session** | A scheduled appointment for a video or in-person study. Group types have several people per session. |
| **Verification PIN** | A six-digit code shown on a session. The participant gives it to prove attendance. |
| **No-show** | A recruited participant who did not attend their session. They are not paid for the study. |
| **Trust Score** | A participant's reputation, 50 to 100. Starts at 50. Governed by the signed policy. |
| **Tier** | Silver, Gold or Platinum, derived from the Trust Score at 50 / 70 / 90. |
| **Reward points** | A second currency earned alongside cash. Redeemable for cash at 100 points to $1, minimum 1,000 points. |
| **Human Certificate** | A badge a participant holds once identity is verified. |
| **Incentive** | The cash a participant is paid for completing a study. |
| **Deposit** | Money the client pays when a study is submitted, set against what the study will cost. How much is an open decision; see D32. |
| **Refund** | Money returned to a client when a study does not fill its target. |
| **Study report** | A participant's report that something is wrong with a study, from a fixed list of reasons. The team reviews it in Studies > Reported. |
| **Withdrawal** | A participant's request to move wallet money to their bank account. It waits until a team member releases it. |
| **Revisions History** | The record of every round of changes to a submitted study: when, who (the client or the team), and field by field what changed. |
| **Master Admin** | The Focus Insite team member with access to every module. |
| **Sub-admin** | A team member with access to only some modules, set per module by the master admin. |

---

## 3. The platform model

**This is a managed platform with a few self-serve pieces.**

| Who does what | Detail |
|---|---|
| The client does | Creates a study end to end, invites matched people, qualifies or disqualifies applicants, marks attendance and completion, rates participants, pays invoices |
| The team does | Approves every study before it goes live, changes a live study when it needs it, releases every withdrawal before money moves, verifies identities and businesses, handles reports on people and on studies, and restrictions, answers support, sets fees and reward values |
| The team only does | Nothing exclusive in the client-facing apps. A client searches the pool and invites directly |

So: self-serve creation, team approval at the two gates that matter, self-serve running.

The earlier workflow said there was no self-serve option at all. The designs draw one. This is the settled position between them, and everything in this document assumes it. See D1.

---

## 4. Shared foundations

### 4.1 The three applications

| | Respondent app | Client app | Internal console |
|---|---|---|---|
| Device | Mobile only | Desktop only | Desktop only |
| Design width | 375px | 1440px | 1440px |
| Theme | Dark | Light | Light |
| Brand shown | HumanLayer | HumanLayer | HumanLayer, with the sidebar reading Admin Panel |
| Navigation | Bottom tab bar, 4 tabs | Left sidebar, 240px | Left sidebar, 230px |
| Screens | ~95 | ~90 | ~95 |

**There is no desktop version of the respondent app and none is planned.** On a laptop it renders as a centred phone-width column inside a frame, with background either side. Every overlay, modal, sheet, confetti and glow is clipped by that frame. Do not build a wide layout for it.

**Brand.** All three apps carry the HumanLayer name, spelt as one word with a capital H and L, as the logo spells it. The client app's sidebar and landing page carry the H mark beside the wordmark, as the console and the respondent app do. The console's browser tab reads "HumanLayer Admin Panel", its sidebar reads "Admin Panel" beside the HumanLayer mark, and its entrance reads "HumanLayer team console". Each app's browser tab shows the HumanLayer H with its green dot. Focus Insite is the operating company: the client's terms agreement keeps its name. See D11. The wordmark is the same grey in all three apps: each app's Text/body (#9d9d9d in the client app and the console, #9e9e9e in the respondent app).

### 4.2 Design tokens

Each app has its own token set. **Do not share tokens between apps.** They were extracted separately from the design file and they differ.

**Respondent app: dark, warm**

```
brand.primary   #fca311    brand.secondary  #3fb984
bg.0 #0c0800    bg.1 #15130f    bg.2 #201e19
bgAlt.0 #020805 bgAlt.2 #202623
text.title #fafafa  text.subtitle #d0d0d0  text.body #9e9e9e  text.disabled #5e5d5b
tier.gold #e4b300  tier.platinum #9139f6  tier.silver #b9b9b9
state.success #00cc66  state.danger #e33a38  state.dangerBg #3a1a17
radius: none 2, sm 8, md 12, lg 16, xl 24, full 100
font: Geist
```

Two background palettes that must never mix on one screen: warm `bg.*` for auth, onboarding, dashboard, studies and profile; green-tinted `bgAlt.*` for Trust Score, Reward Points and Wallet.

**Client app: light.** Chrome is `yellow-20` (#f7f4f0) for the nav, top bar and page; the content panel is `bg-0` (#fdfdfc), inset 8px from the nav and the right edge, starting at y=78. The Dashboard panel is `bgAlt-0` (#fbfefd) instead. The primary CTA is a vertical gradient #fdc86f to #fca311 with a 2px `yellow-700` bottom edge.

**Internal console: light.** Sidebar `bg-1` (#f8f8f7) with a 1px #f0f0ef right edge. Page `bg-0`. Primary button is a gradient yellow-300 → yellow-400 → yellow-500 with a 1px yellow-100 top and a 3px yellow-700 base. Destructive is #ea5a00 with a 3px #dc5500 base. Font Geist.

**Colour rules that apply to all three apps:**

1. **Red is only for things that are wrong.** No-show, rejected, destructive confirmations, validation errors. Never for a neutral or informational state.
2. **Never put two colours together that are only shades of each other.** They must read as clearly different.
3. No hardcoded colours anywhere. Tokens only.

### 4.3 Layout constants

**Respondent app**

| Thing | Value |
|---|---|
| Frame width | 375px, centred in a phone shell on wider screens |
| Side gutter | 16px, content width 343px |
| Title bar | 56px, 93px with a progress bar |
| Bottom nav | 85px |
| Bottom CTA bar | 96px, fixed, above the nav |
| Card radius | 16px |
| Button height | 48 primary, 38 secondary, 24 inline |
| Input height | 48, 72 with a label above |
| Minimum touch target | 44px |

**Client app**

| Thing | Value |
|---|---|
| Left navigation | 240px |
| Top bar | 68px |
| Side panel | 600px |
| Modal | 460px |
| Table rows and header bands | 52px, 22px cell padding (18px on the recruiting tables) |
| Segmented tab group | 343 × 48, 112px tabs |
| Button heights | md 40, row 38, sm 32 |

**Internal console**

| Thing | Value |
|---|---|
| Sidebar | 230px wide, fixed to the viewport height |
| Title bar | 70px, 1px hairline at y 69, three slots: breadcrumbs, centre, right CTAs |
| Content | starts x 254, y 94, 1162 wide |
| Side panel | 600px |
| Modal | 460px |
| Table | header 52, rows 64, 16px cell padding |
| Buttons | lg 48, md 38, sm 32 |
| Inputs | 48 standard, 38 inside dialogs |

One exception each: the console's **Review a new study** screen sits 16px inside the shell, not 24. The console's **video 1:1 Manage** frames also sit 16px inside. Build as drawn.

### 4.4 Component inventory

Build these once per app and reuse them. A second version of any of these is a bug.

**Respondent app primitives:** Button, Input, Tag, Toggle, Modal, BottomSheet, TopBar, TabBar, Picker, Stepper.
**Respondent app composites:** StudyCard, ScoreDial, StatTile, NotificationRow, EmptyState, ProgressBar, Timeline.

**One StudyCard.** Every list in the respondent app uses the same card component with different props. Never fork it per screen.

**Client and console primitives:** Button (4 variants × 3 sizes), IconButton, Input, PasswordInput, SearchInput, Select, TextArea, Toggle, Checkbox, Radio, UnderlineTabs, SegmentedTabs, Tag (7 tones), CountBadge, Chip, OptionTile, Avatar (5 sizes), Table, Pagination, SidePanel, Modal, SuccessModal.

**Every app has a `/kitchen-sink` route** rendering every component in every state on one page. It is a development aid for checking a shared change. **It must not be reachable in production.**

Measured specifics worth copying exactly (console, and the client is near-identical):

- **Toggle**: 40 × 24 track, 18px knob, 3px inset. Off: stroke-input track, subtitle knob. On: brand-primary track, bg-1 knob.
- **Underline tabs**: 42 tall, 16px sides, brand-primary text and a 1px underline when active over a 1px baseline, 24px count pill.
- **Segmented tabs**: 48 track, 4px padding, active pill 40 tall.
- **Side panel**: 600 wide, an 18px title in a 56px title bar, footer of two 48px buttons 16 apart. In the client app (23 October 2026) it has two placements. A **pop-up** (the default) opens in the centre of the screen, as tall as its content, every corner rounded: Rate, Ask Support, Invite To Study, Add New Card, Edit Card, Make Payment, Pay All Due Invoices, Download Sessions Results, Payment Breakdown, Add an override. A **sheet** is a full-height overlay anchored to the right edge, top to bottom, rounded left corners, for long scrollable content: a participant's profile (with its Reviews page), Notifications, Invoice Details. The 460px dialogs were already centred.
- **Modal**: 460 wide. Centred variant: title, body max 310px, 40px above and below. Titled variant: 56px title bar, blocks 24 apart. Bottom bar 80px.
- **Success modal**: a 160px disc, a 92px badge with a 4px rim, a white tick, one 48px button.

### 4.5 Global interaction rules

These apply to all three apps.

1. **No dead controls.** Every interactive element routes somewhere, changes state, opens something, or shows a toast. If a control has no destination yet, it opens a "coming soon" sheet naming the screen. Never a no-op. This is the single most important functional requirement.
2. **Back goes to the logical parent**, not browser history, where they differ. Leaving a flow part way opens the matching exit confirmation.
3. **Toasts** for anything that changes state without navigating. Three seconds.
4. **Validation** runs on blur and on submit. Errors sit under the field in the danger colour. Submit is disabled until the form is valid.
5. **Loading.** Any action that would hit a server shows a spinner or skeleton for about 600ms first.
6. **Empty states for every list**, with their own copy. Lists that need one: Saved, Drafts, Applied, History, Notifications, Payout History, Referrals, Support Tickets, and every console and client table.
7. **Disabled states explain themselves.** A disabled Reschedule button says why when tapped.
8. **Scroll position** resets on navigation and is restored when returning to a list.
9. **Nothing is ever clipped.** Content must not be cut by a frame edge, hidden under a bar, or overlap anything else. Containment and clipping are two different tests and both must pass.

### 4.6 Three kinds of dead control that normal testing misses

Found repeatedly during the build. Check for each specifically.

1. **Text styled like a control that is not one.** "Forgot Password?" as a paragraph, "Learn about payment options" as a styled span, a copy glyph inside a `<span>`. An automated audit only queries buttons, links and tabs, so these are never clicked.
2. **A control whose only handler closes the thing it is in.** A menu item that calls `onClose` and nothing else passes every test, because closing a menu is a real change.
3. **An input bound to nothing.** A form that accepts typing and discards it.

And the structural blind spot: **the contents of a panel or modal are never reached by a normal route sweep**, because the driver clicks the trigger and then reloads. Every panel and modal must be opened and exercised by hand.

---

## 5. Domain objects and state machines

This section is the behavioural core. Everything on every screen is derived from these.

### 5.1 Study lifecycle

```
draft → in_review → recruiting → ongoing → billing → completed
                 ↘ (changes requested) → draft
   recruiting/ongoing → paused → recruiting/ongoing
   recruiting/ongoing/paused → billing
   billing → recruiting (Re-publish and Recruit)
```

| State | Who put it here | Where it appears | What can happen next |
|---|---|---|---|
| `draft` | Client saved and exited the create flow | Client > Studies > Drafts | Client resumes and publishes → `in_review` |
| `in_review` | Client pressed Publish | Console > Studies > To Review | Team approves → `recruiting`. Team requests changes → `draft` with a note |
| `recruiting` | Team approved | Client > Studies > Ongoing; Console > Studies > Ongoing | → `ongoing`, `paused`, or `billing` when it is stopped or fills its target. When the target is met the client may choose Recruit more, and the study keeps recruiting |
| `paused` | Client or team paused, with a reason | Both, with a red banner | Resume → previous state. Stop-complete → `billing` |
| `billing` | The client or the team pressed Stop-complete, or the study's last completion filled its target | Studies > Ongoing in both apps, status tag "Billing" | The bill is paid → `completed`. If nothing was owed when it stopped, it goes straight to `completed`. Re-publish and Recruit → `recruiting` |
| `completed` | The bill was paid, or nothing was owed when the study stopped | Studies > Completed | Read only, downloads still work. A completed study is closed: nothing moves it again |
| `cancelled` | Not drawn in any screen | none | See D14 |

**Rules:**

- A study can only be in one state. The tab it appears under is derived from the state, never set separately.
- A live study is changed only by the team, in the console's Edit Study. The client cannot edit a live study. The study type cannot change, and nor can the availability, addresses or sessions people may already have booked. Whether the team may change the incentive or the number of participants is open; see D33. See D7.
- Every round of changes to a submitted study, by the client before approval or by the team after it, is recorded in the study's Revisions History with who made it and what changed.
- Stop-complete asks for confirmation first: "Stop and Mark Study Completed?".
- A study cannot go straight from running to `completed`. It always passes through `billing`.
- **Billing finishes the study for participants.** Sessions not yet run are cancelled at no cost to the participant, the client and the team are told, and the team can process payouts from Finance > Payouts. A participant never waits on the client's invoice.
- **Re-publish and Recruit** returns a study in Billing to recruiting. It changes no amount. The balance falls due again, on the same rule, when the study next stops. Once the bill is paid the study is completed and the option is gone.
- **Recruit more**: when a study meets its target, the client is offered "Congrats!" with Recruit more. Choosing it keeps the study recruiting past its target, and the banner is not shown again. Without it, the completion that fills the target moves the study to Billing by itself.
- Pausing stops new recruitment. It does not cancel booked sessions. The status tag in the console still reads "Recruiting" while paused, which is a design bug: it should read "Paused".

### 5.2 Respondent-in-study lifecycle

This is separate from the participant's account state. One person has one account state and many study participations.

```
matched → invited → applied → qualified → scheduled → completed → rated
                           ↘ disqualified
                                        scheduled → no_show
```

| State | Set by | Appears under |
|---|---|---|
| `matched` | The platform, from audience criteria | Client > study > Matched |
| `invited` | Client invites a matched person | Client > study > Matched, Invited segment |
| `applied` | Participant completes the screener | Both > study > Recruited |
| `qualified` | A person presses Qualify | Recruited, status tag |
| `disqualified` | A person presses Disqualify | Recruited, status tag |
| `scheduled` | Participant books a slot (session types only) | Recruited, Scheduled segment |
| `completed` | Attendance confirmed, or submission received | Results |
| `no_show` | A person marks them absent | Results, and the participant's history |
| `rated` | Client rates them after completion | Results, "Rated" instead of "Rate Now" |

**The qualify decision.** It lives on one screen only: the Screener tab of an applied respondent, inside the client app and the console. The bar reads: "Choose Qualify for further study or Disqualify to reject from here. The action can be undone within 1 hour only after it is taken." Four states are drawn: undecided, qualified with Undo, qualified with Undo gone, disqualified with Undo.

**Who presses it is not settled.** The wording on the bar is the client's ("You have qualified this respondent"), the same control appears in the console, and nothing anywhere records who pressed it. See D4.

**Two-stage screening does not exist in the designs.** The earlier workflow described a pre-screener, then a full screener, with borderline answers held for review. The designs draw one decision. There is no automatic pass or fail, no held-for-review state and no terminated state. See D3.

### 5.3 Attendance

For every session-based study the platform generates a **six-digit Verification PIN** (drawn as 152438). It is shown on the session. One PIN serves a whole group session.

The flow, as drawn:

1. The participant enters the PIN in their app at the session. The activity log records "Verified with PIN by [name] (participant)".
2. A person then confirms by hand: "Mark as completed for an additional confirmation". The log records "Marked as completed by client (you)".

So the PIN is the participant's proof and a human confirmation is a second, separate step. Both are required.

**Marking a no-show.** One-to-one: a dialog warning "This will not allow [name] to get paid for this study and will be confirmed by our team further from [other party] as well." Afterwards an Undo button, with no time limit drawn. Group: "This will not allow [name] to get paid for this study." A group in-person no-show can be reversed with "Mark Completed", which asks "Had [name] completed? … This will mark [name] as completed and will get paid the reward incentive. This cannot be undone." Group video draws no way back.

**No no-show dialog mentions the Trust Score.** They speak only about payment. The policy says a no-show costs 4 points of Trust Score. Nothing at the point of marking says so. See D6.

**The attendance actions follow the participant's state**, on the console's session rows and one-to-one bar and on the client's respondent result.

| Participant | Shown |
|---|---|
| Nothing recorded | Mark No-show and Mark Completed |
| Completed | In the console: Mark No-show, and a green "Marked completed by participant", or "Marked completed" when the team or the client confirmed it. In the client app: the green read-back, with Undo beside it while unpaid when the client marked it (1769:86063) |
| No-show | In the console: Mark Completed, and a red "Marked as No-show". In the client app: Undo beside the red read-back (1627:106074) |
| Paid | Only the read-back |

The two apps follow their own frames, so the same action reads two ways; this is with the designer.

The read-backs are not buttons. Surveys and diaries have no session, so they have no attendance actions.

**Cancelling a session.** A client cancels a one-to-one booking from its row on Recruited; the team cancels a group session from its session page. Either must give a reason: the button stays off until there is one, and the store refuses an empty one. It costs the participant nothing, even inside 24 hours. The participant is told in a "Study cancelled by client" notification that carries the reason, and the reason is kept against the booking with when, the slot and who cancelled. The team sees it on the respondent's Activity tab ("Session cancelled by the client: [reason]"). A participant's own cancellation is in 6.5 and has no reason field.

**Not drawn, and needed:** the team cannot cancel a one-to-one booking (it needs a Cancel Session control on the console's Scheduled row or booked respondent page), and a client cannot cancel one seat on a group session (it needs a client session page listing the seats, or a Cancel on the group respondent's result page).

### 5.4 Participant account lifecycle

```
registered → verifying → active → restricted → active
                              ↘ deactivated → active (reactivated)
```

| State | How | Effect |
|---|---|---|
| `registered` | Signed up, profile not complete | Can browse, cannot apply |
| `verifying` | ID submitted and in review, waiting for the team to verify it in the console | Can browse; cannot apply. Applying says "Your ID is in review" |
| `active` | Identity verified by the team | Full use. Certificate issued. The participant is told |
| `restricted` | Team restricted after an upheld report | Cannot participate, withdraw earnings or redeem rewards, for a fixed period |
| `deactivated` | Team deactivated, with a written reason and the team member's password | No access. An email is sent with the reason. The person can appeal |
| `deactivated`, closed by the participant | The participant's own Deactivate Account, confirmed with their password | Cannot sign in ("You closed this account. Contact us to reopen it"). The console shows it deactivated, category "Closed by the participant", and the team can reactivate it. Paying out the balance and deleting after 30 days are the server's (23.8) |

**Passwords.** Every participant has one. Sign In checks it and a wrong one is refused under the field; it never signs anyone in as someone else. Sign Up refuses an email already on the platform. Change Password needs the current password. Set New Password saves the new one for the email given on Forgot Password. Deactivate Account needs the password. In this build the password is held by the shared data layer as a front-end stand-in for real authentication (Section 23.8).

**The restriction ladder**, drawn only on one console frame: first offence 15 days, second 15 days, third 30 days, fourth deactivation. **This rule exists nowhere else.** It is not in the Trust and Rewards policy and was not in the earlier workflow. It needs to be written down officially before it is built. See D9.

**Reactivation** mirrors deactivation: a reason, the team member's password, a confirmation, an email. So deactivation is reversible.

### 5.5 Client account lifecycle

```
signed up → email confirmed → details submitted → payment method added → in review → active
                                                                                   ↘ deactivated
```

A client account is reviewed by the Focus Insite team before it opens. The client sees "Submitted to review! Our team will just review your account credentials quickly and confirm through email within few hours!" and then a Welcome screen: "You are now verified and ready to start your research studies now!"

**But the console has no client approval queue.** Only clients whose *automatic* business check failed reach the console, in the Clients > Verifications queue. No screen anywhere shows a client waiting for approval, and nothing blocks a pending client from running studies. See D8.

**Business verification checks two typed fields**, the VAT (Tax) number and the company website, against records. No document is uploaded or reviewed.

**Deactivation rule:** "Your account will be deactivated once all running studies gets ended." If a client with live studies submits the deactivation form, they get "Your account has active studies! Account can be deactivated only after completing all the studies."

**The team deactivating a client** follows the same rule. It is refused while any of the client's studies is recruiting, ongoing or paused, or an invoice is unpaid. The console says "[Company] has active studies!", naming every study and invoice in the way, with Got It!. The store refuses it too.

### 5.6 Verification lifecycle

Three kinds of verification, all handled in the console, all following the same shape.

| Kind | What is checked | Against |
|---|---|---|
| Identity | Two uploaded ID document files (front and back) | Government records |
| Profession | Occupation and licence or certificate number, typed | Official records |
| Business (clients) | VAT number and company website, typed | Business records |

**Every participant check reaches a person** (decided 23 October 2026). A submitted ID, and a licence or certificate number when one is given, is `in_review` until a team member marks it verified or rejects it in Participants > Verifications; nothing is verified automatically in this build. The queue lists it with the date it was submitted and "Submitted for review"; the detail shows the files as the participant named them, with their sizes, and "Waiting for your decision". Checks that an automatic check flagged ("Uploaded passport file could not be verified with the govt. records. Verify it manually.") sit in the same queue. Changing the ID in Account Settings (a new type needs both sides uploaded again) or changing the credential number on My Profile starts a new review.

**Decisions available:** Mark Verified, Reject, Chat.

- **Mark Verified** requires a written Verification Statement and the team member's password, checked against the signed-in member's own password, then a confirmation step, then an outcome message. Identity: "[Name]'s account is now fully active to participate in studies." Profession: "… will be displayed on [name]'s profile publicly."
- **Reject** requires a written Rejection Statement. Warns "necessary action will be taken with impacting this account".
- **Chat** opens a support ticket. **It is the only way to ask someone for a better document.** There is no "request resubmission" state.

No undo is drawn for any verification decision. No decision records which team member made it; notes carry a date only.

**No selfie.** Selfie and liveness verification are out of the product (23 October 2026). No app asks for, shows or claims one: the Identity step has no selfie field, Account Settings has no selfie row or "Human Verified" tag, and the console's "Selfie photo verified" lines and "Human Verified" tags are gone. The participant is told the outcome of each decision in a notification. See D5.

### 5.7 Report and moderation lifecycle

There are two kinds of report: a report about a participant, and a report about a study.

**Reports about a participant** arrive in a second verification queue, from a person on the team or from a client. Nobody is ever reported by the system.

| Field | Values |
|---|---|
| Reported by | A named person on the team, or the client who reported them |
| Category, from the team | AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong Match |
| Category, from a client | Was asking to collaborate outside; Participant is misrepresenting their identity; Profession looks like a scam or suspicious; Participant had an inappropriate behavior; Other |
| Reason | Free text. A client must describe the report, up to 500 characters |

A client reports a participant from that participant's page in one of the client's studies.

Decisions: **Reject Report** (warns "cannot be undone later"), **Restrict Account** (statement and password; "restricted to participate, withdraw earnings & rewards, for 15 days as for the 1st time"), **Deactivate Account**.

**Reports about a study** come from participants, from the study's detail screen.

```
pending → resolved
```

| Field | Values |
|---|---|
| Reason | Client is offering payment outside; Client is misrepresenting their identity; Study looks like a scam or contains a suspicious link; Study contains contact information; Study seems illegal or unethical; Study is unclear or incomplete; This is ad, not a study; Other |
| Description | Required, up to 500 characters |

A reported study appears in the console under Studies > Reported. Nothing changes for the study itself until the team acts. The team can:

- **Chat**, which opens one support ticket with the client about the study's reports.
- **Mark Reports Resolved**, which needs a written statement and the signed-in team member's password, and resolves every open report on that study together.

**Not designed:** reported, flagged and restricted people are not marked anywhere in the main participants list. No status column, no filter, no tag. Such a person can be acted on from the queue but cannot be found by searching the list.

### 5.8 Support ticket lifecycle

```
new → ongoing → closed → ongoing (re-opened)
```

| State | Composer | Title-bar action |
|---|---|---|
| New (user created) | Yes | Mark Resolved, greyed |
| Ongoing | Yes | Mark Resolved, live |
| Closed | No. A closed ticket cannot be replied to | Re-open |

A ticket carries: a number (FI-S562357), a subject, a status (Open / Closed), the thread, and a link to the user's profile. The first message is a "Ticket Info" card holding the Subject and Message the user wrote, plus any attachment.

**Not drawn anywhere:** category, priority, assignment to a team member, escalation, transfer, internal notes, canned replies, reply-time targets, queue position. **Nothing distinguishes a participant's ticket from a client's** in the console list, although the Dashboard groups them.

**The automatic first answer.** The intended model is that a ticket is first answered automatically from a fixed set of FAQs and platform guides, and anything those do not cover reaches a person. The only trace of this in any design is in the *client* app: the first reply in a thread is tagged "FI-Smart Assitant here!" (the design's own spelling) on a warm bubble, and the success dialog says "Our team and assistants will review and reach out to you shortly." The console draws nothing: no bot message, no suggestion, no hand-off marker. See D10.

> **Wording rule, non-negotiable.** Never use the phrase "AI agent" anywhere in the product, in any app, in any copy. Describe it as a ticket being answered automatically from FAQs and platform guides, with anything those do not cover going to a person.

### 5.9 Money objects

| Object | Belongs to | Lifecycle |
|---|---|---|
| **Deposit** | Client, per study | Paid up front when a study is published |
| **Invoice** | Client, per study | Pending → Paid. The balance falls due when recruiting stops and the study enters Billing, and is due 7 days later. A study re-published from Billing has no due date until it stops again |
| **Earning** | Participant, per completed study | Credited to the wallet when the team processes the study's payouts in Finance > Payouts. Nothing is paid automatically |
| **Withdrawal** | Participant | `pending` when requested → `paid` when a team member releases it. The model also carries `approved`, `held` and `failed`; see D2. $2 fee per withdrawal |
| **Redemption** | Participant | Points → cash into the wallet, at 100 points to $1, minimum 1,000 |
| **Refund** | Client, per underfilled study | Raised automatically from the shortfall → confirmed by a team member → paid in 5 to 7 working days |

**A withdrawal waits for the team.**

- The console's Finance > Payouts tab lists withdrawals, with a detail page for each and one action, **Release Payout**, which moves it from `pending` to `paid` and records when and by whom. Only a team member can release. Approve, Hold and Retry, and the `approved`, `held` and `failed` states, are in the model with no screen yet. See D2.
- The participant's wallet shows a withdrawal as Processing while it is pending, and Completed once released. The "paid" notice is dated from the release.
- The client's Pay tab is the client's own bill. It itemises the billing and lists settled transactions. There is no per-respondent row and no approve control. Its only payment action is Pay Bill.
- The console's Pay tab is the same bill, read only. Nothing in it says a balance is auto-debited.

---

## 6. Business rules register

**This section reproduces the Trust and Rewards policy, version 2 of 22 October 2026, in full.** No separate policy document is needed to build. The platform and the policy must never disagree. Where a design draws a different number, the policy governs and the design is to be corrected. Section 16 records each disagreement and the decision taken.

### 6.1 Trust Score

| Rule | Value |
|---|---|
| Range | 50 to 100. 50 is the floor and the starting score |
| Study completion | +1 per study, capped at 10 a year |
| 5-star rating | +4 |
| 4-star rating | +3 |
| 3-star rating | +1 |
| 2-star rating | −2 |
| 1-star rating | −3 |
| Ratings contribution, maximum | +40 |
| Starting score | 50, earned by completing onboarding. It is the starting score, not added on top of it |
| No show | −4 |
| Late show up | −2 |
| Cancelled session | −2 |
| Upheld fraud | −20 |
| Ratings counted | The last 10 studies |

**How the score is worked out** (confirmed, D39). The starting 50 plus everything earned and deducted since, kept within 50 and 100. A deduction that would take the score below 50 still counts: the score shows 50, and the deduction comes off later gains before the score rises again. A participant at 50 who cancels a session stays at 50, and their next completed study leaves them at 50. The cancel toast says which happened: "2 Trust Score deducted" when the score fell by the full amount, and otherwise that the 2 is recorded, the score stays at the floor and the 2 comes off what is earned next. The amount is read from the value the console set at the time, not written into the toast. Score history shows each change in points ("+1", "−2"), never as a percentage.

### 6.2 Tiers

| Tier | Trust Score |
|---|---|
| Silver | 50 and above |
| Gold | 70 and above |
| Platinum | 90 and above |

Tier is **derived** from the Trust Score. It is never set independently and never stored as its own fact.

**"In Top N%"** under Gold and Platinum is derived too: the share of active, ID-verified participants at that tier or above (`topShareOf`, the same count the client app's Profile Tiers lines use). **Silver has no percentile line** (decided 23 October 2026): it is where everyone starts, so a percentile there means nothing, and no replacement text is shown.

### 6.3 Reward points

| Event | Points |
|---|---|
| Referral (someone you referred joins) | 200 |
| Being referred (you joined by referral) | 100 |
| Adding an intro video | 75 |
| Completing your full profile | 50 |
| Completing a monthly streak | 50 |
| Completing a study | 25 |
| Adding a profile picture | 25 |

The profile picture and the intro video each earn their points once. Removing either afterwards does not take the points back. A participant who completes their profile, adds a picture and adds a video earns 150 points in total.

**Neither affects the Trust Score.** That is earned by behaviour in studies, not by filling in a profile.

### 6.4 Redemption and payouts

| Rule | Value |
|---|---|
| Conversion | 100 points = $1 |
| Minimum redemption | 1,000 points |
| Withdrawal fee | $1.99 flat (was $2; changed 23 October 2026, as Pricing & Rewards draws it). Configurable |
| Points expiry | Points do not expire |
| Study payout | Within 14 days after the study ends: the team pays the reward into the wallet by hand (`WAITS.PAYOUT_AFTER_STUDY_ENDS_DAYS`) |
| Withdrawal to the bank | 2 to 3 working days |
| Client refund timing | 5 to 7 working days |

### 6.5 Scheduling

| Rule | Value |
|---|---|
| Reschedule | Twice only, and only more than 24 hours before the session |
| Cancel a session | A participant may cancel more than 24 hours before the session, at 2 Trust Score points. Inside 24 hours they cannot cancel, and not attending is a no show at 4 points |
| Cancelled by the client or the team | Costs the participant nothing. A reason must be given; the participant is told it, and it is kept against the booking |
| Diary completion | At least 4 of 5 days |
| Diary entries | One entry a day. Entry 1 opens on the day the participant is invited to complete, each later entry on its own date after that (a day apart, or at the frequency the client set). Earlier entries stay open to catch up on; later ones are locked until their date, and a locked one says the date it opens. The demonstration accounts are exempt, so a demo can run every entry in one sitting |

### 6.6 The certificate

The policy says the certificate "Unlocks at 40". **That is not implemented.** The Trust Score floor is 50, so 40 cannot be a Trust Score threshold, and the policy line is stale. The certificate is issued when identity verification completes. No field for it is needed in Pricing and Rewards. See D12.

In the built designs a certificate ID appears in the header of participants who are still unverified, two different people are drawn carrying the same certificate ID (HL-R-9F2A-3K7P), and the *client's* business certificate carries that same string. All three are design errors.

**As built:** the certificate is issued only when the team verifies the participant's ID in the console. It carries one unique ID per person in the form `FI-XXXX-XXXX`, is headed "Identity Verified", lists "Government ID Verified" and, where the team checked a credential, "Professional License/Certificate Verified", shows the Trust Score, and **carries no name**. It claims nothing about a selfie. While the ID is in review the screen says so. The client app's study verification certificate reads "N of M completions by ID-verified participants". The client's business certificate is a separate object with its own ID in the form `FI-C-XXXX-XXXX`. See D12.

Certificate IDs begin `FI-` while the product is branded HumanLayer. Whether the prefix should change is open; see D35.

### 6.7 Consent on a participant's picture and video

A profile picture and an intro video each carry their own consent, off by default.

| Rule | Value |
|---|---|
| Points | Earned for adding the picture or video, whether or not consent is given |
| Visibility | A client sees the picture only if consent on the picture is on, and the video only if consent on the video is on |
| Withdrawal | Consent can be withdrawn at any time, and must stop being shown immediately |
| Without consent | The client sees the participant's initial |
| Points on withdrawal | Not taken back |
| Where the control sits | On My Profile, the picture's consent switch sits under the picture and the video's under the video |

### 6.8 Restriction

| Offence | Restriction |
|---|---|
| First | 15 days |
| Second | 15 days |
| Third | 30 days |
| Fourth | Deactivation |

A restricted participant cannot take part in studies, withdraw earnings or redeem rewards for the period. They are told that they are restricted, which category it was, and when it ends. A deactivated participant is sent the written reason and can appeal.

### 6.9 Changes to these values

| Rule | Value |
|---|---|
| What can be changed | Trust Score values (6.1), tier thresholds (6.2), reward point values (6.3) and client fees (6.10) |
| Who can change them | A master admin, from the console's Pricing & Rewards. A sub-admin with that module is refused. Each change is confirmed first and recorded with who made it and when |
| What a change affects | Only what happens after the change |

A changed value applies only to what happens after the change. Every Trust Score and points event counts at the value in force when it happened, so no existing score or balance moves when a value is edited. A study keeps the fees it was created with, so no agreed price moves.

Redemption and payouts (6.4), scheduling (6.5), client ratings, the certificate (6.6) and restriction (6.8) are not changed from the console. They change only by a new version of the policy.

### 6.10 What a client pays, and the team's fee cards (23 October 2026)

**What the client sees: one cost per interview (CPI) per participant**, with the participant's incentive inside it. Since 24 October 2026 it is worked out from the team's rate card (6.10a) and set by the team for each study in the console (the Quote panel and Change CPI Rate, on the review queue's Payment tab). It is a stored value the team edits (`applyRateCardQuote`, `setStudyRate`, `Study.ratePeriods`), never typed into a client screen. Before the team quotes it, a new study is offered the rate card's figure at the first segment whose size band fits (`rateFor`, `proposedSegment` in `shared/ratecard.ts`); see D43.

| Item | Value | Charged |
|---|---|---|
| CPI | Per study; $250 to start | Per participant |
| Total Recruiting Cost | CPI x participants | The incentive is included |
| Upfront deposit | 20% | At publish, of the total at the required number of participants |
| Incentive deposit | 30% | When the team takes the study live (D40). The Pay screens call it "Recruitment Cost" |
| Completion due | 50% | The rest, on the bill once recruiting stops: the participants who completed, each at the CPI in force when they completed, less both deposits |
| Client refunds | Paid within 5 to 7 working days | |

**Changing the CPI.** On a study in review the new rate replaces the old; the upfront deposit already taken stays, and the bill shows the new total less what was paid. On a live study the new rate starts a new period, for the participants who complete from then on, which is why a Final bill can have two lines ("$250 x 10 participants • Oct 1, 2026", "$350 x 10 participants • Oct 10, 2026"). A completed study cannot be repriced.

### 6.10a The rate card (24 October 2026)

The team's pricing sheet, kept as data (`shared/ratecard.ts`; the July 2026 files `rate-card.csv` and `rate-card-fees.csv` at the repository root are its first version, embedded at build time by `scripts/embed-rate-card.mjs`). Confidential: no client screen reads it.

| Table | Columns |
|---|---|
| Segments | section, segment, level, criteria, size band; setup (from, to, note), cost per recruit (from, to, note), incentive guide (from, to, unit, note) |
| Fees | group (Standard fee, Additional fee, Adjustment, Rule), item, amount (from, to), unit, note |

**A quote.** Setup, plus cost per recruit times participants, plus the incentive guide times hours times participants, plus the flat add-ons the team ticks, over the participants. The lower end of each range is quoted; the top is shown beside it. A segment with a blank figure the sum needs cannot be quoted. Size bands: "1-25" includes 25; "25 plus" starts at 26; "any" fits everyone.

| The three asked for (25 participants, one hour, remote) | Sum | Cost per interview | Top of range |
|---|---|---|---|
| Level 1 Basic Consumer, 1-25 | $500 + $125 x 25 + $100 x 25 = $6,125 | **$245** | $245 |
| Level 2 Niche Consumer, 1-25 | $750 + $135 x 25 + $125 x 25 = $7,250 | **$290** | $345 |
| B2B upper level, 1-25 | $1,000 + $200 x 25 + $300 x 25 = $13,500 | **$540** | $640 |

**The incentive** is proposed from the segment's guide rate times the study's hours, and set by the team per study (Change Incentive, beside Change CPI Rate). It is kept period by period (`Study.incentivePeriods`): a change applies to those who complete after it, and a payout keeps what it paid (`Participation.paidAmount`). A study cannot go live without one. Above the cost per interview is allowed, with a warning.

**Editing and uploading.** On Edit Clients Fees the team edits any cell and adds rows by hand, or uses Upload file and fill: CSV, Excel (.xlsx) or PDF, read without a library (`shared/tableFiles.ts`). The file is matched to the card by row labels (section, segment, level and size band; or group and item). A preview shows what was read, rows matched, rows not matched (added), rows the file did not mention (kept), cells it could not read (left blank and marked red in the form) and every value about to change. Nothing saves until Save Changes. Every save is a version in Version History with who, when and, for an upload, the file's name. Export rate card CSV and Export fees CSV write the team's own columns; `rate-card.csv` round-trips byte for byte.

**The team's fee cards stay.** Platform fee $100 once per study, moderation fee $10 and recruitment fee $25 base per completed participant, with two add-ons (+$25 for Video Call, In-Person or Diary, or Roles; +$20 for Skills). They are the team's own cost model, set on Pricing & Rewards and versioned (Version History). The client does not see them.

**Participants Fees** (Pricing & Rewards, 23 October 2026): the withdrawal fee, $1.99 flat (was $2), and the Reward Points Value, $1 for 100 reward coins. A master admin edits both (`participants` in `shared/settings.ts`). A withdrawal keeps the fee in force when it was requested (`Payout.fee`), and a redemption the value in force when it was made (`Redemption.usd`). The redemption minimum stays the policy's.

**Who a study is for.**

| Rule | Meaning |
|---|---|
| The audience | A participant sees and may apply to a study only if they fit its audience: every category the client set must match, and any one option within a category is enough. A category the client did not set is ignored. A participant who has not given what a category asks about does not fit it. A study with no audience is open to everyone |
| Outside the audience | Applying is refused, and the participant is told which categories they do not match |
| A client's personal invitation | Overrides the audience: a participant the client invites may apply even outside it. It overrides "Never with this client" below in the same way |

**Who may take part again.** A study sets one of two conditions.

| Condition | Meaning |
|---|---|
| N/A | Anyone who fits the audience may take part |
| Never with this client | Only people who have never taken part in a study with that client before ("Who has never participated in any study with [company] before") |

**Every value is checked before it saves.** A fee cannot be negative, and every add-on needs at least one parameter. Tiers must rise from Silver to Platinum, between 50 and 100. Points are whole numbers, not negative. Max Study per year is a whole number, and a deduction cannot add to the score.

### 6.11 Values that originated in the build

The following were applied in the designs or the build without appearing in the original signed policy. Each has since been settled, and each is part of version 2 of the policy and of this section.

| Value | Where it now sits |
|---|---|
| The restriction ladder, 15 / 15 / 30 days then deactivation | 6.8 |
| Points do not expire | 6.4 |
| Client refunds paid within 5 to 7 working days | 6.4 |
| Participant payouts credited within 2 to 3 working days | 6.4 |
| Profile picture and intro video points, and their consent | 6.3 and 6.7 |
| Cancelling a session, and the reason a client or the team must give | 6.5 |
| Two conditions on who may take part again | 6.10 |
| Changing values from the console, from then on only | 6.9 |

Version 2 of the policy also makes two corrections to the original:

1. **The certificate's "unlocks at 40" is withdrawn.** The Trust Score floor is 50, so 40 cannot be a Trust Score threshold. The certificate is issued on identity verification. See 6.6 and D12.
2. **Client ratings are five stars on three dimensions**, not three states: Expertise, Reliability and Communication, plus an optional written review. See D16.

A value stated in the designs is shown but **not** charged: a 3% merchant processing fee on client card payments. It was removed on 13 October 2026; the 23 October frames draw it again on Payment & Publish and on Payment, and it is built as drawn, with nothing charging it. That reversal is recorded on the difference list. The cap of 10 a year applies to Trust Score, not to points.

---

# PART A: THE RESPONDENT APP (mobile)

A participant's app. Dark theme, 375px, bottom tab navigation, four tabs: Dashboard, Studies, Wallet, Profile.

## 7. Respondent app: route map

Every route below is a real screen. A route not in this list should not exist.

### 7.1 Landing and authentication

| Route | Screen |
|---|---|
| `/` | Landing page for a signed-out visitor. A signed-in user is redirected to `/dashboard` |
| `/signup` | Create your account |
| `/signin` | Welcome back |
| `/verify-otp` | Enter OTP |
| `/forgot-password` | Reset Password |
| `/check-email` | Check Email |
| `/reset-password` | Set New Password |
| `/password-updated` | Password Updated |

### 7.2 Onboarding

| Route | Screen |
|---|---|
| `/onboarding/about` | About You, step 1 of 3 |
| `/onboarding/professional` | Get Personalized Studies, step 2 of 3 |
| `/onboarding/identity` | Identity Verification, step 3 of 3 |
| `/onboarding/welcome` | Welcome to HumanLayer |

### 7.3 Dashboard tab

| Route | Screen |
|---|---|
| `/dashboard` | Dashboard. Renders a "Get Started" variant when the user has 0 completed studies |
| `/notifications` | Notifications |

### 7.4 Studies tab

| Route | Screen |
|---|---|
| `/studies` | Explore |
| `/studies/saved` | Saved |
| `/studies/mine` | Redirect to `/studies/mine/invites` |
| `/studies/mine/invites` | My Studies, Invites |
| `/studies/mine/scheduled` | My Studies, Scheduled |
| `/studies/mine/drafts` | My Studies, Drafts |
| `/studies/mine/applied` | My Studies, Applied |
| `/studies/mine/history` | My Studies, History |
| `/studies/:id` | Study Detail. Layout and actions switch on study type and status |
| `/studies/:id/screener` | Screener questions |
| `/studies/:id/applied` | Applied successfully |
| `/studies/:id/schedule` | Pick date, time, and location for in-person |
| `/studies/:id/schedule/agreement` | Call recording agreement |
| `/studies/:id/schedule/review` | Review Schedule |
| `/studies/:id/schedule/done` | Scheduled confirmation |
| `/studies/:id/reschedule` | Same as schedule, confirms as a reschedule |
| `/studies/:id/pin` | Enter attendance PIN |
| `/studies/:id/pin/done` | PIN confirmed |
| `/studies/:id/survey` | Survey questions |
| `/studies/:id/survey/done` | Completed successfully |
| `/studies/:id/diary` | Diary overview, day list |
| `/studies/:id/diary/:day` | One diary day |
| `/studies/:id/rate` | Rate the client |
| `/clients/:clientId/ratings` | Client Ratings |

### 7.5 Wallet tab

| Route | Screen |
|---|---|
| `/wallet` | Wallet |
| `/wallet/withdraw` | Withdraw |
| `/wallet/withdraw/method` | Select payout method |
| `/wallet/withdraw/done` | Withdrawal request sent |
| `/wallet/earnings` | Earning History |
| `/wallet/earnings/:txId` | Transaction Details |
| `/wallet/payouts` | Payout and Payout History |
| `/wallet/payouts/:payoutId` | Payout Details |
| `/wallet/payout-methods` | Manage Payout Methods |
| `/wallet/payout-methods/add` | Add Bank Account |
| `/points` | Reward Points. Tabs: Points History, Redeem History |
| `/points/redeem` | Redeem |
| `/points/redeem/confirm` | Confirm Redeem |
| `/points/redeem/done` | Redeemed successfully |
| `/points/how-it-works` | How reward points work |

### 7.6 Profile tab

| Route | Screen |
|---|---|
| `/profile` | Profile |
| `/profile/edit` | My Profile, two tabs. Profile Details runs: Profile Picture, Full Name, Intro Video, Gender, Address, Area Type, then About Me (About Me, Languages Spoken, Nationality, Household Income, Ethnicity, Pets, home owner). The picture and the intro video each carry their own consent control |
| `/profile/certificate` | Human Certificate |
| `/profile/referrals` | Refer and Earn |
| `/profile/settings` | Account Settings |
| `/profile/settings/password` | Change Password |
| `/profile/settings/notifications` | Email Notifications |
| `/profile/settings/consent` | Consent and Cookies. Separate from the picture and video consents, which sit with the things they govern |
| `/profile/settings/deactivate` | Deactivate Account |
| `/trust-score` | Trust Score Details |
| `/trust-score/rules` | Trust Score Rules |
| `/trust-score/tiers` | How Tiers Works |
| `/support` | Help and Support |
| `/support/tickets` | Support Tickets |
| `/support/tickets/:id` | Support Chat |
| `/support/contact` | Contact us |

### 7.7 Modals and sheets

These are components with `open` and `onClose`. **They do not change the URL.**

Consent, Details info, Why Screener, Exit Screener, Locations, Reject Study, Reject Invitation, Cancel Study, Report Study (choose a reason, describe it, submitted), Remove Bank Account, Logout, Match Score explainer, Filters, Sort menu, Education Level picker, Industry picker, Profession picker, ID type picker, tier upgrade, points earned, streak detail.

---

## 8. Respondent app: the landing page

A signed-out visitor lands here. It is four full-height screens in one scrolling column, edge to edge, built as a phone app and not as a web page.

| Screen | Content |
|---|---|
| 1. Hero | The HumanLayer mark assembles itself. Headline, supporting line |
| 2. What it is and how it works | One headline, then four steps in a horizontally drifting row: Prove you are real / Get matched / Take part / Get paid |
| 3. What you earn | Points, tiers and the certificate, in a drifting row of cards |
| 4. The close | A sample study card, then the calls to action |

**Rules for this page, learned the hard way:**

1. **Sign Up and Log In are pinned to the bottom of the frame on every screen, including the last.** They never slide away, fade out or get replaced. This was broken once and it is the single worst thing that can be wrong on this page.
2. **No card is ever cut at a hard edge.** The horizontal rows are continuous marquees with a soft fade mask at both edges, wide enough that no text is ever sliced at a hard line. A card dissolves out; it is never chopped.
3. **Every row starts at card one** when its screen comes into view, and drifts forward from there.
4. **Each screen's content fits between the top progress bar and the pinned buttons at 375 × 667**, the smallest phone that matters. Nothing overlaps, nothing scrolls under a bar.
5. **No invented statistics.** Every figure on this page comes from the policy or from real seeded data. No member counts, no payout totals, no testimonials, no ratings unless they are real.
6. There is a third call to action, "Sign up as a research client", which goes to the client app.

**Copy on this page is new and unapproved.** It was written for the prototype and has not been signed off. Two lines in particular make public promises and must be confirmed before launch: the $2 withdrawal fee and "credited within 2 to 3 working days".

---

## 9. Respondent app: what every control does

This is the functional specification for the app. Build to it exactly.

### 9.1 Authentication and onboarding

| Screen | Control | Behaviour |
|---|---|---|
| Sign Up | Sign Up | Validates; an email already on the platform is refused under the field ("An account with this email already exists. Log in instead"); otherwise `/verify-otp` |
| Sign Up | Log In | `/signin` |
| Sign Up | Sign up as a researcher client | Opens the client app |
| Sign Up | Terms, Privacy links | Open the documents |
| Sign In | Login | Checks the email and password; a wrong one is refused under its field and nothing else happens. Then `/dashboard`. The demo login is printed under the form |
| Sign In | Forgot Password | `/forgot-password` |
| Forgot Password, Set New Password | Submit | Forgot Password refuses an email no account uses; Set New Password saves the new password for that email, then Password Updated |
| Enter OTP | Submit | Verifies the code, makes the account with the password typed on Sign Up, then `/dashboard`: workflow 15 lets a new account browse first, and Get Started opens `/onboarding/about` |
| Enter OTP | Resend | Restarts the 60-second timer, toast "Code sent" |
| Enter OTP | Cancel | Back to `/signup` |
| About You | info icon | Opens the Details info pop-up |
| About You | Address field | Opens an address autocomplete; selecting one fills the field |
| About You | Upload Short Video | File picker. The video is kept on the account the moment it is chosen, the same as on My Profile, and earns its 75 points |
| About You | Continue | Validates required fields, `/onboarding/professional` |
| Professional | Industry, Education | Open pickers; selecting fills the field |
| Professional | Continue | `/onboarding/identity` |
| Identity | Select ID | Opens the ID type picker |
| Identity | Upload Front, Upload Back | File picker, shows the file name; the name and size are kept with the ID |
| Identity | Continue | Opens the Consent modal |
| Consent | Save and Continue | Saves the toggles, sends the ID (and any credential number) to the team for review, `/onboarding/welcome`, which says "Your ID is in review" |
| Welcome | Complete Profile | `/profile/edit` |
| Welcome | Explore Studies | `/studies` |

**No selfie.** Selfie and liveness verification are out of the product (23 October 2026). The Identity step is one government ID, both sides, and nothing else.

### 9.2 Dashboard

| Control | Behaviour |
|---|---|
| Points chip in the header | `/points` |
| Bell | `/notifications` |
| Trust Score card | `/trust-score` |
| Wallet Balance tile, This Month tile | `/wallet` |
| Studies In Review tile | `/studies/mine/applied` |
| All Time Studies tile | `/studies/mine/history` |
| Invite card, Schedule Session | `/studies/:id/schedule` |
| Scheduled card body | `/studies/:id` |
| Updates, View All | `/studies/mine/invites` |
| Monthly Streak card | Opens the streak detail modal |
| Recommended card | `/studies/:id` |
| Recommended, View All | `/studies` |
| Refer and Earn, Invite | Opens the share sheet |
| Refer and Earn, Copy Link | Copies to clipboard, toast "Link copied" |
| A notification row | Routes to the related screen or action |
| Mark all as read | Clears every unread state and the bell dot |

### 9.3 Studies

| Control | Behaviour |
|---|---|
| Explore / My Studies / Saved tabs | `/studies`, `/studies/mine`, `/studies/saved` |
| Search field | Filters the visible list live, by title and description |
| Sort icon | Opens the sort menu, reorders the list on select |
| Filter icon | Opens the Filters sheet |
| Filters, Apply | Applies to the list and closes. Chips show the active filters |
| Filters, Reset | Clears every filter |
| Study card body | `/studies/:id` |
| Study card, bookmark | Toggles saved. The Saved tab updates immediately |
| Accept and Apply | Status → `applying`, then `/studies/:id/screener` |
| Apply, outside the study's audience | Refused: "This study is for a different audience", naming the categories not met, with Update Profile. The screener's address says the same. Explore never lists such a study (D38) |
| Reject on a card | Opens Reject Invitation; on confirm, removes it from Invites |
| Match score badge | Opens the match score explainer ("Study matching score / It shows how much this study is relevant to your profile for you."; the drawn tip "Higher the score, faster you get qualified" is removed because the build does not do it). The score is the share of the categories the study's audience sets that the profile meets. A study open to everyone shows no score |
| Client name and rating | `/clients/:clientId/ratings` |
| Get Support | `/support/contact` with the study prefilled in the subject |
| View Directions | Opens a map |
| How It Works | Expands and collapses. It starts collapsed, unless the participant has applied to the study. Its two steps read (23 October 2026): "Apply and answer screener questions to see if qualify" / "The team will review your application and invite you if qualified and selected.", and "Complete the study and get paid!" / "Once approved, complete your study, and get paid within the 14 days after the study ends." The 14 is the policy's payout window (6.4, `WAITS.PAYOUT_AFTER_STUDY_ENDS_DAYS`) |
| Report | Opens Report Study: one of eight reasons, then a required description of up to 500 characters, then "Report has been submitted!". Nothing changes for the study until the team acts. See 5.7 |

### 9.4 The study state machine, as the participant sees it

| Status | Appears in | Primary action | Moves to |
|---|---|---|---|
| `available` | Explore, Recommended | Apply | `applying` |
| `invited_to_apply` | Invites | Accept and Apply | `applying` |
| `applying` | not listed | Screener in progress | `applied` or `draft` |
| `draft` | Drafts | Resume Application | `applied` |
| `applied` | Applied | none, view only | `invited_to_schedule`, `invited_to_complete` or `rejected` |
| `invited_to_schedule` | Invites | Schedule Session | `scheduled` |
| `invited_to_complete` | Invites | Start Study | `in_process` |
| `scheduled` | Scheduled | Join Call, Submit PIN | `pin_confirmed` |
| `pin_confirmed` | Scheduled | Complete study | `in_process` |
| `in_process` | History | none, view only | `paid` |
| `paid` | History | Rate Client | stays `paid`, gains `ratedByUser` |
| `rejected` | History | none, view only | end |
| `no_show` | History | none, view only | end |

**The tab a study appears under is derived from this status and nothing else.** The detail screen's layout, the card's actions and the list it sits in are all derived. Nothing is set separately.

**Money not yet paid has one sentence everywhere** (23 October 2026): "Awaiting payout. The team processes it when the study finishes." The In Process banner (under the reward amount), the Wallet's pending line, the toasts after completing a study or a diary, and the participation's history ("Awaiting payout", then "Payout processed by the team", then "Paid") all use it. Nothing says the money is credited before it is.

**Notifications follow the study.** An invitation to book reads "You're invited to schedule your session!". A notification's action button (Schedule Now, Start Study, Apply Now, Rate Now) is dropped once the study has moved past that step, and the row then opens the study. The saved-study update gives the real number of places left (the target less everyone qualified, booked or done) and is not sent for a study that is full.

**The sign-up and sign-in ticker** ("$100 paid to Jonathan for a product study, 25m") reads the platform's most recent study payout: the first name, the amount, the kind of study and how long ago. It shows nothing until someone has been paid.

### 9.5 Scheduling

| Control | Behaviour |
|---|---|
| Schedule Session | `/studies/:id/schedule` |
| Date chip | Selects the date. Only dates with availability are enabled |
| Time slot | Selects the slot. Taken slots are disabled |
| Location row (in-person only) | Selects the location |
| Continue | `/studies/:id/schedule/agreement` |
| Agreement checkbox | Enables the button. Unchecked keeps it disabled |
| Agree and Join | `/studies/:id/schedule/review` |
| Confirm and Schedule | Status → `scheduled`, saves the booking, `/studies/:id/schedule/done` |
| Reschedule | `/studies/:id/reschedule`. **Blocked with an explanation after two reschedules, or within 24 hours of the session's start time** |
| Cancel Study | Opens Cancel Study. On confirm, status → `available` and the Trust Score drops by 2 |

### 9.6 Attendance

| Control | Behaviour |
|---|---|
| Join Call | Opens the meeting link |
| Submit PIN | `/studies/:id/pin`, once the session has started. Before then it is shown disabled and says when the session starts: the interviewer gives the code during the session. The platform refuses an early code too |
| PIN entry | Six digits. A correct PIN proceeds; an incorrect one shows "Incorrect PIN, check with your interviewer". The success screen and the study banner say the code is in and attendance is on record once the interviewer enters it too; only then does the banner read "Both sides entered the code" |
| Submit | `/studies/:id/pin/done` |
| Done | `/studies/:id`, status now `pin_confirmed` |

### 9.7 Screener, survey and diary

| Control | Behaviour |
|---|---|
| Continue | Next question. Disabled until the current question is answered |
| Back | Previous question, keeping the answer |
| Close, or back from question 1 | Opens Exit Screener |
| Save and Exit | Saves answers, status → `draft`, goes to `/studies/mine/drafts` |
| No, Continue | Closes the sheet |
| Submit on the last question | `/studies/:id/applied` or `/studies/:id/survey/done` |
| Diary, Submit Progress | Marks the day complete, returns to the diary overview |
| Diary, a completed day | Opens that day read only, with the answers as sent, and Back to Diary |
| Diary, Resume Study Day N | `/studies/:id/diary/:day`, the first open entry not yet filled. When every open entry is filled and the next is locked, the button reads "Day N opens Oct 25", disabled, and says the full date on tap |
| Diary, a locked day | Reads "Opens Oct 25"; tapping it says "Day N opens on Oct 25, 2026". Its address shows the same. The platform refuses an early entry too (`completeDiaryDay`, `diaryLocks`) |
| Diary, Complete | **Only enabled once at least 4 of 5 days are filled** |

Each diary day asks its own questions, as the client set them for that entry. A question marked optional shows "(optional)" after its prompt and may be left blank: Continue, Submit and Submit Progress allow it.

**Question types to support:** single select, multi select, free text, image upload, scale. Each screener answer carries a verdict set by the client (Correct, Incorrect, May Select, Must Select) which the participant never sees.

### 9.8 Wallet and points

| Control | Behaviour |
|---|---|
| Withdraw | `/wallet/withdraw` |
| Max | Fills the full balance |
| Change (payout account) | `/wallet/withdraw/method` |
| Withdraw (amount screen) | Validates against the balance, `/wallet/withdraw/done` |
| Done | `/wallet`, balance reduced, a new Processing row in Payout History |
| Earning History, View All | `/wallet/earnings` |
| An earning row | `/wallet/earnings/:txId` |
| A payout row | `/wallet/payouts/:payoutId` |
| Download Receipt PDF | Produces a receipt |
| Manage Payout Methods | `/wallet/payout-methods` |
| Add New Account | `/wallet/payout-methods/add` |
| Add | Validates, adds the account, returns to the list |
| Set As Default | Moves the Default chip |
| Remove | Opens Remove Bank Account; on confirm, removes it. Removing the default makes the next account the default, and the toast names it |
| Reward Points card | `/points` |
| Redeem | `/points/redeem` |
| Points input | **Converts live at 100 points to $1. Below 1,000 points, Confirm is disabled and the reason is shown** |
| Confirm | `/points/redeem/confirm` |
| Redeem (on confirm) | Deducts points, credits the wallet at once, `/points/redeem/done` ("It is in your wallet now") |

### 9.9 Profile

| Control | Behaviour |
|---|---|
| Complete Profile | `/profile/edit` |
| Trust Score card | `/trust-score` |
| Change Picture, or Upload Picture | Opens the file picker. A JPEG or PNG up to 2MB is kept at no more than 640 by 480 and saved at once |
| Remove (picture) | Removes the picture at once. The points are not taken back |
| Intro Video upload box | Opens the file picker for a video and saves it at once. The box reads "Upload Short Video", "Share about you, what you do, your interests, etc." and ".mp4 file \| 50 MB max." |
| Remove Video | Removes the video at once. The points are not taken back |
| Show my picture to clients, Show my video to clients | Save at once. Each is disabled, and says why on tap, until there is a picture or a video |
| Learn More About Tiers | `/trust-score/tiers` |
| Trust Score info icon | `/trust-score/rules` |
| Human Certificate | `/profile/certificate` |
| Certificate share icon | Copies a link, toast |
| Refer and Earn | `/profile/referrals` |
| Account Settings | `/profile/settings` |
| Save on any form | Saves, toast "Saved", stays on the screen |
| Account Settings, the ID | Shows the ID type and the two files as uploaded (name and size) and where the check stands: "Govt. ID Verified", "In review", or could not be verified. Upload New ID, or picking another type, asks for both sides again; Save sends the new ID to the team and it is in review |
| My Profile, licence number | Shows "Verified Profession" once the team has checked it, "In review" while it waits, and a note that a changed number is checked again once saved |
| Change Password, Submit | Validates four rules live; a wrong current password is refused under that field; otherwise saves the new password and shows the Password Updated modal |
| Email Notification toggles | Save immediately. No save button |
| Deactivate Account | Requires the password; a wrong one is refused under the field and nothing changes. The right one deactivates the account (closed by the participant), shows the Account Deactivated modal, then signs out. The copy reads: you have 30 days to reactivate by contacting us, after which it is deleted once any balance has gone to the default payout method |
| Sign Out | Opens Logout; on confirm, clears the session and goes to `/signin` |
| An FAQ row | Expands and collapses |
| Contact Us | `/support/contact` |
| Submit on Contact us | Creates a ticket, shows the success modal |
| Go To Chat | `/support/tickets/:id` for the new ticket |
| Send in the chat | Appends the message and clears the composer |

---

## 10. Respondent app: the motion and feel layer

The respondent app is deliberately game-like. This is not decoration; it is the retention mechanism. But it follows one rule, and getting it wrong makes the app feel broken.

### 10.1 The rule: motion is earned

Sort every animation into one of three tiers.

**Tier 1: getting around.** Opening a screen, going back, switching tabs, scrolling, expanding a section, opening a plain modal, pressing a button that only navigates.

> No bounce. No overshoot. No wobble. No oscillation of any kind. 120 to 180ms, ease out, a small fade and a small slide. The user should not notice it happened, only that it did not feel abrupt.

**Tier 2: something changed.** A filter applied, a toggle flipped, something saved, an item added or removed, a form step completed, a validation message.

> A little life, no bouncing. One small scale or settle, 200 to 260ms. It may not oscillate more than once.

**Tier 3: something was earned.** Points gained, tier upgrade, certificate unlock, study completed, screening passed, payout received, money redeemed, a verification step finished.

> All the bounce, overshoot, confetti, particles, flips and fanfare live here. These are special precisely because nothing else in the app behaves this way.

**The test:** a user should be able to use the app for a minute without noticing the motion at all, and then be surprised by it when they earn something.

### 10.2 The depth system

Every pressable thing has a **solid colour bottom edge** in a darker shade of its own fill, not a blurred grey shadow. Pressing moves it down by exactly that edge height and the edge shrinks to nothing, so the thing is physically pushed into the page. Releasing springs it back.

This single change does more for how the app feels than any animation. Apply it to buttons, cards, tiles, tabs, chips and list rows.

### 10.3 What moves, and where

| Moment | Tier | Behaviour |
|---|---|---|
| Points arriving | 3 | Digits tumble like a mechanical counter from the last value the person saw, faster for small gains and slower for big ones. A floating +X rises off the figure. The badge pulses once. If the gain happens behind a modal, the roll waits until the modal closes |
| Tier upgrade | 3 | Full screen. The tier coin falls from above and lands with weight, then flips in real 3D from the old tier to the new one. Confetti cannons fire from both bottom corners. Skippable on tap |
| Certificate unlock | 3 | A seal is hoisted over a paper card and struck down. The card gives, ink spreads, the lines write themselves in |
| Progress bars | 2 or 3 | Fill like liquid from the last value seen, never from zero if progress already existed. A bright leading edge. Reaching the end flashes and bulges |
| Deductions | 2 | The figure **drops** into place rather than counting down. Faster and quieter than a gain. No shake, no extra red, no scolding |
| Study completed, payout received, redemption | 3 | Burst, coins, celebration |
| Screening result | 2 | Qualified and not qualified both get a clear, calm reveal. Not qualified must never feel like a failure animation |
| Verification steps | 2 | Each step ticks over with satisfaction |
| Collectible cards (tier card, certificate) | none | Tilt to follow a dragged finger and to device orientation, with a holographic sheen moving against the tilt. Permission asked once, in context; everything works without it |
| Navigation, tabs, lists, modals | 1 | Calm |
| Empty states | none | Gentle idle motion so the screen never looks dead. **Screens with content stay still** |

### 10.4 Haptics and sound

Each kind of event has its own vibration pattern, not one buzz for everything: a light tick for selection, a double tap for a gain, one short low pulse for a deduction, a longer pattern for tier and certificate.

Sound is synthesized, **muted by default**, and never autoplays.

### 10.5 Non-negotiable constraints

1. **`prefers-reduced-motion` removes all of it.** Every animation jumps to its final value. Nothing is lost, nothing breaks, decorative layers are not drawn at all. Build this into the foundation so no screen can forget it.
2. **Transform and opacity only.** Never animate width, height, top or left.
3. **60fps at 375px** is the budget, not a hope. Measure it under CPU throttling, not idle.
4. **Everything is clipped by the phone frame.** No overlay, confetti, glow or backdrop may paint outside it at any width.
5. **One tap starts one animation.** If a tap currently moves several things, pick the one that matters.


---

# PART B: THE CLIENT APP (desktop)

A research client's app. Light theme, 1440px, a 240px left navigation and a 68px top bar. Around 90 unique screens.

## 11. Client app: the structural rule

**The design file holds 216 frames. There are about 90 screens.** 126 of those frames are the same screen drawn once per study type, or a state of a screen already counted. Build each screen once and switch on study type. Six parallel flows would be six times the work and six times the bugs.

This was proved by measurement, not assumed. Manage Study for Diary, In-Person and Survey differ in **3.2% of pixels**: the study-type tag and one summary row. The Create step-1 screens for In-Person and Survey differ in **0.31%**, and that difference is which type card is selected on the screen itself.

| | Frames | Unique screens |
|---|---|---|
| Manage (6 sections) | 96 | 19 |
| Create (5 sections) | 41 | 15 |
| Everything else | 79 | 56 |
| **Total** | **216** | **~90** |

## 12. Client app: route map

### 12.0 The landing page

Not in any design. Built because the client app's address had nothing on it for a signed-out visitor but a sign-in form.

| Route | Who sees it |
|---|---|
| `/client` | A signed-out visitor. A signed-in client goes straight to their dashboard |

Desktop only, 1440px, no mobile version. One primary action, Sign Up, in a header that stays fixed, in the hero, and again at the end. Contents: what the product does, a picture of the real dashboard labelled as demo data, how it works in four steps drawn from the real study flow, what you get, and a trust strip covering verified participants, screening and Trust Scores.

**No customer logos, no customer counts, no testimonials.** None exist, and inventing them would put untrue claims on a public page.

The header and the footer carry the HumanLayer lock-up: the H mark and the wordmark, in the same grey as the sidebar.

### 12.1 Onboarding

| Route | Screen |
|---|---|
| `/signup` | Sign Up (name, work email, password, terms) |
| `/check-email` | Check Email |
| `/signin` | Sign In |
| `/organization` | Organization Details (role, company, VAT, website, industry, location) |
| `/payment-method` | Payment Method (card, expiry, CVV, name, billing address, zip) |
| `/in-review` | In Review |
| `/welcome` | Welcome |

**Order, and what each step gates:** Sign Up → Check Email → Organization Details → Payment Method → In Review → Welcome. Sign In is the side door, with Forgot Password leading to a reset branch.

**There is no verification code step anywhere.** Check Email asks the client to click a link in an email and offers only "Open My Email".

**Nothing is gated by a pricing plan.** A "Select Pricing Plan" frame exists in the file but is switched off, is not part of the onboarding section, and not one of its strings is readable. Two visible plan cards, each with a price, a period, a description, a call to action and five features. **It is not built and there is no plan model anywhere in the product.** If plans are real, they are a new piece of work; see D13.

**Two layouts, neither inside the app shell.** Sign Up, Sign In and Check Email put a 704px showcase panel beside a 458px form with 48px inputs. Organization Details, Payment Method, In Review and Welcome centre a 460px column; Organization Details keeps 48px inputs, Payment Method drops to 38px.

### 12.2 Dashboard and notifications

| Route | Screen | Kind |
|---|---|---|
| `/dashboard` | Dashboard | page |
| `/notifications` | Notifications | page and panel, same content |
| none | Respondent Profile Details | panel |

Only one dashboard state is drawn. An empty "no studies yet" state is **not designed**; it must be designed or specified before build.

**Layout.** The top row is three equal columns: the four figures and Upcoming Sessions or Super Insights take two, Needs Your Attention the third, so the three cards in that row are the same width. Needs Your Attention shows its top three rows. Ongoing Studies and Recommended Respondents show three cards across at least, and one more for every 340px the screen allows. Avg. Session Incentive keeps its cents ("$101.67"). See D30.

**The Ongoing Studies cards' menus** open the same Ongoing study options as the Studies list: Copy Study Link, Pause or Resume, Stop-complete, Duplicate to Drafts, each with its own confirmation.

**A participant card opens the profile.** The whole card opens Respondent Profile Details, here and everywhere a participant card appears (Pool, Matched and Invited, Invite From Pool). Its buttons keep their own clicks. A participant's name anywhere in the client app opens the same panel.

### 12.3 Studies

| Route | Screen | Kind |
|---|---|---|
| `/studies` | Studies, Ongoing. Card view by default, table view via the toggle (`?view=table`) | page |
| `/studies/drafts` | Studies, Drafts: Study Name with its thumbnail, Type, Status (In Review or Draft), Created, sortable, and the row menu on a draft | page |
| `/studies/completed` | Studies, Completed | page |
| `/studies/sessions` | Studies, Sessions | page |
| none | Ongoing study options (row menu) | popover |
| none | Delete Study? | modal |
| none | Pause Study Participation? | modal |

A study in Billing sits under Ongoing, with the status tag "Billing", and moves to Completed when its bill is paid.

**Sessions is a fourth tab** on the same page. It lists upcoming sessions on live studies, grouped by date, each with the time, the session type, the study, View Details and **Join and Start**. Join and Start opens the session page with the session already started; there is no call link until a video provider is wired in. A client sees only their own sessions.

### 12.4 Create a study: one flow, four steps and Publish

| Route | Step | What the type changes |
|---|---|---|
| `/studies/create/about` | 1. About | The selected type card: Survey / Video Call (+Group toggle) / In-Person (+Group toggle) / Diary Study |
| `/studies/create/audience` | 2. Audience | Nothing |
| `/studies/create/audience/no-match` | 2b. No matching audience | Nothing |
| `/studies/create/screener` | 3. Screener | Nothing |
| `/studies/create/study` | 4. Study setup | **Yes, the whole step** |
| `/studies/create/publish` | Payment & Publish | Nothing |
| `/studies/create/published` | Published | Nothing |

**The Create header** has three parts: the study's title, truncated with its full text on hover; the stepper, centred in a white track of outlined chips; and the actions. Every step already reached, and every earlier step, can be clicked; later steps cannot. A draft reopened from Drafts can reach every step. At 1600px and wider, a step's content and its preview or forecast card sit side by side and are centred together; at 1440 they stay left aligned, as drawn.

**Starting a study.** Create Study opens a **New Study** dialog first, over the screen it was pressed on. Closing it leaves the client where they were. The client can write a brief and press **Generate and Fill**, which reads the brief and fills only what it names on About, Audience and Screener, then says what it filled and what it did not find. Or they choose "Fill from scratch instead" and start on About with nothing filled. Either one saves anything in progress to Drafts first. There is no model behind Generate: it matches words and simple patterns.

**The Audience step** sets who qualifies.

| Group | Criteria |
|---|---|
| Set Target Audience | Number of target participants, Country, Gender, Level of Education, Age Range, Ethnicity, Area Type |
| Work details | Work Function (required), Industry (required), Role, Skills, Experience, Household Income |
| Set conditions to apply | Who may take part again (N/A, or "Who has never participated in any study with [company] (You) before"), and Profile Tiers |

- **How criteria combine.** A participant must match every category the study sets, and any one option within each category. A category left empty is ignored. The step reads "Who qualifies for this study" over both groups.
- **Ethnicity and Area Type** offer the same values a participant picks from on their profile: Asian, Black or African American, Hispanic or Latino, White, Mixed, Other; and Urban, Suburban, Rural. "Prefer not to say" is a profile choice, never a target, and matches no study that sets the criterion.
- **Experience** (Fresher, 1-3, 3-5, 5-10, 10+ years) and **Household Income** ($50K or less, $50K - $100K, $100K - $500K, $500K - $1M, $1M+) match when the band a participant gave overlaps any band ticked. A participant who gave nothing, or "Prefer not to say", does not match a study that sets the criterion.
- **Country** is the USA only, shown as a fixed chip. Every study saves the USA.
- **Work Function** is a dropdown that takes several, shown as tags. It offers the work functions a participant can pick on their profile: Consultation, Patient Care, Research, Engineering, Product, Design, Marketing, Sales, Operations, Finance, Teaching, Management.
- Each criterion picked from a list shows its picks as chips under the field.
- **Profile Tiers** takes several tiers, shown as tags: Platinum, Gold and Silver, each with its Trust Score band and the share of verified, active participants at that tier, counted from the pool. "Any tier" when none is picked.
- **Work details order.** On a new study: Work Function, Industry, Role, Experience, Household Income, Skills. When a study waiting on the team is edited, and in the console: Work Functions, Roles, Skills, Industries, Experience, Household Income.
- **Generate with AI** (Fill with AI) reads a description the same way as the New Study dialog and fills only what it names.
- **Check Participation Forecast** shows "Contact us to check matching participants availability" with Contact Us, which opens the client's mail app to `support@humanlayer.app` with the subject "Matching participants for [study]". Tier Distribution, Average Score, Recommended Incentive and Estimated Time To Fill read "Coming soon". What the forecast should show is open; see D34.

**Step 4 by type:**

| Type | Study setup |
|---|---|
| Survey | Survey Settings → Create Survey Questionnaire, a full page ending in "Save & Continue" |
| Diary | Diary Study Settings opens the diary form, or reads it back ("8 questions, 7 days logs") with Update Diary Questionnaire. The form holds a "Diary Study Setup" card (Duration Unit, Frequency, Study Duration, Minimum Required), then one card per entry |
| Video Call | The availability composer alone, at 700px: Limits, Weekly Hours, Date Overrides and the Completion Verification note |
| In-Person | The same composer with the addresses first: saved address rows with edit and delete, then Limits, Weekly Hours, Date Overrides and Completion Verification |

**The availability composer** has no Submit of its own: Continue in the top bar submits it and returns to the Study step. Weekly Hours can be added, duplicated to other days, and given a second slot per day. **Minimum notice** is a number and a unit (Minutes, Hours, Days), read back as "1 Hour", "30 Minutes". The **Completion Verification** note describes the one verification PIN the platform issues per session.

**The diary form** has one card per entry: DAY 1 to DAY 5 for a five-day diary, or WEEK or HOUR for those units. The number of cards is the Study Duration. Each card holds its own questions and its own Add Question, and each entry asks its own questions. Every entry must have at least one question, and a diary cannot be made shorter while a dropped entry still holds a written question; each is refused with the reason. Upload File and Generate add questions with no entry, so they are asked on every entry: each shows on every day card marked "Asked on every day", with "Change for this day only", which gives every entry its own copy to edit. A diary saved before entries had their own questions opens with its questions copied onto every entry, once, so nothing it asked is lost.

**Below the settings, on the same step,** sit Incentive Payments, Costing Summary and Payment, identical for every type, as every type's frame draws them (1518:91922, 1518:94742, 1518:92570, 1518:93998). Once the type's form or availability is set, the step reads it back in its settings card, with Edit Survey, Update Diary Questionnaire, Update Timing Availability or Update Address & Availability, and the top bar's Proceed to Publish goes on to Payment & Publish. There is no separate Pricing step. The frames' AutoPay switch and their two "25% of cost" rows are not built (D24, D22).

**The question menu.** Each question in the Screener, survey and diary builders has a three-dot menu: Required (a toggle), Move up, Move down, Add question below, and Delete. Move up is off on the first question and Move down on the last; in a diary a question moves within its own day. Delete asks "Delete Question?" first. A participant may leave an optional question blank and sees "(optional)" after its prompt. A single-select that decides eligibility stops being a pre-screener question once it is made optional, since it can then be skipped. The screener renumbers by position after any move, add or delete: Pre-screener Q1 to Q3, then Q4 on.

**Options are drawn by kind.** Every builder and read-back draws a multi-select's options, and a Multi-select/row matrix, with checkboxes, and a single-select's with radios.

**Payment & Publish is one screen.** The four Payment and Publish frames are pixel identical except that Publish Study is drawn enabled on one and disabled on the others. Same label, size and position. Build it once with an enabled state.

**Panels over the Study and Publish steps:** Add an override (opened by "Add Override" on the Date Overrides card); Payment Breakdown (opened by "View Breakdown" on the Payment Summary card, and is the step-4 Costing Summary and Payment lifted into a panel).

**Popovers in the create flow:** Country Location, Age, Ethnicity, Area Type, Education, Genders, Experience, Household Income, Profile Tiers, and two Question menus.

**The two Audience drawings disagree with each other** on the field list (Country with flag chips versus Location, Skills versus Organization size, two conditions versus three, Trust Score present in only one), on the forecast, and on the top-bar button. They are built as two screens so each matches its own frame. **The numbered step is canonical.** See D15.

### 12.5 Manage a study: one flow

Every Manage screen sits in a shared frame: the study header (240 × 182 thumbnail, type tag, status, title, duration and industry chips, and four figures: Completed, Qualified, Days Remaining, Progress) on a tinted card, then a bordered content card whose top is a seven-tab strip: Overview, Manage Study, Matched, Recruited, Results, Revisions History, Pay.

| Route | Tab or screen | Kind |
|---|---|---|
| `/studies/:id` | Study Overview | page |
| `/studies/:id/manage` | Manage Study | page |
| `/studies/:id/matched` | Matched (and the Invited segment) | page |
| `/studies/:id/recruited` | Recruited | page |
| `/studies/:id/results` | Results | page |
| `/studies/:id/revisions` | Revisions History | page |
| `/studies/:id/pay` | Pay while ongoing | page |
| `/studies/:id/pay/due` | Pay, due as completed | page |
| `/studies/:id/payment` | Bill Payment (a separate screen, not a tab) | page |
| `/studies/:id/respondent/:rid` | Respondent: Screener / Study Result / Activity (Screener and Activity on a group study) | page |
| `/studies/:id/sessions/:sid` | A group session: Study Result and Activity | page |
| `/studies/:id/paused` | Paused study | page |
| none | Respondent Profile Details | panel |
| none | Rate respondent | panel |
| none | Download Sessions Results (group types) | panel |
| none | Mark [individual] as No-show | modal |
| none | Report Participant, and its confirmation | panel and modal |
| none | Stop-complete Study?, Re-publish and Recruit, Pause Study Participation? | modals |

**Overview and Manage Study are two jobs, not two views.** Overview is *how the study is running*: progress tiles, description, share link, active since, the client card. Manage Study is *what the study is*: the four Create steps read back as cards, each with an Edit that returns to that step.

**Matched and Invited are one tab**, a segmented switch. The cards are identical; only the action row changes: "Invite To Study" and "View Profile" become one disabled "Invitation Sent!". The whole card opens the profile, and Reviews beside the Trust Score in the profile panel opens that person's reviews, built from the platform's ratings. Sort offers Score (as matched) and Name; Location offers All, then the places the people listed are in. Tier, here and everywhere, offers All Tiers, Platinum (90+ score), Gold (70 to 90 score) and Silver (up to 70 score), read from the policy's thresholds.

**Recruited has three flavours and the study type chooses:**

| Type | Recruited shows |
|---|---|
| Survey, Diary | An applications table: Name / Role / Status / Score, with Status and Tier filters and a pager |
| Video Call 1:1, In-Person | A `Scheduled | Applications` switch. Scheduled is Name / Role / Score / Session Time, with Join Now on the imminent slot, and a Cancel link on each booked row |
| Group Video, In-Person Group | A `Sessions | Applications` switch. Sessions are cards with a seats chip, View Participants, which opens the session page, and an avatar stack |

Status offers All, then each status its pills show (Applied, Qualified, Scheduled and so on).

**Scheduled lists only sessions still to come or running.** One that has ended leaves the list: to Results if completed, to Applications (Qualified) if not. A row opens Study Result with Scheduled For, Join Now and the Verification PIN.

**A Qualified row in Applications** opens Study Result on a one-to-one study: the schedule before the session, the completed result after it, and a line saying so when the participant has not booked yet. On a group study it opens the respondent result. Applied and Disqualified rows open the screener.

**Everything behind one respondent is a single screen with three tabs**, not three screens: Screener, Study Result and Activity. The study strip, the profile rail and the bottom bar are shared; only the tab body and the bar change. An applied (not yet qualified) respondent drops the Study Result tab and swaps the bar for Qualify / Disqualify. **A group study's participant has only Screener and Activity** (1627:105446, 1769:90865, 1627:108935, 1777:95895), with the session's PIN in Activity: their result and attendance are on the session page.

**The only fork is the Study Result tab.** Survey and diary list the answers (the diary under DAY n bars, each day's answers against that day's questions). A video call shows Scheduled For with Join Now beside the PIN before the session (1627:100096), and the Video Result after it (1627:100279). An in-person interview shows the booking with its address and Start Interview beside the PIN, then the running interview with Finish and its clock, then the completed one (1627:102694, 1627:102902), with the interview notes below. The attendance bar follows 5.3. The profile rail carries Reviews beside the Trust Score.

**The video result.** The platform holds no recordings until a video provider is connected. The card is drawn as the frames draw it, with the session's length and date; View Video Recording and Transcript say that the recording and transcript appear there once the provider is connected.

**The interview notes** are typed into the notes card, saved as they are typed on the one-to-one booking or the group session, and downloaded as a text file. The client app and the console read and write the same notes: the console's one-to-one result shows them, and its group session page edits them. The formatting row (bold, italic, underline, strike, four heading levels, list, circle) inserts plain-text marks. A study starts with no notes; only the seeded demo studies carry sample notes, so the demo reads as used. An empty notes box shows a plain prompt, never sample notes.

**The group session page** (`/studies/:id/sessions/:sid`), opened by View Participants on Recruited and View Result on Results, has Study Result and Activity tabs.

| Type | Before the session | During and after |
|---|---|---|
| Group Video Call | Scheduled For with the seats count and Join Now, the shared Verification PIN, and the participants (Name, Role, Score) with a Tier filter (1627:105750) | The Video Result, each participant's attendance, the PIN, and Completion Confirmation with Mark all as Completed (1627:106074, 1769:91859) |
| In-Person Group | Scheduled For with the address and Start Interview, the PIN, the participants, and the notes (1627:109239) | The interview with Finish and its clock, then Completed; the notes, the attendance, the PIN and Mark all as Completed (1627:109586) |

Activity (1627:106405, 1627:109934) searches the participants by name or role and lists each with View Profile, View Activity (their steps, opened in place) and Rate or Rated, then the PIN.

**Results by type.**

| Type | Figures | List |
|---|---|---|
| Survey, Diary, Video Call | Completed, Avg. Trust Score, Rated By You, Results Summaries | One list |
| In-Person | Sessions Completed (sessions sat against sessions booked), Participants Completed, Avg. Trust Score, Notes Summaries | One list |
| Group Video Call | Completed, Avg. Trust Score, Results Summaries | Grouped by session: a session row with its date and View Result, then its participants with a Session column (1627:104407) |
| In-Person Group | Completed, Avg. Trust Score, Notes Summaries | Grouped by session, as above (1627:107896) |

Every row opens that participant's result. The Score heading sorts. Results Summaries downloads every completed answer as a spreadsheet; Notes Summaries downloads every interview note as one file. The study verification certificate below has two icon buttons: download, and copy its check link.

**Rate (a panel)** asks for three things and no arithmetic: Expertise, Reliability and Communication at five stars each, plus an optional written review. The frame shows no weighting, no resulting score and nothing about the Trust Score. The Trust Score takes the rounded mean of the three as the study's star rating. See D16.

**The Pay tab is a statement, not an approval.** It has no list of respondent payouts. While the study runs the Billing card reads Total Recruiting Cost ($rate x the required participants), Less: 20% Upfront Deposit, Less: 30% Recruitment Cost "As on" the day it was taken, and Payable; Payment Overview reads Deposit Paid and Total Cost; Transactions list each deposit ("20% Upfront Deposit", "30% Recruitment Cost") and the bill ("Net Payable Bill"), newest first, each with Invoice. A completed study's Payment Overview is one figure, Total Paid. Nothing on it approves a respondent's earnings. Its only payment action is **Pay Bill**, unpayable while the study is recruiting and payable once it is in Billing, which opens Bill Payment: a card checkout against the invoice, with the deposit netted off. The balance is due 7 days after the study enters Billing.

**In Billing** the tab opens with a banner: "This study is stopped by you to mark completed!" (or "This study is stopped by the team to mark completed!", or "This study has filled its target and stopped recruiting!"), the time it stopped, and **Re-publish and Recruit** (see 5.1). Its highlighted line reads "Your study has N participants left to fill target", the target less the completions, and is left out when nothing is left. The billing card (Billing States 2.0) shows two figures: **Estimated**, the rate at the required number of participants, down to Payable, and **Final**, one line per rate period of the participants who completed, down to Net Payable (Net Paid once paid). Where the deposits are more than the final bill, the difference reads "Credited to your next study". Then Net Payable with Pay Bill and the drawn line "To be auto-debited by [due date] by [card] **** 4242", Deposit Paid, Total Cost, and Transactions. **The auto-debit line reverses an earlier removal** (13 and 15 October 2026) and is on the difference list: it is shown as drawn, and nothing debits a card on its own; Pay Bill is the payment.

**Revisions History** lists every round of changes to the study since it was first submitted, newest first: when, who made it (the client, or the team after a live edit), and field by field what changed, named by Create step ("Audience / Ethnicity: added Asian").

**The study menu** in the header, and on every Ongoing card and row: Copy Study Link, Pause Study (Resume Study while paused), Stop-complete Study, which asks "Stop and Mark Study Completed?" and moves the study to Billing, then Contact Us To Edit (an email to support naming the study), Duplicate to Drafts and Add to a Group, which opens "Available groups". A study in Billing gets the completed study's menu. The client has no Edit on a live study.

**Recruit more.** When a running study meets its target, a "Congrats!" banner offers Recruit more (see 5.1).

**Reporting a participant.** A respondent's page carries a Report row, which opens Report Participant (see 5.7). After Qualify or Disqualify, the bar shows the decision with Undo.

**Cancelling a session.** Cancel on a booked row opens Cancel Session?, with "Reason, sent to [name] (required)". See 5.3.

**Names open the profile.** A participant's name on Matched and Invited, Results, Pay and the respondent rail opens Respondent Profile Details, with Reviews and Invite To Study.

### 12.6 Pool

| Route | Screen | Kind |
|---|---|---|
| `/pool` | Pool | page |
| none | Respondent Profile Details, Reviews, Invite To Study | panels |
| none | Invitation has been sent! | modal |

**Pool is one screen in two states**, with the 245px filter rail shown or hidden. It lists the participant pool with a natural-language search and nine filters, and the whole card opens a profile panel with their score, tier, verification, full profile and review history. Reviews in the panel lists what clients wrote about that person, from the platform's ratings. The Pool's panel is titled "Profile of [name]" (1645:162885). From there the client can invite them to a live study; "Invitation has been sent!" names the study, and nothing is said to be sent when the client has no live study.

**Micro-panels are removed.** A client-built, saved, reusable list of respondents was drawn in an earlier version of the designs and has been switched off deliberately. Everything that belonged to it is gone: the Participants Pool and Micro-Panels toggle, My Panels, Featured Public Panels, panel detail with Members, Eligible Matches and Panel Details, Create and Edit Micro-panel, Save To Micropanel, Launch Study, Invite All To Study, and the three panel dialogs.

Nothing replaces them. A client recruits from the pool directly, one person at a time, into one study.

### 12.7 Payments

| Route | Screen | Kind |
|---|---|---|
| `/payments` | Payments, pending | page |
| `/payments/history` | Payments, completed | page |
| none | Add New Card | panel |
| none | Make Payment | panel |
| none | Invoice Details | panel, two states |
| `/payments/pay-all` | Pay All Due Invoices | page |
| none | $350 paid successfully!, Remove **** 4242 Card? | modals |
| none | Paid successfully (all invoices) | modal |

**Payments is one page in two states, not three tabs.** The segmented toggle switches Pending and Completed; the third column header changes from "Due Date" to "Date"; and Pay Invoice comes off each row leaving download and view. **The saved cards sit on the same page under the table**, so there is no separate methods tab.

**Invoice Details is one panel in two states.** Unpaid draws a warm notice, the amount and the due date, with **Make Payment** in the footer. Nothing is auto-debited, so the drawn line "If not paid manually, will be auto-debited from [card]" is not shown. Paid draws a green receipt: "Paid $350 successfully!", the card, the timestamp: with **Download**. The study card, the invoice number, the breakdown and the total are identical.

**Pay All Due Invoices** lists every unpaid invoice with a tick against each, the saved card with "Change method", and a total. **A client may untick an invoice** and pay only some. There is no single charge across studies, so each selected invoice is paid in turn and the confirmation states the total paid and how many invoices it cleared.

**Make Payment is not the study checkout.** Bill Payment is a full screen with a card form, reached from a study's Pay tab. Make Payment is a 375px panel with **no form**: the amount, a link back to Invoice Details, the saved card already chosen with "Change method", and a pay button.

### 12.7a Payment and Publish, and study groups (23 October 2026)

**Payment & Publish** (Proceed to Publish on the Study step) reviews About, Audience, Screener and Study on the left, with Edit Study Details. On the right: **Payment Summary** with View Breakdown, Total Recruiting Cost with its "$250 x 20 participants" chip, and "To pay upfront • 20%"; then **Payment Method**. A client with a saved card has it selected (the decision of 15 October); "Use a different card" opens the card form (Card Number, Expiry Date, CVV, Name on Card, Billing Address, Zip Code, Save this card) and **Add Card to Publish**, which checks the card and shows "Card is verified to pay" (Card Added to Publish). Only then is Publish Study enabled. A card added here is kept on the account for future invoice payments, as the last note says; Save this card makes it the default. Then the card fee line, "3% merchant processing fee applies when using a credit card. Learn about payment options" (Learn opens Help; nothing charges the fee), and four notes:

- Cost is subject to change based upon modification in study requirements.
- You are only charged for participants that completes the study.
- Studies recruits until filled or till defined deadline or max 60 days from publish.
- This card will be used for future invoice payments.

**Payment Breakdown** (View Breakdown) is the Costing Summary (Total Recruiting Cost, $rate x participants) and the Payment Structure (Upfront deposit • 20%, Incentive deposit • 30%, Completion Due • 50%, Total Est. Cost), with the same four notes.

**Payment** (Pay Bill) is the study card, the Invoice Breakdown (the Final bill) and the card form, with "Pay $N", the card fee line and "You are only charged for participants that complete your research." Invoice Details shows the same Final bill.

**A study in review** (Manage Study-1) has a Payment tab: Total Cost, Total Paid, Card on File; Billing (Total Recruiting Cost, Less: 20% Upfront Deposit, Net payable cost); and Transactions.

**Manage Study on a live study** opens with "Want to make any changes? Please contact us to modify and update your study with any changes you need." and Contact Us, an email to support naming the study. A draft or a study in review keeps its Edit buttons instead.

**Study groups.** A client can group their studies (`StudyGroup` in `shared/types.ts`; `createStudyGroup`, `updateStudyGroup`, `ungroupStudyGroup`, `addStudyToGroup` in `shared/store.ts`).

| Control | Does |
|---|---|
| Create Group (the folder button beside Study Type) | A name, required and not one the client already has, and optionally studies to add (Select Study). Submit creates it |
| A group's pencil | Edit Group: rename it, change its studies ("2 studies selected"), or Ungroup |
| Ungroup | Asks "Remove and ungroup the studies?" ("The studies of the group will be ungrouped to others and this group will be removed."). Cancel or Ungroup |
| Add to a Group, in a study's options | "Available groups", one row each; picking one adds the study |

My Studies shows each group as a named section with its studies on that tab, then **Others** under a rule. With no groups there are no headings (Studies - No groups). A study is in one group at most: adding it to another moves it. Drafts cannot be grouped. A group with no studies yet is shown on every tab with a line saying how to fill it; a group whose studies are all on other tabs is not shown. Groups work in the table view too.

### 12.8 Help and support

| Route | Screen | Kind |
|---|---|---|
| `/help` | Help (FAQs) | page |
| `/help/tickets` | Support Tickets | page |
| `/help/tickets/:id` | Ticket Chat | page |
| none | Ask Support | panel |
| none | Mark as solved?, Sent successfully! | modals |

**Help and Support Tickets are one screen** with a 320px segmented toggle swapping the FAQ list for the tickets table.

Help holds **nine FAQs** under a "Search your queries" field, the first drawn open, and a **Need Direct Help?** card whose Contact Support raises Ask Support. **There are no guides, articles, videos or phone routes anywhere; the only route to a person is that one form.**

**Stuck? Need Help?** sits above the account card in the sidebar on every screen. It opens three items: FAQs Resources (Help), Create Support Ticket (Ask Support), and Book A Call With Us, which opens Ask Support with the subject "Book a call with the team". No call is booked by the platform; the team replies to the ticket.

**A ticket carries** a subject, a one-line preview of the latest reply prefixed with who wrote it, an unread dot, a status of Open or Closed, Last Activity, Created On and a number. Inside, the thread opens with a Ticket Info card the client filled, then attachments, then replies.

**Ticket Chat is one screen in two states.** A Closed ticket has no composer and cannot be replied to.

Sort by is a menu: Newest first, Oldest first.

**No reply time or response expectation is drawn.** The only statement about timing is on the Sent successfully! dialog: "Our team and assistants will review and reach out to you shortly."

### 12.9 Account

| Route | Screen | Kind |
|---|---|---|
| `/account` | Profile | page |
| `/account/reviews` | Rating & Reviews | page |
| `/account/certificate` | Certificate | page |
| `/account/settings` | Settings | page |
| none | Change Password, Deactivate Account, Logout | modals |
| none | Password has been updated!, Your account has been deactivated!, Alert: your account has active studies! | modals |

All four pages are one screen with a 197px sub-navigation and a 600px column. **Logout is the fifth navigation item and raises a dialog** rather than changing the column.

**Profile has no Payment Method section** (removed 23 October 2026: not in the design). Nothing depends on it: cards are added, edited, removed and made default under Payments, Saved Payment Methods, and Publish asks for a card when there is none.

**Rating & Reviews shows both directions on the same row.** The headline is the client's own aggregate. Under it, each entry is a study with a star rating, a date and a written review, then a second line: "To participant: [name] 5.0". So the top line is the score attached to that study and the bottom line is what the client gave the participant back. The participant's name opens their profile panel.

**The client certificate is a business verification badge, not a trust score.** The banner reads "You are a verified business!". The card is titled "HumanLayer Buyer Certificate" and carries its own ID, `FI-C-XXXX-XXXX`, issued once when the business check passes. It claims only what the platform verifies: "Business registration verified", and "Billing on file" when a card is saved. Before the check passes the tab says "Not issued yet". There is no expiry date, download, share link, public check URL or named issuing authority. See D12.

---

# PART C: THE INTERNAL TEAM CONSOLE (desktop)

The console the Focus Insite team uses to run the platform. Light theme, 1440px, a 230px sidebar. Around 95 screens from 294 frames.

## 13. Console: navigation, entrance and shell

### 13.0 No entrance

**Removed 23 October 2026: it is not in the design.** `/internal` goes straight to sign in for a signed-out visitor; a signed-in team member goes to their dashboard, or to the first module they have.

**There is no sign-up.** A master admin makes every team account, on Sub-Admin. Sign In is drawn (1849:112091) and has no sign-up link.

### 13.1 The sidebar

The sidebar has two groups.

| Group | Items |
|---|---|
| **Users** | Dashboard, Studies, Participants, Clients, Support |
| **Platform** | Finance, Pricing & Rewards, Sub-Admin |

Studies expands to **All Studies** and **Reported**. Participants expands to **All Participants** and **Verifications**. Clients expands to **All Clients** and **Verifications**. The account card sits at the bottom of the sidebar: avatar, name, "Master Admin".

Badges appear on Dashboard, Support and Studies > Reported, showing counts of things waiting. The Reported badge counts studies with open reports.

**The nav lights by route, never copied from a frame.** Several frames light the wrong item (the Studies Ongoing frame and every Review frame light Dashboard; the client verification detail lights Participants). Those are design errors and are corrected in the build.

## 14. Console: module by module

### 14.1 Dashboard: the actions pending queue

One screen, five tab states: All, Onboarding, Studies, Support, Manage.

Four figures across the top:

| Figure | Counts |
|---|---|
| Screeners To Review | Screener applications waiting for a team decision, across all studies |
| Onboarding To Verify | Participant identity and profession checks plus client business checks that failed automatic verification and wait for a person |
| Open Tickets | Support tickets not answered by the automatic first line and not resolved. Matches the Support nav badge |
| Live studies | Studies approved and running. Matches the count on Studies > Ongoing |

Below them, grouped queues of things waiting. Each group has a count, a collapse chevron and a "View All". The whole row opens its item; "View" is the row's label, not a second link.

| Group | Opens |
|---|---|
| Identity Verification | Participants > Verifications |
| Client-Business Verification | Clients > Verifications |
| Screeners to review | Studies (rows to the study) |
| New Support Tickets | Support (rows to the ticket) |
| Refunds for unfilled studies | Finance > Refunds (rows to the refund) |
| No-show verifications | Studies (rows to the study). A row reads "[participant] • [study title]" |
| Flagged/reported accounts | Participants > Verifications, Reported segment |
| Payouts overdue | Studies whose participants are past the 14 day payout promise. First under All and Manage, and counted in their tab numbers like every other group |
| Payouts ready to process | Finance > Payouts: the rest, still within the 14 days. It sits under Manage and counts in Manage's tab number. Each payout is in exactly one of the two groups |

**The four tiles are not links.** There is no chart anywhere in the console; nothing needs a charting library.

**Missing:** no frame draws a no-show verification queue, although the Dashboard links to one.

### 14.2 Studies

One screen, three tab states.

| Tab | Columns | Row action | Row opens |
|---|---|---|---|
| To Review | Study Name, Type, Participants, Submitted on, Total Cost | Review | `/studies/review/:id` |
| Ongoing | Study Name, Type, Completed, Last Activity, Applications (a chip with a chevron) | the chip | `/studies/:id` |
| Completed | Study Name, Type, Completed, Date | none | `/studies/:id` |

Search: "Search studies". **All Studies** is a checkbox list: All, Survey, Video Call, Group Video Call, In-Person, Group In-Person, Diary Study, with All by default. **Sort** offers Recent, Earliest, Highest Participants, Lowest Participants, Highest Cost, Lowest Cost. Both filter and order the list on all three tabs. A study in Billing is listed under Ongoing.

**Reported Studies** (`/studies/reported`) has two segments, Pending and History. Columns: Study Name, Type, Client, Last Reported on, Study Created, Users Reported. A row opens the reported study (`/studies/reported/:id`): the study, every report on it (the participant, the reason, the description and the date), **Chat**, and **Mark Reports Resolved**. Resolving takes a written statement and the signed-in member's password and closes every open report on that study; the statement is kept with the resolved reports, which move to History. Every resolved round in History has View Support Ticket; a round resolved without a ticket gets one when it is first opened, kept against the round. A reporter's name, on Pending and History, opens their profile in a pop-up. See 5.7.

**No column anywhere shows who on the team owns or last touched a study.** No assignee, no "last touched by". For a console whose whole purpose is a team working through queues, this is a real gap. It recurs in every module; see D17.

### 14.3 Review a new study

One screen, six tabs, the Study tab switched on type, plus two overlays. This is the approval gate: every new study passes through here.

| Tab | Holds |
|---|---|
| About | Title, description, type, study time, thumbnail |
| Audience | Targeting as pills in three groups |
| Screener | Each question with each answer's verdict: Correct / Incorrect / May Select / Must Select |
| Study | By type: availability, group sessions, the survey form, or the diary setup and days |
| Payment | Overview, billing, transactions |
| Revisions History | What was sent back before, and when the study was submitted |

**Two actions are drawn, both in the title bar.**

- **Request Changes** opens a 600px panel with one text area, "Describe the required changes in detail", and Cancel / Send. This is the only place a note is written. After Send, the Revisions History tab gains a "Requested changes." entry.
- **Approve to Publish** first asks "Publish live for participants?" ("The study will be published live on the participants app for them to apply for it.", Cancel / Approve and Publish). Then it confirms: "This study has been published live! … It is live on the platform and showing to targeted participants." with "Done! View Details".

The Screener tab draws a multi-select's options with checkboxes and a single-select's with radios.

**There is no reject, no decline and no edit anywhere in this section.** Everything in the tabs is read only.

**Nothing drawn shows** the study leaving the To Review list, moving to Ongoing, or the client being notified. Specify all three.

**Content cut off in the design.** The Screener and Survey tabs hold nine question blocks and Diary three days, but the frames stop after the fourth question and the second day, and the clipped content cannot be read even in the file. Five further question types exist: a long text, a slider, a drag-to-rank list, a file upload and a matrix. Review shows them read only; how each is set up is in 14.4 (Edit Study).

### 14.4 Manage a study

One screen for all six types, seven tabs: Overview, Manage Study, Matched, Recruited, Results, Revisions History, Pay.

Header: image, type tag, status, copy-link and options buttons, title, duration and industry tags, and four figures (Completed, Qualified, Days Remaining, Progress).

| Tab | Holds |
|---|---|
| Overview | Four tiles (Progress with a ring, Completed, Qualified, Days Remaining), description, share link with Copy, Active Since, the About Client card with "Go To Profile". The pace of completions against the days left. When the target is met, a "Congrats!" banner naming the study's own required number |
| Manage Study | Four read-only blocks: About, Audience, Screener, Study |
| Matched | Cards of surfaced respondents, with Invite To Study and View Profile; an Invited segment. The whole card opens the full profile; Reviews beside the Trust Score in the profile panel opens "Reviews of [name]" |
| Recruited | Three flavours by type, exactly as the client app, with the same Scheduled and Qualified rules (12.5). Status offers All, Applied, Qualified, Disqualified. A Qualified row on a group study opens that person's session; on a one-to-one study, Study Result |
| Results | Tiles, a summary card with Download, completed respondents with Rate Now or Rated, and a "STUDY VERIFICATION CERTIFICATE / 21 of 21 completions verified human" card |
| Revisions History | Every round of changes to the study, each headed "Changes made by Client" or "Changes made by You" (the team), field by field |
| Pay | The client's bill, read only. Invoice downloads a PDF. Nothing in it says a balance is auto-debited. In Billing it carries the same banner and figures as the client's, written from the team's side, with no Pay Bill and no Re-publish and Recruit |

**The options menu:** Copy Study Link, Pause Study (Resume Study while paused), Stop-complete Study, which asks "Stop and Mark Study Completed?" first, and Edit. In Billing it holds Copy Study Link only.

**Attendance.** Session rows, the one-to-one bar and the respondent page show the attendance actions in 5.3. A participant's name on a session row, in session activity and on the respondent rail opens their profile; the rail carries Reviews beside the Trust Score.

**Pause Study** opens a 600px panel: "Pause Study Participation?", a Reason box, Cancel / Yes, Pause Study. **This is the only way to pause drawn anywhere.**

**Paused** adds a red banner: "You have paused this study with stopping recruit new participants further." with "Mark as completed" and "Resume Study". The About Client card disappears and the tiles widen.

**Edit Study** (`/studies/:id/edit`, `?step=about|audience|screener|study`) is how the team changes a live or paused study. Four steps in the title bar, About, Audience, Screener and Study, with Cancel and Publish. The Edit buttons on the Manage Study blocks, the "Set Criteria" links and the self-managed rows stay switched off; Edit in the options menu is the way in. The rules on what may change are in 5.1 and D7.

| Step | Holds |
|---|---|
| About | The four type cards, with the study's own selected and none selectable ("The study type cannot be changed after published"), the group switches fixed. Duration slider, Study End Date, title, description, and the thumbnail (upload, change, remove; a JPEG or PNG up to 2MB). Beside it, "This is how participants see your study": the respondent app's study card drawn live from the form, with refresh and close; Preview brings it back |
| Audience | Generate with AI (Fill with AI, which never changes the number of participants), every criterion as a dropdown with chips in the order of 12.4, the number of participants shown and not editable, and the Check Participation Forecast panel (see D34) |
| Screener | Generate with AI: Generate adds questions from typed text, Regenerate All replaces them, both checked as Publish checks them. The question builder: each question's label, kind, text and settings; drag by the grip to reorder; a three-dot menu on each (12.4) with Required, Move up, Move down, Add question below and Delete, which deletes at once. Beside it, the screener as a participant steps through it |
| Study, survey and diary | Survey Settings: the question count and Edit Survey, which opens Create Survey across the whole step: "Auto-saved", Submit Survey, a box for context or questions with Upload File (a text or CSV file, one question a line) and Generate, then the builder |
| Study, session types | The availability, addresses and sessions, shown and not editable |
| Study, money | Incentive Payments, Costing Summary and Payment, from the study's own figures. See D33 |

**The question builder** offers nine kinds. Single-select and Multi-select: options, drawn with radios and checkboxes, each with its verdict (Correct, Incorrect, May Select, Must Select on a screener; Qualify, Disqualify on a survey), add and remove. Single-line, Number and Multi-line input: a note saying what the participant enters. Slider: Min Value, Max Value, Gap and a Show Gap switch. Ranking: numbered items. File Upload: File formats (PDF, PNG or JPG, CSV, Any file) and Max number of files. Mattrix: columns and rows, Single-select/row or Multi-select/row.

**Publish** saves the changes, records them against the team in Revisions History, and opens "Your changes has been published! It will be updated and applicable to new upcoming participants." with "Done! View Details", which opens Revisions History. A change the store refuses says why, and nothing is saved. Cancel leaves without saving. The edit in progress is kept on the device until Publish or Cancel, so a reload loses nothing.

**The completed study is a shorter screen**: a smaller header with status "Completed" and no figures, a two-item menu, and three tabs with no panel: Overview (success rate, completed, qualified, closed date), Results, and Payments. Manage Study, Matched, Recruited, pause and edit are all gone.

**Payments on a completed study**: Billing with Estimated and Final, down to "Net Payable - Paid"; Payment Overview with Deposit Paid and Total Cost; and Transactions, the final settlement and the incentive deposit, each with Invoice. Amounts keep their cents ("$937.50"), here and everywhere.

### 14.5 Participants

**The list.** Two segments, Active and Deactivated, with a count line. A toolbar: search by name or role, Advanced Filters, Last Active, Profession verified, Gender, Tier. Ten rows with pagination.

Columns: Name (with photo), Role, Industry, Score & Tier, Gender, Location, Last Active or Deactivated. Name, Score & Tier, Gender and the date are sortable.

| Dropdown | Options |
|---|---|
| Last Active | Today, Last 7 days, This Month, Last 30 days, Last 3 months |
| Profession verified | All, Profession Verified |
| Gender | All, Male, Female, Other |
| Tier | All Tiers, Platinum (90+ score), Gold (70 to 90 score), Silver (up to 70 score) |

Every dropdown narrows the list.

**Advanced Filters** is a panel: Roles, Domain, Location, Language, each a dropdown offering what the platform's participants hold, with a chip for each pick, then Cancel / Save.

**No row action and no bulk action is drawn.** No checkbox, no menu, no button. A row opens the profile.

**Restricted, flagged and reported people are not marked or separable here at all.** No status column, no filter, no tag. Certificate state does not appear either.

**The profile.** Three segments with ten states.

| Segment | Sub-states |
|---|---|
| About | Professional Details, Trust Score, Personal Details, Account Details (the ID documents as uploaded, with their names and sizes, and where the check stands) |
| Studies | Invites To Schedule, Scheduled, Applied, History, Saved |
| Wallet | Earnings, Payouts, Reward Points, Referrals |

Header: photo, name, role, place, Cert. ID, profile completion, Profession Verified, the score, the tier, Reviews, copy link, an options menu, last active.

**Every study row opens the study as it stands for that participant.** Invited to apply: the study's Invited list. Invited to schedule or complete, Scheduled, Applied and History: their own page on the study, the screener while applied or disqualified and the result after. Saved without taking part, and drafts: the study itself. Studies filter by type: All, then the types listed. Reward Points rows for a study open the same way.

**Wallet.** The wallet and points balances are the participant's own. A transaction opens Transaction Details for that earning, whose study card opens that participant's completion result; a points redemption has no study card. Wallet tables page at ten.

**What the team can do from here:** read Reviews, Invite To Study, Send E-mail, Deactivate Account, Reactivate Account. **That is all.** No restrict, no flag, no report, no note field. **No control changes a score, tier, certificate, balance, points or study status. No override of any kind is drawn.**

**Deactivate** is three steps: a form ("User will receive the deactivation email with your given reason and won't be able to access until you activate it back.") requiring a Reason and the team member's password, a confirmation, then an outcome. Reactivate mirrors it exactly. Every password asked for in the console is checked against the signed-in team member's own.

**The deactivated banner names no one:** not who deactivated the account, not whether it was a person or the system. There is no activity log of team actions anywhere on the profile.

### 14.6 Participant verifications

**Two queues in one screen**, as segments: Onboarding and Reported. Each is a pending table plus a History table.

| Queue | Columns |
|---|---|
| Onboarding | Name, Role, Date, Flagged For (Identity Verification or Profession Credential, both in one queue), Reason |
| Reported | The same plus Reported By (a person on the team, or a client; never the system). Flagged For: AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong Match, or a client's reason (see 5.7) |

History carries Completed, Verification Remarks and a Result: Verified / Rejected for onboarding; Rejected / Restricted / Deactivated for reports.

**The detail screen** has two tabs: the check itself and Profile Details.

| Kind | What the team compares |
|---|---|
| Identity | The two uploaded files (front and back) as the participant named them, with their sizes and a view button. A submitted ID reads "Submitted for review" and "Waiting for your decision"; one an automatic check flagged reads "could not be verified with the govt. records". No selfie line |
| Profession | Occupation and licence number as text, against "could not be found". **No licence document is drawn** |
| Report | The category, a one-line reason, View Study, and the Reported By card, which opens the reporting client's profile. The header carries the participant's own certificate ID |

Decisions and their wording are in Section 5.6. A decided screen greys the card, swaps the buttons for "View Support Chat" and adds a dated note.

Flagged For, Reported By and Result offer the values their tables hold. Pagers count the real rows.

### 14.7 Clients

**The list** mirrors the participants list: Active and Deactivated segments, a search, three dropdowns, columns Name / Role / Company / Industry / Location / Last Active. Industry and Location offer All, then what the listed clients hold; Last Active (Deactivated on that segment) offers All, Today, Last 7 days, This Month, Last 30 days, Last 3 months. All three filter. No row or bulk action.

**The profile** has three tabs.

| Tab | Holds |
|---|---|
| About | Account Details (work email, role, company, VAT number, website, industry, location) and Reviews |
| Studies | Ongoing and Completed tables: Billed, Required, Completed, dates, a row menu |
| Payments | Due Payments, All Time Spent, Average Study Cost; Pending and Completed Invoices; Saved Payment Methods |

> **Compliance defect, fix before build.** The Saved Payment Methods card draws **full card numbers and CVV codes** on screen. A CVV may never be stored by anyone under card industry rules, and a full card number must never be shown to staff. Show the last four digits and the card brand, nothing else. This is not a design preference.

**No team members appear anywhere.** One person per client account.

**What the team can do:** Send E-mail, Deactivate Account, Reactivate Account, and on a study row Copy Study Link / Pause Study / Duplicate to Drafts. No restrict, no approve.

**No deactivate or reactivate dialog is drawn for a client.** The participant flow is reused, and it still names a participant. Write the client versions. Deactivating is refused while the client has active studies or an unpaid invoice (5.5).

The Reviews on a client's About tab name each participant under "To participant", and the name opens their profile. Earlier reviews held only as history name a participant without a link.

**Client business verification** is one queue. What is checked: the VAT number and the company website the client typed. No document is uploaded or shown. Decisions: Reject, Mark Verified, Chat, each with a required statement; verify also takes the password. Pending filters by Flagged for; History by Result, Verified or Rejected.

### 14.8 Support

Three segments: New, Ongoing, Closed. Columns: Support Ticket (subject over the last message, with an unread dot), From, Last Activity, Created On, Ticket Number. One search, no filter.

The ticket screen and its states are in Section 5.8. Actions: reply with attachment, Mark Resolved, Re-open, Create Ticket (Subject, User Email Address, Message).

**Mark Resolved warns:** "Are you sure you want to mark this ticket as resolved? User won't be able to message further on this ticket." Then: "#[number] is marked as resolved and moved to closed section."

### 14.9 Finance

**Overview** with four tiles and five transaction tabs.

| Tile | Shows |
|---|---|
| Clients Spent | All-time, with a year-on-year change |
| Participants Earned | All-time, with a change |
| Gross Revenue | All-time, with a change |
| Refunds Pending | Amount and the number of underfilled studies |

> **Defect:** Clients Spent minus Participants Earned does not equal the Gross Revenue drawn. Derive it; do not hardcode it.

| Transaction tab | Money, and which way it moves |
|---|---|
| Participant Earning | Platform → participant, per study |
| Participant Payouts | Platform → participant, a bank withdrawal |
| Study Payments | Client → platform |
| Client Refunds | Platform → client, against a study deposit |
| All | All four, with To and From columns |

A row opens a Transaction Details panel: who, how much, the date, a transaction id, the method, and a Download. A participant payout row opens Payout Details instead. Pagers count the real rows.

**Payouts** (`/finance/payouts`) holds two lists. **Withdrawals** comes first, with columns Participant, Date, Reference ID, To Bank Account and Withdrawal Payout. A row opens the withdrawal (`/finance/payouts/:personId/:payoutId`): the participant, the amount, Date Requested, Reference ID, and the payout account (Bank Name, Account Number, Account Type), with **Release Payout**. It asks "Release [amount] Payout?" first, then reads "Payout Released!" and confirms "The transaction of [amount] has been initiated for withdrawal payout to [name]. Participant will receive the funds within 2-3 working days." Approve, Hold and Retry have no screen; see D2. Below it, the study payouts: studies in Billing or completed with participants still to be paid, and Process Payouts. A participant is paid here, never on the client's invoice.

**The 14 day promise is shown here** (23 October 2026). Participants are told they are paid within 14 days after the study ends (6.4). Each study waiting to be paid shows when it ended and **Pay within 14 days**: "8 days left", "Due today", or, past the 14, "Overdue by 4 days" in red. Overdue studies sort to the top, the longest waiting first, and the header counts them beside Studies waiting. It is derived from when the study ended (recruiting stopped, or it completed), never stored, and there is no new status (`payoutsToProcess`, `payoutDaysLeft`).

**Refunds** is its own screen: "Pending Refund Confirmations", with Date, Study, Client, Target, Shortfall, Billed, Refund and a Review button.

A refund is **raised automatically by the platform from the shortfall**; the team only confirms. The detail reads "Once confirmed, the transaction of $X will be initiated to be refunded the balance amount against the client payment." The confirmation names the amount, the client and the study, and says "This action will be recorded against transaction INV-xxxxx." Then: "Client will receive the funds within 5-7 working days."

**No undo, no reject, no editing of the amount.**

### 14.10 Pricing and Rewards

Two segments: Fees and Gamification. Five edit screens behind them.

| Group | Settings |
|---|---|
| Clients | Platform Fees, Moderation Fees, Recruitment Fees with two add-on rules |
| Participants | Withdrawal fee, Reward Points Value, Minimum Points To Redeem |
| Tiers | Silver, Gold, Platinum thresholds |
| Trust Score | Earned For and Deducted For, every rule |
| Reward Points | Referral, Being Referred, Study Completion, Full Profile, Streak |

The values are in Section 6. The rules for changing them are in 6.9.

| Edit screen | Holds |
|---|---|
| Edit Client Fees | Platform, Moderation and Recruitment fees, and the add-ons: each can be edited or deleted, and Create Add-on adds one |
| Edit Trust Score | Earned For: Onboarding, Per Study Completion with its total, Max Study per year, 5, 4 and 3 star. Deducted For: 2 and 1 star, No Show, Late Show Up, Cancelled Session, Fraud. Then "Important to know" |
| Edit Tiers | Silver Tier, Gold Tier, Platinum Tier |
| Edit Reward Points | Referral, Being Referred, Study Completion, Full Profile, Streak |
| Participants | The withdrawal fee, the points value and the redemption minimum, shown with a note that the policy sets them and they are not saved here |

**Every save** is checked (6.10), then asks "Publish these changes live?", saying the change goes live for everyone and that a study already created keeps its fees, with Cancel / Yes, Publish Live. Then "Changes are published live!". Only a master admin can save; a sub-admin with Pricing & Rewards access is refused. Each change is recorded with who and when, and appears in the activity log ("Changed the client fees").

**The certificate has no field**, because nothing about it is a number to set (D12).

### 14.11 Sub-Admin

**The list.** Sub-admin members in a table, with a Create button. Below it, the **Activity log**: a global table of team actions with columns Activity, Module Path, Date and Action By (photo, name and role), filterable by module, by person and by period, with an Export. Each entry is stored as a sentence ("Restricted the account of Ruby Okoro") with no record of whom it concerns, so a name in it does not link to the person.

**Create Profile.** One form: picture, Name, Email Address, Role, Account Status, and eight module toggles (one per console module), then Create.

| Field | Detail |
|---|---|
| Role | **Free text job title.** It is shown in the list, the profile, the sidebar account card and the activity log, and it controls nothing. Access comes only from the toggles |
| Account Status | Active or Inactive. **Nothing says what Inactive does** |
| Module toggles | One per module, on or off. **There is no read-only level and no per-action permission** |

**Nothing drawn says how a new sub-admin first signs in.** A new sub-admin is invited by email with a single-use link to set their own password, expiring in 7 days. No shared or default password is ever used. The invitation email and the set-password screen need drawing.

**Profile and Edit Profile** show the same fields. **The only way to change access, suspend or effectively remove someone is Edit Profile**: change the status or flip the toggles. There is no remove, no suspend dialog, no reason, no password, no warning and no confirmation.

**The console as a sub-admin sees it** is drawn exactly once, on one frame. The sidebar account card shows the person's name and job title, and their account page loses its Edit Profile button. **But the sidebar still shows all eight modules although she has access to two.** No restricted navigation, no locked module and no "no access" page is drawn anywhere.

**This was built rather than left missing, because the console cannot ship without it.** As built: a module the person lacks is absent from the sidebar entirely, typing its address gives a refusal page naming the module, and the person lands on the first module they do have. The module toggles drive all of it. **The refusal page and the restricted sidebar are not in any design and need drawing.**

### 14.12 My Account

No tabs. A Profile card (photo, name, email, role, Edit Profile) and two settings rows, Change Password and Logout.

| Screen | Holds |
|---|---|
| Edit My Profile | Picture, name, email. **Role is locked at "Master Admin"** |
| Change Password | Current, new, confirm. Rule shown: "At least 1 special character, 1 uppercase character, and 1 number" |
| Logout | A confirmation dialog |

**The master admin's own access is not drawn**: no module list, no way to hand the role over, and no second master admin. One account holds every permission in the platform and there is no succession path.

**Sign In is drawn and there is no sign-up.** Every team account is made by a master admin on Sub-Admin.

**No access control of any kind beyond a password appears anywhere in the console**: no two-factor, no session limit, no sign-in history, no lockout after failed attempts. All four are required. See D17 in Section 16.

**Who may edit Pricing and Rewards** is governed by one module toggle and nothing else. No approval step, no master-admin-only restriction.


---

# PART D: ACROSS THE THREE APPS

## 15. The platform workflow

This is the whole platform as a single sequence, as it now stands. It supersedes any earlier workflow document. Where an earlier version said something different, this is the current one.

**How to read the State column:** it names the state the object moves into at that step, using the state machines in Section 5. A blank means nothing changes state.

### 15.0 Stage A: the client gets on the platform

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 1 | Client | Client app | Signs up with name, work email and password, accepts the terms | Client `registered` |
| 2 | System | Email | Sends a confirmation link. **A link, not a code.** The client app's Check Email screen offers only "Open My Email" | |
| 3 | Client | Client app | Clicks the link, then fills Organization Details: role, company, VAT or EIN, website, industry, location | |
| 4 | Client | Client app | Adds a payment method: card, expiry, CVV, name, billing address, postcode. **Card details go to the payment provider directly and are never stored by the platform** | |
| 5 | System | none | Attempts automatic business and VAT or EIN verification | Client `verifying` |
| 6 | Team | Console | **Only if automatic verification fails.** The check appears in Clients > Verifications. A team member compares the documents, writes a statement, enters their password, and marks it verified or rejects it | Client `active` or rejected |
| 7 | Client | Client app | Sees Welcome. The platform is now usable | |

**Not designed:** no console screen reviews a client account as a whole, only its verification documents. See D8.

### 15.1 Stage B: the participant gets on the platform

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 8 | Participant | Respondent app | Signs up, receives and enters a six-digit code | Participant `registered` |
| 9 | Participant | Respondent app | Fills three onboarding steps: personal details, professional details, and preferences | |
| 10 | Participant | Respondent app | Uploads one government ID, both sides, and accepts the consent screen. **No selfie and no liveness check: both are out of the product** | Participant `verifying`, ID in review |
| 11 | System | none | Attempts automatic identity verification | |
| 12 | System | none | For a professional participant, checks the licence number against the relevant public register | |
| 13 | Team | Console | **Every submitted ID, and every credential number given, is checked by a person** (23 October 2026). It appears in Participants > Verifications as "Submitted for review". A team member compares the documents, writes a statement, enters their password, and verifies or rejects. The participant is told either way | Participant `active` |
| 14 | System | none | Trust Score set to 50. Tier derived as Silver. The certificate is issued | |

The certificate is issued here and nowhere else, carries one unique ID per person, and claims only identity verified and profession verified. See D12.

### 15.2 Stage C: the study is created and approved

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 15 | Client | Client app | Starts Create Study. Four steps, About, Audience, Screener and Study setup, then Payment and Publish | Study `draft` |
| 16 | Client | Client app | About: title, type, description, duration, industry, thumbnail. **The type decides everything downstream**, including whether sessions exist at all |  |
| 17 | Client | Client app | Audience: how many participants, and the criteria that decide who matches: country (the USA), gender, education, age, ethnicity, area type, work function, industry, role, skills, experience, household income, the repeat rule and profile tiers. Every category set must match, with any one option within it | |
| 18 | Client | Client app | Screener: builds the questions applicants must answer. Marks correct answers where a question decides eligibility | |
| 19 | Client | Client app | Study setup: availability, session slots, location or link, and the diary form where the type needs them, and on the same step the incentive and the costs | |
| 20 | Client | Client app | Payment and Publish: sees the fees, pays the deposit, presses Publish | Study `in_review` |
| 21 | Client | Client app | **Or** saves a draft and leaves. The draft reopens with everything still in it | Study stays `draft` |
| 22 | Team | Console | The study appears in Studies > To Review. A team member reads all six tabs | |
| 23 | Team | Console | Approves to Publish, confirming "Publish live for participants?", **or** Requests Changes with a written note | Study `recruiting`, or back to `draft` |
| 24 | Client | Client app | If changes were requested, the study is in Drafts with the note in Revisions History. The client edits and republishes | |

**Fees charged at step 20:** a $100 platform fee once per study, plus per-completed-participant fees of $10 moderation and $25 recruitment, with add-ons of $25 for Video Call, In-Person or Diary types or Roles targeting, and $20 for Skills targeting. Section 6.10 has the full table.

**After approval**, the team can change a live study in the console's Edit Study; the client cannot. See 5.1 and D7. A study in Billing can be re-published by the client and recruit again.

### 15.3 Stage D: people are found and screened

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 25 | System | none | Surfaces participants matching the audience criteria | Respondent-in-study `matched` |
| 26 | Client or team | Client app or console | Invites matched people | `invited` |
| 27 | Participant | Respondent app | **Or** finds the study in Explore and applies without being invited | |
| 28 | Participant | Respondent app | Answers the screener questions | `applied` |
| 29 | System | none | Where a screener question has a marked correct answer and sits in the first three positions, it passes or fails the applicant automatically | |
| 30 | Client or team | Client app or console | Opens the applicant's Screener tab and presses Qualify or Disqualify | `qualified` or `disqualified` |
| 31 | Participant | Respondent app | A qualified participant sees the study in Invites as "Invited to Schedule" | |

**One decision, by a person, at step 30.** There is no second screening stage and no held-for-review state. See D3.

### 15.4 Stage E: the session happens

Steps 32 to 39 apply only to study types that have sessions. A Survey or Diary study goes from step 31 straight to step 40.

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 32 | Participant | Respondent app | Picks a date, a slot and a location or link, agrees to recording, confirms | `scheduled` |
| 33 | Participant | Respondent app | May reschedule twice only, and only more than 24 hours before the session | |
| 34 | System | Email and SMS | Reminders before the session | |
| 35 | Participant | Respondent app | At the session, enters the six-digit Verification PIN | |
| 36 | Client or team | Client app or console | Confirms attendance. The actions shown follow what is already recorded (5.3) | |
| 37 | Client or team | Client app or console | **Or** marks the participant as a no-show, with a second confirmation | `no_show`, Trust Score −4 |
| 38 | Client or team | Client app or console | **Or** marks them as late. Trust Score −2 | |
| 39 | System | none | Session recording and transcript are produced where recording was agreed | |

**Cancelling.** A participant may cancel more than 24 hours before, at 2 Trust Score points. A client or the team may cancel at any time with a written reason, at no cost to the participant, who is told the reason. See 5.3 and D6.

### 15.5 Stage F: completion and rating

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 40 | Client or team | Client app or console | Marks the participant as completed, with a second confirmation | `completed` |
| 41 | Team | Console | Processes the study's payouts in Finance > Payouts. The incentive is credited to the participant's wallet. Nothing is paid automatically | |
| 42 | System | none | 25 reward points are added | |
| 43 | System | none | Trust Score +1, capped at 10 study completions a year. Tier re-derived | |
| 44 | Client | Client app | Rates the participant: Expertise, Reliability and Communication at five stars each, plus an optional written review. See D16 | `rated` |
| 45 | System | none | The rating adjusts the Trust Score: +4 for 5 stars, +3 for 4, +1 for 3, −2 for 2, −3 for 1. Only the last 10 studies count, and ratings contribute at most +40 | |
| 46 | Participant | Respondent app | Rates the client back | |
| 47 | System or a person | Client app or console | The study's last completion fills its target, or the client or the team presses Stop-complete. Sessions not yet run are cancelled at no cost to participants, and the client and the team are told | Study `billing` |

**Withdrawals wait for the team.** A participant's withdrawal (step 52) is pending until a team member releases it in Finance > Payouts. Approve, hold and retry have no screen. See D2.

### 15.6 Stage G: money settles

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 48 | System | none | Raises the balance invoice for the study | Invoice `due` |
| 49 | Client | Client app | Pays it with Pay Bill. The balance is due 7 days after the study enters Billing. If nothing was owed, the study completes at once | Invoice `paid`, Study `completed` |
| 50 | System | none | **If the study underfilled**, raises a refund automatically from the shortfall | Refund `pending` |
| 51 | Team | Console | Finance > Refunds. Confirms the refund. The client is told 5 to 7 working days | Refund `confirmed` |
| 52 | Participant | Respondent app | Withdraws earnings to a bank account, less a $1.99 flat fee. The withdrawal waits until a team member releases it in Finance > Payouts, then is credited in 2 to 3 working days | Withdrawal `pending`, then `paid` |
| 53 | Participant | Respondent app | **Or** redeems reward points. 100 points = $1, minimum 1,000 points | |

**Payouts are manual at launch.** Steps 52 and 53 are instructions to the team, not an automated transfer.

### 15.7 Stage H: things go wrong

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 54 | A person on the team, or a client | Console or client app | Reports a participant: AI/Bot Activity, Abusive Behaviour, Spam Apply or Wrong Match, or a client's reason (5.7) | Report `open` |
| 55 | Team | Console | The report appears in Participants > Verifications, Reported segment, and in the Dashboard queue | |
| 56 | Team | Console | Reads the category and reason, then rejects the report, restricts the account, or deactivates it | Participant `active`, `restricted` or `deactivated` |
| 57 | System | none | A restricted participant cannot participate, withdraw or redeem for a fixed period. The ladder is 15 days, 15 days, 30 days, then deactivation | |
| 58 | System | none | An upheld fraud finding costs 20 Trust Score points | |
| 59 | System | Email | A deactivated participant is emailed the written reason and can appeal | |

**Not designed:** The restriction ladder at step 57 is drawn on exactly one console frame and exists in no policy document. And **nothing is designed that tells a restricted participant they are restricted, why, or for how long.** See decisions D9 and D15.

### 15.8 Stage I: support

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 60 | Participant or client | Respondent or client app | Raises a ticket: subject, message, optional attachment | Ticket `new` |
| 61 | System | none | Answers automatically from a fixed set of FAQs and platform guides where it can | Ticket `closed` if resolved |
| 62 | Team | Console | Anything those do not cover appears in Support > New | |
| 63 | Team | Console | Replies, which moves it to Ongoing, then closes it | Ticket `ongoing`, then `closed` |

**Not designed:** nothing in the console is designed for the automatic first answer at step 61: no view of what it said, no way to correct it, no way to edit the FAQs behind it. See D10.

### 15.9 Stage J: the team runs the platform

| # | Who | Where | What happens |
|---|---|---|---|
| 64 | Master admin | Console | Sets client fees, Trust Score values, tier thresholds and reward point values in Pricing & Rewards. Each change is checked, confirmed, recorded with who and when, and applies only from then on (6.9) |
| 65 | Master admin | Console | Creates sub-admins and sets their module access with eight toggles |
| 66 | System | Console | Records team actions in the activity log, with the module path, date and the acting person |

**Not designed:** The activity log covers almost nothing: see D4. One master admin account holds every permission behind a password alone, with no second holder and no succession path.

---

## 16. Decisions

Every disagreement found between the designs, the earlier workflow and the signed policy is settled here. Build what this section says.

**The order of authority used to settle them:** the signed Trust and Rewards policy on scores, tiers, points, ratings and the certificate; the Figma designs on everything a user sees; the workflow on what happens and in what order. Where all three were silent, the decision is recorded here with its reason.

### D1: The platform model

**Managed, with a few self-serve pieces.** A client creates a study, searches the pool, invites people and runs the study themselves. The team approves every study before it goes live, approves every payout, and handles verification, moderation and support.

### D2: Payout approval

**A participant's withdrawal waits for the team before money moves.** No withdrawal is automatic.

| Where | Console, Finance > Payouts, Withdrawals |
|---|---|
| What it lists | One row per withdrawal: the participant, the date, the reference, the bank account and the amount |
| States | `pending` when requested, then `approved`, `held`, `paid`, or `failed` |
| Actions | **Release Payout** moves a withdrawal from `pending` to `paid`, after a confirmation, and records when and by whom. Approve, Hold with a written reason, and Retry a failed one are part of the model and have no screen; they must be drawn |
| Who | Any team member with Finance access. Every action is logged with their name |
| The participant sees | Processing while pending, then Completed. The "paid" notice is dated from the release. A held withdrawal shows as pending, with no reason exposed |

Study payouts, the incentives owed on a finished study, are processed in the same tab, per study.

### D3: Screening

**One decision, made by a person.** An applicant answers the screener, then a client or a team member presses Qualify or Disqualify. There is no second stage and no held-for-review state.

**One exception, which is automatic:** a single-select question with a marked correct answer, in the first three positions of the screener, fails an applicant who answers it wrongly. Those three are the eligibility questions. Everything else is judged by a person.

### D4: The activity log

**Every decision in every module is logged, including the master admin's.** The log is global, filterable by module, person and period, and exportable.

Each row records: the action, the module path, the date and time, the person with their role, a link to the thing acted on, the value before and after where a value changed, and the written reason where one was given.

Actions that must be logged:

| Module | Actions |
|---|---|
| Studies | Approved, changes requested, paused, resumed, marked complete |
| Participants | Verified, rejected, restricted, deactivated, reactivated, report upheld, report rejected |
| Clients | Verified, rejected, deactivated, reactivated |
| Screening | Qualified, disqualified |
| Sessions | Attendance confirmed, marked no-show, marked late |
| Finance | Payout approved, held, released, retried. Refund confirmed. Invoice adjusted |
| Pricing & Rewards | Every value changed, with before and after |
| Sub-Admin | Profile created, access changed, status changed |
| Support | Ticket replied, reassigned, closed, automatic answer corrected |

The heading "Activities of sub-admins" is wrong and becomes "Activity log".

### D5: The selfie

**Out, in all three apps** (decided 23 October 2026). Identity verification is one government ID, both sides, checked by the team. No app asks for, shows or claims a selfie or a liveness check: the respondent's Identity step has no selfie field; Account Settings has no selfie row and no "Human Verified" tag; the certificate is headed "Identity Verified" and claims identity verified, and profession verified where a credential was checked, and nothing about a selfie; the console's "Selfie photo verified" lines and "Human Verified" tags are removed from the verification detail and the participant profile; the client's study certificate reads "completions by ID-verified participants" where it read "verified human". The Figma frames that draw a selfie field, "Selfie photo verified", "Human Verified" or "Verified Human" are to be redrawn.

### D6: Cancelling a session

**A participant may cancel a session, more than 24 hours before it starts.** It costs 2 Trust Score points, as the policy says. Inside 24 hours they cannot cancel, and not attending is a no-show at 4 points.

A client or the team may also cancel a session. They must give a reason. That costs the participant nothing, and the participant is told, with the reason, which is kept against the booking.

**Every dialog that marks a no-show or a cancellation states the Trust Score cost.** Today they speak only about payment.

### D7: Editing a live study

**The team can change a live study; the client cannot.** The team edits a live or paused study in the console's Edit Study (14.4). The client's controls on a live study are pause, resume, mark complete and Recruit more.

| Can change | Title, description, duration, end date, thumbnail, the whole audience, the screener, and the survey or diary questions |
|---|---|
| Cannot change | The study type, and the availability, addresses and sessions people may already have booked. Participants applied to and booked those |
| Open | Whether the team may change the incentive or the number of participants. See D33 |

Every change is recorded in Revisions History against the team, and the store refuses any change outside these rules, saying why. A client who needs a change to a live study raises a support ticket, and the team makes it.

### D8: Client approval

**Only a failed automatic business check reaches the team.** A client whose check passes is active immediately. There is no manual approval queue for clients who passed.

### D9: Restriction

**The ladder is 15 days, then 15 days, then 30 days, then deactivation.** It is now written down here and is part of the product.

**A restricted participant is told.** A screen states that they are restricted, which of the four categories it was, when the restriction ends, and that they cannot participate, withdraw or redeem until then. **This screen is not drawn and must be.**

A deactivated participant is emailed the written reason and can appeal.

### D10: The automatic first answer on a ticket

**A ticket is answered automatically from a fixed set of FAQs and platform guides before it reaches a person.** Anything those do not cover comes to a person.

In the console, the team sees the automatic answer in the ticket thread, marked as automatic, and can correct it. The FAQs and guides behind it are editable in the console. **None of this is drawn and must be.**

### D11: The two names

| Name | What it is |
|---|---|
| **HumanLayer** | The platform being built. The product itself |
| **Focus Insite** | The company that already carries out this research manually, and that will operate the platform |

Focus Insite is the operator, not a client. Clients are the companies who commission research. Focus Insite may in future also commission research on its own platform, but it is not described as a client anywhere in these documents, because that reading causes confusion.

**What appears on screen.** All three apps carry the **HumanLayer** name, spelt as one word. The respondent app throughout. The client app throughout: the browser tab, the sidebar and landing page lock-up (the H mark and the black wordmark), "Welcome To HumanLayer!", the help answers, the certificate and the study preview header. The console in its browser tab ("HumanLayer Admin Panel"), its entrance ("HumanLayer team console") and its access line; its sidebar reads "Admin Panel" beside the HumanLayer mark.

**Kept as Focus Insite:** the client's terms agreement ("I agree to Focus Insite's Terms of use and Privacy policy"), because the contract is with the company. Its wording is to be confirmed with legal.

The study share link is `https://humanlayer.app/study/...` and the session link `https://meet.humanlayer.app/...`. Both are on a demo domain; see D35.

### D12: The certificate

| Question | Decision |
|---|---|
| When is it issued | When identity verification completes. Never before |
| One per person | Yes. One unique ID per participant, generated once, never reused |
| What it claims | Identity verified, and profession verified where a profession was checked. Nothing else |
| The client certificate | A separate object with its own ID, claiming only what the platform actually verifies: business registration and billing. The domain ownership and data handling claims are removed unless something produces them |
| "Unlocks at 40" | Not implemented. The Trust Score floor is 50, so 40 cannot be a Trust Score threshold. The policy line is stale and should be corrected |

A certificate ID never appears on an unverified participant, and no two people ever carry the same ID. Both occur in the current designs and are errors.

### D13: Pricing plans

**There are none at launch.** The "Select Pricing Plan" screen is switched off and stays off. Clients pay per study, by the fee table in Section 6.10.

### D14: Cancelling a study

**A study cannot be cancelled.** Pause and mark complete are the only ends. The `cancelled` state is removed from the model.

### D15: The two Audience drawings

**The numbered Create step is correct.** The no-match frame disagrees with it and is a design error to correct.

### D16: Client ratings

**Three dimensions at five stars each, as drawn:** Expertise, Reliability and Communication, plus an optional written review.

The original policy's "three states" line contradicted its own Trust Score table, which is denominated in five stars. Version 2 of the policy (section 6) states the three dimensions at five stars each.

### D17: Ownership and assignment

**Studies and tickets carry an assignee.** A console whose purpose is a team working through queues cannot run without one.

| What | Detail |
|---|---|
| Studies in review | An assignee, shown in the list and filterable |
| Support tickets | An assignee, shown in the list and filterable, plus a priority |
| Unassigned | A visible state, so nothing sits unowned |

**None of this is drawn and must be.**

### D18: The policy numbers in the console are wrong

The signed policy wins. **Build the policy values, not the drawn ones, and correct the designs.**

| Setting | Console draws | Build |
|---|---|---|
| Points for completing a study | 50 | 25 |
| No show | −2 on the edit form, −4 on the view | −4 |
| Cancelled session | −4 on the view, −2 on the edit form | −2 |
| Study completion cap | "upto 10 per year", applied to points | The cap is on Trust Score, not points |
| Points expiry | "Points have no expiry" | Points do not expire. Now decided, so the line is correct |
| Withdrawal fee | $1.99 | $1.99 since 23 October 2026, as drawn (was $2) |
| Certificate threshold | no field | No field. See D12 |

The same corrections apply to the participant profile's Points History: Study is 25 not 50, Streak is 50 not 100, Referral is 200 not 25.

Edit Tiers' fields read Silver Tier, Gold Tier and Platinum Tier, where the design labels two of them "Withdrawal" and "Reward Points Value".

### D19: Card data

**Never display a full card number. Never store a CVV.** The console's client profile shows the last four digits and the card brand, and nothing else.

This is not a preference. Storing a CVV is a card industry breach, and card details go to the payment provider directly without touching the platform's database.

### D20: Validation on Pricing & Rewards

Every value is checked before it saves: no tier threshold may be set below the one beneath it and all sit between 50 and 100, no fee or point value may be negative, points are whole numbers, and no deduction may add to the score. Every change asks for confirmation before it saves, and only a master admin may save. See 6.9 and 6.10.

### D21: Publishing a study

**A study cannot be published with no screener questions.** At least one is required.

### D22: The deposit

**One rule everywhere (23 October 2026).** Two deposits: 20% of Total Recruiting Cost when the study is published, and 30% when the team takes it live. The 50% left is billed on the participants who complete, less both. Every money screen reads `paymentPlan` and `billing`.

Payment Summary, Payment Breakdown, the Pay tab, Payment and Invoice Details all price from the rate in Section 6.10. The Create flow's Study step still draws its Costing Summary and Payment from the earlier fee schedule (see 6.10).

**Editing a study that is waiting on the team retakes the deposit at the new figures**, replacing the old one. Whether a change the team makes to a live study takes any payment depends on D33.

### D23: Matching

**The match runs once, when the team approves the study.** It selects the people in the pool who fit the audience that was set, and those people are the Matched list.

People who join the platform afterwards are not added to that study's Matched list. A study built in the create flow has no one matched to it until it is approved.

**How the audience is tested.** A person must match every category the study sets, and any one value within each: country, gender, education, age, ethnicity, area type, work function, industry, role, skills, experience and household income, then the profile tiers and who may take part again (N/A, or never with this client). A category left empty is ignored. Experience and household income match when the person's band overlaps a band the study ticked. "Prefer not to say", or nothing given, matches no study that sets that category.

### D24: AutoPay

**There is no AutoPay.** Nothing is paid automatically. When a study is completed or stops, the client is told that its participants will now be paid, and the team is told. The team processes the payouts by hand in Finance > Payouts. The client's Pay tab lists the payouts read only and approves nothing.

This sits alongside D2, which is the team's release of a participant's withdrawal.

### D25: Work in progress

**Create Study always starts a new study.** Anything in progress is saved to Drafts first, never discarded. Resuming happens from Drafts.

Work in progress is kept as it is typed, so a reload loses nothing. It only reaches the platform on Save Draft & Exit or Publish.

The same holds for the team's Edit Study in the console: the edit is kept as it is typed, and only reaches the platform on Publish. Cancel discards it.

### D26: Uploads

| Upload | Behaviour |
|---|---|
| Study thumbnail | A real image, JPEG or PNG, up to 2MB, kept at no more than 640 by 480 |
| Screener questions by file | A real text or CSV file, one open question per line. The same for survey questions in the console's Create Survey |
| Profile picture | The same rule as the thumbnail. One picture reader serves the thumbnail in both apps and the profile picture |
| Identity documents | Real files, stored with restricted access. See 22.5 |

No upload control may indicate that a file was taken when it was not.

### D27: Answers

**Everything a respondent answers is stored and visible to the client and the team.** Pre-screener answers, screener answers, survey answers, and each diary day's answers.

Answers are stored in the type they were asked in, so a number answer is a number. A survey submitted with a question left out is refused.

**Pre-screener answers are kept only for people who pass**, because a failed pre-screener creates no application.

### D28: Profile picture, intro video and consent

A participant can add a profile picture and an intro video, and edit their profile.

| Thing | Rule |
|---|---|
| Profile picture | A real image, JPEG or PNG, up to 2MB, kept at no more than 640 by 480. Earns 25 reward points, once |
| Intro video | A real file. Earns 75 reward points, once |
| Consent | Each carries its own consent, **off by default** |

**What consent decides.** A client or a team member sees the picture only if consent on the picture is on, and the video only if consent on the video is on. With consent off they see the participant's initial, as now.

A participant may withdraw consent at any time, and it stops being shown immediately. Withdrawing consent does not take the points back.

The consent control sits with the thing it governs and says plainly what turning it on means. **Nothing is ever shown to a client that the participant has not consented to.**

Where a consented picture or video appears: the client app's Pool cards and Pool profile panel, Respondent Profile Details, the Recruited and Results tabs, and anywhere else a participant is shown. The console does the same.

**The My Profile frame (979:74128) draws the picture and the intro video. It does not draw the consent controls**, which sit under each, and must be drawn.

### D29: Study descriptions on the respondent app

A study list shows the title only. **The description opens on tap**, as a small popover over the card, and closes on tapping away.

This is a phone, so there is no hover state. Tap to open, tap away to close. It applies everywhere a study is listed: Explore, Invites, My Studies, and anywhere else a description sits under a title.

Opening a popover is Tier 1 motion: 120 to 180ms, no bounce.

**Not drawn. The designs put the full description under every title, which is too much text on a phone.**

### D30: The client dashboard

Too much was on one screen. What is shown at once is reduced, without losing anything.

| Section | Rule |
|---|---|
| Ongoing Studies | A carousel. Three cards visible at least, one more for every 340px the screen allows, arrows to move through |
| Needs Your Attention | The top three rows |
| Upcoming Sessions | Two, with View All for the rest |
| Super Insights | Unchanged. It already steps through one at a time |
| The four figures | Unchanged |

Same cards, same colours, same type. This is about how much is shown at once, not a redesign. Carousel movement is Tier 1: 120 to 180ms, no bounce. **Nothing on this screen bounces, shakes or draws attention to itself.**

**Not drawn.**

### D31: Client team access

**Planned. Not in this build.** This build keeps one person per client account.

A client is an organisation. Several people from one client team will use one client account, and each will see only the studies assigned to them. It is specified here so the data model allows for it from the start.

| Rule | Detail |
|---|---|
| One account, several people | People are added to a client account by an owner on that account |
| Study level access | A person sees only the studies assigned to them. Three studies with three researchers means each researcher sees one |
| Owner | Sees everything on the account, including every study and every invoice |
| Billing | Stays at account level. Access does not change who pays |
| Enforcement | Server side. Hiding a study on screen is not access control |

The client app today has one person per account, no way to add anyone, and no notion of a study belonging to a person. Nothing is drawn for it.

**What to allow for now:** design the data model so that a study belongs to a person within a client account, even though every person on the account currently sees everything. Retro-fitting that later is far more expensive.

BRD Section 9a has the full requirement.

### D32: The deposit (superseded 23 October 2026)

**Superseded by the pricing of 23 October 2026 (6.10, D22): 20% at publish, 30% when the study goes live.** When the 30% is taken (the frames say only "As on" a date) was chosen by the build as the moment the team takes the study live; that is to be confirmed. What follows is the record of the question as it stood.

| | |
|---|---|
| What the build does today | Takes 25% of recruitment plus 25% of incentives, for the full sample, at submission (`depositParts` and `DEPOSIT_RULE` in `shared/platform.ts`). Every money card reads this one rule |
| What the signed policy says | Section 8: "The incentives for the full sample, taken at submission. Everything else is billed on delivery" |
| Who decides | Jim. Whichever way it goes, the policy may need re-signing |

### D40: When the 30% incentive deposit is taken (built, Jim to confirm)

**Built: when the team takes the study live** (`takeDeposit(study, 'incentive')` in `moveStudy`, `shared/store.ts`). Accepted for now on 23 October 2026. The frames show the deduction only as "Less: 30% Recruitment Cost • As on [date]" and do not say what triggers it, so Jim is to confirm the moment.

| | |
|---|---|
| What the build does | 20% upfront when the study is published; 30% when the team approves it and recruiting starts; the rest on the bill once recruiting stops |
| What the frames draw | "As on Oct 10, 2026" beside the 30% line; no trigger |
| Who confirms | Jim |

### D41: The incentive (settled 24 October 2026)

**Settled.** The incentive is proposed from the rate card's guide rate for the study's segment and hours, and the team sets it per study in the console beside the CPI. A new study no longer starts at $700. It cannot go live without an incentive. Above the CPI is allowed with a warning. A change applies to those who complete after it; anyone already paid keeps what they were paid. The client sees no incentive figures (the dashboard tile is gone; the Audience forecast's "Recommended Incentive" stays, marked Coming soon).

### D43: The segment a new study is offered before the team quotes it (open)

**Built: the first segment on the card whose size band fits the participant count and which can be quoted**, which for the July 2026 card is Level 1 Basic Consumer. The client's Payment & Publish shows that figure; the team re-quotes in the console before the study goes live, and the deposit already taken stays as it was. Whether the audience the client set should choose the segment (for example B2B roles) is to decide.

### D41 (earlier record): An incentive above the rate (the field is gone; who sets the incentive is open)

**23 October 2026, second round:** the Study step's Incentive Payments, Costing Summary and Payment are removed, so the client no longer sets the incentive. **Open: who sets the participant's incentive now.** Each study keeps the incentive its form carries, which starts at $700 (`shared/studyForm.ts`), above the $250 starting CPI; the console shows it read only. Until someone sets it, a new study pays participants more than the client is charged for them. The record of the first decision follows.

### D41 (as first recorded): An incentive above the rate

**Left alone on purpose (23 October 2026).** The incentive is inside the rate per participant, so a client should not set it separately at all. The Study step still has the Incentive Amount field from the old model, and nothing stops a client setting an incentive above the rate. No cap is built, because the field comes out with the Study step's Costing Summary and Payment in the next round. Until then, a study whose incentive exceeds the rate would pay participants more than the client is charged for them. The full list of where the old model still appears is in `docs/Document-Updates-Pending.md`, "Next job: clear the old fee model".

### D42: What changes a study's rate (waits on the rate sheet)

**Left as it is (23 October 2026).** A study keeps the rate it was published at, and a later rate applies only to the participants who complete after it (`Study.ratePeriods`). What agrees a new rate waits on the team's rate sheet; until then nothing in the app changes one. The seed shows a second period on one study so the Final bill's two lines can be seen.

### D33: The team re-pricing a live study (open)

**Not decided.**

| | |
|---|---|
| What the build does today | In the console's Edit Study, Incentive Payments, Costing Summary and Payment are shown read only from the study's own figures. Payment shows the deposit already paid and "To Pay $0", with "Editing a live study changes no amount and takes no payment." The number of participants is shown and not editable. The store refuses an edit that changes the incentive or the number of participants |
| What the designs draw | The Edit Study frames of 21 October 2026 (2325:214849, 2325:214318) draw the incentive slider and the number of participants as editable, and a Payment block with an amount to pay. The client's frame of 22 October 2026 (2325:214897) draws the Incentive Amount as editable after publishing |
| Who decides | Jim. If they become editable, what is charged or refunded, and when, needs deciding with it |

### D34: The Audience forecast (open)

**Not decided.**

| | |
|---|---|
| What the build does today | Check Participation Forecast, on the client's Audience step and the console's Edit Study, shows "Contact us to check matching participants availability" with Contact Us (a mail to `support@humanlayer.app` in the client app, Support in the console). Tier Distribution, Average Score, Recommended Incentive and Estimated Time To Fill read "Coming soon". No figure is shown |
| What the designs draw | The same, on the frames of 19 and 21 October 2026 |
| What is missing | An agreed behaviour behind the panel: what each figure means, how it is worked out, and what Contact Us leads to |
| Who decides | Not yet assigned |

### D35: The domain, the support address and the certificate prefix (open)

**Not decided.**

| | |
|---|---|
| What the build does today | All three apps' links use `humanlayer.app`, a demo domain. The client's Contact Us writes to `support@humanlayer.app`. Certificate IDs begin `FI-` (`FI-XXXX-XXXX` for a participant, `FI-C-XXXX-XXXX` for a business) |
| What is missing | The live domain, the real support address, and whether the certificate prefix should change to match the HumanLayer name. The prefix is set by the Trust and Rewards policy (section 7), so changing it needs a new version of the policy |
| Who decides | Not yet assigned |

### D36: The diary's units and frequency (open)

**Not decided.**

| | |
|---|---|
| What the build does today | Duration units Hour, Day and Week. Frequency Every day, Every 2 days, Every 3 days and Weekly |
| What the designs draw | The client's diary dropdowns also draw Minute and Step units, and a frequency list from "Everyday" to "Every 5 days" |
| Who decides | Not yet assigned. A change in behaviour, for the designer and the business |

### D37: A diary entry per calendar day

**Decided and built, 23 October 2026.** One entry a day. Entry 1 opens on the day the participant is invited to complete, each later entry on its own date after that (a day apart, or at the frequency the client set). Earlier entries stay open to catch up on; later ones are locked until their date, and a locked one says the date it opens. The demonstration accounts are exempt, so a demo can run every entry in one sitting. Demonstration accounts are every seeded participant (`Person.demo`); an account made by signing up never is. The record of the question:

| | |
|---|---|
| What the build does today | Every entry of a diary can be filled in one sitting: the next entry unlocks as soon as the one before is submitted, whatever the date. Frequency is stored and shown, not enforced (see D36) |
| The question | Whether entry N should open only on day N (or at the client's frequency), so a five day diary takes five days |
| Who decides | The product owner. Not built until decided |

### D38: Audience fit before applying

**Decided and built, 23 October 2026.** Found in that day's audit: a nurse saw, and passed the screener of, a survey looking for teachers.

| | |
|---|---|
| The rule | One rule everywhere (`audienceChecks` in `shared/studyForm.ts`): every category the study's audience sets must match; any one value within a category is enough; a category the study has not set is ignored; a participant who has not given what a category asks about does not meet it. A study with no audience is open to everyone |
| Explore and Recommended | List only open studies whose audience the participant matches, or that the client invited them to |
| Applying | Refused, with the categories not met: "This study is for a different audience. [Client] set who this study is for, and your profile does not match its role, industry." with Update Profile. Opening the screener by its address shows the same. The platform refuses it too (`startApplication`) |
| A client's personal invitation | Confirmed 23 October 2026: it overrides the audience, as it already overrides the repeat rule. Recorded in the policy v2, section 8, "Who a study is for" |
| Seeded studies | Carry real criteria (`Study.audience`): the clinical studies their industry and roles, the education study teachers, the airport and flagship store studies a country (and an age range), the social media study its roles, the rest none. Manage and Review read the audience pills from these criteria; a study with none reads "Open to everyone" |
| Match score | The share of those categories met. A study open to everyone shows no score |
| What a demo shows | Jonathan (physician, healthcare, New York) sees 8 of the 13 studies open to him; a new nurse in the US sees 18 of 21; a new teacher in London 10 of 21; a new account with no work details 9 of 21 |

The record of the question:

| | |
|---|---|

| | |
|---|---|
| What the build does today | Explore lists every live study to every participant, and applying checks verification, premium and the repeat rule only (`applyBlocker`, `startApplication`). It does not check the study's audience. A study built in the client app has an audience (`study.form`), and Matched uses it, but nothing stops someone outside it from finding the study in Explore and applying. The seeded catalogue studies have no audience at all, only a free-text target profession, so there is nothing to check against |
| Why the screener did not catch it | The pre-screener is the client's own eligibility questions ("Do you teach a mixed-ability class?"). Answering yes passes. It is not a profile check, and profile questions (age, location, job) are deliberately not asked again (workflow 30) |
| The question | Whether Explore should show only studies whose audience the participant fits, and whether applying should refuse someone outside it; and what to do for studies with no audience |
| Who decides | The product owner. An audience-matching gap, not a screener one. Not fixed in this round |

### D39: Deductions at the Trust Score floor

**Confirmed, 23 October 2026.** Someone sitting at 50 does not get free no-shows.

| | |
|---|---|
| What the build does | The score is the starting 50 plus everything since, kept within 50 and 100. A deduction at 50 is recorded and comes off later gains: a participant at 50 who cancels stays at 50, and their next completed study leaves them at 50. The cancel toast now says this |
| The alternative | Deductions that fall below the floor are dropped, so the next study would take them to 51 |
| Who decides | The product owner. It is a scoring rule, so the build has not been changed |

---

## 17. Derive, never hardcode

**If two screens disagree about a number, one of them is holding a literal.** This happened repeatedly across all three builds, and every case was a bug.

Measured examples, all real:

| Figure | What different screens say |
|---|---|
| One study's total cost | $12,960 on the Studies list, $16,510 on the Review screen, $3,850 on the Pay tab, $3,350 in the itemised billing, $15,085 on the client profile |
| The same study's participant target | 10 in a header, 25 in billing, 30 on a deposit line, 75 on a list |
| A deposit of $3,000 | captioned "$20 x 30 participants", which is $600 |
| One participant's Trust Score | 95 on their profile, 90 on the list, 50 on one verification tab and 95 on another |
| The console dashboard's tab counts | add to 277 against a total drawn as 274 |
| Gross Revenue | does not equal Clients Spent minus Participants Earned |
| Client refund for one study | $1,600 on the list, $1,400 in the detail |
| Due Payments | $6,874 against five pending invoices adding to $10,390 |

**The rule for build:** there is one underlying list of people, participations, studies and transactions. Every count, total, percentage, progress bar, tile, chip and pager is computed from it at render time. A person carries the two inputs to their Trust Score, never the score. A study carries its target and its participations, never its progress percentage.

**Figures that must be derived, not stored:**

| Figure | Derived from |
|---|---|
| Trust Score | The rules in Section 6 applied to the participation history |
| Tier | The Trust Score |
| Profile completion % | Which profile fields are filled |
| Study progress % | Completed participations ÷ target |
| Completed / Qualified / Applied counts | Participations in each state |
| Days remaining | The study end date and today |
| Every tab count and badge | The length of the list behind that tab |
| Wallet balance | Earnings, redemptions and payouts |
| Points balance | Points events, less redemptions |
| Every invoice total | The fee rules in Section 6 applied to the study |
| Dashboard and Finance tiles | Sums over the same lists |

---

## 18. Notifications

Every one of these exists in the designs. Each needs an in-app notification; the ones marked also need an email.

**To a participant**

| Event | Email |
|---|---|
| Identity verified, account fully active | Yes |
| Identity or profession verification rejected, with the reason | Yes |
| Invited to apply to a study | Yes |
| Qualified for a study, schedule now | Yes |
| Disqualified from a study | Yes |
| Session reminder | Yes |
| Study completed and incentive credited | Yes |
| Marked as no-show | Yes |
| Session cancelled by the client or the team, with the reason | Yes |
| Rated by a client | No |
| Tier changed | No |
| Points earned | No |
| Withdrawal processing, and paid. The paid notice is dated from the team's release | Yes |
| Account restricted, with the reason and the period | Yes |
| Account deactivated, with the reason | Yes |
| Account reactivated, with the reason | Yes |
| Support ticket replied to | Yes |

**To a client**

| Event | Email |
|---|---|
| Account approved, welcome | Yes |
| Study approved and live | Yes |
| Changes requested on a study, with the note | Yes |
| A participant applied | No |
| Study target reached | Yes |
| Study stopped and in Billing; participants will now be paid | Yes |
| Invoice due | Yes |
| Payment taken | Yes |
| Refund confirmed | Yes |
| Support ticket replied to | Yes |

**To the team**

| Event |
|---|
| A verification needs a person |
| A report was raised, about a participant or about a study |
| A study is waiting for review |
| A refund is waiting for confirmation |
| A study entered Billing, and its payouts are ready to process |
| A ticket was not resolved automatically |

These drive the console Dashboard counts and the sidebar badges.

---

## 19. Front-end data shapes

A starting point, from the built respondent app. Extend for the other two.

```ts
type StudyType = 'survey' | 'video_call' | 'group_video_call'
               | 'in_person' | 'in_person_group' | 'diary'

type StudyState = 'draft' | 'in_review' | 'recruiting' | 'ongoing'
                | 'paused' | 'billing' | 'completed' | 'cancelled'

type RespondentState = 'matched' | 'invited' | 'applied' | 'qualified'
                     | 'disqualified' | 'recruited' | 'scheduled'
                     | 'completed' | 'no_show' | 'rated'

interface Study {
  id: string
  title: string
  description: string
  image: string
  type: StudyType
  industry: string
  state: StudyState
  client: { id: string; name: string; rating: number; reviewCount: number }
  targetParticipants: number
  reward: number                 // incentive per participant
  durationMins: number
  endsAt: string
  audience: AudienceCriteria
  screener: Question[]
  tasks?: Question[]             // survey and diary questions
  diary?: { totalDays: number; minDays: number }
  locations?: { id: string; label: string; address: string }[]
  availability?: { date: string; slots: string[] }[]
  sessions?: Session[]           // group types
  revisions: { note: string; at: string; by: string }[]
  edits: StudyEdit[]             // every round of changes after first submission
  firstSubmittedAt?: string
  beyondTarget?: boolean         // Recruit more was chosen after the target was met
}

interface StudyEdit { at: string; by: 'client' | 'team'; byId?: string; changes: FieldChange[] }
interface FieldChange { path: string[]; from?: string; to?: string; added?: string[]; removed?: string[] }

interface AudienceCriteria {
  participants: number
  countries: string[]; gender: string[]; education: string[]; ageRanges: string[]
  ethnicity: string[]; areaTypes: string[]
  functions: string[]; industries: string[]; roles: string[]; skills: string[]
  experience: string[]; income: string[]
  condition: 'na' | 'never'      // stored as RepeatRule 'allow' | 'exclude'
  tiers: string[]                // Platinum, Gold, Silver; empty means any
}
// A person must match every category set, with any one value within it.
// An empty category is ignored.

type PayoutStatus = 'pending' | 'approved' | 'held' | 'paid' | 'failed'

interface Payout {
  id: string; at: string; amount: number; destination: string; txId: string
  status: PayoutStatus
  expectedBy?: string
  releasedAt?: string; releasedBy?: string
}

interface StudyReport {
  id: string; studyId: string; personId: string
  reason: string; detail: string; at: string
  ticketId?: string              // the chat the team opened with the client
  resolution?: { id: string; at: string; by?: string; statement: string; ticketId?: string }
}

interface Participation {
  studyId: string
  personId: string
  state: RespondentState
  matchScore: number
  screenerAnswers?: Answer[]
  booking?: { date: string; slot: string; locationId?: string; rescheduleCount: number }
  cancellations?: { at: string; date: string; slot: string; by: 'client' | 'team'; reason: string }[]
  notes?: string                 // interview notes on a one-to-one booking; a group session carries its own
  pinConfirmed?: boolean
  completedAt?: string
  clientRating?: { expertise: number; reliability: number; communication: number; comment?: string }
  participantRating?: { reliability: number; communication: number; comment?: string }
  timeline: { label: string; at: string; by?: string }[]   // `by` is D4
}

interface Person {
  id: string
  name: string; email: string; phone: string
  role: string; industry: string; location: string
  // the two INPUTS to the score, never the score itself
  completedStudies: { at: string }[]
  ratingsReceived: { stars: number; at: string }[]
  penalties: { kind: 'no_show' | 'late' | 'cancelled' | 'fraud'; at: string }[]
  verified: { govId: boolean; profession: boolean }
  accountState: 'registered' | 'verifying' | 'active' | 'restricted' | 'deactivated'
  restriction?: { until: string; reason: string; count: number }
  consent: { shareProfession: boolean; shareProfile: boolean; performanceCookie: boolean }
  emailPrefs: { dailyDigest: boolean; personalizedInvitations: boolean; newsletter: boolean }
}

type Question =
  | { id: string; kind: 'single';  prompt: string; options: string[] }
  | { id: string; kind: 'multi';   prompt: string; helper?: string; options: string[] }
  | { id: string; kind: 'text';    prompt: string; placeholder?: string }
  | { id: string; kind: 'image';   prompt: string }
  | { id: string; kind: 'scale';   prompt: string; options: string[] }
  // Every kind also carries optional?: boolean (Required off) and, on a
  // diary, day?: number: the entry it is asked on. No day means every entry.
  // The builders author nine kinds (14.4). Each is asked as one of these
  // five: see 22.11.
```

**Screener answers carry a verdict** set by the client when the study is created: `'correct' | 'incorrect' | 'may_select' | 'must_select'`. The participant never sees it.

---

## 20. Acceptance tests

The build is not done until each of these runs end to end without a dead control.

### 20.1 Respondent app

1. Sign up, verify the code, fill all three profile steps, accept consent, land on Welcome
2. Explore Studies, filter to Video Call, open a study, read the client rating
3. Apply, answer the screener, exit part way, find it in Drafts, resume, submit
4. See it move to Applied, then to Invites as Invited to Schedule
5. Schedule it: a date, a slot, agree to recording, review, confirm
6. Open it, submit the PIN, see it confirmed
7. Complete it, watch it move to History and become Paid
8. See the wallet balance, the points and the Trust Score all rise
9. Rate the client, see the review recorded
10. Redeem 1,000 points, see the wallet rise and the points fall
11. Withdraw, see the balance drop and a Processing payout appear
12. Change a setting in Profile, see it stick
13. Raise a support ticket, open the chat, send a message
14. Sign out, sign back in
15. Report a study, and see it reach the console's Reported Studies

### 20.2 Client app

1. Sign up, confirm email, fill Organization Details, add a card, reach Welcome
2. Create a study of each of the six types through all four steps and Publish
3. Save a draft part way, find it in Drafts, resume it
4. Publish, see it enter review
5. Open a live study, invite a matched respondent, see them move to Invited
6. Open an applied respondent, qualify them
7. Mark attendance on a session, and mark one person a no-show
8. Open Results, rate a respondent, see Rate Now become Rated
9. Pay an invoice from Payments and from a study's Pay tab
11. Raise a support ticket and read the reply
12. Change the password; attempt to deactivate with a live study and get refused
13. Stop-complete a study, see it in Billing, then Re-publish and Recruit it before paying, and see it recruit again
14. Report a participant from their page in a study

### 20.3 Internal console

1. Sign in; every Dashboard queue row opens the right item in the right module
2. Review a submitted study across all six tabs; request changes with a note; see it reach the client
3. Review another; approve it; see it go live
4. Verify an identity: statement, password, confirmation, outcome
5. Reject a profession credential with a statement
6. Act on a report: reject it, then restrict another account, then deactivate a third
7. Deactivate a participant and reactivate them
8. Answer a support ticket, resolve it, re-open it
9. Confirm a refund end to end
10. Change a value in Pricing and Rewards and see the confirmation
11. Create a sub-admin, set module access, and view the activity log
12. Every route renders; every control does something; no table shows a figure that disagrees with another screen
13. Edit a live study: change the audience and the screener, publish, and see the change in Revisions History in the console and the client app
14. Resolve a reported study: open the chat, then mark its reports resolved with a statement and password
15. Release a withdrawal
16. As master admin, change a Trust Score value, confirm it, and see it apply only to what happens after
17. Try to deactivate a client with a live study, and get refused naming the study

### 20.4 Cross-app

1. A study created in the client app appears in the console's To Review queue
2. Approving it in the console makes it visible to a matching participant in the respondent app
3. A participant's application appears in both the client app and the console
4. Qualifying in either place moves the participant in all three apps
5. Completing a study credits the wallet, the points and the Trust Score, and the new score and tier appear on the participant's profile in the console
6. A no-show marked in the client app shows as No Show in the participant's history and in the console
7. A study reported in the respondent app appears in the console's Reported Studies
8. A withdrawal released in the console shows as Completed in the participant's wallet
9. A change the team makes to a live study reaches participants and the client's Revisions History

---

## 21. Built and working, but not in Figma

**These need no design work.** They are in the front end now, and the apps are the reference for them. They are listed only so that nobody searches Figma for them and assumes something is missing.

| What | Where |
|---|---|
| A sub-admin's restricted sidebar, and the refusal page for a module they lack | Console |
| Landing pages | Client app at `/client`, console at `/internal` |
| Profile picture and intro video, with a consent control on each | Respondent app, and wherever a client or the team sees a participant |
| Study descriptions opening on hover or press and hold | Respondent app |
| The client dashboard with an Ongoing Studies carousel and shortened lists | Client app |
| Empty states throughout the console, and the client app's empty dashboard | Console and client app |
| Fields the create flow needs that Figma draws as fixed text: hours, override dates, group session date and time, seats | Client app |
| The money cards as they now read: Costing Summary with Moderation Cost and Platform Fee rows, and one Incentive deposit row | Client app |
| Four screener question types asked in the nearest available form: tap scale, tick in order, picture upload, one question per row | Respondent app |
| Scheduled Sessions, Pay All Due Invoices, and the paid confirmation | Client app. Drawn by the designer and built, now live |
| The question menu, its Required toggle, and the respondent's "(optional)" marker | All three apps. **Need drawing** |
| The notes card as a working editor with plain-text formatting marks and a download | Client app and console |
| What the Video Result buttons say while there is no recording | Client app |
| The Billing banners for a study stopped by the team or filled on its own, and the console's Billing banners | Client app and console |
| "Publish these changes live?" on Pricing & Rewards, and the client deactivation refusal in the console | Console |

---

## 22. Technical foundations

### 22.1 The front end

| Layer | Decision |
|---|---|
| Framework | Vite, React 19, TypeScript, Tailwind v4, React Router 7, Geist |
| UI libraries | None. No component library, no icon library, no animation library, in any of the three apps |
| Deployment | All three apps on one origin: the respondent app at `/`, the client app at `/client`, the console at `/internal` |

The single-origin arrangement is deliberate. The three apps share one data layer, so a study approved in the console appears in the client app without a reload. Splitting them across domains breaks that.

### 22.2 The shared data layer

The prototype puts every piece of platform data in one place, used by all three apps. The production build should keep this shape, because it is what makes the three apps agree with each other.

| Module | Holds |
|---|---|
| `types` | Every domain object: person, client, study, session, application, invoice, payout, ticket, team member |
| `rules` | The signed Trust and Rewards policy. Scores, tiers, points, redemption. Nothing else may live here |
| `platform` | Non-policy rules: fees, limits, thresholds |
| `lifecycle` | State machines for study, application, session, payout, ticket |
| `seed` | Demonstration data only. Not a source of truth |
| `derive` | Every computed figure. Counts, totals, scores, tiers, progress |
| `store` | Reads and writes |
| `format` | Dates, money, durations |

**The rule that matters:** no screen holds a figure of its own. Everything shown is derived from the underlying records. See Section 17.

### 22.3 The technology stack

**Status.** The table below is an estimation, not a fixed decision. The "What we use" column records the current preference and its reasoning. **The final stack is the developer's to choose from these options, and should be confirmed back to Soulful Labs before build begins.**

Four rows carry existing work against them and should only be changed with a stated technical reason: the database, logins, card payments and video.

#### Platform core

| What it is for | Options | What we use | Why | Effort and time against the others |
|---|---|---|---|---|
| Database | Supabase Postgres, AWS RDS Postgres, Neon, Firebase | Supabase Postgres | Real Postgres, and it brings auth, storage and realtime with it. Nothing proprietary to unwind later | Half a day to running. RDS is 3 to 5 days of networking, backups and roles before any product code is written |
| Logins and accounts | Supabase Auth, Clerk, Auth0, AWS Cognito, build our own | Supabase Auth | Already there, covers all three user types, no extra bill | 1 to 2 days. Clerk is about the same but carries a per-user cost that grows with the user base. Cognito is about a week of configuration. Building our own is 2 weeks and a security risk we do not need |
| Document storage | Supabase Storage, Amazon S3, Azure Blob | Supabase Storage | Small files, same permissions model as the database | Hours. S3 adds IAM policies and signed URL work for no gain at this size |
| Recording storage | Amazon S3, Cloudflare R2, Supabase Storage | Amazon S3 | Recordings are the only thing here that grows without limit. Lifecycle rules move old ones to cold storage automatically | 1 day. R2 is cheaper on egress if clients download frequently, and can be revisited later. Supabase Storage would work but gets expensive fast |
| Live dashboard updates | Supabase Realtime, Pusher, SignalR, polling | Supabase Realtime | The live board has to change without refreshing, and this is included | 1 day. Pusher is another vendor and another bill. SignalR only makes sense on .NET, which we are not using. Polling is free but the dashboard does not update on its own |
| Job scheduling | pg-boss, BullMQ with Redis, Inngest, cron | pg-boss | Fee charged the day before a session, reminders, no-shows, score updates. Runs inside the database we already have | 1 day. BullMQ means running Redis, so add 2 days of ops. Inngest is a paid dependency on a core flow |
| API service | Node with TypeScript, Python FastAPI, .NET 9 | Node with TypeScript | Shares types with the front end already built, so the contract cannot drift | Baseline. FastAPI is equally good but duplicates every type by hand. .NET only made sense while reusing the old code, which we are not |
| Hosting | Fly.io, Render, Railway, AWS ECS | Fly.io | Deploy on day one, move to AWS whenever that becomes the destination | Hours. ECS is a week of setup that gets redone anyway |
| Error monitoring | Sentry, Datadog, nothing | Sentry | A failed charge will not be found without it | Half a day. Datadog is far more than launch needs |
| Console two-factor | Supabase MFA, Authy, Google Authenticator via TOTP | Supabase MFA | The internal team can see every participant's data. It needs a second factor | 1 day, and it is built in |

#### Verification

| What it is for | Options | What we use | Why | Effort and time against the others |
|---|---|---|---|---|
| Participant ID (no selfie: D5) | Persona, Stripe Identity, Socure, Onfido, Veriff, Incode | Persona | Strong US coverage, returns inconclusive as well as pass and fail, which the manual review step needs, and it holds the biometric data so that exposure sits with the provider | 3 to 5 days. Stripe Identity is quicker, maybe 2 days, but thinner on manual review and it ties identity to the payment provider. Socure and Onfido are enterprise sales cycles, so weeks before anything can be tested. The document check only; selfie and liveness are out of the product |
| Client business and EIN | Middesk, Persona Business, LexisNexis, Dun and Bradstreet, Alloy, manual by the team | Manual by the team at launch, Middesk later | At this client volume a person checks an EIN and a state registration faster than the integration can be built, and failures already route to a human | Zero now, 2 to 3 days for Middesk when volume justifies it. The enterprise options take weeks and are priced for enterprise buyers |
| Professional credentials | Public registers such as NPI, a credential aggregator, manual | Public register where one exists, manual where it does not | There is no single source. Each profession has its own register | 2 days for NPI. Every further profession is its own small job, so expect this to grow one register at a time |

#### Money

| What it is for | Options | What we use | Why | Effort and time against the others |
|---|---|---|---|---|
| Client card payments | Stripe, Braintree, Adyen, Chargebee | Stripe | Does exactly what the model needs: save the card once, charge it again later without the client present | 3 to 5 days including webhooks and idempotency. Adyen is heavier and aimed at larger merchants. Chargebee solves subscriptions, which this is not |
| Management fee | slimCD, Stripe | slimCD, open to challenge | The cost of a second gateway is two sets of webhooks and two reconciliations for three charges that all hit the same card | 5 to 8 days, because it is an older style API with no modern SDK. Putting it on Stripe instead is close to zero extra, since the card is already saved there. **This choice carries the largest cost difference on the list** |
| Participant payouts | Tremendous, Stripe Connect Express, PayPal Payouts, Dwolla, Trolley | Tremendous | Already in use, and the existing rebate is a material saving | 1 day now, because launch only needs the payout list and the audit trail. 3 to 4 days for the API later. Stripe Connect would unify everything but loses the rebate and means onboarding every participant as a connected account |

#### Sessions

| What it is for | Options | What we use | Why | Effort and time against the others |
|---|---|---|---|---|
| Video sessions | Zoom links issued over the API, Zoom Video SDK, Daily.co, Whereby, Google Meet | Zoom links over the API, SDK only if truly needed | Zoom is already owned and the seats are already paid for. **Whether the API can issue links automatically has not been confirmed, so that check comes before any build** | 2 days for links, if the API allows it. The Video SDK is 2 to 3 weeks because the call is then hosted by us. Daily.co is the better choice if the session ever needs to sit inside our own product, but it is a second video bill |
| Recording and transcript | Zoom Cloud Recording and Transcription, Deepgram, AssemblyAI, Whisper | Zoom's own | If the call runs on Zoom, the recording and transcript already exist. Fetch and store them | 2 days. A separate transcription vendor is 3 to 4 days and only justified if Zoom's transcript quality proves insufficient |

#### Messaging and AI

| What it is for | Options | What we use | Why | Effort and time against the others |
|---|---|---|---|---|
| Transactional email | Resend, AWS SES, Postmark, SendGrid | Resend | Fastest route to working, well formatted email. The 25 templates are the real work here, not the sending | 1 day. SES is 3 to 4 days with domain warming and bounce handling, and it becomes the right move only at large volume |
| SMS | Twilio, AWS SNS, MessageBird, Vonage | Twilio | The default, and an account already exists | 1 to 2 days. The alternatives save nothing |
| AI features | Claude API direct, OpenAI, AWS Bedrock, Azure AI Foundry | Claude API direct | One provider for screener drafting, bid pricing, matching and support answers, with no cloud account in the middle | 2 days per feature once the rules exist. Bedrock and Azure AI Foundry made sense while inheriting that plumbing, and now add a day or two of IAM configuration without benefit |
| Participant matching and search | pgvector, Pinecone, Weaviate, Elasticsearch, SQL filters only | pgvector | Inside the database already, and 300,000 profiles is small for it | 3 to 4 days including the embedding pipeline. Pinecone is a second datastore to keep in sync. SQL filters alone are 1 day but cannot match on meaning, which is what the matching step asks for |

**Two consequences apply whichever options are chosen.** Identity documents require retention, access and deletion rules, which are build tasks rather than policy notes. Card details go to the payment provider directly and never reach the platform database, which is why the console's current design showing full card numbers and CVV codes cannot be built.

### 22.4 What the three apps need from authentication

| Need | Detail |
|---|---|
| Three audiences, one platform | A participant, a client and a team member sign in to different apps. An account is one of those three. Nothing suggests a person is more than one |
| Session | Signed in or out. A signed-out person reaching any address is sent to sign in and returned to that address afterwards. A signed-in person never sees a landing page |
| Email confirmation | The client journey has a Check Email step with a link. The respondent and console journeys use a six-digit code |
| Password reset | Request, check email, set new, confirmed. All three apps have it |
| Password rule, as drawn | At least one special character, one uppercase character and one number |
| Team access | A sub-admin's access is eight module flags. The console restricts both its navigation and its addresses by them: a module the person lacks is absent from the sidebar, and typing its address gives a refusal |
| Landing on sign-in | A team member lands on the Dashboard, or on the first module they have if they lack Dashboard |

**There is no open sign-up for the console.** A master admin makes every team account on Sub-Admin. The invitation email and the set-password screen for a new team member are not drawn.

**Not designed anywhere, and needed before launch:** two-factor authentication, session limits, sign-in history, and lockout after failed attempts.

### 22.5 What the front end needs from the data layer

| Capability | Why the front end needs it |
|---|---|
| Real-time updates | A study approved in the console must appear in the client app without a reload. An application submitted in the respondent app must appear in both other apps. The console's queues and badges are live counts |
| Row-level access | A client may only see their own studies, invoices and respondents. A participant may only see their own wallet, points and history. A sub-admin may only see the modules they are given |
| File storage with restricted access | Identity documents are uploaded by participants and viewed by the team. They must never be publicly addressable, and they need a retention and deletion rule |
| Derived figures computed server-side where they are expensive | Trust Score, tier, counts and totals. The front-end rule is derive, never hardcode. Where a derivation is heavy it belongs in the data layer |

### 22.6 How the create flow behaves

The create flow was rebuilt so that everything a client enters is saved and used. The production build must do the same.

| What | Must be true |
|---|---|
| Screener questions | Saved with the study, shown back in the client app and the console, and asked of respondents |
| Survey and diary questions | The same, for all nine answer types |
| Audience, availability, sessions, addresses, diary settings | Saved with the study. Weekly hours and overrides become the slots a respondent books |
| Publish summary | Every figure derived from what was built, including the estimated audience, which counts the people in the pool who fit |
| Save Draft | A draft reopens with everything still in it |
| Answers | Stored in the type they were asked in |
| Thumbnail | A real image, kept and shown everywhere the study appears |

Three rules the build settled, all recorded as decisions: a study cannot be published with no screener questions (D21); only a single-select question with a marked correct answer, in the first three positions, passes or fails an applicant automatically (D3); and a study with no end date runs 60 days (the About step states it).

**Fields added that Figma draws as fixed text.** Hours, override dates, group session date and time, and seats were drawn as text with no way to enter them, so there was nothing true to save. They are now inputs. **These need drawing.**

**Hours must be set.** Days open at "12:00 AM to 12:00 AM" as drawn, which offers nothing, so Submit refuses until real hours are entered.

### 22.7 Figures stated to users

Every one of these appeared in two or more places saying different things. These are the settled values, and they must read the same everywhere.

| What is promised | Value | Where it lives |
|---|---|---|
| Screener decision | 3 to 5 days | `WAITS.REVIEW` in `shared/platform.ts` |
| Withdrawal credited | 2 to 3 working days | The policy. "Expected in bank" is three working days after the request |
| Client refund | 5 to 7 working days | The policy |
| "In Top N%" under Gold and Platinum | Derived: the share of verified participants at that tier or above (Section 6.2). Silver has none | `topShareOf` in `shared/derive.ts`, everywhere a tier is shown |
| Points redeemed | In the wallet at once | Redeem and its success screen |
| Money not yet paid | "Awaiting payout. The team processes it when the study finishes." | Every screen that shows it (Section 9.4) |
| Ticket status | Open or Closed. Never "Solved" | All three apps |
| Points for completing a study | 25 | Section 6.3 |

**The screener promise of 3 to 5 days is not stated in any source document.** It was set to the longer of the two figures appearing in the designs, so as not to over-promise. It is a public commitment to participants and has not been agreed by the business. It requires confirmation before launch.

### 22.8 Things a user is told about their score

**No screen may say that reward points, streaks, referrals or profile completion raise the Trust Score.** They do not. The Trust Score moves only on the events in Section 6.1. Points and the Trust Score are two separate things and the apps must not blur them.

Trust Score values are plain numbers, never percentages. "+50", not "fixed at 50%".

### 22.9 Controls that claim something happened

A control that says a file was downloaded must produce a file. A control that says something was saved must save it. A control that says a link was copied must copy it.

Where there is nothing real to give, the control is removed rather than left showing a message. This applies everywhere and was the cause of nine separate faults found by measurement.

### 22.10 The money cards

Making the figures true changed the wording of three cards, beyond what Figma draws. **These need drawing.**

| Card | Change |
|---|---|
| Costing Summary | Gained Moderation Cost and Platform Fee rows, because the total does not add up without them |
| Payment, Payment Summary | The two "25% of cost" rows became one "Incentive deposit" row, matching the one deposit rule in D22 |

---

## 22.11 Behaviour in the build not described elsewhere

Established by walking every route and exercising every control in all three apps. The following exist in the build and form part of the product.

### Behaviour

| What | Detail |
|---|---|
| Late Show Up and Not Needed | Two further participation states, shown in a participant's history |
| Applied banner | Shown to a participant who has applied and is waiting |
| PIN confirmation | "Session code confirmed. Both sides entered the code" |
| In Process | Waits for the team to process the study's payouts. See D24 |
| Pre-screener | "Check eligibility" before the full screener, plus a block on a participant who has already taken part in that study |
| Diary units | Hour, Day or Week, counted in the unit the client chose, on every screen in all three apps. Frequency is stored and shown but not enforced |
| Work functions and skills | On every participant profile, editable by the participant, optional, and not counted towards profile completion. The audience and the Matched list filter on them |

### Screener question types

The respondent app asks five kinds. The builder offers nine: single select, multi select, open text, number, slider, ranking, file upload, matrix, and long text. The four the respondent app cannot ask as drawn are asked in the nearest available form: a tap scale, tick in order, picture upload, and one question per row.

### Routes not described elsewhere

| Route | What it is |
|---|---|
| `/` | The respondent app's landing page |
| `/trust-score/history` | A participant's score history |
| `/motion` | A development page showing the motion tiers. Not part of the product |
| `/kitchen-sink` | A development page showing every component. Not part of the product, and must not be reachable in production |

A tax form banner also appears, from the workflow's step 49.

### In this document but not built

| What | Why |
|---|---|
| Selfie and liveness | Out of the product in all three apps. See D5 |
| Monthly Goal on the Wallet | Later phase |
| Get Started overview tiles | Not built |
| "Welcome back" notification | There is no reactivation path for a participant |
| Address autocomplete | The address list is sample data. A real autocomplete is a build task |

### Nothing typed in for a new account

A client who signs up fresh sees only their own data and empty states. Sample content lives only in the seeded demo data (studies, notes, notifications, tickets, reviews). Where something cannot be found, the screen says so: a ticket that is not on the account, a participant who is not on the study, and a study that is not paused opened on the paused screen (which goes to its overview).

### Lists that are sample data

The education level list and the industry list are mostly invented. Seven rows of each come from the designs; the rest were added so the lists were usable. The industry list is one list, used by the client's Audience step and the console's Edit Study. **Both need a real list before launch.**

---

## 23. Building the back end

The front end for all three apps exists, is deployed, and works. This section is how to put a real back end behind it.

### 23.1 The job, in one paragraph

All three apps read and write through one shared data layer. That layer currently keeps everything in the browser's own storage. **The task is to replace that layer with a real API and database. The screens do not need to change.** A study created in the client app already appears in the console and to respondents, because they all read the same store. Make that store real and the same thing happens across devices and people instead of across tabs on one machine.

### 23.2 The contract is already written

`shared/types.ts` in the repository defines the shape of every object the front end expects. **The API must return those shapes.** Where the database models something differently, map it at the edge rather than changing the types, because every screen in all three apps is built against them.

| File | What it holds | What to do with it |
|---|---|---|
| `shared/types.ts` | Every domain object | The API contract. Return these shapes |
| `shared/rules.ts` | The signed Trust and Rewards policy | Move these to the database so they can be edited in the console. The values must match Section 6 exactly |
| `shared/platform.ts` | Fees, limits, thresholds | Same |
| `shared/lifecycle.ts` | State machines | Enforce these server side. The front end must not be the only thing stopping an illegal transition |
| `shared/derive.ts` | Every computed figure | Compute the expensive ones server side. See Section 17 |
| `shared/revisions.ts` | How a round of changes to a study is recorded, field by field | Keep the rule. Record changes server side when a study is saved |
| `shared/fromPrompt.ts` | Generate and Fill with AI, and reading a question file | Front end only, until the AI features in 22.3 replace it |
| `shared/picture.ts` | Checking and scaling a picture before it is saved | Front end. The server still checks type and size |
| `shared/store.ts` | Reads and writes | **The file to replace.** Everything else stays |
| `shared/seed.ts` | Demonstration data | Delete. It exists only so the prototype has something to show |

### 23.3 What each resource needs

The table below lists what each object must support, and which app requires it.

| Resource | Needs | Asked by |
|---|---|---|
| Participant | Create, read own, update own, upload ID, upload picture and video, set and withdraw consent, read restricted status | Respondent |
| Participant (as seen by others) | Read, filtered to what consent allows, search by criteria and by meaning | Client, console |
| Client account | Create, read own, update own, add and remove cards, read invoices | Client |
| Client (as seen by the team) | Read, verify, reject, deactivate, reactivate | Console |
| Study | Create, update while draft or in review, read, publish, pause, resume, complete, recruit past target, re-publish a completed study whose balance is unpaid. **Never update once live** | Client |
| Study (as seen by the team) | Read, approve, request changes with a note, pause, complete, update while live within the rules in D7, with each change recorded | Console |
| Study (as seen by a participant) | Read published studies matching them, read one | Respondent |
| Application | Create with screener answers, read own | Respondent |
| Application (decisions) | Read, qualify, disqualify | Client, console |
| Session | Read own, book, reschedule, cancel | Respondent |
| Session (as run) | Read, confirm attendance, mark no-show, mark late, start | Client, console |
| Answers | Submit survey answers, submit each diary day | Respondent |
| Answers (as read) | Read all answers for a study and for a participant | Client, console |
| Rating | Rate a participant, rate a client | Client, respondent |
| Trust Score and tier | Read own, recompute on every event in Section 6.1 | All three |
| Reward points | Read own, earn on the events in Section 6.3, redeem | Respondent |
| Wallet | Read own balance and history, withdraw, manage payout methods | Respondent |
| Payout | Read, release. Approve, hold with a reason, and retry are in the model (D2) | Console |
| Invoice | Read own, pay one, pay several | Client |
| Invoice (as seen by the team) | Read, adjust | Console |
| Refund | Raise automatically on an underfilled study, confirm | Console |
| Report | Raise, read, reject, restrict, deactivate | Console |
| Report (raised by a client) | Raise on a participant in one of their studies | Client |
| Study report | Raise | Respondent |
| Study report (as handled) | Read, open a chat with the client, resolve with a statement | Console |
| Ticket | Create, read own, reply | Respondent, client |
| Ticket (as handled) | Read, assign, reply, close, correct the automatic answer | Console |
| Team member | Create by invitation, read, update access, set active or inactive | Console |
| Policy values | Read, update with before and after recorded | Console |
| Activity log | Append on every action in D4, read, filter, export | Console |

**Live updates are required, not optional.** The console's queues and badges are live counts, and a study approved in the console must appear in the client app without a reload. See 22.5.

### 23.4 Access rules

Enforce these server side. The front end hides things, which is not the same as protecting them.

| Who | May read | May write |
|---|---|---|
| Participant | Only their own record, wallet, points, applications, sessions and answers. Published studies they match | Only their own |
| Client | Only their own studies, invoices, and the participants on their studies. The pool, filtered to what consent allows | Only their own studies and decisions on their own applicants |
| Sub-admin | Only the modules their eight toggles allow | Same |
| Master admin | Everything | Everything, and every write is logged |

A participant's picture and video are readable by a client **only while that consent is on**. Withdrawing consent must take effect immediately, not on the next cache refresh.

### 23.5 Retention and deletion

Nothing in the designs covers this, and all of it is a legal obligation rather than a product choice. Decide each with legal before launch.

| What | Needs deciding |
|---|---|
| Identity documents | Who may open one, for how long they are kept after verification, and how they are destroyed |
| Recordings and transcripts | How long they are kept, who may download them, and what happens when a study is deleted |
| Profile pictures and intro videos | Deleted when consent is withdrawn, or kept and hidden. Deleted when the account closes |
| A deactivated participant's data | What is kept for the audit trail and what is removed |
| A closed client account | What happens to their studies, answers and invoices |
| The activity log | How long it is kept. It is the audit trail, so it probably outlives everything else |

### 23.6 States nothing is drawn for

No screen in any design has a loading state, an error state or an offline state, because the prototype never waits for anything. Every one of them will need all three.

| State | Rule |
|---|---|
| Loading | Never a blank screen. The shape of what is coming, or a quiet indicator |
| Failed to load | Say what failed and offer to try again. Never an empty list that looks like no data |
| Failed to save | Keep what the person typed. Never lose their work to a failed request |
| Offline | Say so. Do not let a person fill in a form that cannot be submitted |
| Slow | Anything over a few seconds says what is happening, especially payments and uploads |

Payments and uploads need particular care: the same charge must never be taken twice if a request is retried.

**None of these are drawn and all of them need designing.**

### 23.7 What to build first

| Order | Why |
|---|---|
| 1. Database, auth, and the store replaced | Nothing else can be tested until the three apps share one real source |
| 2. Study creation through to approval | The spine of the product. Client creates, team approves |
| 3. Participant onboarding and verification | Recruitment is not possible without verified participants |
| 4. Applications, screening and sessions | The recruiting loop |
| 5. Answers, completion, rating, Trust Score | The delivery loop |
| 6. Money: invoices, payouts, approval, refunds | Needs everything above it to be true first |
| 7. Reports, restriction, support, activity log | Operations, once the product works |

### 23.8 What the front end assumes the server does

Each screen behaves correctly against the shared data layer, which stands in for the API. Where the real behaviour can only live on the server, the front end is built as if the server already does it. These are the expectations.

| Area | The front end today | What the server must do |
|---|---|---|
| Participant passwords | `Person.password` holds the password as typed, checked in the browser (`signInPerson`, `changePersonPassword`, `resetPersonPassword`, `closeAccount`). It is a stand-in and is not secure | Real authentication: store a hash, never return it, rate-limit and lock out repeated failures, and issue sessions. Remove `Person.password` from the contract |
| Sign in | A wrong password fails under the field. Signing in as the demo participant (`jonathan.reeve@example.com`, `Passw0rd!`) resets the demo data for all three apps; any other account just signs in | Check the credentials. The demo reset is prototype only and goes |
| Sign up | An email already on the platform is refused before a code is sent ("An account with this email already exists. Log in instead") | Enforce unique email, and send the one-time code by email |
| Forgot password | The email given stands in for the emailed link; an unknown email is refused on screen | Send a single-use, expiring link, and say the same thing whether or not the account exists |
| Deactivate Account | Confirmed with the password; the account becomes deactivated, "Closed by the participant", cannot sign in, and the team can reactivate it in the console | Pay any balance to the default payout method, keep the account 30 days for reactivation, then delete it under the retention rules (23.5) |
| ID upload | The two sides' names and sizes are kept on the account (`Check.documents`); the files themselves are not sent anywhere | Receive and store the files privately, for the team to open in Verifications |
| ID and credential checks | Submitted checks are `in_review` until the team decides in the console; the participant is told the outcome | Same, with the automatic register check where one exists (workflow 16 and 17) feeding the team's decision |
| Session code | Refused before the session starts | Check the time server side |
| Match score | The share of the categories the study's audience sets that the profile meets. No score for a study open to everyone | Compute it server side from the same criteria |
| Audience fit (D38) | Explore lists only studies the participant fits; applying outside the audience is refused with the categories not met; an invitation waives it | Filter and refuse on the server too: never send a participant a study they may not apply to, and refuse the application whatever the client sends |
| Places left | The study's target less everyone qualified, booked or done | Same |
| Sign-up ticker | The most recent study payout: first name, amount, study type, how long ago | A public endpoint giving only those four things. Whether a first name may be shown publicly needs a decision |
| "In Top N%" | The share of active, ID-verified participants at that tier or above | Compute it server side |
| A late withdrawal | Still Processing after its expected date says it is running late and that the team is releasing it | Release withdrawals within the stated time, or tell the participant why not |

*End of PRD.*

**The rate card (24 October 2026).** The team's rate card is confidential. A server must send it only to the console, never to the client app or the respondent app; the client receives a study's cost per interview and the participant their incentive, nothing else. In this front-end-only build all three apps share one browser state, so this is not enforced here.
