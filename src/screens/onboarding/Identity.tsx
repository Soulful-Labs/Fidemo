import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileField from '../../components/app/FileField'
import Picker from '../../components/ui/Picker'
import SelectField from '../../components/ui/SelectField'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import ConsentModal from './ConsentModal'
import OnboardingLayout from './OnboardingLayout'
import { ID_TYPES } from './options'

/**
 * PRD 4.8, step 3 of 3. Figma 915:50280. One government ID, both sides.
 * Selfie and liveness verification are out of the product (23 Oct 2026):
 * the frame's selfie field is not built. The ID goes to the team, who verify
 * it in the console; until then it is in review.
 */
export default function Identity() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, updateUser, submitIdentity, user, toast } = useStore()
  const [picker, setPicker] = useState(false)
  const [consent, setConsent] = useState(false)

  const { idType, idFront, idBack, fullName } = onboarding
  const valid = idType.length > 0 && Boolean(idFront) && Boolean(idBack)

  const finish = () => {
    // Account created: carry the draft onto the user and sign in.
    if (!idFront || !idBack) return
    // A licence number given on step 2 goes to the team to check as well (shared/store.ts updatePerson).
    updateUser({
      name: fullName || user.name,
      onboarded: true,
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
    submitIdentity(idType, { front: idFront, back: idBack })
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
          fileName={idFront?.name} onFile={(f) => setOnboarding({ idFront: { name: f.name, bytes: f.size } })}
        />
        <FileField
          label="Upload Back Side" hint=".jpg or .png" accept="image/jpeg,image/png"
          fileName={idBack?.name} onFile={(f) => setOnboarding({ idBack: { name: f.name, bytes: f.size } })}
        />
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
