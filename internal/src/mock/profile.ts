import type { StudyType } from '../components/app/StudyTypeTag'

/**
 * The participant profile as drawn (section 1992:101340: About 2017:148911,
 * Studies 2017:150996 / 152230 / 153500 / 155171 / 155992, Wallet 2020:160313
 * / 2021:165139 / 2022:166544 / 2022:177272, deactivated 2024:178894). One
 * person is drawn, Samuel Lee. Every figure is the frame's own.
 */
export const PERSON = {
  name: 'Samuel Lee', role: 'Software Engineer', place: 'New York, USA', cert: 'Cert. ID: HL-R-9F2A-3K7P', photo: '/img/participants/samuel.png',
  completion: '95% profile completed', score: '95', lastActive: 'Last active on Oct 5, 2026',
}

export const PROFESSIONAL = [['Occupation', 'General Physician'], ['License/Certificate Number', '98765012345678'], ['Work Functions', 'Healthcare Provider, Consulting'],
  ['Experience', '10 years'], ['Skills', 'Therapy, Yoga, Weight Loss, Keto Diet'], ['Industry', 'Healthcare'], ['Education Level', 'Bachelor’s Degree']]
export const TOPICS = 'Wellness, Fitness & Yoga, Spirituality, Travel, Science'
export const PERSONAL = [['Gender', 'Male'], ['Area Type', 'Sub-urban area'], ['Languages Spoken', 'English, Hindi, Gujarati'], ['Nationality', 'Indian'],
  ['Household Income', 'N/A'], ['Ethnicity', 'N/A'], ['Pets', 'Dog, Cat'], ['Are you a home owner?', 'Yes']]
export const ACCOUNT = [['Email', 'jonathanmorgan@gmail.com'], ['Phone', 'N/A'], ['Date of Birth', 'May 6, 2000']]
export const RATINGS: [string, string, 'green' | 'blue' | 'purple' | 'yellow'][] = [['Expertise', '98%', 'green'], ['Reliability', '100%', 'blue'], ['Communication', '94%', 'purple'], ['Success Rate', '89%', 'yellow']]
export const METRICS = [['Completed Studies', '100'], ['Earned', '$5K+'], ['Highest Streak', '4 months']]
export const VERIFIED = ['Verified Professional', 'Government ID Verified', 'Live Photo Verified', 'NPI cross checked']

export type StudyStatus = 'In Review' | 'In Process' | 'Paid' | 'Rejected' | 'No Show'
export interface StudyLine { id: string; name: string; thumb: string; type: StudyType; date: string; price: string; match: string; status?: StudyStatus }
const t = (n: string) => `/img/studies/${n}-40.png`
const line = (id: string, name: string, thumb: string, type: StudyType, date: string, price: string, match: string, status?: StudyStatus): StudyLine => ({ id, name, thumb: t(thumb), type, date, price, match, status })

/** The six studies every Studies sub-tab draws. */
export const SIX: StudyLine[] = [
  line('st-goal', 'About goal-tracking methods', 'goal-tracking', 'video', '30 Jul, 2026', '$150', '96%'),
  line('st-pay', 'How Do You Make Your Digital Payments Mostly?', 'digital-payments', 'diary', '25 Jul, 2026', '$100', '85%'),
  line('st-sleep', 'Share About Your Sleep Cycle', 'sleep-cycle', 'in-person', '15 Jul, 2026', '$200', '76%'),
  line('st-fitness', 'Fitness Tracker Apps Experience', 'fitness-tracker', 'video-group', '20 Jul, 2026', '$160', '90%'),
  line('st-travel', 'Travel preferences and experiences', 'travel-preferences', 'in-person-group', '10 Jul, 2026', '$200', '92%'),
  line('st-social', 'Social media posts designing apps', 'social-media', 'survey', '10 Jul, 2026', '$200', '94%'),
]
const HISTORY_STATUS: StudyStatus[] = ['In Process', 'Paid', 'Rejected', 'No Show', 'In Review', 'In Review']
export const HISTORY = SIX.map((s, i) => ({ ...s, status: HISTORY_STATUS[i] }))
export const APPLIED = SIX.map((s) => ({ ...s, status: 'In Review' as StudyStatus }))
export const SCHEDULED_ONE = [{ ...SIX[5]!, date: 'Tue, Feb 18, 10:30 AM ET' }]
/** Saved (2017:155992) regroups a few of them under five headings. */
export const SAVED = {
  scheduled: [{ ...SIX[3]!, date: 'Tue, Feb 18, 10:30 AM ET', price: '$200' }],
  drafts: [SIX[5]!],
  applied: [{ ...SIX[3]!, status: 'In Review' as StudyStatus }, { ...SIX[5]!, status: 'In Review' as StudyStatus }],
  history: [HISTORY[0]!, HISTORY[1]!],
}

export const EARNINGS = [
  ['Inclusive education practices', 'Jul 22, 2026', '11:00 PM', '#260-552', '$120'], ['Adaptive learning technologies', 'Aug 15, 2026', '2:30 PM', '#263-874', '$150'],
  ['Behavioral intervention strategies', 'Sep 10, 2026', '9:00 AM', '#275-193', '$200'], ['Redeem - 10000 Reward Points', 'Oct 5, 2026', '1:15 PM', '#284-411', '$100'],
  ['Universal design for learning', 'Nov 12, 2026', '3:45 PM', '#291-576', '$145'], ['Peer-assisted learning', 'Dec 20, 2026', '10:00 AM', '#299-823', '$160'],
  ['Social-emotional learning frameworks', 'Jan 8, 2027', '12:30 PM', '#307-452', '$190'], ['Technology integration in classrooms', 'Feb 14, 2027', '4:00 PM', '#315-678', '$210'],
  ['Differentiated instruction techniques', 'Mar 22, 2027', '8:15 AM', '#321-834', '$155'], ['Collaborative learning environments', 'Apr 30, 2027', '5:00 PM', '#328-920', '$165'],
].map(([what, day, time, id, amount]) => ({ what: what!, day: day!, time: time!, id: id!, amount: amount! }))

export const PAYOUTS = [
  ['Jul 22, 2026', '11:00 PM', '1234', '107', '$500', 'Processing'], ['Jul 22, 2026', '11:00 PM', '1234', '107', '$500', 'Completed'], ['Jul 23, 2026', '10:30 AM', '5678', '108', '$750', 'Completed'],
  ['Jul 23, 2026', '1:15 PM', '9012', '109', '$300', 'Completed'], ['Jul 24, 2026', '9:45 AM', '3456', '110', '$200', 'Completed'], ['Jul 24, 2026', '3:00 PM', '7890', '111', '$600', 'Completed'],
  ['Jul 25, 2026', '12:30 PM', '2345', '112', '$400', 'Completed'], ['Jul 25, 2026', '4:00 PM', '6789', '113', '$800', 'Completed'], ['Jul 26, 2026', '11:15 AM', '0123', '114', '$950', 'Completed'],
  ['Jul 26, 2026', '6:45 PM', '4567', '115', '$650', 'Completed'],
].map(([day, time, to, id, amount, status], i) => ({ key: `po${i}`, day: day!, time: time!, to: `To American... ****${to}`, id: `#152356789${id}`, amount: amount!, status: status! }))

export const POINTS = [
  ['Bonus', 'Joined by referral', '+100'], ['Study', 'E-learning methods and experiences', '+50'], ['Study', 'Course material revisions', '+50'], ['Streak', 'May 2026', '+100'],
  ['Referral', 'Sarah Johnson', '+25'], ['Bonus', 'Full profile completion', '+50'], ['Study', 'E-learning methods and experiences', '+50'], ['Study', 'E-learning methods and experiences', '+50'],
  ['Study', 'E-learning methods and experiences', '+50'], ['Study', 'E-learning methods and experiences', '+50'],
].map(([kind, what, points], i) => ({ key: `pt${i}`, kind: kind!, what: what!, points: points! }))
export const REDEEMS = [['1000 points redeemed', '-1000'], ['5000 points redeemed', '-5000'], ['3000 points redeemed', '-3000'], ['2000 points redeemed', '-2000'], ['1500 points redeemed', '-1000']]
  .map(([what, points], i) => ({ key: `rd${i}`, what: what!, points: points! }))

export const REFERRALS = [
  ['Andrew Chen', 'andrew.chen@gmail.com', 'Jul 22, 2026', 'Joined'], ['Olivia Johnson', 'olivia.johnson@yahoo.com', 'Jul 22, 2026', 'Joined'], ['Michael Smith', 'michael.smith@hotmail.com', 'Jul 23, 2026', 'Completed'],
  ['Sophia Brown', 'sophia.brown@gmail.com', 'Jul 24, 2026', 'Completed'], ['James Wilson', 'james.wilson@outlook.com', 'Jul 25, 2026', 'Completed'], ['Emma Davis', 'emma.davis@gmail.com', 'Jul 26, 2026', 'Completed'],
  ['Lucas Miller', 'lucas.miller@icloud.com', 'Jul 27, 2026', 'Completed'], ['Mia Taylor', 'mia.taylor@yahoo.com', 'Jul 28, 2026', 'Completed'],
].map(([name, email, joined, status], i) => ({ key: `rf${i}`, photo: `/img/participants/ref${i + 1}.png`, name: name!, email: email!, joined: joined!, status: status! }))

/** The period and sort menus drawn loose on the canvas (2021:164830, 2022:167943, 2022:167950). */
export const PERIODS = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']
export const SORTS = ['Sort: Newest First', 'Old First', 'Low Amount', 'High Amount']
