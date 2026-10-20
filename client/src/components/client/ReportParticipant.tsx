import { CLIENT_REPORT_REASONS, REPORT_MAX_CHARS } from '@shared/platform'
import type { Report } from '@shared/types'
import { useEffect, useState } from 'react'
import { SuccessMark } from '../../screens/help/HelpPanels'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { ChevronLeft, ChevronRight, Close } from '../ui/icons'

/** A finished action, as the success dialogs draw it: the mark, a title, a line, and Done (2313:82805, 2317:163859). */
export function DoneModal({ open, onClose, title, body }: { open: boolean; onClose: () => void; title: string; body: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} body={body}
      footer={<Button className="flex-1" onClick={onClose}>Done</Button>}>
      <SuccessMark />
    </Modal>
  )
}

/**
 * Report Participant (2313:83072, then 2313:83208): pick a reason, describe
 * it, submit. The report goes to the console's Reported queue; the person is
 * told nothing until the team decides.
 */
export default function ReportParticipant({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void
  onSubmit: (reason: Report['reason'], detail: string) => { ok: boolean; why?: string }
}) {
  const [reason, setReason] = useState<Report['reason'] | null>(null)
  const [detail, setDetail] = useState('')
  const [why, setWhy] = useState('')
  const [done, setDone] = useState(false)
  const reset = () => { setReason(null); setDetail(''); setWhy('') }

  useEffect(() => {
    if (!open || done) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (reset(), onClose())
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, done, onClose])

  const close = () => { reset(); onClose() }
  const submit = () => {
    if (!reason) return
    const res = onSubmit(reason, detail)
    if (!res.ok) { setWhy(res.why ?? 'Could not send the report'); return }
    reset(); onClose(); setDone(true)
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25 px-4" role="presentation" onClick={close}>
          <div role="dialog" aria-modal="true" aria-label="Report Participant" onClick={(e) => e.stopPropagation()}
            className="flex w-modal flex-col overflow-hidden rounded-lg bg-bg-0 shadow-xl">
            <div className="flex h-14 items-center justify-between gap-3 border-b-1 border-stroke-1 px-4">
              <span className="flex items-center gap-2">
                {reason && (
                  <button type="button" aria-label="Back to reasons" onClick={() => { setReason(null); setWhy('') }} className="-ml-1 flex h-8 w-8 items-center justify-center text-text-title">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <span className="text-title-s text-text-title">Report Participant</span>
              </span>
              <button type="button" aria-label="Close" onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-stroke-input text-text-title hover:bg-bg-1">
                <Close className="h-4 w-4" />
              </button>
            </div>

            {!reason ? (
              <div className="flex flex-col px-4 pb-2 pt-4">
                <p className="pb-2 text-text-regular text-text-body">Select reason to report this participant</p>
                {CLIENT_REPORT_REASONS.map((r, i) => (
                  <button key={r} type="button" onClick={() => setReason(r)}
                    className={`flex h-12 items-center justify-between text-left text-body-regular text-text-title hover:text-brand-primary ${i < CLIENT_REPORT_REASONS.length - 1 ? 'border-b-1 border-stroke-1' : ''}`}>
                    {r}<ChevronRight className="h-5 w-5 text-text-body" />
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 px-4 pb-4 pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-text-regular text-text-body">Selected Reason</span>
                    <span className="text-body-regular text-text-subtitle">{reason}</span>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-text-regular text-text-subtitle">Describe your report*</span>
                    <textarea value={detail} maxLength={REPORT_MAX_CHARS} onChange={(e) => { setDetail(e.target.value); setWhy('') }}
                      placeholder="Describe your report for participant in detail"
                      className="h-[112px] resize-none rounded-md border-1 border-stroke-input bg-bg-0 px-3 py-2.5 text-body-regular text-text-title outline-none placeholder:text-text-body focus:border-brand-primary" />
                    <span className="text-text-regular text-text-body">{detail.length}/{REPORT_MAX_CHARS}</span>
                    {why && <span className="text-text-regular text-red-600">{why}</span>}
                  </label>
                </div>
                <div className="border-t-1 border-stroke-1 p-4">
                  <Button size="none" className="h-12 w-full text-body-regular" disabled={!detail.trim()} onClick={submit}>Submit</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <DoneModal open={done} onClose={() => setDone(false)} title="Report has been submitted!"
        body="Thanks for your feedback! Our support team will review it and take the required actions as required." />
    </>
  )
}
