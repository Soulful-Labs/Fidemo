import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import AuthLayout from './AuthLayout'

/** The "Verify Email Icon" instance: an 80px mail-with-tick on a 160px pale green disc (the asset's own colours). */
function VerifyEmailIcon() {
  return (
    <span className="relative flex h-40 w-40 items-center justify-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0" aria-hidden="true"><circle cx="80" cy="80" r="80" fill="#ecf8f3" /></svg>
      <svg viewBox="0 0 80 80" className="relative h-20 w-20 text-brand-secondary" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M68 40V24a10 10 0 0 0-10-10H22a10 10 0 0 0-10 10v32a10 10 0 0 0 10 10h22" />
        <path d="m14 22 22 15a7 7 0 0 0 8 0l22-15" />
        <path d="m52 61 7 7 13-14" />
      </svg>
    </span>
  )
}

/**
 * Check Email! (1849:111820). Card 460, 32 sides and 48 top: the 160px icon
 * centred, the heading 24 below, the copy (the email in Body Medium, the
 * bracketed "[get started / reset passwor]" kept exactly as drawn), and Open
 * My Email (secondary, 48) at +343.
 *
 * No email is sent in this build, so Open My Email goes straight to Set New
 * Password; the one line under it saying so is the only string on this
 * screen that is not in the frame (asked for in the turn 1 brief).
 */
export default function CheckEmail() {
  const navigate = useNavigate()
  return (
    <AuthLayout className="px-8 pb-8 pt-12">
      <div className="flex flex-col items-center text-center">
        <VerifyEmailIcon />
        <h1 className="pt-6 text-title-l leading-[31px] text-text-title">Check Email!</h1>
        <p className="max-w-[313px] pt-2 text-body-regular text-text-subtitle">
          Click on the link sent to your email <span className="block text-body-medium text-text-title">emailaddress@domain.com</span> to verify your account to [get started / reset passwor]!
        </p>
      </div>
      <Button variant="secondary" fullWidth className="mt-8" onClick={() => navigate('/set-password')}>Open My Email</Button>
      <p className="pt-3 text-center text-label text-text-body">Demo: no email is sent. Open My Email continues to the next step.</p>
    </AuthLayout>
  )
}
