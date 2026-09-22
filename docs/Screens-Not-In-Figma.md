# Screens and pieces not in Figma

Everything below exists in the app but has no frame in `Q83MnpAyJuc6RttXYbWudH`. Each was built from the design tokens in `tailwind.config.ts` and an existing drawn screen as the model. The copy is ours and has not been through design. Items marked **NEW PATTERN** have no drawn equivalent at all and are the ones to look at first.

Also worth settling in Figma: the Get Started dashboard frame's bottom nav reads **Home / Studies / Wallet / Menu** while every other frame reads **Dashboard / Studies / Wallet / Profile**. The app uses the latter everywhere.

---

## Full screens

### Quick Eligibility Check — NEW PATTERN
- **What:** three pre-screener questions with pre-set passing answers, asked before the full screener (workflow 28). Nothing is saved; no draft is created.
- **Where:** `/studies/:id/screener`, the first stage.
- **Reached by:** Apply / Accept & Apply on any open study.
- **Modelled on:** Screener Questions (919:74274), the same `QuestionFlow` component, progress "1/3", the same option rows and back / Continue pair.
- **Copy:** title "Quick Eligibility Check"; note "3 questions decide if this study is a fit. Pass them and the full screener opens. This part is not paid."; last button "Check eligibility".
- **Code:** `src/screens/studies/questions/PreScreener.tsx`

### Not a match — NEW PATTERN (part of the eligibility flow)
- **What:** what someone sees on failing the eligibility check.
- **Reached by:** a wrong answer on the Quick Eligibility Check.
- **Modelled on:** Completed successfully! (919:76063) via `SuccessScreen`, with the brand-yellow badge instead of the green tick.
- **Copy:** "Not a match this time" / "Thanks for checking. This study is looking for a slightly different group, so we won't take you through the full screener." Steps: "Nothing has been saved and no draft was created." "It does not affect your Trust Score." "Other studies that match your profile are waiting in Explore." Button "Back to Explore".
- **Code:** `src/screens/studies/questions/Screener.tsx` (`phase === 'failed'`)

### Redeemed successfully
- **Where:** `/points/redeem/done`. **Reached by:** Redeem on the Confirm Redeem sheet.
- **Modelled on:** Completed successfully! via `SuccessScreen` on the green palette.
- **Copy:** "Redeemed successfully!" / "You have redeemed {N} points for {$X} to be credited to your wallet within 2 working days." Button "Done".
- **Code:** `src/screens/points/Redeem.tsx`

### Not Found
- **Where:** any unknown route. **Reached by:** a stale or mistyped link.
- **Modelled on:** the drawn empty states via `EmptyState`, under a standard title bar.
- **Copy:** title bar "Page not found"; "We can't find that page"; "{path} is not part of the app. The link may be out of date, or the study it pointed to has closed."; buttons "Go to Dashboard" / "Explore Studies" (signed in) or "Sign in".
- **Code:** `src/screens/NotFound.tsx`

### Score History
- **What:** every line the Trust Score is made of (policy section 1), newest first, each row opening the study it came from.
- **Where:** `/trust-score/history`. **Reached by:** "View All" under "Score history" on Trust Score Details, which shows the newest three rows.
- **Modelled on:** Earning History (969:29004 family): range dropdown, a second dropdown for Gains / Deductions, rows on the green surface with the "+4%" / "-2%" pills from Trust Score Rules.
- **Copy:** title "Score History"; filters "All Time / This Month / Last 3 Months / This Year" and "All / Gains / Deductions"; row labels "Onboarding", "Study completed", "5-star client rating", "No show", "Late show up", "Cancelled session"; empty state "Nothing in this range".
- **Code:** `src/screens/trust/ScoreHistory.tsx`, preview in `TrustScoreDetails.tsx`

### Silver tier screen
- **What:** the Silver version of the drawn Gold (1433:50005) and Platinum (1433:49079) tier screens.
- **Reached by:** nothing in the app — Silver is the floor everyone starts on, so a person can only arrive at it by a downgrade, which is not celebrated. It renders from the kitchen sink (`/kitchen-sink`, Celebrations).
- **Modelled on:** the two drawn tier screens exactly, with the star glyph and `tier.silver`.
- **Copy:** "Congratulations!!" / "You've reached to Silver Tier!" / "Your Trust score is 50" / chip "Silver, You are in Top 50%" / Benefits: "You're rising on your way up!" (Silver's line from How Tiers Works) / "Yayy! Start Earning More!".
- **Code:** `src/app/TierUpgrade.tsx`

---

## Sheets and pickers

Reject Invitation? (1433:48849) and Remove Bank Account? (1327:86970) do have frames and are built to them; they were listed as undrawn in an earlier report by mistake.

### Sort sheet
- **Where:** Explore, Earning History, Reward Points. **Reached by:** the sort icon.
- **Modelled on:** Select Payout Method (the drawn radio-row bottom sheet).
- **Copy:** "Sort by"; "Default / Price: High / Price: Low / New First / Old First".
- **Code:** `src/screens/studies/SortMenu.tsx`

### Coming Soon
- **Reached by:** the intro video on Get Started, Terms / Privacy on Sign Up, "Sign up as a researcher client".
- **Modelled on:** the drawn bottom sheet (Consent) with a single Got It! button.
- **Copy:** title is the thing named ("Intro video", "Terms of use"…); "This part of the prototype is not built yet. It will live here when it is." / "Got It!".
- **Code:** `src/app/ModalHost.tsx`

### Date of birth calendar
- **Reached by:** the calendar icon on About You and Account Settings (typing DD / MM / YYYY still works).
- **Modelled on:** the drawn picker sheet (Select Education Level) for the frame; the week strip on Schedule Study Call for the day grid.
- **Copy:** "Date of Birth"; month steppers; year dropdown; "Save".
- **Code:** `src/components/ui/DatePicker.tsx`, `DobField.tsx`

### Phone country code picker
- **Reached by:** the "+1 ⌄" prefix on the Phone field in Account Settings (the frame draws "+191 ⌄").
- **Modelled on:** Select Industry (the searchable picker).
- **Copy:** "Country code"; "Search country..."; "United States (+1)" … twelve countries.
- **Code:** `src/components/ui/PhoneField.tsx`

### Match score explainer
- **Reached by:** the green match-score badge on any card or detail.
- **Modelled on:** What these details are for? (the drawn info modal).
- **Copy:** "Study matching score" / "It shows how much this study is relevant to your profile for you." / "Tip: Higher the score, faster you get qualified and earn!" / "Got It!".
- **Code:** `src/app/ModalHost.tsx`

---

## Blocked states — NEW PATTERN (all three)

All three use the Cancel Study? modal frame: centred title, body, a "Not now" tertiary button and one action.

### Verification needed
- **When:** Apply on any study before the profile and ID are done (workflow 15).
- **Copy:** "Finish verification to apply" / "Applying needs a completed profile and a verified government ID. It takes about 2 minutes and is done once, then reused for every study." / "Not now" / "Verify now" → About You.

### Premium credential needed
- **When:** Apply on a premium study without a verified professional credential (workflow 17).
- **Copy:** "Premium study, locked" / "Premium studies are the highest paid on the platform and need a verified professional credential, such as a medical or nursing licence, checked against the public register." / "Not now" / "Add a credential" → My Profile, Professional Info.

### Repeat rule blocks them
- **When:** Apply on a study set to exclude previous participants of that client (workflow 57), unless the client invited them.
- **Copy:** "Fresh participants only" / "{Client} has set this study to exclude anyone who has taken part in one of their studies before, and you have. Other studies from this client may still be open to you." / "Not now".
- **Code:** `src/lib/eligibility.ts`, `src/app/ModalHost.tsx`

---

## Pieces inside drawn screens

| Piece | Where | Modelled on | Copy |
|---|---|---|---|
| Premium banner and card line | Study Details (top), study cards | The drawn state banners; the card's type-tag row | "Premium study, locked / unlocked"; "Premium studies are the highest paid on the platform…"; button "Add a credential"; card line "Premium, needs a verified credential" / "Premium study" |
| Repeat rule row | Study Details, under the tiles, open studies only | The Get Support row surface | "Repeat participants welcome" / "Fresh participants preferred" / "First-time participants only" with one explanatory line naming the client |
| Share study link row | Study Details, under the description | The timeline row | "Share study link HL-023-D"; tap copies `/studies/:id?src=HL-023-D`, toast "Link copied (code HL-023-D)" |
| Outcome line on banners | Study Details banner (workflow 34) | The drawn banner's aside | dot + "Under consideration, check back for the outcome" / "Selected" / "Not selected" / "No show" / "Late show up" |
| **Tax form banner — NEW PATTERN** | Wallet, under the balance card, once $600 has been earned in the year (workflow 49); Withdraw is blocked with the reason | The drawn yellow-tinted study banner + the drawn upload box (About You) | "Tax form needed before you withdraw" / "You have earned $835 on HumanLayer in 2026, past the $600 point where a tax form is required. You can keep earning, and withdrawals open again as soon as the signed form is with the team." / upload "Upload signed tax form", ".pdf, .jpg or .png" / after: "Tax form for 2026 on file" |
| Pending client approval | Timeline on Study Details ("Client approved payout" step); Wallet line under Withdraw | The drawn timeline rows; the "All Time Earned" line | "$240 awaiting client approval, then it moves to your balance" |
| Joined via link | Account Settings, above the settings rows | The drawn helper line | "Joined via link HL-013-B on Jul 29, 2025" |
| Late Show Up banner | Study Details for a late show | The drawn Paid banner | "Late Show Up" pill, "Paid $160, -2 Trust score", "You took part but arrived late, so the session was marked as a late show up. You are paid in full; the policy deducts 2 from your Trust Score. Reward points are never deducted." |
| Not needed banner | Study Details for a turned-up-but-not-needed session (workflow 44) | The drawn Paid banner | "Not needed" pill, "Paid in full, $190", "You turned up but the session was over-recruited and you were not needed this time. You are paid in full and your Trust Score is unaffected." |
| Topic chips and reply time | Contact us (chips), Support Chats rows, Support Chat strip (workflow 56) | The drawn Gender chips; the drawn status tag row | "What is it about?" "About money" / "Something else"; "You get an automatic first answer from our guides straight away. A person replies within 2 working days."; rows "reply within 1 working day"; chat badge "Automated reply from our guides" |

---

## Also undrawn, for completeness

- The **"vs last month"** caption under the This Month delta on the dashboard.
- The **Complete Study** button's blocked state on a code-confirmed session before it starts: toast "Your session starts Fri, Sep 25 • 10:30 AM ET. Complete the study once it has run."
- The **diary day list** (`/studies/:id/diary`) with Completed / Up next / Locked rows; Figma draws only the diary detail and one day.
- **Study card "Get Directions"** on in-person booked cards (the frame draws Join Call on a video call).
