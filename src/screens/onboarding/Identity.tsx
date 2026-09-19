import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileField from '../../components/app/FileField'
import Picker from '../../components/ui/Picker'
import { ChevronDown } from '../../components/ui/icons'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import ConsentModal from './ConsentModal'
import OnboardingLayout from './OnboardingLayout'
import { ID_TYPES } from './options'

/**
 * PRD 4.8, step 3 of 3.
 *
 * Document upload only. The selfie capture PRD 4.8 lists is deliberately not
 * built: biometric capture is blocked pending legal review (workflow step 16,
 * conflict 23, hard rule 9). The note below keeps that visible to reviewers
 * rather than looking like a missed field.
 */
export default function Identity() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, updateUser, toast } = useStore()
  const [picker, setPicker] = useState(false)
  const [consent, setConsent] = useState(false)

  const { idType, idFront, idBack, fullName } = onboarding
  const valid = idType.length > 0 && Boolean(idFront) && Boolean(idBack)

  const finish = () => {
    // Account created: carry the draft onto the user and sign in.
    updateUser({
      name: fullName || 'Jonathan Reeve',
      verified: { govId: true, livePhoto: false, license: Boolean(onboarding.licenseId) },
    })
    setConsent(false)
    navigate('/onboarding/welcome')
  }

  return (
    <>
      <OnboardingLayout
        title="Identity Verification"
        step={3}
        onBack={back}
        onContinue={() => setConsent(true)}
        continueDisabled={!valid}
        onBlocked={() => toast('Select an ID type and upload both sides')}
      >
        <p className="text-text-regular text-text-body">
          A one-time check. Stored privately and never shown to clients.
        </p>

        <div className="flex flex-col gap-1">
          <span className="text-text-medium text-text-subtitle">Select ID</span>
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="flex h-input items-center justify-between gap-2 rounded-md border-1 border-stroke-3 bg-bg-1 px-4 text-left"
          >
            <span className={idType ? 'text-body-regular text-text-title' : 'text-body-regular text-text-disabled'}>
              {idType || 'Select your ID type'}
            </span>
            <ChevronDown className="text-text-body" />
          </button>
        </div>

        <FileField
          label="Upload Front Side" hint=".jpg or .png" accept="image/jpeg,image/png"
          fileName={idFront} onPick={(name) => setOnboarding({ idFront: name })}
        />
        <FileField
          label="Upload Back Side" hint=".jpg or .png" accept="image/jpeg,image/png"
          fileName={idBack} onPick={(name) => setOnboarding({ idBack: name })}
        />

        <p className="rounded-md border-1 border-stroke-2 bg-bg-1 p-3 text-label text-text-disabled">
          Selfie verification is on hold pending legal review, so this step is document
          verification only.
        </p>
      </OnboardingLayout>

      <Picker
        open={picker} onClose={() => setPicker(false)} title="Select ID"
        options={ID_TYPES} value={idType}
        onSelect={(value) => setOnboarding({ idType: value })}
      />

      <ConsentModal open={consent} onClose={() => setConsent(false)} onSave={finish} />
    </>
  )
}
