import Button from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Overlay'

/**
 * Stop and Mark Study Completed? (2372:138874, 22 Oct 2026): asked before
 * Stop-complete. `left` is the study's own shortfall against its target, and
 * the highlighted line shows only while there is one. Yes moves the study to
 * Billing, not straight to Completed.
 */
export default function StopComplete({ open, left, onClose, onConfirm }: { open: boolean; left: number; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Stop and Mark Study Completed?"
      footer={<><Button variant="tertiary" onClick={onClose}>No, Keep Live</Button><Button onClick={onConfirm}>Yes, Stop-complete</Button></>}>
      {left > 0 && (
        <span className="mb-4 block rounded-sm bg-yellow-40 px-4 py-2 text-body-regular text-text-title">
          Your study has <span className="text-brand-primary">{left} participant{left === 1 ? '' : 's'}</span> left to fill target.
        </span>
      )}
      You will stop getting new applications of participants and will be marked completed.
    </Modal>
  )
}
