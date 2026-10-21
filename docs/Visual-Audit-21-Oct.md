# Visual audit, 21 October 2026

A check only. No code was changed.

**Method.**
- **Figma tokens** were read with `get_variable_defs` on 21 frames across the three apps. They were compared with the three `tailwind.config.ts` files (the apps load them through `@config`).
- **Screens** were then compared frame by frame against the running build at the design width (1440, or 375 for the respondent):
  - **Fills and lines:** the solid colours each Figma screenshot and each build render contain were compared, counting only pixels in a horizontal run of one colour. That excludes text antialiasing.
  - **Text and icons:** the core ink colour was sampled from matching crops.
  - **Build styles:** read from the DOM with `getComputedStyle` where needed.

Every row below was checked on screen, not inferred from code. Figma screenshots are used to confirm, not to measure sizes. Font sizes come from the Figma text-node heights in `get_metadata` and the build's computed style.

Figma calls used: about 35, well inside the rate limit; nothing was cut short by it.

---

## Part A: three older changes

### A1. One screener screen, no pre-screener section: **partly done**

| App | What is on screen |
|---|---|
| Client, Create > Screener (`client/src/screens/create/Screener.tsx`) | **Not done.** Above question 1 a band reads **"ELIGIBILITY PRE-SCREENER"** (CSS `text-transform: uppercase`), with the paragraph "The three questions that decide who may continue. Answers are pre-set, so nothing is reviewed by hand." Above question 4 a second band, **"FULL SCREENER"**, with "Only participants who pass the pre-screener are asked these…", and a 1px `stroke-2` divider above it (`StageBand`, lines 41 to 48 and 371 to 372). The tags themselves are right: Pre-screener - Q1, Q2, Q3, then Q4 to Q9 |
| Console, Edit Study > Screener | **Done.** Tags read Pre-screener - Q1, Q2, Q3, then Q4 onward. No band, heading or paragraph. Every question has the same divider, so nothing marks the break after Q3 |

The respondent app still has a separate pre-screener step for participants ("Check eligibility", PRD 22.11). That is outside this check, which was the two builders.

### A2. Preview panel on About and Screener: **partly done**

| App | Default seen on screen | Open and close | Messages |
|---|---|---|---|
| Client, About | **Collapsed.** No panel at load; a Preview button top right | Preview opens it; the cross closes it | None on open, none on close |
| Client, Screener | **Collapsed.** No panel at load; Preview beside the heading | Same | None |
| Console, Edit Study > About | **Open at load** | The cross hides it; a Preview button brings it back | None |
| Console, Edit Study > Screener | **Open at load** | Same | None |

So the client app meets the rule. The console's panel is collapsible with no messages, but it is **not collapsed by default** (`useState(true)` in `internal/src/screens/studies/edit/EditStudy.tsx`).

### A3. Profile Tiers against Figma: **does not fully match**

Frame: the "Profile Tiers" instance `1543:85715` (Create, Survey). The same menu appears as `1622:77104`, `1622:79636` and `1622:82166`. A fifth instance named "Profile Tiers", `1666:128049` in Payments, is actually a saved-card picker and is misnamed in Figma.

| Element | Figma | Build |
|---|---|---|
| Selected row fill | `Alpha/yellow-alpha/yellow-20` `#fca31133` over bg-0, renders `#fcebcd` | yellow-30 `#fff7ea` |
| Selected tick disc | Brand/Primary `#e5940f` | cta-primary `#fca311` |
| Dividers between rows | 1px Stroke/stroke-1 `#edf3f0` | none |
| Menu shadow | Drop Shadow/300: two layers, 0 4px 4px −1px `#0c0c0d0d` and `#0c0c0d1a` | `0 4px 16px rgba(32,30,25,0.12)` |
| Tier icons, colours, title and sub text | Platinum `#9139f6`, Gold `#e4b300`; Body-Regular 16 title, Text-Regular 14 subtitle | Match |

Copy also differs, and is out of scope here: Figma reads "Gold Tier" and "70 to 90 Trust score, top 25%"; the build reads "Gold Tier and above", "70+ Trust score" and a percentage derived from the pool. All of the colour, divider and shadow rows are in `client/src/components/ui/CheckPicker.tsx`, so one fix covers every picker in the client app.

---

## Part B: tokens

### B1. Figma tokens whose value differs from the build

| Token (Figma) | Figma value | Build value | Apps |
|---|---|---|---|
| CTA/Tertiery/tertiery-stroke-default (light) | `#d0d0d0` | `cta.tertiaryStroke` `#e1e1e1` | Client, console |
| Text/subtitle (dark) | `#d0d0d0` | `text.subtitle` `#e1e1e1` | Respondent |
| Text/body (dark) | `#9e9e9e` | `text.body` `#b9b9b9` | Respondent |
| Stroke/input field (dark) | `#2d2b28` | Inputs use `stroke.3` `#282d2b` | Respondent |
| Titles/Title-L-24 line height | 100% (24px) | `title-l` line height `31px` | Client (the console has `1`, which matches) |
| Lables/Lables | 14px, 400, −2% | `label` is 12px (−1% client, −2% console) | Client, console |
| Neutral (P)/neutral-700 | `#2d2b28` | `neutral.700` `#e0dedc` (another scale under the same name) | Client (console matches) |

### B2. Figma tokens the build does not have

| Token | Value | Missing from |
|---|---|---|
| Alpha/yellow-alpha/yellow-20 | `#fca31133` | Client, console |
| Alpha/green-alpha/green-15 | `#3fb98426` | Client (console has `green.alpha15`) |
| Primary/yellow-200 | `#fed592` | Client by that name (same value as `cta.secondary`) |
| Drop Shadow/300 | Two layers, 0 4 4 −1, `#0c0c0d0d` and `#0c0c0d1a` | All three. No shadow token anywhere; the client uses an ad hoc shadow |
| Body/Body-Large | 16px, 600, −1% | Console (`text-body-large` is referenced in `lib/cn.ts` but not defined) |
| Radius/3XL | 40 | Client, console (the console has `4xl` 48) |
| Stroke/Half | 0.5 | Client (`borderWidth` has no 0.5) |
| var(--sds-color-text-default-secondary) | `#757575` | All. A Simple Design System colour inside the menu components |
| var(--sds-color-background-positive-default / -hover) | `#14ae5c` / `#009951` | Client has only `#009951` (`green.ok`); the console has both |
| Text/Font = **Figtree**, used by APP/Lables (14px, 500, 0%) | Figtree | All three. The build loads Geist only |
| APP/Body/Text-Regular | 14px, 400, **−1%** | All (the build's `text-regular` is −2%) |
| Secondary/green-800, green-1000 (dark) | `#236649`, `#0d291d` | Respondent |
| BG/secondary/bg-1 (dark) | `#101512` | Respondent (same value as `stroke.1`) |
| Element/S-16 to 3XL-48 | 16, 20, 24, 32, 48 | Respondent (client and console have `el-*`) |
| Wireframe ctas/p-button | `#e5940f` | All (same value as Brand/Primary) |

### B3. Build tokens with no Figma variable in the audited frames

These are not errors in themselves; they may come from frames outside this audit.

- **Client:**
  - `stroke.warm` `#e8e0d4`, used where the frames draw an unvariabled `#dddddd`;
  - the tier backgrounds `goldBg`, `platinumBg`, `silverBg`;
  - `green.50`, `green.ok`;
  - `red.50`, `red.600`;
  - `purple.*`, `blue.100`;
  - `neutral.500`, `neutral.800`, `neutral.1000`;
  - `bg.4`.
- **Console:**
  - `shell.edge`, `shell.rail`;
  - `text.titleStray`, `text.subtitleStray`;
  - `state.destructive`, `state.destructiveEdge`, `state.warningBg`, `state.successBg`;
  - `orange.100`;
  - `red.100`, `red.200`;
  - the tier backgrounds;
  - `yellow.800`.
- **Respondent:**
  - `state.success` `#00cc66`, `state.dangerBg`;
  - `accent.purple`, `accent.blue`;
  - every gradient and glow in `backgroundImage`.

The respondent's `text.subtitle` and `text.body` values came from the original build brief (root `CLAUDE.md`, "Design tokens", to be written "exactly"). Figma's variables have since moved.

---

## Part B: every difference, screen by screen

| # | App | Screen | Element | Property | Figma | Build | Kind |
|---|---|---|---|---|---|---|---|
| 1 | Client, console | Every screen with a tertiary button (Re-publish and Recruit, Cancel, close buttons, View Client Profile, Go To Full Profile) | Tertiary button | Border colour | `#d0d0d0` | `#e1e1e1` | Token |
| 2 | Client | Pay, stopped study (`1645:132608`) | Re-publish and Recruit (tertiary) | Fill | none, the banner shows through | bg-0 `#fdfdfc` | Designer |
| 3 | Client | Every study tab strip (Revisions History `2322:211934`, Pay and the others) | Active tab underline | Colour | Brand/Primary `#e5940f` | cta-primary `#fca311` | Token |
| 4 | Client | Shell, every screen | "HumanLayer" wordmark | Colour | `#000000` | text-title `#201e19` | Designer |
| 5 | Client | Pay, stopped study | "This study is stopped…" banner | Border colour | yellow-200 `#fed592` | yellow-300 at 70% opacity, renders `#fed086` | Single screen |
| 6 | Client | Audience, Profile Tiers menu (and every picker) | Selected row | Fill | `#fca31133` over bg-0 = `#fcebcd` | yellow-30 `#fff7ea` | Token |
| 7 | Client | Same | Selected tick | Fill | `#e5940f` | `#fca311` | Token |
| 8 | Client | Same | Row dividers | Border | 1px `#edf3f0` | none | Token |
| 9 | Client | Same | Menu | Shadow | Drop Shadow/300 | `0 4px 16px rgba(32,30,25,.12)` | Token |
| 10 | Client, console | Audience forecast (`1518:91112`, `1645:133969`, `2325:214318`) | "Check Participation Forecast" | Text colour | text-subtitle `#5e5d5b` | text-title `#201e19` | Single screen (two apps) |
| 11 | Client, console | Same | "TIER DISTRIBUTION" | Font size | 14px (Lables) | 12px (`label`) | Single screen (two apps) |
| 12 | Client, console | Same | "COMING SOON" in the tier row | Font size | 16px | 14px | Single screen (two apps) |
| 13 | Client | Report Participant (`2313:83208`) | Close button | Border colour | `#d0d0d0` | stroke-input `#e9e8e7` | Single screen |
| 14 | Client | Same | Close icon | Colour | text-subtitle `#5e5d5b` | text-title `#201e19` | Single screen |
| 15 | Client, console | Shell sidebar | Account card avatar | Image | A photograph | A drawn figure on green-100 | Deliberate |
| 16 | Console | Reported study detail (`2314:147794`, `2317:156640`) | Reports summary card | Fill | yellow-30 `#fff7ea` | yellow-40 `#fff3e0` | Single screen |
| 17 | Console | Withdrawals (`2317:159697`) | Payouts Pending count, total value | Text colour | Brand/Secondary `#3fb984` | state-success `#14ae5c` | Single screen |
| 18 | Console | Withdrawals | Summary card | Fill | bg-1 `#f8f8f7` | bgAlt-1 `#f5f9f7` | Single screen |
| 19 | Console | Withdrawal detail (`2317:160127`) | Amount | Text colour | `#3fb984` | `#14ae5c` | Single screen |
| 20 | Console | Withdrawal detail | "Confirm Withdrawal Payout" banner | Fill | `#fcf2da` (console `state.warningBg`) | yellow-40 `#fff3e0` | Single screen |
| 21 | Console | Edit Study, About (`2325:214086`) | Duration slider | Filled track | yellow-400 `#fdb541` | brand-primary `#e5940f` | Single screen (the `Range` part, also row 22) |
| 22 | Console | Edit Study, Study (`2325:214849`) | Incentive slider | Filled track, opacity | `#fdb541`, 100% | `#e5940f`, 60% | Colour: single screen. Opacity: deliberate (locked, D33) |
| 23 | Console | Edit Study, About | Group session switches | Opacity | 100% | 50% (disabled) | Deliberate (type locked, D7) |
| 24 | Console | Changes Published (`2325:215424`) | Success disc | Fill | `#d3f8d7` (`state.successBg`) | green-100 `#c3e9d9` | Single screen |
| 25 | Console | Same | Tick badge | Fill | `#009951` | `#14ae5c` | Single screen |
| 26 | Console | Edit Study, every dropdown (Audience) | Menu | Shadow | Drop Shadow/300 | none (border only) | Token |
| 27 | Console | Edit Study, Screener and Create Survey | Question action | Icon | Kebab (⋮) | Bin | Deliberate (clash list 3.6) |
| 28 | Respondent | My Profile (`979:74128`) and every respondent screen | Labels and subtitles | Text colour | `#d0d0d0` | `#e1e1e1` | Token |
| 29 | Respondent | Same | Helper and body text | Text colour | `#9e9e9e` | `#b9b9b9` | Token |
| 30 | Respondent | My Profile, every input | Input | Border colour | `#2d2b28` | `#282d2b` | Token |
| 31 | Respondent | Same | Input | Fill | bg-1 `#15130f` | none (bg-0 `#0c0800` shows) | Token |
| 32 | Respondent | My Profile | Picture and video consent switches | Present | not drawn | shown | Deliberate (decided 21 Oct) |
| 33 | Respondent | Report Study sheet (PNG "Report Study", no Figma node) | Reason rows | Border | bottom divider only | 1px `stroke-3` `#282d2b` on all four sides | Single screen |
| 34 | Respondent | Same | Sheet | Border | none | `stroke-3` outline | Single screen |
| 35 | Respondent | Study Detail (PNG "Survey - Study Detail", no Figma node) | How It Works card | Fill | `#0e1107` | bg-1 `#15130f` | Single screen (from a PNG) |
| 36 | Respondent | Same | Reward and Duration icon tiles | Fill | `#241702` | `#352202` | Single screen (from a PNG) |
| 37 | Client | Overview (`1645:131436`) | Recruitment funnel, the two connecting shapes | Fill | yellow-300 `#fdc160`, yellow-500 `#fca311` | `#fdc876`, `#f1a528`, hard-coded hexes that are not tokens | Single screen |
| 38 | Console | Manage, Overview (`1932:106948`) | Recruitment funnel, the two connecting shapes | Fill | yellow-300 `#fdc160`, yellow-500 `#fca311` | not drawn (three blocks only) | Single screen |
| 39 | Client, console | Overview | "AI Super Insight" card | Gradient start | `#f9f1e3` (not a variable) | yellow-30 `#fff7ea` | Designer |
| 40 | Client | Report has been submitted! (`2313:82805`) and Study has been re-published! (`2317:163859`); every client success dialog using `SuccessMark` | Success badge | Border | 4px Brand/Primary `#e5940f` ring around a yellow-500 disc | no ring, darker bottom edge instead | Token |

### Totals

| Kind | Count | Rows |
|---|---|---|
| Token-level fix | 14 | 1, 3, 6, 7, 8, 9, 26, 28, 29, 30, 31, 40, plus the two token rows Title-L line height and `label` size (B1) |
| Single-screen fix | 21 | 5, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22 (colour), 24, 25, 33, 34, 35, 36, 37, 38. Rows 10 to 12 are the same fix in two apps |
| Deliberate | 5 | 15, 22 (opacity), 23, 27, 32 |
| Needs the designer | 3 in the table, plus 4 token questions | 2 (is a tertiary button transparent everywhere?), 4 (black wordmark, not a token), 39 (insight gradient start, not a token); and Figtree, APP/Body/Text-Regular at −1%, the Neutral (P) name clash, and the sds colours inside menus (B1, B2) |

**The eleven screens added in the second pass.**
- **Client:**
  - Billing States `2317:163459`;
  - Pause Study Participation? `2317:163002`;
  - Report has been submitted! `2313:82805`;
  - Study has been re-published! `2317:163859`. This frame is named "Report has been submitted!" in Figma but draws the re-published dialog;
  - Overview `1645:131436`;
  - Recruited respondent result `1645:132785`.
- **Console:**
  - Manage Overview `1932:106948`;
  - Pay `2323:212472`;
  - Revisions History. The console Manage section has no Revisions History frame (the tab mirrors the client's), so it was compared against the client frame `2322:211934`;
  - Reports are resolved! `2314:147752`.

Beyond rows 37 to 40, these screens show only differences already in the table:
- **the tertiary button stroke (row 1):** Pause Study, Recruited respondent result, console Overview;
- **the client tab underline (row 3):** Overview, Recruited respondent result;
- **the wordmark (row 4):** Overview, Recruited respondent result;
- **the drawn avatars (row 15):** every one of these screens.

Console Pay, console Revisions History, Reports are resolved! and the Billing card matched on colour, line and border. The console's tab underline already uses brand-primary, so row 3 is client-only.

Where a row is a component used on many screens (CheckPicker, the tab strip, the tertiary button, the respondent Input), fixing it in that component fixes all of them, so it is counted as token-level.

### Shades of one colour (flagged, not acted on)

- **Accent oranges.** Brand/Primary `#e5940f` and Primary/yellow-500 `#fca311` are both used as "the" accent: tab text and underline versus CTA fill and tick.
- **Pale yellows for the same kind of tinted card.**
  - yellow-20 `#f7f4f0`, yellow-30 `#fff7ea` and yellow-40 `#fff3e0`;
  - the console warningBg `#fcf2da`;
  - yellow-alpha-20 (`#fcebcd` on white).

  The reported-study summary card, the stopped-study banner and the withdrawal confirm banner each use a different one.
- **Greens.** Brand/Secondary `#3fb984`, sds positive `#14ae5c` and `#009951` are all used for "success" or money figures.
- **Light greys.**
  - Text/subtitle `#5e5d5b`, the sds secondary text `#757575`, and the console's `subtitleStray` `#777777`;
  - for borders: Stroke/input field `#e9e8e7`, tertiary stroke `#d0d0d0`, stroke-1 `#edf3f0`, stroke-2 `#e3edea`, and an unvariabled `#dddddd` on the frame hairlines.
- **Divider greys inside the Billing card (`2317:163459`).** Figma uses both stroke-1 `#edf3f0` and stroke-input `#e9e8e7` in the same card; the build uses one.
- **One value, two names.**
  - BG/secondary/bg-2 and Stroke/stroke-1 are both `#edf3f0`;
  - in the respondent set, Neutral (P)/neutral-700 and Stroke/input field are both `#2d2b28`.

### Red used for something that is not an error (flagged, not acted on)

- **Edit Study, Screener (`2325:214502`):** the "Incorrect" verdict in an option's select is red.
- **Create Survey (`2325:214997`):** the "Disqualify" verdict is red.

Both mark an answer that screens someone out, which is a choice the client makes, not an error. No other audited frame uses red.

---

## Not covered by this audit

- **Hover, active, focus and disabled states.** The audited frames draw none of these, apart from disabled buttons in two places, so there is nothing in Figma to compare against.
- **Screens with no Figma node, PNG export only:**
  - **Respondent Report Study and Study Detail:** compared against the PNGs (rows 33 to 36), with lower confidence.
  - **New Study dialog and Stuck? Need Help?:** not audited.
- **Icon stroke weight and size.** Checked by eye only: Figma's Element sizes (16, 20, 24) match the build's icon sizes, and no stroke-weight difference was visible. Not measured.

## Outside scope, noted only

- **Release Payout:** a 48px (lg) button in Figma, 38px in the build. Withdrawals' "Review" has a chevron in Figma; the build has none.
- **Report Participant:** Figma draws Submit enabled with an empty description; the build disables it until something is typed (behaviour).
- **Reported study:** it opens on the Client Details tab in the build. Frame `2314:147794` shows the Study tab first.
- **Withdrawal detail:** the participant's avatar is larger in Figma.
- **Profile Tiers copy:** "Gold Tier" and "70 to 90" in Figma; "Gold Tier and above" and "70+" in the build.
- **Misnamed Figma node:** `1666:128049` is called "Profile Tiers" but is a saved-card picker.
