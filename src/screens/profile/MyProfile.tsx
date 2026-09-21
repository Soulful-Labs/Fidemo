import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import TabBar from '../../components/ui/TabBar'
import TopBar from '../../components/ui/TopBar'
import { Info } from '../../components/ui/icons'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'
import type { ProfileDetails } from '../../mock/types'
import DetailsInfoModal from '../onboarding/DetailsInfoModal'
import ProfessionalTab from './ProfessionalTab'
import ProfileDetailsTab from './ProfileDetailsTab'

export type Draft = ProfileDetails & { name: string }

/** Fields that count towards "N% completed" on the profile card. */
const COUNTED: (keyof Draft)[] = [
  'name', 'gender', 'address', 'areaType', 'aboutMe', 'languages', 'nationality', 'income', 'ethnicity', 'pets',
  'homeOwner', 'occupation', 'experience', 'licenseId', 'industry', 'education', 'topics', 'dob', 'idType', 'introVideo',
]
export const filled = (d: Draft, key: keyof Draft) => {
  const v = d[key]
  return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim())
}

/** PRD 12 My Profile, Figma 979:74128 / 979:74874: two tabs, one Save. */
export default function MyProfile() {
  const navigate = useNavigate()
  const { user, updateUser, toast } = useStore()
  const [tab, setTab] = useState<'details' | 'professional'>('details')
  const [draft, setDraft] = useState<Draft>({ ...user.profile, name: user.name })
  const [info, setInfo] = useState(false)
  const [saving, setSaving] = useState(false)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      const { name, ...profile } = draft
      const done = COUNTED.filter((k) => filled(draft, k)).length
      updateUser({ name: name.trim() || user.name, profile, profileCompletion: Math.round((done / COUNTED.length) * 100) })
      setSaving(false)
      toast('Saved')
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="My Profile" onBack={() => navigate('/profile')}
        right={<button type="button" aria-label="What these details are for?" onClick={() => setInfo(true)} className="text-text-title"><Info className="h-6 w-6" /></button>} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <TabBar items={[{ key: 'details', label: 'Profile Details' }, { key: 'professional', label: 'Professional Info' }]} value={tab} onChange={(k) => setTab(k as typeof tab)} />
        {tab === 'details' ? <ProfileDetailsTab draft={draft} patch={patch} /> : <ProfessionalTab draft={draft} patch={patch} />}
      </div>

      <CtaBar>
        <Button fullWidth loading={saving} onClick={save}>Save</Button>
      </CtaBar>

      <DetailsInfoModal open={info} onClose={() => setInfo(false)} />
    </div>
  )
}
