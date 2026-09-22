import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Check Email!. Figma 915:50203. "Open My Email" stands in for leaving the app. */
export default function CheckEmail() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, user } = useStore()
  const email = onboarding.email || user.email

  return (
    <AuthLayout
      centered
      barTitle="Verify Email"
      onBack={back}
      hero={
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-text-title">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      }
      title="Check Email!"
      subtitle={
        <>
          Click on the link sent to your email{' '}
          <span className="font-semibold text-text-title">{email}</span>{' '}
          to verify and set new password
        </>
      }
      actions={
        <Button variant="secondary" fullWidth onClick={() => navigate('/reset-password')}>Open My Email</Button>
      }
    >
      <p className="text-center text-label text-text-body">Demo mode. No email is sent. Tap Open My Email to continue.</p>
    </AuthLayout>
  )
}
