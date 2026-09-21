import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import PasswordRules from '../../components/app/PasswordRules'
import SuccessBadge from '../../components/app/SuccessBadge'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import TopBar from '../../components/ui/TopBar'
import { isValidPassword } from '../../lib/validation'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'

/** PRD 12 Change Password, Figma 979:74800, then the Password Updated! modal (1327:87135). */
export default function ChangePassword() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { toast } = useStore()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const mismatch = touched && confirm.length > 0 && confirm !== next
  const valid = current.length > 0 && isValidPassword(next) && confirm === next

  const submit = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); setDone(true) }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Change Password" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <Input label="Current Password" type="password" placeholder="Enter current password" value={current} onChange={(e) => setCurrent(e.target.value)}
          onBlur={() => setTouched(true)} error={touched && !current ? 'Enter your current password' : undefined} />
        <div className="flex flex-col gap-2">
          <Input label="New Password" type="password" placeholder="Enter new password" value={next} onChange={(e) => setNext(e.target.value)}
            onBlur={() => setTouched(true)} error={touched && !next ? 'Enter a new password' : touched && !isValidPassword(next) ? 'The new password does not meet every rule below' : undefined} />
          <p className="text-text-regular text-text-subtitle">It must have at least:</p>
          <PasswordRules password={next} />
        </div>
        <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} onBlur={() => setTouched(true)} error={mismatch ? 'Passwords do not match' : touched && !confirm ? 'Re-enter the new password' : undefined} />
      </div>

      <CtaBar>
        <Button fullWidth loading={saving} disabled={!valid} onClick={submit}
          onBlocked={() => { setTouched(true); toast(current ? 'New password must meet every rule and match' : 'Enter your current password') }}>
          Submit
        </Button>
      </CtaBar>

      <Modal open={done} onClose={() => setDone(false)} showClose={false}
        footer={<Button fullWidth onClick={() => { setDone(false); navigate('/profile/settings') }}>Done</Button>}>
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <SuccessBadge />
          <h2 className="text-title-l text-text-title">Password Updated!</h2>
          <p className="text-body-regular text-text-body">Your password has been updated successfully! Login now with you new password to access account.</p>
        </div>
      </Modal>
    </div>
  )
}
