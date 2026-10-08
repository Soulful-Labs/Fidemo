import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Input'
import { SidePanel } from '../../../components/ui/Overlay'

/**
 * Pause Study (1952:76517, the 600 panel, 404 tall): the question in Title-L,
 * two lines of Body 16, one "Reason" text area, and Cancel / Yes, Pause Study.
 */
export default function PauseStudy({ open, onClose, onPause }: { open: boolean; onClose: () => void; onPause: () => void }) {
  const [reason, setReason] = useState('')
  return (
    <SidePanel open={open} onClose={onClose} title="Pause Study"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onPause}>Yes, Pause Study</Button></>}>
      <h3 className="text-title-l leading-[35px] text-text-title">Pause Study Participation?</h3>
      <p className="pt-2 text-body-regular leading-[22px] text-text-subtitle">You will stop getting new applications of participants for this study. You can resume it and make it live back later.</p>
      <TextArea className="pb-5 pt-4 [&_textarea]:h-[90px]" label="Reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
        placeholder="Your study has been paused as per your request. You can resume it back whenever you want." />
    </SidePanel>
  )
}
