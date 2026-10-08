import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { PasswordInput } from '../../components/ui/Input'
import { SuccessModal } from '../../components/ui/Overlay'
import AuthLayout, { AuthHeader } from './AuthLayout'

const RULES = ['1 capital letter', '1 number', '1 special character', 'at least 8 character']

/**
 * Set New Password (1849:112001). Card 460, 32 padding: heading at +16, the
 * Password field (156 tall with its four rules as a bulleted Label list) at
 * +109, Confirm Password 16 below, Submit at +385. Submit opens "Password has
 * been updated!" (1849:112267), whose Go To Login returns to Sign In. The
 * rules are shown, not enforced: no business rules in stage one.
 */
export default function SetNewPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  return (
    <AuthLayout className="p-8">
      <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); setDone(true) }}>
        <div className="pt-4">
          <AuthHeader title="Set New Password" subtitle="Enter new password" />
        </div>
        <div className="flex flex-col gap-4 pt-8">
          <PasswordInput label="Password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}
            helper={
              <ul className="flex flex-col pl-2.5 text-text-regular leading-5 text-text-subtitle">
                {RULES.map((r) => <li key={r} className="flex"><span aria-hidden="true" className="w-[11px]">•</span>{r}</li>)}
              </ul>
            } />
          <PasswordInput label="Confirm Password" placeholder="Enter your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" fullWidth className="mt-8">Submit</Button>
      </form>
      <SuccessModal open={done} onClose={() => setDone(false)} title="Password has been updated!"
        body="Your new password has been updated with your account which you can use to login from now."
        action="Go To Login" onAction={() => navigate('/signin')} />
    </AuthLayout>
  )
}
