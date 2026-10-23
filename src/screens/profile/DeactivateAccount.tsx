import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import SuccessBadge from '../../components/app/SuccessBadge'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'

/**
 * PRD 12 Deactivate Account, Figma 979:74818, then the Account Deactivated!
 * modal (1327:87167) and sign out to /signin. Copy is quoted as drawn.
 */
export default function DeactivateAccount() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { signOut, closeAccount } = useStore()
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)
  // The platform's refusal (a wrong password), shown under the field until it changes.
  const [refused, setRefused] = useState('')

  const deactivate = () => {
    setWorking(true)
    setTimeout(() => {
      setWorking(false)
      const r = closeAccount(password)
      if (!r.ok) { setRefused(r.why); return }
      setDone(true)
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Deactivate Account" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <h1 className="text-title-s text-text-title">Deactivate Your Account</h1>
        <p className="text-text-regular text-state-danger">
          Be careful: you have 30 days to reactivate your account by contacting us.<br />
          After that it is deleted permanently, once any balance earnings have been transferred to the default payout method.
        </p>
        <p className="pt-2 text-text-regular text-text-title">Enter password below to confirm this action</p>
        <Input label="Password" type="password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setRefused('') }}
          onBlur={() => setTouched(true)} error={touched && password.length === 0 ? 'Enter your password to confirm' : refused || undefined} />
      </div>

      <CtaBar>
        <Button fullWidth loading={working} disabled={password.length === 0} onClick={deactivate}
          onBlocked={() => setTouched(true)}>
          Deactivate Account
        </Button>
      </CtaBar>

      <Modal open={done} onClose={() => undefined} showClose={false}
        footer={<Button fullWidth onClick={() => { signOut(); navigate('/signin', { replace: true }) }}>Done</Button>}>
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <SuccessBadge />
          <h2 className="text-title-l text-text-title">Account Deactivated!</h2>
          <p className="text-body-regular text-text-body">Your account has been deactivated. Contact us from our website to activate it again in future.</p>
        </div>
      </Modal>
    </div>
  )
}
