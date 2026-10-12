import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import Guard, { SignedOut } from './app/Guard'
import SignUp, { VerifyCode } from './screens/auth/SignUp'
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
 * The route map. Sign in, sign up and password reset are for someone
 * signed out; every other route is behind the guard (app/Guard.tsx), which
 * also holds a sub-admin to the modules they have been given.
 */
/** Behind sign in. */
const inside = <P extends object>(C: ComponentType<P>, props?: P) => createElement(Guard, null, createElement(C, props as P))
/** Only for someone signed out. */
const outside = (C: ComponentType) => createElement(SignedOut, null, createElement(C))

const routes: RouteObject[] = [
  { path: '/', element: createElement(Navigate, { to: '/signin', replace: true }) },
  { path: '/signin', element: outside(SignIn) },
  { path: '/signup', element: outside(SignUp) },
  { path: '/signup/verify', element: outside(VerifyCode) },
  { path: '/reset-password', element: outside(ResetPassword) },
  { path: '/check-email', element: outside(CheckEmail) },
  { path: '/set-password', element: outside(SetNewPassword) },
  { path: '/kitchen-sink', element: inside(KitchenSink) },
  { path: '/dashboard', element: inside(Dashboard) },
  { path: '/studies', element: inside(Studies) },
  { path: '/studies/review/:id', element: inside(ReviewStudy) },
  { path: '/studies/:id', element: inside(ManageStudy) },
  { path: '/studies/:id/respondents/:rid', element: inside(RespondentPage) },
  { path: '/studies/:id/sessions/:sid', element: inside(SessionPage) },
  { path: '/participants', element: inside(Participants) },
  { path: '/participants/verifications', element: inside(VerificationsList) },
  { path: '/participants/verifications/:id', element: inside(VerificationDetail) },
  { path: '/participants/:id', element: inside(Profile) },
  { path: '/clients', element: inside(Clients) },
  { path: '/clients/verifications', element: inside(ClientVerificationsList) },
  { path: '/clients/verifications/:id', element: inside(ClientVerificationDetail) },
  { path: '/clients/:id', element: inside(ClientProfile) },
  { path: '/support', element: inside(Support) },
  { path: '/support/:id', element: inside(TicketPage) },
  { path: '/finance', element: inside(Finance) },
  { path: '/finance/refunds', element: inside(Finance, { refunds: true }) },
  { path: '/finance/refunds/:id', element: inside(RefundDetail) },
  { path: '/pricing', element: inside(Pricing) },
  { path: '/pricing/:what', element: inside(EditPricing) },
  { path: '/sub-admin', element: inside(SubAdmins) },
  { path: '/sub-admin/new', element: inside(SubAdminProfile, { mode: 'create' }) },
  { path: '/sub-admin/:id', element: inside(SubAdminProfile, { mode: 'view' }) },
  { path: '/sub-admin/:id/edit', element: inside(SubAdminProfile, { mode: 'edit' }) },
  { path: '/account', element: inside(Account) },
  { path: '/account/edit', element: inside(EditAccount) },
  /** The sub-admin's frame (2065:207638) is now simply My Account, signed in as one. */
  { path: '/account/sub-admin', element: createElement(Navigate, { to: '/account', replace: true }) },
  { path: '*', element: createElement(Navigate, { to: '/dashboard', replace: true }) },
]

export default routes
