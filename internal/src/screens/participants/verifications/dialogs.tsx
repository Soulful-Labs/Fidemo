import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { PasswordInput, TextArea } from '../../../components/ui/Input'
import { Modal, SuccessModal } from '../../../components/ui/Overlay'

export type Step = null | 'form' | 'confirm' | 'done'
export type Decision = 'verify-id' | 'verify-profession' | 'reject-verification' | 'reject-report' | 'restrict'

/** Every string of each decision's three dialogs, as drawn (typos included). */
const COPY: Record<Decision, { formTitle?: string; note?: string; label: string; placeholder: string; go?: string; ask: string; askBody: string; done: string; doneBody: string; password?: boolean; tone?: 'danger' | 'success' }> = {
  'verify-id': { formTitle: 'Mark Identity Verified', note: 'This will mark Samuel’s Identity as verified', label: 'Verification Statement*', placeholder: 'Describe the verification oucome remarks in detail', go: 'Mark Verified', password: true, tone: 'success',
    ask: 'Mark Identity as Verified ?', askBody: 'This will mark Samuel’s identity as verified.', done: 'Samuel’s Identity has been verified!', doneBody: 'Identity is now verified and Samuel’s account is now fully active to participate in studies.' },
  'verify-profession': { formTitle: 'Mark Profession Verified', note: 'This will mark Samuel’s profession credentials as verified and will be displayed on Samuel’s profile publicly.', label: 'Verification Statement*', placeholder: 'Describe the verification oucome remarks in detail', go: 'Mark Verified', password: true, tone: 'success',
    ask: 'Mark Profession as Verified ?', askBody: 'This will mark Samuel’s profession credentials as verified.', done: 'Samuel’s Profession Credentials has been verified!', doneBody: 'Profession credentials are now verified and will be displayed on Samuel’s profile publicly.' },
  'reject-verification': { label: 'Rejection Statement*', placeholder: 'Describe the Restriction reason statement',
    ask: 'Reject Verification Application?', askBody: 'This will reject the verification request and necessary action will be taken with impacting this client’s account.', done: 'Jennifer’s Business Verification has been rejected!', doneBody: 'The verification request has been rejected and necessary action will be taken with impacting this client’s account.' },
  'reject-report': { label: 'Rejection Statement*', placeholder: 'Describe the Restriction reason statement',
    ask: 'Reject This Report of Maya?', askBody: 'This will reject this report and cannot be undone later.', done: 'Maya’s Report has bee rejected!', doneBody: 'This report has been rejected successfully. No action will be impacted to this user’s account.' },
  restrict: { formTitle: 'Restrict Maya’s Account', note: 'This will make Maya’s account restricted to participate, withdraw earnings & rewards, for 15 days as for the 1st time.', label: 'Restriction Statement*', placeholder: 'Describe the Restriction reason statement in detail', go: 'Restrict', password: true, tone: 'danger',
    ask: 'Restrict Maya’s Account?', askBody: 'This will mark restrict the Maya’s account as for 1st time.', done: 'Maya’s Account has bee restricted!', doneBody: 'Maya’s account has been restricted to participate, withdraw earnings & rewards, for 15 days as for the 1st time.' },
}

/**
 * A verification decision. Two shapes are drawn:
 * - verify and restrict: a titled form (statement, the team member's
 *   password), a "... ?" confirmation, then the outcome;
 * - the two rejections: one centred dialog carrying the statement and
 *   "Yes, Reject", then the outcome.
 */
export default function DecisionFlow({ kind, step, onStep, onDone }: { kind: Decision; step: Step; onStep: (s: Step) => void; onDone: () => void }) {
  const c = COPY[kind]
  const [text, setText] = useState('')
  const close = () => onStep(null)
  const field = <TextArea size="sm" rows={3} className={c.formTitle ? '[&_textarea]:h-[96px]' : '[&_textarea]:h-[96px]'} label={c.label} placeholder={c.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
  return (
    <>
      {c.formTitle ? (
        <>
          <Modal open={step === 'form'} onClose={close} layout="titled" title={c.formTitle}
            footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button variant={c.tone} onClick={() => onStep('confirm')}>{c.go}</Button></>}>
            <p className="text-text-regular leading-5 text-text-title">{c.note}</p>
            <div className="-mt-1">{field}</div>
            <div className="flex flex-col gap-2 pb-7 pt-1.5"><p className="text-text-regular text-text-title">Enter your account password to confirm this action.</p><PasswordInput size="sm" label="Password" placeholder="Enter password" /></div>
          </Modal>
          <Modal open={step === 'confirm'} onClose={close} title={c.ask} footer={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button onClick={() => onStep('done')}>Yes</Button></>}>
            <p className="text-body-regular text-text-subtitle">{c.askBody}</p>
          </Modal>
        </>
      ) : (
        <Modal open={step === 'form'} onClose={close} title={c.ask} className="[&>div>div]:w-full [&>div>div]:max-w-none [&>div]:px-4 [&>div]:pb-6" footer={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button onClick={() => onStep('done')}>Yes, Reject</Button></>}>
          <p className="mx-auto max-w-[280px] pb-4 text-body-regular text-text-subtitle">{c.askBody}</p>
          <div className="text-left">{field}</div>
        </Modal>
      )}
      <SuccessModal open={step === 'done'} onClose={onDone} onAction={onDone} action="Done" title={c.done} body={c.doneBody} />
    </>
  )
}
