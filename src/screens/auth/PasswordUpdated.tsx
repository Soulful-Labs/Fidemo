import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Check } from '../../components/ui/icons'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Password Updated!. */
export default function PasswordUpdated() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Password Updated!"
      subtitle="Your password has been updated successfully! Login now with you new password to access account."
      footer={<Button fullWidth onClick={() => navigate('/signin')}>Login</Button>}
    >
      <div className="flex justify-center py-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900 text-brand-secondary">
          <Check />
        </span>
      </div>
    </AuthLayout>
  )
}
