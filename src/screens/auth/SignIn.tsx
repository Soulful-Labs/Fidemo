import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useStore } from '../../mock/store'
import { isValidEmail } from '../../lib/validation'
import { TIMINGS } from '../../mock/timings'
import AuthLayout from './AuthLayout'

/** PRD 4.3. */
export default function SignIn() {
  const navigate = useNavigate()
  const { signIn, user } = useStore()
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined
  const valid = isValidEmail(email) && password.length > 0

  const login = () => {
    setLoading(true)
    setTimeout(() => {
      signIn()
      navigate('/dashboard')
    }, TIMINGS.fakeServer)
  }

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to your account, studies are waiting!"
      footer={
        <p className="text-center text-text-regular text-text-body">
          Don&apos;t have an account? <Link to="/signup" className="text-brand-primary">Sign Up</Link>
        </p>
      }
    >
      <Input
        label="Email" type="email" placeholder="Enter your email" value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)} error={emailError}
      />
      <Input
        label="Password" type="password" placeholder="Enter password" value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Link to="/forgot-password" className="self-end text-text-medium text-brand-primary">
        Forgot Password?
      </Link>

      <Button fullWidth loading={loading} disabled={!valid} onClick={login}
        onBlocked={() => setTouched(true)}>
        Login
      </Button>
    </AuthLayout>
  )
}
