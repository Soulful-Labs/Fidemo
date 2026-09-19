import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

/** Reject Study? / Reject Invitation? and Cancel Study?, copy from PRD 6.8 and 6.10. */
export function RejectModal({
  open, onClose, onConfirm, isInvitation,
}: { open: boolean; onClose: () => void; onConfirm: () => void; isInvitation: boolean }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isInvitation ? 'Reject Invitation?' : 'Reject Study?'}
      footer={
        <>
          <Button variant="danger" fullWidth onClick={onConfirm}>Reject</Button>
          <Button variant="tertiary" fullWidth onClick={onClose}>Cancel</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to reject this invitation to apply for this study?</p>
        {!isInvitation && <p className="text-state-danger">Note: This cannot be undone.</p>}
      </div>
    </Modal>
  )
}

export function CancelStudyModal({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Study?"
      footer={
        <>
          <Button variant="danger" fullWidth onClick={onConfirm}>Yes, Cancel</Button>
          <Button variant="tertiary" fullWidth onClick={onClose}>No, Keep it</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to cancel this study session scheduled to complete this study?</p>
        <p className="text-state-danger">
          Note: This cancels the session, that is still marked negatively impacting your Trust Score
          and profile.
        </p>
      </div>
    </Modal>
  )
}
