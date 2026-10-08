import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Input'
import { SidePanel } from '../../../components/ui/Overlay'

/**
 * Request Changes (1982:110039, the 600 panel, 404 tall): "Request changes and
 * resubmit" in Title-L, a line of Body 16 under it, then one labelled text
 * area for what the client must change, and Cancel / Send. This is the only
 * place on the review where the team writes anything.
 */
export default function RequestChanges({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: () => void }) {
  const [text, setText] = useState('')
  return (
    <SidePanel open={open} onClose={onClose} title="Request Changes"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={onSend}>Send</Button></>}>
      <h3 className="text-title-l leading-[31px] text-text-title">Request changes and resubmit</h3>
      <p className="pt-3 text-body-regular text-text-subtitle">Add the required changes to request from client</p>
      <TextArea className="pb-5 pt-4 [&_textarea]:h-[110px]" label="Request Changes" rows={4} placeholder="Describe the required changes in detail" value={text} onChange={(e) => setText(e.target.value)} />
    </SidePanel>
  )
}
