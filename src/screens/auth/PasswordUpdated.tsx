import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import SuccessBadge from '../../components/app/SuccessBadge'

/**
 * PRD 4.11, Password Updated!. Figma draws it as a sheet (1265:83738); the
 * route renders that sheet rising from the bottom of a dimmed screen.
 */
export default function PasswordUpdated() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col justify-end bg-bg-1">
      <div className="flex flex-col items-center gap-6 rounded-t-xl bg-bg-0 bg-yellow-fade px-4 pb-6 pt-5 text-center">
        <SuccessBadge />
        <div className="flex flex-col gap-2">
          <h1 className="text-title-l text-text-title">Password Updated!</h1>
          <p className="text-body-regular text-text-body">
            Your password has been updated successfully! Login now with you new password to access account.
          </p>
        </div>
        <span className="h-px w-full bg-stroke-3" />
        <Button fullWidth onClick={() => navigate('/signin')}>Login</Button>
      </div>
    </div>
  )
}
