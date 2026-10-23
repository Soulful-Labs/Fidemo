import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useStore } from '../../mock/store'
import { isValidEmail } from '../../lib/validation'
import { TIMINGS } from '../../mock/timings'
import AuthLayout from './AuthLayout'
import { DEMO_PERSON_EMAIL, DEMO_PERSON_PASSWORD } from '@shared/seed'

/** PRD 4.3, Figma 915:50122. */
export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  // The platform's refusal, shown under the field it is about until that field changes.
  const [refused, setRefused] = useState<{ field: 'email' | 'password'; why: string } | null>(null)

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined
  const valid = isValidEmail(email) && password.length > 0

  const login = () => {
    setLoading(true)
    setTimeout(() => {
      const r = signIn(email, password)
      setLoading(false)
      if (!r.ok) { setRefused({ field: /password/i.test(r.why) ? 'password' : 'email', why: r.why }); return }
      navigate('/dashboard')
    }, TIMINGS.fakeServer)
  }

  return (
    <AuthLayout
      logo
      promo
      title="Welcome back!"
      subtitle="Sign in to your account, studies are waiting!"
      actions={
        <>
          <Button fullWidth loading={loading} disabled={!valid} onClick={login}
            onBlocked={() => setTouched(true)}>
            Login
          </Button>
          <Button variant="tertiary" fullWidth onClick={() => navigate('/signup')}>
            Don&apos;t have an account?&nbsp;<span className="text-brand-primary">Sign Up</span>
          </Button>
        </>
      }
    >
      <Input
        label="Email" type="email" placeholder="Enter email address" value={email}
        onChange={(e) => { setEmail(e.target.value); setRefused(null) }}
        onBlur={() => setTouched(true)} error={emailError ?? (refused?.field === 'email' ? refused.why : undefined)}
      />
      <div className="flex flex-col gap-1">
        <Input
          label="Password" type="password" placeholder="Enter your password" value={password}
          onChange={(e) => { setPassword(e.target.value); setRefused(null) }} onBlur={() => setTouched(true)}
          error={touched && password.length === 0 ? 'Enter your password' : refused?.field === 'password' ? refused.why : undefined}
        />
        <Link to="/forgot-password" className="self-end text-text-medium text-brand-primary">
          Forgot Password?
        </Link>
      </div>
      {/* Demo mode, as the OTP screen says: the demo participant's login. Signing in with it puts the demo data back. */}
      <p className="text-label text-text-body">Demo: {DEMO_PERSON_EMAIL}, password {DEMO_PERSON_PASSWORD}. It restores the demo data.</p>
    </AuthLayout>
  )
}
