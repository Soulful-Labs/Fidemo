import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAppNav } from '../../app/useAppNav'
import { isValidEmail } from '../../lib/validation'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Reset Password. Figma 915:50191. */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const error = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined

  return (
    <AuthLayout
      barTitle="Reset Password"
      onBack={back}
      title="Enter Email"
      subtitle="Please enter your email address"
      actions={
        <Button fullWidth disabled={!isValidEmail(email)} onClick={() => navigate('/check-email')}
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
