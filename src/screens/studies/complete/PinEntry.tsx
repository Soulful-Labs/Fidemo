import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../../components/app/EmptyState'
import OtpInput from '../../../components/app/OtpInput'
import SuccessScreen from '../../../components/app/SuccessScreen'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import TopBar from '../../../components/ui/TopBar'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import { ATTENDANCE_PIN } from '../detail/StateBanner'

/**
 * PRD 6.11, Figma 919:75752. Six digits; 407060 succeeds, anything else
 * shows "Incorrect PIN, check with your interviewer". /pin/done is the
 * "Confirmed successfully!" state (969:17527).
 */
export default function PinEntry() {
  const { id = '', step } = useParams()
  const navigate = useNavigate()
  const { studyById, confirmPin } = useStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [checking, setChecking] = useState(false)
  const study = studyById(id)

  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  if (step === 'done') {
    return (
      <SuccessScreen
        title="Confirmed successfully!"
        body="Your joining attendance is confirmed and verified! You can complete your study if running now."
        onAction={() => navigate(`/studies/${id}`, { replace: true })}
      />
    )
  }

  const submit = () => {
    if (code !== ATTENDANCE_PIN) {
      setError('Incorrect PIN, check with your interviewer')
      return
    }
    setChecking(true)
    setTimeout(() => {
      confirmPin(study.id)
      navigate(`/studies/${id}/pin/done`, { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Submit Confirmation PIN" onBack={() => navigate(`/studies/${id}`)} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <h1 className="text-title-m leading-tight text-text-title">Enter the attendance confirmation PIN code</h1>
        <p className="rounded-lg bg-bg-1 p-4 text-text-regular text-text-subtitle">
          Join call and get this code from the interviewer who will share it with you.
        </p>
        <p className="text-text-regular text-text-subtitle">
          This code is required to be submitted to confirm your joining and get reward after successful completion.
        </p>

        <div className="flex flex-col gap-1 pt-2">
          <span className="text-text-regular text-text-subtitle">PIN Code</span>
          <OtpInput value={code} onChange={(next) => { setCode(next); setError(undefined) }} error={Boolean(error)} />
          {error && <span className="text-label text-state-danger">{error}</span>}
        </div>
      </div>

      <CtaBar>
        <Button fullWidth loading={checking} disabled={code.length !== 6} onClick={submit}
          onBlocked={() => setError('Enter all 6 digits')}>
          Submit
        </Button>
      </CtaBar>
    </div>
  )
}
