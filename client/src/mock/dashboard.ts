import type { Respondent } from '../components/client/RespondentCard'

/**
 * Seeded from the Dashboard frame (826:85021). Every figure here is the one
 * the frame prints; nothing on this screen is calculated. Stage two derives
 * them from the studies.
 */
export const DASHBOARD_STATS: { label: string; value: string; tint: 'yellow' | 'green' | 'purple' | 'blue' }[] = [
  { label: 'Ongoing Studies', value: '4', tint: 'yellow' },
  { label: 'Completed Studies', value: '72', tint: 'yellow' },
  { label: 'Total Respondents Hired', value: '1,786', tint: 'green' },
  { label: 'Avg. Trust Score', value: '91', tint: 'purple' },
  { label: 'Avg. Session Incentive', value: '$124.8', tint: 'blue' },
]

/** The frame greets John; the account card in the navigation is Jennifer Lee. */
export const GREETING = {
  title: 'Welcome Back, John!',
  sub: 'Create and start tracking and managing your studies with ease...',
}

/** The three studies the frame puts under Ongoing Studies, in its order. */
export const DASHBOARD_STUDY_IDS = ['st-goal', 'st-sleep', 'st-pay']

export const RECOMMENDED: Respondent[] = [
  { id: 'r-ferry', name: 'Ferry L.', role: 'Physiology Therapist, Orthopedic', score: 95, tier: 'platinum', professionVerified: true },
  { id: 'r-sophie', name: 'Sophie A.', role: 'Clinical Psychologist', score: 89, tier: 'gold', professionVerified: true },
  { id: 'r-ella', name: 'Ella M.', role: 'Nutritionist', score: 87, tier: 'gold' },
  { id: 'r-tom', name: 'Tom H.', role: 'Cardiologist', score: 95, tier: 'platinum' },
  { id: 'r-liam', name: 'Liam T.', role: 'Orthopedic Surgeon', score: 93, tier: 'platinum', professionVerified: true },
  { id: 'r-david', name: 'David P.', role: 'Gastroenterologist', score: 94, tier: 'platinum' },
  { id: 'r-james', name: 'James K.', role: 'Pediatrician', score: 91, tier: 'platinum', professionVerified: true },
  { id: 'r-ava', name: 'Ava R.', role: 'Dermatologist', score: 90, tier: 'platinum', professionVerified: true },
  { id: 'r-nina', name: 'Nina C.', role: 'Radiologist', score: 68, tier: 'silver' },
]

export interface NotificationRow {
  id: string
  icon: 'study' | 'respondent' | 'session' | 'reminder' | 'completion' | 'target' | 'invoice' | 'message'
  title: string
  /** The study or ticket named inside the line, drawn in the title colour. */
  body: string
  emphasis?: string
  ago: string
  action?: string
  unread?: boolean
}

/** Every row of the Notifications panel (1518:71845), in the frame's order. */
export const NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'n1', icon: 'study', unread: true, title: 'Your study is live!',
    body: 'Your Business Finance Operations Analysis study is approved and live for participants to apply and start participating!',
    emphasis: 'Business Finance Operations Analysis', ago: '24 mins ago',
  },
  {
    id: 'n2', icon: 'respondent', unread: true, title: 'New respondent applied!',
    body: 'A new respondent has applied for your Environmental Sustainability Practices study!',
    emphasis: 'Environmental Sustainability Practices', ago: '15 mins ago', action: 'Review Screener',
  },
  {
    id: 'n3', icon: 'session', title: 'New session scheduled!',
    body: 'Scheduled on Aug 20 at 10:00 AM for your User Experience Research study!',
    emphasis: 'User Experience Research', ago: '30 mins ago',
  },
  {
    id: 'n4', icon: 'reminder', title: 'Session with John at 3:00 PM for [ABC] study!',
    body: 'Your session with John starts in 15 minutes for your User Experience Research study!',
    ago: '30 mins ago', action: 'Join Session',
  },
  {
    id: 'n5', icon: 'completion', title: 'New study completion!',
    body: 'A participant has completed the Mental Health Awareness study!',
    ago: '1 hour ago', action: 'View Results',
  },
  {
    id: 'n6', icon: 'target', title: 'Study target fulfilled!',
    body: 'The target number of participants has been reached for your Market Trends Analysis study!',
    ago: '2 hours ago', action: 'View Results',
  },
  {
    id: 'n7', icon: 'invoice', title: 'Invoice due!',
    body: 'An invoice is due for your Website Usability Testing study.',
    ago: '3 hours ago', action: 'Pay Invoice',
  },
  {
    id: 'n8', icon: 'message', title: 'New message in support ticket!',
    body: "You have a new message in support ticket regarding 'User Feedback' - #13245",
    ago: '4 hours ago', action: 'View Message',
  },
]

export interface RespondentProfile {
  id: string
  meta: string
  trustScore: number
  ratings: { label: string; value: string; tone: string }[]
  about: { label: string; value: string }[]
  verified: string[]
  metrics: { label: string; value: string }[]
}

/** Respondent Profile Details (1704:141690), as the frame fills it for Ferry L. */
export const PROFILE: RespondentProfile = {
  id: 'r-ferry',
  meta: 'New York, USA   •   10 years experience   •   Cert. ID: HL-R-9F2A-3K7P',
  trustScore: 95,
  ratings: [
    { label: 'Expertise', value: '98%', tone: 'bg-brand-secondary text-brand-secondary' },
    { label: 'Reliability', value: '100%', tone: 'bg-blue-600 text-blue-600' },
    { label: 'Communication', value: '94%', tone: 'bg-purple-600 text-purple-600' },
    { label: 'Success Rate', value: '89%', tone: 'bg-cta-primary text-brand-primary' },
  ],
  about: [
    { label: 'Occupation', value: 'Physician' },
    { label: 'Industry', value: 'Healthcare, Pharma' },
    { label: 'Education', value: 'MBBS, BHMS' },
    { label: 'Gender & Age', value: 'Male   •   31 years' },
    { label: 'Experience', value: '10 years' },
    { label: 'Other Interests', value: 'Psychology, Neurology' },
  ],
  verified: ['Verified Professional', 'Government ID Verified', 'Live Photo Verified', 'NPI cross checked'],
  metrics: [
    { label: 'Completed Studies', value: '100' },
    { label: 'Earned', value: '$5K+' },
    { label: 'Highest Streak', value: '3 months' },
  ],
}
