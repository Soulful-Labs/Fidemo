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
import ScheduleFlow from './screens/studies/schedule/ScheduleFlow'
import PinEntry from './screens/studies/complete/PinEntry'
import Survey from './screens/studies/complete/Survey'
import DiaryOverview from './screens/studies/complete/DiaryOverview'
import DiaryDay from './screens/studies/complete/DiaryDay'
import RateClient from './screens/studies/complete/RateClient'
import ClientRatings from './screens/studies/complete/ClientRatings'
import Wallet from './screens/wallet/Wallet'
import Withdraw from './screens/wallet/Withdraw'
import EarningHistory from './screens/wallet/EarningHistory'
import TransactionDetails from './screens/wallet/TransactionDetails'
import Payouts from './screens/wallet/Payouts'
import PayoutDetails from './screens/wallet/PayoutDetails'
import PayoutMethods from './screens/wallet/PayoutMethods'
import AddBankAccount from './screens/wallet/AddBankAccount'
import RewardPoints from './screens/points/RewardPoints'
import Redeem from './screens/points/Redeem'
import HowPointsWork from './screens/points/HowPointsWork'
import Profile from './screens/profile/Profile'
import MyProfile from './screens/profile/MyProfile'
import AccountSettings from './screens/profile/AccountSettings'
import ChangePassword from './screens/profile/ChangePassword'
import DeactivateAccount from './screens/profile/DeactivateAccount'
import { ConsentSettings, EmailNotifications } from './screens/profile/SettingsToggles'
import Certificate from './screens/profile/Certificate'
import Referrals from './screens/profile/Referrals'
import TrustScoreDetails from './screens/trust/TrustScoreDetails'
import TrustScoreRules from './screens/trust/TrustScoreRules'
import HowTiersWork from './screens/trust/HowTiersWork'

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
  // One component carries the pick step and the agreement / review / done
  // steps, so the selection survives moving between them.
  built('/studies/:id/schedule/:step?', 'Schedule: pick, agreement, review, done', ScheduleFlow),
  built('/studies/:id/reschedule/:step?', 'Reschedule', ScheduleFlow),
  built('/studies/:id/pin/:step?', 'Enter attendance PIN, PIN confirmed', PinEntry),
  built('/studies/:id/survey/:step?', 'Survey questions, Completed successfully', Survey),
  built('/studies/:id/diary', 'Diary overview', DiaryOverview),
  built('/studies/:id/diary/:day', 'One diary day', DiaryDay),
  built('/studies/:id/rate', 'Rate the client', RateClient),
  built('/clients/:clientId/ratings', 'Client Ratings', ClientRatings),

  // ----- Wallet tab -----
  built('/wallet', 'Wallet', Wallet),
  built('/wallet/withdraw/:step?', 'Withdraw, Select payout method, Withdrawal request sent', Withdraw),
  built('/wallet/earnings', 'Earning History', EarningHistory),
  built('/wallet/earnings/:txId', 'Transaction Details', TransactionDetails),
  built('/wallet/payouts', 'Payout and Payout History', Payouts),
  built('/wallet/payouts/:payoutId', 'Payout Details', PayoutDetails),
  built('/wallet/payout-methods', 'Manage Payout Methods', PayoutMethods),
  built('/wallet/payout-methods/add', 'Add Bank Account', AddBankAccount),
  built('/points', 'Reward Points', RewardPoints),
  built('/points/redeem/:step?', 'Redeem, Confirm Redeem, Redeemed successfully', Redeem),
  built('/points/how-it-works', 'How reward points work', HowPointsWork),

  // ----- Profile tab -----
  built('/profile', 'Profile', Profile),
  built('/profile/edit', 'My Profile, two tabs', MyProfile),
  built('/profile/certificate', 'Human Certificate', Certificate),
  built('/profile/referrals', 'Refer and Earn', Referrals),
  built('/profile/settings', 'Account Settings', AccountSettings),
  built('/profile/settings/password', 'Change Password', ChangePassword),
  built('/profile/settings/notifications', 'Email Notifications', EmailNotifications),
  built('/profile/settings/consent', 'Consent and Cookies', ConsentSettings),
  built('/profile/settings/deactivate', 'Deactivate Account', DeactivateAccount),
  built('/trust-score', 'Trust Score Details', TrustScoreDetails),
  built('/trust-score/rules', 'Trust Score Rules', TrustScoreRules),
  built('/trust-score/tiers', 'How Tiers Works', HowTiersWork),
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
