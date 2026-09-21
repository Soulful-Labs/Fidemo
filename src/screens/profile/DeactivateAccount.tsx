import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { signOut, toast } = useStore()
  const [password, setPassword] = useState('')
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState(false)

  const deactivate = () => {
    setWorking(true)
    setTimeout(() => { setWorking(false); setDone(true) }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Deactivate Account" onBack={() => navigate('/profile/settings')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <h1 className="text-title-s text-text-title">Deactivate Your Account</h1>
        <p className="text-text-regular text-state-danger">
          Be careful: this action cannot be undone.<br />
          You have 30 days to reactivate your account before it gets deleted permanently after transferring the any
          balance earnings to the default payout method.
        </p>
        <p className="pt-2 text-text-regular text-text-title">Enter password below to confirm this action</p>
        <Input label="Password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <CtaBar>
        <Button fullWidth loading={working} disabled={password.length === 0} onClick={deactivate}
          onBlocked={() => toast('Enter your password to confirm')}>
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
