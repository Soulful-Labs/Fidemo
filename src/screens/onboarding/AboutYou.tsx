import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileField from '../../components/app/FileField'
import Input from '../../components/ui/Input'
import TabBar from '../../components/ui/TabBar'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import { isAdult, isValidDob } from '../../lib/validation'
import AddressField from './AddressField'
import DetailsInfoModal from './DetailsInfoModal'
import OnboardingLayout from './OnboardingLayout'

/** PRD 4.5, step 1 of 3. */
export default function AboutYou() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, toast } = useStore()
  const [info, setInfo] = useState(false)
  const [touched, setTouched] = useState(false)

  const { fullName, dob, gender, address, introVideo } = onboarding
  const dobError = touched && dob.length > 0 && !isValidDob(dob)
    ? 'Use DD / MM / YYYY'
    : touched && isValidDob(dob) && !isAdult(dob) ? 'You must be 18 or over' : undefined

  const valid = fullName.trim().length > 0 && isValidDob(dob) && isAdult(dob) &&
    gender.length > 0 && address.trim().length > 0

  return (
    <>
      <OnboardingLayout
        title="About You"
        step={1}
        onBack={back}
        onInfo={() => setInfo(true)}
        onContinue={() => navigate('/onboarding/professional')}
        continueDisabled={!valid}
        onBlocked={() => { setTouched(true); toast('Fill in the required fields to continue') }}
      >
        <Input
          label="Full Name" placeholder="Enter Name" value={fullName}
          onChange={(e) => setOnboarding({ fullName: e.target.value })}
        />

        <Input
          label="Date of Birth" placeholder="DD / MM / YYYY" value={dob}
          onChange={(e) => setOnboarding({ dob: e.target.value })}
          onBlur={() => setTouched(true)} error={dobError} inputMode="numeric"
        />

        <div className="flex flex-col gap-1">
          <span className="text-text-medium text-text-subtitle">Gender</span>
          <TabBar
            items={[
              { key: 'Male', label: 'Male' },
              { key: 'Female', label: 'Female' },
              { key: 'Other', label: 'Other' },
            ]}
            value={gender}
            onChange={(key) => setOnboarding({ gender: key })}
          />
        </div>

        <AddressField value={address} onChange={(next) => setOnboarding({ address: next })} />

        <div className="flex flex-col gap-1">
          <span className="text-text-medium text-text-subtitle">Intro Video (optional)</span>
          <FileField
            label="Upload Short Video"
            description="Share about you, what you do, your interests, etc."
            hint=".mp4 file | 50 MB max."
            accept="video/mp4"
            fileName={introVideo}
            onPick={(name) => { setOnboarding({ introVideo: name }); toast('Video selected') }}
          />
        </div>
      </OnboardingLayout>

      <DetailsInfoModal open={info} onClose={() => setInfo(false)} />
    </>
  )
}
