import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileField from '../../components/app/FileField'
import Picker from '../../components/ui/Picker'
import SelectField from '../../components/ui/SelectField'
import { Camera } from '../../components/ui/icons'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import ConsentModal from './ConsentModal'
import OnboardingLayout from './OnboardingLayout'
import { ID_TYPES } from './options'

/**
 * PRD 4.8, step 3 of 3. Figma 915:50280.
 *
 * Document upload only. The selfie capture is drawn but deliberately not
 * built: biometric capture is blocked pending legal review (workflow step 16,
 * conflict 23, hard rule 9). The field stays visible as a disabled control
 * that explains itself on tap (global interaction rule 7).
 */
export default function Identity() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, updateUser, user, toast } = useStore()
  const [picker, setPicker] = useState(false)
  const [consent, setConsent] = useState(false)

  const { idType, idFront, idBack, fullName } = onboarding
  const valid = idType.length > 0 && Boolean(idFront) && Boolean(idBack)

  const finish = () => {
    // Account created: carry the draft onto the user and sign in.
    updateUser({
      name: fullName || 'Jonathan Reeve',
      verified: { govId: true, livePhoto: false, license: Boolean(onboarding.licenseId) },
      profile: {
        ...user.profile,
        gender: onboarding.gender || user.profile.gender,
        address: onboarding.address || user.profile.address,
        dob: onboarding.dob || user.profile.dob,
        occupation: onboarding.occupation || user.profile.occupation,
        licenseId: onboarding.licenseId || user.profile.licenseId,
        industry: onboarding.industry || user.profile.industry,
        education: onboarding.education || user.profile.education,
        idType: idType || user.profile.idType,
        introVideo: onboarding.introVideo,
      },
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

        <SelectField label="Select ID" value={idType} placeholder="Passport" onOpen={() => setPicker(true)} />

        <FileField
          label="Upload Front Side" hint=".jpg or .png" accept="image/jpeg,image/png"
          fileName={idFront} onPick={(name) => setOnboarding({ idFront: name })}
        />
        <FileField
          label="Upload Back Side" hint=".jpg or .png" accept="image/jpeg,image/png"
          fileName={idBack} onPick={(name) => setOnboarding({ idBack: name })}
        />

        <div className="flex flex-col gap-1">
          <span className="text-text-regular text-text-subtitle">Selfie Verification</span>
          <button
            type="button"
            aria-disabled="true"
            onClick={() => toast('Selfie verification is on hold pending legal review')}
            className="flex w-full flex-col items-center gap-1 rounded-md border-1 border-cta-tertiaryStrokeDisabled px-4 py-4 text-center text-text-disabled"
          >
            <span className="flex items-center gap-2 text-text-medium">
              <Camera className="h-5 w-5" />
              Capture Selfie
            </span>
            <span className="text-text-regular">Tap here to click selfie</span>
          </button>
        </div>
      </OnboardingLayout>

      <Picker
        open={picker} onClose={() => setPicker(false)} title="Select ID"
        subtitle="Select the document you will upload"
        options={ID_TYPES} value={idType}
        onSelect={(value) => setOnboarding({ idType: value })}
      />

      <ConsentModal open={consent} onClose={() => setConsent(false)} onSave={finish} />
    </>
  )
}
