# Document updates pending

Applied on 21 October 2026. The PRD and BRD (root and `docs/`), the README and
the client and console `CLAUDE.md` files now describe the build as it stands
after the design rounds of 19 and 21 October 2026.

Three decisions are open and recorded as open in PRD Section 16: the deposit
(D32), the team re-pricing a live study (D33) and the Audience forecast (D34).
The BRD lists them in Section 4.3.

The full list that was applied is in this file's history in git.

## Pending, 21 October 2026: the HumanLayer name in all three apps

HumanLayer is the brand every user sees, in all three apps. Focus Insite stays
the operating company. The PRD and BRD still say otherwise in these places:

| Document | Section | It says | The build now |
|---|---|---|---|
| PRD | 4.1 (table, "Brand shown") | Console: "Admin Panel" | The console's browser tab reads "HumanLayer Admin Panel"; the sidebar still reads "Admin Panel" beside the HumanLayer mark |
| PRD | 4.1, "Brand." paragraph | The console "is titled Admin Panel" | As above |
| PRD | D11, "What appears on screen" | The client app carries HumanLayer "in its sidebar wordmark" | Throughout the client app: the browser tab, the landing page header and footer, "Welcome To HumanLayer!", the help answers, the certificate copy and the study preview header |
| BRD | 8, D10 | The same reading as PRD D11 | As above |

Spelling everywhere: **HumanLayer**, one word, capital H and L, as the logo
spells it. Three places that read "Human Layer" now read "HumanLayer".

Kept as Focus Insite on purpose (decided 21 October 2026): the client's terms
agreement ("I agree to Focus Insite's Terms of use and Privacy policy"; the
contract is with the company, wording to be confirmed with legal), and every
line about "the Focus Insite team", including the console entrance heading and
its access line. Those are about the company and its people.

Links: the study share link is now `https://humanlayer.app/study/...` and the
session link `https://meet.humanlayer.app/...`, matching the respondent app's
`humanlayer.app` links. These are demo links.

Each app's browser tab now has a favicon, the HumanLayer H with its green dot
(`favicon.svg` in each app's `public/`).

### Open items

- **The real domain is still to be decided.** `humanlayer.app` is a demo
  domain used by all three apps' links; no live domain has been chosen.
- **The certificate ID prefix stays `FI-`** (`FI-XXXX-XXXX` for a participant,
  `FI-C-XXXX-XXXX` for a business). The signed Trust and Rewards policy sets
  it, so changing it to match the HumanLayer name needs the policy re-signed.

## Pending, 21 October 2026: the client's diary form (1518:94904)

The Create flow's diary form is built to `1518:94904`, and the Study step to
`1518:94742`. The PRD and BRD still describe the earlier layout:

| Document | Section | It says | The build now |
|---|---|---|---|
| PRD | 12.4 (the Study step table) | "Diary Study Settings → duration unit, frequency, minimum required, then the form" | The four settings (Duration Unit, Frequency, Study Duration, Minimum Required) are inside the diary form, in a "Diary Study Setup" card above the questions. The Study step's card only opens the form, or reads it back ("8 questions, 7 days logs") with Update Diary Questionnaire |
| PRD | 12.4 | A diary's questions are one form asked on every entry | One card per entry (DAY 1 to DAY 5 for a five-day diary; WEEK or HOUR for those units), each with its own questions and its own Add Question. The number of cards is the Study Duration |
| PRD | 19 (data shapes), `tasks?: Question[]` | Survey and diary questions | Unchanged, plus `day?: number` on each question: the entry it is asked on. None means every entry (every diary made before this change, and a question the console adds in Edit Study) |
| PRD | 14.4 and the respondent diary screens | Every diary day asks the same questions | Each day asks its own questions (`tasksForDay` in `shared/questions.ts`); the client's and the console's results show each day's answers against that day's questions |

Rules the build adds, not in a signed document:
- Every entry must have at least one question, and a diary cannot be made
  shorter while a dropped entry still holds a written question
  (`diaryDayFault` in `shared/studyForm.ts`). Each is refused with the reason.
- Upload File and Generate add their questions with no entry, so they are
  asked on every entry and the form saves straight away. Each shows on every
  day card, marked "Asked on every day", with "Change for this day only",
  which gives every entry its own copy to edit.
- A diary draft from before this change opens with its questions copied onto
  every entry, once, so nothing it asked is lost (`perDay` on the form marks
  it done).

Drawn one way, built another, on purpose:
- Each question keeps the one-click bin (15 Oct 2026 decision) where the
  frame draws a three-dot menu; the menu's items cannot be read from Figma.
- `1518:94742` still draws Incentive Payments, AutoPay, Costing Summary and
  Payment on the Study step, a four-step stepper and "Proceed to Publish".
  The 15 Oct 2026 decisions (a Pricing step, no AutoPay) are kept.
- The frame draws DAY 3 to DAY 5 without the card edge, and DAY 4's preview
  line upright; every day is built as a card with the italic line.

## Pending, 22 October 2026: the designer's round (console, and some of all three apps)

Figma is the authority for this round. Each item below names the frame it was
built from, or says that none draws it.

### 1. No console sign-up (Sign In `1849:112091`)

There is no self sign-up. A master admin makes every team account, on
Sub-Admin. Removed: "New to the team? Sign Up" on Sign In, the Sign Up button
on the entrance, `/signup` and `/signup/verify`, and the store's
`signUpTeam` (with `buildEmpty`, the empty platform it signed into).

| Document | Section | It says | The build now |
|---|---|---|---|
| internal/CLAUDE.md | "Sign in and sign up" | Sign up, code 123456, a new master admin of an empty platform | No sign-up. "Must change before production" item 1 (open sign-up is wrong) is resolved |
| PRD | wherever console sign-up is described | Open sign-up for the demo | No sign-up |

Checks: console-auth's five sign-up steps are one step, "No one can sign
up" (17 steps, was 22); landing-check expects only Log In on the entrance;
`signup` is out of the console's route list (178 routes, was 179).

### 2 to 4. Console Dashboard (`1872:72123`)

- The whole action row opens its item; "View" is the row's label, not a second link.
- "Payouts ready to process" sits under Manage, and counts in Manage's tab
  number (it was under Studies). No frame draws this group; it was added on
  15 October 2026.
- A no-show row reads "[participant] • [study title]", not the client's company.

### 5. Console Studies filters (`2367:68669`, `2368:68734` to `2368:68743`)

All Studies is a checkbox list (All, Survey, Video Call, Group Video Call,
In-Person, Group In-Person, Diary Study; All by default); Sort offers Recent,
Earliest, Highest Participants, Lowest Participants, Highest Cost, Lowest
Cost. Both filter and order the list on all three tabs. The console gains the
tokens `yellow-600` and `yellow-alpha20`, which these menus draw.

### 6. Publish confirmation (`2369:72188`)

Approve to Publish asks "Publish live for participants?" ("The study will be
published live on the participants app for them to apply for it.", Cancel /
Approve and Publish) before the study goes live.

### 7. Console Overview graphics (`2325:219889`, `2325:219853`)

The Participation Forecast ring is a 114px disc standing out of its panel
with a 90px brand-secondary ring; the funnel's numbers fade into their block.

### 8. Two conditions to apply (`2325:214416` console, `2354:155031` client)

| Document | Section | It says | The build now |
|---|---|---|---|
| PRD | workflow 57 and the Audience step | Three repeat rules: allow, prefer fresh people, exclude | Two: N/A (allow) and "Who has never participated in any study with [company] before" (exclude). Prefer fresh is gone everywhere: the form, the store (`RepeatRule` is `allow` or `exclude`), Matched's ranking and the respondent's eligibility row |
| Signed policy | the guardrail on repeat participants | Names the three rules | Not edited. The build no longer offers "prefer fresh"; flagged here for the next policy revision |

- Every demo study that preferred fresh people is now N/A. The seed version
  moved to 12, so stored demo data is rebuilt without the rule; nothing hidden
  still filters anyone. A draft saved with "fresh" reads as N/A.
- The client app keeps "(You)" after its own company; the console shows the
  study's client company with no "(You)", since the team is not the client.

### E. Multi-select shows checkboxes

Every builder and read-back draws a multi-select's options (and a
Multi-select/row matrix) with checkboxes, a single-select's with radios: the
client's Screener and survey builders, the client's submitted-study
read-back, the console's Review screener list and its Edit Study matrix. The
respondent app and both previews already did.

### 9. The question menu (no frame; for the designer to draw)

**Reverses the 15 October 2026 decision** (one-click delete with a bin).
Each question in the client's Screener, survey and diary builders and in the
console's Edit Study has a three-dot menu: Required (a toggle), Move up, Move
down, Add question below, Delete. Move up is off on the first question, Move
down on the last; in a diary a question moves within its own day. Delete
asks "Delete Question?" in the client, as the bin did; the console deletes at
once, as its bin did.

- **Required** is new data: `optional` on a built question (`shared/types.ts`),
  `required: false` on the form. The respondent may leave an optional question
  blank (Continue, Submit and Submit Progress allow it), sees "(optional)"
  after its prompt (new copy, not drawn), and the store accepts a survey with
  an optional question unanswered. A deciding single-select made optional is
  no longer a pre-screener question, since it cannot decide eligibility if it
  can be skipped.
- The client screener renumbers by position after any move, add or delete
  (Pre-screener - Q1 to Q3, then Q4 on).
- ten-check item 11 now checks the menu (was "deletes in one click").
- For the designer: draw the menu, its Required toggle and the respondent's
  optional marker.

### 10. Stop-complete and Billing (`2372:138874`, `2317:163036`, `2325:220730`, `1645:132608`)

A new study state, `billing`, between running and completed (`shared/lifecycle.ts`):

| From | To | When |
|---|---|---|
| recruiting, ongoing, paused | billing | Stop-complete (client or team, after "Stop and Mark Study Completed?"), or the study filling its target on its own (its last completion lands, unless the client chose to recruit more) |
| billing | completed | the bill is paid (Pay Bill), or nothing was owed when it stopped |
| billing | recruiting | Re-publish and Recruit |
| completed | (none) | a completed study is closed |

- Entering Billing finishes the study for participants: sessions not yet run
  are cancelled free, the client and the team are told, and the team can
  process payouts from Billing (Finance, Payouts). A participant never waits
  on the client's invoice.
- Billing studies sit under Ongoing in both apps and move to Completed when
  paid. The status tag reads Billing.
- The client's Pay tab in Billing is `2325:220730`: the banner ("This study is
  stopped by you to mark completed!", the time it stopped, Re-publish and
  Recruit), Estimated / Final, the bill to Net Payable, Payment Due with Pay
  Bill, Deposit Paid, Total Cost, Transactions with Invoice. The console's is
  the same, read only: no Pay Bill, no Re-publish and Recruit.
- New copy, not drawn: the banner when the team stopped the study ("This
  study is stopped by the team to mark completed!") or it filled ("This study
  has filled its target and stopped recruiting!"), and the console's banner
  lines, written from the team's side.
- The highlighted line's count ("Your study has N participants left to fill
  target") is the study's target less its completions, and is left out when
  nothing is left.
- **Replaces the 20 October reopen-while-unpaid move.** Removed:
  `canReopen` (`shared/lifecycle.ts`), the reopen branch of `moveStudy`
  (`shared/store.ts`), and the client Pay tab's reading of it. Affected
  screens: the client Pay tab and its banner; the client study menus (a study
  in Billing gets the completed menu); the console header menu (Copy Study
  Link only in Billing); the console Pay tab. Affected checks: verify-shared
  (the reopen tests are now Billing tests, plus "a study cannot jump straight
  to Completed" and "a study that fills its target goes to Billing by
  itself"), demo and ten-check (the console's Stop-complete asks first).
- Demo data: every completed study that still owed money is in Billing (seed
  version 13).

| Document | Section | It says | The build now |
|---|---|---|---|
| PRD | the study states, and 12.8 (Pay) | States draft, in review, recruiting, ongoing, paused, completed, cancelled; "Billing" is a completed study that owes money; Re-publish and Recruit reopens a completed study while unpaid | Billing is a state of its own, as above |
| BRD | the client's payment terms | The balance falls due when the study is completed | It falls due when recruiting stops (Billing), a week later |

### Open items, held and not built

- **Changing the incentive on a published study.** The design draws the
  Incentive Amount as editable after publishing (`2325:214897`). Built today:
  the money fields of a live study stay locked (PRD D33). Changing them
  changes what a client is charged after agreeing a price, so it waits for a
  business decision.
- **"If not paid, will be auto-debited from the card."** Drawn on the Billing
  Pay frame (`2325:221180`). Auto-debit was removed on 15 October 2026; the
  rest of the screen is built and that line is not.
- **The diary's Minute and Step units, and its frequency list** ("Everyday" to
  "Every 5 days"), drawn in the client's diary dropdowns. Built today: Hour,
  Day, Week, and Every day, Every 2 days, Every 3 days, Weekly. A behaviour
  change, for the designer and the business.

### B, C and D. Dialogs, controls and dropdowns

- **B.** Every dialog in all three apps already opens centred (the shared
  Modal components and the custom ones: Report Participant, Account, New
  Study, No-show). Nothing changed. The 600px side panels stay anchored to the
  right, as Figma draws them. The respondent app's bottom sheets stay at the
  bottom, as its frames draw them; tell us if those count as dialogs.
- **C.** Not covered by the 21 October audit, now following Figma: the
  console's selected radio and checked checkbox are yellow-600, as
  `2325:214416` and `2367:68669` draw them. They were green, assumed in turn 1
  when no selected state was drawn. Everything the 21 October audit said to
  leave is left. C has not been swept across every other screen of the three
  apps; that would be a full audit of its own.
- **D.** Every console dropdown (35 across 20 screens) is the menu Figma draws
  (`2368:68734`): a white panel of 38px rows, the chosen one on the brand
  yellow at 20%. It replaced a native select; the values are unchanged. The
  client's dropdowns were already drawn menus. The respondent's date picker
  keeps a native year list, a phone control.

### A. Icons and graphic assets: outstanding, not built (decided 22 October 2026)

The icons stay as they are for now: each app draws its own, not the Figma
icons. Counted on 22 October 2026: 84 distinct icons across the three Figma
pages (console 58, client 58, respondent 51; console and client share 51, and
24 are in all three). Drawn by hand today: console 54, client 51, respondent
26 plus a few inline. The other graphic assets (illustrations, badges,
empty-state pictures) have not been counted. B is confirmed: the respondent's
bottom sheets are not dialogs and stay at the bottom, as Figma draws them.
