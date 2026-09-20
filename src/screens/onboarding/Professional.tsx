import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Picker from '../../components/ui/Picker'
import SelectField from '../../components/ui/SelectField'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import { EDUCATION_LEVELS, INDUSTRIES } from './options'
import OnboardingLayout from './OnboardingLayout'

/**
 * PRD 4.6, step 2 of 3. Figma 915:50260. Nothing here may suggest a
 * credential moves the Trust Score, because it does not (PRD 7.3).
 */
export default function Professional() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, toast } = useStore()
  const [picker, setPicker] = useState<'industry' | 'education' | null>(null)

  const { occupation, licenseId, industry, education } = onboarding
  const valid = occupation.trim().length > 0 && industry.length > 0 && education.length > 0

  return (
    <>
      <OnboardingLayout
        title="Get Personalized Studies"
        step={2}
        onBack={back}
        onContinue={() => navigate('/onboarding/identity')}
        continueDisabled={!valid}
        onBlocked={() => toast('Fill in your occupation, industry and education level')}
      >
        <Input
          label="Occupation" placeholder="E.g. Product Designer" value={occupation}
          onChange={(e) => setOnboarding({ occupation: e.target.value })}
        />
        <Input
          label="License ID" placeholder="Enter ID number" value={licenseId}
          onChange={(e) => setOnboarding({ licenseId: e.target.value })}
        />
        <SelectField label="Industry" value={industry} placeholder="Industry name" onOpen={() => setPicker('industry')} />
        <SelectField label="Education Level" value={education} placeholder="Select education" onOpen={() => setPicker('education')} />
      </OnboardingLayout>

      <Picker
        open={picker === 'industry'} onClose={() => setPicker(null)}
        title="Select Industry" subtitle="Select industry field of your profession"
        options={INDUSTRIES} value={industry} searchable searchPlaceholder="Search industry..."
        onSelect={(value) => setOnboarding({ industry: value })}
      />
      <Picker
        open={picker === 'education'} onClose={() => setPicker(null)}
        title="Select Education Level" subtitle="Select your education level"
        options={EDUCATION_LEVELS} value={education}
        onSelect={(value) => setOnboarding({ education: value })}
      />
    </>
  )
}
