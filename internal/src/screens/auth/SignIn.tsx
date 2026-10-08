import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input, { PasswordInput } from '../../components/ui/Input'
import AuthLayout, { AuthHeader } from './AuthLayout'

/**
 * Sign In (1849:112091). Card 524 wide, 32 padding: the heading 16 below the
 * padding, the form at +136 (Email, then Password 16 below, then "Forgot
 * Password?" right-aligned 12 under it), Login at +382. No rules: any input
 * signs in (stage one is navigation only).
 */
export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <AuthLayout width={524} className="p-8">
      <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard') }}>
        <div className="pt-4">
          <AuthHeader big title="Login to Team Panel" subtitle="Welcome to HumanLayer's Admin Team Panel" />
        </div>
        <div className="flex flex-col gap-4 pt-12">
          <Input label="Email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex flex-col gap-3">
            <PasswordInput label="Password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Link to="/reset-password" className="flex h-[26px] items-center self-end text-body-medium text-text-title">Forgot Password?</Link>
          </div>
        </div>
        <Button type="submit" fullWidth className="mt-12">Login</Button>
      </form>
    </AuthLayout>
  )
}
