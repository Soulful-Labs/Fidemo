import { useState } from 'react'
import { platform } from '@shared/store'
import { notice } from '../../../components/app/Notice'
import Button from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Overlay'
import { TEAM, say } from '../../../platform'

/**
 * Cancel a participant's booked session for them. Not drawn in the exports.
 * Policy section 5: a session cancelled by the client or the team costs the
 * participant nothing, and they are told. They keep their place on the study
 * and can book again.
 */
export default function CancelSessionDialog({ studyId, person, onClose }: { studyId: string; person: { id: string; name: string } | null; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const first = person?.name.split(' ')[0] ?? ''
  const confirm = () => {
    if (!person) return
    if (say(platform().cancelSessionFor(studyId, person.id, TEAM, reason))) notice(`${first}'s session is cancelled. They have been told, at no cost to them.`)
    setReason('')
    onClose()
  }
  return (
    <Modal open={person !== null} onClose={onClose} layout="titled" title={`Cancel ${first}'s Session`}
      footer={<><Button variant="tertiary" onClick={onClose}>Keep Session</Button><Button onClick={confirm}>Cancel Session</Button></>}>
      <div className="flex flex-col gap-4">
        <p className="text-text-regular leading-5 text-text-title">The time is released and {first} is told straight away. A cancellation by the team costs {first} no Trust Score, and they can book another time while the study runs.</p>
        <label className="flex flex-col gap-1.5 text-text-regular text-text-subtitle">
          Reason, sent to {first} (optional)
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-md border-1 border-stroke-2 bg-bg-0 p-3 text-text-title outline-none focus:border-cta-primary" />
        </label>
      </div>
    </Modal>
  )
}
