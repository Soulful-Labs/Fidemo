# Client app: what the build needed that Figma did not give

Written after building all 57 client screens against the Figma file
`Q83MnpAyJuc6RttXYbWudH`. Every screen was matched by rendering it at 1440 in
headless Chromium and diffing it against its own frame; the whole set sits at a
mean difference of **1.26%**, worst **2.55%**.

This file is the other half of that work: everything the build had to invent,
every frame that could not be read, every place two frames of the same screen
disagree, and every place the frames contradict the workflow. Nothing here was
resolved silently — each item is recorded as drawn.

---

## 1. Built without a frame

These exist in the build because the app could not work without them. None has
a Figma frame.

| Thing | Where | Why it had to exist |
|---|---|---|
| **Toast** | every screen | 32 controls had no destination drawn. Rather than leave them silent, each confirms with a one-line toast, bottom centre, three seconds. No frame draws a toast anywhere in the file. |
| **Dashboard, no-studies state** | `/dashboard/empty` | The frame briefed as the empty dashboard (`826:86322`) is switched off and contains an older copy of the *populated* dashboard. The empty state is invented: zeroed figures, "No ongoing studies yet." and a Create Study button. |
| **Demo note on Check Email** | `/check-email` | "Demo build: no email is sent. Use code 123456 wherever one is asked for." The only string in the build that is not from a frame, added deliberately so the demo does not look broken. |
| **In Review → Welcome advance** | `/in-review` | Nothing on the In Review frame advances. Approval happens off-screen, so the demo moves on after five seconds. |
| **Seed data for every list** | everywhere | Studies, respondents, invoices, tickets, panels. Taken from the frames where legible and extended where a list needed more rows than the frame shows. |

---

## 2. Hidden frames — drawn, then switched off

A hidden frame renders as a 1×1 image while its JSON still reports the real
size. `get_metadata` gives layer names and geometry but not the text inside
component instances, so some of these cannot be read at all.

| Frame | Id | Size | What is readable |
|---|---|---|---|
| Dashboard, empty | `826:86322`, `826:85659` | 1440×1150 | An older copy of the populated dashboard, not an empty state |
| Video Call Setup, Platform Managed | `1518:92891` | 1440×2306 | — |
| Study Setup & Pricing | `1518:93673` | 1440×2642 | A reference board of three pasted bitmaps, not a screen |
| Pay while ongoing (completed flow) | `1697:55119` | 1440×991 | Consistent: a completed study has nothing ongoing |
| **Mark all as No-show** | `1697:63580` | 460×335 | Title bar and the heading "Didn't everyone attend?" only. **Both body strings are unreadable** — the nodes are named "Error". Built with the readable parts and the body left blank. |
| **Mark as solved?** | `1663:104539` | 460×285 | Title and check mark only. **Body unreadable**, same reason. Built and left blank. |
| **Select Pricing Plan** | `1484:81400` | 1440×820 | **Nothing.** Every text node is named "Tagline", "Caption", "Title" or "Text". Structure only: two visible plan cards (a third hidden), each with a price, a period, a description, a CTA and five ticked features. **Not built.** |
| Question menu | `1663:104538`, `1645:163181` | 165×92, 120×131 | — |

**Please turn `1484:81400` back on, or send the plan copy separately.** It is
the only screen in the whole client app that is missing outright, and pricing
is the one subject nothing else in the build touches.

---

## 3. Frames of the same screen that disagree

Each of these is one screen drawn more than once, with the copies not matching.
The build had to pick one; the choice is noted.

| Screen | The disagreement | What the build does |
|---|---|---|
| **Respondent result** | The left card is **824px** wide on `1627:97305` and **836px** on `1627:97609` and `1627:97901`, moving the gutter to the rail from 25 to 13 | Keeps 824, the first one signed off |
| **Respondent identity** | The breadcrumb says **Ferry L**, the rail and the strip say **John M**, the Rate panel says **Ferry L.** — same person, three frames | Names the row from Results and the profile from the rail |
| **Respondent experience** | The profile panel says **10 years** on the Dashboard frame and **12 years** on the Manage frame | Says 10 |
| **Respondent streak** | The rail says **24 weeks**, the panel says **3 months** | Each keeps its own frame's string |
| **Study seed** | Results, Bill Payment and RATED carry the breadcrumb or name of a *different* study from the one their header draws | Keeps each frame's own strings |
| **Invoice Details** | The paid frame names the study "Mobile App Usability Testing"; the unpaid one uses the study's title | Keeps both as drawn |
| **Audience** | `1622:81615` and `1518:91273` differ on the field list, the forecast and the top-bar button | Built as two screens, the numbered step being canonical |
| **Diary glyph** | The Manage header and the Create About card draw Diary as a book with a pencil; the Studies cards frame draws it as bars | `StudyTypeTag` takes an icon override so each keeps its frame's glyph |
| **Mislabelled frame** | `1645:162132` is named "My Panel - Matched" and draws the **Panel Details** tab | Built as Panel Details |
| **Moved node id** | `1627:103111` became `1769:93628` between two turns, same content | Recorded; ids are treated as a starting point, not a fact |
| **Dialog sizes** | Most 460px dialogs use a 24px title on 44px of padding; **Discard the micro-panel?** uses 20 on 33 | `Modal` gained a `compact` flag |
| **Input heights** | Organization Details uses 48px boxes; Payment Method, one step later, uses 38px | Measured and matched per screen |

---

## 4. Frames that contradict the workflow or the signed policy

Recorded, not resolved. These need a decision from the people who own the
documents, not from the build.

### 4.1 The client can run studies unaided

The vendor scope document excludes client-built micro-panels as a later phase,
and the workflow says studies are run by the Focus Insite team. **The Pool
frames draw the opposite.** Given only these screens, a client can:

1. Search the whole participant pool by natural language and by nine filters
2. See any respondent's score, tier, verification, full profile and review
   history
3. Invite any individual to a live study
4. Build and edit their own micro-panels from live criteria, with a forecast
5. Save respondents into them, and delete them
6. Invite a whole panel at once, and **Launch Study** straight from a panel

Nothing in the 24 Pool frames routes any of this through Focus Insite staff,
and nothing marks micro-panels as a later phase.

### 4.2 Nothing approves a respondent's payout

The workflow says earnings are credited on completion but the payout waits on
client approval. **The Pay tab has no approval step.** It is a statement: due,
deposit paid, total, an itemised bill and settled transactions. There is no
per-respondent row, no approve control, no payout list. Its only action is Pay
Balance, which settles *the client's own bill*.

### 4.3 The client certificate has nothing behind it

`1663:104813` claims **"Human Layer Buyer Certificate"** — the respondent app's
brand, not Focus Insite — with four verified items: EIN Business verified,
Domain ownership confirmed, Verified billing on file, Data handling agreement.
The signed Trust and Rewards policy **covers respondents only**, so none of the
four has a policy behind it. The frame shows no issuer, no expiry, no
verification link and no way for a third party to check it.

**And the Cert. ID is `HL-R-9F2A-3K7P` — the same string the respondent panels
use for Ferry L.** As drawn, a client and a respondent share one certificate
number.

### 4.4 Where the frames and the workflow do agree

In Review (`1484:81502`) says "Our team will just review your account
credentials quickly and confirm through email within few hours!" A client
account is approved by people before it opens, exactly as the workflow says.
This is the one place in the client app where they agree about staff being in
the loop.

---

## 5. Smaller things the designer should know

- **Eight of the nine FAQs have no answer in the frame.** Only the first
  accordion is drawn open; on every other one the Description text node is
  switched off (`hidden="true"` on `1663:104207` and its siblings), so the
  frame carries nine questions and one answer. The build now has all nine,
  and the eight new ones are written from the 58 step workflow, the signed
  policy and what the product does — certificates, managed vs self-managed,
  the invoice lines, underfilling, how completion is decided, the Pool, using
  an existing audience, and editing after launch. Each one names its source
  in a comment above `FAQS` in `src/mock/help.ts`. **A writer should approve
  this copy**; it is the only substantial body text in the build that did not
  come from a frame.
- **No reply time anywhere in Help.** No SLA, no queue position, no business
  hours. The only statement about timing is on the Sent dialog: "Our team and
  assistants will review and reach out to you shortly."
- **The support reply carries a badge** reading "FI-Smart Assitant here!" — the
  frame's own spelling. No frame shows what it does: no quoted article, no
  handover, no escalation control.
- **Typos kept, per the rule that Figma governs**: "Sudy target fulfilled"
  (Settings), "Edit Filters Crietria" (Create Micro-panel), "FI-Smart
  Assitant", "will be confirmed  by" (double space, no-show dialog),
  "$350 paid successfully!" vs "Paid $350 successfully!" on neighbouring
  screens, and "20206" as a year on the RATED panel.
- **The Ask Support panel reuses the Rate panel's placeholder** in both its
  Subject and Message fields: "Describe your experience with Ferry here.."
- **Rating & Reviews seeds the wrong voice.** On the client's own page the
  review bodies read "It was great working with Luke…" — a client praising a
  participant — where they should be participants writing about the client.
- **The left navigation is pinned to a 1024 viewport** in every frame: the
  account card sits at y 895 whatever the artboard height. The app puts it at
  the bottom of a sidebar that fills the page, so on tall frames it lands
  lower. Roughly 0.1% of every tall screen's difference.
- **Artwork that could not be reproduced**: the onboarding showcase panel
  (~0.84% of those three screens), the study header photographs, the
  certificate seal's curved VERIFIED lettering, the chat attachment screenshot,
  and the card brand marks.
- **No stethoscope glyph** exists in the icon set, so the roles chip in Pool
  uses the nearest available mark.
- **The Pool opens pre-filtered in the frame.** Six chips are already on —
  Physician, Healthcare, Pharma, Fitness & Nutrition, New York US, English —
  narrowing 260 people to 208, with nothing saying why and no way to take any
  of them off. Now that the rail works, the build opens the pool unfiltered
  and every chip removes itself. If the frame meant those to be a saved
  default, it needs a control that says so.

---

## 6. Still unbuilt, deliberately

| Item | Reason |
|---|---|
| **Select Pricing Plan** | Hidden; not one string readable |
| **Mark all as No-show**, body copy | Hidden; body strings unreadable |
| **Mark as solved?**, body copy | Hidden; body strings unreadable |
| **Password reset branch** | `1794:80317`, `1794:80515`, `1794:80698` found in Onboarding; never briefed |
| **Completed study row menus** | `1697:56712`, `1728:95186` — 200×92 and 160×191, different from the four Studies-list menus already built |
