# Product Requirements Document
# Focus Insite / HumanLayer Platform

**13 October 2026 · Soulful Labs**

**The front end for all three apps is built, deployed and working. The job is to put a real back end behind it.** Section 23 is written for that.

**This document and the BRD are self-contained, and nothing in them is left open.** The workflow is in Section 15, every policy value is in Section 6, and every decision is in Section 16.

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
| The Trust and Rewards policy | Scores, tiers, points, ratings, consent, restriction and the certificate. Governs the other two on those subjects. **It is reproduced in full in Section 6**, so no separate policy document is required |

Where they disagreed, **Section 16** records the decision taken and why. Nothing in this document is left open. Read Section 16 before building anything involving money, scores or approvals.

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

**Demo sign-ins.** Shown on each app's own sign-in screen. The console uses `peter@focusinsite.com` for a master admin and `maya.thompson@humanlayer.com` for a restricted sub-admin, both with the password `demo1234`. Signing in as the master admin or the demo participant resets the demo data.

**All data currently lives in the browser's own storage.** Nothing is shared between devices or people. Replacing that is the job. See Section 23.

---

## 1. The product in one page

**HumanLayer** is the platform being built. It is a market research participation platform.

**Focus Insite** is the company that already carries out this research, today by hand. HumanLayer is being built to automate that work, and Focus Insite will operate it. Where this document refers to "the team", it means Focus Insite's own team.

Three groups of people use the platform.

**Participants (respondents)** are ordinary verified people who get paid to take part in research studies: filling in surveys, joining video calls, attending in-person sessions, or keeping a diary over several days. They use a **mobile app**. They build up a Trust Score and a tier, earn cash and reward points, and withdraw money to a bank account.

**Clients** are companies who need to hear from specific kinds of people. They use a **desktop app**. They create a study, describe who they want, write screening questions, set an incentive, pay, and then watch the study fill up and collect the results.

**The Focus Insite team** operates the platform. They use a **desktop console**. They verify people's identity and professional credentials, verify client businesses, review and approve every new study before it goes live, moderate reported accounts, answer support tickets, confirm refunds, and set the platform's fees and reward values.

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
| **Deposit** | Money the client pays up front against the expected incentives. |
| **Refund** | Money returned to a client when a study does not fill its target. |
| **Master Admin** | The Focus Insite team member with access to every module. |
| **Sub-admin** | A team member with access to only some modules, set per module by the master admin. |

---

## 3. The platform model

**This is a managed platform with a few self-serve pieces.**

| Who does what | Detail |
|---|---|
| The client does | Creates a study end to end, invites matched people, qualifies or disqualifies applicants, marks attendance and completion, rates participants, pays invoices |
| The team does | Approves every study before it goes live, approves every payout before money moves, verifies identities and businesses, handles reports and restrictions, answers support, sets fees and reward values |
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
| Brand shown | HumanLayer | Focus Insite | Focus Insite (but see note) |
| Navigation | Bottom tab bar, 4 tabs | Left sidebar, 240px | Left sidebar, 230px |
| Screens | ~95 | ~90 | ~95 |

**There is no desktop version of the respondent app and none is planned.** On a laptop it renders as a centred phone-width column inside a frame, with background either side. Every overlay, modal, sheet, confetti and glow is clipped by that frame. Do not build a wide layout for it.

**Brand.** Focus Insite is what every user sees, in all three apps. HumanLayer is the operating entity and appears only where an entity name is legally required: finance records, invoices and legal documents. The current designs mix the two and are to be corrected. See D11.

### 4.2 Design tokens

Each app has its own token set. **Do not share tokens between apps.** They were extracted separately from the design file and they differ.

**Respondent app: dark, warm**

```
brand.primary   #fca311    brand.secondary  #3fb984
bg.0 #0c0800    bg.1 #15130f    bg.2 #201e19
bgAlt.0 #020805 bgAlt.2 #202623
text.title #fafafa  text.subtitle #e1e1e1  text.body #b9b9b9  text.disabled #5e5d5b
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
- **Side panel**: 600 wide, as tall as its content, opens top right, rounded left corners, 56px title bar, footer of two 48px buttons 16 apart.
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
draft → in_review → recruiting → ongoing → completed
                 ↘ (changes requested) → draft
   recruiting/ongoing → paused → recruiting/ongoing
   recruiting/ongoing → cancelled
```

| State | Who put it here | Where it appears | What can happen next |
|---|---|---|---|
| `draft` | Client saved and exited the create flow | Client > Studies > Drafts | Client resumes and publishes → `in_review` |
| `in_review` | Client pressed Publish | Console > Studies > To Review | Team approves → `recruiting`. Team requests changes → `draft` with a note |
| `recruiting` | Team approved | Client > Studies > Ongoing; Console > Studies > Ongoing | Target met or team/client acts → `ongoing`, `paused`, `completed` |
| `paused` | Client or team paused, with a reason | Both, with a red banner | Resume → previous state. Mark as completed → `completed` |
| `completed` | Target met, or marked complete | Studies > Completed | Nothing. Read only, downloads still work |
| `cancelled` | Not drawn in any screen | none | See D14 |

**Rules:**

- A study can only be in one state. The tab it appears under is derived from the state, never set separately.
- A study cannot be edited after it goes live. No edit control exists on any live study in either app; every one drawn is switched off in the design, and the console's study-editing screens are a discarded section. See D7.
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

**No no-show dialog mentions the Trust Score.** They speak only about payment. The signed policy says a no-show costs 4 points of Trust Score. Nothing at the point of marking says so. See D6.

**There is no cancel-session control anywhere**, for any party, despite the policy carrying a penalty for a cancelled session.

### 5.4 Participant account lifecycle

```
registered → verifying → active → restricted → active
                              ↘ deactivated → active (reactivated)
```

| State | How | Effect |
|---|---|---|
| `registered` | Signed up, profile not complete | Can browse, cannot apply |
| `verifying` | ID submitted, awaiting automatic or manual check | Limited |
| `active` | Identity verified | Full use. Certificate issued |
| `restricted` | Team restricted after an upheld report | Cannot participate, withdraw earnings or redeem rewards, for a fixed period |
| `deactivated` | Team deactivated, with a written reason and the team member's password | No access. An email is sent with the reason. The person can appeal |

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

### 5.6 Verification lifecycle

Three kinds of verification, all handled in the console, all following the same shape.

| Kind | What is checked | Against |
|---|---|---|
| Identity | Two uploaded ID document files (front and back) | Government records |
| Profession | Occupation and licence or certificate number, typed | Official records |
| Business (clients) | VAT number and company website, typed | Business records |

**Only failures reach a person.** The queue is explicitly for checks the automatic system could not complete: "Uploaded passport file could not be verified with the govt. records. Verify it manually."

**Decisions available:** Mark Verified, Reject, Chat.

- **Mark Verified** requires a written Verification Statement and the team member's password, then a confirmation step, then an outcome message. Identity: "[Name]'s account is now fully active to participate in studies." Profession: "… will be displayed on [name]'s profile publicly."
- **Reject** requires a written Rejection Statement. Warns "necessary action will be taken with impacting this account".
- **Chat** opens a support ticket. **It is the only way to ask someone for a better document.** There is no "request resubmission" state.

No undo is drawn for any verification decision. No decision records which team member made it; notes carry a date only.

**The selfie.** The console shows one line, "Selfie photo verified", with a small thumbnail, drawn as already passed on every frame, including people whose ID check failed. There is no image to compare, no liveness detail and no control. The respondent app **does not capture a selfie** because legal review is open. So the console reports a result the apps do not produce. See D5.

### 5.7 Report and moderation lifecycle

Reports arrive in a second queue, from either the system or a person.

| Field | Values drawn |
|---|---|
| Reported by | "System (Algo)", or a named person |
| Category | AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong Match |
| Reason | One line of free text |

Decisions: **Reject Report** (warns "cannot be undone later"), **Restrict Account** (statement and password; "restricted to participate, withdraw earnings & rewards, for 15 days as for the 1st time"), **Deactivate Account**.

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
| **Invoice** | Client, per study | Pending → Paid (manually, or auto-debited on the due date) |
| **Earning** | Participant, per completed study | Credited to the wallet on completion |
| **Payout** | Participant | Requested → Processing → Paid. $2 fee per withdrawal |
| **Redemption** | Participant | Points → cash into the wallet, at 100 points to $1, minimum 1,000 |
| **Refund** | Client, per underfilled study | Raised automatically from the shortfall → confirmed by a team member → paid in 5 to 7 working days |

**No approval exists for a participant payout.**

Workflow step 46 says a payout waits on client approval. This was checked against every screen in all three applications:

- The client's Pay tab is the client's own bill. It reads Payment Due, Deposit Paid and Total Cost, itemises the billing and lists settled transactions. There is no per-respondent row, no approve control and no payout list. Its only action is Pay Balance.
- The console's Pay tab is the same bill, read only.
- The console's Finance module lists payouts but offers no approve, hold, release, retry or status control.
- The participant's wallet shows money arriving.

So a participant's earning becomes withdrawable with no approval step anywhere. Either workflow step 46 is wrong, or an entire screen is missing. **This must be decided before build.** See D2.

---

## 6. Business rules register

**This section reproduces the Trust and Rewards policy in full.** No separate policy document is needed to build. Where a design draws a different number, the policy governs and the design is to be corrected. Section 16 records each disagreement and the decision taken.

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
| Onboarding complete | +50 |
| No show | −4 |
| Late show up | −2 |
| Cancelled session | −2 |
| Upheld fraud | −20 |
| Ratings counted | The last 10 studies |

### 6.2 Tiers

| Tier | Trust Score |
|---|---|
| Silver | 50 and above |
| Gold | 70 and above |
| Platinum | 90 and above |

Tier is **derived** from the Trust Score. It is never set independently and never stored as its own fact.

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
| Withdrawal fee | $2 flat |
| Points expiry | Points do not expire |
| Payout timing | 2 to 3 working days |
| Client refund timing | 5 to 7 working days |

### 6.5 Scheduling

| Rule | Value |
|---|---|
| Reschedule | Twice only, and only more than 24 hours before the session |
| Cancel a session | A participant may cancel more than 24 hours before the session, at 2 Trust Score points. Inside 24 hours they cannot cancel, and not attending is a no show at 4 points |
| Cancelled by the client or the team | Costs the participant nothing. The participant is told |
| Diary completion | At least 4 of 5 days |

### 6.6 The certificate

The policy says the certificate "Unlocks at 40". **That is not implemented.** The Trust Score floor is 50, so 40 cannot be a Trust Score threshold, and the policy line is stale. The certificate is issued when identity verification completes. No field for it is needed in Pricing and Rewards. See D12.

In the built designs a certificate ID appears in the header of participants who are still unverified, two different people are drawn carrying the same certificate ID (HL-R-9F2A-3K7P), and the *client's* business certificate carries that same string. All three are design errors.

**As built:** the certificate is issued only when identity verification completes. It carries one unique ID per person in the form `FI-XXXX-XXXX`, shows "Verified Human" and the Trust Score, and **carries no name**. The client's business certificate is a separate object with its own ID in the form `FI-C-...`. See D12.

### 6.7 Consent on a participant's picture and video

A profile picture and an intro video each carry their own consent, off by default.

| Rule | Value |
|---|---|
| Points | Earned for adding the picture or video, whether or not consent is given |
| Visibility | A client sees the picture only if consent on the picture is on, and the video only if consent on the video is on |
| Withdrawal | Consent can be withdrawn at any time, and must stop being shown immediately |
| Without consent | The client sees the participant's initial |
| Points on withdrawal | Not taken back |

### 6.8 Restriction

| Offence | Restriction |
|---|---|
| First | 15 days |
| Second | 15 days |
| Third | 30 days |
| Fourth | Deactivation |

A restricted participant cannot take part in studies, withdraw earnings or redeem rewards for the period. They are told that they are restricted, which category it was, and when it ends. A deactivated participant is sent the written reason and can appeal.

### 6.9 Changes to these values

A change to any value in this section is not retrospective. A study keeps the values it was created with.

### 6.10 Platform fees, as the console sets them

| Fee | Value | Charged |
|---|---|---|
| Platform fee | $100 | Once per study |
| Moderation fee | $10 | Per completed participant |
| Recruitment fee | $25 base | Per completed participant |
| Recruitment add-on | +$25 | For Video Call, In-Person or Diary study type, or for Roles targeting |
| Recruitment add-on | +$20 | For Skills targeting |
| Withdrawal fee (participants) | $1.99 as drawn | **Conflicts with the $2 everywhere else** |

**None of these fields has any validation drawn.** Every one is a free text box with no minimum, maximum, step or check. Nothing stops Gold being set below Silver. Add validation; see Section 9.

### 6.11 Values that originated in the build

The following were applied in the designs or the build without appearing in the original signed policy. Each has since been settled and is now part of this section.

| Value | Where it now sits |
|---|---|
| The restriction ladder, 15 / 15 / 30 days then deactivation | 6.8 |
| Points do not expire | 6.4 |
| Client refunds paid within 5 to 7 working days | 6.4 |
| Participant payouts credited within 2 to 3 working days | 6.4 |
| Profile picture and intro video points, and their consent | 6.3 and 6.7 |
| Cancelling a session | 6.5 |

Two corrections were made to the original policy, which should be reflected when it is next signed:

1. **The certificate's "unlocks at 40" is withdrawn.** The Trust Score floor is 50, so 40 cannot be a Trust Score threshold. The certificate is issued on identity verification. See 6.6 and D12.
2. **Client ratings are five stars on three dimensions**, not three states. The policy's own Trust Score table is denominated in five stars. See D16.

One value stated in the designs is **not** applied: a 3% merchant processing fee on client card payments. Nothing charges it and the line has been removed from the app. The cap of 10 a year applies to Trust Score, not to points.

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
| `/profile/edit` | My Profile, two tabs. Includes the profile picture and the intro video, each with its own consent control |
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

Consent, Details info, Why Screener, Exit Screener, Locations, Reject Study, Reject Invitation, Cancel Study, Remove Bank Account, Logout, Match Score explainer, Filters, Sort menu, Education Level picker, Industry picker, Profession picker, ID type picker, tier upgrade, points earned, streak detail.

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
| Sign Up | Sign Up | Validates, then `/verify-otp` |
| Sign Up | Log In | `/signin` |
| Sign Up | Sign up as a researcher client | Opens the client app |
| Sign Up | Terms, Privacy links | Open the documents |
| Sign In | Login | `/dashboard` |
| Sign In | Forgot Password | `/forgot-password` |
| Enter OTP | Submit | Verifies the code, then `/onboarding/about` |
| Enter OTP | Resend | Restarts the 60-second timer, toast "Code sent" |
| Enter OTP | Cancel | Back to `/signup` |
| About You | info icon | Opens the Details info pop-up |
| About You | Address field | Opens an address autocomplete; selecting one fills the field |
| About You | Upload Short Video | File picker, shows the file name |
| About You | Continue | Validates required fields, `/onboarding/professional` |
| Professional | Industry, Education | Open pickers; selecting fills the field |
| Professional | Continue | `/onboarding/identity` |
| Identity | Select ID | Opens the ID type picker |
| Identity | Upload Front, Upload Back | File picker, shows the file name |
| Identity | Continue | Opens the Consent modal |
| Consent | Save and Continue | Saves the toggles, `/onboarding/welcome` |
| Welcome | Complete Profile | `/profile/edit` |
| Welcome | Explore Studies | `/studies` |

**Do not build selfie capture.** Legal review is open. ID document upload only. This is a standing instruction and it has not changed.

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
| Reject on a card | Opens Reject Invitation; on confirm, removes it from Invites |
| Match score badge | Opens the match score explainer |
| Client name and rating | `/clients/:clientId/ratings` |
| Get Support | `/support/contact` with the study prefilled in the subject |
| View Directions | Opens a map |
| How It Works | Expands and collapses |

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
| Reschedule | `/studies/:id/reschedule`. **Blocked with an explanation after two reschedules, or within 24 hours of the session** |
| Cancel Study | Opens Cancel Study. On confirm, status → `available` and the Trust Score drops by 2 |

### 9.6 Attendance

| Control | Behaviour |
|---|---|
| Join Call | Opens the meeting link |
| Submit PIN | `/studies/:id/pin` |
| PIN entry | Six digits. A correct PIN proceeds; an incorrect one shows "Incorrect PIN, check with your interviewer" |
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
| Diary, Resume Study Day N | `/studies/:id/diary/:day` |
| Diary, Complete | **Only enabled once at least 4 of 5 days are filled** |

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
| Remove | Opens Remove Bank Account; on confirm, removes it |
| Reward Points card | `/points` |
| Redeem | `/points/redeem` |
| Points input | **Converts live at 100 points to $1. Below 1,000 points, Confirm is disabled and the reason is shown** |
| Confirm | `/points/redeem/confirm` |
| Redeem (on confirm) | Deducts points, credits the wallet, `/points/redeem/done` |

### 9.9 Profile

| Control | Behaviour |
|---|---|
| Complete Profile | `/profile/edit` |
| Trust Score card | `/trust-score` |
| Learn More About Tiers | `/trust-score/tiers` |
| Trust Score info icon | `/trust-score/rules` |
| Human Certificate | `/profile/certificate` |
| Certificate share icon | Copies a link, toast |
| Refer and Earn | `/profile/referrals` |
| Account Settings | `/profile/settings` |
| Save on any form | Saves, toast "Saved", stays on the screen |
| Change Password, Submit | Validates four rules live, then the Password Updated modal |
| Email Notification toggles | Save immediately. No save button |
| Deactivate Account | Requires the password, then the Account Deactivated modal, then signs out |
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

### 12.3 Studies

| Route | Screen | Kind |
|---|---|---|
| `/studies` | Studies, Ongoing. Table view and card view via a toggle | page |
| `/studies/drafts` | Studies, Drafts | page |
| `/studies/completed` | Studies, Completed | page |
| `/studies/sessions` | Studies, Sessions | page |
| none | Ongoing study options (row menu) | popover |
| none | Delete Study? | modal |
| none | Pause Study Participation? | modal |

**Sessions is a fourth tab** on the same page. It lists upcoming sessions on live studies, grouped by date, each with the time, the session type, the study, View Details and **Join and Start**. Join and Start opens the session page with the session already started; there is no call link until a video provider is wired in. A client sees only their own sessions.

### 12.4 Create a study: one flow, five steps

| Route | Step | What the type changes |
|---|---|---|
| `/studies/create/about` | 1. About | The selected type card: Survey / Video Call (+Group toggle) / In-Person (+Group toggle) / Diary Study |
| `/studies/create/audience` | 2. Audience | Nothing |
| `/studies/create/audience/no-match` | 2b. No matching audience | Nothing |
| `/studies/create/screener` | 3. Screener | Nothing |
| `/studies/create/study` | 4. Study setup | **Yes, the top card only** |
| `/studies/create/publish` | 5. Payment & Publish | Nothing |
| `/studies/create/published` | Published | Nothing |

**Step 4 by type:**

| Type | Settings card |
|---|---|
| Survey | Survey Settings → Create Survey Questionnaire |
| Diary | Diary Study Settings → duration unit, frequency, minimum required, then the form |
| Video Call | Video Call Settings → Set Timing Availability |
| In-Person | In-Person Interview Settings → Set Address & Availability (a 600px panel: address, limits, weekly hours, date overrides, completion verification) |

Below that settings card, **Incentive Payments, Costing Summary and Payment are identical for all four types.**

Each variant is drawn in **states, not separate screens**: the thing still to set up, set up, and the composer open beside the settings in a two-column split.

**Step 5 is one screen.** The four Payment and Publish frames are pixel identical except that Publish Study is drawn enabled on one and disabled on the others. Same label, size and position. Build it once with an enabled state.

**Panels over steps 4 and 5:** Set Address & Availability; Add an override (opened by "Add Override" on the Date Overrides card); Payment Breakdown (opened by "View Breakdown" on the Payment Summary card, and is the step-4 Costing Summary and Payment lifted into a panel).

**Popovers in the create flow:** Country Location, Age, Education, Genders, Profile Tiers, and two Question menus.

**The two Audience drawings disagree with each other** on the field list (Country with flag chips versus Location, Skills versus Organization size, two conditions versus three, Trust Score present in only one), on the forecast, and on the top-bar button. They are built as two screens so each matches its own frame. **The numbered step is canonical.** See D15.

### 12.5 Manage a study: one flow

Every Manage screen sits in a shared frame: the study header (240 × 182 thumbnail, type tag, status, title, duration and industry chips, and four figures: Completed, Qualified, Days Remaining, Progress) on a tinted card, then a bordered content card whose top is a six-tab strip.

| Route | Tab or screen | Kind |
|---|---|---|
| `/studies/:id` | Study Overview | page |
| `/studies/:id/manage` | Manage Study | page |
| `/studies/:id/matched` | Matched (and the Invited segment) | page |
| `/studies/:id/recruited` | Recruited | page |
| `/studies/:id/results` | Results | page |
| `/studies/:id/pay` | Pay while ongoing | page |
| `/studies/:id/pay/due` | Pay, due as completed | page |
| `/studies/:id/payment` | Bill Payment (a separate screen, not a tab) | page |
| `/studies/:id/respondent/:rid` | Respondent: Screener / Study Result / Activity | page |
| `/studies/:id/paused` | Paused study | page |
| none | Respondent Profile Details | panel |
| none | Rate respondent | panel |
| none | Download Sessions Results (group types) | panel |
| none | Mark [individual] as No-show | modal |

**Overview and Manage Study are two jobs, not two views.** Overview is *how the study is running*: progress tiles, description, share link, active since, the client card. Manage Study is *what the study is*: the four Create steps read back as cards, each with an Edit that returns to that step.

**Matched and Invited are one tab**, a segmented switch. The cards are identical; only the action row changes: "Invite To Study" and "View Profile" become one disabled "Invitation Sent!".

**Recruited has three flavours and the study type chooses:**

| Type | Recruited shows |
|---|---|
| Survey, Diary | An applications table: Name / Role / Status / Score, with Status and Tier filters and a pager |
| Video Call 1:1, In-Person | A `Scheduled | Applications` switch. Scheduled is Name / Role / Score / Session Time, with Join Now on the imminent slot |
| Group Video, In-Person Group | A `Sessions | Applications` switch. Sessions are cards with a seats chip, View Participants and an avatar stack |

**Everything behind one respondent is a single screen with three tabs**, not three screens: Screener, Study Result and Activity. The study strip, the profile rail and the bottom bar are shared; only the tab body and the bar change. An applied (not yet qualified) respondent drops the Study Result tab and swaps the bar for Qualify / Disqualify.

**The only fork is the Study Result tab.** Survey and diary list the answers (the diary under DAY n bars). A session study shows the booked slot, the verification PIN and a rich-text interview notes card. **There is no recording anywhere in these frames.**

**Rate (a panel)** asks for three things and no arithmetic: Expertise, Reliability and Communication at five stars each, plus an optional written review. The frame shows no weighting, no resulting score and nothing about the Trust Score. **But the signed policy closes client ratings at three states: poor, good or excellent: and the policy outranks Figma on ratings.** This is the one signed-off control in the whole build that was replaced rather than kept. See D16.

**The Pay tab is a statement, not an approval.** It reads Payment Due, Deposit Paid and Total Cost, itemises the billing and lists the transactions already settled. Nothing on it approves a respondent's earnings. Its only action is Pay Balance, drawn unpayable while the study is recruiting and payable once it is marked completed, which opens Bill Payment: a card checkout against the invoice, with the deposit netted off.

### 12.6 Pool

| Route | Screen | Kind |
|---|---|---|
| `/pool` | Pool | page |
| none | Respondent Profile Details, Reviews, Invite To Study | panels |
| none | Invitation has been sent! | modal |

**Pool is one screen in two states**, with the 245px filter rail shown or hidden. It lists the participant pool with a natural-language search and nine filters, and each person opens a profile panel with their score, tier, verification, full profile and review history. From there the client can invite them to a live study.

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

**Payments is one page in two states, not three tabs.** The segmented toggle switches Pending and Completed; the third column header changes from "Due Date (auto-debit)" to "Date"; and Pay Invoice comes off each row leaving download and view. **The saved cards sit on the same page under the table**, so there is no separate methods tab.

**Invoice Details is one panel in two states.** Unpaid draws a warm notice: the amount, the due date and "If not paid manually, will be auto-debited from [card]": with **Make Payment** in the footer. Paid draws a green receipt: "Paid $350 successfully!", the card, the timestamp: with **Download**. The study card, the invoice number, the breakdown and the total are identical.

**Pay All Due Invoices** lists every unpaid invoice with a tick against each, the saved card with "Change method", and a total. **A client may untick an invoice** and pay only some. There is no single charge across studies, so each selected invoice is paid in turn and the confirmation states the total paid and how many invoices it cleared.

**Make Payment is not the study checkout.** Bill Payment is a full screen with a card form, reached from a study's Pay tab. Make Payment is a 375px panel with **no form**: the amount, a link back to Invoice Details, the saved card already chosen with "Change method", and a pay button.

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

**A ticket carries** a subject, a one-line preview of the latest reply prefixed with who wrote it, an unread dot, a status of Open or Closed, Last Activity, Created On and a number. Inside, the thread opens with a Ticket Info card the client filled, then attachments, then replies.

**Ticket Chat is one screen in two states.** A Closed ticket has no composer and cannot be replied to.

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

**Rating & Reviews shows both directions on the same row.** The headline is the client's own aggregate. Under it, each entry is a study with a star rating, a date and a written review, then a second line: "To participant: [name] 5.0". So the top line is the score attached to that study and the bottom line is what the client gave the participant back.

**The client certificate is a business verification badge, not a trust score.** The banner reads "You are a verified business!". The card is titled "Human Layer Buyer Certificate", carries a Cert. ID, and lists four claims: EIN Business verified, Domain ownership confirmed, Verified billing on file, Data handling agreement. Nothing else: no issue or expiry date, no download, no share link, no public check URL, no issuing authority named.

**For it to be real, four things would have to exist** that no design or policy covers: a registry check resolving an EIN to this company; a domain ownership proof tied to the work email's domain; a billing record to assert against; and a signed data handling agreement on file. Plus an issuer, a validity period and a way for a third party to verify the ID. See D12.

---

# PART C: THE INTERNAL TEAM CONSOLE (desktop)

The console the Focus Insite team uses to run the platform. Light theme, 1440px, a 230px sidebar. Around 95 screens from 294 frames.

## 13. Console: navigation, entrance and shell

### 13.0 The entrance

Not in any design. Built for the same reason as the client one.

| Route | Who sees it |
|---|---|
| `/internal` | A signed-out visitor. A signed-in team member goes to their dashboard, or to the first module they have |

**This is not a marketing page and must not become one.** One screen, no scrolling: the mark, the console name, one line saying what it is, Log In as the primary action, Sign Up quieter beside it, and a line saying access is for team members only. Nothing about features, and nothing that describes internal tooling to an outsider.

### 13.1 The sidebar

The sidebar has two groups.

| Group | Items |
|---|---|
| **Users** | Dashboard, Studies, Participants, Clients, Support |
| **Platform** | Finance, Pricing & Rewards, Sub-Admin |

Participants expands to **All Participants** and **Verifications**. Clients expands to **All Clients** and **Verifications**. The account card sits at the bottom of the sidebar: avatar, name, "Master Admin".

Badges appear on Dashboard and Support, showing counts of things waiting.

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

Below them, grouped queues of things waiting. Each group has a count, a collapse chevron and a "View All"; each row has a "View".

| Group | Opens |
|---|---|
| Identity Verification | Participants > Verifications |
| Client-Business Verification | Clients > Verifications |
| Screeners to review | Studies (rows to the study) |
| New Support Tickets | Support (rows to the ticket) |
| Refunds for unfilled studies | Finance > Refunds (rows to the refund) |
| No-show verifications | Studies (rows to the study) |
| Flagged/reported accounts | Participants > Verifications, Reported segment |

**The four tiles are not links.** There is no chart anywhere in the console; nothing needs a charting library.

**Missing:** no frame draws a no-show verification queue, although the Dashboard links to one.

### 14.2 Studies

One screen, three tab states.

| Tab | Columns | Row action | Row opens |
|---|---|---|---|
| To Review | Study Name, Type, Participants, Submitted on, Total Cost | Review | `/studies/review/:id` |
| Ongoing | Study Name, Type, Completed, Last Activity, Applications (a chip with a chevron) | the chip | `/studies/:id` |
| Completed | Study Name, Type, Completed, Date | none | `/studies/:id` |

Search: "Search studies". A filter dropdown and a sort dropdown, whose option lists are not drawn.

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
- **Approve to Publish** opens a confirmation dialog: "This study has been published live! … It is live on the platform and showing to targeted participants." with "Done! View Details".

**There is no reject, no decline and no edit anywhere in this section.** Everything in the tabs is read only.

**Nothing drawn shows** the study leaving the To Review list, moving to Ongoing, or the client being notified. Specify all three.

**Content cut off in the design.** The Screener and Survey tabs hold nine question blocks and Diary three days, but the frames stop after the fourth question and the second day, and the clipped content cannot be read even in the file. Five further question types exist: a long text, a slider with Price / Value / Description, a drag-to-rank list, a file upload and a matrix: whose labels cannot be read. **Those five question types need designing or specifying before build.**

### 14.4 Manage a study

One screen for all six types, six tabs: Overview, Manage Study, Matched, Recruited, Results, Pay.

Header: image, type tag, status, copy-link and options buttons, title, duration and industry tags, and four figures (Completed, Qualified, Days Remaining, Progress).

| Tab | Holds |
|---|---|
| Overview | Four tiles (Progress with a ring, Completed, Qualified, Days Remaining), description, share link with Copy, Active Since, the About Client card with "Go To Profile" |
| Manage Study | Four read-only blocks: About, Audience, Screener, Study |
| Matched | Cards of surfaced respondents, with Invite To Study and View Profile; an Invited segment |
| Recruited | Three flavours by type, exactly as the client app |
| Results | Tiles, a summary card with Download, completed respondents with Rate Now or Rated, and a "STUDY VERIFICATION CERTIFICATE / 21 of 21 completions verified human" card |
| Pay | The client's bill, read only. The only control is Receipt |

**The options menu:** Copy Study Link, Pause Study, Duplicate to Drafts. The diary section also shows Stop-complete Study and Edit.

**Pause Study** opens a 600px panel: "Pause Study Participation?", a Reason box, Cancel / Yes, Pause Study. **This is the only way to pause drawn anywhere.**

**Paused** adds a red banner: "You have paused this study with stopping recruit new participants further." with "Mark as completed" and "Resume Study". The About Client card disappears and the tiles widen.

**Everything that would let the team change a study is switched off**: an Edit button on each of the four Manage Study blocks, two "Set Criteria" links, a "Study Management Control / Manage yourself (Self-managed)" row, and a "Study Control / Self-managed (DIY)" block on Overview. See D7.

**The completed study is a shorter screen**: a smaller header with status "Completed" and no figures, a two-item menu, and three tabs with no panel: Overview (success rate, completed, qualified, closed date), Results, and Payments (total paid, receipts). Manage Study, Matched, Recruited, pause and duplicate are all gone.

### 14.5 Participants

**The list.** Two segments, Active and Deactivated, with a count line. A toolbar: search by name or role, Advanced Filters, Last Active, Profession verified, Gender, Tier. Ten rows with pagination.

Columns: Name (with photo), Role, Industry, Score & Tier, Gender, Location, Last Active or Deactivated. Name, Score & Tier, Gender and the date are sortable.

| Dropdown | Options |
|---|---|
| Last Active | Today, Last 7 days, This Month, Last 30 days, Last 3 months |
| Profession verified | All, Profession Verified |
| Gender | All, Male, Female, Other |
| Tier | All Tiers, Platinum (90+), Gold (70 to 90), Silver (up to 70) |

**Advanced Filters** is a panel: Roles, Domain, Location, Language, each a dropdown with chips, then Cancel / Save.

**No row action and no bulk action is drawn.** No checkbox, no menu, no button. A row opens the profile.

**Restricted, flagged and reported people are not marked or separable here at all.** No status column, no filter, no tag. Certificate state does not appear either.

**The profile.** Three segments with ten states.

| Segment | Sub-states |
|---|---|
| About | Professional Details, Trust Score, Personal Details, Account Details (ID documents and the selfie result) |
| Studies | Invites To Schedule, Scheduled, Applied, History, Saved |
| Wallet | Earnings, Payouts, Reward Points, Referrals |

Header: photo, name, role, place, Cert. ID, profile completion, Profession Verified, the score, the tier, Reviews, copy link, an options menu, last active.

**What the team can do from here:** read Reviews, Invite To Study, Send E-mail, Deactivate Account, Reactivate Account. **That is all.** No restrict, no flag, no report, no note field. **No control changes a score, tier, certificate, balance, points or study status. No override of any kind is drawn.**

**Deactivate** is three steps: a form ("User will receive the deactivation email with your given reason and won't be able to access until you activate it back.") requiring a Reason and the team member's password, a confirmation, then an outcome. Reactivate mirrors it exactly.

**The deactivated banner names no one:** not who deactivated the account, not whether it was a person or the system. There is no activity log of team actions anywhere on the profile.

### 14.6 Participant verifications

**Two queues in one screen**, as segments: Onboarding and Reported. Each is a pending table plus a History table.

| Queue | Columns |
|---|---|
| Onboarding | Name, Role, Date, Flagged For (Identity Verification or Profession Credential, both in one queue), Reason |
| Reported | The same plus Reported By (System (Algo), or a person). Flagged For: AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong Match |

History carries Completed, Verification Remarks and a Result: Verified / Rejected for onboarding; Rejected / Restricted / Deactivated for reports.

**The detail screen** has two tabs: the check itself and Profile Details.

| Kind | What the team compares |
|---|---|
| Identity | Two uploaded files (front and back), each with a view button, against "could not be verified with the govt. records". Plus a line saying the selfie passed |
| Profession | Occupation and licence number as text, against "could not be found". **No licence document is drawn** |
| Report | The category, a one-line reason, and after a decision a View Study link and who reported it |

Decisions and their wording are in Section 5.6. A decided screen greys the card, swaps the buttons for "View Support Chat" and adds a dated note.

### 14.7 Clients

**The list** mirrors the participants list: Active and Deactivated segments, a search, three dropdowns, columns Name / Role / Company / Industry / Location / Last Active. No row or bulk action.

**The profile** has three tabs.

| Tab | Holds |
|---|---|
| About | Account Details (work email, role, company, VAT number, website, industry, location) and Reviews |
| Studies | Ongoing and Completed tables: Billed, Required, Completed, dates, a row menu |
| Payments | Due Payments, All Time Spent, Average Study Cost; Pending and Completed Invoices; Saved Payment Methods |

> **Compliance defect, fix before build.** The Saved Payment Methods card draws **full card numbers and CVV codes** on screen. A CVV may never be stored by anyone under card industry rules, and a full card number must never be shown to staff. Show the last four digits and the card brand, nothing else. This is not a design preference.

**No team members appear anywhere.** One person per client account.

**What the team can do:** Send E-mail, Deactivate Account, Reactivate Account, and on a study row Copy Study Link / Pause Study / Duplicate to Drafts. No restrict, no approve.

**No deactivate or reactivate dialog is drawn for a client.** The participant flow is reused, and it still names a participant. Write the client versions.

**Client business verification** is one queue. What is checked: the VAT number and the company website the client typed. No document is uploaded or shown. Decisions: Reject, Mark Verified, Chat, each with a required statement; verify also takes the password.

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

A row opens a Transaction Details panel: who, how much, the date, a transaction id, the method, and a Download.

**Payouts are listed and only listed.** No approve, hold, release, retry or status. See D2.

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

The values as drawn are in Section 6, with every disagreement against the signed policy.

**The edit flow as drawn is dangerous and must be changed.**

1. **No validation on any field.** Every one is a free text box with no minimum, maximum, step or check. Nothing stops Gold being set below Silver, or a negative fee.
2. **No confirmation.** No reason, no password, no "are you sure", no approval step. One click and it is live.
3. **No history.** No record of past values, no "last changed", no name against a change.
4. **No scoping.** The only statement about existing studies is one sentence, drawn once, for client fees: "The updated pricing are published live and will be applied to new studies." Nothing says whether a Trust Score rule change applies retrospectively.
5. **Labelling errors that will cause a wrong number to be saved.** Edit Tiers labels the Silver field "Withdrawal" and the Gold field "Reward Points Value". The Referral and Being Referred notes are swapped. Every save shows the same confirmation, "Clients Fees are updated!", whichever screen was saved.

**Required changes before this ships:** per-field validation with sensible bounds, ordering validation on the tiers, a confirmation step with the team member's password, an audit record of who changed what and when, and a clear statement of whether a change is retrospective.

**The certificate threshold has no field at all**, although the policy sets one.

### 14.11 Sub-Admin

**The list.** Sub-admin members in a table, with a Create button. Below it, the **Activity log**: a global table of team actions with columns Activity, Module Path, Date and Action By (photo, name and role), filterable by module, by person and by period, with an Export.

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

**No sign-in or sign-up screen is drawn for the console at all.** Both were built from the pattern the other two apps use, because a console with no door is not shippable. Open sign-up creates a master admin, which is wrong for production and must become invitation-only.

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
| 10 | Participant | Respondent app | Uploads an identity document and accepts the consent screen. **No selfie and no liveness capture. That is blocked until the biometric legal review closes** | Participant `verifying` |
| 11 | System | none | Attempts automatic identity verification | |
| 12 | System | none | For a professional participant, checks the licence number against the relevant public register | |
| 13 | Team | Console | **Only if a check fails.** It appears in Participants > Verifications. A team member compares the documents, writes a statement, enters their password, and verifies or rejects | Participant `active` |
| 14 | System | none | Trust Score set to 50. Tier derived as Silver. The certificate is issued | |

The certificate is issued here and nowhere else, carries one unique ID per person, and claims only identity verified and profession verified. See D12.

### 15.2 Stage C: the study is created and approved

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 15 | Client | Client app | Starts Create Study. Five steps: About, Audience, Screener, Study setup, Payment and Publish | Study `draft` |
| 16 | Client | Client app | About: title, type, description, duration, industry, thumbnail. **The type decides everything downstream**, including whether sessions exist at all |  |
| 17 | Client | Client app | Audience: how many participants, and the criteria that decide who matches | |
| 18 | Client | Client app | Screener: builds the questions applicants must answer. Marks correct answers where a question decides eligibility | |
| 19 | Client | Client app | Study setup: availability, session slots, location or link, and diary settings where the type needs them | |
| 20 | Client | Client app | Payment and Publish: sees the fees, pays the deposit, presses Publish | Study `in_review` |
| 21 | Client | Client app | **Or** saves a draft and leaves. The draft reopens with everything still in it | Study stays `draft` |
| 22 | Team | Console | The study appears in Studies > To Review. A team member reads all six tabs | |
| 23 | Team | Console | Approves to Publish, **or** Requests Changes with a written note | Study `recruiting`, or back to `draft` |
| 24 | Client | Client app | If changes were requested, the study is in Drafts with the note in Revisions History. The client edits and republishes | |

**Fees charged at step 20:** a $100 platform fee once per study, plus per-completed-participant fees of $10 moderation and $25 recruitment, with add-ons of $25 for Video Call, In-Person or Diary types or Roles targeting, and $20 for Skills targeting. Section 6.10 has the full table.

**Not designed:** there is no way to edit a live study. See D7.

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
| 36 | Client or team | Client app or console | Confirms attendance | |
| 37 | Client or team | Client app or console | **Or** marks the participant as a no-show, with a second confirmation | `no_show`, Trust Score −4 |
| 38 | Client or team | Client app or console | **Or** marks them as late. Trust Score −2 | |
| 39 | System | none | Session recording and transcript are produced where recording was agreed | |

**Not designed:** there is no cancel-session control anywhere, for any party, although the policy deducts 2 Trust Score points for a cancelled session. See D6.

### 15.5 Stage F: completion and rating

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 40 | Client or team | Client app or console | Marks the participant as completed, with a second confirmation | `completed` |
| 41 | System | none | The incentive is credited to the participant's wallet | |
| 42 | System | none | 25 reward points are added | |
| 43 | System | none | Trust Score +1, capped at 10 study completions a year. Tier re-derived | |
| 44 | Client | Client app | Rates the participant. **The signed policy closes this at three states: poor, good or excellent**, and the policy outranks the design here. See D16 | `rated` |
| 45 | System | none | The rating adjusts the Trust Score: +4 for 5 stars, +3 for 4, +1 for 3, −2 for 2, −3 for 1. Only the last 10 studies count, and ratings contribute at most +40 | |
| 46 | Participant | Respondent app | Rates the client back | |
| 47 | System | none | The study reaches its target, or a person marks it complete | Study `completed` |

**Not designed:** nothing approves a participant payout. Step 41 happens on its own. No screen in any of the three apps offers approve, hold, release or retry on a payout. See D2.

### 15.6 Stage G: money settles

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 48 | System | none | Raises the balance invoice for the study | Invoice `due` |
| 49 | Client | Client app | Pays it, **or** it is auto-debited on the due date | Invoice `paid` |
| 50 | System | none | **If the study underfilled**, raises a refund automatically from the shortfall | Refund `pending` |
| 51 | Team | Console | Finance > Refunds. Confirms the refund. The client is told 5 to 7 working days | Refund `confirmed` |
| 52 | Participant | Respondent app | Withdraws earnings to a bank account, less a $2 flat fee. Credited in 2 to 3 working days | |
| 53 | Participant | Respondent app | **Or** redeems reward points. 100 points = $1, minimum 1,000 points | |

**Payouts are manual at launch.** Steps 52 and 53 are instructions to the team, not an automated transfer.

### 15.7 Stage H: things go wrong

| # | Who | Where | What happens | State |
|---|---|---|---|---|
| 54 | System or a person | none | Reports a participant: AI/Bot Activity, Abusive Behaviour, Spam Apply or Wrong Match | Report `open` |
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
| 64 | Master admin | Console | Sets fees, reward values, tier thresholds and withdrawal rules in Pricing & Rewards. **No validation is drawn on any field** |
| 65 | Master admin | Console | Creates sub-admins and sets their module access with eight toggles |
| 66 | System | Console | Records team actions in the activity log, with the module path, date and the acting person |

**Not designed:** The activity log covers almost nothing: see D4. Changing fees and reward values has no approval step and no audit trail. One master admin account holds every permission behind a password alone, with no second holder and no succession path.

---

## 16. Decisions

Every disagreement found between the designs, the earlier workflow and the signed policy is settled here. Build what this section says.

**The order of authority used to settle them:** the signed Trust and Rewards policy on scores, tiers, points, ratings and the certificate; the Figma designs on everything a user sees; the workflow on what happens and in what order. Where all three were silent, the decision is recorded here with its reason.

### D1: The platform model

**Managed, with a few self-serve pieces.** A client creates a study, searches the pool, invites people and runs the study themselves. The team approves every study before it goes live, approves every payout, and handles verification, moderation and support.

### D2: Payout approval

**A participant payout is approved by the team before money moves.** No payout is automatic.

| Where | Console, Finance module |
|---|---|
| What it lists | One row per participant per completed study, with the participant, the study, the amount, the completion date and the current state |
| States | `pending` on completion, then `approved`, `held`, `paid`, or `failed` |
| Actions | Approve, Hold with a written reason, Release a held payout, Retry a failed one |
| Who | Any team member with Finance access. Every action is logged with their name |
| The participant sees | "Payment approved" in their wallet, then the credit. A held payout shows as pending, with no reason exposed |

**This screen is not in any design and must be drawn.** The workflow has always said a payout waits on approval. Nothing in the three apps does it.

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

**Out.** Identity verification is by document upload only. The respondent app captures no selfie and no liveness check, and the console's "Selfie photo verified" line is removed from every verification frame.

This stands until the biometric legal review closes. Nothing biometric is built before then.

### D6: Cancelling a session

**A participant may cancel a session, more than 24 hours before it starts.** It costs 2 Trust Score points, as the policy says. Inside 24 hours they cannot cancel, and not attending is a no-show at 4 points.

A client or the team may also cancel a session. That costs the participant nothing, and the participant is told.

**Every dialog that marks a no-show or a cancellation states the Trust Score cost.** Today they speak only about payment.

### D7: Editing a live study

**A live study cannot be edited.** Pause, resume and mark complete are the only controls. This is how it is drawn and it is intended: an approved study is what participants applied to, and changing it underneath them invalidates the approval.

A client who needs a change pauses the study and raises a support ticket.

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

**What appears on screen.** The three apps are branded **Focus Insite**, because they are Focus Insite's instance of the platform and that is what their participants and clients deal with. HumanLayer appears as the platform's own name in internal contexts, such as the console's title.

The current designs mix the two inconsistently. Wherever a user-facing screen, email or certificate names the platform, it reads Focus Insite.

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

The policy's "three states" line contradicts the policy's own Trust Score table, which is denominated in five stars. The table is the operative part. **The policy's wording should be corrected to match.**

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
| Withdrawal fee | $1.99 | $2 |
| Certificate threshold | no field | No field. See D12 |

The same corrections apply to the participant profile's Points History: Study is 25 not 50, Streak is 50 not 100, Referral is 200 not 25.

### D19: Card data

**Never display a full card number. Never store a CVV.** The console's client profile shows the last four digits and the card brand, and nothing else.

This is not a preference. Storing a CVV is a card industry breach, and card details go to the payment provider directly without touching the platform's database.

### D20: Validation on Pricing & Rewards

Every field in that module is a free text box today with no checks. **Build these:** no tier threshold may be set below the one beneath it, no fee or point value may be negative, the Trust Score floor stays at 50, and every change asks for confirmation showing the old and new value before it saves.

### D21: Publishing a study

**A study cannot be published with no screener questions.** At least one is required.

### D22: The deposit

**One rule everywhere.** At submission the client pays the incentives for the full sample. Everything else, the platform fee, moderation and recruitment, is billed on delivery.

Costing Summary, Payment, the Breakdown panel and Payment Summary all price from the fee table in Section 6.10 and from the study as actually built. No figure on any of them is fixed.

**Editing a study that is waiting on the team retakes the deposit at the new figures**, replacing the old one. A live study cannot be edited at all, so this only ever applies before approval.

### D23: Matching

**The match runs once, when the team approves the study.** It selects the people in the pool who fit the audience that was set, and those people are the Matched list.

People who join the platform afterwards are not added to that study's Matched list. A study built in the create flow has no one matched to it until it is approved.

### D24: AutoPay

**AutoPay decides whether a participant's incentive is paid automatically on completion or waits for the client to approve it on the Pay tab.** With it off, the money does not move until the client approves.

This sits alongside D2, which is the team's approval of the payout itself.

### D25: Work in progress

**Create Study always starts a new study.** Anything in progress is saved to Drafts first, never discarded. Resuming happens from Drafts.

Work in progress is kept as it is typed, so a reload loses nothing. It only reaches the platform on Save Draft & Exit or Publish.

### D26: Uploads

| Upload | Behaviour |
|---|---|
| Study thumbnail | A real image, JPEG or PNG, up to 2MB, kept at no more than 640 by 480 |
| Screener questions by file | A real text or CSV file, one open question per line |
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

**None of this is drawn and must be.**

### D29: Study descriptions on the respondent app

A study list shows the title only. **The description opens on tap**, as a small popover over the card, and closes on tapping away.

This is a phone, so there is no hover state. Tap to open, tap away to close. It applies everywhere a study is listed: Explore, Invites, My Studies, and anywhere else a description sits under a title.

Opening a popover is Tier 1 motion: 120 to 180ms, no bounce.

**Not drawn. The designs put the full description under every title, which is too much text on a phone.**

### D30: The client dashboard

Too much was on one screen. What is shown at once is reduced, without losing anything.

| Section | Rule |
|---|---|
| Ongoing Studies | A carousel. Two cards visible, arrows to move through |
| Needs Your Attention | The top three rows, with View all for the rest |
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
| Rated by a client | No |
| Tier changed | No |
| Points earned | No |
| Withdrawal processing, and paid | Yes |
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
| Invoice due, and auto-debit warning | Yes |
| Payment taken | Yes |
| Refund confirmed | Yes |
| Support ticket replied to | Yes |

**To the team**

| Event |
|---|
| A verification needs a person |
| A report was raised |
| A study is waiting for review |
| A refund is waiting for confirmation |
| A ticket was not resolved automatically |

These drive the console Dashboard counts and the sidebar badges.

---

## 19. Front-end data shapes

A starting point, from the built respondent app. Extend for the other two.

```ts
type StudyType = 'survey' | 'video_call' | 'group_video_call'
               | 'in_person' | 'in_person_group' | 'diary'

type StudyState = 'draft' | 'in_review' | 'recruiting' | 'ongoing'
                | 'paused' | 'completed' | 'cancelled'

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
}

interface Participation {
  studyId: string
  personId: string
  state: RespondentState
  matchScore: number
  screenerAnswers?: Answer[]
  booking?: { date: string; slot: string; locationId?: string; rescheduleCount: number }
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
  // Five further types exist in the console designs but their labels
  // cannot be read: long text, a priced slider, drag-to-rank, file
  // upload, matrix. Specify before building.
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

### 20.2 Client app

1. Sign up, confirm email, fill Organization Details, add a card, reach Welcome
2. Create a study of each of the six types through all five steps
3. Save a draft part way, find it in Drafts, resume it
4. Publish, see it enter review
5. Open a live study, invite a matched respondent, see them move to Invited
6. Open an applied respondent, qualify them
7. Mark attendance on a session, and mark one person a no-show
8. Open Results, rate a respondent, see Rate Now become Rated
9. Pay an invoice from Payments and from a study's Pay tab
11. Raise a support ticket and read the reply
12. Change the password; attempt to deactivate with a live study and get refused

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

### 20.4 Cross-app

1. A study created in the client app appears in the console's To Review queue
2. Approving it in the console makes it visible to a matching participant in the respondent app
3. A participant's application appears in both the client app and the console
4. Qualifying in either place moves the participant in all three apps
5. Completing a study credits the wallet, the points and the Trust Score, and the new score and tier appear on the participant's profile in the console
6. A no-show marked in the client app shows as No Show in the participant's history and in the console

---

## 21. Built and working, but not in Figma

**These need no design work.** They are in the front end now, and the apps are the reference for them. They are listed only so that nobody searches Figma for them and assumes something is missing.

| What | Where |
|---|---|
| Console sign in and sign up | Console. No sign-in screen is drawn at all |
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
| Participant ID and selfie | Persona, Stripe Identity, Socure, Onfido, Veriff, Incode | Persona | Strong US coverage, returns inconclusive as well as pass and fail, which the manual review step needs, and it holds the biometric data so that exposure sits with the provider | 3 to 5 days. Stripe Identity is quicker, maybe 2 days, but thinner on manual review and it ties identity to the payment provider. Socure and Onfido are enterprise sales cycles, so weeks before anything can be tested. **Blocked either way until the legal review closes** |
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

**Open sign-up must become invitation-only before launch.** The prototype allows any visitor to create a master admin account, as no invitation flow is designed.

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
| Gold tier | "In Top 20%" | Everywhere a tier is explained |
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
| In Process | Waits for the client to approve the payout when AutoPay is off. See D24 |
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
| Selfie capture | Deliberately not built. See D5 |
| Monthly Goal on the Wallet | Later phase |
| Get Started overview tiles | Not built |
| "Study cancelled by client" notification | There is no cancel. See D14 |
| "Welcome back" notification | There is no reactivation path for a participant |
| Address autocomplete | The address list is sample data. A real autocomplete is a build task |

### Lists that are sample data

The education level list and the industry list are mostly invented. Seven rows of each come from the designs; the rest were added so the lists were usable. **Both need a real list before launch.**

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
| Study | Create, update while draft or in review, read, publish, pause, resume, complete. **Never update once live** | Client |
| Study (as seen by the team) | Read, approve, request changes with a note, pause, complete | Console |
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
| Payout | Read, approve, hold with a reason, release, retry | Console |
| Invoice | Read own, pay one, pay several | Client |
| Invoice (as seen by the team) | Read, adjust | Console |
| Refund | Raise automatically on an underfilled study, confirm | Console |
| Report | Raise, read, reject, restrict, deactivate | Console |
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

*End of PRD.*
