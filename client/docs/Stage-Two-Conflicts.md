# Stage two: where the four sources cannot all be satisfied

**For Jim.**

Stage two wired the behaviour. Four things govern it and they do not agree:
the **58 step platform workflow**, the **internal team console** document, the
**signed Trust and Rewards policy** of 20 August 2026, and the **Figma file**.

The order of precedence we are building to (Rule 7 in `client/CLAUDE.md`):

- the **workflow** governs behaviour;
- **Figma** governs appearance and every visible string;
- the **signed policy** governs scores, tiers, points, ratings and
  certificates, and outranks both there.

Every place they collide is below, with what the code now does and why.
Nothing here was decided quietly. **Ten of these need someone to decide.**

---

## A. Decisions taken in code, because the order of precedence settles them

### A1. Client ratings are three states, not fifteen stars — **the biggest change**

| Source | Says |
|---|---|
| **Signed policy**, sign-off | "Client ratings are confirmed as part of this build, so that question is closed. They are the three states already in the workflow: **poor, good or excellent**." |
| **Workflow step 52** | "the client rates each participant on three states: poor, good or excellent" |
| **Figma** `1627:98286` | Three dimensions — Expertise, Reliability, Communication — of **five stars each** |

The policy governs ratings and outranks Figma there, and it is explicit that
the question is *closed*. The Rate panel now records **one rating in three
states**. The frame's card, heading, person row, review box and footer are
unchanged; the three five-star rows became one three-state row.

**This is the only place in the build where a signed-off frame's control was
replaced rather than kept.** If that is wrong, the policy sign-off has to
change, not the code.

**And the policy contradicts itself here.** Its Trust Score table is
denominated in five stars — 5★ +4%, 4★ +3%, 3★ +1%, 2★ −2%, 1★ −3% — while
its sign-off says three states. `lib/policy.ts` maps them:

```
excellent -> 5 stars -> +4%
good      -> 4 stars -> +3%
poor      -> 2 stars -> -2%
```

**Nobody has signed those three numbers.** They are marked `OPEN` in the code.
3★ (+1%) and 1★ (−3%) are now unreachable. **Decision needed.**

### A2. Publish Study does not publish

Workflow steps 7, 9 and 11 put the team between the client and a live study.
**Figma agrees** — the Published frame says so in its own words: *"Your study
has been summited for review!"* and *"Our internal team will have a quick
review on the study within 24 hours and will get it live for the
participants."*

So Publish Study creates a study in a new `in_review` state. Only the team's
approval moves it to `recruiting`. There being no team here, it advances on a
timer, `TEAM_REVIEW_MS` in `mock/store.tsx`, the single fake delay in the
build.

**No frame draws `in_review`.** There are three Studies tabs — Ongoing,
Drafts, Completed — and a study waiting on the team is none of them. It sits
under Drafts with an "In Review" pill beside its name, which the Drafts table
has no column for. **A frame for this state would help.**

### A3. "Billing" is not a state

Figma draws a Billing pill beside Recruiting and Completed. The lifecycle has
no such state: a study is `completed`, and Billing is what we call a completed
study that still owes money. It is derived, so a study can never be both.

### A4. A study has three repeat rules, not two

The policy guardrail and workflow step 57 both say: *"Each study can set its
own rule on repeat participants: allow them, prefer fresh people, or exclude
anyone who has taken part before."* The Audience step draws the first and the
third. **"Prefer fresh people" has been added**, in the policy's wording.

### A5. Two stage screening has no frame

Workflow step 28: the three questions that decide eligibility are asked first,
and only those who pass see the full screener. Step 29 adds that a borderline
answer on the full screener is *held for review*, not rejected. The Screener
composer is one flat list in Figma. It now carries two labelled bands.
**A frame for this would be better than my band.**

### A6. Support reply times exist in the workflow and nowhere in Figma

Step 56 and the internal console both commit to: one working day for clients,
two for participants, anything about money within one day. **No frame in the
Help section carries a reply time, an SLA, a queue position or business
hours.** The client-facing times are now on the Need Direct Help? card and the
Sent successfully! dialog.

Note on wording: the workflow calls the first responder an "AI agent". That
phrase appears **nowhere** in the build or in these documents, per your
instruction. The frames' own `FI-Smart Assitant` badge is kept verbatim.

### A7. The unpaid-incentives alert has no frame

Step 53: *"The client's screen shows a red alert on login while incentives are
unpaid."* It is now a band at the top of the dashboard. **It costs that screen
two points of visual difference — 2.65% to 4.63% — because it pushes every row
below it down.** That is the only screen in the build above 3%, and it is
there because the workflow requires something Figma never drew.

---

## B. Where the workflow needs something and Figma has no answer

### B1. Client approval of respondent payouts — step 46. **You asked where this should live.**

The workflow is unambiguous:

> "The platform builds the payout list from verification, attendance and
> completion. The client confirms it against their own approved list, so
> nobody can be added who was not approved into the study. Anyone who
> completed the study is paid. The tick is a fraud check, not a judgement on
> their answers. **Nothing leaves the account until that is done.**"

The Pay tab draws nothing of the kind. It is a statement — due, deposit, total,
an itemised bill, settled transactions — and its only action settles the
*client's own* bill.

**It now lives on the Pay tab**, as a section under the billing card. That is
the right home because:

1. the approval is **per study**, and the Pay tab is the study's money screen;
2. everything the approval needs — attendance, the session code, completion —
   is already counted on this study;
3. the alternative homes are worse: Results is about findings, and the global
   Payments page is about the client's invoices, not participants' earnings.

A row cannot be approved unless the session code is confirmed on **both**
sides, per step 42. **It needs a frame.**

### B2. No frame draws the client's side of the session code

Step 42: *"A code is generated at the end of every session and shown to both
sides. The participant enters it and so does the client or moderator. No code,
no payment."* Figma draws the code as a read-only value with a Copy icon
(`PinCard`) — the display, not the entry. **Mark Completed stands in for the
client's entry** and is refused with "No code, no payment" when the
participant's side is missing. A proper entry control needs designing.

### B3. Three respondent states reach a table with no pill drawn for them

The Recruited table draws Applied, Qualified and Disqualified, which line up
neatly with step 34's yellow, green and red. The lifecycle also puts
**Recruited, Scheduled and No-show** in that table. They borrow the tone of
the light they carry. **Three pills to draw.**

### B4. `cancelled` has no frame either

Delete Study? now moves a study to `cancelled`. Nothing draws a cancelled
study. It currently files under Completed.

---

## C. Numbers that disagreed, and which one was a literal

Everything on every screen is now counted off one participant list
(`mock/db.ts`, counted by `lib/derive.ts`). These are the literals that went,
and what replaced them.

| Screen | Held | Now |
|---|---|---|
| **Studies list**, digital payments row | Required 12, Qualified 8, Completed 3 | 30 / 35 / 20, which is what that study's own header always said |
| **Dashboard tiles** | 4 / 72 / 1,786 / 91 / $124.8 | Counted: ongoing, completed, people hired, mean trust score, mean incentive |
| **Study cards**, progress bars | Three bar segments measured off the frame, printed beside counts that contradicted them | The counts |
| **Results tiles** | Completed 20/30, Avg. Trust Score 92, Rated By You 11/20 | Counted; "Rated By You" is the number actually rated |
| **Pay tab** | Deposit $3,000, Total Cost $4,000, Due $1,000, four billing lines | All four derived from the rates × people delivered. **Figma's own figures come out exactly**: $100 + $400 + $2,000 + $200, less a $3,000 deposit |
| **Payments** | Five identical invoice rows — same number, same study, same date, same $750 — totalling $3,750 under a $6,874 tile | One invoice per completed study, per step 53 |
| **Pool and Recommended** | A score printed beside each person | Derived from the policy: 50 + studies completed + the last ten ratings, clamped |
| **Recruited, Results, Matched** | Three separate seeded arrays of ten | One list per study, filtered by state |

**Two Figma figures do not reconcile and one of them is wrong.** On the
"Pay, due as completed" frame the Total Cost tile reads **$3,850** while the
billing card immediately below it totals **$3,350**, and the due figure of
$350 only works with $3,350. Everything else on both Pay frames reproduces
exactly from the rates. **The $3,850 tile is the odd one out.**

---

## D. Still open, and not decided here

1. **A1's three numbers.** What poor, good and excellent are worth on the
   Trust Score. The policy gives a five-star table and a three-state rating
   and does not join them.
2. **Micro-panels and self-serve.** The vendor scope excludes client-built
   micro-panels as a later phase, workflow step 23 marks them **LATER PHASE**,
   and the workflow's own banner says *"THIS IS A MANAGED PLATFORM. EVERY
   STUDY IS RUN BY THE FOCUS INSITE TEAM, AND THERE IS NO SELF-SERVE OPTION IN
   THIS BUILD."* **Twenty-four Pool frames draw the opposite** and let a
   client search the pool, invite individuals, build and edit panels, and
   launch a study from one. You asked me not to resolve this, so **nothing is
   gated**. The workflow says such things should appear as COMING SOON; say
   the word and it is a one-line change in one file.
3. **The client certificate.** `1663:104813` claims a "Human Layer Buyer
   Certificate" — the respondent app's brand, not Focus Insite — with four
   verified items and **the same Cert. ID as respondent Ferry L**
   (`HL-R-9F2A-3K7P`). The policy's certificate is the *participant's*:
   FOCUS INSITE VERIFIED, ID of the form `FI-7K42-9QX1`, valid twelve months,
   publicly checkable, unlocked by ID and selfie. The policy covers
   participants only, so it neither authorises nor forbids a client
   certificate. **Left exactly as Figma draws it.** The shared ID is a bug
   whichever way this goes.
4. **Step 10's 20% setup fee** has nowhere to appear. The Pay tab's deposit is
   the *incentive* deposit for the full sample, which is step 33 and step 54,
   not step 10. The figure is computed (`billing().setupFee`) and displayed
   nowhere.
5. **Step 36's management fee** — "taken from the card the day before the
   session runs" — is not a line on the billing card. Figma's four lines are
   Platform, Recruiting, Incentives and Moderation.
6. **slimCD and Stripe.** Step 10 says client card payments run through
   **Stripe**; step 36 says they run through **slimCD**. Both are client card
   payments. No screen names either.
7. **Step 34's red / yellow / green** is implemented as a function
   (`applicantLight`) and shown through the existing status pills. No frame
   draws the three lights as lights.
8. **Step 44's over-recruitment** — "eight for six, twelve for ten" — is not
   modelled. No screen shows a target separately from a sample size.
9. **Step 49's tax form** at $600 earned is participant-side and off-platform.
   Nothing client-side references it.
10. **"No public leaderboard"** is a policy guardrail. The Pool ranks people
    by score and tier, which step 24 requires. A client-only ranked list is
    probably not what the guardrail means, but it is worth a sentence from
    whoever wrote it.

---

## E. Where all four agree, for the record

- **In Review** (`1484:81502`): "Our team will just review your account
  credentials quickly and confirm through email within few hours!" — a client
  account is approved by people, exactly as steps 1 to 3 say.
- **Published** (`1518:92376`): a submitted study is reviewed before it goes
  live, exactly as steps 7 and 11 say.
- **Masked profiles**: step 27 allows first name, role, location and
  experience, and no surname, email or phone. No email address or phone number
  exists anywhere in the client app's data.
- **Tiers**: Silver 50+, Gold 70+, Platinum 90+ in the policy, and the same
  three chips in Figma.

---

## F. Divergences the functional pass forced, 26 September 2026

Making every control work turned up places where a frame's content cannot
survive being acted on. Each is a decision reported, not taken quietly.

11. **The respondent screens named two different people.** `1627:97305` and
    `1627:97609` draw a row that names one person and a rail that names John M,
    and the Rate panel names a third. Figma governs appearance, but a build
    where clicking Samantha T opens a profile headed John M is wrong whichever
    frame you follow. **The rail, the breadcrumb and the rate card now name the
    person you opened**, taking the four facts the participant list carries
    (name, role, score, tier) and keeping the frame's detail for the rest,
    which a `Person` does not hold. Figma loses on this one because it
    contradicts itself; confirm that is acceptable.

12. **`Publish Study` and `Proceed to Publish` are drawn disabled on every
    frame but one.** Taken literally the Create flow cannot be finished. Figma
    draws `Publish Study` enabled on the in-person frame (`1622:87629`) and
    disabled on the other three, so both states are designed, and the frame's
    own secondary button says what opens it: "Add Card to Publish". Step 4
    opens when the type's setup exists; step 5 opens once the study has a card
    to charge. Both still render disabled on first load, so no frame moves.
    **Confirm the gate on step 5 is a card and not something else** — a plan, a
    credit balance, or team approval.

13. **The Pool opens unfiltered, so `Clear All` has nothing to clear.**
    `1645:161430` opens with six chips on. Opening filtered means a client
    cannot see the whole pool and, as reported, cannot take the chips off. The
    build opens unfiltered, and `Clear All` is therefore closed with a reason
    until a filter is on. **This is the divergence already recorded in the
    designer file, now with a visible consequence.**

14. **Figma's password-reset branch is not built.** `1794:80317` Check Email,
    `1794:80515` Set New Password and `1794:80698` Password has been updated!
    are a reset flow nobody has asked for. `Forgot Password?` was drawn as text
    and wired to nothing; it now opens the Check Email that exists and returns
    to sign-in. **Three screens to build if reset is in scope.**

15. **A study holds more participations than there are people.** The seeded
    counts the Manage header depends on (30 required / 60 applied / 35
    qualified / 20 completed) need 57 participations on one study against 48
    people in the pool, so a person appeared in several states at once and
    every per-person action found the wrong one. Repeats now carry a suffixed
    id. **Either the pool needs more people or a study needs fewer
    participants; the frames cannot have both.**

16. **Ask Support reuses the Rate panel's placeholder.** `1663:104557` puts
    "Describe your experience with Ferry here.." on the Subject and Message
    fields of a support form. Kept, because Figma governs strings and Rule 1
    keeps typos. **It reads as a mistake to anyone using it.**

17. **The Pay tab's "Total Cost" disagrees with its own billing card**, as
    already recorded: $3,850 on the tile against $3,350 in the breakdown.
    Paying a study's balance now settles that study's invoice, so the figure
    is load-bearing rather than decorative.
