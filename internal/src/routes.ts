import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import KitchenSink from './screens/kitchen-sink/KitchenSink'
import SignIn from './screens/auth/SignIn'
import ResetPassword from './screens/auth/ResetPassword'
import CheckEmail from './screens/auth/CheckEmail'
import SetNewPassword from './screens/auth/SetNewPassword'
import Dashboard from './screens/dashboard/Dashboard'
import Participants from './screens/participants/Participants'
import Profile from './screens/participants/profile/Profile'
import VerificationDetail from './screens/participants/verifications/VerificationDetail'
import VerificationsList from './screens/participants/verifications/VerificationsList'
import ClientProfile from './screens/clients/ClientProfile'
import Clients from './screens/clients/Clients'
import { ClientVerificationDetail, ClientVerificationsList } from './screens/clients/ClientVerifications'
import Support from './screens/support/Support'
import TicketPage from './screens/support/TicketPage'
import Finance from './screens/finance/Finance'
import RefundDetail from './screens/finance/RefundDetail'
import EditPricing from './screens/pricing/EditScreens'
import Pricing from './screens/pricing/Pricing'
import Account, { EditAccount } from './screens/account/Account'
import SubAdminProfile from './screens/subadmin/SubAdminProfile'
import SubAdmins from './screens/subadmin/SubAdmins'
import Studies from './screens/studies/Studies'
import ReviewStudy from './screens/studies/review/ReviewStudy'
import ManageStudy from './screens/studies/manage/ManageStudy'
import RespondentPage from './screens/studies/respondent/RespondentPage'
import SessionPage from './screens/studies/respondent/SessionPage'

/**
 * The route map. Built: sign in and password reset (turn 1). Every module
 * route already renders inside the shell so the nav lights correctly; its
 * screen comes in its turn (CLAUDE.md, "Build order").
 */
const routes: RouteObject[] = [
  { path: '/', element: createElement(Navigate, { to: '/signin', replace: true }) },
  { path: '/signin', element: createElement(SignIn) },
  { path: '/reset-password', element: createElement(ResetPassword) },
  { path: '/check-email', element: createElement(CheckEmail) },
  { path: '/set-password', element: createElement(SetNewPassword) },
  { path: '/kitchen-sink', element: createElement(KitchenSink) },
  { path: '/dashboard', element: createElement(Dashboard) },
  { path: '/studies', element: createElement(Studies) },
  { path: '/studies/review/:id', element: createElement(ReviewStudy) },
  { path: '/studies/:id', element: createElement(ManageStudy) },
  { path: '/studies/:id/respondents/:rid', element: createElement(RespondentPage) },
  { path: '/studies/:id/sessions/:sid', element: createElement(SessionPage) },
  { path: '/participants', element: createElement(Participants) },
  { path: '/participants/verifications', element: createElement(VerificationsList) },
  { path: '/participants/verifications/:id', element: createElement(VerificationDetail) },
  { path: '/participants/:id', element: createElement(Profile) },
  { path: '/clients', element: createElement(Clients) },
  { path: '/clients/verifications', element: createElement(ClientVerificationsList) },
  { path: '/clients/verifications/:id', element: createElement(ClientVerificationDetail) },
  { path: '/clients/:id', element: createElement(ClientProfile) },
  { path: '/support', element: createElement(Support) },
  { path: '/support/:id', element: createElement(TicketPage) },
  { path: '/finance', element: createElement(Finance) },
  { path: '/finance/refunds', element: createElement(Finance, { refunds: true }) },
  { path: '/finance/refunds/:id', element: createElement(RefundDetail) },
  { path: '/pricing', element: createElement(Pricing) },
  { path: '/pricing/:what', element: createElement(EditPricing) },
  { path: '/sub-admin', element: createElement(SubAdmins) },
  { path: '/sub-admin/new', element: createElement(SubAdminProfile, { mode: 'create' }) },
  { path: '/sub-admin/:id', element: createElement(SubAdminProfile, { mode: 'view' }) },
  { path: '/sub-admin/:id/edit', element: createElement(SubAdminProfile, { mode: 'edit' }) },
  { path: '/account', element: createElement(Account) },
  { path: '/account/edit', element: createElement(EditAccount) },
  { path: '/account/sub-admin', element: createElement(Account, { sub: true }) },
  { path: '*', element: createElement(Navigate, { to: '/dashboard', replace: true }) },
]

export default routes
