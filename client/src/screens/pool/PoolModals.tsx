import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

/** Invitation has been sent! (1777:99979): raised when a respondent is invited to a study, naming them. */
export function SentModal({ open, onClose, name, study }: { open: boolean; onClose: () => void; name?: string
  /** The study's title, as the 15 Oct 2026 frame names it ("…invited to apply for “About goal-tracking methods” study."). */
  study?: string }) {
  return (
    <Modal open={open} onClose={onClose} wide title="Invitation has been sent!"
      body={`${name ?? 'They'} ${name ? 'has' : 'have'} been invited to apply for ${study ? `“${study}” study` : 'this study'}.`}
      footer={<Button fullWidth onClick={onClose}>Done!</Button>} />
  )
}
