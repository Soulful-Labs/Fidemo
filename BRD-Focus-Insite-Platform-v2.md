# Business Requirements Document
# Focus Insite / HumanLayer Platform

**22 October 2026 · Soulful Labs**

**Companion document:** PRD, Focus Insite / HumanLayer Platform, version 2.

| Document | Covers |
|---|---|
| This document (BRD) | Why the product exists, who it serves, the business model, the processes it supports, the business rules, the decisions taken, assumptions, risks, compliance obligations, phasing and success criteria |
| PRD | What gets built: every screen, control, state and route, the platform workflow, the Trust and Rewards policy in full, the data contract, and what the back end must provide |

The Trust and Rewards policy, version 2 of 22 October 2026, is reproduced in full in PRD Section 6. No separate policy document is required.

**The product.**

| Item | Link |
|---|---|
| Respondent app (mobile) | https://fidemo-lyart.vercel.app |
| Client app (desktop) | https://fidemo-lyart.vercel.app/client |
| Internal team console (desktop) | https://fidemo-lyart.vercel.app/internal |
| Figma, whole file | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App |
| Figma, respondent app | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=204-6318 |
| Figma, client app | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=826-85016 |
| Figma, internal console | https://www.figma.com/design/Q83MnpAyJuc6RttXYbWudH/Focus-Insite-App?node-id=1794-64316 |


---

## 1. Background and the problem

**Focus Insite** is a market research company. It recruits verified people for studies, runs those studies, and delivers the results to its clients. Today that work is done by hand.

**HumanLayer** is the platform being built to automate it. Focus Insite will operate it, and its own team is the internal team described throughout this document.

Market research runs on talking to the right people. Getting to those people is the expensive part, and it is where the industry's two chronic problems live.

**Problem 1: you cannot be sure who you are talking to.** Online research panels are full of people who misrepresent themselves to qualify for incentives, and increasingly of automated responses. A client paying to interview thirty oncologists has no way to know that thirty oncologists turned up. The data is then used to make product and clinical decisions.

**Problem 2: recruiting specialist audiences is slow and manual.** Finding thirty verified oncologists in a given country who are available on a Thursday takes an agency weeks of phone calls, and the cost of that labour is passed to the client.

**Focus Insite's answer is a verified human layer.** Every participant proves their identity against government records and their profession against official registers. They carry a reputation score built from real behaviour: whether they turn up, whether they complete, how clients rate them. Clients can target that verified pool directly, and the platform handles screening, scheduling, attendance and payment.

The paid-participation market is the mechanism: people give their time and opinions, and get paid for it, in cash and in reward points.

---

## 2. Business objectives

| # | Objective | How it is measured |
|---|---|---|
| B1 | Clients can trust that every participant is a real, verified person | % of completed participations where identity and, where relevant, profession were verified before the session |
| B2 | A client can go from signing up to a live study without an account manager | Median time from sign-up to first study live; % of studies published without staff intervention beyond approval |
| B3 | Studies fill reliably | % of studies that reach their participant target; median time to fill |
| B4 | Participants come back | Repeat participation rate; monthly active participants; streak completion rate |
| B5 | Bad actors are removed quickly and fairly | Median time from report to decision; % of restrictions upheld on appeal |
| B6 | The team can run the platform at scale without the workload growing linearly | Queue sizes and ageing in the console; checks per team member per day |
| B7 | The platform is profitable per study | Gross revenue per study against incentives and processing costs |

**B6 deserves attention.** The whole commercial case for a managed-but-automated platform is that the team's work does not grow in line with volume. Today the console has no assignment, no priority, no reply-time targets and no record of who did what. Those are not nice-to-haves; they are how B6 is achieved and evidenced.

---

## 3. Stakeholders

| Stakeholder | What they need | What they give up |
|---|---|---|
| **Participants** | Fair pay, clear expectations, quick payment, not being wasted | Identity documents, professional credentials, time |
| **Clients** | Verified, matched people quickly; usable results; predictable cost | Money up front, a study that passes review |
| **Focus Insite team** | To get through queues fast without mistakes | none |
| **Master admin** | Control of fees, reward values and who on the team can do what | none |
| **Finance** | Accurate invoicing, reconciled payouts and refunds, an audit trail | none |
| **Legal and compliance** | Lawful handling of identity documents, card data and personal data | none |
| **Soulful Labs / GoodLabs** | A product that ships and scales | none |

---

## 4. Scope

**Platforms, fixed for the MVP.** The respondent app is mobile only. The client app and the internal team console are desktop only. No other version of any of the three is being built, and none is responsive outside its own width. This is a decision, not a gap.

### 4.1 In scope for this release

| Area | Included |
|---|---|
| Respondent mobile app | Full journey: landing, sign-up, onboarding and ID upload, browsing and filtering studies, applying, screener, scheduling, attendance by PIN, survey and diary completion, rating, reporting a study, wallet, withdrawals, reward points and redemption, profile, Trust Score, certificate, referrals, settings, support |
| Client desktop app | Full journey: sign-up and organisation details, payment method, study creation in four steps and Publish across six study types, pool search, managing a live study, scheduled sessions, recruiting and qualifying, results, rating, invoices and payment including paying several at once, notifications, help, account |
| Internal console | Dashboard queues, study review and approval, study management including changing a live study, participants and their profiles, identity and profession verification, reports and moderation on people and on studies, clients and business verification, support, finance, withdrawal release and refunds, pricing and rewards, sub-admins |
| Six study types | Survey, Video Call 1:1, Group Video Call, In-Person 1:1, In-Person Group, Diary |
| Trust and rewards | Trust Score, tiers, reward points, redemption, the certificate, as the policy defines them |

### 4.2 Explicitly out of scope

| Excluded | Why |
|---|---|
| Selfie or liveness capture | Legal review is open. Identity documents only until it closes |
| Any public-facing marketing site beyond the app's own landing page | Separate work |
| A mobile app for clients | Clients are desktop only |
| A mobile app for the team | The console is desktop only |
| Multiple users on one client account | Every design assumes one person per client. No seats, no roles, no invitations |
| Pricing plans or subscriptions | Not modelled anywhere. See Decision D11 |
| In-platform video calling | No recording or calling UI exists in any design. Sessions use an external meeting link |

### 4.3 Deferred, pending a decision

| Deferred | Blocked on |
|---|---|
| Pricing plans | Decision D11 |
| Any selfie-based verification | Legal |
| How much the deposit is | Jim. PRD D32. The policy may need re-signing |
| Whether the team may re-price a live study | Jim. PRD D33 |
| What the Audience forecast shows | Not yet assigned. PRD D34 |
| The live domain, the support address, and whether the certificate prefix changes from FI- | Not yet assigned. PRD D35. A prefix change needs a new version of the policy |
| The diary's Minute and Step units and a longer frequency list, as drawn | Not yet assigned. PRD D36 |
| Whether a client may change the incentive after publishing, as drawn | Jim, with PRD D33 |

---

## 5. The business model

### 5.1 How money moves

| Flow | From | To | When |
|---|---|---|---|
| Deposit | Client | Platform | When a study is published |
| Balance invoice | Client | Platform | By the client. It falls due when the study stops recruiting and enters Billing, and is due 7 days later |
| Incentive | Platform | Participant | When the team processes the study's payouts, once the participation is completed. It never waits on the client's invoice |
| Payout | Platform | Participant | When a participant withdraws and the team releases it, less a $2 fee |
| Redemption | Platform | Participant's wallet | When points are converted, at 100 points to $1, minimum 1,000 |
| Refund | Platform | Client | When a study underfills, confirmed by the team, paid in 5 to 7 working days |

### 5.2 Where revenue comes from

| Revenue line | Rate | Basis |
|---|---|---|
| Platform fee | $100 | Once per study |
| Moderation fee | $10 | Per completed participant |
| Recruitment fee | $25 base | Per completed participant |
| Recruitment add-on | +$25 | Video Call, In-Person or Diary type; or Roles targeting |
| Recruitment add-on | +$20 | Skills targeting |
| Withdrawal fee | $2 | Per participant withdrawal |

The client fees are the current values. A master admin sets them in the console; each change is confirmed and recorded, and a study keeps the fees it was created with. The withdrawal fee is set by the policy.

The incentive itself is pass-through: the client pays it and the participant receives it. Revenue is the fees around it.

**A worked example, the shape the designs draw.** A thirty-participant study at $100 incentive: platform fee $100, recruitment $500, incentives $2,500, moderation $250, giving a billed total of $3,350, settled against the deposit taken at submission. How much that deposit is, is open (PRD D32).

> **Caution.** That example is taken from the designs, and the designs do not add up: the same study is drawn with totals of $3,350, $3,850, $12,960, $15,085 and $16,510 on five different screens, and a $3,000 deposit is captioned "$20 × 30 participants", which is $600. **No financial model should be built from the drawn figures.** Finance must restate the fee model and worked examples before build. See Decision D13.

### 5.3 Cost drivers

| Cost | Driver |
|---|---|
| Incentives | Pass-through, but it is the platform's money between paying the participant and collecting from the client |
| Identity and credential verification | Per check, including the manual checks that fail automation |
| Payment processing | Card acceptance |
| Payouts | Per bank transfer |
| Team time | Verification, study review, moderation, support, refunds. **This is the cost B6 is about** |
| Refunds | Underfilled studies return money that fees were calculated against |

---

## 6. Business processes

Eight operational phases. Each one maps to screens in the PRD.

| # | Phase | Who acts | System of record |
|---|---|---|---|
| P1 | Onboard the client | Client, then team | Client app, then console |
| P2 | Set up the study | Client, then team approval | Client app, then console |
| P3 | Verify and onboard the participant | Participant, then team where automation fails | Respondent app, then console |
| P4 | Source and recruit | Platform matching, then client | Client app |
| P5 | Screen and qualify | Participant, then a decision maker | Both |
| P6 | Run the study | Participant and client | Both |
| P7 | Pay and deliver | Client, platform, participant | All three |
| P8 | Support and moderate | Anyone, then team | All three |

### P1: Onboard the client

Sign up, confirm the email, give organisation details including the VAT number and company website, add a payment method, wait for review, start.

The automatic check tries to resolve the VAT number and website. **Only failures reach a person**, in the console's Clients > Verifications queue. The team either verifies manually with a written statement, or rejects.

**Gap:** the client is told the team reviews their account, but the console has no queue of clients awaiting approval, and nothing blocks a pending client. See Decision D7.

### P2: Set up the study

The client creates a study in four steps: About (including the type), Audience, Screener, and Study setup (the type-specific part, with the incentive and the costs), then Payment & Publish. They can start from a written brief, which fills what it names. They pay a deposit and publish.

**Every study then passes through team review**, in Studies > To Review. The reviewer reads six tabs and either approves it live, after a confirmation, or requests changes with a written note, which returns the study to the client's drafts with the note recorded in its revisions history.

There is no reject. **Once a study is live, only the team can change it**, in the console, and never its type or the places and times people may have booked. Whether the team may change its incentive or participant number is open (PRD D33). A client who needs a change raises a ticket. See Decision D6.

When a study meets its target the client can keep recruiting. Otherwise, when it fills its target or the client or team stops it, it enters **Billing**: recruiting stops, sessions not yet run are cancelled at no cost to participants, participants are paid, and the balance falls due. A study in Billing can be re-published to recruit again; once the bill is paid it is completed and closed.

### P3: Verify and onboard the participant

Sign up, three onboarding steps, upload an identity document. The system attempts verification against government records; failures reach the console. Professional credentials follow the same path against official registers.

A verified participant's account becomes fully active, the certificate is issued, and the Trust Score starts at 50 (Silver).

**The only way to ask someone for a better document is to open a support ticket.** There is no "request resubmission" state. See Decision D9.

### P4: Source and recruit

The platform surfaces matching participants from the pool against the study's audience criteria: country (the USA only), gender, education, age, ethnicity, area type, work function, industry, role, skills, experience, household income, profile tiers, and who may take part again: anyone, or only people who have never taken part in a study with that client. A person must match every criterion the study sets, with any one value within each. The client invites them. Invited participants see the study in their app.

Clients can also search the whole pool directly and invite people to a study. Micro-panels, a saved reusable list a client built, were drawn in an earlier version and have been removed.

### P5: Screen and qualify

A participant completes the screener. Each answer carries a verdict the client set when creating the study. An applied participant is then Qualified or Disqualified by a person pressing a button, with one hour to undo.

**Two open questions.** The workflow describes two-stage screening with borderline answers held for review; the designs draw a single decision. And nothing records whether the client or the team pressed the button. See Decisions D3 and D4.

### P6: Run the study

By type: a survey is completed in the app; a diary runs over several days with a minimum of 4 of 5; sessions are booked against the client's availability, with a maximum of two reschedules and none within 24 hours.

Attendance for sessions is confirmed twice: the participant enters a six-digit PIN, and then a person confirms by hand. A participant who does not attend is marked a no-show and is not paid for that study.

A client or the team may cancel a session at any time. They must give a reason, the participant is told it, and it costs the participant nothing.

### P7: Pay and deliver

On completion 25 reward points are added and the Trust Score rises by 1. The team processes the study's payouts in the console, and the participant's wallet is credited with the incentive; nothing is paid automatically. The client collects results, rates each participant, and pays the balance invoice, which is due 7 days after the study enters Billing.

If the study underfilled, a refund is raised automatically from the shortfall and a team member confirms it.

**Withdrawals wait for the team.** A participant's withdrawal stays pending until a team member releases it in the console. Approving, holding and retrying a withdrawal are not built yet. See Decision D2.

### P8: Support and moderate

Tickets are answered automatically from FAQs and platform guides where possible; anything not covered reaches the console. A client can also ask for a call through a ticket. Reports on participants arrive from people on the team and from clients, never from the system, and the team rejects the report, restricts the account or deactivates it. Participants report studies; the team talks to the client about it and resolves the reports with a written statement.

---

## 7. Business rules

These are authoritative. The Trust and Rewards policy, version 2, is the source for everything in 7.1 to 7.4; where a design draws a different number, the design is wrong. The platform and the policy must never disagree.

### 7.1 Trust Score

Range 50 to 100, starting and floor 50.

| Event | Change |
|---|---|
| Onboarding complete | +50 |
| Completing a study | +1, capped at 10 a year |
| 5-star / 4-star / 3-star rating | +4 / +3 / +1 |
| 2-star / 1-star rating | −2 / −3 |
| Ratings contribution, maximum | +40 |
| No show | −4 |
| Late show up | −2 |
| Cancelled session | −2 |
| Upheld fraud | −20 |

Only the last 10 studies' ratings count.

### 7.2 Tiers

Silver from 50, Gold from 70, Platinum from 90. Always derived from the Trust Score.

### 7.3 Reward points

Referral 200, being referred 100, adding an intro video 75, completing a study 25, full profile 50, monthly streak 50, adding a profile picture 25.

A master admin may change the Trust Score values, tier thresholds, reward point values and client fees from the console. A change applies only to what happens after it: every event counts at the value in force when it happened, so no existing score or balance moves.

### 7.4 Money rules

| Rule | Value |
|---|---|
| Redemption rate | 100 points = $1 |
| Minimum redemption | 1,000 points |
| Withdrawal fee | $2 |
| Reschedule limit | Twice, and never within 24 hours of the session |
| Session cancelled by the client or the team | Costs the participant nothing. A reason is required, and the participant is told it |
| Diary completion | At least 4 of 5 days |

### 7.5 Account rules

| Rule | Detail |
|---|---|
| A participant must be identity-verified before taking part | Enforced at application |
| A no-show is not paid for that study | Stated in the dialog that marks one |
| A restricted participant cannot participate, withdraw or redeem | For a fixed period |
| Deactivation is reversible | Both require a written reason and the acting team member's password |
| A client cannot be deactivated while they have live studies | Refused with an explanation, whether the client or the team tries. The team is also refused while an invoice is unpaid |

### 7.6 Rules that came from the designs

Each of these first appeared in a design rather than a signed document. Each is now settled.

| # | Rule | Where it appeared | Now |
|---|---|---|---|
| R1 | Restriction ladder: 15 days, 15 days, 30 days, then deactivation | One console frame | In the policy, section 9 |
| R2 | Reward points never expire | One console frame | In the policy, section 4 |
| R3 | Study completion capped at 10 a year | Console, applied to points | The cap is on the Trust Score, not points |
| R4 | Client refunds paid within 5 to 7 working days | Console confirmation dialog | In the policy, section 8 |
| R5 | Participant payouts credited within 2 to 3 working days | The respondent app's landing page | In the policy, section 4 |
| R6 | 3% merchant processing fee on credit card payments | Client checkout | Not charged, and not shown |

---

## 8. Decisions taken

Each of these was a real disagreement between the designs, the earlier workflow and the signed policy. All are settled. The PRD carries the detail; this is the business position.

| # | Decision | Why |
|---|---|---|
| D1 | **Managed platform with a few self-serve pieces.** A client creates a study, searches the pool, invites people and runs the study. The team approves every study and every payout, and handles verification, moderation and support | Keeps the two controls that matter without staffing every study |
| D2 | **The team releases every participant withdrawal before money moves.** The console's Finance module lists withdrawals and releases them. Approve, hold and retry are to follow | Money cannot move unchecked |
| D3 | **One screening stage.** A person presses Qualify or Disqualify. The one automatic part is an eligibility question in the first three positions with a marked correct answer | What the designs draw, and simpler to operate |
| D4 | **Either the client or the team may qualify an applicant, and it is recorded against the person who did it** | The control exists in both apps. Accountability comes from the activity log |
| D5 | **No selfie and no liveness check.** Document upload only, until the biometric legal review closes | Nothing biometric is built before the law is clear |
| D6 | **Only the team can change a live study**, and never its type or anything people may have booked. The client pauses, resumes, completes or recruits more, and raises a ticket for a change. Whether the team may change the incentive or participant number is open (PRD D33) | An approved study is what participants applied to, so what they booked must hold |
| D7 | **No client approval queue.** Only a failed automatic business check reaches the team | Matches the designs, and avoids an unstaffed queue |
| D8 | **The restriction ladder is ratified:** 15 days, 15 days, 30 days, then deactivation. The participant is told why and for how long | It was being built from one frame with no document behind it |
| D9 | **The team asks for a better document through the verification screen itself,** not a support ticket | A rejection with a reason is already drawn. It carries the request |
| D10 | **HumanLayer is the platform. Focus Insite is the company that operates it**, and already does this research manually today. All three apps carry the HumanLayer name, spelt as one word: the respondent and client apps throughout, the console in its browser tab, entrance and access line, with "Admin Panel" in its sidebar. The client's terms agreement keeps Focus Insite's name, because the contract is with the company | The platform's name is what participants, clients and the team see |
| D11 | **No pricing plans at launch.** Clients pay per study | Nothing else in the product knows about plans |
| D12 | **The certificate is issued on identity verification, one unique ID per person, claiming only what was verified.** The client certificate is separate and claims only business registration and billing | A public claim must be one the platform can evidence |
| D13 | **The fee model is the table in PRD 6.10**, and the policy wins wherever a drawn figure disagrees | Five screens contradicted each other |
| D14 | **A Pricing and Rewards change is not retrospective.** Only a master admin may make one, after a confirmation, and it is recorded with who and when. A study keeps the fees it was created with, and every score and points event counts at the value in force when it happened | A client cannot be repriced after committing, and no participant's score moves because a value was edited |
| D15 | **Every decision in every module is logged,** with before and after values, the reason, a link, and the master admin included | The log covered two actions out of everything the team does |
| D16 | **A new sub-admin is invited by email with a single-use link to set their own password.** An Inactive sub-admin cannot sign in, and keeps their access toggles for reactivation | No shared or default password at any point |
| D17 | **The console requires two-factor authentication, a 12-hour session, sign-in history, and lockout after five failed attempts. There are always at least two master admins and the role can be handed over** | This console moves money and sets the reward economics |
| D18 | **Micro-panels are removed.** A client searches the pool and invites people to one study, directly | They were drawn in an earlier version and switched off deliberately |
| D19 | **One deposit rule, used on every money screen.** It is taken at submission and everything else is billed on delivery. How much it is, is open (PRD D32) | Figures that disagreed between screens |
| D20 | **Matching runs once, when the team approves the study.** People who join later are not added to that study. A person must match every criterion set, with any one value within each | A client needs a settled list to recruit from |
| D21 | **A study with no end date runs 60 days** | What the create flow already states |
| D22 | **A participant can add a profile picture (25 points) and an intro video (75 points), each with its own consent, off by default.** A client sees either only if its consent is on, and consent can be withdrawn at any time | Clients recruit better when they can see who they are recruiting. The participant decides |
| D23 | **Neither the picture nor the video affects the Trust Score** | Reputation is earned by behaviour in studies, not by filling in a profile |
| D24 | **Study descriptions on the respondent app open on tap, not under every title** | Too much text on a phone |
| D25 | **The client dashboard shows less at once:** Ongoing Studies as a carousel of three cards or more, the attention list at three rows, and sessions shortened with View All | One screen was carrying too much |
| D26 | **A stopped study enters Billing before it completes.** Recruiting stops, participants are paid by the team, and the balance falls due a week later. Paying it completes the study; re-publishing returns it to recruiting | A participant never waits on the client's invoice, and a study cannot close while money is owed |
| D27 | **Two conditions on who may take part again:** anyone, or only people who have never taken part in a study with that client | "Prefer fresh people" did nothing a client could rely on |
| D28 | **No sign-up for the console.** A master admin makes every team account | The console moves money and holds personal data |
| D29 | **A client or the team must give a reason to cancel a session.** The participant is told it, and it costs them nothing | The participant loses a booked slot through no fault of their own and should know why |

---

## 9. Assumptions

| # | Assumption | If wrong |
|---|---|---|
| A1 | Identity can be verified automatically against government records in the markets served, with manual review as the exception | The console's verification queues become the bottleneck and team cost rises sharply |
| A2 | Professional credentials can be checked against official registers | The same, and the core promise weakens |
| A3 | One person per client account is enough for this build. Several people per account is planned, not built. See 9a and Section 12 | Agencies with several researchers cannot use the product until 9a is delivered |
| A4 | Sessions run on an external meeting tool | No video or recording interface exists in any design |
| A5 | Participants will accept giving identity documents for paid research | Supply fails |
| A6 | Clients will pay a deposit up front | Conversion suffers |
| A7 | The six study types cover what clients need | Each new type is substantial work, though the one-flow structure limits it |
| A8 | Studies are priced in USD | No multi-currency exists anywhere |
| A9 | Points and cash can both be held without a regulated e-money licence | Legal risk; see 11 |

---

## 9a. Client team access

**Planned. Not in this build.** A client is an organisation, not a single person. Several people from the same client team will use one client account, and each will see only what is assigned to them.

This build keeps one person per client account. The capability below is specified now so that the data model is designed for it rather than retro-fitted later.

| Rule | Detail |
|---|---|
| One account, several people | A client organisation has one account. People are added to it |
| Study level access | A person on a client team sees only the studies they are assigned to. A client running three studies with three different researchers gives each researcher one study |
| Who can add people | An owner on the client account. The platform does not add them |
| What an owner sees | Everything on the account, including every study and every invoice |
| Billing | Stays at the account level. Access does not change who pays |

**Nothing of this exists today.** The client app has one person per account, no way to add anyone, and no notion of a study belonging to a particular person. The designs do not cover it either.

**What it needs, when it is built:**

| | |
|---|---|
| Designs | Adding and removing a person, the invitation they receive, assigning a study to a person, and what a person without access sees |
| Front end | The screens above, plus every list in the client app filtering by what the signed-in person may see |
| Back end | People under a client account, study assignment, and access enforced on the server rather than by hiding things on screen |
| Decisions | Whether an owner can be more than one person, what happens to a person's studies when they leave, and whether a person can be given a study without being given the invoice |

**Why it is not in this build.** The screens are straightforward, but access has to be applied to every list, every study and every invoice in the client app, and enforced on the server rather than hidden on screen. That is mostly back-end work and it is not worth delaying the launch for.

**What to do now rather than later:** design the data model so a study belongs to a person within a client account, even though every person on the account currently sees everything. Retro-fitting that is far more expensive than allowing for it.

## 10. Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RK1 | Card data handled wrongly. The console currently draws full card numbers and CVVs | **Severe.** Card industry breach, fines, loss of processing | Certain if built as drawn | Fix the design now. Show last four digits only. Never store a CVV |
| RK2 | Money moves with too little control, and the audit trail does not cover the actions that matter (D2, D4, D15) | Severe. Fraud, disputes that cannot be resolved | Medium | Withdrawals already wait for the team's release. Build approve, hold and retry. Extend the activity log to every decision in every module, including the master admin's |
| RK11 | One master admin account holds every permission, protected by a password alone, with no second holder (D17) | Severe. One compromised or lost account controls the platform's money and reward rules | Medium | Two-factor, a second master admin, and a succession path |
| RK3 | Policy numbers built from the designs rather than the signed policy | High. Participants paid the wrong points, scores wrong, disputes | High if unchecked | Section 7 is authoritative. Fix the designs |
| RK4 | Identity document storage breaches data protection law | Severe | Medium | Legal review of retention, access and deletion before launch |
| RK5 | The team becomes the bottleneck as volume grows | High, kills B6 | Medium to high | Assignment, priority, reply-time targets, and the activity log |
| RK6 | A restricted or deactivated participant has no idea why | Medium. Complaints, appeals, reputation | Certain as designed | Design the participant-facing screens |
| RK7 | Clients cannot fix a mistake on a live study themselves (D6) | Medium. Support load, frustration | High | The team makes the change in the console on request |
| RK8 | The certificate claims things the platform cannot evidence (D12) | High. A public false claim | Medium | Settle D12 before any certificate is issued |
| RK9 | Fraud at scale: fake identities, automated survey answers, incentive farming | High | Medium | The reporting and restriction machinery exists; the detection behind it is not specified |
| RK10 | Figures disagree between screens and a client sees it | Medium. Trust | High if not derived | Derive every figure from one source. PRD Section 17 |
| RK12 | Holding participant balances until withdrawal turns out to be a regulated activity | **Severe.** The whole payout design changes, and the wallet, points and withdrawal screens with it | Unknown until checked | Establish this before the payout integration is built, not after |
| RK13 | The biometric legal review does not close, or closes against us | High. Identity verification cannot be finalised or priced, and onboarding step 3 stays provisional | Medium | Nothing biometric is built until it closes. Document upload only |
| RK14 | Two payment vendors for three charges | Medium. Double the integration, double the reconciliation, and a second place for money to go missing | Certain if built as proposed | Establish whether one provider can take all three |
| RK15 | Zoom links cannot be issued automatically | Medium. Session scheduling becomes manual at a volume it was not designed for | Unverified | Confirm before building against the SDK. Assume manual until then |
| RK16 | A commitment shown to participants that the business has not agreed. The screener decision time of 3 to 5 days appears in the app but in no source document | Medium. A public commitment the business has not made | Certain as built | Confirm the figure, or change it before launch |

---

## 10a. The technology stack

The full stack, with the options considered, what we landed on and why, and what each choice costs against the alternatives, is in PRD Section 22.3.

**It is an estimation, not an instruction.** The developer chooses the final stack from those options and tells us what they picked. The only rows we would want a real argument for rather than a preference are the database, logins, card payments and video, because work already exists against them.

The three that carry commercial or legal weight rather than technical:

| | |
|---|---|
| Management fee on a second gateway | Two gateways means two sets of webhooks and two reconciliations for three charges that hit the same card. Putting it on the same provider as the card payments is close to free. This is the one choice with real money attached |
| Identity verification | Cannot be chosen or priced until the biometric legal review closes. Nothing biometric is built before then |
| Automatic video links | Unconfirmed whether links can be issued automatically. Until someone checks, assume the team issues them by hand |

**Two consequences whatever is chosen.** Identity documents need retention, access and deletion rules, which become build tasks rather than policy notes. And card details go to the payment provider directly and never reach our database, which is also the fix for RK1.

---

## 10b. What the developer is actually being asked to do

The front end for all three apps is built, deployed and working. It currently keeps everything in the browser's own storage, so a study created on one machine exists only on that machine.

**The job is to put a real back end behind it.** PRD Section 23 is written for that: the data contract, what each resource must support, access rules, retention, the states nothing is drawn for, and what to build in what order.

Two things that follow for the business:

1. **The screens do not need to change.** This is a back-end job with a known front end, not a rebuild.
2. **Several decisions were taken during the build and have not been formally approved.** They are recorded in PRD Section 16 and in Section 8 above. They will be built as written unless changed.

---

## 11. Compliance and legal

| Area | Requirement |
|---|---|
| **Card data** | Never display a full card number to staff. Never store a CVV. Current designs breach both |
| **Identity documents** | Define who may view them, how long they are kept, how they are deleted, and where they are stored. Nothing in the designs covers retention |
| **Personal data** | Participants give name, contact details, address, profession, licence numbers and identity documents. Lawful basis, consent records, access, correction and deletion all need defining. The app has a consent screen; the back end needs the rest |
| **Shared pictures and videos** | A participant's profile picture and intro video are shared with clients only on that participant's explicit consent, which is off by default and can be withdrawn at any time. Withdrawal must take effect immediately |
| **Selfies and biometrics** | Open. D5. Biometric data carries stricter obligations in most markets |
| **Paid participation** | Participants are paid. Whether that makes them workers or contractors differs by market, and tax reporting obligations follow |
| **Holding balances** | Participants hold cash balances and points before withdrawal. In some markets holding customer funds is a regulated activity |
| **Public claims** | The landing page states a $2 withdrawal fee and payment within 2 to 3 working days. The client certificate claims business registration verified, and billing on file when a card is saved. Each must be true and evidenced |

---

## 12. Phasing

**Now:** one client runs one study with verified participants end to end. Participant onboarding and verification, client onboarding, study creation for Survey and Video Call 1:1, team review and approval, matching, screening, attendance, completion, rating, wallet and withdrawal, Trust Score and tiers, invoicing and payment, and the console modules that support all of it.

**Later, not in this build:** client team access, where several people share one client account and each sees only the studies assigned to them (Section 9a), the remaining four study types, reward points and redemption, referrals and streaks, the participant certificate, the Finance module and refunds, reports and moderation, sub-admins and the activity log, Pricing and Rewards editing, pricing plans, and anything involving a selfie or liveness check.

A later phase cannot start until the decisions it depends on are settled. Section 8 lists those.

---

## 13. What success looks like at launch

| # | Criterion |
|---|---|
| S1 | A participant can sign up, be verified, apply, take part and be paid without contacting support |
| S2 | A client can sign up, create a study, have it approved and see it fill without an account manager |
| S3 | Every figure a client or participant sees agrees with every other screen showing the same thing |
| S4 | Every team action is attributable to a named person with a timestamp |
| S5 | No screen displays a full card number or a CVV |
| S6 | Every Trust Score, tier, point value and redemption matches the policy exactly |
| S7 | Every control in all three apps does something |
| S8 | A restricted or deactivated person is told why, and can appeal |
| S9 | The console's queues can be cleared by the expected team size at the expected volume |

---

*End of BRD.*
