import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import Button from '../../components/ui/Button'
import OtpInput from '../../components/app/OtpInput'
import { useStore } from '../../mock/store'
import AuthLayout from './AuthLayout'

const COUNTDOWN = 59
/** No backend sends a code, so the screen says so and accepts this one only. */
export const DEMO_OTP = '123456'
export const DEMO_LINE = `Demo mode. No email is sent. Enter ${DEMO_OTP}.`

/**
 * PRD 4.4, Figma 915:50175. Only the demo code passes; a wrong one shows the
 * error state. Submit creates the account and lands on the dashboard:
 * workflow 15 lets a new member browse first and verify at the point of
 * applying.
 */
export default function VerifyOtp() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { toast, signUp, onboarding, user } = useStore()
  const email = onboarding.email || user.email
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [wrong, setWrong] = useState(false)
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

  const submit = () => {
    if (code !== DEMO_OTP) { setWrong(true); return }
    signUp(email)
    navigate('/dashboard', { replace: true })
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
          <Button fullWidth disabled={code.length !== 6} onClick={submit}
            onBlocked={() => setTouched(true)}>
            Submit
          </Button>
          <Button variant="tertiary" fullWidth onClick={() => navigate('/signup')}>Cancel</Button>
        </>
      }
    >
      <OtpInput value={code} onChange={(next) => { setCode(next); setWrong(false) }} />
      {wrong ? (
        <p className="text-label text-state-danger">Incorrect code</p>
      ) : touched && code.length !== 6 ? (
        <p className="text-label text-state-danger">Enter all 6 digits of the code</p>
      ) : (
        <p className="text-label text-text-body">{DEMO_LINE}</p>
      )}

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
