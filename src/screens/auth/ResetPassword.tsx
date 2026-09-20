import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordRules from '../../components/app/PasswordRules'
import { useAppNav } from '../../app/useAppNav'
import { isValidPassword } from '../../lib/validation'
import AuthLayout from './AuthLayout'

/** PRD 4.11, Set New Password. Figma 915:50217. */
export default function ResetPassword() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)

  const mismatch = touched && confirm.length > 0 && confirm !== password
  const valid = isValidPassword(password) && confirm === password

  return (
    <AuthLayout
      barTitle="Set Password" onBack={back}
      title="Set New Password" subtitle="Enter new password"
      actions={
        <Button fullWidth disabled={!valid} onClick={() => navigate('/password-updated')}
          onBlocked={() => setTouched(true)}>
          Submit
        </Button>
      }
    >
      <div className="flex flex-col gap-2">
        <Input label="Password" type="password" placeholder="Enter your password" value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <PasswordRules password={password} />
      </div>

      <Input label="Confirm Password" type="password" placeholder="Enter your password" value={confirm}
        onChange={(e) => setConfirm(e.target.value)} onBlur={() => setTouched(true)}
        error={mismatch ? 'Passwords do not match' : undefined} />
    </AuthLayout>
  )
}
