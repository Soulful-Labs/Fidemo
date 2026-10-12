import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { platform } from '@shared/store'
import Button from '../../components/ui/Button'
import Input, { PasswordInput } from '../../components/ui/Input'
import { PASSWORD_RULE, passwordOk, signUp } from '../../session'
import AuthLayout, { AuthHeader } from './AuthLayout'

/** The code this build accepts. No email is sent, so the screen says what it is. */
const CODE = '123456'
interface Draft { name: string; email: string; password: string }

/**
 * Sign Up. No frame draws it: it is Sign In's own card (524 wide, 32 padding,
 * the same heading, inputs and button) with four fields. The password rule is
 * the one Change Password already draws (2065:206687).
 *
 * This is open sign-up, built for the demo. A real console is invite-only
 * (internal/CLAUDE.md, "Sign in and sign up").
 */
export default function SignUp() {
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [touched, setTouched] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const errors = {
    name: f.name.trim() ? undefined : 'Enter your name',
    email: !/^\S+@\S+\.\S+$/.test(f.email.trim()) ? 'Enter a work email address'
      : !platform().teamEmailFree(f.email) ? 'A team account already uses that email address' : undefined,
    password: passwordOk(f.password) ? undefined : PASSWORD_RULE,
    confirm: f.confirm === f.password && f.confirm ? undefined : 'The two passwords do not match',
  }
  const ok = !errors.name && !errors.email && !errors.password && !errors.confirm
  const show = (k: keyof typeof errors) => (touched ? errors[k] : undefined)

  return (
    <AuthLayout width={524} className="p-8">
      <form className="flex flex-col" noValidate onSubmit={(e) => {
        e.preventDefault(); setTouched(true)
        if (ok) navigate('/signup/verify', { state: { name: f.name, email: f.email, password: f.password } satisfies Draft })
      }}>
        <div className="pt-4">
          <AuthHeader big title="Create Team Account" subtitle="Set up your own Admin Team Panel" />
        </div>
        <div className="flex flex-col gap-4 pt-12">
          <Input label="Name" placeholder="Enter your name" value={f.name} onChange={set('name')} error={show('name')} />
          <Input label="Work Email" type="email" placeholder="Enter work email address" value={f.email} onChange={set('email')} error={show('email')} />
          <PasswordInput label="Password" placeholder="Enter a password" value={f.password} onChange={set('password')} error={show('password')}
            helper={<p className="text-text-regular text-text-subtitle">{PASSWORD_RULE}</p>} />
          <PasswordInput label="Confirm Password" placeholder="Re-enter the password" value={f.confirm} onChange={set('confirm')} error={show('confirm')} />
        </div>
        <Button type="submit" fullWidth className="mt-12">Sign Up</Button>
        <Link to="/signin" className="mt-3 flex h-12 items-center justify-center rounded-md border-1 border-cta-tertiaryStroke text-body-regular text-text-title">
          Already on the team?&nbsp;<span className="text-body-medium">Login</span>
        </Link>
      </form>
    </AuthLayout>
  )
}

/**
 * The six-digit code step. Again not drawn: the 460 card the other three
 * onboarding screens use, one input, one button. The code is 123456 and the
 * screen says no email is sent. On the right code the account is made as the
 * master admin of an empty console (shared/store.ts signUpTeam).
 */
export function VerifyCode() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: Draft | null }
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  if (!state?.email) return <Navigate to="/signup" replace />

  const verify = () => {
    if (code.trim() !== CODE) { setError('That code is not right. Use 123456.'); return }
    const res = signUp(state)
    if (!res.ok) { setError(res.why); return }
    navigate('/dashboard', { replace: true })
  }
  return (
    <AuthLayout className="px-8 pb-8 pt-12">
      <form className="flex flex-col" noValidate onSubmit={(e) => { e.preventDefault(); verify() }}>
        <AuthHeader title="Enter the 6-digit code" subtitle={<>We would send a code to <span className="text-body-medium text-text-title">{state.email}</span> to confirm it is yours.</>} />
        <Input className="pt-8" label="Verification Code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} error={error || undefined}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }} />
        <Button type="submit" fullWidth className="mt-8">Verify and Continue</Button>
        <p className="pt-3 text-center text-text-regular text-text-body">Demo build: no email is sent. The code is 123456.</p>
        <Link to="/signup" className="pt-3 text-center text-body-medium text-text-title">Back</Link>
      </form>
    </AuthLayout>
  )
}
