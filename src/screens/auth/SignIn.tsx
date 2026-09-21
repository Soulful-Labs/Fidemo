import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useStore } from '../../mock/store'
import { isValidEmail } from '../../lib/validation'
import { TIMINGS } from '../../mock/timings'
import AuthLayout from './AuthLayout'

/** PRD 4.3, Figma 915:50122. */
export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined
  const valid = isValidEmail(email) && password.length > 0

  const login = () => {
    setLoading(true)
    setTimeout(() => {
      signIn(email)
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
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)} error={emailError}
      />
      <div className="flex flex-col gap-1">
        <Input
          label="Password" type="password" placeholder="Enter your password" value={password}
          onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched(true)}
          error={touched && password.length === 0 ? 'Enter your password' : undefined}
        />
        <Link to="/forgot-password" className="self-end text-text-medium text-brand-primary">
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  )
}
