import { useState } from 'react'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import Modal from '../../components/ui/Modal'
import Popover from '../../components/ui/Popover'
import { STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyType } from '../../lib/studyTypes'

/** One row of a study menu, as drawn: plain text, no icon. */
function Item({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full px-5 py-2 text-left text-body-regular text-text-title hover:bg-bg-1">
      {children}
    </button>
  )
}

/**
 * Ongoing study options (1518:90959, again on 19 Oct 2026 for every study
 * type). The frame draws an Edit row under the rule; a live study cannot be
 * edited (shared/lifecycle.ts canEditStudy), so the row is not there. A
 * paused study gets Resume Study in Pause's place (not drawn).
 */
export function OngoingMenu({ open, onClose, onPause, onCopy, onComplete, onDuplicate, paused, width = 206 }: {
  open: boolean; onClose: () => void; onPause: () => void; onCopy: () => void
  onComplete: () => void; onDuplicate: () => void; paused?: boolean; width?: number
}) {
  return (
    <Popover open={open} onClose={onClose} width={width} className="rounded-md py-1.5">
      <Item onClick={onCopy}>Copy Study Link</Item>
      <Item onClick={onPause}>{paused ? 'Resume Study' : 'Pause Study'}</Item>
      <Item onClick={onComplete}>Stop-complete Study</Item>
      <div className="mx-2 my-1 border-t-1 border-stroke-input" />
      <Item onClick={onDuplicate}>Duplicate to Drafts</Item>
    </Popover>
  )
}

/** Drafts study options (1518:90965). */
export function DraftMenu({ open, onClose, onDelete, onEdit, onDuplicate }: {
  open: boolean; onClose: () => void; onDelete: () => void
  onEdit: () => void; onDuplicate: () => void
}) {
  return (
    <Popover open={open} onClose={onClose} width={180}>
      <Item onClick={onEdit}>Edit Study</Item>
      <Item onClick={onDuplicate}>Duplicate Study</Item>
      <Item onClick={onDelete}>Delete Study Draft</Item>
    </Popover>
  )
}

/** Completed study options (1726:77013). */
export function CompletedMenu({ open, onClose, onCopy, onDuplicate }: {
  open: boolean; onClose: () => void; onCopy: () => void; onDuplicate: () => void
}) {
  return (
    <Popover open={open} onClose={onClose} width={200}>
      <Item onClick={onCopy}>Copy Study Link</Item>
      <Item onClick={onDuplicate}>Duplicate to Drafts</Item>
    </Popover>
  )
}

/** The Study Type filter menu (1726:57600): All, then one row per type. */
export function StudyTypeMenu({
  open, onClose, value, onChange,
}: { open: boolean; onClose: () => void; value: StudyType[]; onChange: (next: StudyType[]) => void }) {
  const types = Object.keys(STUDY_TYPE) as StudyType[]
  const toggle = (t: StudyType) => onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t])
  return (
    <Popover open={open} onClose={onClose} width={200} className="max-h-[208px] overflow-y-auto py-0">
      <Checkbox checked={value.length === 0} label="All" onChange={() => onChange([])} />
      <div className="border-t-1 border-stroke-input" />
      {types.map((t) => <Checkbox key={t} checked={value.includes(t)} label={STUDY_TYPE[t].label} onChange={() => toggle(t)} />)}
    </Popover>
  )
}

/** Pause Study Participation? (1713:144170). */
export function PauseStudyModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Pause Study Participation?"
      body="You will stop getting new applications of participants for this study. You can resume it and make it live back later."
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>No, Keep Live</Button>
          <Button className="flex-1" onClick={onConfirm}>Yes, Pause Study</Button>
        </>
      } />
  )
}

/**
 * Stop and Mark Study Completed? (2317:163036). The notice counts the seats
 * still open against the target; a study that has filled has none, so the
 * notice is not drawn.
 */
export function StopCompleteModal({ open, onClose, onConfirm, left }: { open: boolean; onClose: () => void; onConfirm: () => void; left: number }) {
  return (
    <Modal open={open} onClose={onClose} title="Stop and Mark Study Completed?"
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>No, Keep Live</Button>
          <Button className="flex-1" onClick={onConfirm}>Yes, Stop-complete</Button>
        </>
      }>
      {left > 0 && (
        <p className="self-center rounded-sm bg-yellow-40 px-4 py-2 text-body-regular text-text-title">
          Your study has <span className="text-brand-primary">{left} participant{left === 1 ? '' : 's'}</span> left to fill target.
        </p>
      )}
      <p className="mx-auto max-w-[330px] text-body-regular text-text-subtitle">You will stop getting new applications of participants and will be marked completed.</p>
    </Modal>
  )
}

/** Re-Publish to recruit more? (19 Oct 2026 export, Pause Study Participation_-1): resuming a paused study. */
export function RepublishModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Re-Publish to recruit more?"
      body={
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to publish the study back again to recruit more participants.</p>
          <p className="text-text-title"><span className="underline">NOTE:</span><br />You will keep receiving the participants until you stop the study or it expires by validity.</p>
        </div>
      }
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={onConfirm}>Re-publish</Button>
        </>
      } />
  )
}

/**
 * Cancel Session? Not drawn in the exports. Policy section 5: a session the
 * client cancels costs the participant nothing, and they are told. They can
 * book again while the study runs.
 */
export function CancelSessionModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; name: string }) {
  // The reason is required (22 Oct 2026): it goes to the participant in their notification and is kept against the booking.
  const [reason, setReason] = useState('')
  const close = () => { setReason(''); onClose() }
  return (
    <Modal open={open} onClose={close} title="Cancel Session?"
      body={`${name}'s session will be cancelled and the time released. This costs ${name} nothing, and they are told straight away. They can book another time while the study runs.`}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={close}>No, Keep It</Button>
          <Button className="flex-1" disabled={!reason.trim()} onClick={() => { onConfirm(reason.trim()); setReason('') }}>Yes, Cancel Session</Button>
        </>
      }>
      <label className="mt-4 flex flex-col gap-1.5 text-left text-text-regular text-text-subtitle">
        Reason, sent to {name} (required)
        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason for cancelling"
          className="rounded-md border-1 border-stroke-input bg-bg-0 p-3 text-text-title outline-none focus:border-cta-primary" />
      </label>
    </Modal>
  )
}

/** Delete Study? (1726:77088). */
export function DeleteStudyModal({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Study?"
      body={<>“{name}” will be permanently deleted. This cannot be undone.</>}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>Delete</Button>
        </>
      } />
  )
}
