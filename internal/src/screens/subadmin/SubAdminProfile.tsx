import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { Toggle } from '../../components/ui/controls'
import Input, { Select } from '../../components/ui/Input'
import { CheckIcon, VerifiedIcon } from '../../components/ui/icons'
import { MODULES, useMember } from '../../mock/team'
import { platform } from '@shared/store'
import type { Module } from '@shared/types'
import { TEAM } from '../../platform'

export const ProfileFacts = ({ who, active }: { who: { name: string; email: string; role: string; photo: string }; active?: boolean }) => (
  <>
    <div className="flex items-start justify-between"><img src={who.photo} alt="" className="h-16 w-16 rounded-sm object-cover" />
      {active && <span className="flex h-8 items-center gap-1 rounded-full bg-state-successBg px-3 text-text-regular text-state-success"><VerifiedIcon className="h-4 w-4" />Active</span>}</div>
    {[['Name', who.name], ['Email Address', who.email], ['Role', who.role]].map(([l, v]) => (
      <div key={l} className="pt-4"><p className="text-text-regular leading-5 text-text-subtitle">{l}</p><p className="pt-1 text-body-regular leading-[22px] text-text-title">{v}</p></div>
    ))}
  </>
)
const Label = ({ children }: { children: string }) => <h2 className="pb-3 text-body-regular leading-[22px] text-text-subtitle">{children}</h2>

/**
 * A sub-admin: Profile (2065:203055), Create Profile (2062:201923), Edit
 * Profile (2065:203431). The profile shows who they are, their status, and
 * the modules they can reach as a ticked list. Create and Edit are the same
 * form: picture, Name, Email Address, Role (a free-text job title), Account
 * Status (Active), and one toggle per module ("Modules Access (2)").
 * No password, invite, remove or confirmation step is drawn.
 */
export default function SubAdminProfile({ mode }: { mode: 'view' | 'create' | 'edit' }) {
  const navigate = useNavigate()
  const { id = 'tm-maya' } = useParams()
  const member = useMember(id)
  const MAYA = member ?? { name: '', email: '', role: '', photo: '', access: [] as Module[], active: true }
  const create = mode === 'create'
  const [on, setOn] = useState<string[]>(create ? [] : MAYA.access)
  const [status, setStatus] = useState(create || MAYA.active ? 'Active' : 'Inactive')
  const [form, setForm] = useState({ name: create ? '' : MAYA.name, email: create ? '' : MAYA.email, role: create ? '' : MAYA.role })
  const [why, setWhy] = useState('')
  /** Saved to the shared platform, and written to the activity log. */
  const save = () => {
    const res = platform().saveTeamMember({ id: create ? undefined : id, ...form, access: on as Module[], active: status === 'Active' }, TEAM)
    if (!res.ok) { setWhy(res.why); return }
    navigate(`/sub-admin/${res.id}`)
  }
  const back = create ? '/sub-admin' : `/sub-admin/${id}`
  if (mode === 'view') return (
    <AppShell crumbs={[{ label: 'Sub-Admin', to: '/sub-admin' }, { label: MAYA.name }]}>
      <div className="flex items-start justify-between pb-4"><div><h1 className="text-title-s leading-[25px] text-text-title">Profile</h1><p className="pt-1 text-text-regular leading-5 text-text-subtitle">Details of sub-admin profile</p></div>
        <Button className="px-5" onClick={() => navigate(`/sub-admin/${id}/edit`)}>Edit Profile</Button></div>
      <div className="grid grid-cols-2 items-start gap-4">
        <div><Label>Profile</Label><section className="rounded-lg bg-bg-1 p-6"><ProfileFacts who={MAYA} active={MAYA.active} /></section></div>
        <div><Label>{`Modules Access (${MAYA.access.length})`}</Label><ul className="rounded-lg border-1 border-stroke-1 p-6">
          {MAYA.access.map((m, i) => <li key={m} className={`flex items-center gap-2 text-body-regular text-text-title ${i ? 'mt-4 border-t-1 border-stroke-1 pt-4' : ''}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-bg-0"><CheckIcon className="h-3.5 w-3.5" /></span>{m}</li>)}</ul></div>
      </div>
    </AppShell>
  )
  return (
    <AppShell crumbs={[{ label: 'Sub-Admin', to: '/sub-admin' }, { label: create ? 'Add New Sub-Admin' : 'Edit Profile' }]}>
      <div className="flex items-start justify-between pb-4"><div><h1 className="text-title-s leading-[25px] text-text-title">{create ? 'Create Profile' : 'Edit Profile'}</h1><p className="pt-1 text-text-regular leading-5 text-text-subtitle">Enter the required details of new sub-admin</p></div>
        <div className="flex gap-4"><Button variant="tertiary" className="px-5" onClick={() => navigate(back)}>Cancel</Button><Button className="px-5" onClick={save}>{create ? 'Create' : 'Save'}</Button></div></div>
      <div className="grid grid-cols-2 items-start gap-4">
        <div><Label>Profile</Label>
          <section className="flex flex-col gap-4 rounded-lg bg-bg-1 p-6">
            <div className="flex items-center gap-4">{create ? <span className="flex h-16 w-16 items-center justify-center rounded-sm bg-bg-2 text-title-m text-text-subtitle">F</span> : <img src={MAYA.photo} alt="" className="h-16 w-16 rounded-sm object-cover" />}
              <Button variant="tertiary" size="md" className="rounded-sm px-3 text-text-regular">Change Picture</Button></div>
            <Input label="Name" placeholder="Full name of sub-admin" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" type="email" placeholder="Enter email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Role" placeholder="Enter the designation of sub-admin" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
            <Select label="Account Status" value={status} onChange={setStatus} options={['Active', 'Inactive']} />
            {why && <p className="text-text-regular text-state-danger">{why}</p>}
          </section></div>
        <div><Label>{`Modules Access (${on.length})`}</Label>
          <ul className="rounded-lg border-1 border-stroke-1 p-6">
            {MODULES.map((m, i) => <li key={m} className={`flex items-center gap-2 text-body-regular text-text-title ${i ? 'mt-4 border-t-1 border-stroke-1 pt-4' : ''}`}>
              <Toggle checked={on.includes(m)} onChange={(v) => setOn((all) => v ? [...all, m] : all.filter((x) => x !== m))} label={m} /></li>)}
          </ul></div>
      </div>
    </AppShell>
  )
}
