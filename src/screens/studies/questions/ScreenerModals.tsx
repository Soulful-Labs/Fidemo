import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'

/** "Why Screener?" info pop-up, copy from PRD 6.8 (Figma 919:73808). */
export function WhyScreenerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Why Screener?" showClose={false}
      footer={<Button fullWidth onClick={onClose}>Got It!</Button>}>
      <div className="flex flex-col gap-2">
        <p className="text-body-regular text-text-title underline underline-offset-4">Please note</p>
        <p className="text-text-regular text-text-subtitle">
          These questions help us see if you&apos;re a good match. This isn&apos;t the paid session, and you
          won&apos;t be compensated for answering this screener questions but for the final one if you&apos;ll
          be selected for it.
        </p>
      </div>
    </Modal>
  )
}

/** "Want to Exit Screener?" (Figma 1318:22399). Save and Exit keeps a draft. */
export function ExitScreenerModal({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: () => void }) {
  return (
    <Modal open={open} onClose={onClose} showClose={false}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onSave}>Save and Exit</Button>
          <Button className="flex-1" onClick={onClose}>No, Continue</Button>
        </div>
      }>
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-title-l text-text-title">Want to Exit Screener?</h2>
        <p className="text-body-regular text-text-body">
          Your progress have been saved in Drafts. Go to{' '}
          <span className="text-text-subtitle">Studies &gt; My Studies &gt; Drafts</span> to complete later.
        </p>
      </div>
    </Modal>
  )
}

/** Locations pop-up on in-person studies before applying (Figma 940:71011). */
export function LocationsModal({
  open, onClose, locations,
}: { open: boolean; onClose: () => void; locations: { id: string; address: string }[] }) {
  return (
    <Modal open={open} onClose={onClose} title={`Locations (${locations.length})`} showClose={false}
      footer={<Button fullWidth onClick={onClose}>Got It!</Button>}>
      <div className="flex flex-col gap-3">
        {locations.map((location) => (
          <p key={location.id} className="flex items-start gap-2 rounded-md border-1 border-stroke-3 p-3 text-text-regular text-text-title">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="mt-0.5 shrink-0 text-text-subtitle">
              <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {location.address}
          </p>
        ))}
        <p className="text-text-regular text-text-body">
          You can choose any nearby location while scheduling the session after you qualify.
        </p>
      </div>
    </Modal>
  )
}
