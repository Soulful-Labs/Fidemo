import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import Input from '../../components/ui/Input'
import { useUI } from '../../app/ui'
import { useStore } from '../../mock/store'
import { isValidEmail, isValidPassword } from '../../lib/validation'
import AuthLayout from './AuthLayout'

const PASSWORD_HINT = 'Use 1 capital letter, 1 number, 1 special character and at least 8 characters'

/** PRD 4.2, Figma 915:50149. Copy is quoted exactly, including its grammar. */
export default function SignUp() {
  const navigate = useNavigate()
  const { openComingSoon } = useUI()
  const { setOnboarding } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailError = touched.email && !isValidEmail(email) ? 'Enter a valid email address' : undefined
  const passwordError = touched.password && !isValidPassword(password) ? PASSWORD_HINT : undefined
  const valid = isValidEmail(email) && isValidPassword(password) && agreed

  return (
    <AuthLayout
      logo
      promo
      title="Create your account"
      subtitle="Join and earn money by sharing your opinions to shape future products."
      actions={
        <>
          <Button fullWidth disabled={!valid} onClick={() => { setOnboarding({ email: email.trim() }); navigate('/verify-otp') }}
            onBlocked={() => setTouched({ email: true, password: true })}>
            Sign Up
          </Button>

          <Button variant="tertiary" fullWidth onClick={() => navigate('/signin')}>
            Already have an account?&nbsp;<span className="text-brand-primary">Log In</span>
          </Button>

          <p className="pt-2 text-center text-body-regular text-text-subtitle">Not a respondent?</p>

          <Button variant="tertiary" fullWidth onClick={() => openComingSoon('Client app')}>
            Sign up as a researcher client
          </Button>
        </>
      }
    >
      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={emailError}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={passwordError}
      />

      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        label={
          <>
            I agree to HumanLayer&apos;s{' '}
            <button type="button" className="text-brand-primary" onClick={() => openComingSoon('Terms of use')}>Terms of use</button>
            {' '}and{' '}
            <button type="button" className="text-brand-primary" onClick={() => openComingSoon('Privacy policy')}>Privacy policy</button>
          </>
        }
      />
    </AuthLayout>
  )
}
