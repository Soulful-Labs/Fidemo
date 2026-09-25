import SidePanel from '../../components/ui/SidePanel'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Check } from '../../components/ui/icons'
import { ASK_SUPPORT, MARK_SOLVED, SENT_MODAL } from '../../mock/help'
import { useState } from 'react'
import { useWorkspace } from '../../mock/workspace'
import { useToast } from '../../components/ui/Toast'

/** The filled check the success dialogs are drawn with. */
export function SuccessMark() {
  return (
    <span className="mx-auto -order-1 mb-1 flex h-[160px] w-[160px] items-center justify-center rounded-full bg-[#fee2b5]">
      <span className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-b-4 border-yellow-700 bg-cta-primary text-bg-0">
        <Check className="h-12 w-12 [&>path]:stroke-[3]" />
      </span>
    </span>
  )
}

/** Ask Support (1663:104557): Contact Support opens it from either Help tab. */
export function AskSupportPanel({
  open, onClose, onSent,
}: { open: boolean; onClose: () => void; onSent?: (id: string) => void }) {
  const { raiseTicket } = useWorkspace()
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const submit = () => {
    if (!subject.trim() || !message.trim()) { toast('A subject and a message are both needed'); return }
    const id = raiseTicket({ subject, message })
    setSubject('')
    setMessage('')
    onSent?.(id)
  }

  return (
    <SidePanel open={open} onClose={onClose} title={ASK_SUPPORT.title} headerClassName="h-14"
      className="h-fit" bodyClassName="flex flex-col gap-4 px-4 pb-4 pt-4"
      footer={
        <div className="flex gap-4 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={submit}>Submit</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      }>
      <div className="flex flex-col">
        <p className="text-title-s leading-[22px] text-text-title">{ASK_SUPPORT.heading}</p>
        <p className="pt-1 text-text-regular leading-5 text-text-title">{ASK_SUPPORT.sub}</p>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-text-regular text-text-subtitle">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={ASK_SUPPORT.placeholder}
          className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-title outline-none placeholder:text-text-body" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-text-regular text-text-subtitle">Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={ASK_SUPPORT.placeholder}
          className="h-[90px] resize-none rounded-sm border-1 border-stroke-input px-4 py-3 text-body-regular text-text-title outline-none placeholder:text-text-body" />
      </label>
    </SidePanel>
  )
}

/** Sent successfully! (1663:104580), raised by Submit. */
export function SentSuccessModal({ open, onClose, onOpenChat }: {
  open: boolean; onClose: () => void; onOpenChat?: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title={SENT_MODAL.title}
      body={<>
        {SENT_MODAL.body}
        {/* Step 56's reply time, which the frame does not carry. */}
        <span className="block pt-2 text-text-subtitle">{SENT_MODAL.replyTime}</span>
      </>}
      footer={onOpenChat
        ? (
          <>
            <Button variant="tertiary" className="flex-1" onClick={onClose}>Done</Button>
            <Button className="flex-1" onClick={onOpenChat}>Go To Chat</Button>
          </>
        )
        : <Button fullWidth onClick={onClose}>Done</Button>}>
      <SuccessMark />
    </Modal>
  )
}

/**
 * Mark as solved? (1663:104539) is switched off in the file. `get_metadata`
 * gives the check mark, the title and the 460x285 geometry, but names the body
 * text "Error", so its wording cannot be read and is left unfilled.
 */
export function MarkSolvedModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm?: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={MARK_SOLVED.title} body={<span>&nbsp;</span>}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={onConfirm ?? onClose}>Mark as solved</Button>
        </>
      }>
      <span className="mx-auto -order-1 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-50 text-brand-secondary">
        <Check className="h-10 w-10" />
      </span>
    </Modal>
  )
}
