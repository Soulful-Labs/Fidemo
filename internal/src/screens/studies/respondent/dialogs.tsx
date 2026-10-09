import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/Input'
import { DownloadIcon, StarIcon } from '../../../components/ui/icons'
import { Modal, SidePanel } from '../../../components/ui/Overlay'
import { cn } from '../../../lib/cn'
import { DOWNLOADS } from '../../../mock/results'

const Dot = () => <span aria-hidden="true" className="px-2">•</span>

/**
 * "Mark [individual] as No-show" (460 dialog). Two wordings are drawn: the
 * one-to-one study's (1952:83027, John, with the line about the team
 * confirming) and the group's (1952:80402, Jenna). The warning sits in a red-50
 * box; "Mark as No-Show" is the quiet button and Cancel the loud one.
 */
export function NoShowDialog({ open, group, onClose, onConfirm }: { open: boolean; group: boolean; onClose: () => void; onConfirm: () => void }) {
  const first = group ? 'Jenna' : 'John'
  const full = group ? 'Jenna T.' : 'John M.'
  return (
    <Modal open={open} onClose={onClose} layout="titled" title={`Mark ${first} as No-show`}
      footer={<><Button variant="tertiary" className="text-state-danger!" onClick={onConfirm}>Mark as No-Show</Button><Button onClick={onClose}>Cancel</Button></>}>
      <div className="flex flex-col gap-4">
        <h3 className="text-title-m leading-[26px] text-text-title">Didn’t {full} attend?</h3>
        <p className="text-text-regular leading-5 text-text-title">Are you sure <strong className="font-semibold">{full} has not attended</strong> the study session that failed to attend the study and want to mark them absent as no-show?</p>
        <p className="rounded-md bg-red-50 px-3 py-3 text-text-regular leading-5 text-state-danger">
          {group ? 'This will not allow Jenna to get paid for this study.' : 'This will not allow John to get paid for this study and will be confirmed  by our team further from Jenna as well.'}
        </p>
      </div>
    </Modal>
  )
}

/** "Mark back [individual] as Completed from No-show" (1974:100123): the same dialog in green, and it says it cannot be undone. */
export function MarkBackDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Mark Jenna as Completed"
      footer={<><Button variant="tertiary" onClick={onClose}>Cancel</Button><Button onClick={onConfirm}>Mark Completed</Button></>}>
      <div className="flex flex-col gap-4">
        <h3 className="text-title-m leading-[26px] text-text-title">Had Jenna T. completed?</h3>
        <p className="text-text-regular leading-5 text-text-title">Are you sure <strong className="font-semibold">Jenna T. has is verified to have completed</strong> the study session?</p>
        <p className="rounded-md bg-state-successBg px-3 py-3 text-text-regular leading-5 text-state-success">This will mark Jenna as completed and will get paid the reward incentive. This cannot be undone.</p>
      </div>
    </Modal>
  )
}

const Stars = ({ label, initial }: { label: string; initial: number }) => {
  const [value, setValue] = useState(initial)
  return (
    <div className="rounded-lg bg-bg-1 p-4">
      <p className="text-body-regular leading-[22px] text-text-title">{label}</p>
      <div className="flex gap-1 pt-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setValue(n)}>
            <StarIcon className={cn('h-6 w-6', n <= value ? 'fill-yellow-500 text-yellow-500' : 'text-text-body')} />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Rate a respondent (Rate Ferry L. 1932:109444, Rate Sarah 1952:80275, the
 * 600 panel): who they are, three five-star ratings (Expertise drawn at four),
 * an optional review, and Submit / Cancel. The panel's title names another
 * study in both frames; built as drawn.
 */
export function RatePanel({ person, group, onClose }: { person: unknown; group?: boolean; onClose: () => void }) {
  const [review, setReview] = useState('')
  const who = group ? { name: 'Sarah K', first: 'Sarah', role: 'Housewife', study: 'E-commerce User Behavior Study' }
    : { name: 'Ferry L.', first: 'Ferry', role: 'Physiology Therapist, Orthopedic', study: 'GLP-1 Care Plans, Oncologist View' }
  return (
    <SidePanel open={person !== null} onClose={onClose} title={<>Rate {who.name} <span className="font-normal text-text-subtitle">for {who.study}</span></>}
      footer={<><Button onClick={onClose}>Submit</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></>}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-bg-3 text-title-s text-text-subtitle">F</span>
        <div>
          <p className="text-text-regular leading-5 text-text-title">{who.name}</p>
          <p className="pt-0.5 text-body-medium leading-[22px] text-text-title">{who.role}</p>
        </div>
      </div>
      <p className="pb-2 pt-4 text-body-regular leading-[22px] text-text-body">Rate {who.first} for this study</p>
      <div className="flex flex-col gap-2 pb-4">
        <Stars label="Expertise" initial={4} />
        <Stars label="Reliability" initial={0} />
        <Stars label="Communication" initial={0} />
        <div className="rounded-lg bg-bg-1 p-4">
          <p className="text-body-regular leading-[22px] text-text-title">Review <span className="text-text-regular text-text-subtitle">(optional)</span></p>
          <TextArea className="pt-2 [&_textarea]:h-[90px]" placeholder="Describe your experience with Ferry here.." value={review} onChange={(e) => setReview(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  )
}

/** Download Sessions Results (1952:80341, the 600 panel, 256 tall): one row per session with "Download Files". */
export function DownloadSessions({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Download Sessions Results">
      <div className="flex flex-col gap-3">
        {DOWNLOADS.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
            <div>
              <p className="text-body-regular leading-[22px] text-text-title"><span className="text-body-medium">{d.name}</span><Dot />{d.when}</p>
              <p className="pt-1 text-text-regular leading-5 text-text-subtitle">{d.detail[0]}<Dot />{d.detail[1]}</p>
            </div>
            <Button size="md" className="px-3" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download Files</Button>
          </div>
        ))}
      </div>
    </SidePanel>
  )
}

const Fixed = ({ label, value }: { label: string; value: number }) => (
  <div className="border-t-1 border-stroke-input py-3">
    <p className="text-text-regular leading-5 text-text-title">{label}</p>
    <div className="flex gap-1 pt-1">{[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} className={cn('h-6 w-6', n <= value ? 'fill-yellow-500 text-yellow-500' : 'text-text-body')} />)}</div>
  </div>
)

/** "RATED" (1932:98139, the 600 panel, 503 tall): the rating already given, read only. No way to change it is drawn. */
export function RatedPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title={<>Rate John M <span className="font-normal text-text-subtitle">for GLP-1 Care Plans, Oncologist View</span></>}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-bg-3 text-title-s text-text-subtitle">F</span>
        <div><p className="text-text-regular leading-5 text-text-title">John M</p><p className="pt-0.5 text-body-medium leading-[22px] text-text-title">Physiology Therapist, Orthopedic</p></div>
      </div>
      <div className="mt-3 rounded-lg bg-bg-1 px-4 pb-2 pt-4">
        <p className="pb-3 text-body-regular leading-[22px] text-text-subtitle">You have rated on Aug 24, 20206</p>
        <Fixed label="Expertise" value={5} /><Fixed label="Reliability" value={5} /><Fixed label="Communication" value={4} />
        <div className="border-t-1 border-stroke-input py-3">
          <p className="text-text-regular leading-5 text-text-title">Review</p>
          <p className="pt-1 text-body-regular leading-[22px] text-text-subtitle">Was an really insightful session with John! would highly recommend her.</p>
        </div>
      </div>
      <div className="h-1" />
    </SidePanel>
  )
}
