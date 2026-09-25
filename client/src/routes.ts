import { createElement } from 'react'
import { Navigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
import KitchenSink from './screens/kitchen-sink/KitchenSink'
import StudiesList from './screens/studies/StudiesList'
import PausedStudy from './screens/studies/PausedStudy'
import StudyOverview from './screens/studies/StudyOverview'
import ManageStudy from './screens/studies/ManageStudy'
import MatchedTab from './screens/studies/MatchedTab'
import RecruitedTab from './screens/studies/RecruitedTab'
import ResultsTab from './screens/studies/ResultsTab'
import PayTab from './screens/studies/PayTab'
import BillPayment from './screens/studies/BillPayment'
import Pool from './screens/pool/Pool'
import RespondentResult from './screens/studies/RespondentResult'
import AudienceNoMatch from './screens/create/AudienceNoMatch'
import About from './screens/create/About'
import Audience from './screens/create/Audience'
import Screener from './screens/create/Screener'
import StudySetup from './screens/create/StudySetup'
import Publish from './screens/create/Publish'
import Published from './screens/create/Published'
import Dashboard from './screens/dashboard/Dashboard'

/**
 * The client route map. `node` is the Figma frame each route is built to, so
 * any screen can be re-checked against the file without a search. `kind` says
 * whether it is a full 1440 page, a 600px side panel or a 460px modal; panels
 * and modals are routes only where Figma draws them as a destination.
 *
 * Manage and Create are ONE flow each, driven by study type (see client/CLAUDE.md).
 */
export type ScreenKind = 'page' | 'panel' | 'modal'
export type ScreenRoute = RouteObject & {
  label?: string
  node?: string
  kind?: ScreenKind
  section?: string
}

const page = (path: string, label: string, node: string, section: string, Component?: ComponentType, kind: ScreenKind = 'page'): ScreenRoute => ({
  path, label, node, section, kind,
  element: Component ? createElement(Component) : createElement(Placeholder, { name: label, node, kind }),
})

const routes: ScreenRoute[] = [
  { path: '/', element: createElement(Navigate, { to: '/dashboard', replace: true }) },

  // ----- Onboarding (1484:81318) -----
  page('/signup', 'Sign Up', '1484:81319', 'Onboarding'),
  page('/check-email', 'Check Email', '1484:81337', 'Onboarding'),
  page('/signin', 'Sign In', '1484:81364', 'Onboarding'),
  page('/organization', 'Organization Details', '1484:81382', 'Onboarding'),
  page('/pricing', 'Select Pricing Plan', '1484:81400', 'Onboarding'),
  page('/payment-method', 'Payment Method', '1512:68177', 'Onboarding'),
  page('/in-review', 'In Review', '1484:81502', 'Onboarding'),
  page('/welcome', 'Welcome', '1484:81512', 'Onboarding'),

  // ----- Dashboard (826:85653) -----
  { path: '/dashboard', label: 'Dashboard', node: '826:85021', section: 'Dashboard', kind: 'page', element: createElement(Dashboard) },
  { path: '/dashboard/empty', label: 'Dashboard, no studies yet', node: 'not drawn in Figma', section: 'Dashboard', kind: 'page', element: createElement(Dashboard, { empty: true }) },

  // ----- Studies list (1518:72486) -----
  { path: '/studies', label: 'Studies, Ongoing', node: '1518:90600 (table), 1518:90966 (cards)', section: 'Studies', kind: 'page', element: createElement(StudiesList, { tab: 'ongoing' }) },
  { path: '/studies/drafts', label: 'Studies, Drafts', node: '1518:90624', section: 'Studies', kind: 'page', element: createElement(StudiesList, { tab: 'drafts' }) },
  { path: '/studies/completed', label: 'Studies, Completed', node: '1518:90760', section: 'Studies', kind: 'page', element: createElement(StudiesList, { tab: 'completed' }) },

  // ----- Create, one flow for every type (see CLAUDE.md) -----
  { path: '/studies/create/about', label: 'Create, About', node: '1622:81504', section: 'Create', kind: 'page', element: createElement(About) },
  { path: '/studies/create/audience', label: 'Create, Audience', node: '1622:81615', section: 'Create', kind: 'page', element: createElement(Audience) },
  { path: '/studies/create/audience/no-match', label: 'Create, no matching audience', node: '1518:91273', section: 'Create', kind: 'page', element: createElement(AudienceNoMatch) },
  { path: '/studies/create/screener', label: 'Create, Screener', node: '1622:81771', section: 'Create', kind: 'page', element: createElement(Screener) },
  { path: '/studies/create/study', label: 'Create, Study setup', node: '1518:91922 (survey), 1518:92729 (video), 1518:93678 (in-person), 1518:94580 (diary)', section: 'Create', kind: 'page', element: createElement(StudySetup) },
  { path: '/studies/create/publish', label: 'Create, Payment & Publish', node: '1518:92247 / 1622:84446 / 86775 / 87629 (one screen)', section: 'Create', kind: 'page', element: createElement(Publish) },
  { path: '/studies/create/published', label: 'Create, Published', node: '1518:92376', section: 'Create', kind: 'page', element: createElement(Published) },

  // ----- Manage, one flow for every type (see CLAUDE.md) -----
  { path: '/studies/:id', label: 'Study Overview', node: '1627:95956', section: 'Manage', kind: 'page', element: createElement(StudyOverview) },
  { path: '/studies/:id/manage', label: 'Manage Study', node: '1627:96085', section: 'Manage', kind: 'page', element: createElement(ManageStudy) },
  { path: '/studies/:id/matched', label: 'Matched Respondents', node: '1627:96237 (matched), 1627:96329 (invited)', section: 'Manage', kind: 'page', element: createElement(MatchedTab) },
  { path: '/studies/:id/recruited', label: 'Recruited Respondents', node: '1627:96535, 1627:101612 (session), 1627:104269 (group)', section: 'Manage', kind: 'page', element: createElement(RecruitedTab) },
  { path: '/studies/:id/results', label: 'Results', node: '1627:96628', section: 'Manage', kind: 'page', element: createElement(ResultsTab) },
  { path: '/studies/:id/pay', label: 'Pay', node: '1627:96779 (ongoing), 1627:97128 (due)', section: 'Manage', kind: 'page', element: createElement(PayTab) },
  { path: '/studies/:id/payment', label: 'Bill Payment', node: '1627:96956', section: 'Manage', kind: 'page', element: createElement(BillPayment) },
  { path: '/studies/:id/respondent/:rid', label: 'Respondent result, screener', node: '1627:97305', section: 'Manage', kind: 'page', element: createElement(RespondentResult, { tab: 'screener' }) },
  { path: '/studies/:id/respondent/:rid/result', label: 'Respondent result, study result', node: '1627:97609, 1627:102694 + 102902 (session)', section: 'Manage', kind: 'page', element: createElement(RespondentResult, { tab: 'result' }) },
  { path: '/studies/:id/respondent/:rid/activity', label: 'Activity of respondent', node: '1627:97901', section: 'Manage', kind: 'page', element: createElement(RespondentResult, { tab: 'activity' }) },
  page('/studies/:id/results', 'Results', '1627:96628', 'Manage'),
  page('/studies/:id/pay', 'Pay while ongoing', '1627:96779', 'Manage'),
  page('/studies/:id/pay/due', 'Pay, due as completed', '1627:97128', 'Manage'),
  page('/studies/:id/payment', 'Payment', '1627:96956', 'Manage'),
  page('/studies/:id/respondent/:rid', 'Respondent result', '1627:97305', 'Manage'),
  page('/studies/:id/respondent/:rid/activity', 'Activity of respondent', '1627:97901', 'Manage'),
  { path: '/studies/:id/paused', label: 'Paused study', node: '1704:143783', section: 'Manage', kind: 'page', element: createElement(PausedStudy) },

  { path: '/pool', label: 'Pool of Participants', node: '1645:161430, 1777:98738, 1645:161580, 1645:162272', section: 'Pool', kind: 'page', element: createElement(Pool) },
  page('/pool/empty', 'Pool, empty', '1645:161430', 'Pool'),
  page('/pool/panels/:panelId/members', 'My Panel, Members', '1645:161734', 'Pool'),
  page('/pool/panels/:panelId/matched', 'My Panel, Matched', '1645:162050', 'Pool'),
  page('/pool/featured/:panelId', 'Featured Panel, Details', '1645:161904', 'Pool'),
  page('/pool/featured/:panelId/members', 'Featured Panel, Members', '1645:161816', 'Pool'),
  page('/pool/panels/new', 'Create Micro-panel', '1645:162404', 'Pool'),
  page('/pool/panels/:panelId/edit', 'Edit Micro-panel', '1645:162594', 'Pool'),

  // ----- Payments (1663:103325) -----
  page('/payments', 'Payments', '1663:103326', 'Payments'),
  page('/payments/history', 'Payments, history', '1663:103525', 'Payments'),
  page('/payments/methods', 'Payments, methods', '1663:103724', 'Payments'),

  // ----- Notifications (1663:104076) -----
  page('/notifications', 'Notifications', '1663:104077', 'Notifications'),

  // ----- Help (1663:104190) -----
  page('/help', 'Help', '1663:104191', 'Help'),
  page('/help/tickets', 'Support Tickets', '1663:104228', 'Help'),
  page('/help/tickets/:id', 'Ticket Chat', '1663:104436', 'Help'),

  // ----- Account (1663:104599) -----
  page('/account', 'Profile', '1663:104600', 'Account'),
  page('/account/reviews', 'Rating & Reviews', '1663:104635', 'Account'),
  page('/account/certificate', 'Certificate', '1663:104813', 'Account'),
  page('/account/settings', 'Settings', '1663:104876', 'Account'),

  // ----- Dev -----
  { path: '/kitchen-sink', label: 'Kitchen Sink', element: createElement(KitchenSink) },

  page('*', 'Not Found', '', 'Dev'),
]

export default routes
