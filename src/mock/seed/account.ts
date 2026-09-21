import { POINTS, WITHDRAWAL_FEE, pointsToUsd } from '../../lib/rules'
import { paidAt } from '../../lib/derive'
import type {
  EarningCategory, Payout, PayoutMethod, PointsEntry, RedeemEntry, Referral, Study, Ticket, User,
} from '../types'
import { STUDIES, at } from './studies'

/**
 * The returning demo account, Jonathan. Every figure the app shows for him
 * is derived from the lists below (see lib/derive.ts); nothing here is a
 * headline number.
 */
export const USER: User = {
  name: 'Jonathan Reeve',
  email: 'jonathan.reeve@example.com',
  phone: '+1 555 0142 889',
  profile: {
    gender: 'Male', address: 'Brooklyn, New York', areaType: 'Urban', aboutMe: '', languages: ['English'],
    nationality: 'American', income: '', ethnicity: '', pets: ['Dog', 'Bird'], homeOwner: 'Yes',
    occupation: 'General Physician', experience: '10 years', licenseId: '98765012345678',
    industry: 'Healthcare', education: 'Bachelors Degree',
    topics: ['Wellness', 'Fitness & Yoga', 'Spirituality', 'Travel', 'Science'],
    dob: '06 / 05 / 1988', idType: 'Passport',
  },
  onboarded: true,
  taxFormDone: false,
  sourceCode: 'HL-013-B',
  joinedAt: at(-420, 9, 0),
  // Derived at render time; zero here so a literal can never leak through.
  trustScore: 0, tier: 'silver', profileCompletion: 0, walletBalance: 0, points: 0,
  allTimeEarned: 0, completedStudies: 0, streak: { current: 0, target: 4, month: '' },
  ratings: { expertise: 0, reliability: 0, communication: 0, successRate: 0 },
  consent: { shareProfession: false, shareProfile: true, essentialCookies: true, performanceCookie: true },
  emailPrefs: { dailyDigest: true, personalizedInvitations: true, newsletter: false },
  // livePhoto stays false: selfie capture is blocked pending legal review
  // (hard rule 9, PRD 4.8 and conflict 23).
  verified: { govId: true, livePhoto: false, license: true },
}

export const PAYOUT_METHODS: PayoutMethod[] = [
  { id: 'pm-1', bankName: 'American Bank', accountNumber: '1245 8965 1034 7790', routingCode: '23567898', type: 'Checking', isDefault: true },
  { id: 'pm-2', bankName: 'Chase Bank', accountNumber: '9921 4410 7788 4521', routingCode: '80123344', type: 'Savings', isDefault: false },
]

const CATEGORY: Record<Study['type'], EarningCategory> = {
  survey: 'Survey', diary: 'Survey', video_call: 'Interview', group_video_call: 'Focus Group',
  in_person: 'In-Person', in_person_group: 'Focus Group',
}

const txNumber = (n: number) => `#${260 - Math.floor(n / 10)}-${String(552 - n).padStart(3, '0')}`

/** One transaction per completed study, dated when it was paid, plus the redemption below. */
const studyTransactions = STUDIES
  .filter((s) => s.status === 'paid' || s.status === 'not_needed')
  .sort((a, b) => paidAt(b).localeCompare(paidAt(a)))
  .map((s, i) => ({
    id: `tx-${s.id}`, studyId: s.id, approved: true, title: s.title, at: paidAt(s),
    amount: s.reward, txNumber: txNumber(i), category: CATEGORY[s.type],
  }))

export const REDEEM_HISTORY: RedeemEntry[] = [
  { id: 'rd-1', at: at(-52, 9, 0), points: 300, amount: pointsToUsd(300), reference: '#058260552' },
]

export const TRANSACTIONS = [
  ...studyTransactions,
  ...REDEEM_HISTORY.map((r) => ({
    id: `tx-${r.id}`, title: `${r.points.toLocaleString('en-US')} points redeemed`, at: r.at,
    amount: r.amount, txNumber: r.reference, category: 'Redeem Points' as const,
  })),
].sort((a, b) => b.at.localeCompare(a.at))

export const PAYOUTS: Payout[] = [
  { id: 'po-1', at: at(-5, 23, 0), amount: 100, fee: WITHDRAWAL_FEE, net: 100 - WITHDRAWAL_FEE, destination: '****7790', txId: '#152356789107', status: 'processing', expectedBy: at(-3, 17, 0) },
  { id: 'po-2', at: at(-120, 14, 20), amount: 250, fee: WITHDRAWAL_FEE, net: 250 - WITHDRAWAL_FEE, destination: '****7790', txId: '#152356712004', status: 'completed' },
  { id: 'po-3', at: at(-330, 10, 5), amount: 500, fee: WITHDRAWAL_FEE, net: 500 - WITHDRAWAL_FEE, destination: '****4521', txId: '#152356698771', status: 'completed' },
]

export const REFERRALS: Referral[] = [
  { id: 'rf-1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', status: 'completed', at: at(-200) },
  { id: 'rf-2', name: 'Marcus Webb', email: 'marcus.webb@example.com', status: 'completed', at: at(-160) },
  { id: 'rf-3', name: 'Priya Nair', email: 'priya.nair@example.com', status: 'completed', at: at(-120) },
  { id: 'rf-4', name: 'Tom Alvarez', email: 'tom.alvarez@example.com', status: 'completed', at: at(-80) },
  { id: 'rf-5', name: 'Dana Okafor', email: 'dana.okafor@example.com', status: 'completed', at: at(-44) },
  { id: 'rf-6', name: 'Lena Fischer', email: 'lena.fischer@example.com', status: 'joined', at: at(-21) },
  { id: 'rf-7', name: 'Ravi Menon', email: 'ravi.menon@example.com', status: 'joined', at: at(-9) },
  { id: 'rf-8', name: 'Chloe Barnes', email: 'chloe.barnes@example.com', status: 'joined', at: at(-3) },
]

/** Points: every completed study, every completed referral, streaks and the two bonuses. */
export const POINTS_HISTORY: PointsEntry[] = [
  { id: 'pt-referred', kind: 'bonus' as const, label: 'Bonus', detail: 'Joined by referral', at: at(-420, 9, 5), amount: POINTS.BEING_REFERRED },
  { id: 'pt-profile', kind: 'bonus' as const, label: 'Bonus', detail: 'Full profile completion', at: at(-418, 12, 0), amount: POINTS.FULL_PROFILE },
  ...STUDIES
    .filter((s) => s.status === 'paid' || s.status === 'not_needed')
    .map((s) => ({ id: `pt-${s.id}`, kind: 'study' as const, label: 'Study', detail: s.title, at: paidAt(s), amount: POINTS.STUDY_COMPLETION })),
  ...REFERRALS
    .filter((r) => r.status === 'completed')
    .map((r) => ({ id: `pt-${r.id}`, kind: 'referral' as const, label: 'Referral', detail: r.name, at: r.at, amount: POINTS.REFERRAL })),
  { id: 'pt-streak-1', kind: 'streak' as const, label: 'Streak', detail: new Date(Date.now() - 60 * 864e5).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), at: at(-58, 8, 0), amount: POINTS.STREAK },
  { id: 'pt-streak-2', kind: 'streak' as const, label: 'Streak', detail: new Date(Date.now() - 150 * 864e5).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), at: at(-148, 8, 0), amount: POINTS.STREAK },
  { id: 'pt-streak-3', kind: 'streak' as const, label: 'Streak', detail: new Date(Date.now() - 330 * 864e5).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), at: at(-328, 8, 0), amount: POINTS.STREAK },
].sort((a, b) => b.at.localeCompare(a.at))

const msg = (id: string, from: 'you' | 'support', text: string, atIso: string) => ({ id, from, text, at: atIso })

/** Six tickets in different states: new, answered, awaiting you, money, solved, closed. */
export const TICKETS: Ticket[] = [
  {
    id: 'FI-S562357', subject: 'Incentive payment not received', topic: 'money',
    message: 'I completed the Commuting and EV charging call two weeks ago and the incentive has not reached my wallet yet.',
    studyTitle: 'Commuting and EV charging', status: 'open', createdAt: at(-4, 9, 0), lastActivityAt: at(-2, 10, 15),
    messages: [
      msg('m1', 'you', 'I completed the Commuting and EV charging call two weeks ago and the incentive has not reached my wallet yet.', at(-4, 9, 0)),
      msg('m2', 'support', 'Payments are released once the client approves the payout list, usually within 3-5 days of the session. Your session on this study shows as completed; we have asked the client to confirm.', at(-4, 9, 1)),
      msg('m3', 'support', 'This has now been approved and should land in your wallet within 2 working days.', at(-2, 10, 15)),
    ],
  },
  {
    id: 'FI-S562401', subject: 'Reschedule outside the app', topic: 'general',
    message: 'The moderator asked to move my Nurse staffing session by an hour. Can that be done without using one of my two reschedules?',
    studyTitle: 'Nurse staffing software review', status: 'open', createdAt: at(-1, 15, 30), lastActivityAt: at(-1, 15, 31),
    messages: [
      msg('m1', 'you', 'The moderator asked to move my Nurse staffing session by an hour. Can that be done without using one of my two reschedules?', at(-1, 15, 30)),
      msg('m2', 'support', 'A reschedule requested by the client does not count against your two. A person on the team will confirm the new time with the moderator and update your booking.', at(-1, 15, 31)),
    ],
  },
  {
    id: 'FI-S562388', subject: 'Which ID types are accepted?', topic: 'general',
    message: 'My passport has expired. Can I verify with a state ID card instead?',
    status: 'open', createdAt: at(-3, 11, 0), lastActivityAt: at(-2, 9, 45),
    messages: [
      msg('m1', 'you', 'My passport has expired. Can I verify with a state ID card instead?', at(-3, 11, 0)),
      msg('m2', 'support', 'We accept a passport, a driving licence or a government voter ID card. A state ID card is fine as a government ID.', at(-3, 11, 1)),
      msg('m3', 'support', 'Following up: did the state ID upload go through for you? Let us know and we will close this.', at(-2, 9, 45)),
    ],
  },
  {
    id: 'FI-S562290', subject: 'Withdrawal shows Processing for a week', topic: 'money',
    message: 'My $250 withdrawal has said Processing since last Tuesday.',
    status: 'closed', createdAt: at(-118, 10, 0), lastActivityAt: at(-116, 16, 20),
    messages: [
      msg('m1', 'you', 'My $250 withdrawal has said Processing since last Tuesday.', at(-118, 10, 0)),
      msg('m2', 'support', 'Withdrawals reach your bank within 2-3 working days. Yours crossed a public holiday, which added a day.', at(-118, 10, 1)),
      msg('m3', 'support', 'Confirmed with the payments team: it was sent this morning and should show in your account today.', at(-116, 16, 20)),
      msg('m4', 'you', 'Received, thank you.', at(-116, 16, 40)),
    ],
  },
  {
    id: 'FI-S561904', subject: 'Cannot upload my ID document', topic: 'general',
    message: 'The back side of my driving license fails to upload every time.',
    status: 'closed', createdAt: at(-21, 15, 0), lastActivityAt: at(-19, 9, 45),
    messages: [
      msg('m1', 'you', 'The back side of my driving license fails to upload every time.', at(-21, 15, 0)),
      msg('m2', 'support', 'Please try a .jpg or .png under 10MB. Let us know if it still fails.', at(-21, 15, 1)),
      msg('m3', 'you', 'That worked, thank you.', at(-19, 9, 45)),
    ],
  },
  {
    id: 'FI-S561722', subject: 'Referral points not credited', topic: 'money',
    message: 'Dana Okafor finished her first study last week but I have not received the 200 points.',
    status: 'closed', createdAt: at(-42, 8, 30), lastActivityAt: at(-41, 12, 0),
    messages: [
      msg('m1', 'you', 'Dana Okafor finished her first study last week but I have not received the 200 points.', at(-42, 8, 30)),
      msg('m2', 'support', 'Referral points are credited once the referred person’s first study is paid, not when it is completed. Dana’s payout was approved yesterday, so the points should be in your history now.', at(-42, 8, 31)),
      msg('m3', 'you', 'I see them now, thanks.', at(-41, 12, 0)),
    ],
  },
]

/** FAQ list from PRD 12.2, used by Help and Support. Answers are prototype copy. */
export const FAQS: { q: string; a: string }[] = [
  { q: 'What is status of incentive payment?', a: 'Open the study from My Studies > History. Its banner shows In Process while the client approves the payout list, then Paid with the date.' },
  { q: 'How Focus Insite works (How can I earn money)', a: 'Apply to studies that match your profile, pass the short eligibility check and screener, take part when invited, and the reward is credited to your wallet once the client approves the payout.' },
  { q: 'What are the eligibility criteria for participation?', a: 'Anyone can browse. To apply you need a verified government ID and a completed profile. Premium studies also need a verified professional credential.' },
  { q: 'When will I receive updates about my earnings?', a: "You can track the updates of the participated studies in the 'Applied' or 'Invited' tab of studies menu." },
  { q: 'How can I track my payment status?', a: 'Wallet > Payouts lists every withdrawal with a Processing or Completed status and the expected date.' },
  { q: "What should I do if I don't receive my payment?", a: 'Raise a ticket from Contact Us and mark it as about money. Money tickets are answered within one working day.' },
  { q: 'Are there specific payment schedules I should be aware of?', a: 'Rewards are credited when a study completes and released once the client approves the payout list, usually within 3-5 days. Withdrawals reach your bank within 2-3 working days.' },
  { q: 'Who can I contact for payment inquiries?', a: 'Use Contact Us on this screen. Payment questions are routed straight to the payments team.' },
  { q: 'What payment methods are available for my earnings?', a: 'Bank transfer to any savings or checking account you add under Manage Payout Methods.' },
]

/** Still for the "Learn about HumanLayer" video card (PRD 5.2). */
export const LEARN_VIDEO_IMAGE = '/img/learn-video.jpg'
