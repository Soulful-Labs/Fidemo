import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AuthLayout, { AuthHeader } from './AuthLayout'

/**
 * Reset Password (1849:111913). Card 460, 32 padding: heading at +16, Email
 * at +131, Submit at +235 and Cancel 16 below it. The copy promises an OTP
 * code; the next frame (Check Email) asks for a link click instead, and no
 * frame draws a code field. Both strings stay as drawn.
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  return (
    <AuthLayout className="p-8">
      <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); navigate('/check-email', { state: { email } }) }}>
        <div className="pt-4">
          <AuthHeader title="Reset Password" subtitle="Please enter your registered email address for receiving a OTP code to reset password" />
        </div>
        <Input className="pt-8" label="Email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex flex-col gap-4 pt-8">
          <Button type="submit" fullWidth>Submit</Button>
          <Button variant="tertiary" fullWidth onClick={() => navigate('/signin')}>Cancel</Button>
        </div>
      </form>
    </AuthLayout>
  )
}
