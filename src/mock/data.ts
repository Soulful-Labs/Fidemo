import { POINTS, WITHDRAWAL_FEE } from '../lib/rules'
import { at } from './studies'
import type {
  AppNotification, Payout, PayoutMethod, PointsEntry, RedeemEntry, Referral,
  Ticket, Transaction, User,
} from './types'

export { STUDIES, at, ALL_TYPES, ALL_STATUSES } from './studies'

/**
 * Seed data for the prototype. Where Figma and the PRD conflict the PRD's
 * register (section 14) decides, and each of those choices is noted inline.
 */

export const USER: User = {
  name: 'Jonathan Reeve',
  email: 'jonathan.reeve@example.com',
  phone: '+1 555 0142 889',
  trustScore: 72,
  tier: 'gold',
  profileCompletion: 40,
  walletBalance: 542.6,
  points: 1244,
  // Conflict 15: Figma shows $2,850 on Trust Score Details and $64,972 on
  // Wallet. $2,850 is the one consistent with 27 completed studies.
  allTimeEarned: 2850,
  completedStudies: 27,
  streak: { current: 1, target: 4, month: 'Sep 2026' },
  ratings: { expertise: 98, reliability: 100, communication: 84, successRate: 89 },
  consent: {
    shareProfession: false,
    shareProfile: true,
    essentialCookies: true,
    performanceCookie: true,
  },
  emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
  // livePhoto stays false: selfie capture is blocked pending legal review
  // (hard rule 9, PRD 4.8 and conflict 23).
  verified: { govId: true, livePhoto: false, license: true },
}

export const PAYOUT_METHODS: PayoutMethod[] = [
  { id: 'pm-1', bankName: 'American Bank', accountNumber: '1245 8965 1034 7790', routingCode: '23567898', type: 'Checking', isDefault: true },
  { id: 'pm-2', bankName: 'Chase Bank', accountNumber: '9921 4410 7788 4521', routingCode: '80123344', type: 'Savings', isDefault: false },
]

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', studyId: 'st-13', title: 'Patient intake forms, paper to digital', at: at(-17, 10, 0), amount: 120, txNumber: '#260-552', category: 'Survey' },
  { id: 'tx-2', title: 'Inclusive education practices', at: at(-24, 23, 0), amount: 120, txNumber: '#260-431', category: 'Survey' },
  { id: 'tx-3', title: 'Community clinic intake interview', at: at(-31, 15, 30), amount: 180, txNumber: '#259-884', category: 'Interview' },
  { id: 'tx-4', title: 'Beverage tasting focus group', at: at(-38, 18, 15), amount: 130, txNumber: '#259-210', category: 'Focus Group' },
  { id: 'tx-5', title: 'Pharmacy floor walkthrough', at: at(-45, 12, 0), amount: 200, txNumber: '#258-776', category: 'In-Person' },
  { id: 'tx-6', title: '1,000 points redeemed', at: at(-52, 9, 0), amount: 10, txNumber: '#058260552', category: 'Redeem Points' },
  { id: 'tx-7', title: 'Telehealth triage panel', at: at(-59, 16, 45), amount: 175, txNumber: '#258-102', category: 'Interview' },
  { id: 'tx-8', title: 'Wellness app first impressions', at: at(-66, 11, 10), amount: 75, txNumber: '#257-559', category: 'Survey' },
]

export const PAYOUTS: Payout[] = [
  { id: 'po-1', at: at(-5, 23, 0), amount: 500, fee: WITHDRAWAL_FEE, net: 498, destination: '****7790', txId: '#152356789107', status: 'processing', expectedBy: at(-3, 17, 0) },
  { id: 'po-2', at: at(-33, 14, 20), amount: 300, fee: WITHDRAWAL_FEE, net: 298, destination: '****7790', txId: '#152356712004', status: 'completed' },
  { id: 'po-3', at: at(-61, 10, 5), amount: 250, fee: WITHDRAWAL_FEE, net: 248, destination: '****4521', txId: '#152356698771', status: 'completed' },
]

// Amounts use the rules, not Figma. Figma's Points History shows a study at
// +50 and a streak at +100; the policy is 25 and 50 (conflict 3).
export const POINTS_HISTORY: PointsEntry[] = [
  { id: 'pt-1', kind: 'bonus', label: 'Bonus', detail: 'Joined by referral', at: at(-59), amount: POINTS.BEING_REFERRED },
  { id: 'pt-2', kind: 'bonus', label: 'Bonus', detail: 'Full profile completion', at: at(-52), amount: POINTS.FULL_PROFILE },
  { id: 'pt-3', kind: 'referral', label: 'Referral', detail: 'Sarah Johnson', at: at(-44), amount: POINTS.REFERRAL },
  { id: 'pt-4', kind: 'study', label: 'Study', detail: 'Pharmacy floor walkthrough', at: at(-45), amount: POINTS.STUDY_COMPLETION },
  { id: 'pt-5', kind: 'streak', label: 'Streak', detail: 'Aug 2026', at: at(-30), amount: POINTS.STREAK },
  { id: 'pt-6', kind: 'study', label: 'Study', detail: 'Inclusive education practices', at: at(-24), amount: POINTS.STUDY_COMPLETION },
  { id: 'pt-7', kind: 'study', label: 'Study', detail: 'Patient intake forms, paper to digital', at: at(-17), amount: POINTS.STUDY_COMPLETION },
]

export const REDEEM_HISTORY: RedeemEntry[] = [
  { id: 'rd-1', at: at(-52, 9, 0), points: 1000, amount: 10, reference: '#058260552' },
]

// Conflict 22: these addresses are seeded in full but the Referrals screen
// must mask them; exposing other people's emails is an open legal item.
export const REFERRALS: Referral[] = [
  { id: 'rf-1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', status: 'completed', at: at(-44) },
  { id: 'rf-2', name: 'Marcus Webb', email: 'marcus.webb@example.com', status: 'completed', at: at(-40) },
  { id: 'rf-3', name: 'Priya Nair', email: 'priya.nair@example.com', status: 'completed', at: at(-35) },
  { id: 'rf-4', name: 'Tom Alvarez', email: 'tom.alvarez@example.com', status: 'completed', at: at(-29) },
  { id: 'rf-5', name: 'Dana Okafor', email: 'dana.okafor@example.com', status: 'completed', at: at(-22) },
  { id: 'rf-6', name: 'Lena Fischer', email: 'lena.fischer@example.com', status: 'completed', at: at(-15) },
  { id: 'rf-7', name: 'Ravi Menon', email: 'ravi.menon@example.com', status: 'joined', at: at(-9) },
  { id: 'rf-8', name: 'Chloe Barnes', email: 'chloe.barnes@example.com', status: 'joined', at: at(-3) },
]

export const NOTIFICATIONS: AppNotification[] = [
  // All 24 types from PRD 11. Titles and action labels are quoted exactly.
  // Bodies are quoted for 5, 16, 19 and 20, which are the only ones the PRD
  // gives; the rest are written to match their title.
  { id: 'nt-1', kind: 'study', title: "Congrats! You're invited to complete study!", body: 'Wellness app first impressions is ready for you to complete and earn your reward.', at: at(-1, 9, 30), read: false, actionLabel: 'Start Study', to: '/studies/st-09', secondaryActionLabel: 'View Details', secondaryTo: '/studies/st-09' },
  { id: 'nt-6', kind: 'study', title: "You've been selected to complete!", body: 'You are qualified for Cardiology device onboarding. Book your session to earn your reward.', at: at(-1, 16, 4), read: false, actionLabel: 'Schedule Now', to: '/studies/st-08/schedule' },
  { id: 'nt-8', kind: 'session', title: 'Session starting in 15 minutes!', body: 'Flagship store shopper study starts shortly at Times Square, NYC.', at: at(0, 13, 45), read: false, actionLabel: 'Join Session', to: '/studies/st-11' },
  { id: 'nt-12', kind: 'study', title: "You've been invited to a study!", body: 'Retail pharmacy layout walkthrough matches your profile. Accept to apply.', at: at(-2, 8, 15), read: false, actionLabel: 'View Invitation', to: '/studies/mine/invites' },
  { id: 'nt-11', kind: 'study', title: 'Study deadline approaching!', body: 'Wellness app first impressions closes in 3 days.', at: at(-2, 11, 0), read: true, actionLabel: 'Complete Study - Earn Faster!', to: '/studies/st-09' },
  { id: 'nt-15', kind: 'study', title: 'Daily diary entry reminder!', body: 'Sleep routine diary is waiting for today\u2019s entry.', at: at(-1, 8, 0), read: true, actionLabel: 'Resume Study - Day 4/7', to: '/studies/st-12/diary' },
  { id: 'nt-13', kind: 'study', title: 'How was your study experience?', body: 'Tell RJP Pharma Ltd. how Patient intake forms, paper to digital went.', at: at(-16, 10, 0), read: true, actionLabel: 'Rate Now', to: '/studies/st-13/rate' },
  { id: 'nt-14', kind: 'study', title: 'Update on a saved study', body: 'Inclusive education practices is now open to applications.', at: at(-6, 12, 30), read: true, actionLabel: 'Apply Now', to: '/studies/st-02' },
  // Conflict 11: this says 48 hours while the In Process banner says 3-5 days.
  { id: 'nt-5', kind: 'study', title: 'Screener submitted', body: "Your screener for the E-commerce Checkout Flow study has been submitted. You'll hear back within 48 hours.", at: at(-2, 14, 25), read: true, to: '/studies/mine/applied' },
  { id: 'nt-4', kind: 'study', title: 'New study match!', body: 'GLP-1 Care Plans, Oncologist View is a 96% match for your profile.', at: at(-3, 9, 0), read: true, to: '/studies/st-01' },
  { id: 'nt-7', kind: 'study', title: 'Application update!', body: 'Your application for Oncology EMR workflows is still under review.', at: at(-3, 16, 40), read: true, to: '/studies/mine/applied' },
  { id: 'nt-9', kind: 'study', title: 'Study cancelled by client', body: 'Fintech onboarding walkthrough was cancelled by the client. No action is needed.', at: at(-8, 10, 20), read: true, to: '/studies/mine/history' },
  { id: 'nt-10', kind: 'session', title: 'Your session has been rescheduled', body: 'Nurse staffing software review moved to a new time. Check the details.', at: at(-4, 15, 10), read: true, to: '/studies/st-10' },
  { id: 'nt-3', kind: 'money', title: "You've received $150!", body: 'Your payment for Patient intake forms, paper to digital has been added to your wallet.', at: at(-17, 10, 0), read: true, to: '/wallet' },
  { id: 'nt-2', kind: 'money', title: 'Your withdrawal has been processed!', body: 'Your payout of $298 has landed in American Bank ****7790.', at: at(-33, 14, 20), read: true, to: '/wallet/payouts' },
  // Conflict 12: 3-5 business days here, 2-3 working days on the success screen.
  { id: 'nt-16', kind: 'money', title: 'Withdrawal request submitted', body: 'Your withdrawal request of $500 to Chase Bank ****4521 has been submitted. Processing takes 3-5 business days.', at: at(-5, 23, 0), read: true, to: '/wallet/payouts' },
  { id: 'nt-17', kind: 'points', title: "You've earned 100 reward points!", body: 'Points were added for being referred to HumanLayer.', at: at(-59), read: true, to: '/points' },
  { id: 'nt-20', kind: 'points', title: 'Earned 50 reward points for Monthly Streak!', body: "You've completed the monthly streak of 4 studies and earned 50 reward points!", at: at(-30), read: true, to: '/points' },
  { id: 'nt-18', kind: 'tier', title: "You've been upgraded to Gold tier!", body: 'You are now in the most trusted participants. Gold unlocks more invitations.', at: at(-25), read: true, to: '/trust-score/tiers' },
  { id: 'nt-19', kind: 'trust', title: 'Your trust score increased!', body: 'Great work! Your trust score has increased to 92/100. A higher score means more study invitations.', at: at(-17, 10, 5), read: true, to: '/trust-score' },
  { id: 'nt-21', kind: 'profile', title: 'Complete your profile for more studies', body: 'Your profile is 40% complete. Finish it to unlock more relevant invitations.', at: at(-7), read: true, actionLabel: 'Complete Profile', to: '/profile/edit' },
  { id: 'nt-22', kind: 'support', title: 'New reply on your support ticket', body: 'Support has replied to #FI-S562357 about your missing incentive payment.', at: at(-2, 10, 15), read: true, actionLabel: 'View Message', to: '/support/tickets/FI-S562357' },
  { id: 'nt-23', kind: 'referral', title: 'Your friend just signed up!', body: 'Chloe Barnes joined using your referral link. You earn 200 points when they finish their first study.', at: at(-3), read: true, to: '/profile/referrals' },
  { id: 'nt-24', kind: 'profile', title: 'Welcome back!', body: 'Your account has been reactivated. Everything is where you left it.', at: at(-70), read: true, to: '/dashboard' },
]

export const TICKETS: Ticket[] = [
  {
    id: 'FI-S562357', subject: 'Incentive payment not received',
    message: 'I completed a study two weeks ago and the incentive has not reached my wallet yet.',
    studyTitle: 'Beverage tasting focus group', status: 'open',
    createdAt: at(-4, 9, 0), lastActivityAt: at(-2, 10, 15),
    messages: [
      { id: 'm1', from: 'you', text: 'I completed a study two weeks ago and the incentive has not reached my wallet yet.', at: at(-4, 9, 0) },
      { id: 'm2', from: 'support', text: 'Thanks for getting in touch. We can see the session and have passed it to our payments team.', at: at(-3, 11, 30) },
      { id: 'm3', from: 'support', text: 'This has now been approved and should land in your wallet within 2 working days.', at: at(-2, 10, 15) },
    ],
  },
  {
    id: 'FI-S561904', subject: 'Cannot upload my ID document',
    message: 'The back side of my driving license fails to upload every time.',
    status: 'closed', createdAt: at(-21, 15, 0), lastActivityAt: at(-19, 9, 45),
    messages: [
      { id: 'm1', from: 'you', text: 'The back side of my driving license fails to upload every time.', at: at(-21, 15, 0) },
      { id: 'm2', from: 'support', text: 'Please try a .jpg or .png under 10MB. Let us know if it still fails.', at: at(-20, 10, 0) },
      { id: 'm3', from: 'you', text: 'That worked, thank you.', at: at(-19, 9, 45) },
    ],
  },
]

/** FAQ list from PRD 12.2, used by Help and Support. */
export const FAQS = [
  'What is status of incentive payment?',
  'How Focus Insite works (How can I earn money)',
  'What are the eligibility criteria for participation?',
  'When will I receive updates about my earnings?',
  'How can I track my payment status?',
  "What should I do if I don't receive my payment?",
  'Are there specific payment schedules I should be aware of?',
  'Who can I contact for payment inquiries?',
  'What payment methods are available for my earnings?',
]

export const REFERRAL_LINK = 'https://humanlayer.app/r/JONATHAN200'
