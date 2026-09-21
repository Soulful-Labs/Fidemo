import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppNav } from '../../app/useAppNav'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import DobField from '../../components/ui/DobField'
import PhoneField, { splitPhone } from '../../components/ui/PhoneField'
import { ChevronRight } from '../../components/ui/icons'
import { dateLong } from '../../lib/format'
import { isValidDob, isValidEmail } from '../../lib/validation'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'
import { ID_TYPES } from '../onboarding/options'
import { PickField } from './formBits'
import { CookieIcon, DangerIcon, KeyIcon, MailIcon, VerifiedIcon } from './profileIcons'

const ROWS = [
  { label: 'Change Password', to: '/profile/settings/password', Icon: KeyIcon },
  { label: 'Email Notifications', to: '/profile/settings/notifications', Icon: MailIcon },
  { label: 'Consent & Cookies', to: '/profile/settings/consent', Icon: CookieIcon },
  { label: 'Deactivate Account', to: '/profile/settings/deactivate', Icon: DangerIcon, danger: true },
]

/** PRD 12 Account Settings, Figma 979:74209. Save writes to the store and stays. */
export default function AccountSettings() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { user, updateUser, toast } = useStore()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(splitPhone(user.phone))
  const [dob, setDob] = useState(user.profile.dob)
  const [idType, setIdType] = useState(user.profile.idType)
  const [saving, setSaving] = useState(false)
  const valid = name.trim().length > 1 && isValidEmail(email)

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      updateUser({ name: name.trim(), email: email.trim(), phone: phone.number ? `${phone.code} ${phone.number}` : user.phone, profile: { ...user.profile, dob, idType } })
      setSaving(false)
      toast('Saved')
    }, TIMINGS.fakeServer)
  }

  const file = (label: string) => (
    <div className="flex items-center gap-3 rounded-md border-1 border-stroke-3 p-3">
      <span className="h-12 w-16 shrink-0 rounded-sm bg-bg-2" aria-hidden="true" />
      <span className="flex flex-col"><span className="text-text-medium text-text-title">{label}</span><span className="text-label text-text-body">5 MB</span></span>
    </div>
  )

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Account Settings" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Name" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address"
          error={!isValidEmail(email) && email ? 'Enter a valid email address' : undefined}
          rightSlot={isValidEmail(email) ? <VerifiedIcon className="text-brand-secondary" /> : undefined} />
        <PhoneField code={phone.code} number={phone.number} onChange={setPhone} />
        <DobField value={dob} onChange={setDob} error={dob && !isValidDob(dob) ? 'Use DD / MM / YYYY' : undefined} />
        <PickField label="Select ID" value={idType} placeholder="Passport" options={ID_TYPES} onChange={setIdType} title="Select ID" />
        {file(`${idType || 'ID'} front.pdf`)}
        {file(`${idType || 'ID'} back.pdf`)}
        {user.verified.govId && <Tag tone="green" size="md" icon={<VerifiedIcon className="h-4 w-4" />} className="self-start">Govt. ID Verified</Tag>}

        <div className="flex flex-col gap-2">
          <span className="text-text-regular text-text-subtitle">Selfie Verification</span>
          <button type="button" aria-disabled="true" onClick={() => toast('Selfie verification is on hold pending legal review')}
            className="flex h-input items-center rounded-md border-1 border-cta-tertiaryStrokeDisabled px-4 text-left text-body-regular text-text-disabled">
            Selfie verification pending
          </button>
          {user.verified.govId && <Tag tone="green" size="md" icon={<VerifiedIcon className="h-4 w-4" />} className="self-start">Human Verified</Tag>}
        </div>

        {user.sourceCode && (
          <p className="text-text-regular text-text-body">
            Joined via link <span className="text-text-title">{user.sourceCode}</span>
            {user.joinedAt && <> on {dateLong(user.joinedAt)}</>}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {ROWS.map((r) => (
            <button key={r.label} type="button" onClick={() => navigate(r.to)} className="flex h-14 w-full items-center gap-3 rounded-lg bg-bg-1 px-4 text-left">
              <r.Icon className={r.danger ? 'text-state-danger' : 'text-brand-primary'} />
              <span className={r.danger ? 'text-body-medium text-state-danger' : 'text-body-medium text-text-title'}>{r.label}</span>
              <ChevronRight className="ml-auto text-text-body" />
            </button>
          ))}
        </div>
      </div>

      <CtaBar>
        <Button fullWidth loading={saving} disabled={!valid} onClick={save} onBlocked={() => toast('Enter your name and a valid email')}>Save</Button>
      </CtaBar>
    </div>
  )
}
