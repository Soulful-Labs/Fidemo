import { createElement } from 'react'
import { Navigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
import KitchenSink from './screens/kitchen-sink/KitchenSink'

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
  page('/dashboard', 'Dashboard', '826:85021', 'Dashboard'),
  page('/dashboard/empty', 'Dashboard, no studies', '826:85659', 'Dashboard'),

  // ----- Studies list (1518:72486) -----
  page('/studies', 'Studies, Ongoing', '1518:90600', 'Studies'),
  page('/studies/drafts', 'Studies, Drafts', '1518:90624', 'Studies'),
  page('/studies/completed', 'Studies, Completed', '1518:90760', 'Studies'),
  page('/studies/grid', 'Studies, card view', '1518:90966', 'Studies'),

  // ----- Create, one flow for every type (see CLAUDE.md) -----
  page('/studies/create/about', 'Create, About', '1622:81504', 'Create'),
  page('/studies/create/audience', 'Create, Audience', '1622:81615', 'Create'),
  page('/studies/create/audience/no-match', 'Create, no matching audience', '1518:91273', 'Create'),
  page('/studies/create/screener', 'Create, Screener', '1622:81771', 'Create'),
  page('/studies/create/study', 'Create, Study setup', '1518:91922', 'Create'),
  page('/studies/create/publish', 'Create, Payment & Publish', '1622:87629', 'Create'),
  page('/studies/create/published', 'Create, Published', '1518:92376', 'Create'),

  // ----- Manage, one flow for every type (see CLAUDE.md) -----
  page('/studies/:id', 'Study Overview', '1627:95956', 'Manage'),
  page('/studies/:id/manage', 'Manage Study', '1627:96085', 'Manage'),
  page('/studies/:id/matched', 'Matched Respondents', '1627:96237', 'Manage'),
  page('/studies/:id/invited', 'Invited Respondents', '1627:96329', 'Manage'),
  page('/studies/:id/recruited', 'Recruited Respondents', '1627:96535', 'Manage'),
  page('/studies/:id/results', 'Results', '1627:96628', 'Manage'),
  page('/studies/:id/pay', 'Pay while ongoing', '1627:96779', 'Manage'),
  page('/studies/:id/pay/due', 'Pay, due as completed', '1627:97128', 'Manage'),
  page('/studies/:id/payment', 'Payment', '1627:96956', 'Manage'),
  page('/studies/:id/respondent/:rid', 'Respondent result', '1627:97305', 'Manage'),
  page('/studies/:id/respondent/:rid/activity', 'Activity of respondent', '1627:97901', 'Manage'),
  page('/studies/:id/paused', 'Paused study', '1704:143783', 'Manage'),

  // ----- Pool (1645:161429) -----
  page('/pool', 'Pool', '1645:161580', 'Pool'),
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
