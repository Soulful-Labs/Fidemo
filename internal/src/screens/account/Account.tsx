import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Input, { PasswordInput } from '../../components/ui/Input'
import { ChevronRight } from '../../components/ui/icons'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { MAYA, PETER } from '../../mock/team'
import { ProfileFacts } from '../subadmin/SubAdminProfile'

const Glyph = ({ out }: { out?: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {out ? <path d="M10 5H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2M14 8l4 4-4 4M18 12H9" /> : <><rect x="5" y="10" width="14" height="10" rx="3" /><path d="M8.500 10V8a3.500 3.500 0 0 1 7 0v2M9 15h.01M12 15h.01M15 15h.01" /></>}
  </svg>
)

/**
 * My Account: the master admin's (Profile 2065:205670, "Master Admin -
 * Account") and a sub-admin's (2065:207638, "My Account", `/account/sub-admin`).
 * A Profile card (with Edit Profile for the master admin only) and Settings:
 * Change Password and Logout. Nothing else: no access, security or team
 * settings. The sub-admin frame draws the full sidebar, all eight modules.
 */
export default function Account({ sub }: { sub?: boolean }) {
  const navigate = useNavigate()
  const [dialog, setDialog] = useState<null | 'password' | 'updated' | 'logout'>(null)
  const Row = ({ label, out, onClick }: { label: string; out?: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex h-14 w-full items-center gap-2 rounded-lg border-1 border-stroke-1 px-4 text-body-regular text-text-title"><Glyph out={out} /><span className="flex-1 text-left">{label}</span><ChevronRight className="h-4 w-4 text-text-subtitle" /></button>
  )
  return (
    <AppShell crumbs={[{ label: sub ? 'My Account' : 'Master Admin - Account' }]}>
      <div className="grid grid-cols-[573px_1fr] items-start gap-6">
        <div><h2 className="pb-3 text-body-regular text-text-subtitle">{sub ? 'Sub-Admin Profile' : 'Profile'}</h2>
          <section className="rounded-lg bg-bg-1 p-6"><ProfileFacts who={sub ? MAYA : PETER} active={sub} />
            {!sub && <Button className="mt-6 px-5" onClick={() => navigate('/account/edit')}>Edit Profile</Button>}</section></div>
        <div><h2 className="pb-3 text-body-regular text-text-subtitle">Settings</h2>
          <div className="flex flex-col gap-3"><Row label="Change Password" onClick={() => setDialog('password')} /><Row label="Logout" out onClick={() => setDialog('logout')} /></div></div>
      </div>
      <Modal open={dialog === 'password'} onClose={() => setDialog(null)} layout="titled" title="Change Password"
        footer={<><Button variant="tertiary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => setDialog('updated')}>Submit</Button></>}>
        <div className="flex flex-col gap-3">
          <PasswordInput size="sm" label="Current Password" placeholder="Enter current password" />
          <PasswordInput size="sm" label="New Password" placeholder="Enter new password" helper={<p className="text-text-regular text-text-subtitle">At least 1 special character, 1 uppercase character, and 1 number</p>} />
          <PasswordInput size="sm" label="Confirm New Password" placeholder="Re-enter new password" />
        </div>
      </Modal>
      <SuccessModal open={dialog === 'updated'} onClose={() => setDialog(null)} onAction={() => setDialog(null)} action="Done" title="Password has been updated!"
        body="Your new password has been updated with your account which you can use to login from now." />
      <Modal open={dialog === 'logout'} onClose={() => setDialog(null)} className="[&>div]:pt-8 [&>div]:pb-8"
        footer={<><Button variant="tertiary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => navigate('/signin')}>Logout</Button></>}>
        <span className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-red-50 text-state-danger"><svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 5H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2M14 8l4 4-4 4M18 12H9" /></svg></span>
        <h2 className="text-title-s leading-[25px] text-text-title">Logout?</h2><p className="pt-2 text-text-regular text-text-title">Are you sure you want to logout?</p>
      </Modal>
    </AppShell>
  )
}

/** Edit My Profile (2065:205614): picture, Name, Email Address, a locked Role; Save / Cancel. The breadcrumb reads "Sub-Admin / Edit My Profile", as drawn. */
export function EditAccount() {
  const navigate = useNavigate()
  return (
    <AppShell crumbs={[{ label: 'Sub-Admin', to: '/account' }, { label: 'Edit My Profile' }]}>
      <section className="flex w-[573px] flex-col gap-4 rounded-lg bg-bg-1 p-6">
        <div className="flex items-center gap-4"><img src={PETER.photo} alt="" className="h-16 w-16 rounded-sm object-cover" /><Button variant="tertiary" size="md" className="rounded-sm px-3 text-text-regular">Change Picture</Button></div>
        <Input label="Name" defaultValue="Maya Thompson" /><Input label="Email Address" defaultValue="Peter.devian @humanlayer.com" />
        <Input label="Role" defaultValue="Master Admin" disabled boxClassName="bg-bg-1 [&_input]:text-text-body" />
        <div className="flex gap-4 pt-2"><Button className="flex-1" onClick={() => navigate('/account')}>Save</Button><Button variant="tertiary" className="flex-1" onClick={() => navigate('/account')}>Cancel</Button></div>
      </section>
    </AppShell>
  )
}
