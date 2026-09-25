import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

/**
 * Invitation has been sent! (1777:99979, 1779:104132). One modal raised from
 * two places: a respondent's Invite To Study names the person, a panel's
 * Invite All To Study names the panel and its member count.
 */
export function SentModal({
  open, onClose, panel,
}: { open: boolean; onClose: () => void; panel?: { members: string; title: string } }) {
  return (
    <Modal open={open} onClose={onClose} wide={!panel} title="Invitation has been sent!"
      body={panel
        ? `All the ${panel.members} members of ‘${panel.title}’ micro-panel has been invited to apply for this study.`
        : 'Ferry L. has been invited to apply for this study.'}
      footer={<Button fullWidth onClick={onClose}>Done!</Button>} />
  )
}

/** Discard the micro-panel? (1777:100042): Cancel on the Create form. */
export function DiscardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} compact wide title="Discard the micro-panel?"
      body="It will discard the micro-panel draft. It cannot be undone."
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>No, Keep</Button>
          <Button className="flex-1" onClick={onClose}>Discard</Button>
        </>
      } />
  )
}

/** Delete Micro-Panels? (1779:101116): the destructive one, in red. */
export function DeleteModal({
  open, onClose, onConfirm, title = 'Leading Neurologists - USA',
}: { open: boolean; onClose: () => void; onConfirm?: () => void; title?: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Micro-Panels?"
      body={`“${title}” micro-panel will be permanently deleted with all its members and data. This cannot be undone.`}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm ?? onClose}>Delete</Button>
        </>
      } />
  )
}
