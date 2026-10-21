import { useState } from 'react'
import Input from '../../components/ui/Input'
import TabBar from '../../components/ui/TabBar'
import { AREA_TYPES, ETHNICITIES, INCOME_RANGES, LANGUAGES, NATIONALITIES, PETS } from '../onboarding/options'
import { Field, MultiPickField, PickField, SectionHead } from './formBits'
import { PictureField, VideoField } from './MediaFields'
import { filled, requiredError } from './MyProfile'
import type { Draft } from './MyProfile'

// Counted as drawn (x/4 and x/6): the optional intro video and About Me text are not counted.
const MY_PROFILE: (keyof Draft)[] = ['name', 'gender', 'address', 'areaType']
const ABOUT_ME: (keyof Draft)[] = ['languages', 'nationality', 'income', 'ethnicity', 'pets', 'homeOwner']

/**
 * Profile Details tab (Figma 979:74128, 21 Oct 2026). About Me, Pets and "Are
 * you a home owner?" are hidden in the frame but kept: they count towards
 * profile completion, which is what earns the full-profile points.
 */
export default function ProfileDetailsTab({ draft, patch, touched = false }: { draft: Draft; patch: (p: Partial<Draft>) => void; touched?: boolean }) {
  const [open, setOpen] = useState({ profile: true, about: true })
  const count = (keys: (keyof Draft)[]) => keys.filter((k) => filled(draft, k)).length

  return (
    <div className="flex flex-col gap-4">
      <SectionHead title="My Profile" done={count(MY_PROFILE)} total={MY_PROFILE.length}
        helper="This help us to match you the more relevant studies" open={open.profile} onToggle={() => setOpen((o) => ({ ...o, profile: !o.profile }))} />
      {open.profile && (
        <>
          {/* As drawn (979:74128): the picture, Full Name, then the intro video. Each saves as it changes, with its own consent (MediaFields). */}
          <PictureField />
          <Input label="Full Name" placeholder="Enter Name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
          <VideoField />
          <PickField label="Gender" value={draft.gender} placeholder="Select gender" options={['Male', 'Female', 'Other']} onChange={(gender) => patch({ gender })} />
          <Input label="Address" placeholder="City, Country" value={draft.address} onChange={(e) => patch({ address: e.target.value })} error={requiredError(draft, 'address', touched)} />
          <PickField label="Area Type" value={draft.areaType} placeholder="Select area type" options={AREA_TYPES} onChange={(areaType) => patch({ areaType })} />
        </>
      )}

      <SectionHead title="About Me" done={count(ABOUT_ME)} total={ABOUT_ME.length}
        helper="This help us to match you the more relevant studies" open={open.about} onToggle={() => setOpen((o) => ({ ...o, about: !o.about }))} />
      {open.about && (
        <>
          <Input label="About Me" multiline rows={3} maxLength={300} showCount placeholder="Tell clients a little about yourself.."
            value={draft.aboutMe} onChange={(e) => patch({ aboutMe: e.target.value })} />
          <MultiPickField label="Languages Spoken" values={draft.languages} placeholder="Select Languages" options={LANGUAGES} onChange={(languages) => patch({ languages })} />
          <PickField label="Nationality" value={draft.nationality} placeholder="Choose Nationality" options={NATIONALITIES} onChange={(nationality) => patch({ nationality })} searchable />
          <PickField label="Household Income" value={draft.income} placeholder="Select Income Range" options={INCOME_RANGES} onChange={(income) => patch({ income })} />
          <PickField label="Ethnicity" value={draft.ethnicity} placeholder="Choose Ethnicity" options={ETHNICITIES} onChange={(ethnicity) => patch({ ethnicity })} />
          <MultiPickField label="Pets" values={draft.pets} placeholder="Choose Pets" options={PETS} onChange={(pets) => patch({ pets })} />
          <Field label="Are you a home owner?">
            <TabBar variant="boxes" value={draft.homeOwner} onChange={(k) => patch({ homeOwner: k as Draft['homeOwner'] })}
              items={[{ key: 'Yes', label: 'Yes' }, { key: 'No', label: 'No' }]} />
          </Field>
        </>
      )}
    </div>
  )
}
