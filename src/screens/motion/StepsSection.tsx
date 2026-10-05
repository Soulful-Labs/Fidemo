import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileField from '../../components/app/FileField'
import Stepper from '../../components/ui/Stepper'
import { forgetSeen } from '../../lib/seen'
import { Group, Play, Plays, Stage } from './LabBits'

/** I: steps ticking over. Segments sweep in, pills tick, a picked file ticks, the Welcome seal is pressed in. */
export function StepsSection() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [pills, setPills] = useState(1)
  const [file, setFile] = useState<string | undefined>()
  const [mount, setMount] = useState(0)

  return (
    <Group letter="I" title="Verification and onboarding steps">
      <Stage>
        <div key={mount} className="flex flex-col gap-4">
          <Stepper current={step} total={3} tone="green" memory="lab-steps" />
          <Stepper current={pills} total={4} variant="pills" memory="lab-pills" />
        </div>
        <Plays>
          <Play onClick={() => setStep((s) => Math.min(3, s + 1))}>Next step</Play>
          <Play onClick={() => setPills((p) => Math.min(4, p + 1))}>Streak +1</Play>
          <Play onClick={() => { forgetSeen(':lab-'); setStep(1); setPills(1); setMount((m) => m + 1) }}>Reset</Play>
        </Plays>
      </Stage>
      <FileField label="Upload Front Side" hint=".jpg or .png" fileName={file} onPick={setFile} />
      <Plays>
        <Play onClick={() => setFile(`passport-front-${Date.now() % 1000}.jpg`)}>Pick a file</Play>
        <Play onClick={() => navigate('/onboarding/welcome')}>Open Welcome</Play>
      </Plays>
    </Group>
  )
}
