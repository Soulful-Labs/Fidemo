import { useState } from 'react'
import { checkPassword } from '../../../platform'
import { RESTRICTION_DAYS } from '@shared/platform'
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
/**
 * The Restrict copy is drawn for the first offence only. Policy section 9's
 * ladder runs 15, 15 and 30 days, and the fourth offence deactivates, so the
 * words follow how many restrictions the account already has.
 */
function restrictCopy(prior: number): Partial<(typeof COPY)[Decision]> {
  const n = prior + 1
  const nth = ['1st', '2nd', '3rd'][prior]
  if (n > RESTRICTION_DAYS.length) return {
    note: `This is Maya’s fourth offence, so this will deactivate Maya’s account instead of restricting it. Maya is told the reason and can appeal.`,
    go: 'Deactivate', ask: 'Deactivate Maya’s Account?', askBody: 'This is the fourth offence: the account will be deactivated, not restricted.',
    done: 'Maya’s account has been deactivated.', doneBody: 'Maya has been sent the reason and can appeal the decision.',
  }
  const days = RESTRICTION_DAYS[prior]
  return {
    note: `This will make Maya’s account restricted to participate, withdraw earnings & rewards, for ${days} days as for the ${nth} time.`,
    askBody: `This will mark restrict the Maya’s account as for ${nth} time.`,
    doneBody: `Maya’s account has been restricted to participate, withdraw earnings & rewards, for ${days} days as for the ${nth} time.`,
  }
}

export default function DecisionFlow({ kind, step, onStep, onDone, onDecide, name, prior = 0 }: {
  kind: Decision; step: Step; onStep: (s: Step) => void; onDone: () => void
  /** Records the decision on the shared platform with its statement; a refusal is shown and the flow stays on its form. */
  onDecide?: (statement: string) => { ok: boolean; why?: string }
  /** First name of the person decided on; the frames' own copy names Samuel or Maya. */
  name?: string
  /** Restrictions the account already has (restrict only): sets the days, or the deactivation. */
  prior?: number
}) {
  // Read once, when the flow opens: deciding adds a restriction, and the outcome must describe this one.
  const [offences] = useState(prior)
  const named = (v: unknown) => (typeof v === 'string' && name ? v.replace(/Samuel|Maya/g, name) : v)
  const c = Object.fromEntries(Object.entries({ ...COPY[kind], ...(kind === 'restrict' ? restrictCopy(offences) : {}) }).map(([k, v]) => [k, named(v)])) as (typeof COPY)[Decision]
  const [text, setText] = useState('')
  const [why, setWhy] = useState('')
  const [password, setPassword] = useState('')
  const [pwWhy, setPwWhy] = useState('')
  /** The form asks for the team member's password; it has to be theirs before the decision is asked. */
  const toConfirm = () => { const ok = checkPassword(password); if (!ok.ok) { setPwWhy(ok.why); return } setPwWhy(''); onStep('confirm') }
  const decide = () => {
    const res = onDecide?.(text) ?? { ok: true }
    if (!res.ok) { setWhy(res.why ?? ''); onStep('form'); return }
    setWhy(''); setText(''); setPassword(''); onStep('done')
  }
  const close = () => onStep(null)
  const field = <TextArea size="sm" rows={3} className={c.formTitle ? '[&_textarea]:h-[96px]' : '[&_textarea]:h-[96px]'} label={c.label} placeholder={c.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
  const error = why ? <p className="pt-1 text-text-regular text-state-danger">{why}</p> : null
  return (
    <>
      {c.formTitle ? (
        <>
          <Modal open={step === 'form'} onClose={close} layout="titled" title={c.formTitle}
            footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button variant={c.tone} onClick={toConfirm}>{c.go}</Button></>}>
            <p className="text-text-regular leading-5 text-text-title">{c.note}</p>
            <div className="-mt-1">{field}{error}</div>
            <div className="flex flex-col gap-2 pb-7 pt-1.5"><p className="text-text-regular text-text-title">Enter your account password to confirm this action.</p><PasswordInput size="sm" label="Password" placeholder="Enter password" value={password} onChange={(e) => { setPassword(e.target.value); setPwWhy('') }} />{pwWhy && <p className="text-text-regular text-state-danger">{pwWhy}</p>}</div>
          </Modal>
          <Modal open={step === 'confirm'} onClose={close} title={c.ask} footer={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button onClick={decide}>Yes</Button></>}>
            <p className="text-body-regular text-text-subtitle">{c.askBody}</p>
          </Modal>
        </>
      ) : (
        <Modal open={step === 'form'} onClose={close} title={c.ask} className="[&>div>div]:w-full [&>div>div]:max-w-none [&>div]:px-4 [&>div]:pb-6" footer={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button onClick={decide}>Yes, Reject</Button></>}>
          <p className="mx-auto max-w-[280px] pb-4 text-body-regular text-text-subtitle">{c.askBody}</p>
          <div className="text-left">{field}{error}</div>
        </Modal>
      )}
      <SuccessModal open={step === 'done'} onClose={onDone} onAction={onDone} action="Done" title={c.done} body={c.doneBody} />
    </>
  )
}
