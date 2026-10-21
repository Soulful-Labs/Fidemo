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
