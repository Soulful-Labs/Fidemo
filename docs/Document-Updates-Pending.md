# Document updates pending

Applied on 23 October 2026, twice: after the overnight client round, and after the respondent audit fixes. `PRD-Focus-Insite-Platform-v2.md` and
`BRD-Focus-Insite-Platform-v2.md` (repo root) describe the build after the
rounds of 21 and 22 October 2026, including the client round finished
overnight, and PRD Section 6 reproduces
`docs/Trust-and-Rewards-Policy-v2.html`. The originals are unchanged.

Five decisions are open and recorded as open in PRD Section 16: the deposit
(D32), the team re-pricing a live study (D33), the Audience forecast (D34), the
domain, support address and certificate prefix (D35), the diary's units
and frequency (D36). A diary entry per calendar day (D37) and audience fit
(D38) are decided and built, and the Trust Score floor rule (D39) is
confirmed. The BRD lists the open ones in Section 4.3.

The full list that was applied is in this file's history in git.

## Outstanding, not yet in the documents

Work that is not built, so there is nothing to describe yet.

- **Icons and graphic assets** (decided 22 October 2026, on hold). Each app
  draws its own icons, not the Figma ones. Counted: 84 distinct icons across
  the three Figma pages (console 58, client 58, respondent 51; console and
  client share 51, and 24 are in all three). Drawn by hand today: console 54,
  client 51, respondent 26 plus a few inline. Illustrations, badges and
  empty-state pictures have not been counted.
- **Selected radios and checked checkboxes** follow Figma's yellow-600 in the
  console. No sweep of every other screen in the three apps has been made.
- **Spacing** was matched on the screens changed in the 22 October client
  rounds only; no full sweep.
- **Colours per element** could not be compared automatically: Figma's
  metadata carries sizes, not fills. The token values match Figma's
  variables; raw colours that had a token now use it. Those with no token
  (amber Disqualified and No-show pills, the orange account alert, the
  success disc on Published, the dark attachment placeholder in chat, the
  pink paused banner) are left as measured.
- **Fonts**: matched against Figma's own text properties (family, weight,
  size, letter spacing, line height, colour) on 35 client screens and panels.
  What is left: the Payments chart labels, which Figma sets in Inter, a font
  outside the system (the build keeps Geist), and texts whose words appear
  in more than one place, which the automatic match cannot pair. Screens
  whose text is mostly seeded content were matched only on their labels.
- **The dashboard picture on the client landing page** was not retaken (it
  needs the settled demo state); its sidebar shows Studies expanded and the
  older black wordmark.
- **The respondent's own reviews.** The respondent app has no screen for the
  reviews clients wrote about them.

## Difference list, client round of 23 October 2026

Built as the PNGs draw it, and different from what was decided before:

- **Reversal: the 3% merchant processing fee line** is back on Payment &
  Publish and Payment ("3% merchant processing fee applies when using a
  credit card. Learn about payment options"). It was removed on 13 October
  2026. It is shown only; nothing charges it.
- **Reversal: "To be auto-debited by [date] by [card] **** 4242"** is back on
  the Pay tab in Billing. It was left out on 13 and 15 October 2026 because
  nothing debits a card on its own. It is shown only; Pay Bill is the payment.
- **The old and new pricing are both on screen.** The Create flow's Study step
  (left exactly as it was) still draws Incentive Payments, Costing Summary and
  Payment from the old fee schedule; Payment & Publish, one step later, draws
  the new rate x participants. The console's Pricing & Rewards still sets the
  old fees. To be decided what comes out.
- **When the 30% is taken** is the build's choice: when the team takes the
  study live. The frames say only "As on [date]".
- **A second rate period** ($250, then $350) appears only in the seed (on
  Travel preferences and experiences). Nothing in the app changes a rate until
  the rate sheet exists.
- **Save this card** makes the added card the default. A card used to publish
  is always kept for invoices, as the fourth note says.
- **A client with a saved card** still sees it selected on Payment & Publish
  (decision of 15 October); the drawn form is behind "Use a different card".

## For the designer

- No Show is −4, not the −2 drawn on Edit Trust Score (`2058:196166`).
- Not drawn, built: the question menu with its Required toggle and the
  respondent's "(optional)" marker; "Publish these changes live?" on Pricing &
  Rewards; the console's client deactivation refusal; the Billing banners for
  a study stopped by the team or filled on its own.
- Edit Tiers' fields read Silver Tier, Gold Tier, Platinum Tier.
- The client lock-up carries the H mark, where Figma draws the wordmark alone.
- Work Function has no drawn list; it offers the participant profile's work
  functions.
- Completion Verification is worded for the one verification PIN; Figma speaks
  of check-in and check-out codes.
- Edit Study in the study options menu, and the Edit buttons on Manage
  Study, are drawn and deliberately not built this round.
- Undo beside a session read-back: the client follows its frames
  (1769:86063, 1627:106074: Undo), the console its own (1952:79377: Mark
  Completed beside "Marked as No-show"). The same action reads two ways; one
  is probably wrong.
- The Create flow is four steps with pricing inside the Study step, as the
  frames draw it; this changes the 15 October decision of a separate
  Pricing step. The frames' AutoPay switch and "25% of cost" rows stay out.
- Video Result: no recording exists until a video provider is connected; its
  buttons say so. Needs a drawn empty state.
- The notes editor's formatting row inserts plain-text marks.
- Help's reply-time lines come from the workflow; no frame draws them.
- The HumanLayer wordmark is Text/body grey in all three apps by decision
  (23 Oct 2026); Figma draws the client's black.
- The Payments chart labels are drawn in Inter, outside the Geist system.
- Red for a neutral state: the Paused study banner (1704:143783) is drawn
  pink-red, though pausing is not an error. Built as drawn; please review.
- The 30% stage is "Incentive deposit" on Payment Breakdown and "Recruitment
  Cost" on the Pay screens. Each keeps its own word; one name would be
  clearer.
- The frames' money figures are placeholders that do not add up ($1,800 is not
  30% of $5,000; Deposit Paid $2,800). The build derives every figure.
- Not drawn, built: an empty group's line ("No studies in this group yet"),
  the "Available groups" empty line ("No groups yet"), the Create Group error
  for a blank or repeated name, and Contact Us To Edit opening an email.
- Payments' paid-all dialog keeps the frame's typos ("and and", "has been
  cleared").
- Needed: a Cancel Session control for a one-to-one booking in the console,
  and a per-seat Cancel on a group session in the client app.
- Respondent audit fixes (23 Oct 2026), drawn one way and built another:
  - No selfie anywhere: the Identity step's selfie field (915:50280),
    Account Settings' Selfie Verification row and "Human Verified" tag
    (979:74209), and the console's "Selfie photo verified" lines and
    "Human Verified" tags are gone. The certificate is headed "Identity
    Verified" where Figma draws "Verified Human". Every frame drawing them
    needs redrawing.
  - Welcome reads "Your ID is in review" with a line on what happens next,
    where Figma draws "You are verified!".
  - Session code: a new banner state, "Your code is in! #407060 / Waiting
    for the interviewer to confirm it", and the PIN success text says the
    same. Submit PIN is disabled until the session starts. Not drawn.
  - Sign In prints the demo login under the form. Not drawn.
  - Account Settings shows the ID's real files and sizes, an Upload New ID
    button and a review line; My Profile shows the licence's review line.
    Not drawn.
  - The date picker's "Only available dates are shown" now reads "Dates with
    no open sessions are greyed out", because unavailable dates are shown.
  - Deactivate Account: "cannot be undone" removed, since the same text
    offers 30 days to reactivate.
  - A late withdrawal says it is running late instead of showing a past
    "Expected in bank by" date. Not drawn.
  - In Process reads "$N reward" over "Awaiting payout. The team processes
    it when the study finishes."
  - "In Top N%" is derived, and shown under Gold and Platinum only. Silver
    has no percentile line at all (decided 23 Oct 2026): every frame that
    draws "In Top 50%" under Silver needs it taken out.
  - The schedule invitation is titled "You're invited to schedule your
    session!" where it read "You've been selected to complete!".
  - A completed diary day opens read only. Not drawn.
  - A locked diary day reads "Opens Oct 25" in the day list, and its own
    screen says "Day N opens on Oct 25, 2026"; when nothing open is left,
    the resume button reads "Day N opens Oct 25". Not drawn.
  - The match score explainer's "Tip: Higher the score, faster you get
    qualified and earn!" is removed (the build does not do it); the frame
    needs it taken out. A study open to everyone shows no match score.
  - Not drawn: "This study is for a different audience" (the refusal when
    someone outside a study's audience applies, with Update Profile), and
    the "Open to everyone" audience pill on Manage and Review.
  - Console: "Submitted for review" and "Waiting for your decision" on a
    verification waiting for the team. Not drawn.
- Changes of 23 Oct 2026 (later round):
  - Client pop-ups open in the centre of the screen; long scrollable panels
    (a participant's profile, Notifications, Invoice Details) are full-height
    sheets on the right edge. Notifications was drawn as a floating card
    (1518:71845); it is now a sheet.
  - The client Account page has no Payment Method section; the console has
    no entrance screen (/internal is sign in).
  - The How It Works copy on Study Details is as given; its "14 days after
    the study ends" is the policy's payout window.
  - Not drawn: Finance > Payouts' "Pay within 14 days" column (days left,
    Due today, Overdue by N days in red), its Overdue count, and the console
    dashboard's "Payouts overdue" group.
  - The client's Needs Your Attention panel is removed: View All was taken
    off the dashboard earlier, and Super Insights pages through every item.
