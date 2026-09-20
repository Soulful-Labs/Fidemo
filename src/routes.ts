import { createElement } from 'react'
import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import Placeholder from './components/Placeholder'
import RootRedirect from './app/RootRedirect'
import KitchenSink from './screens/kitchen-sink/KitchenSink'
import SignUp from './screens/auth/SignUp'
import SignIn from './screens/auth/SignIn'
import VerifyOtp from './screens/auth/VerifyOtp'
import ForgotPassword from './screens/auth/ForgotPassword'
import CheckEmail from './screens/auth/CheckEmail'
import ResetPassword from './screens/auth/ResetPassword'
import PasswordUpdated from './screens/auth/PasswordUpdated'
import Dashboard from './screens/dashboard/Dashboard'
import Explore from './screens/studies/Explore'
import Saved from './screens/studies/Saved'
import StudyDetail from './screens/studies/detail/StudyDetail'
import Notifications from './screens/dashboard/Notifications'
import AboutYou from './screens/onboarding/AboutYou'
import Professional from './screens/onboarding/Professional'
import Identity from './screens/onboarding/Identity'
import Welcome from './screens/onboarding/Welcome'
import MyStudies from './screens/studies/MyStudies'
import Screener from './screens/studies/questions/Screener'
import AppliedSuccess from './screens/studies/questions/AppliedSuccess'

/**
 * The complete route map from the build brief. Every screen route points at the
 * Step 0 Placeholder component for now; real screens replace them turn by turn
 * per the build order. Redirect routes use <Navigate>.
 *
 * `label` is the human-facing screen name, used by the placeholder and by any
 * tooling that wants to walk the route table.
 */

type ScreenRoute = RouteObject & { label?: string }

const screen = (path: string, label: string): ScreenRoute => ({
  path,
  label,
  element: createElement(Placeholder, { name: label }),
})

/** A built screen, replacing its placeholder. */
const built = (path: string, label: string, Component: ComponentType): ScreenRoute => ({
  path,
  label,
  element: createElement(Component),
})

const redirect = (path: string, to: string, replace = true): ScreenRoute => ({
  path,
  label: `Redirect → ${to}`,
  element: createElement(Navigate, { to, replace }),
})

export const routes: ScreenRoute[] = [
  // ----- Auth -----
  { path: '/', label: 'Redirect \u2192 /dashboard or /signup', element: createElement(RootRedirect) },
  built('/signup', 'Create your account', SignUp),
  built('/signin', 'Welcome back', SignIn),
  built('/verify-otp', 'Enter OTP', VerifyOtp),
  built('/forgot-password', 'Reset Password', ForgotPassword),
  built('/check-email', 'Check Email', CheckEmail),
  built('/reset-password', 'Set New Password', ResetPassword),
  built('/password-updated', 'Password Updated', PasswordUpdated),

  // ----- Onboarding -----
  built('/onboarding/about', 'About You, 1 of 3', AboutYou),
  built('/onboarding/professional', 'Get Personalized Studies, 2 of 3', Professional),
  built('/onboarding/identity', 'Identity Verification, 3 of 3', Identity),
  built('/onboarding/welcome', 'Welcome to HumanLayer', Welcome),

  // ----- Dashboard tab -----
  built('/dashboard', 'Dashboard', Dashboard),
  built('/notifications', 'Notifications', Notifications),

  // ----- Studies tab -----
  built('/studies', 'Explore', Explore),
  built('/studies/saved', 'Saved', Saved),
  redirect('/studies/mine', '/studies/mine/invites'),
  built('/studies/mine/:tab', 'My Studies', MyStudies),
  built('/studies/:id', 'Study Detail', StudyDetail),
  built('/studies/:id/screener', 'Screener questions', Screener),
  built('/studies/:id/applied', 'Applied successfully', AppliedSuccess),
  screen('/studies/:id/schedule', 'Pick date, time, and location'),
  screen('/studies/:id/schedule/agreement', 'Call recording agreement'),
  screen('/studies/:id/schedule/review', 'Review Schedule'),
  screen('/studies/:id/schedule/done', 'Scheduled confirmation'),
  screen('/studies/:id/reschedule', 'Reschedule'),
  screen('/studies/:id/pin', 'Enter attendance PIN'),
  screen('/studies/:id/pin/done', 'PIN confirmed'),
  screen('/studies/:id/survey', 'Survey questions'),
  screen('/studies/:id/survey/done', 'Completed successfully'),
  screen('/studies/:id/diary', 'Diary overview'),
  screen('/studies/:id/diary/:day', 'One diary day'),
  screen('/studies/:id/rate', 'Rate the client'),
  screen('/clients/:clientId/ratings', 'Client Ratings'),

  // ----- Wallet tab -----
  screen('/wallet', 'Wallet'),
  screen('/wallet/withdraw', 'Withdraw'),
  screen('/wallet/withdraw/method', 'Select payout method'),
  screen('/wallet/withdraw/done', 'Withdrawal request sent'),
  screen('/wallet/earnings', 'Earning History'),
  screen('/wallet/earnings/:txId', 'Transaction Details'),
  screen('/wallet/payouts', 'Payout and Payout History'),
  screen('/wallet/payouts/:payoutId', 'Payout Details'),
  screen('/wallet/payout-methods', 'Manage Payout Methods'),
  screen('/wallet/payout-methods/add', 'Add Bank Account'),
  screen('/points', 'Reward Points'),
  screen('/points/redeem', 'Redeem'),
  screen('/points/redeem/confirm', 'Confirm Redeem'),
  screen('/points/redeem/done', 'Redeemed successfully'),
  screen('/points/how-it-works', 'How reward points work'),

  // ----- Profile tab -----
  screen('/profile', 'Profile'),
  screen('/profile/edit', 'My Profile'),
  screen('/profile/certificate', 'Human Certificate'),
  screen('/profile/referrals', 'Refer and Earn'),
  screen('/profile/settings', 'Account Settings'),
  screen('/profile/settings/password', 'Change Password'),
  screen('/profile/settings/notifications', 'Email Notifications'),
  screen('/profile/settings/consent', 'Consent and Cookies'),
  screen('/profile/settings/deactivate', 'Deactivate Account'),
  screen('/trust-score', 'Trust Score Details'),
  screen('/trust-score/rules', 'Trust Score Rules'),
  screen('/trust-score/tiers', 'How Tiers Works'),
  screen('/support', 'Help and Support'),
  screen('/support/tickets', 'Support Tickets'),
  screen('/support/tickets/:id', 'Support Chat'),
  screen('/support/contact', 'Contact us'),

  // ----- Dev -----
  { path: '/kitchen-sink', label: 'Kitchen Sink', element: createElement(KitchenSink) },

  // ----- Fallback -----
  screen('*', 'Not Found'),
]

export default routes
