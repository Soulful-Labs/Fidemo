import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAppNav } from '../../app/useAppNav'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Check Email!. "Open My Email" stands in for leaving the app. */
export default function CheckEmail() {
  const navigate = useNavigate()
  const { back } = useAppNav()

  return (
    <AuthLayout
      barTitle="Check Email" onBack={back} title="Check Email!"
      subtitle="Click on the link sent to your email emailaddress@domain.com to verify and set new password"
      footer={
        <Button fullWidth onClick={() => navigate('/reset-password')}>Open My Email</Button>
      }
    >
      <div />
    </AuthLayout>
  )
}
