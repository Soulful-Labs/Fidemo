# HumanLayer respondent app, build brief

**How to use this file:** paste the whole thing as your first message in Claude Code.
Its first instruction tells Claude Code to save it as `CLAUDE.md` in the repo, so it
survives `/clear` and context compaction. Also put `PRD-Respondent-App-v2.md` in the
repo root before you start, since this brief refers to it throughout.

---

## Step 0, do this before anything else

1. Save this entire message to `CLAUDE.md` in the repo root, word for word.
2. Confirm `PRD-Respondent-App-v2.md` exists in the repo root. If it does not, stop and tell me.
3. Scaffold the project as described in "Stack and setup".
4. Write `tailwind.config.ts` exactly as given in "Design tokens".
5. Write `src/routes.ts` with every route in "Route map", each pointing at a placeholder component.
6. Write `src/mock/types.ts` from "Data shapes".
7. Run the dev server and confirm it builds.

Then stop and show me the route list. Do not build any screens yet.

---

## What we are building

The respondent mobile app for HumanLayer, a paid research participation platform.
A verified person finds studies, applies, takes part, and gets paid.

Front end only. No backend, no API calls. All data comes from `src/mock`.

**This has to be a working prototype, not a set of static screens.** Every button,
tab, link, card, toggle and form does something real. Someone must be able to pick up
a phone and walk the whole journey from sign up to getting paid without hitting a dead
control. That is the single most important requirement in this brief.

---

## Stack and setup

```
npm create vite@latest . -- --template react-ts
npm i react-router-dom
npm i -D tailwindcss @tailwindcss/vite
npm i geist
```

Vite, React, TypeScript, Tailwind, React Router. No other UI libraries. No component
kits. No state library, React context is enough.

### Folder structure

```
src/
  components/ui/      Button Input Tag Toggle Modal BottomSheet TopBar TabBar Picker Stepper
  components/app/     StudyCard ScoreDial StatTile NotificationRow EmptyState ProgressBar Timeline
  screens/auth/
  screens/onboarding/
  screens/dashboard/
  screens/studies/
  screens/wallet/
  screens/points/
  screens/profile/
  screens/support/
  mock/               data.ts types.ts store.tsx
  lib/                format.ts rules.ts
  routes.ts
```

---

## Hard rules

1. **No dead controls.** Every interactive element routes somewhere, changes state, opens something or shows a toast. If a control has no destination yet, it opens a `ComingSoon` sheet naming the screen. Never a no-op.
2. **No hardcoded colours or sizes.** Only Tailwind tokens from `tailwind.config.ts`.
3. **One StudyCard.** Every list uses the same component with different props. Never fork it per screen.
4. **The PRD is the spec.** `PRD-Respondent-App-v2.md` lists every screen, field, state, exact label and business rule. Read the relevant section before building a screen. Use the exact copy it quotes.
5. **Where Figma and the PRD disagree, the PRD conflicts register wins.** Section 14.
6. **Components under 150 lines.** Split when longer.
7. **Do not install packages without asking.**
8. **One screen or one flow per turn.** Stop and show me. Do not batch.
9. Do not build the selfie capture. Legal review is open. ID document upload only.

---

## Design tokens

Write this to `tailwind.config.ts` exactly.

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#fca311', secondary: '#3fb984' },
        yellow: { 400:'#fdb541', 500:'#fca311', 600:'#e5940f', 700:'#b3740c', 900:'#6a4407', 1000:'#513303' },
        green:  { 500:'#3fb984', 600:'#39a878', 700:'#2d835e', 900:'#1a4e37' },
        bg:     { 0:'#0c0800', 1:'#15130f', 2:'#201e19' },
        bgAlt:  { 0:'#020805', 2:'#202623' },
        stroke: { 1:'#101512', 2:'#202623', 3:'#282d2b' },
        text:   { title:'#fafafa', subtitle:'#e1e1e1', body:'#b9b9b9', disabled:'#5e5d5b' },
        cta:    { primary:'#fca311', primaryText:'#15130f', secondary:'#513303',
                  secondaryText:'#fca311', tertiaryStroke:'#4b4946', tertiaryStrokeDisabled:'#2d2b28' },
        tier:   { gold:'#e4b300', platinum:'#9139f6', silver:'#b9b9b9' },
        state:  { success:'#00cc66', danger:'#e33a38', dangerBg:'#3a1a17' },
        accent: { purple:'#ac99fb', blue:'#68b6f1' },
      },
      backgroundImage: {
        'yellow-fade': 'linear-gradient(180deg, #fca31126 0%, #fca31100 100%)',
        'green-fade':  'linear-gradient(180deg, #3fb98426 0%, #3fb98400 100%)',
      },
      spacing: { 0:'0px', 0.5:'2px', 1:'4px', 1.5:'6px', 2:'8px', 3:'12px', 4:'16px', 5:'20px', 6:'24px' },
      borderRadius: { none:'2px', sm:'8px', md:'12px', lg:'16px', xl:'24px', full:'100px' },
      borderWidth: { 1:'1px', 1.5:'1.5px', 2:'2px', 4:'4px' },
      fontFamily: { sans: ['Geist','system-ui','sans-serif'] },
      fontSize: {
        label:          ['12px',{ lineHeight:'1.4', letterSpacing:'-0.01em' }],
        'text-regular': ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'400' }],
        'text-medium':  ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'500' }],
        'text-large':   ['14px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'600' }],
        'body-regular': ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'400' }],
        'body-medium':  ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'500' }],
        'body-large':   ['16px',{ lineHeight:'1.4', letterSpacing:'-0.01em', fontWeight:'600' }],
        'title-s':      ['18px',{ lineHeight:'1.4', letterSpacing:'-0.02em', fontWeight:'500' }],
        'title-m':      ['20px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'500' }],
        'title-l':      ['24px',{ lineHeight:'1',   letterSpacing:'-0.02em', fontWeight:'600' }],
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Two background palettes, do not mix within a screen.**
Warm (`bg.*`) for auth, onboarding, dashboard, studies, profile.
Green tinted (`bgAlt.*`) for Trust Score, Reward Points and Wallet.

**Success and error.** Use `state.success` for green and `state.danger` for red.
Red is only ever used for something that is wrong: No Show, Rejected, destructive
confirmations, validation errors. Never for a neutral or informational state.

### Layout constants

| Thing | Value |
|---|---|
| Frame width | 375px, centre the app in a phone shell on wider screens |
| Side gutter | 16px, content width 343px |
| Title bar | 56px, 93px when it carries a progress bar |
| Bottom nav | 85px |
| Bottom CTA bar | 96px, fixed, sits above the nav |
| Card radius | 16px |
| Button height | 48px primary, 38px secondary, 24px inline |
| Input height | 48px, 72px with a label above |

---

## Route map

Write all of these into `src/routes.ts` in step 0.

### Auth
| Route | Screen |
|---|---|
| `/` | Redirect. Signed in goes to `/dashboard`, otherwise `/signup` |
| `/signup` | Create your account |
| `/signin` | Welcome back |
| `/verify-otp` | Enter OTP |
| `/forgot-password` | Reset Password |
| `/check-email` | Check Email |
| `/reset-password` | Set New Password |
| `/password-updated` | Password Updated |

### Onboarding
| Route | Screen |
|---|---|
| `/onboarding/about` | About You, 1 of 3 |
| `/onboarding/professional` | Get Personalized Studies, 2 of 3 |
| `/onboarding/identity` | Identity Verification, 3 of 3 |
| `/onboarding/welcome` | Welcome to HumanLayer |

### Dashboard tab
| Route | Screen |
|---|---|
| `/dashboard` | Dashboard. Renders the Get Started variant when the user has 0 completed studies |
| `/notifications` | Notifications |

### Studies tab
| Route | Screen |
|---|---|
| `/studies` | Explore |
| `/studies/saved` | Saved |
| `/studies/mine` | Redirect to `/studies/mine/invites` |
| `/studies/mine/invites` | My Studies, Invites |
| `/studies/mine/scheduled` | My Studies, Scheduled |
| `/studies/mine/drafts` | My Studies, Drafts |
| `/studies/mine/applied` | My Studies, Applied |
| `/studies/mine/history` | My Studies, History |
| `/studies/:id` | Study Detail. Layout and actions switch on study type and status |
| `/studies/:id/screener` | Screener questions |
| `/studies/:id/applied` | Applied successfully |
| `/studies/:id/schedule` | Pick date, time, and location for in person |
| `/studies/:id/schedule/agreement` | Call recording agreement |
| `/studies/:id/schedule/review` | Review Schedule |
| `/studies/:id/schedule/done` | Scheduled confirmation |
| `/studies/:id/reschedule` | Same as schedule, confirms as a reschedule |
| `/studies/:id/pin` | Enter attendance PIN |
| `/studies/:id/pin/done` | PIN confirmed |
| `/studies/:id/survey` | Survey questions |
| `/studies/:id/survey/done` | Completed successfully |
| `/studies/:id/diary` | Diary overview, day list |
| `/studies/:id/diary/:day` | One diary day |
| `/studies/:id/rate` | Rate the client |
| `/clients/:clientId/ratings` | Client Ratings |

### Wallet tab
| Route | Screen |
|---|---|
| `/wallet` | Wallet |
| `/wallet/withdraw` | Withdraw |
| `/wallet/withdraw/method` | Select payout method |
| `/wallet/withdraw/done` | Withdrawal request sent |
| `/wallet/earnings` | Earning History |
| `/wallet/earnings/:txId` | Transaction Details |
| `/wallet/payouts` | Payout and Payout History |
| `/wallet/payouts/:payoutId` | Payout Details |
| `/wallet/payout-methods` | Manage Payout Methods |
| `/wallet/payout-methods/add` | Add Bank Account |
| `/points` | Reward Points, tabs for Points History and Redeem History |
| `/points/redeem` | Redeem |
| `/points/redeem/confirm` | Confirm Redeem |
| `/points/redeem/done` | Redeemed successfully |
| `/points/how-it-works` | How reward points work |

### Profile tab
| Route | Screen |
|---|---|
| `/profile` | Profile |
| `/profile/edit` | My Profile, two tabs |
| `/profile/certificate` | Human Certificate |
| `/profile/referrals` | Refer and Earn |
| `/profile/settings` | Account Settings |
| `/profile/settings/password` | Change Password |
| `/profile/settings/notifications` | Email Notifications |
| `/profile/settings/consent` | Consent and Cookies |
| `/profile/settings/deactivate` | Deactivate Account |
| `/trust-score` | Trust Score Details |
| `/trust-score/rules` | Trust Score Rules |
| `/trust-score/tiers` | How Tiers Works |
| `/support` | Help and Support |
| `/support/tickets` | Support Tickets |
| `/support/tickets/:id` | Support Chat |
| `/support/contact` | Contact us |

### Modals and sheets, not routes
Consent, Details info, Why Screener, Exit Screener, Locations, Reject Study, Reject
Invitation, Cancel Study, Remove Bank Account, Logout, Match Score explainer, Filters,
Sort menu, Education Level picker, Industry picker, Profession picker, ID type picker,
tier upgrade, points earned, streak detail.

Each is a component with `open` and `onClose`. They do not change the URL.

---

## Where every button goes

This is the functionality spec. Build to it.

### Auth and onboarding
| Screen | Control | Does |
|---|---|---|
| Sign Up | Sign Up | Validates, then `/verify-otp` |
| Sign Up | Log In | `/signin` |
| Sign Up | Sign up as a researcher client | `ComingSoon` sheet, "Client app" |
| Sign Up | Terms, Privacy links | `ComingSoon` sheet |
| Sign In | Login | `/dashboard` |
| Sign In | Forgot Password | `/forgot-password` |
| Sign In | Sign Up | `/signup` |
| Enter OTP | Submit | Any 6 digits pass, go to `/onboarding/about` |
| Enter OTP | Resend | Restarts the 60s timer, toast "Code sent" |
| Enter OTP | Cancel | Back to `/signup` |
| About You | info icon | Opens Details info pop-up |
| About You | Address field | Opens a fake autocomplete list, selecting one fills the field |
| About You | Upload Short Video | File picker, shows the file name, no upload |
| About You | Continue | Validates required fields, `/onboarding/professional` |
| Professional | Industry, Education | Open the pickers, selecting fills the field |
| Professional | Continue | `/onboarding/identity` |
| Identity | Select ID | Opens the ID type picker |
| Identity | Upload Front, Upload Back | File picker, shows the file name |
| Identity | Continue | Opens the Consent modal |
| Consent | Save and Continue | Saves toggles to the store, `/onboarding/welcome` |
| Welcome | Complete Profile | `/profile/edit` |
| Welcome | Explore Studies | `/studies` |

### Dashboard
| Control | Does |
|---|---|
| Points chip in the header | `/points` |
| Bell | `/notifications` |
| Trust Score card | `/trust-score` |
| Wallet Balance tile, This Month tile | `/wallet` |
| Studies In Review tile | `/studies/mine/applied` |
| All Time Studies tile | `/studies/mine/history` |
| Invite card, Schedule Session | `/studies/:id/schedule` |
| Scheduled card body | `/studies/:id` |
| Updates, View All | `/studies/mine/invites` |
| Monthly Streak card | Opens the streak detail modal |
| Recommended card | `/studies/:id` |
| Recommended, View All | `/studies` |
| Refer and Earn, Invite | Opens the share sheet, or copies and toasts |
| Refer and Earn, Copy Link | Copies to clipboard, toast "Link copied" |
| Notification row with an action | Routes per the table in PRD section 11 |
| Notification row without an action | Routes to the related screen |
| Mark all as read | Clears the unread state on every row and the bell dot |

### Studies
| Control | Does |
|---|---|
| Explore, My Studies, Saved tabs | `/studies`, `/studies/mine`, `/studies/saved` |
| Search field | Filters the visible list live, by title and description |
| Sort icon | Opens the sort menu, reorders the list on select |
| Filter icon | Opens the Filters sheet |
| Filters, Apply | Applies to the list and closes. Chips show active filters |
| Filters, Reset | Clears every filter |
| Study card body | `/studies/:id` |
| Study card, bookmark | Toggles saved, updates the Saved tab immediately |
| Accept and Apply | Sets status to `applying`, goes to `/studies/:id/screener` |
| Reject on a card | Opens Reject Invitation, on confirm removes it from Invites |
| Match score badge | Opens the match score explainer |
| Client name and rating on detail | `/clients/:clientId/ratings` |
| Get Support on detail | `/support/contact` with the study prefilled in the subject |
| View Directions | Opens a maps URL in a new tab |
| How It Works | Expands and collapses |

### The study state machine

The mock store holds a status per study. Actions move it. The detail screen, the card
actions and the My Studies tab a study appears in are all derived from this status.
Nothing else drives them.

| Status | Appears in | Primary action | Moves to |
|---|---|---|---|
| `available` | Explore, Recommended | Apply | `applying` |
| `invited_to_apply` | Invites, Explore invitations | Accept and Apply | `applying` |
| `applying` | not listed | Screener in progress | `applied` or `draft` |
| `draft` | Drafts | Resume Application | `applied` |
| `applied` | Applied | none, view only | `invited_to_schedule`, `invited_to_complete` or `rejected` |
| `invited_to_schedule` | Invites | Schedule Session | `scheduled` |
| `invited_to_complete` | Invites | Start Study | `in_process` |
| `scheduled` | Scheduled | Join Call, Submit PIN | `pin_confirmed` |
| `pin_confirmed` | Scheduled | Complete study | `in_process` |
| `in_process` | History | none, view only | `paid` |
| `paid` | History | Rate Client | stays `paid`, gains `ratedByUser` |
| `rejected` | History | none, view only | end |
| `no_show` | History | none, view only | end |

**Make the journey visible.** Since there is no backend, a few transitions need a
nudge so a demo can show the whole loop. Use a short fake delay and a toast:

- Submitting the screener moves `applying` to `applied`, then after 3 seconds to
  `invited_to_schedule` for session studies, or `invited_to_complete` for survey and
  diary studies, with a notification added to the list.
- Completing a study moves it to `in_process`, then after 5 seconds to `paid`, adding
  the reward to the wallet balance, 25 points to the points balance, and 1 to the
  Trust Score.

Put these timings in one place, `src/mock/store.tsx`, so they can be changed or
removed later.

### Scheduling flow
| Control | Does |
|---|---|
| Schedule Session | `/studies/:id/schedule` |
| Date chip | Selects the date. Only dates in the mock availability are enabled |
| Time slot | Selects the slot. Taken slots are disabled |
| Location row, in person only | Selects the location |
| Continue | `/studies/:id/schedule/agreement` |
| Agreement checkbox | Enables the button. Unchecked keeps it disabled |
| Agree and Join | `/studies/:id/schedule/review` |
| Confirm and Schedule | Sets status to `scheduled`, saves the booking, `/studies/:id/schedule/done` |
| Done | `/studies/:id` |
| Reschedule | `/studies/:id/reschedule`. Blocked with a toast after two reschedules, or within 24 hours of the session |
| Cancel Study | Opens Cancel Study. On confirm sets status to `available`, subtracts 2 from the Trust Score, toasts |

### PIN flow
| Control | Does |
|---|---|
| Join Call | Opens the mock Zoom URL in a new tab |
| Submit PIN | `/studies/:id/pin` |
| PIN entry | 6 digits. `407060` succeeds. Anything else shows "Incorrect PIN, check with your interviewer" |
| Submit | `/studies/:id/pin/done` |
| Done | `/studies/:id`, status now `pin_confirmed` |

### Screener, survey and diary
| Control | Does |
|---|---|
| Continue | Next question. Disabled until the current question is answered |
| Back | Previous question, keeping the answer |
| Close or back from question 1 | Opens Exit Screener |
| Save and Exit | Saves answers, sets status `draft`, goes to `/studies/mine/drafts` |
| No, Continue | Closes the sheet |
| Submit on the last question | `/studies/:id/applied` or `/studies/:id/survey/done` |
| Diary, Submit Progress | Marks the day complete, returns to the diary overview |
| Diary, Resume Study Day N | `/studies/:id/diary/:day` |
| Diary complete | Only enabled once 4 of 5 days are filled, per the PRD rule |

### Wallet and points
| Control | Does |
|---|---|
| Withdraw | `/wallet/withdraw` |
| Max | Fills the full balance |
| Change, on the payout account | `/wallet/withdraw/method` |
| Withdraw, on the amount screen | Validates against the balance, `/wallet/withdraw/done` |
| Done | `/wallet`, balance reduced, a new Processing row in Payout History |
| Earning History, View All | `/wallet/earnings` |
| An earning row | `/wallet/earnings/:txId` |
| Payouts | `/wallet/payouts` |
| A payout row | `/wallet/payouts/:payoutId` |
| Download Receipt PDF | Toast "Receipt downloaded", no file |
| Manage Payout Methods | `/wallet/payout-methods` |
| Add New Account | `/wallet/payout-methods/add` |
| Add | Validates, adds to the store, back to the list |
| Set As Default | Moves the Default chip |
| Remove | Opens Remove Bank Account, on confirm removes it |
| Reward Points card | `/points` |
| Redeem | `/points/redeem` |
| Points input | Live converts at 100 points to $1. Below 1000 disables Confirm with the reason shown |
| Confirm | `/points/redeem/confirm` |
| Redeem, on confirm | Deducts points, adds to the wallet, `/points/redeem/done` |
| info icon on Reward Points | `/points/how-it-works` |

### Profile
| Control | Does |
|---|---|
| Complete Profile | `/profile/edit` |
| Trust Score card | `/trust-score` |
| Learn More About Tiers | `/trust-score/tiers` |
| Trust Score info icon | `/trust-score/rules` |
| Human Certificate | `/profile/certificate` |
| Certificate share icon | Copies a link, toast |
| Refer and Earn | `/profile/referrals` |
| Account Settings | `/profile/settings` |
| Each settings row | Its own route per the route map |
| Save on any form | Writes to the store, toast "Saved", stays on the screen |
| Change Password, Submit | Validates the four rules live, then the Password Updated modal |
| Email Notification toggles | Write to the store immediately, no save button |
| Deactivate Account | Requires the password field, then the Account Deactivated modal, then signs out to `/signin` |
| Sign Out | Opens Logout, on confirm clears the session and goes to `/signin` |
| Help and Support | `/support` |
| An FAQ row | Expands and collapses |
| Contact Us | `/support/contact` |
| Submit on Contact us | Adds a ticket to the store, shows the success modal |
| Go To Chat | `/support/tickets/:id` for the new ticket |
| A ticket row | `/support/tickets/:id` |
| Send in the chat | Appends the message to the thread and clears the composer |

---

## Global interaction rules

1. **Bottom nav** is visible on the four tab roots and on list screens. It is hidden on detail screens, flows and modals.
2. **Back** always goes to the logical parent, not browser history, when they differ. Leaving a flow part way opens the matching exit confirmation.
3. **Toasts** for anything that changes state without navigating. Three seconds, bottom, above the nav.
4. **Form validation** runs on blur and on submit. Errors sit under the field in `state.danger`. Submit is disabled until the form is valid.
5. **Loading.** Any action that would hit a server shows a 600ms spinner or skeleton first. It should feel real.
6. **Empty states** for every list: Saved, Drafts, Applied, History, Notifications, Payout History, Referrals, Support Tickets. Use the exact copy in the PRD where it gives it.
7. **Disabled states** are visible and explain themselves. A disabled Reschedule button shows why on tap.
8. **Scroll position** resets on navigation, and is kept when returning to a list.
9. **The phone shell.** On a screen wider than 420px, centre a 375px frame with rounded corners on a plain dark background, so it demos well on a laptop.

---

## Data shapes

```ts
type StudyType = 'survey' | 'video_call' | 'group_video_call' | 'in_person' | 'in_person_group' | 'diary'

type StudyStatus =
  | 'available' | 'invited_to_apply' | 'applying' | 'draft' | 'applied'
  | 'invited_to_schedule' | 'invited_to_complete' | 'scheduled' | 'pin_confirmed'
  | 'in_process' | 'paid' | 'rejected' | 'no_show'

interface Study {
  id: string
  title: string
  description: string
  image: string
  type: StudyType
  industry: string
  matchScore: number          // 0 to 100
  reward: number
  durationMins: number
  endsAt: string
  daysLeft: number
  targetProfession: string
  client: { id: string; name: string; rating: number; reviewCount: number }
  locations?: { id: string; label: string; address: string }[]
  availability?: { date: string; slots: string[] }[]
  status: StudyStatus
  saved: boolean
  screener: Question[]
  tasks?: Question[]           // survey and diary questions
  diary?: { totalDays: number; minDays: number; completedDays: number[] }
  booking?: { date: string; slot: string; locationId?: string; rescheduleCount: number }
  pinConfirmed?: boolean
  timeline: { label: string; at: string }[]
  clientReview?: { stars: number; comment: string; expertise: number; reliability: number; communication: number; trustDelta: number }
  userReview?: { reliability: number; communication: number; comment?: string }
}

type Question =
  | { id: string; kind: 'single'; prompt: string; options: string[] }
  | { id: string; kind: 'multi'; prompt: string; helper?: string; options: string[] }
  | { id: string; kind: 'text'; prompt: string; placeholder?: string }
  | { id: string; kind: 'image'; prompt: string }
  | { id: string; kind: 'scale'; prompt: string; options: string[] }

interface User {
  name: string; email: string; phone: string
  trustScore: number               // 50 to 100
  tier: 'silver' | 'gold' | 'platinum'
  profileCompletion: number
  walletBalance: number
  points: number
  allTimeEarned: number
  completedStudies: number
  streak: { current: number; target: number; month: string }
  ratings: { expertise: number; reliability: number; communication: number; successRate: number }
  consent: { shareProfession: boolean; shareProfile: boolean; essentialCookies: true; performanceCookie: boolean }
  emailPrefs: { dailyDigest: boolean; personalizedInvitations: boolean; newsletter: boolean }
  verified: { govId: boolean; livePhoto: boolean; license: boolean }
}
```

Seed at least 12 studies covering all six types and every status, so each tab and
every state has something in it.

### Business rules to enforce in `lib/rules.ts`

| Rule | Value |
|---|---|
| Trust Score range | 50 to 100, 50 is the floor |
| Study completion | Plus 1, capped at 10 a year |
| Ratings | 5 star plus 4, 4 star plus 3, 3 star plus 1, 2 star minus 2, 1 star minus 3 |
| No show | Minus 4 |
| Late cancellation | Minus 2 |
| Upheld fraud | Minus 20 |
| Tiers | Silver 50, Gold 70, Platinum 90 |
| Points | Referral 200, being referred 100, study 25, full profile 50, streak 50 |
| Redemption | 100 points to 1 USD, minimum 1000 points |
| Withdrawal fee | $2 flat |
| Reschedule | Twice only, and only more than 24 hours before |
| Diary | At least 4 of 5 days |

Use these values, not the ones drawn in Figma. Figma is wrong on the deductions and on
the streak reward. PRD section 14 explains why.

---

## Build order

One item per turn. Stop and show me after each.

| # | Turn |
|---|---|
| 1 | Step 0. Scaffold, tokens, routes, types. Show me the route list |
| 2 | The 10 UI primitives, plus a `/kitchen-sink` route rendering every variant |
| 3 | The 7 app components, added to the kitchen sink |
| 4 | Mock data and the store, with the state machine and the fake transitions |
| 5 | App shell: phone frame, bottom nav, top bars, toasts, modal host |
| 6 | Auth and onboarding, all 15 screens, end to end |
| 7 | Dashboard and notifications |
| 8 | Explore, filters, sort, saved, study card states |
| 9 | Study detail, all six types and all state banners |
| 10 | Apply and screener flow, including drafts |
| 11 | Scheduling flow, including reschedule and cancel |
| 12 | PIN flow, survey completion, diary |
| 13 | My Studies, all five sub-tabs, history states, rate and review |
| 14 | Wallet, withdraw, payouts, payout methods |
| 15 | Reward points and redemption |
| 16 | Profile, my profile, account settings and all sub screens |
| 17 | Trust Score, tiers, certificate, referrals |
| 18 | Support, tickets, chat, contact |
| 19 | Dead control sweep, see below |

### Turn 19, the sweep

Walk every screen and list every interactive element that does not route, change
state, open something or toast. Fix each one. Report the list before and after.

---

## Demo script, the acceptance test

When the build is done this must run without a dead end:

1. Sign up, verify OTP, fill all three profile steps, accept consent, land on Welcome
2. Explore Studies, filter to Video Call, open a study, read the client rating
3. Apply, answer the screener, exit part way, find it in Drafts, resume, submit
4. See it move to Applied, then to Invites as Invited to Schedule
5. Schedule it: pick a date, a slot, agree to recording, review, confirm
6. Open it, Submit PIN with 407060, see it confirmed
7. Complete it, watch it move to History and become Paid
8. See the wallet balance, points and Trust Score all go up
9. Rate the client, see the review recorded
10. Redeem 1000 points, see the wallet rise and points fall
11. Withdraw, see the balance drop and a Processing payout appear
12. Open Profile, change a setting, see it stick
13. Raise a support ticket, open the chat, send a message
14. Sign out, sign back in

---

## Optional, Figma reference

Only useful if you have the Figma MCP connected, which needs Claude Code on a desktop.
The tokens above are already extracted, so this is for visual reference only.

File key `Q83MnpAyJuc6RttXYbWudH`. Use `get_screenshot`, not `get_design_context`,
which returns too much and fills the context window.

| Section | Node ID |
|---|---|
| Onboarding | 915:50121 |
| Dashboard | 918:70261 |
| Trust Score | 1103:24537 |
| Studies | 919:72942 |
| Wallet | 969:29003 |
| Reward Points | 970:32569 |
| Profile | 979:74081 |

Key screens: Sign Up 915:50149, OTP 915:50175, About You 915:50231, Professional
915:50260, Identity 915:50280, Consent 915:50322, Welcome 915:50345, Dashboard
918:69716, Notifications 1279:83801, Explore 919:72943, Filters 919:72968, Apply and
screener 919:73807, Booking flow 919:75157, Survey completion 919:76063, Diary
919:76330, History 919:73143, Wallet 969:29004, Withdraw 1219:29661, Redeem 978:62004,
Profile 979:74082, Trust Score Details 1114:95266, Certificate 979:74343, Referrals
1114:96038, Support 979:74536.

Without Figma MCP, export PNGs from Figma by hand into `/design` and reference them
by filename.
