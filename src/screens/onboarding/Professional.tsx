import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Picker from '../../components/ui/Picker'
import { ChevronDown } from '../../components/ui/icons'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import { EDUCATION_LEVELS, INDUSTRIES } from './options'
import OnboardingLayout from './OnboardingLayout'

/**
 * PRD 4.6, step 2 of 3. Nothing here may suggest a credential moves the Trust
 * Score, because it does not (PRD 7.3).
 */
export default function Professional() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { onboarding, setOnboarding, toast } = useStore()
  const [picker, setPicker] = useState<'industry' | 'education' | null>(null)

  const { occupation, licenseId, industry, education } = onboarding
  const valid = occupation.trim().length > 0 && industry.length > 0 && education.length > 0

  const field = (label: string, value: string, placeholder: string, onOpen: () => void) => (
    <div className="flex flex-col gap-1">
      <span className="text-text-medium text-text-subtitle">{label}</span>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-input items-center justify-between gap-2 rounded-md border-1 border-stroke-3 bg-bg-1 px-4 text-left"
      >
        <span className={value ? 'text-body-regular text-text-title' : 'text-body-regular text-text-disabled'}>
          {value || placeholder}
        </span>
        <ChevronDown className="text-text-body" />
      </button>
    </div>
  )

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
        {field('Industry', industry, 'Select industry field of your profession', () => setPicker('industry'))}
        {field('Education Level', education, 'Select your education level', () => setPicker('education'))}
      </OnboardingLayout>

      <Picker
        open={picker === 'industry'} onClose={() => setPicker(null)}
        title="Select Industry" options={INDUSTRIES} value={industry} searchable
        searchPlaceholder="Select industry field of your profession"
        onSelect={(value) => setOnboarding({ industry: value })}
      />
      <Picker
        open={picker === 'education'} onClose={() => setPicker(null)}
        title="Select Education Level" options={EDUCATION_LEVELS} value={education}
        onSelect={(value) => setOnboarding({ education: value })}
      />
    </>
  )
}
