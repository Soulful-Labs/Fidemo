import { REPORT_MAX_CHARS, STUDY_REPORT_REASONS } from '@shared/platform'
import { useState } from 'react'
import SuccessBadge from '../../../components/app/SuccessBadge'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ArrowLeft, ChevronRight, Close } from '../../../components/ui/icons'

/**
 * Report Study (19 Oct 2026 export: Report Study, Describe - Report Study,
 * Reported successfully): pick a reason, describe it, submit. The report
 * goes to the console's Reported Studies; nothing changes for the study
 * until the team looks at it.
 */
export default function ReportStudy({ open, onClose, onSubmit }: {
  open: boolean; onClose: () => void
  onSubmit: (reason: string, detail: string) => { ok: boolean; why?: string }
}) {
  const [reason, setReason] = useState<string | null>(null)
  const [detail, setDetail] = useState('')
  const [why, setWhy] = useState('')
  const [done, setDone] = useState(false)
  const close = () => { setReason(null); setDetail(''); setWhy(''); onClose() }
  const submit = () => {
    const res = onSubmit(reason ?? '', detail)
    if (!res.ok) { setWhy(res.why ?? 'Could not send the report'); return }
    close(); setDone(true)
  }

  return (
    <>
      <Modal plain open={open} onClose={close} showClose={false}
        footer={reason ? <Button fullWidth disabled={!detail.trim()} onClick={submit}>Submit</Button> : undefined}>
        <div className="-mx-4 -mt-4 flex h-14 items-center gap-3 border-b-1 border-stroke-3 px-4">
          {reason && <button type="button" aria-label="Back to reasons" onClick={() => { setReason(null); setWhy('') }} className="text-text-title"><ArrowLeft className="h-6 w-6" /></button>}
          <h2 className="flex-1 text-title-s text-text-title">Report Study</h2>
          <button type="button" aria-label="Close" onClick={close} className="text-text-title"><Close className="h-6 w-6" /></button>
        </div>
        {!reason ? (
          <div className="flex flex-col pt-3">
            <p className="pb-2 text-text-regular text-text-body">Select reason to report this study</p>
            {STUDY_REPORT_REASONS.map((r, i) => (
              <button key={r} type="button" onClick={() => setReason(r)}
                className={`flex min-h-12 items-center justify-between gap-3 py-2.5 text-left text-body-regular text-text-title ${i < STUDY_REPORT_REASONS.length - 1 ? 'border-b-1 border-stroke-1' : ''}`}>
                {r}<ChevronRight className="h-5 w-5 shrink-0 text-text-body" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-3">
            <div className="flex flex-col gap-1">
              <span className="text-text-regular text-text-body">Selected Reason</span>
              <span className="text-body-regular text-text-subtitle">{reason}</span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-text-regular text-text-subtitle">Describe your report*</span>
              <textarea value={detail} maxLength={REPORT_MAX_CHARS} rows={4} onChange={(e) => { setDetail(e.target.value); setWhy('') }} placeholder="Describe your report in detail"
                className="resize-none rounded-lg border-1 border-stroke-3 bg-bg-0 px-3 py-2.5 text-body-regular text-text-title outline-none placeholder:text-text-disabled focus:border-brand-primary" />
              <span className="text-text-regular text-text-body">{detail.length}/{REPORT_MAX_CHARS}</span>
              {why && <span className="text-text-regular text-state-danger">{why}</span>}
            </label>
          </div>
        )}
      </Modal>
      <Modal earned open={done} onClose={() => setDone(false)} showClose={false}
        footer={<Button fullWidth onClick={() => setDone(false)}>Done</Button>}>
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <SuccessBadge />
          <h2 className="text-title-l text-text-title">Report has been submitted!</h2>
          <p className="text-body-regular text-text-body">Thanks for your feedback! Our support team will review it and take the required actions as required.</p>
        </div>
      </Modal>
    </>
  )
}
