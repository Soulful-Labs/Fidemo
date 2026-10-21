# Document updates pending

Where the build now differs from `PRD-Focus-Insite-Platform.md` and
`BRD-Focus-Insite-Platform.md`, after the design rounds of 19 and 21 October
2026. Neither document was edited during those rounds. This file is the list to
update them from.

Each item gives:

- **Document says**: the current text, quoted or closely paraphrased, with its section.
- **Build does**: what the three apps do now.
- **Where**: the code and, where there is one, the Figma frame.

Items are grouped by document, then by section in document order. An item that
touches several sections is listed under each, with a pointer back to the
first. Part 3 is the second list: places where the 19 and 21 October frames
disagree with something decided earlier, and what the build kept.

Nothing here changes a Trust Score value, a tier threshold, a point value, a
redemption rule or a fee.

---

## Part 1. PRD-Focus-Insite-Platform.md

### §5.1 Study lifecycle

**1.1 A completed study can be reopened while its balance is unpaid**
- **Document says:** `completed` row: "Nothing. Read only, downloads still work." The state diagram has no move out of `completed`.
- **Build does:** `completed → recruiting` is a legal move, offered to the client as **Re-publish and Recruit**. It is allowed only while the study has no balance payment and no refund (`canReopen`). Reopening clears `completedAt` and withdraws the team's "payouts ready" notice. No amount changes. Once the balance is paid the button is gone. The balance falls due again on the same rule (1.10) when the study is next completed.
- **Where:** `shared/lifecycle.ts` (`STUDY_MOVES.completed`, `canReopen`), `shared/store.ts` (`moveStudy`), client Pay tab and `RepublishModal` (`client/src/screens/studies/StudyMenus.tsx`).

**1.2 A live study can be edited by the team**
- **Document says:** "A study cannot be edited after it goes live. No edit control exists on any live study in either app; every one drawn is switched off in the design, and the console's study-editing screens are a discarded section. See D7."
- **Build does:** the console edits a live or paused study (Edit in the study's options menu, then four steps: About, Audience, Screener, Study, then Publish, then Changes Published). Locked, shown read only, and refused by the store:
  - the study type;
  - the incentive;
  - the number of participants;
  - availability, addresses and sessions people may have booked.

  Everything else can change: title, description, duration, end date, thumbnail, the whole audience, the screener, and survey or diary questions. Each edit is recorded with its author (`StudyEdit`, `by: 'team'`). The client still cannot edit a live study.
- **Where:** `shared/store.ts` (`editLiveStudy`), `shared/studyForm.ts` (`liveEditFault`), console `internal/src/screens/studies/edit/*`, routes `/studies/:id/edit` and `/studies/:id/edit/done`. Frames 2325:214085 (section), redrawn by 21 Oct 2026.

**1.3 Recruiting past the target**
- **Document says:** `recruiting`: "Target met or team/client acts → `ongoing`, `paused`, `completed`."
- **Build does:** when the target is met, the client sees a "Congrats!" banner with **Recruit more**. Choosing it keeps the study recruiting past its target and sets `beyondTarget`, so the banner is not shown again. It is logged.
- **Where:** `shared/store.ts` (`recruitMore`), `shared/derive.ts` (`showsTargetMet`), client `TargetBanner` in `client/src/components/client/StudyActions.tsx`.

**1.4 Stop-complete asks first**
- **Document says:** marking complete is listed as an action; no confirmation is described.
- **Build does:** Stop-complete Study opens a confirmation ("Yes, Stop-complete") in the client app before the study moves to `completed`.
- **Where:** `StopCompleteModal`, `client/src/screens/studies/StudyMenus.tsx`.

### §5.7 Report and moderation lifecycle

**1.5 Clients report participants, with their own reasons**
- **Document says:** reports come "from either the system or a person". Category: "AI/Bot Activity, Abusive Behaviour, Spam Apply, Wrong Match".
- **Build does:** a client reports a participant from that participant's result page in a study. The client's five reasons are:
  - Was asking to collaborate outside;
  - Participant is misrepresenting their identity;
  - Profession looks like a scam or suspicious;
  - Participant had an inappropriate behavior;
  - Other.

  A description of up to 500 characters is required. The report joins the console's existing participant Reported queue with the client as Reported By. The four original categories remain for system and team reports.
- **Where:** `shared/platform.ts` (`CLIENT_REPORT_REASONS`, `REPORT_MAX_CHARS`), `shared/store.ts` (`reportParticipant`), `shared/types.ts` (`ReportReason`), client `ReportParticipant.tsx`.

**1.6 Respondents report studies: a new object and a new queue**
- **Document says:** reports are about participants only. No report about a study exists.
- **Build does:** a respondent reports a study from its detail screen (**Report**). The respondent's eight reasons are:
  - Client is offering payment outside;
  - Client is misrepresenting their identity;
  - Study looks like a scam or contains a suspicious link;
  - Study contains contact information;
  - Study seems illegal or unethical;
  - Study is unclear or incomplete;
  - This is ad, not a study;
  - Other.

  A description is required. Each report is a `StudyReport`, pending until resolved. In the console, Studies gains a **Reported** list with a badge; a reported study's page shows its reports. From there the team can:
  - **Chat**, which opens one support ticket with the client;
  - **Mark Reports Resolved**, which needs a statement and the signed-in member's password and closes every open report on that study together.

  Nothing changes for the study itself until the team acts.
- **Where:** `shared/types.ts` (`StudyReport`, `ReportResolution`, `PlatformState.studyReports`), `shared/lifecycle.ts` (`studyReportState`), `shared/store.ts` (`reportStudy`, `chatAboutReports`, `resolveStudyReports`), `shared/platform.ts` (`STUDY_REPORT_REASONS`), respondent `src/screens/studies/detail/ReportStudy.tsx`, console `internal/src/screens/studies/reported/*`, routes `/studies/reported` and `/studies/reported/:id`. Frames 2314:146859 (console), respondent PNGs of 19 Oct.

### §5.9 Money objects

**1.7 Withdrawal payout states**
- **Document says:** Payout: "Requested → Processing → Paid. $2 fee per withdrawal." And: "The console's Finance module lists payouts but offers no approve, hold, release, retry or status control."
- **Build does:** a withdrawal is created `pending`. Its states are `pending`, `approved`, `held`, `paid` and `failed`, with the legal moves in `PAYOUT_MOVES`. The console's Finance > Payouts tab lists withdrawals with a detail page and **Release** (pending to paid), which records `releasedAt` and `releasedBy` and is team-only. **Release is the only action with a screen.** Approve, Hold, Retry, and the `held` and `failed` states exist in the model with no screen. The respondent still sees "Processing" while pending and "Completed" when paid (old records are mapped).
- **Where:** `shared/types.ts` (`PayoutStatus`, `Payout.releasedAt/releasedBy`), `shared/lifecycle.ts` (`PAYOUT_MOVES`, `payoutState`, `canMovePayout`), `shared/store.ts` (`requestPayout`, `releasePayout`), `shared/derive.ts` (`withdrawals`), console `internal/src/screens/finance/Withdrawals.tsx` and `WithdrawalDetail.tsx`, route `/finance/payouts/:personId/:payoutId`. Frames in 2051:154237.

**1.8 Study incentive payouts sit under the same tab**
- **Document says:** Payouts are "listed and only listed".
- **Build does:** Finance > Payouts shows Withdrawals first, then the existing study-incentive processing section (finished studies with participants still to pay, Process Payouts).
- **Where:** `internal/src/screens/finance/Finance.tsx`.

**1.9 Invoice: no auto-debit stated in the console**
- **Document says:** Invoice "Pending → Paid (manually, or auto-debited on the due date)".
- **Build does:** the console's Pay tab no longer says anything is auto-debited. Its Invoice button downloads a PDF. The client's money screens also say "Due Date", not "Due Date (auto-debit)" (an earlier round).
- **Where:** `internal/src/screens/studies/manage/PayTab.tsx`.

**1.10 When the balance falls due**
- **Document says:** a due date exists, but no rule for it is stated.
- **Build does:** the balance is due 7 days after the study is completed (`balanceDueBy`). A reopened study (1.1) has no due date until it is completed again.
- **Where:** `shared/derive.ts` (`balanceDueBy`), `client/src/mock/pay.ts`.

### §6.7 Consent on a participant's picture and video

**1.11 The points hint is no longer shown on My Profile**
- **Document says:** points are earned for adding the picture or video (25 and 75), consent off by default.
- **Build does:** the rule is unchanged and still applies. The My Profile screen no longer shows the "Add one to earn N points" lines (the 21 Oct frame does not draw them). Both consent switches stay on the screen, under the picture and the video (the frame does not draw them).
- **Where:** `src/screens/profile/MediaFields.tsx`. Frame 979:74128.

### §7.6 Profile tab

**1.12 My Profile, Profile Details tab, redrawn**
- **Document says:** `/profile/edit`: "My Profile, two tabs. Includes the profile picture and the intro video, each with its own consent control."
- **Build does:** the order is now Profile Picture, Full Name, Intro Video, Gender, Address, Area Type, then About Me.
  - **Picture:** a square picture, Change Picture (or Upload Picture) and Remove on one row, with its consent switch under it.
  - **Intro video:** the upload box from onboarding ("Upload Short Video", "Share about you, what you do, your interests, etc.", ".mp4 file | 50 MB max."). Once a video exists, its player and Remove Video appear, with the consent switch under them. Any video format is accepted; ".mp4" is shown as drawn but not enforced.
  - **Kept, though the frame hides them:** About Me, Pets and "Are you a home owner?", because they count towards profile completion and so towards the 50 full-profile points.
  - **Real photo:** the frame draws one; the build shows initials until the participant adds a picture.
- **Where:** `src/screens/profile/ProfileDetailsTab.tsx`, `MediaFields.tsx`, `src/components/app/FileField.tsx`. Frame 979:74128.

### §7.7 Modals and sheets

**1.13 Report Study sheet**
- **Document says:** the list of modals and sheets has no report.
- **Build does:** adds Report Study, one sheet in three states: pick a reason, describe it, then "Report has been submitted!". See 1.6.
- **Where:** `src/screens/studies/detail/ReportStudy.tsx`.

### §9.3 Studies (respondent controls)

**1.14 How It Works is collapsed by default**
- **Document says:** "How It Works | Expands and collapses."
- **Build does:** it still expands and collapses. It starts **collapsed** unless the participant has applied to the study.
- **Where:** `src/screens/studies/detail/StudyDetail.tsx`.

**1.15 Report link**
- **Document says:** no report control on a study.
- **Build does:** a **Report** link at the foot of Study Detail opens Report Study (1.6, 1.13).

### §9.9 Profile (respondent controls)

**1.16 Picture and video controls**
- **Document says:** no row for the picture or the video.
- **Build does:** each control saves as it is used:
  - Change Picture or Upload Picture opens the file picker (JPEG or PNG, up to 2 MB);
  - Remove clears the picture;
  - the upload box takes a video;
  - Remove Video clears it;
  - each consent switch saves at once and is disabled until there is something to show.
- **Where:** as 1.12.

### §12 Client app (shell)

**1.17 Sidebar wordmark**
- **Document says:** D11: "The three apps are branded **Focus Insite** … Wherever a user-facing screen, email or certificate names the platform, it reads Focus Insite."
- **Build does:** the client app's sidebar shows the **HumanLayer** wordmark, as the 19 Oct frames draw it.
- **Where:** `client/src/app/AppShell.tsx`. Client frames of 19 Oct.

**1.18 "Stuck? Need Help?" menu**
- **Document says:** §12.8: Help is reached from the navigation; "the only route to a person is that one form."
- **Build does:** a "Stuck? Need Help?" card sits above the account card in the sidebar on every client screen. It opens three items:
  - FAQs Resources (opens Help);
  - Create Support Ticket (opens Ask Support);
  - Book A Call With Us, which opens Ask Support with the subject "Book a call with the team". No calendar or call booking exists.
- **Where:** `client/src/app/StuckHelp.tsx`.

### §12.3 Studies (client)

**1.19 Cards by default**
- **Document says:** "Studies, Ongoing. Table view and card view via a toggle."
- **Build does:** the list opens as **cards**. The table is reached with the toggle (`?view=table`).
- **Where:** `client/src/screens/studies/StudiesList.tsx`.

### §12.4 Create a study

**1.20 New Study dialog**
- **Document says:** Create starts at step 1, About.
- **Build does:** Create Study first opens a **New Study** dialog where the client can write a brief and press Generate and Fill. The shared prompt reader then fills the About, Audience and Screener fields the text names, and reports what it filled. The client can instead choose "Fill from scratch instead" and start from step 1 as before. There is no model: the reader matches words and simple patterns.
- **Where:** `client/src/screens/create/NewStudyDialog.tsx`, `shared/fromPrompt.ts` (moved from the client on 21 Oct so the console uses the same reader).

**1.21 Audience: Experience and Household Income**
- **Document says:** Audience criteria are not listed field by field; §15.2 step 17: "the criteria that decide who matches".
- **Build does:** two criteria added on 19 Oct:
  - **Experience:** Fresher, 1-3, 3-5, 5-10, 10+ years.
  - **Household Income:** $50K or less, $50K - $100K, $100K - $500K, $500K - $1M, $1M+.

  A participant matches when the band they gave on their profile overlaps any band ticked. A participant who gave nothing, or "Prefer not to say", does not match a study that sets the criterion. Both show as chips under the field.
- **Where:** `shared/studyForm.ts` (`EXPERIENCE_RANGES`, `INCOME_RANGES`, `audiencePeople`), client `Audience.tsx`, console `AudienceStep.tsx`.

**1.22 Audience: Ethnicity and Area Type**
- **Document says:** not mentioned.
- **Build does:** two criteria added on 21 Oct, under Age Range, as a dropdown with chips.
  - **Ethnicity:** Asian, Black or African American, Hispanic or Latino, White, Mixed, Other.
  - **Area Type:** Urban, Suburban, Rural.

  These are the same lists the participant picks from on their profile. They live in one place (`AREA_TYPES`, `ETHNICITIES`, `TARGET_ETHNICITIES` in `shared/platform.ts`). "Prefer not to say" is a profile choice but never a target, and matches no study that sets Ethnicity. Neither criterion changes the price. The frames' sample chips ("American", "Filipino American", "Sub-urban") are not in the lists.
- **Where:** `shared/platform.ts`, `shared/studyForm.ts` (`StudyForm.ethnicity`, `StudyForm.areaTypes`, `audiencePeople`, `audiencePills`, `AUDIENCE_LISTS`), client `Audience.tsx` and `ListCriterion.tsx`, console `AudienceStep.tsx`. Frames 1518:91112, 1645:133969, 2325:214318.

**1.23 How criteria combine**
- **Document says:** D23 describes when matching runs, not how criteria combine.
- **Build does:** a participant must match **every category the study sets**, and **any one option within each category**. Example: industries set and roles set means at least one industry and at least one role. A category the study leaves empty is ignored. The wording above Work details is "Who qualifies for this study" in the client app and the console. The 21 Oct Edit frame's "Participant will be required to match at least one of below to apply" is not used there.
- **Where:** `shared/studyForm.ts` (`audiencePeople`); checks in `scripts/verify-shared.ts`.

**1.24 Work details order follows each frame**
- **Document says:** not specified.
- **Build does:**
  - **Create** (1518:91112): Work Function, Industry, Role, Experience, Household Income, Skills.
  - **Editing a study in review** (1645:133969) and the console editor: Work Functions, Roles, Skills, Industries, Experience, Household Income.
- **Where:** `client/src/screens/create/Audience.tsx` (`CREATE_ORDER`, `EDIT_ORDER`), console `AudienceStep.tsx`.

**1.25 Participation Forecast: "Coming soon"**
- **Document says:** §12.4 and D15 describe a forecast. The no-match frame gives a "No matching respondents?" block.
- **Build does:** the forecast panel shows "Contact us to check matching participants availability" with **Contact Us**, which opens Ask Support in the client app and Support in the console. Tier Distribution, Average Score, Recommended Incentive and Estimated Time To Fill each read **Coming soon**. No figure is shown.
- **Where:** client `Audience.tsx`, console `AudienceStep.tsx` (`ForecastPanel`).

**1.26 Profile Tiers show the share of participants**
- **Document says:** not specified.
- **Build does:** each tier option in the Profile Tiers picker shows its Trust Score threshold and the share of verified, active participants at that tier or above ("top N% of participants"), counted from the pool.
- **Where:** client `Audience.tsx`.

**1.27 The client's name in the repeat condition**
- **Document says:** not specified.
- **Build does:** the condition reads "Has never participated in any study with [company] (You) before" in the client app, and "Has never participated in any study with [company] before" in the console.
- **Where:** client `Audience.tsx`, console `AudienceStep.tsx`.

**1.28 Industries list is shared**
- **Document says:** §22.11: "The education level list and the industry list are mostly invented … Both need a real list before launch."
- **Build does:** the same industries list now feeds the client's Audience step and the console editor, from one place (`AUDIENCE_LISTS.industries`). The list itself is unchanged.
- **Where:** `shared/studyForm.ts`, `client/src/screens/create/CreateBits.tsx`.

### §12.5 Manage a study (client)

**1.29 Revisions History tab**
- **Document says:** six tabs (Overview, Manage Study, Matched, Recruited, Results, Pay). No revisions route.
- **Build does:** a **Revisions History** tab at `/studies/:id/revisions`. It lists every round of changes to a submitted study, by date, saying who made it (the client, or the team for a live edit) and field by field what changed. Fields are named by Create step ("Audience / Ethnicity: added Asian"). Ethnicity and Area Type are recorded from 21 Oct.
- **Where:** `shared/revisions.ts` (`diffForms`, `studyHistory`), `shared/types.ts` (`Study.edits`, `StudyEdit`, `FieldChange`, `Study.firstSubmittedAt`), `client/src/screens/studies/RevisionsTab.tsx`, `client/src/components/client/RevisionsTimeline.tsx`. Frame 2322:211934.

**1.30 Study menu**
- **Document says:** the row menu is described in §12.3 (Ongoing study options); Pause is the only drawn pause.
- **Build does:**
  - the study header menu carries Copy Study Link, Pause Study or **Resume Study**, Stop-complete Study (with confirmation, 1.4) and Duplicate to Drafts;
  - **Re-publish and Recruit** appears on a completed, unpaid study (1.1);
  - the paused study shares the Overview layout.
- **Where:** `client/src/components/client/StudyActions.tsx`, `StudyMenus.tsx`, `PausedStudy.tsx`.

**1.31 Pay tab: Estimated and Final, and Pay Bill**
- **Document says:** "The Pay tab is a statement, not an approval. It reads Payment Due, Deposit Paid and Total Cost … Its only action is Pay Balance, drawn unpayable while the study is recruiting and payable once it is marked completed."
- **Build does:** the Pay tab is rewritten. Once the study is stopped, it shows two figures, display only:
  - **Estimated:** the quote at the required number of participants.
  - **Final:** what was delivered.

  A credit (deposit above the final bill) reads "Credited to your next study", and only once the study is stopped. While the study runs the deposit simply covers the bill so far. The balance is due by completion plus 7 days (1.10). The deposit transaction reads "Incentive Deposit Paid". The pay action is labelled **Pay Bill**, as drawn, where the document says Pay Balance.
- **Where:** `client/src/screens/studies/PayTab.tsx`, `client/src/components/client/BillingCard.tsx`, `shared/derive.ts` (`billing().estimate`, `balanceDueBy`).

**1.32 Respondent result: report and decided bar**
- **Document says:** the Qualify / Disqualify bar with four states.
- **Build does:**
  - a **Report** row on the respondent's page opens Report Participant (1.5);
  - after a decision, the bar shows the decision with **Undo**.
- **Where:** `client/src/screens/studies/RespondentResult.tsx`, `client/src/components/client/ReportParticipant.tsx`.

### §13.1 The sidebar (console)

**1.33 Studies has two children**
- **Document says:** "Participants expands to All Participants and Verifications. Clients expands to All Clients and Verifications." Studies has no children. "Badges appear on Dashboard and Support."
- **Build does:** Studies expands to **All Studies** and **Reported**. Reported carries a badge: the number of studies with open reports.
- **Where:** `internal/src/app/nav.ts`, `Sidebar.tsx`.

### §14.2 Studies (console)

**1.34 Reported Studies**
- **Document says:** three tabs, To Review, Ongoing, Completed.
- **Build does:** adds the Reported list and the reported study page. See 1.6.
- **Where:** `internal/src/screens/studies/reported/*`.

### §14.3 Review a new study

**1.35 The five further question types are now specified and editable**
- **Document says:** "Five further question types exist: a long text, a slider with Price / Value / Description, a drag-to-rank list, a file upload and a matrix … **Those five question types need designing or specifying before build.**"
- **Build does:**
  - the client builder (earlier rounds) and now the console editor offer nine kinds: Single-select, Multi-select, Single-line input, Number input, Multi-line input, Slider, Ranking, File Upload, Mattrix;
  - in the console editor:
    - **Slider:** Min Value, Max Value, Gap and a Show Gap switch.
    - **Ranking:** numbered items.
    - **File Upload:** File formats (PDF, PNG or JPG, CSV, Any file) and Max number of files.
    - **Mattrix:** columns and rows, Single-select/row or Multi-select/row.
  - the respondent app asks them in the nearest form it has (§22.11).
- **Where:** `internal/src/screens/studies/edit/QuestionBody.tsx`, `QuestionsEditor.tsx`, `shared/studyForm.ts` (`FormQuestion`), `shared/questions.ts`. Frames 2325:214502, 2325:214997.

### §14.4 Manage a study (console)

**1.36 Edit is in the menu; the editor is built**
- **Document says:** "The options menu: Copy Study Link, Pause Study, Duplicate to Drafts. The diary section also shows Stop-complete Study and Edit." And: "Everything that would let the team change a study is switched off … See D7."
- **Build does:** the menu is Copy Study Link, Pause Study (or Resume Study when paused), Stop-complete Study and **Edit**. Edit opens Edit Study, which works as follows (see 1.2 for the rules).
  - **About:**
    - the four type cards, locked;
    - the duration slider, end date, title and description;
    - the thumbnail: upload, change and remove;
    - a participant preview of the study card, with refresh and close, reopened with Preview.
  - **Audience:** every criterion as a dropdown with chips, Fill with AI (never the number of participants), and the forecast panel. The number of participants is shown and locked.
  - **Screener:**
    - Generate and Regenerate All from typed text, through the shared reader, checked as Publish checks;
    - every question kind;
    - drag to reorder; delete with the bin;
    - a screener preview a participant can step through.
  - **Study** (survey and diary):
    - Edit Survey opens Create Survey with "Auto-saved", Upload File (text or CSV, one question a line) and Generate;
    - the edit in progress is kept on this device until Publish or Cancel.
  - **Study** (session types): availability shown and locked.
  - **Study, money:** Incentive Payments, Costing Summary and Payment are read only from the study's own figures. Payment shows the deposit already paid and **To Pay $0**: "Editing a live study changes no amount and takes no payment."
  - **Publish:** saves, records the edit, and opens Changes Published, whose "Done! View Details" opens Revisions History.
- **Where:** `internal/src/screens/studies/edit/*` (`EditStudy`, `AboutStep`, `AudienceStep`, `ScreenerStep`, `StudyStep`, `Preview`, `QuestionsEditor`, `QuestionBody`, `EditBits`, `EditDone`), `internal/src/screens/studies/manage/StudyHeader.tsx`. Frames 2325:214086, 214318, 214502, 214997, 214849, 215424.

**1.37 Revisions History tab in the console**
- **Document says:** six tabs on Manage.
- **Build does:** adds a Revisions History tab, showing each round as "Client" or "You" (the team). Same record as 1.29.
- **Where:** `internal/src/screens/studies/manage/RevisionsTab.tsx`.

**1.38 Overview and Pay redrawn**
- **Document says:** Overview: four tiles, description, share link, Active Since, About Client. Pay: "The client's bill, read only. The only control is Receipt."
- **Build does:**
  - Overview is rebuilt to the 19 Oct frames, with pace from the shared `paceOf`.
  - Pay is rewritten; its Invoice button downloads a PDF. No auto-debit is stated (1.9).
  - The Congrats banner shows the study's own required number.
- **Where:** `internal/src/screens/studies/manage/OverviewTab.tsx`, `PayTab.tsx`, `Banners.tsx`. Frame 1932:106947 section.

### §14.6 Participant verifications

**1.39 Client reports reach the Reported queue**
- **Document says:** Reported By: "System (Algo), or a person". Flagged For: the four categories.
- **Build does:** a client's report on a participant (1.5) appears here with the client as Reported By and the client's reason as Flagged For.

**1.40 Decision dialogs check the password**
- **Document says:** §5.6: Mark Verified "requires … the team member's password"; §14.5: Deactivate requires "the team member's password".
- **Build does:** each password-taking dialog now checks the password of the **signed-in team member**. These are Mark Verified, Restrict, Deactivate and Reactivate on participants, and Mark Reports Resolved on a reported study. A wrong password is refused under the field.
- **Where:** `internal/src/platform.tsx` (`checkPassword`), `shared/store.ts` (`checkTeamPassword`), `internal/src/screens/participants/verifications/dialogs.tsx`, `internal/src/screens/participants/profile/accountDialogs.tsx`.

### §14.9 Finance

**1.41 Payouts tab**
- **Document says:** "Payouts are listed and only listed. No approve, hold, release, retry or status. See D2."
- **Build does:** see 1.7 and 1.8. The withdrawal detail shows the participant, the amount, Date Requested, Reference ID, and the payout account (Bank Name, Account Number, Account Type), with Release. Releasing confirms "The transaction of [amount] has been initiated for withdrawal payout to [name]. Participant will receive the funds within 2-3 working days." (`WAITS.WITHDRAWAL`).

### §15.2 Stage C: the study is created and approved

**1.42 Step 17, the audience**
- **Document says:** "Audience: how many participants, and the criteria that decide who matches."
- **Build does:** see 1.21 to 1.27.

**1.43 "Not designed: there is no way to edit a live study. See D7."**
- **Build does:** see 1.2 and 1.36.

### §15.5 and §15.6 Completion and money

**1.44 Payout release**
- **Document says:** §15.5: "nothing approves a participant payout … No screen in any of the three apps offers approve, hold, release or retry on a payout." §15.6 step 52: "Withdraws earnings … Credited in 2 to 3 working days." "Payouts are manual at launch."
- **Build does:** a withdrawal waits as pending until a team member presses Release in Finance > Payouts (1.7). The participant's "paid" notice is dated by the release (`releasedAt`).

**1.45 Step 49, the balance**
- **Document says:** "Pays it, **or** it is auto-debited on the due date."
- **Build does:** due date = completion plus 7 days (1.10). Nothing is auto-debited (1.9). A completed, unpaid study can be reopened, which removes the due date until it completes again (1.1).

### §16 Decisions

**1.46 D2: Payout approval**
- **Document says:** "States: `pending` on completion, then `approved`, `held`, `paid`, or `failed`. Actions: Approve, Hold with a written reason, Release a held payout, Retry a failed one … **This screen is not in any design and must be drawn.**"
- **Build does:** the states exist as stated, applied to **withdrawals**. Only one action has a screen, **Release**, which moves pending straight to paid. It is drawn in the 19 Oct Finance frames. Approve, Hold, Retry, and the `approved`, `held` and `failed` states have no screen. Study incentive processing is separate and unchanged (1.8). The participant sees Processing, then Completed, not "Payment approved".

**1.47 D7: Editing a live study**
- **Document says:** "**A live study cannot be edited.** Pause, resume and mark complete are the only controls … A client who needs a change pauses the study and raises a support ticket."
- **Build does:** the team can edit a live study in the console, with the type, incentive, number of participants and booked availability locked (1.2, 1.36). The client cannot. Decided 21 Oct 2026: "Console editor" and "Lock money fields".

**1.48 D11: The two names**
- **Document says:** user-facing screens read Focus Insite.
- **Build does:** the client sidebar shows HumanLayer (1.17). The respondent app and its certificate are as before.

**1.49 D22: The deposit**
- **Document says:** "**Editing a study that is waiting on the team retakes the deposit at the new figures** … A live study cannot be edited at all, so this only ever applies before approval."
- **Build does:** a live edit by the team takes no deposit and changes no amount, because every money field is locked. Retaking the deposit still applies to a study waiting on the team.

**1.50 D23: Matching**
- **Document says:** "The match runs once, when the team approves the study. It selects the people in the pool who fit the audience that was set."
- **Build does:** unchanged on timing. The audience it tests now includes Experience, Household Income, Ethnicity and Area Type (1.21, 1.22), combined as in 1.23.

**1.51 D25: Work in progress**
- **Document says:** "Work in progress is kept as it is typed, so a reload loses nothing," for the client's Create flow.
- **Build does:** the same now applies to the console's Edit Study. The edit is kept on the device (`fi-console-edit-<id>`) until Publish or Cancel, which is what its "Auto-saved" states.

**1.52 D26: Uploads**
- **Document says:** study thumbnail: "A real image, JPEG or PNG, up to 2MB, kept at no more than 640 by 480". Screener questions by file: "one open question per line".
- **Build does:**
  - the console editor's thumbnail uses the same rule, through one shared reader (`shared/picture.ts`, also used for the respondent's profile picture);
  - the console's Create Survey Upload File uses the same rule through `questionLines` in `shared/fromPrompt.ts`;
  - the client now reads question files through the same function.

**1.53 D28: Profile picture, intro video and consent**
- **Document says:** "The consent control sits with the thing it governs … **None of this is drawn and must be.**"
- **Build does:** the 21 Oct frame (979:74128) now draws the picture and video. It does not draw the consent switches or a points hint. The build keeps the switches (decided 21 Oct 2026) and drops the hint. See 1.11, 1.12.

### §18 Notifications

**1.54 To a participant: withdrawal paid**
- **Document says:** "Withdrawal processing, and paid | Yes".
- **Build does:** the paid notice is derived from the payout and dated by `releasedAt`, the moment the team released it. No separate notification is stored.
- **Where:** `src/lib/notifications.ts`.

**1.55 To the team: reports**
- **Document says:** "A report was raised".
- **Build does:** this now covers two kinds. Reports on participants (from the system, a person or a client) count in Participants > Verifications > Reported. Reports on studies (from respondents) count on the Studies > Reported badge.

### §19 Front-end data shapes

**1.56 New and changed fields**
- **Document says:** the shapes listed in §19. `Study` has `revisions: { note; at; by }[]` and `audience: AudienceCriteria`. No study report, no payout state.
- **Build does** (in `shared/types.ts` and `shared/studyForm.ts`, the API contract per §23.2):
  - **`Study`:**
    - `edits?: StudyEdit[]`;
    - `firstSubmittedAt?: string`;
    - `beyondTarget?: boolean`;
    - `form?: StudyForm`.
  - **New types:**
    - `StudyEdit { at; by: 'client' | 'team'; byId?; changes: FieldChange[] }`;
    - `FieldChange { path: string[]; from?; to?; added?; removed? }`.
  - **Reports:**
    - `StudyReport { id; studyId; personId; reason; detail; at; ticketId?; resolution? }`;
    - `ReportResolution { id; at; by?; statement; ticketId? }`;
    - `PlatformState.studyReports?: StudyReport[]`.
  - **`ReportReason`** adds the client's five reasons (1.5).
  - **Payouts:**
    - `PayoutStatus = 'pending' | 'approved' | 'held' | 'paid' | 'failed'`;
    - `Payout.status` is `PayoutStatus`, with legacy `'processing' | 'completed'` mapped;
    - `Payout.releasedAt?`, `Payout.releasedBy?`.
  - **`StudyForm`** gains `experience?`, `income?` (19 Oct) and `ethnicity?`, `areaTypes?` (21 Oct).
  - **`FormQuestion`** carries:
    - `min`, `max`, `gap`, `showGap` (Slider);
    - `formats`, `maxFiles` (File Upload);
    - `matrixKind`, `columns`, `rows` (Mattrix).
  - **Seed version** is 11. Seeded participants now carry varied `areaType`, `ethnicity` and `income`, so every criterion has someone to match.

### §22.10 The money cards

**1.57 Pay tab and the console's live-edit Study step**
- **Document says:** Costing Summary gained Moderation and Platform Fee rows. Payment has one "Incentive deposit" row.
- **Build does:**
  - the client Pay tab adds Estimated and Final once stopped, and "Credited to your next study" (1.31);
  - the console's Edit Study, Study step shows Costing Summary from the study's own billing lines;
  - its Payment block reads "Incentive deposit paid" with the amount taken and "To Pay $0";
  - its notes derive the remaining incentives and recruitment from the study's rates and the deposit rule.

### §22.11 Behaviour in the build not described elsewhere

**1.58 Routes not described elsewhere**
- **Document says:** lists `/`, `/trust-score/history`, `/motion`, `/kitchen-sink`.
- **Build does:**
  - **Client:** `/studies/:id/revisions`.
  - **Console:**
    - `/studies/reported`;
    - `/studies/reported/:id`;
    - `/studies/:id/edit` (with `?step=about|audience|screener|study`);
    - `/studies/:id/edit/done`;
    - `/finance/payouts`;
    - `/finance/payouts/:personId/:payoutId`.

**1.59 Shared files added**
- **Document says:** §23.2 lists the shared files.
- **Build does:** adds three files:
  - `shared/revisions.ts`: the record of changes to a submitted study;
  - `shared/fromPrompt.ts`: the reader behind Generate and Fill with AI, and the question-file reader;
  - `shared/picture.ts`: the one picture reader.

### §23.3 What each resource needs

**1.60 Study**
- **Document says:** "Create, update while draft or in review, read, publish, pause, resume, complete. **Never update once live**", for the client. As seen by the team: "Read, approve, request changes with a note, pause, complete."
- **Build does:**
  - the team also updates a live study, excluding the locked fields (1.2);
  - the client also reopens a completed, unpaid study (1.1) and keeps recruiting past target (1.3).

**1.61 Payout and Report**
- **Document says:** Payout: "Read, approve, hold with a reason, release, retry". Report: "Raise, read, reject, restrict, deactivate."
- **Build does:**
  - Payout: release is built; the rest is in the model only (1.46);
  - Report on a participant: also raised by a client (1.5);
  - **Report on a study** is a new resource: raised by a respondent; read, chat and resolve by the team (1.6).

---

## Part 2. BRD-Focus-Insite-Platform.md

### §4.1 In scope for this release

**2.1 Console scope**
- **Document says:** "Dashboard queues, study review and approval, study management, participants and their profiles, identity and profession verification, reports and moderation, clients and business verification, support, finance and refunds, pricing and rewards, sub-admins."
- **Build does:** also includes:
  - editing a live study (PRD 1.2);
  - reports on studies (PRD 1.6);
  - releasing withdrawals (PRD 1.7).

**2.2 Respondent scope**
- **Document says:** the respondent journey list has no reporting.
- **Build does:** a respondent can report a study (PRD 1.6).

### §5.1 How money moves

**2.3 Balance invoice**
- **Document says:** "Balance invoice | Client | Platform | On the due date, manually or by auto-debit."
- **Build does:** due 7 days after completion. Nothing is auto-debited in the console's wording (PRD 1.9, 1.10). A completed, unpaid study can be reopened, which removes the due date until it completes again (PRD 1.1).

**2.4 Payout**
- **Document says:** "Payout | Platform | Participant | When a participant withdraws, less a $2 fee."
- **Build does:** the withdrawal waits as pending until a team member releases it (PRD 1.7).

### §5.3 Cost drivers

**2.5 Merchant fee**
- **Document says:** "Payment processing | Card acceptance, plus a 3% merchant fee the designs mention for credit cards."
- **Build does:** no 3% fee is stated or charged anywhere (removed in an earlier round; PRD §6.11 already records this). The 19 Oct client frames still draw the line; the build keeps it removed.

### §6 P2: Set up the study

**2.6 Team editing and reopening**
- **Document says:** "There is no reject, and no editing of a study by the team. **Once a study is live it cannot be edited by anyone.** See Decision D6."
- **Build does:** the team edits a live study in the console, with money and booked availability locked (PRD 1.2). The client can reopen a completed, unpaid study (PRD 1.1). The client can start from a written brief in the New Study dialog (PRD 1.20).

### §6 P4: Source and recruit

**2.7 Audience criteria**
- **Document says:** "The platform surfaces matching participants from the pool against the study's audience criteria."
- **Build does:** the criteria now include Experience, Household Income, Ethnicity and Area Type. Every category set must match, with any option within it (PRD 1.21 to 1.23). A client can keep recruiting past the target with Recruit more (PRD 1.3).

### §6 P7: Pay and deliver

**2.8 Payout approval**
- **Document says:** "On completion the participant's wallet is credited … **The hole:** nothing in any of the three apps approves a participant payout … See Decision D2." And: "settles the balance invoice manually or by auto-debit."
- **Build does:** withdrawals are released by the team (PRD 1.7). The balance rule is as in 2.3.

### §6 P8: Support and moderate

**2.9 Reports**
- **Document says:** "Reports on participants arrive from the system or from people, and the team rejects the report, restricts the account or deactivates it."
- **Build does:**
  - clients report participants with their own five reasons (PRD 1.5);
  - respondents report studies with eight reasons;
  - the team chats with the client about a reported study and resolves its reports with a statement and password (PRD 1.6);
  - the client app has a "Stuck? Need Help?" menu that includes "Book A Call With Us", which raises a ticket (PRD 1.18).

### §8 Decisions taken

**2.10 D2**
- **Document says:** "**The team approves every participant payout before money moves.** A payout screen is added to the console's Finance module."
- **Build does:** a withdrawal screen exists with Release only (PRD 1.46).

**2.11 D6**
- **Document says:** "**A live study cannot be edited.** Pause, resume and complete only. A client needing a change pauses and raises a ticket."
- **Build does:** the team can edit a live study, money locked. The client cannot (PRD 1.47).

**2.12 D10**
- **Document says:** "The three apps are branded Focus Insite."
- **Build does:** the client sidebar shows HumanLayer (PRD 1.17).

**2.13 D19**
- **Document says:** "**The deposit is the incentives for the full sample, taken at submission.** Everything else is billed on delivery."
- **Build does:**
  - a live edit takes no deposit and changes no amount (PRD 1.49);
  - the deposit is 25% of recruitment plus 25% of incentives (`depositParts`, `DEPOSIT_RULE`; a 15 Oct change in an earlier round, still current).

**2.14 D20**
- **Document says:** "**Matching runs once, when the team approves the study.**"
- **Build does:** unchanged on timing. Criteria and combination as PRD 1.50.

**2.15 D22**
- **Document says:** each of picture and video has its own consent, off by default.
- **Build does:** unchanged in rule. The 21 Oct frame omits the switches; the build keeps them (PRD 1.53).

---

## Part 3. Frames that disagree with earlier decisions, and what the build kept

These are not differences from the PRD or BRD. They are places where the 19 or
21 October frames draw something an earlier round had decided otherwise. The
designs may need updating to match the build.

| # | Frame draws | Build does | Since |
|---|---|---|---|
| 3.1 | Pricing (incentive, costing, payment) on the Study step, with four step chips | A separate fifth Pricing step in the client Create flow | 15 Oct |
| 3.2 | "3% merchant processing fee applies when using a credit card" | No such line; nothing charges it | 13 Oct |
| 3.3 | An Edit row in the client's live-study menu | No Edit for the client on a live study | 13 Oct |
| 3.4 | Impressions and Clicks tiles on the client Study Overview | Removed | earlier round |
| 3.5 | No "(required)" / "(optional)" labels, help text or "Prefer fresh people" option on Audience | Kept: Work Function and Industry required, Role and Skills optional, with help text; the "Prefer fresh people" condition | 15 Oct |
| 3.6 | A kebab menu on each question | A bin on the question, then a confirmation | 15 Oct |
| 3.7 | Screener without the pre-screener and full-screener bands, and without the collapsible preview | Bands and collapsible preview kept | earlier round |
| 3.8 | "Duration" on the respondent study detail | "Time to complete / About 30 min" | 15 Oct |
| 3.9 | Respondent study detail without the share-link row or the repeat-rule card | Both kept | earlier round |
| 3.10 | Profile Tiers "top 10% / 25%" as fixed text | Shown, derived from the pool (left out in an earlier round, now shown) | 19 Oct |
| 3.11 | "Recruite more" | "Recruit more" | 19 Oct |
| 3.12 | "Pay Bill" and "Re-publish and Recruit" | Both used as drawn (the PRD says "Pay Balance"; see PRD 1.31) | 19 Oct |
| 3.13 | Withdrawal confirmation: "5-7 working days" | "2-3 working days" from `WAITS.WITHDRAWAL`, the policy's figure | 19 Oct |
| 3.14 | Console Edit Study: incentive slider live, number of participants editable, Payment "To Pay $125" | All read only; To Pay $0 | 21 Oct |
| 3.15 | Edit Audience (1645:133969): "Participant will be required to match at least one of below to apply" above Work details | "Who qualifies for this study" | 21 Oct |
| 3.16 | Audience sample chips "American", "Filipino American", "Sub-urban" | The shared lists (PRD 1.22) | 21 Oct |
| 3.17 | My Profile (979:74128) without consent switches, and with About Me, Pets and "Are you a home owner?" hidden | Consent switches kept; the three fields kept | 21 Oct |
| 3.18 | My Profile picture is a real photograph | Initials until the participant adds a picture; no real faces in the build | 21 Oct |
| 3.19 | Console preview: a match score ring ("96") on the study card | Not shown: there is no participant to score in the console | 21 Oct |
| 3.20 | Console condition "with Soulful Labs (You) before" | "(You)" left out in the console, which is not the client | 21 Oct |
| 3.21 | Console forecast "Contact Us" | Opens the console's Support | 21 Oct |
| 3.22 | Console Roles as a picker with chips | A typed, comma-separated list: there is no shared list of roles | 21 Oct |
| 3.23 | Intro video ".mp4 file \| 50 MB max." | Shown as drawn; any video format is accepted, as before | 21 Oct |
| 3.24 | Frames 2325:220730 and 2326:221729 sit in the console section | They are client frames | 19 Oct |

### Not built from these frames

| What | Why |
|---|---|
| Marketplace navigation item | No screen behind it |
| Console Invite From Pool | The frame is a client screen |
| Approve, Hold and Retry on a withdrawal; the `approved`, `held` and `failed` screens | Not drawn; the states exist in the model |
| Selfie capture | Legal review open (D5) |

### Refund screens touched

None were changed in logic. The console's transaction panel, which Refund
Detail also uses, now downloads a receipt PDF.
