import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import Placeholder from './screens/Placeholder'
import KitchenSink from './screens/kitchen-sink/KitchenSink'
import SignIn from './screens/auth/SignIn'
import ResetPassword from './screens/auth/ResetPassword'
import CheckEmail from './screens/auth/CheckEmail'
import SetNewPassword from './screens/auth/SetNewPassword'
import Dashboard from './screens/dashboard/Dashboard'
import Studies from './screens/studies/Studies'
import ReviewStudy from './screens/studies/review/ReviewStudy'

/** A module route not built yet: the shell, with the breadcrumb the frames give that module. */
const later = (path: string, ...labels: string[]): RouteObject => ({
  path, element: createElement(Placeholder, { crumbs: labels.map((label) => ({ label })) }),
})

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
  later('/studies/:id', 'Studies', 'Ongoing'),
  later('/participants', 'All Participants'),
  later('/participants/verifications', 'Verifications'),
  later('/participants/verifications/:id', 'Verifications'),
  later('/participants/:id', 'All Participants'),
  later('/clients', 'Clients'),
  later('/clients/verifications', 'Verifications'),
  later('/clients/verifications/:id', 'Verifications'),
  later('/clients/:id', 'Active'),
  later('/support', 'Support'),
  later('/support/:id', 'Support'),
  later('/finance', 'Finance'),
  later('/finance/refunds', 'Finance', 'Refunds'),
  later('/finance/refunds/:id', 'Refunds'),
  later('/pricing', 'Pricing & Rewards'),
  later('/sub-admin', 'Sub-Admin'),
  later('/account', 'Master Admin - Account'),
  { path: '*', element: createElement(Navigate, { to: '/dashboard', replace: true }) },
]

export default routes
