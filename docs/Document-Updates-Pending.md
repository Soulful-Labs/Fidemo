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
