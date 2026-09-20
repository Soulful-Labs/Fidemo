import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

/**
 * Reject Study? / Reject Invitation? (PRD 6.8, Figma 1433:48849) and Cancel
 * Study? (PRD 6.10, Figma 1327:24135): centred title, body, red note, and
 * the destructive button on the left in the danger tint.
 */
function Confirm({
  open, onClose, title, body, note, confirmLabel, cancelLabel, onConfirm,
}: {
  open: boolean; onClose: () => void; title: string; body: string; note?: string
  confirmLabel: string; cancelLabel: string; onConfirm: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} showClose={false}
      footer={
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
          <Button className="flex-1" onClick={onClose}>{cancelLabel}</Button>
        </div>
      }>
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-title-l text-text-title">{title}</h2>
        <p className="text-body-regular text-text-subtitle">{body}</p>
        {note && <p className="text-body-regular text-state-danger">{note}</p>}
      </div>
    </Modal>
  )
}

export function RejectModal({
  open, onClose, onConfirm, isInvitation,
}: { open: boolean; onClose: () => void; onConfirm: () => void; isInvitation: boolean }) {
  return (
    <Confirm
      open={open} onClose={onClose} onConfirm={onConfirm}
      title={isInvitation ? 'Reject Invitation?' : 'Reject Study?'}
      body="Are you sure you want to reject this invitation to apply for this study?"
      note={isInvitation ? undefined : 'Note: This cannot be undone.'}
      confirmLabel="Reject" cancelLabel="Cancel"
    />
  )
}

export function CancelStudyModal({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Confirm
      open={open} onClose={onClose} onConfirm={onConfirm}
      title="Cancel Study?"
      body="Are you sure you want to cancel this study session scheduled to complete this study?"
      note="Note: This cancels the session, that is still marked negatively impacting your Trust Score and profile."
      confirmLabel="Yes, Cancel" cancelLabel="No, Keep it"
    />
  )
}
