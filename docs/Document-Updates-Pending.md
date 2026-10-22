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
