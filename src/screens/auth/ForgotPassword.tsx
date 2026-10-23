import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import { isValidEmail } from '../../lib/validation'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Reset Password. Figma 915:50191. */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { setOnboarding, emailFree } = useStore()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [unknown, setUnknown] = useState('')

  // A real server sends the link only when the account exists and says the same either way; this stand-in says so plainly.
  const error = touched && !isValidEmail(email) ? 'Enter a valid email address'
    : unknown && unknown === email.trim().toLowerCase() ? 'No account uses that email address' : undefined

  return (
    <AuthLayout
      barTitle="Reset Password"
      onBack={back}
      title="Enter Email"
      subtitle="Please enter your email address"
      actions={
        <Button fullWidth disabled={!isValidEmail(email)} onClick={() => {
          if (emailFree(email)) { setUnknown(email.trim().toLowerCase()); setTouched(true); return }
          setOnboarding({ email: email.trim() })
          navigate('/check-email')
        }}
          onBlocked={() => setTouched(true)}>
          Submit
        </Button>
      }
    >
      <Input
        label="Email" type="email" placeholder="Enter email address" value={email}
        onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} error={error}
      />
    </AuthLayout>
  )
}
