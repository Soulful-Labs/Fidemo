# PRD: Respondent App (Human Layer)

Platform: Focus Insite / Human Layer AI
Audience: respondents (participants)
Form factor: mobile first, 375px base width, dark theme
Version: 2, detailed
Date: 17 September 2026
Prepared by: Soulful Labs

All copy in quote marks in this document is taken word for word from Figma, including its spelling and grammar mistakes. Section 14 lists every conflict found between Figma, the policy and the workflow. Nothing in this document is estimated. Anything not stated in a source file is marked "to confirm".

---

## 1. Scope

A mobile app where a verified person finds paid research studies, applies, takes part, and gets paid.

It is not self-serve for clients. Every study is created, priced and run by the Focus Insite team. The respondent only ever sees studies the team has published or invited them to.

### Who uses it and why

| User | Why they open it | Problem it solves today |
|---|---|---|
| New respondent | Sign up, verify ID, build a profile | No app exists. People are reached by email and SMS through ParticipantFinder, and everything after that runs on Excel and email |
| Returning respondent | Check invites, apply, join sessions | No place to see what they applied to or what happens next |
| Earning respondent | Track money, withdraw, redeem points | No visibility on what was earned or when it is paid |

### Not in this app

Creating or editing studies, setting pricing or incentives, any client view, any internal team action. Those sit in the client app and the internal team console.

---

## 2. Naming, to be fixed before build

Figma uses four different names for two things. The build needs one name for each, used everywhere.

| Name in Figma | Where it appears | What it actually is |
|---|---|---|
| Trust Score | Dashboard, Trust Score Details, Trust Score Rules | The 50 to 100 behaviour score |
| Profile Score | Human Certificate, "Home - Non-registered User", the screen titled "About Profile Score" | The same 50 to 100 score |
| profile score | Reschedule warning: "Cancellation may impact your profile score" | The same score again |
| Study matching score | Study card badge, for example 96 | A different thing, study to profile relevance |
| XP | Figma layer names "XP History", "XP item" | Reward points |

**Recommendation:** use "Trust Score" for the behaviour score, "Match Score" for study relevance, "Reward Points" for points. Retire "Profile Score" and "XP".

---

## 3. Navigation

Four tabs, fixed at the bottom of every main screen.

| Tab | Screens under it |
|---|---|
| Dashboard | Dashboard, Get Started state, Notifications, tier upgrade modals, streak detail, points earned modal |
| Studies | Explore, My Studies, Saved, and every study flow |
| Wallet | Balance, withdraw, payouts, payout methods, earning history, reward points |
| Profile | Profile, My Profile, Account Settings, certificate, referrals, support, settings |

---

## 4. Onboarding

15 screens.

### 4.1 Screen inventory

| Screen | Purpose |
|---|---|
| Create your account | Sign up |
| Welcome back | Sign in |
| Verify Your Email / Enter OTP | 6 digit code |
| About You (1 of 3) | Personal details |
| Get Personalized Studies (2 of 3) | Professional details |
| Identity Verification (3 of 3) | ID and selfie |
| Details info pop-up | Explains why details are collected |
| Consent | Four toggles |
| Select Education Level | Picker, 9 options |
| Select Industry | Searchable picker, about 40 options |
| Select ID | Picker, 3 options |
| Address autocomplete | Google powered |
| Welcome to HumanLayer | Verified confirmation |
| Reset Password, Check Email, Set New Password, Password Updated | Password recovery, 4 screens |

### 4.2 Create your account
MVP

Heading: "Create your account"
Sub: "Join and earn money by sharing your opinions to shape future products."

| Field | Type | Rule |
|---|---|---|
| Email | Email input | Required, valid format |
| Password | Password input, show and hide toggle | Required, rules per 4.9 |
| Terms checkbox | Checkbox | Required. "I agree to HumanLayer's Terms of use and Privacy policy", both linked |

Buttons: "Sign Up" (primary), "Already have an account? Log In", and under a divider labelled "Not a respondent?", a secondary "Sign up as a researcher client" which leaves this app.

Footer promo card: "$100 paid to Jonathan for a product study 25m". See conflict 25.

### 4.3 Sign in
MVP

Heading: "Welcome back!"
Sub: "Sign in to your account, studies are waiting!"

Email, Password, "Forgot Password?" link, "Login", "Don't have an account? Sign Up".

### 4.4 Verify Your Email
MVP

Heading: "Enter OTP"
Sub: "Please enter a 6-digit OTP code sent to emailaddress@domain.com"

Six single character boxes. "Resend in 0:59" countdown, then a Resend action. Buttons: "Submit", "Cancel".

A separate email link flow exists for password reset ("Check Email!", "Click on the link sent to your email ... to verify and set new password", "Open My Email").

**To decide:** OTP for sign up and link for reset, or one mechanism for both. Building both doubles the work.

### 4.5 About You, step 1 of 3
MVP

Title bar: "About You" with a back arrow and an info icon. Progress bar 1 of 3 filled. Helper line: "Just 2 minutes, then you are browsing studies."

| Field | Type | Placeholder or options | Required |
|---|---|---|---|
| Full Name | Text | "Enter Name" | Yes |
| Date of Birth | Date, DD / MM / YYYY, with calendar picker | Yes. Drives the 18 plus check, to confirm |
| Gender | Three segmented tabs | Male, Female, Other | Yes |
| Address | Text with Google autocomplete | "City, Country". Suggestions list is marked "Powered by Google" | Yes |
| Intro Video (optional) | File upload | "Upload Short Video", "Share about you, what you do, your interests, etc.", ".mp4 file | 50 MB max." | No |

Button: "Continue".

The info icon opens the Details info pop-up (4.7).

### 4.6 Get Personalized Studies, step 2 of 3
MVP

Progress 2 of 3. Helper line: "Just 2 minutes, then you are browsing studies."

| Field | Type | Placeholder or options |
|---|---|---|
| Occupation | Text | "E.g. Product Designer" |
| License ID | Text | "Enter ID number" |
| Industry | Picker, opens "Select Industry" | Searchable, "Select industry field of your profession". About 40 rows including Business, Education, Healthcare, Finance, Lifestyle, Technology, Travel |
| Education Level | Picker, opens "Select Education Level" | "Select your education level". 9 rows: Secondary School, High School, Bachelors Degree, Masters Degree, Ph.D., Professional Certification, Self-Taught, and two further rows |

Button: "Continue".

Rule to respect in the UI: a professional credential does not change the Trust Score. Nothing on this screen may suggest it does.

### 4.7 Details info pop-up
MVP

Title: "What these details are for?"

Three blocks:
- "About Info. These information about you and your professional details are used to find the most relevant studies for you to help you earn more."
- "Documents. These documents are used to verify your identity to prevent any fake identification and bots for keeping platform clean and a healthy participation."
- "Your all the details and documents are completely safe as we do not share these data to any other parties."

Button: "Got It!"

The third line is not accurate. See conflict 19.

### 4.8 Identity Verification, step 3 of 3
MVP for documents, blocked for selfie

Progress 3 of 3. Note: "A one-time check. Stored privately and never shown to clients."

| Field | Type | Options and rules |
|---|---|---|
| Select ID | Dropdown | Passport, Govt. Voter ID Card, Driving License |
| Upload Front Side | File upload | ".jpg or .png" |
| Upload Back Side | File upload | ".jpg or .png" |
| Selfie Verification | Camera capture | "Capture Selfie", "Tap here to click selfie" |

Button: "Continue".

**Blocked.** Workflow step 16. Biometric data falls under Illinois BIPA and under Texas and Washington law. Written consent, a published retention schedule and a deletion date are legal requirements. The selfie cannot be built until the legal review closes. Document upload can ship without it.

### 4.9 Consent
MVP

Modal titled "Consent", with a close icon and a "Save & Continue" button.

| Toggle | Copy | Default in Figma |
|---|---|---|
| Share profession with study clients | "To match with relevant studies, share your professional details" | Off |
| Share profile details with platform | "This helps us personalize your study exploration to find you most relevant studies" | On |
| Essential cookies | "These are essential for site to function fully." | On, not changeable |
| Performance cookie | "Helps us measures website visits and interactions to improve the site better for you" | On |

Workflow step 21 says consent is given once at registration and covers everything after. Four independent toggles is a different model. See conflict 2.

### 4.10 Welcome
MVP

Green tick, "You are verified!", heading "Welcome to HumanLayer!"

Card: "Your Trust Score", dial showing 50 / 100, tier chip "Silver, In Top 50%".

Line under it: "Score and tiers climbs as you complete profile, studies, get ratings, win streaks, refer and participate more!"

Buttons: "Complete Profile", "Explore Studies".

Two problems, see conflicts 7 and 23.

### 4.11 Password recovery
MVP

| Screen | Contents |
|---|---|
| Reset Password | "Enter Email", "Please enter your email address", email field, "Submit" |
| Check Email! | "Click on the link sent to your email emailaddress@domain.com to verify and set new password", "Open My Email" |
| Set New Password | "Set New Password", "Enter new password". Password and Confirm Password, both with show and hide. Live rules list: "1 capital letter", "1 number", "1 special character", "at least 8 character". "Submit" |
| Password Updated! | "Your password has been updated successfully! Login now with you new password to access account.", "Login" |

---

## 5. Dashboard

### 5.1 Registered dashboard
MVP

Header: logo "HumanLayer", points chip showing the balance (for example 1244), notification bell with unread dot.

| Block | Contents, exact labels |
|---|---|
| Greeting | "Good morning, Jonathan!" Time based, to confirm the three variants |
| Trust Score card | Dial "70 / 100", tier chip "Gold, In Top 20%", progress row "20 more to Platinum...", scale endpoints 70 and 90. Tapping opens Trust Score Details |
| Overview, four tiles | "Wallet Balance $624.48", "This Month $950 +$260", "Studies In Review 2", "All Time Studies 128" |
| Updates | Invite and scheduled cards. Invite card: "You're Invited To Schedule!", type tag, duration, match score, image, title, description, reward, "Schedule Session". Scheduled card: type tag, title, "$150 45 min", date and time "Tue, May 20 10:30 AM ET". "View All" at the end |
| Monthly Streak | Flame icon, "1 /4 studies", points chip, four step pills numbered 1 to 4 with the completed ones ticked |
| Recommended Studies | Horizontal scroll of study cards, "View All" |
| Refer & Earn! | "Refer & Earn!", points chip "200 Points", "Earn 200 points when you refer a someone who completes their first study.", buttons "Invite" and "Copy Link" |

### 5.2 Get Started state, new user
MVP

Frame named "Home - Non-registered User".

Header carries a "Get Started" button. Blocks: "Learn about HumanLayer" with a video thumbnail and "Watch in full-screen", then "Trending Studies", then "Refer & Earn / 0 referrals yet".

Overview tiles read "Total Studies 0", "Studies In Review 0", "Earned This Month $0", "Available Earnings $0", "Streak 0 /4 week".

This frame shows "Profile Score 70 /100" and "Ranking in Top 50%". A new user must start at 50. See conflict 18.

### 5.3 Notifications
MVP

Title bar "Notifications" with "Mark all as read". Each row: icon, bold title, body, timestamp, and an optional action button.

The 24 notification types drawn in Figma, with their exact copy, are listed in section 11.

### 5.4 Modals launched from the dashboard
Phase 1

| Modal | Contents |
|---|---|
| Tier upgrade, Platinum | "Congratulations!! You've reached to Platinum Tier!", badge, "Your Trust score is 90", chip "Platinum, You are in Top 5%", "Benefits": "Get access to high-paying studies", "50% less fees on withdrawals", "Fast and priority help support access", "Higher chances to qualify studies". Button "Yayy! Start Earning More!" |
| Tier upgrade, Gold | "Congratulations!! You've reached to Gold Tier!", "Your Trust score is 72", "Benefits": "Get more visibility to researcher clients", "25% less fees on withdrawals", "Receive more invitations to apply". Button "Yayy! Start Earning More!" |
| Reward points earned | "You've earned 100 Reward Points!", reason chip "For Being Referred, Sep 10, 2026", button "Done!" |
| Streak details | "Monthly Streak", "1 of 4 studies in Sep 2026", four step pills, "Get Reward of 100 points", button "Got It!" |

The streak reward figure is wrong. See conflict 3.

---

## 6. Studies

The largest module. Six study types run through it.

### 6.1 Study types

Survey, Video Call, Group Video Call, In-Person, In-Person Group, Diary Study. Each has its own study detail layout and its own completion path.

### 6.2 Explore
MVP

Top tabs: Explore, My Studies, Saved.

Row of controls: search field "Search studies...", sort icon, filter icon.

Two lists:
1. "Invitations To Apply (3)", cards with "Invited To Schedule!" or "You're Invited To Apply!" flag and two buttons, "Accept & Apply" and "Reject"
2. "Recommended Studies", plain cards, "View All" at the end

Sort options: Default, Price: High, Price: Low, New First, Old First.

### 6.3 Filters
MVP

Full screen, title "Filters", buttons "Reset" and "Apply".

| Filter | Control | Values |
|---|---|---|
| Study Category | Seven selectable tabs | Survey, Video Call, Group Video Call, In-Person, In-Person Group, Diary Study, and one further tab |
| Price | Range slider | "$100-600" in the drawn state |
| Study Time | Range slider | "30-90 minutes" in the drawn state |
| Industries | Searchable multi select, shows chosen values as removable chips | Healthcare, Wellness in the drawn state |
| Occupations | Searchable multi select, chips | Nutritionist in the drawn state |

Pickers "Select Industry" and "Select Profession" are shared with onboarding. "Search and select your profession".

### 6.4 Study card

| Element | Detail |
|---|---|
| Invite flag | "Invited To Schedule!", "You're Invited To Apply!", "Invited To Complete", or none |
| Type tag | One of the six types, with icon |
| Duration | For example "45 min" |
| Match score | Number in a circle, for example 96 |
| Image | Study thumbnail |
| Title and description | Two lines and three lines, truncated |
| Reward | "$150 USD" |
| Deadline | "18 days left" |
| Save | Bookmark toggle |
| Actions | Vary by state: "Accept & Apply" and "Reject", "Schedule Session", "Resume Application", "Start Study", "Join Call", "Submit PIN" |

### 6.5 Match score explainer
Phase 2

Pop-up: "Study matching score", "It shows how much this study is relevant to your profile for you.", "Tip: Higher the score, faster you get qualified and earn!"

See conflict 21 on whether this is shown to respondents at all.

### 6.6 Study detail
MVP

Six variants, one per study type. Common structure:

| Block | Contents |
|---|---|
| Title bar | "Study Details", back, bookmark |
| State banner | Only when the study has a state. See 6.7 |
| Tags | Type tag, industry tag, match score |
| Media | Full width image |
| Title and description | With "View more" expander |
| Target profession | "Physicians, Nurse Practitioners, Physician Assistants" |
| Client | "For RJP Pharma Ltd." with the client rating "4.5 (124)", tappable |
| Four tiles | "Reward $150", "Duration 45 min", "Rating 4.5 (124)", "Ends Sep 30, 2026" |
| Study Locations | In-Person and In-Person Group only. "Times Square, NYC, New York 160248", with "View Directions" |
| How It Works | Accordion. "Apply and answer screener questions to see if qualify. The researcher will review your application and invite you if selected." then "Complete a project and get paid! Once approved, take part in the project and receive payment directly for your time and insights." |
| Get Support | Row that opens a ticket against this study |
| Updates | Timeline of what has happened, for example "Applied, May 13, 10:36 AM" |
| Primary button | Varies by state |

The client name is shown to respondents. See conflict 21.

### 6.7 State banners on study detail

| State | Banner copy |
|---|---|
| Invited To Apply | "Invited To Apply. You are invited to apply for this study!" |
| In Draft | "In Draft. We've got you, your progress was saved! Resume right from where you left." |
| Invited To Schedule | "Invited To Schedule. Congratulation, you are qualified for this study!! You're invited to book your session on your preferred time to complete and earn reward." |
| Invited To Complete | "Invited To Complete. Congratulation, you are qualified!! You're invited to complete your study asap and earn reward." |
| Scheduled | "Scheduled. For 18 Feb, Saturday At 10:30 AM. Can be rescheduled twice only before at least 24 hours. Cancellation may impact your profile score." |
| PIN confirmed | "Confirmed PIN successfully! #407060" |
| In Process | "In Process. Your study response is under process and will be updated within 3-5 days." |
| Paid | "Paid, May 16, 10:30 AM. Earned $150! +1 Trust score + 50 Reward points" |
| Rejected | "Rejected, July 30, 10:30 AM. Your application did not qualified due to unmatched answers in the screener. Thanks for taking time to apply. Better luck next time." |
| No Show | "No Show, May 15, 1:15 PM. -4 Trust score. You did not appear for the study, hence marked No-show as uncompleted which is not eligible for reward incentive." |
| Diary in progress | "1/5 days completed. At least 4 days needs to be filled out of 5 to complete this study and get reward." |

### 6.8 Apply and screener
MVP

Flow: Study Details, "Apply", screener questions one per screen, "Applied successfully!".

Question types drawn:
- Single select, radio list
- Multi select, helper line "Select as many applies"
- Free text, multi line
- Image upload, for example "Share picture/screenshot of your account with Procto Platform" with "Upload Picture"
- Scale, for example "What difficulty level you felt at this step in this process?" with Easy, Neutral, Hard

Screener info pop-up, "Why Screener?": "Please note. These questions help us see if you're a good match. This isn't the paid session, and you won't be compensated for answering this screener questions but for the final one if you'll be selected for it." Button "Got It!"

Exit pop-up: "Want to Exit Screener?", "Your progress have been saved in Drafts for 8 May, Studies or Drafts to complete later.", buttons "Save and Exit" and "No, Continue".

Locations pop-up on in-person studies before applying: "Locations (2)", the addresses, and "You can choose any nearby location while scheduling the session after you qualify." Button "Got It!"

Applied successfully screen: green tick, three lines:
- "Your application has been sent to be reviewed if you qualify for this study."
- "Once you get qualified, you will be invited to complete the study."
- "Earn reward after successful completion of the study!"

Button "Done".

Reject pop-ups: "Reject Study?" and "Reject Invitation?", both "Are you sure you want to reject this invitation to apply for this study?" with "Reject" and "Cancel". The study version adds "Note: This cannot be undone."

### 6.9 Drafts
MVP

A part finished screener is saved as a Draft, reachable from My Studies, Drafts. Card action "Resume Application". Detail banner as in 6.7.

### 6.10 Scheduling
MVP

Applies to Video Call, Group Video Call, In-Person and In-Person Group.

| Step | Screen | Contents |
|---|---|---|
| 1 | Schedule Study Call or Schedule Study Session | Study summary strip, then "Pick a date. Only available dates are shown", month strip with selectable dates, then "Pick a time slot. All times in US Eastern", slot grid |
| 2 | Select location, in-person only | "Select location. 2 available locations to schedule at", list of addresses. Pop-up variant: "You can choose any nearby location to do the interview session." |
| 3 | Agreement | "Call Recording. This sessions gets recorded for the quality and proof purposes to analyze and refer your valuable insights. And it is not shared to any third parties." Checkbox "I agree to this HumanLayer's Policy". Button "Agree & Join" |
| 4 | Review Schedule | "Date 20 May, 2026, Saturday", "Time 10:30 AM", "Location Address At 124, Prestige Empire, Jenn's Street, Times Square, NYC, US 160248", note "Review these details carefully and confirm the session appointment". Button "Confirm & Schedule" |
| 5 | Confirmation | Success state, then the study shows as Scheduled |

Reschedule uses the same screens with the button "Confirm Reschedule" and shows the current booking at the top.

Cancel: "Cancel Study?", "Are you sure you want to cancel this study session scheduled to complete this study?", warning "Note: This cancels the session, that is still marked negatively impacting your Trust Score and profile.", buttons "Yes, Cancel" and "No, Keep it".

**Rules stated on screen:** "Can be rescheduled twice only before at least 24 hours. Cancellation may impact your profile score."

Workflow step 39: Zoom runs on the Focus Insite account and the API is still being checked. If it is not ready, the team issues links by hand. The app must treat the join link as a value supplied by the team, not one it generates.

### 6.11 Attendance PIN
MVP

Shown on scheduled studies for all four session types.

Detail banner: "Submit Confirmation PIN. Join the call and get this code from the interviewer to submit for confirming your joining and get reward after successful completion."

Buttons on the detail screen: "Join Call" (or "Get Directions" for in person) and "Submit PIN".

PIN screen: "Enter the attendance confirmation PIN code", "Join call and get this code from the interviewer who will share it with you.", "This code is required to be submitted to confirm your joining and get reward after successful completion." Six digit input, "Submit".

Success: "Confirmed successfully! Your joining attendance is confirmed and verified! You can complete your study if running now." Button "Done". The banner then reads "Confirmed PIN successfully! #407060".

### 6.12 Survey study
MVP

Banner "Invited To Complete", button "Start Study". Questions one per screen with "Continue". Ends with "Completed successfully! Your survey study has been completed successfully and submitted."

### 6.13 Diary study
MVP for the basic path

Banner shows progress, "1/5 days completed", and the rule "At least 4 days needs to be filled out of 5 to complete this study and get reward."

Per day: a set of questions, button "Submit Progress", then "Resume Study Day 2" and so on. Daily reminder notification.

### 6.14 My Studies
MVP

Sub-tabs: Invites, Scheduled, Drafts, Applied, History.

| Sub-tab | Contents |
|---|---|
| Invites | "Invited To Schedule!" and "You're Invited To Apply!" cards, with Accept and Reject |
| Scheduled | "Scheduled (2)", cards with date and time, "Join Call" or directions |
| Drafts | Part finished screeners, "Resume Application" |
| Applied | Cards with "Applied on Wed, Mar 5", status "In Review" |
| History | Completed and closed studies, with status tags |

History status tags: In Process, Paid, Rejected, No Show. Filter: All, Paid, Rejected, No Show.

Each history item carries a timeline, for example: "Applied, May 13, 10:36 AM", "Survey Completed, May 15, 1:00 PM", "Paid, May 16, 10:00 AM".

### 6.15 Rate and review
MVP

Two directions, both required for the record to close.

**Client rates respondent.** Shown on the history detail as "Client's review for you": star rating, "+3 Trust score", the written comment, and three sub scores "Expertise: 5", "Reliability: 5", "Communication: 5".

If not yet rated: "Rate and review. The client has not rated you yet! No worries, we will remind them twice for it."

**Respondent rates client.** Screen titled "Rate For GLP-1 Care Plans, Oncologi...", header "Rate RJP Pharma Ltd. For GLP-1 Care Plans, Oncologist View". Two star scales, "Reliability" and "Communication", plus "Review (optional)" with placeholder "Describe your experience with RJP Pharma Ltd. here..". Button "Submit". Once submitted the history shows "Your review for client" and an "Edit Rating" button.

### 6.16 Client Ratings
Phase 1

Opened from the client rating on study detail. Shows the aggregate "4.5 (124)" and a list of written reviews from other respondents with star ratings and dates.

### 6.17 Saved
MVP

"6 studies saved". Same cards as Explore with the bookmark filled.

---

## 7. Trust Score

### 7.1 Screens

| Screen | Contents |
|---|---|
| Trust Score Details | Dial "72 /100", tier chip "Gold, In Top 20%", progress bar Gold to Platinum with "70", "Gain 20 to next tier", "90", button "Learn More About Tiers". Then "Performance Overview": Expertise 98%, Reliability 100%, Communication 84%, Success Rate 89%. Then "Stats": "Completed Studies 27", "Lifetime Earnings $2,850" |
| Trust Score Rules | Titled "Trust Score For Performance Overview". See 7.2 |
| How Tiers Works | "Tiers Progress", the three tiers with thresholds, and three numbered notes |

### 7.2 Trust Score Rules screen, exact copy in Figma

Intro: "Your Trust Score reflects the overall strength of your profile and performance on HumanLayer."

"How Trust Score Works":
- "Onboarding +50. Once you create your account"
- "Study Completion +10. 1% for each completed study. Up to 10 studies per year"
- "Participation Ratings +40. Based on your last 10 ratings": 5-star +4, 4-star +3, 3-star +1, 2-star minus 2, 1-star minus 3

"Deductions": "No Show -4", "Cancelled Session -4", "Late Show Up -2", "Fraud -2. Applied if you reported and found guilty"

"Important to know":
- "Onboarding is fixed at 50 and is the minimum Trust Score."
- "Study completion contributes up to 10 per year (max 10 studies)."
- "Ratings are based on your last 10 ratings and can add up to 40."
- "Adding a professional credential does not change your Trust Score."
- "Your score is always between 50 (minimum) and 100 (maximum)."

The deduction block does not match the policy, and a second copy of this screen uses percentage signs. See conflicts 1 and 5.

### 7.3 The policy values

| Item | Value |
|---|---|
| Range | 50 to 100. 50 is the floor |
| Onboarding | Fixed 50 on account creation |
| Study completion | Plus 1 each, capped at 10 per year |
| Client ratings | Last 10 ratings, worth up to 40 |
| 5 star | Plus 4 |
| 4 star | Plus 3 |
| 3 star | Plus 1 |
| 2 star | Minus 2 |
| 1 star | Minus 3 |
| No show | Minus 4 |
| Late cancellation | Minus 2 |
| Upheld fraud | Minus 20 |
| Professional credential | No effect |

Guardrails: no public leaderboard, points cannot move the Trust Score in either direction, each study decides for itself whether to accept repeat participants.

### 7.4 Tiers

Silver 50, Gold 70, Platinum 90.

"How Tiers Works" copy: "Platinum, In Top 5%, Trust Score 90+, You're in top expert participants." "Gold, Trust Score 70+, You're in most trusted participants!" "Silver, In Top 50%, Trust Score 50+, You're rising on your way up!"

Three notes: "Your current Trust Score will be determining your tier", "Higher trust scores moves you to the higher tiers", "Higher tiers unlock better opportunities and rewards."

See conflicts 9 and 10 on the "In Top" labels and the withdrawal fee benefits.

---

## 8. Reward points

### 8.1 Rules

Separate from the Trust Score. Never deducted.

| Action | Points |
|---|---|
| Being Referred, "When someone refers you to join" | 100 |
| Referral, "Refer someone who joins" | 200 |
| Study Completion | 25 |
| Full Profile Completion | 50 |
| Streak Completion, "Maintain your participation streak" | 50 |

Conversion: 100 points to 1 USD. Minimum redemption 1,000 points. "Your redemption amount will be credited to your wallet within 2 working days."

"Good to know": "Points are kept separate from your Trust Score." and "Points have no expiry and can be redeemed anytime." Both correct.

### 8.2 Screens

| Screen | Contents |
|---|---|
| Reward Points | "Balance 1244", "100 points = $1", "Redeem" button, "All Time Earned: 18,264". Two tabs, "Points History" and "Redeem History" |
| Points History | Rows such as "Bonus, Joined by referral, Jul 22, 2026, +100", "Study, E-learning methods and experiences, Jul 18, 2026, +50", "Streak, May 2026, Jul 1, 2026, +100", "Referral, Sarah Johnson, Jun 30, 2026, +25", "Bonus, Full profile completion, Jul 10, 2026, +50" |
| Redeem History | Rows such as "1000 points redeemed, Jul 22, 2026, #058260552, -1000" |
| Redeem | "Balance: 1244 points", "Enter Points To Be Redeemed", numeric input, "100 points = $1 USD", "Max", live line "You will receive $10", "Confirm" |
| Confirm Redeem | "Points To Be Redeemed 1000 points", "Amount Receivable $10", "Your redemption amount will be credited to your wallet within 2 working days.", "Redeem" |
| Redeemed successfully! | "You have redeemed 1000 points for $10 to be credited to your wallet within 2 working days.", "Done" |
| Earn Reward Points | "Earn reward points - redeem to cash!", "Participate and earn reward points which are redeemable to wallet as real cash.", then "Ways To Earn", "Redeem Points", "Good to know" |

Filters on history: Type (All, Referral, Study, Streaks, One-time bonuses), Points range 0 to 500, date range (All Time, This Month, Last Month, Last 3 Months, Last 6 Months), sort (New First, Old First, Low Amount, High Amount).

The Earn Reward Points screen states the redemption rate as "1000 = $1 USD". That is wrong. See conflict 4.

---

## 9. Refer and earn

MVP

| Element | Copy |
|---|---|
| Header chips | "Earn $25" and "Earn 200 points" |
| Card | "Refer to friends" or "Refer Respondent". "Earn 200 reward points for referring a new user when they completes their 1st study." |
| Buttons | "Invite", "Copy Link" |
| Stats | "8 Joined", "6 Completed", "1200 Earned" |
| List | "8 Referrals" with avatar, full name, full email address, and a status chip, "Joined" or "Completed" |

Points are paid when the referred person completes their first study, not on sign up.

Two problems. See conflicts 6 and 22.

---

## 10. Wallet

### 10.1 Screens and fields

| Screen | Contents |
|---|---|
| Wallet | "Wallet Balance $542.60", "Withdraw" button, "All Time Earned: $64,972", "Reward Points 1244", "Monthly Goal $342.60 of $500" progress, "Earning History" list with "View All", "Payouts" row |
| Withdraw | "Enter Amount To Withdraw", large amount field, "Balance: $542.60", "Max", "To American Bank ****7790" with "Change", then "Withdrawal Amount $500", "Processing Fees $2", "You will receive $498". Button "Withdraw" |
| Select Payout Method | Radio list of saved accounts, default marked, "Save" |
| Withdrawal success | "$500 withdrawal request sent successfully!", "Your withdrawal request for $500 has been sent and the funds will be credited within 2-3 working days.", "Done" |
| Earning History | Rows: study name, date and time, amount, transaction number, for example "Inclusive education practices, Jul 22, 2026, 11:00 PM, $120, #260-552". Sort and filter |
| Transaction Details | Study name, type tags, "Amount $120", "Date and Time July 22, 2026, 11:00 PM", "Transaction Number #260-552" |
| Payout | "Payout Account" card with "Account Number 1245 8965 1034 7790", "Routing/Swift Code 23567898", "Bank Name American Bank", "Manage Payout Methods". Then "Payout History" |
| Manage Payout Methods | List of accounts with "Default" chip, "Set As Default", "Remove", "+ Add New Account" |
| Add Bank Account | "Bank Name", "Account Number", "Routing/Swift Code", "Type" as Savings or Checking. Button "Add" |
| Remove Bank Account? | "This account will be removed from the saved payout methods.", "Yes, Remove", "No, Keep" |
| Payout History | Rows with date, amount, destination "To ****1234", transaction id, status chip Processing or Completed |
| Payout Details | "Bank Transfer 2149", "Withdrawal Amount $500", "Date Jul 23, 2026, 11:00 PM", "Transaction ID #152356789107", "Status Processing", "Expected in bank by July 25, 2026", "Payout Breakdown": "Withdrawal Amount $500", "Processing Fees $2", "Receivable Amount $498". Button "Download Receipt PDF" |
| Empty state | "No payout account added yet!", "Add Payout Account". "No payouts made yet! Browse the studies and start earning now!", "Participate in studies and earn" |

Earning history filters: Category (All, Interview, Focus Group, Survey, In-Person, Redeem Points), Price range $0 to 1000+, date range, sort.

### 10.2 Build note on payouts

Workflow step 48 says Phase One is the internal team sending Tremendous payouts by hand. The respondent screens show withdrawal as if it is automatic. Build the respondent side as drawn, but the money moves through the internal console, so the status values must reflect a human step and the processing time must be honest.

---

## 11. Notifications

MVP for in-app. Push and email matrix is Phase 1 and not yet drawn.

24 types, with exact Figma copy.

| # | Title | Action button |
|---|---|---|
| 1 | "Congrats! You're invited to complete study!" | "Start Study", "View Details" |
| 2 | "Your withdrawal has been processed!" | none |
| 3 | "You've received $150!" | none |
| 4 | "New study match!" | none |
| 5 | "Screener submitted" | none |
| 6 | "You've been selected to complete!" | "Schedule Now" |
| 7 | "Application update!" | none |
| 8 | "Session starting in 15 minutes!" | "Join Session" |
| 9 | "Study cancelled by client" | none |
| 10 | "Your session has been rescheduled" | none |
| 11 | "Study deadline approaching!" | "Complete Study - Earn Faster!" |
| 12 | "You've been invited to a study!" | "View Invitation" |
| 13 | "How was your study experience?" | "Rate Now" |
| 14 | "Update on a saved study" | "Apply Now" |
| 15 | "Daily diary entry reminder!" | "Resume Study - Day 4/7" |
| 16 | "Withdrawal request submitted" | none |
| 17 | "You've earned 100 reward points!" | none |
| 18 | "You've been upgraded to Gold tier!" | none |
| 19 | "Your trust score increased!" | none |
| 20 | "Earned 50 reward points for Monthly Streak!" | none |
| 21 | "Complete your profile for more studies" | "Complete Profile" |
| 22 | "New reply on your support ticket" | "View Message" |
| 23 | "Your friend just signed up!" | none |
| 24 | "Welcome back!" (account reactivated) | none |

Notable bodies:
- 5: "Your screener for the E-commerce Checkout Flow study has been submitted. You'll hear back within 48 hours."
- 16: "Your withdrawal request of $500 to Chase Bank ****4521 has been submitted. Processing takes 3-5 business days."
- 19: "Great work! Your trust score has increased to 92/100. A higher score means more study invitations."
- 20: "You've completed the monthly streak of 4 studies and earned 50 reward points!"

Notifications 5 and 16 contradict other screens. See conflicts 11 and 12.

---

## 12. Profile and settings

| Screen | Contents |
|---|---|
| Profile | Avatar, name, "40% completed", "Complete Profile", Trust Score and tier card, then rows: "Human Certificate", "Refer & Earn", "Account Settings", "Help & Support", "Sign Out" |
| My Profile, Profile Details tab | Full Name, Intro Video with "Upload Short Video, .mp4 file | 50 MB max.", Gender, Address, Area type, "About Me" with a character count, "Languages Spoken" chips, "Choose Nationality", "Select Income Range", "Choose Ethnicity", "Choose Pets" chips, "Are you a home owner?" Yes or No. Button "Save" |
| My Profile, Professional Info tab | "Professional Background" with a completion count, Experience "10 years", "License/Certificate Number" with a verified tick, Industry "Healthcare", "Education Level Bachelors Degree", "Topics You Are Good In" chips such as Wellness, Fitness & Yoga, Spirituality, Travel, Science. Button "Save" |
| Account Settings | Full Name, Email, Phone with country code, Date of Birth, "Passport" with the uploaded front and back files listed and "Govt. ID verified", "Selfie photo verified", "Human verified". Rows to Change Password, Email Notifications, Consent & Cookies, Deactivate Account |
| Change Password | "Current Password", "New Password" with the four live rules, "Confirm New Password", "Submit". Success modal "Password Updated!" |
| Email Notifications | Three toggles: "Daily Digest, Receive daily updates with a summary of updates and opportunities", "Personalized Invitations, Notify for studies that matches your profile", "Newsletter, Updates and news about this platform" |
| Consent & Cookies | The same four toggles as onboarding |
| Deactivate Account | "Deactivate Your Account", "Be careful: this action cannot be undone. You have 30 days to reactivate your account before it gets deleted permanently after transferring the any balance earnings to the default payout method.", password confirmation, "Deactivate Account". Success modal "Account Deactivated! Your account has been deactivated. Contact us from our website to activate it again in future." |
| Logout? | "Are you sure you want to logout of your account?", "Cancel", "Logout" |

### 12.1 Human Certificate
Phase 1

Contents: avatar, name, "Cert. ID: HL-R-9F2A-3K7P", "Profile Score 70 /100", tier chip, "Performance Ratings" with Expertise 98%, Reliability 100%, Communication 94%, Success Rate 89%, then "Verified": "Government ID Verified", "Live Photo Verified", "Professional License/Certificate Verified", "NPI cross checked". A share icon sits in the title bar.

Policy: the certificate is issued as soon as ID and selfie pass, before any study. It shows tier and what was checked, with no name, email or phone. It renews yearly. It is not a gate on taking part.

See conflict 8.

"NPI cross checked" refers to the US National Provider Identifier, which only exists for healthcare providers. To confirm what this row shows for a non healthcare respondent.

### 12.2 Help and Support
MVP

| Screen | Contents |
|---|---|
| Help & Support | "Hey there! We are here to help you!", "Get Help" and "Support Chats" tabs, "Frequently Asked Questions" list: "What is status of incentive payment?", "How Focus Insite works (How can I earn money)", "What are the eligibility criteria for participation?", "When will I receive updates about my earnings?", "How can I track my payment status?", "What should I do if I don't receive my payment?", "Are there specific payment schedules I should be aware of?", "Who can I contact for payment inquiries?", "What payment methods are available for my earnings?". Footer "Need Direct Help? Kindly contact us to get your any issues resolved" with "Contact Us" |
| Contact us | "Send us a message", "Subject", "Write subject here", "Message", "Describe your issues in detail here..", "Submit". Success modal "Submitted successfully! Your issue has been sent to our Support team and they will revert back to you shortly!", buttons "Go To Chat" and "Done" |
| Support Tickets | Searchable list, each row: ticket id such as "#FI-S562357", subject, last message preview with the sender name, "Created On" and "Last Activity" dates, status chip Open or Closed. Filters by status and sort |
| Support Chat | Threaded messages with timestamps, a "Ticket Info" card showing Subject, Message and the study name, and a message composer |

**Wording rule:** do not use "AI agent" anywhere. The correct wording is that a ticket is first answered automatically from a fixed set of FAQs and platform guides, and anything those do not cover comes to a person.

---

## 13. Business rules stated on screen

Every rule below is written somewhere in the Figma UI and must be enforced by the build.

| Rule | Where it appears |
|---|---|
| A session can be rescheduled twice only, and only more than 24 hours before the session | Scheduled banner |
| Cancelling a session reduces the Trust Score | Scheduled banner and Cancel Study pop-up |
| A diary study needs at least 4 of 5 days filled to qualify for the reward | Diary banner |
| A no show forfeits the reward and costs 4 Trust Score | No Show banner |
| Screener answers are unpaid | Why Screener pop-up |
| Attendance is confirmed by a PIN given by the interviewer | PIN screens |
| All session times are US Eastern | Schedule screens |
| Only dates the team has opened are selectable | Schedule screens |
| Minimum redemption is 1,000 points | Redeem screens |
| Redemption credits the wallet within 2 working days | Confirm Redeem |
| A withdrawal carries a $2 processing fee | Withdraw screen |
| A deactivated account can be reactivated within 30 days, after which it is deleted and any balance is sent to the default payout method | Deactivate Account |
| A referral pays when the referred person completes their first study | Refer and Earn |
| A professional credential does not change the Trust Score | Trust Score Rules |

---

## 14. Conflicts register

Every item below is a real difference between two sources, or a statement that is not accurate. These need a decision before build.

### Against the gamification policy

**1. Trust Score deductions are wrong in Figma.**
Figma: "No Show -4", "Cancelled Session -4", "Late Show Up -2", "Fraud -2".
Policy: no show minus 4, late cancellation minus 2, upheld fraud minus 20.
Three of four rows disagree. Fraud is out by a factor of ten, and "Late Show Up" is not in the policy at all while "late cancellation" is missing from Figma.

**2. Consent model.**
Workflow step 21: consent is given once at registration and covers everything after.
Figma: four independent toggles, two of which can be turned off later from settings.

**3. Streak reward is 100 in two places and 50 in three.**
Figma Streak Details: "Get Reward of 100 points". Dashboard streak chip: "100 Pts".
Figma Ways To Earn: "Streak Completion 50". Notification 20: "earned 50 reward points". Policy: streak 50.

**4. Redemption rate is wrong on the explainer screen.**
Earn Reward Points screen: "Wallet Redemption, Convert points into cash, 1000 = $1 USD".
Everywhere else and the policy: 100 points = $1, so 1000 points = $10.

**5. Trust Score units.**
Two copies of the same rules screen exist. One says "Onboarding is fixed at 50%", "contributes up to 10% per year", "can add up to 40%", "between 50% and 100%". The other says the same sentences without the percent signs. The score is a number out of 100, not a percentage. Also "1% for each completed study" should be plus 1.

**6. Two referral schemes on one screen.**
The Refer and Earn header shows both "Earn $25" and "Earn 200 points". An older dashboard line reads "Earn $25 when you refer a new Respondent user who earns $50 in total incentive". The policy has one scheme: 200 points on the referred person's first completed study.
The "Earned" stat also shows "1200" on one screen and "$150" on another, so the unit is not settled.

**7. Welcome screen credits the wrong currency.**
"Score and tiers climbs as you complete profile, studies, get ratings, win streaks, refer and participate more!"
Policy: profile completion, streaks and referrals earn points. Points can never move the Trust Score in either direction. Only study completion and ratings move the score.

**8. The certificate shows the respondent's name.**
Figma shows name, avatar and Cert ID. Policy: no name, email or phone.

### Internal to Figma

**9. Gold tier percentile.**
"In Top 20%" on Trust Score Details and the dashboard. "In Top 25%" on How Tiers Works. One version has no label on Gold at all.

**10. Tier benefits are not in any source.**
"50% less fees on withdrawals", "25% less fees on withdrawals", "Fast and priority help support access", "Higher chances to qualify studies", "Get more visibility to researcher clients". None of these are in the pricing sheet, the policy or the workflow. The only fee drawn anywhere is a flat $2.

**11. Screener response time.**
Notification 5: "You'll hear back within 48 hours". In Process banner: "will be updated within 3-5 days".

**12. Withdrawal processing time.**
Notification 16: "Processing takes 3-5 business days". Success screen: "credited within 2-3 working days". Payout Details: requested Jul 23, "Expected in bank by July 25", which is 2 days.

**13. Ways To Earn subtitles are copy and paste errors.**
"Study Completion, Refer someone who joins" and "Full Profile Completion, Refer someone who joins".

**14. The earnings tile has three names.**
"Available Earnings", "Wallet Balance" and "Balance" across dashboard variants.

**15. Lifetime earnings figure.**
"$2,850" on Trust Score Details, "$64,972" on Wallet. Dummy data, but the build needs one definition of the field.

**16. Communication rating.**
84% on Trust Score Details, 94% on the certificate.

**17. The Gold upgrade modal is built from the Platinum one.**
The frame named "Upgraded the Platinum tier" carries the Platinum badge and "In Top 5%" but shows "Your Trust score is 72" and the Gold benefit list.

**18. A brand new user is shown a score of 70.**
"Home - Non-registered User" shows "Profile Score 70 /100" and "Ranking in Top 50%" alongside "Total Studies 0". A new account starts at 50, Silver.

### Legal and privacy

**19. "We do not share these data to any other parties" is not accurate.**
Details info pop-up. Profession is shared with clients through the consent toggle, and ID verification goes through a vendor.

**20. The call recording consent is not accurate.**
"This sessions gets recorded for the quality and proof purposes ... And it is not shared to any third parties."
The recording is the client deliverable. The client is a third party. This wording has to be corrected by legal before it is shown to anyone.

**21. The client name is shown to respondents.**
Study detail shows "For RJP Pharma Ltd." with the client rating. To confirm whether studies are blind, since some clients will not want to be named to participants.

**22. Other people's email addresses are exposed.**
The referral list shows eight full names with full email addresses.

**23. Biometric capture is blocked.**
Workflow step 16 is STILL OPEN. The selfie cannot be built until the legal review closes. If it does not close, MVP ships with document verification only and the certificate row "Live Photo Verified" has to come out.

**24. Sensitive profile fields.**
"Choose Ethnicity" and "Select Income Range" are in My Profile. To confirm they are needed for matching, that they are optional, and that the consent wording covers them.

**25. A participant is named publicly on the sign in screen.**
"$100 paid to Jonathan for a product study".

### Copy errors to fix before build

| Screen | Text as drawn |
|---|---|
| Dashboard, Refer and Earn | "Earn 200 points when you refer a someone who completes their first study." |
| Why Screener | "you won't be compensated for answering this screener questions" |
| Diary banner | "At least 4 days needs to be filled out of 5" |
| Invited To Schedule banner | "Congratulation, you are qualified for this study!!" |
| Call Recording | "This sessions gets recorded" |
| How Tiers Works | "Higher trust scores moves you to the higher tiers" |
| Deactivate Account | "after transferring the any balance earnings" |
| Welcome | "Score and tiers climbs as you complete profile" |
| Rejected banner | "Your application did not qualified due to unmatched answers" |
| Exit Screener | "Your progress have been saved in Drafts" |

---

## 15. Phasing

| Phase | Scope |
|---|---|
| **MVP** | Sign up, sign in, email verification, 3 step profile, ID document upload, consent, Explore, filters, sort, study card, six study detail variants, apply, screener with all five question types, drafts, scheduling, reschedule, cancel, attendance PIN, survey study, My Studies with five sub-tabs, history with six states, rate and review both directions, Trust Score display and rules, reward points and redemption, refer and earn, wallet, withdraw, payout methods, payout history, profile, account settings, email notification settings, deactivate, notifications, support tickets and chat |
| **Phase 1** | Diary study, streaks and streak modals, Human Certificate, Client Ratings page, tier upgrade modals, tier benefits (once confirmed), intro video upload, push and email notification matrix, "Download Receipt PDF" |
| **Phase 2** | Selfie and liveness capture, only after the legal review closes. Match score shown to respondents, only if confirmed. In-app video call if the Zoom API is not ready. Monthly earning goal. Saved searches |

Note on sequencing: ID document upload can ship at MVP without the selfie. If the biometric review does not close in time, the certificate wording and the "Live Photo Verified" row come out of MVP.

---

## 16. Open items before build

| # | Item | Owner |
|---|---|---|
| 1 | Biometric legal review, workflow step 16 | Legal, via Jim |
| 2 | Consent model, one consent or four toggles | Legal, via Jim |
| 3 | Correct the four deduction values in Figma | Design |
| 4 | Correct the streak reward, 50 or 100 | Design, against policy |
| 5 | Correct the redemption rate on the explainer | Design |
| 6 | Decide one referral scheme, points or dollars | Jim |
| 7 | Rewrite the Welcome screen line about score and tiers | Design |
| 8 | Certificate: name shown or not | Jim, against policy |
| 9 | Gold percentile, 20 or 25 | Design |
| 10 | Tier withdrawal fee benefits, are they real | Jim |
| 11 | Screener response time, 48 hours or 3 to 5 days | Operations |
| 12 | Withdrawal processing time, one figure | Operations, against Tremendous |
| 13 | Rewrite "we do not share these data to any other parties" | Legal |
| 14 | Rewrite the call recording consent | Legal |
| 15 | Are studies blind, can the client be named | Jim |
| 16 | Referral list showing other people's emails | Legal |
| 17 | Ethnicity and income fields, needed and optional | Jim |
| 18 | Match score shown to respondents, and how it is derived | Jim, with workflow step 29 |
| 19 | "NPI cross checked" for non healthcare respondents | Jim |
| 20 | Zoom API status, decides join link handling | Jim's team |
| 21 | OTP or email link for sign up | Soulful Labs |
| 22 | One name for the score across the app | Soulful Labs |
| 23 | Participant named on the sign in screen | Jim |

---

## 17. What was read to produce this

| Source | Coverage |
|---|---|
| Figma, Onboarding section | All 15 screens |
| Figma, Dashboard section | All screens including 24 notification types and 4 modals |
| Figma, Trust Score section | All 5 screens |
| Figma, Studies section | All 11 sub-sections and 44 screens, read from the full file structure |
| Figma, Wallet section | All 16 screens |
| Figma, Reward Points section | All 6 screens |
| Figma, Profile section | All 25 screens |
| Figma, Branding mockups | Mobile dashboard and bottom navigation |
| Gamification policy | Trust Score, tiers, points, guardrails |
| 58 step workflow | Steps 16, 21, 22, 29, 39, 48 |

Not read: the "Inspo" section, which is hidden and holds reference images only, and the Client and Wireframe pages, which belong to the other two PRDs.
