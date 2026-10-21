import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_ADMIN_EMAIL, DEMO_SUB_ADMIN_EMAIL, DEMO_TEAM_PASSWORD } from '@shared/seed'
import Button from '../../components/ui/Button'
import Input, { PasswordInput } from '../../components/ui/Input'
import { currentMember, landing, signIn } from '../../session'
import AuthLayout, { AuthHeader } from './AuthLayout'

/**
 * Sign In (1849:112091). Card 524 wide, 32 padding: the heading 16 below the
 * padding, the form at +136 (Email, then Password 16 below, then "Forgot
 * Password?" right-aligned 12 under it), Login at +382.
 *
 * The email and password are checked against the team the platform holds
 * (shared/store.ts signInTeam); a wrong one is refused under its own field.
 * Signing in starts the session and goes to where the person was headed, or
 * to where they land. Under Login, and not in the frame: the demo logins, as
 * the other two apps show theirs. There is no sign-up (22 Oct 2026): a team
 * account is made only by a master admin, on Sub-Admin.
 */
export default function SignIn() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { from?: string } | null }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ email?: string; password?: string }>({})

  const enter = (e: string, p: string) => {
    if (!e.trim()) { setError({ email: 'Enter your email address' }); return }
    if (!p) { setError({ password: 'Enter your password' }); return }
    const res = signIn(e, p)
    if (!res.ok) { setError(res.why.includes('password') ? { password: res.why } : { email: res.why }); return }
    navigate(state?.from ?? landing(currentMember()), { replace: true })
  }
  const demo = (e: string) => { setEmail(e); setPassword(DEMO_TEAM_PASSWORD); enter(e, DEMO_TEAM_PASSWORD) }

  return (
    <AuthLayout width={524} className="p-8">
      <form className="flex flex-col" noValidate onSubmit={(e) => { e.preventDefault(); enter(email, password) }}>
        <div className="pt-4">
          <AuthHeader big title="Login to Team Panel" subtitle="Welcome to HumanLayer's Admin Team Panel" />
        </div>
        <div className="flex flex-col gap-4 pt-12">
          <Input label="Email" type="email" placeholder="Enter email address" value={email} error={error.email}
            onChange={(e) => { setEmail(e.target.value); setError({}) }} />
          <div className="flex flex-col gap-3">
            <PasswordInput label="Password" placeholder="Enter your password" value={password} error={error.password}
              onChange={(e) => { setPassword(e.target.value); setError({}) }} />
            <Link to="/reset-password" className="flex h-[26px] items-center self-end text-body-medium text-text-title">Forgot Password?</Link>
          </div>
        </div>
        <Button type="submit" fullWidth className="mt-12">Login</Button>
        <div className="mt-6 flex flex-col gap-1 rounded-md bg-bg-1 px-4 py-3 text-text-regular leading-5 text-text-subtitle">
          <p className="text-text-body">Demo build. These are demo accounts; signing in as the master admin puts the demo data back.</p>
          <button type="button" className="text-left hover:text-text-title" onClick={() => demo(DEMO_ADMIN_EMAIL)}>Master admin: <span className="text-text-title">{DEMO_ADMIN_EMAIL}</span> / <span className="text-text-title">{DEMO_TEAM_PASSWORD}</span></button>
          <button type="button" className="text-left hover:text-text-title" onClick={() => demo(DEMO_SUB_ADMIN_EMAIL)}>Sub-admin (Studies, Participants): <span className="text-text-title">{DEMO_SUB_ADMIN_EMAIL}</span> / <span className="text-text-title">{DEMO_TEAM_PASSWORD}</span></button>
        </div>
      </form>
    </AuthLayout>
  )
}
