/**
 * Sub-Admin (section 2060:197774) and My Account (2065:203731) as drawn.
 * The activity rows are the frame's own: only the first two describe console
 * actions; the other eight are filler from a different product.
 */
export interface SubAdmin { id: string; photo: string; name: string; role: string; email: string; access: string[]; active: boolean }
const s = (n: number, name: string, role: string, email: string, access: string[], active = true): SubAdmin => ({ id: `sa-${n}`, photo: `/img/team/s${n}.png`, name, role, email, access, active })
export const SUB_ADMINS: SubAdmin[] = [
  s(1, 'Michael Chen', 'Studies Manager', 'michael.chen@humanlayer.com', ['Dashboard', 'Studies', 'Participants']),
  s(2, 'Robert Mayfield', 'Community Manager', 'robert.mayfield@humanlayer.com', ['Dashboard', 'Clients', 'Participants'], false),
  s(3, 'Michael Chen', 'Finance Manager', 'robert.mayfield@humanlayer.com', ['Finance']),
  s(4, 'Sophia Garcia', 'Support Executive', 'sophia.garcia@humanlayer.com', ['Studies', 'Participants', 'Clients']),
  s(5, 'Emily Davis', 'System Admin', 'emily.avis@humanlayer.com', ['Sub-Admin', 'Dashboard']),
  s(6, 'James Wilson', 'Community Manager', 'james.wilson@humanlayer.com', ['Dashboard', 'Studies', 'Participants']),
]

export const ACTIVITIES = [
  ['Qualified Amelia in screener of for goal tracking study', 'Studies / Screeners / Qualify', 'Oct 1, 2026, 10:21 AM', 'Michael Chen', 'Studies Manager'],
  ['Verified Identity of Robert D for onboarding', 'Studies / Screeners / Qualify', 'Oct 1, 2026, 10:21 AM', 'James Wilson', 'Community Manager'],
  ['Conducted Initial Interview with Sarah T for focus group', 'Focus Groups / Interviews / Conduct', 'Oct 2, 2026, 11:45 AM', 'Emily Johnson', 'Research Lead'],
  ['Completed Survey Distribution for Market Research', 'Surveys / Distribution / Complete', 'Oct 2, 2026, 12:30 PM', 'Daniel Lee', 'Marketing Specialist'],
  ['Analyzed Feedback from Customer Satisfaction Survey', 'Surveys / Analysis / Feedback', 'Oct 3, 2026, 9:15 AM', 'Laura Smith', 'Data Analyst'],
  ['Scheduled Follow-up Call with Greg H for product testing', 'Product Testing / Calls / Schedule', 'Oct 3, 2026, 3:00 PM', 'Nina Patel', 'Product Manager'],
  ['Reviewed Application of Michelle K for user experience study', 'User Experience / Applications / Review', 'Oct 4, 2026, 1:30 PM', 'Oliver Brown', 'UX Coordinator'],
  ['Organized Data Collection for Behavioral Analysis', 'Behavioral Studies / Data / Organize', 'Oct 4, 2026, 2:00 PM', 'Sophia White', 'Research Assistant'],
  ['Finalized Report on Usability Testing with Team', 'Usability Testing / Reports / Finalize', 'Oct 5, 2026, 10:00 AM', 'Aiden Green', 'Project Lead'],
  ['Facilitated Workshop on Research Methods for new interns', 'Training / Workshops / Facilitate', 'Oct 5, 2026, 11:30 AM', 'Chloe Adams', 'Training Coordinator'],
].map(([what, path, when, who, role], i) => ({ id: `ac-${i}`, what: what!, path: path!, when: when!, who: who!, role: role!, photo: `/img/team/a${(i % 2) + 1}.png` }))

export const MODULES = ['Dashboard', 'Studies', 'Participants', 'Clients', 'Support', 'Finance', 'Pricing & Rewards', 'Sub-Admin']
/** The three filters over Activities, drawn loose (2062:201706, 2062:201813, 2062:201633). */
export const FILTER_MODULES = ['All Modules', 'Dashboard', 'Studies', 'Participants', 'Clients', 'Support', 'Finance']
export const FILTER_PEOPLE = ['Sub-Admin', 'Michael Chen', 'Robert Mayfield', 'Sophia Garcia', 'Sophia Garcia', 'Emily Davis', 'James Wilson']
export const FILTER_PERIOD = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months']

export const MAYA = { name: 'Maya Thompson', email: 'maya.thompson@humanlayer.com', role: 'Studies Manager', photo: '/img/team/maya.png' }
/** The master admin's Profile draws Maya's email under Peter's name; Edit My Profile draws Maya's name over Peter's email. */
export const PETER = { name: 'Peter Devian', email: 'maya.thompson@humanlayer.com', role: 'Master Admin', photo: '/img/team/peter.png' }
