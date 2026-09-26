import { createElement } from 'react'
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
import PanelDetail from './screens/pool/PanelDetail'
import CreatePanel from './screens/pool/CreatePanel'
import Payments from './screens/payments/Payments'
import NotificationsPage from './screens/NotificationsPage'
import Help from './screens/help/Help'
import TicketChat from './screens/help/TicketChat'
import Account from './screens/account/Account'
import { CheckEmail, InReview, OrganizationDetails, PaymentMethod, SignIn, SignUp, Welcome } from './screens/onboarding/Onboarding'
import RespondentResult from './screens/studies/RespondentResult'
import AudienceNoMatch from './screens/create/AudienceNoMatch'
import About from './screens/create/About'
import Audience from './screens/create/Audience'
import Screener from './screens/create/Screener'
import StudySetup from './screens/create/StudySetup'
import Publish from './screens/create/Publish'
import Published from './screens/create/Published'
import Dashboard from './screens/dashboard/Dashboard'
import { RequireAccount, RequireNoAccount, Root } from './app/Guards'

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
  element: guard(Component ? createElement(Component) : createElement(Placeholder, { name: label, node, kind })),
})

/** Everything inside the app shell needs an account behind it. */
const guard = (element: ReturnType<typeof createElement>) => createElement(RequireAccount, null, element)
/** The onboarding screens need the opposite. */
const open = (element: ReturnType<typeof createElement>) => createElement(RequireNoAccount, null, element)

const routes: ScreenRoute[] = [
  { path: '/', element: createElement(Root) },

  // ----- Onboarding (1484:81318) -----
  { path: '/signup', label: 'Sign Up', node: '1484:81319', section: 'Onboarding', kind: 'page', element: open(createElement(SignUp)) },
  { path: '/check-email', label: 'Check Email', node: '1484:81337', section: 'Onboarding', kind: 'page', element: open(createElement(CheckEmail)) },
  { path: '/signin', label: 'Sign In', node: '1484:81364', section: 'Onboarding', kind: 'page', element: open(createElement(SignIn)) },
  { path: '/organization', label: 'Organization Details', node: '1484:81382', section: 'Onboarding', kind: 'page', element: open(createElement(OrganizationDetails)) },
  { path: '/payment-method', label: 'Payment Method', node: '1512:68177', section: 'Onboarding', kind: 'page', element: open(createElement(PaymentMethod)) },
  { path: '/in-review', label: 'In Review', node: '1484:81502', section: 'Onboarding', kind: 'page', element: open(createElement(InReview)) },
  { path: '/welcome', label: 'Welcome', node: '1484:81512', section: 'Onboarding', kind: 'page', element: open(createElement(Welcome)) },

  // ----- Dashboard (826:85653) -----
  { path: '/dashboard', label: 'Dashboard', node: '826:85021', section: 'Dashboard', kind: 'page', element: guard(createElement(Dashboard)) },
  { path: '/dashboard/empty', label: 'Dashboard, no studies yet', node: 'not drawn in Figma', section: 'Dashboard', kind: 'page', element: guard(createElement(Dashboard, { empty: true })) },

  // ----- Studies list (1518:72486) -----
  { path: '/studies', label: 'Studies, Ongoing', node: '1518:90600 (table), 1518:90966 (cards)', section: 'Studies', kind: 'page', element: guard(createElement(StudiesList, { tab: 'ongoing' })) },
  { path: '/studies/drafts', label: 'Studies, Drafts', node: '1518:90624', section: 'Studies', kind: 'page', element: guard(createElement(StudiesList, { tab: 'drafts' })) },
  { path: '/studies/completed', label: 'Studies, Completed', node: '1518:90760', section: 'Studies', kind: 'page', element: guard(createElement(StudiesList, { tab: 'completed' })) },

  // ----- Create, one flow for every type (see CLAUDE.md) -----
  { path: '/studies/create/about', label: 'Create, About', node: '1622:81504', section: 'Create', kind: 'page', element: guard(createElement(About)) },
  { path: '/studies/create/audience', label: 'Create, Audience', node: '1622:81615', section: 'Create', kind: 'page', element: guard(createElement(Audience)) },
  { path: '/studies/create/audience/no-match', label: 'Create, no matching audience', node: '1518:91273', section: 'Create', kind: 'page', element: guard(createElement(AudienceNoMatch)) },
  { path: '/studies/create/screener', label: 'Create, Screener', node: '1622:81771', section: 'Create', kind: 'page', element: guard(createElement(Screener)) },
  { path: '/studies/create/study', label: 'Create, Study setup', node: '1518:91922 (survey), 1518:92729 (video), 1518:93678 (in-person), 1518:94580 (diary)', section: 'Create', kind: 'page', element: guard(createElement(StudySetup)) },
  { path: '/studies/create/publish', label: 'Create, Payment & Publish', node: '1518:92247 / 1622:84446 / 86775 / 87629 (one screen)', section: 'Create', kind: 'page', element: guard(createElement(Publish)) },
  { path: '/studies/create/published', label: 'Create, Published', node: '1518:92376', section: 'Create', kind: 'page', element: guard(createElement(Published)) },

  // ----- Manage, one flow for every type (see CLAUDE.md) -----
  { path: '/studies/:id', label: 'Study Overview', node: '1627:95956', section: 'Manage', kind: 'page', element: guard(createElement(StudyOverview)) },
  { path: '/studies/:id/manage', label: 'Manage Study', node: '1627:96085', section: 'Manage', kind: 'page', element: guard(createElement(ManageStudy)) },
  { path: '/studies/:id/matched', label: 'Matched Respondents', node: '1627:96237 (matched), 1627:96329 (invited)', section: 'Manage', kind: 'page', element: guard(createElement(MatchedTab)) },
  { path: '/studies/:id/recruited', label: 'Recruited Respondents', node: '1627:96535, 1627:101612 (session), 1627:104269 (group)', section: 'Manage', kind: 'page', element: guard(createElement(RecruitedTab)) },
  { path: '/studies/:id/results', label: 'Results', node: '1627:96628', section: 'Manage', kind: 'page', element: guard(createElement(ResultsTab)) },
  { path: '/studies/:id/pay', label: 'Pay', node: '1627:96779 (ongoing), 1627:97128 (due)', section: 'Manage', kind: 'page', element: guard(createElement(PayTab)) },
  { path: '/studies/:id/invited', label: 'Invited', node: '1627:96329', section: 'Manage', kind: 'page', element: guard(createElement(MatchedTab)) },
  { path: '/studies/:id/pay/due', label: 'Pay, due as completed', node: '1627:97128', section: 'Manage', kind: 'page', element: guard(createElement(PayTab)) },
  { path: '/studies/:id/payment', label: 'Bill Payment', node: '1627:96956', section: 'Manage', kind: 'page', element: guard(createElement(BillPayment)) },
  { path: '/studies/:id/respondent/:rid', label: 'Respondent result, screener', node: '1627:97305', section: 'Manage', kind: 'page', element: guard(createElement(RespondentResult, { tab: 'screener' })) },
  { path: '/studies/:id/respondent/:rid/result', label: 'Respondent result, study result', node: '1627:97609, 1627:102694 + 102902 (session)', section: 'Manage', kind: 'page', element: guard(createElement(RespondentResult, { tab: 'result' })) },
  { path: '/studies/:id/respondent/:rid/activity', label: 'Activity of respondent', node: '1627:97901', section: 'Manage', kind: 'page', element: guard(createElement(RespondentResult, { tab: 'activity' })) },
  { path: '/studies/:id/paused', label: 'Paused study', node: '1704:143783', section: 'Manage', kind: 'page', element: guard(createElement(PausedStudy)) },

  { path: '/pool', label: 'Pool of Participants', node: '1645:161430, 1777:98738, 1645:161580, 1645:162272', section: 'Pool', kind: 'page', element: guard(createElement(Pool)) },
  { path: '/pool/panels/:panelId', label: 'My Panel', node: '1645:161734, 1645:162050, 1645:162132', section: 'Pool', kind: 'page', element: guard(createElement(PanelDetail)) },
  { path: '/pool/featured/:panelId', label: 'Featured Panel', node: '1645:161816, 1645:161904', section: 'Pool', kind: 'page', element: guard(createElement(PanelDetail, { featured: true })) },
  { path: '/pool/panels/new', label: 'Create Micro-panel', node: '1645:162404, 1645:162784', section: 'Pool', kind: 'page', element: guard(createElement(CreatePanel)) },
  { path: '/pool/panels/:panelId/edit', label: 'Edit Micro-panel', node: '1645:162594', section: 'Pool', kind: 'page', element: guard(createElement(CreatePanel, { edit: true })) },
  { path: '/payments', label: 'Payments', node: '1663:103326 (pending), 1663:103525 (completed)', section: 'Payments', kind: 'page', element: guard(createElement(Payments)) },

  // ----- Payments (1663:103325) -----

  // ----- Notifications (1663:104076) -----
  { path: '/notifications', label: 'Notifications', node: '1663:104077', section: 'Notifications', kind: 'page', element: guard(createElement(NotificationsPage)) },
  { path: '/account/reviews', label: 'Rating & Reviews', node: '1663:104635', section: 'Account', kind: 'page', element: guard(createElement(Account)) },
  { path: '/account/certificate', label: 'Certificate', node: '1663:104813', section: 'Account', kind: 'page', element: guard(createElement(Account)) },
  { path: '/account/settings', label: 'Settings', node: '1663:104876', section: 'Account', kind: 'page', element: guard(createElement(Account)) },
  { path: '/help', label: 'Help', node: '1663:104191 (faqs), 1663:104228 (tickets)', section: 'Help', kind: 'page', element: guard(createElement(Help)) },
  { path: '/help/tickets', label: 'Support Tickets', node: '1663:104228', section: 'Help', kind: 'page', element: guard(createElement(Help)) },
  { path: '/help/tickets/:id', label: 'Ticket Chat', node: '1663:104436 (open), 1663:104484 (solved)', section: 'Help', kind: 'page', element: guard(createElement(TicketChat)) },
  { path: '/payments/history', label: 'Payments, history', node: '1663:103525', section: 'Payments', kind: 'page', element: guard(createElement(Payments)) },
  { path: '/payments/methods', label: 'Payments, methods', node: '1663:103724 (hidden in the file)', section: 'Payments', kind: 'page', element: guard(createElement(Payments)) },
  { path: '/account', label: 'Account', node: '1663:104600, 104635, 104813, 104876', section: 'Account', kind: 'page', element: guard(createElement(Account)) },

  // ----- Help (1663:104190) -----

  // ----- Account (1663:104599) -----

  // ----- Dev -----
  { path: '/kitchen-sink', label: 'Kitchen Sink', element: guard(createElement(KitchenSink)) },

  page('*', 'Not Found', '', 'Dev'),
]

export default routes
