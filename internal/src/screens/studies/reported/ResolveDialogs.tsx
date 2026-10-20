import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { PasswordInput, TextArea } from '../../../components/ui/Input'
import { Modal, SuccessModal } from '../../../components/ui/Overlay'
import { TEAM } from '../../../platform'
import { platform } from '@shared/store'

/**
 * Mark Reports Resolved? (2314:147678), then Reports are resolved!
 * (2314:147752). One statement closes every open report on the study, and
 * the store checks it is the signed-in team member's own password.
 */
export default function ResolveDialogs({ open, onClose, studyId, title }: { open: boolean; onClose: () => void; studyId: string; title: string }) {
  const [statement, setStatement] = useState('')
  const [password, setPassword] = useState('')
  const [why, setWhy] = useState('')
  const [done, setDone] = useState(false)
  const close = () => { setStatement(''); setPassword(''); setWhy(''); onClose() }
  const resolve = () => {
    const res = platform().resolveStudyReports(studyId, statement, password, TEAM)
    if (!res.ok) { setWhy(res.why); return }
    close(); setDone(true)
  }
  return (
    <>
      <Modal open={open} onClose={close} layout="titled" title="Mark Resolved"
        footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={resolve}>Mark Resolved</Button></>}>
        <div className="flex flex-col gap-1">
          <p className="text-title-s text-text-title">Mark Reports Resolved?</p>
          <p className="text-text-regular text-text-subtitle">All the active reports for ‘{title}’ study will be marked as resolved.</p>
        </div>
        <TextArea size="sm" rows={3} className="[&_textarea]:h-[96px]" label="Resolved Remark Statement*" placeholder="Describe the remarks to mark reports as resolved"
          value={statement} onChange={(e) => { setStatement(e.target.value); setWhy('') }} />
        <div className="flex flex-col gap-2 pb-7">
          <p className="text-text-regular text-text-title">Enter your account password to confirm this action.</p>
          <PasswordInput size="sm" label="Password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setWhy('') }} />
          {why && <p className="text-text-regular text-state-danger">{why}</p>}
        </div>
      </Modal>
      <SuccessModal open={done} onClose={() => setDone(false)} onAction={() => setDone(false)} action="Done" title="Reports are resolved!"
        body={`All the active reports for ‘${title}’ study are marked as resolved.`} />
    </>
  )
}
