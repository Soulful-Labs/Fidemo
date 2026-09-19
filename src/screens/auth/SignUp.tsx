import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import Input from '../../components/ui/Input'
import PasswordRules from '../../components/app/PasswordRules'
import { useUI } from '../../app/ui'
import { isValidEmail, isValidPassword } from '../../lib/validation'
import AuthLayout from './AuthLayout'

/** PRD 4.2. Copy is quoted exactly, including its grammar. */
export default function SignUp() {
  const navigate = useNavigate()
  const { openComingSoon } = useUI()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailError = touched.email && !isValidEmail(email) ? 'Enter a valid email address' : undefined
  const passwordError = touched.password && !isValidPassword(password) ? 'Password does not meet the rules below' : undefined
  const valid = isValidEmail(email) && isValidPassword(password) && agreed

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join and earn money by sharing your opinions to shape future products."
      footer={
        <>
          <p className="text-center text-text-regular text-text-body">
            Already have an account?{' '}
            <Link to="/signin" className="text-brand-primary">Log In</Link>
          </p>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-stroke-3" />
            <span className="text-label text-text-disabled">Not a respondent?</span>
            <span className="h-px flex-1 bg-stroke-3" />
          </div>

          <Button variant="secondary" fullWidth onClick={() => openComingSoon('Client app')}>
            Sign up as a researcher client
          </Button>

          {/* Conflict 25: naming a participant publicly is an open legal item. */}
          <div className="flex items-center gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 p-3">
            <span className="text-body-large text-brand-primary">$100</span>
            <span className="text-label text-text-body">paid to Jonathan for a product study</span>
            <span className="ml-auto text-label text-text-disabled">25m</span>
          </div>
        </>
      }
    >
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={emailError}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
        />
        <PasswordRules password={password} />
      </div>

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

      <Button fullWidth disabled={!valid} onClick={() => navigate('/verify-otp')}
        onBlocked={() => setTouched({ email: true, password: true })}>
        Sign Up
      </Button>
    </AuthLayout>
  )
}
