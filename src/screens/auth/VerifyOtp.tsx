import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import OtpInput from '../../components/app/OtpInput'
import { useStore } from '../../mock/store'
import AuthLayout from './AuthLayout'

const COUNTDOWN = 59

/** PRD 4.4. Any 6 digits pass, per the button table. */
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
      title="Enter OTP"
      subtitle="Please enter a 6-digit OTP code sent to emailaddress@domain.com"
      footer={
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

      {seconds > 0 ? (
        <p className="text-center text-text-regular text-text-body">
          Resend in 0:{String(seconds).padStart(2, '0')}
        </p>
      ) : (
        <button type="button" onClick={resend} className="text-center text-text-medium text-brand-primary">
          Resend
        </button>
      )}
    </AuthLayout>
  )
}
