import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import OtpInput from '../../components/app/OtpInput'
import { useStore } from '../../mock/store'
import AuthLayout from './AuthLayout'

const COUNTDOWN = 59

/** PRD 4.4, Figma 915:50175. Any 6 digits pass, per the button table. */
export default function VerifyOtp() {
  const navigate = useNavigate()
  const { toast } = useStore()
  const [code, setCode] = useState('')
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
      onBack={() => navigate('/signup')}
      title="Enter OTP"
      subtitle={
        <>
          Please enter a 6-digit OTP code sent to{' '}
          <span className="font-semibold text-text-title">emailaddress@domain.com</span>
        </>
      }
      actions={
        <>
          <Button fullWidth disabled={code.length !== 6} onClick={() => navigate('/onboarding/about')}
            onBlocked={() => toast('Enter all 6 digits')}>
            Submit
          </Button>
          <Button variant="tertiary" fullWidth onClick={() => navigate('/signup')}>Cancel</Button>
        </>
      }
    >
      <OtpInput value={code} onChange={setCode} />

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
