import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import Button from '../../components/ui/Button'
import OtpInput from '../../components/app/OtpInput'
import { useStore } from '../../mock/store'
import AuthLayout from './AuthLayout'

const COUNTDOWN = 59

/**
 * PRD 4.4, Figma 915:50175. Any 6 digits pass, per the button table. Submit
 * creates the account and lands on the dashboard: workflow 15 lets a new
 * member browse first and verify at the point of applying.
 */
export default function VerifyOtp() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { toast, signUp, onboarding, user } = useStore()
  const email = onboarding.email || user.email
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [seconds, setSeconds] = useState(COUNTDOWN)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  const resend = () => {
    setSeconds(COUNTDOWN)
    toast('Code sent')
  }

  return (
    <AuthLayout
      barTitle="Verify Your Email"
      onBack={back}
      title="Enter OTP"
      subtitle={
        <>
          Please enter a 6-digit OTP code sent to{' '}
          <span className="font-semibold text-text-title">{email}</span>
        </>
      }
      actions={
        <>
          <Button fullWidth disabled={code.length !== 6} onClick={() => { signUp(email); navigate('/dashboard', { replace: true }) }}
            onBlocked={() => setTouched(true)}>
            Submit
          </Button>
          <Button variant="tertiary" fullWidth onClick={() => navigate('/signup')}>Cancel</Button>
        </>
      }
    >
      <OtpInput value={code} onChange={setCode} />
      {touched && code.length !== 6 && <p className="text-label text-state-danger">Enter all 6 digits of the code</p>}

      <p className="pt-2 text-center text-body-regular text-text-title">
        {seconds > 0 ? (
          <>
            <span className="text-text-disabled">Resend</span> in 0:{String(seconds).padStart(2, '0')}
          </>
        ) : (
          <button type="button" onClick={resend} className="text-body-medium text-brand-primary">
            Resend
          </button>
        )}
      </p>
    </AuthLayout>
  )
}
