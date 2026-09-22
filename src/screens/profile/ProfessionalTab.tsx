import { useState } from 'react'
import Input from '../../components/ui/Input'
import { useStore } from '../../mock/store'
import { EDUCATION_LEVELS, EXPERIENCE, INDUSTRIES, TOPICS } from '../onboarding/options'
import { MultiPickField, PickField, SectionHead } from './formBits'
import { filled, requiredError } from './MyProfile'
import type { Draft } from './MyProfile'
import { VerifiedIcon } from './profileIcons'

const BACKGROUND: (keyof Draft)[] = ['occupation', 'experience', 'licenseId', 'industry', 'education']

/**
 * Professional Info tab (PRD 12, Figma 979:74874). The verified tick on the
 * licence is informational only: a credential never moves the Trust Score.
 */
export default function ProfessionalTab({ draft, patch, touched = false }: { draft: Draft; patch: (p: Partial<Draft>) => void; touched?: boolean }) {
  const { user } = useStore()
  const [open, setOpen] = useState({ background: true, topics: true })
  const done = BACKGROUND.filter((k) => filled(draft, k)).length
  const verified = user.verified.license && draft.licenseId === user.profile.licenseId && draft.licenseId.length > 0

  return (
    <div className="flex flex-col gap-4">
      <SectionHead title="Professional Background" done={done} total={BACKGROUND.length}
        helper="This help us to match you the more relevant studies" open={open.background} onToggle={() => setOpen((o) => ({ ...o, background: !o.background }))} />
      {open.background && (
        <>
          <Input label="Occupation" placeholder="E.g. Product Designer" value={draft.occupation} onChange={(e) => patch({ occupation: e.target.value })} error={requiredError(draft, 'occupation', touched)} />
          <PickField label="Experience" value={draft.experience} placeholder="Select experience" options={EXPERIENCE} onChange={(experience) => patch({ experience })} />
          <div className="flex flex-col gap-1">
            <Input label="License/Certificate Number" placeholder="Enter ID number" value={draft.licenseId}
              onChange={(e) => patch({ licenseId: e.target.value })}
              rightSlot={verified ? <VerifiedIcon className="text-brand-secondary" /> : undefined} />
            {verified && <span className="text-label text-brand-secondary">Verified Profession</span>}
          </div>
          <PickField label="Industry" value={draft.industry} placeholder="Industry name" options={INDUSTRIES} onChange={(industry) => patch({ industry })} title="Select Industry" searchable error={requiredError(draft, 'industry', touched)} />
          <PickField label="Education Level" value={draft.education} placeholder="Select education" options={EDUCATION_LEVELS} onChange={(education) => patch({ education })} title="Select Education Level" />
        </>
      )}

      <SectionHead title="Topics You Are Good In" done={draft.topics.length} total={5}
        helper="You will get matched with studies based on your these interests selection" open={open.topics} onToggle={() => setOpen((o) => ({ ...o, topics: !o.topics }))} />
      {open.topics && (
        <MultiPickField label="Select up to 5 subjects" values={draft.topics} placeholder="Select topics" options={TOPICS} max={5}
          onChange={(topics) => patch({ topics })} title="Select Topics" />
      )}
    </div>
  )
}
