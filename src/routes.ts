import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import Placeholder from './components/Placeholder'
import RootRedirect from './app/RootRedirect'
import KitchenSink from './screens/kitchen-sink/KitchenSink'

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

const redirect = (path: string, to: string, replace = true): ScreenRoute => ({
  path,
  label: `Redirect → ${to}`,
  element: createElement(Navigate, { to, replace }),
})

export const routes: ScreenRoute[] = [
  // ----- Auth -----
  { path: '/', label: 'Redirect \u2192 /dashboard or /signup', element: createElement(RootRedirect) },
  screen('/signup', 'Create your account'),
  screen('/signin', 'Welcome back'),
  screen('/verify-otp', 'Enter OTP'),
  screen('/forgot-password', 'Reset Password'),
  screen('/check-email', 'Check Email'),
  screen('/reset-password', 'Set New Password'),
  screen('/password-updated', 'Password Updated'),

  // ----- Onboarding -----
  screen('/onboarding/about', 'About You, 1 of 3'),
  screen('/onboarding/professional', 'Get Personalized Studies, 2 of 3'),
  screen('/onboarding/identity', 'Identity Verification, 3 of 3'),
  screen('/onboarding/welcome', 'Welcome to HumanLayer'),

  // ----- Dashboard tab -----
  screen('/dashboard', 'Dashboard'),
  screen('/notifications', 'Notifications'),

  // ----- Studies tab -----
  screen('/studies', 'Explore'),
  screen('/studies/saved', 'Saved'),
  redirect('/studies/mine', '/studies/mine/invites'),
  screen('/studies/mine/invites', 'My Studies, Invites'),
  screen('/studies/mine/scheduled', 'My Studies, Scheduled'),
  screen('/studies/mine/drafts', 'My Studies, Drafts'),
  screen('/studies/mine/applied', 'My Studies, Applied'),
  screen('/studies/mine/history', 'My Studies, History'),
  screen('/studies/:id', 'Study Detail'),
  screen('/studies/:id/screener', 'Screener questions'),
  screen('/studies/:id/applied', 'Applied successfully'),
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
