import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const BLOCKS = [
  { title: 'About Info', body: 'These information about you and your professional details are used to find the most relevant studies for you to help you earn more.' },
  { title: 'Documents', body: 'These documents are used to verify your identity to prevent any fake identification and bots for keeping platform clean and a healthy participation.' },
]

/**
 * PRD 4.7, quoted exactly. The closing line is flagged as inaccurate by
 * conflict 19 and open item 13 (Legal owns the rewrite), so it is left as
 * drawn rather than reworded here.
 */
export default function DetailsInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="What these details are for?"
      footer={<Button fullWidth onClick={onClose}>Got It!</Button>}
    >
      <div className="flex flex-col gap-4">
        {BLOCKS.map((block) => (
          <div key={block.title} className="flex flex-col gap-1">
            <p className="text-body-medium text-text-title">{block.title}</p>
            <p className="text-text-regular text-text-body">{block.body}</p>
          </div>
        ))}
        <p className="text-text-regular text-text-body">
          Your all the details and documents are completely safe as we do not share these data to
          any other parties.
        </p>
      </div>
    </Modal>
  )
}
