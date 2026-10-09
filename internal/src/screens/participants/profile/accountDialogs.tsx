import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { PasswordInput, TextArea } from '../../../components/ui/Input'
import { Modal, SuccessModal } from '../../../components/ui/Overlay'
import { cn } from '../../../lib/cn'

export type AccountStep = null | 'form' | 'confirm' | 'done'

const Warn = ({ red }: { red: boolean }) => (
  <span className={cn('mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full', red ? 'bg-orange-100' : 'bg-yellow-40')}>
    <span className={cn('flex h-[92px] w-[92px] items-center justify-center rounded-full border-4 text-[44px] font-semibold leading-none text-bg-0', red ? 'border-state-destructiveEdge bg-state-destructive' : 'border-brand-primary bg-yellow-400')}>!</span>
  </span>
)

/**
 * Deactivate or reactivate an account, three steps each as drawn:
 * 1. a form (2022:178767 / 2024:179610): what the user will be told, a
 *    required Reason, and the team member's own password;
 * 2. a confirmation (2022:178788 / 2024:179633);
 * 3. the outcome (2024:179800 / 2024:179769).
 * Both forms say "confirm deactivation" over the password, as drawn.
 */
export function AccountFlow({ kind, step, onStep, onDone }: { kind: 'deactivate' | 'reactivate'; step: AccountStep; onStep: (s: AccountStep) => void; onDone: () => void }) {
  const [reason, setReason] = useState('')
  const off = kind === 'deactivate'
  const close = () => onStep(null)
  return (
    <>
      <Modal open={step === 'form'} onClose={close} layout="titled" title={off ? 'Deactivate Account' : 'Reactivate Account'}
        footer={<><Button variant="secondary" onClick={close}>Cancel</Button>
          {off ? <Button variant="danger" className="border-state-danger! bg-state-danger!" onClick={() => onStep('confirm')}>Deactivate</Button> : <Button variant="success" onClick={() => onStep('confirm')}>Yes, Reactivate</Button>}</>}>
        <div className="flex flex-col gap-5">
          <p className="text-text-regular leading-5 text-text-title">
            {off && <><span className="text-text-medium underline">Note:</span><br /></>}
            {off ? 'User will receive the deactivation email with your given reason and won’t be able to access until you activate it back.' : 'User will receive the reactivation email with your given reason and would be able to access it back.'}
          </p>
          <TextArea size="sm" rows={4} label="Reason*" placeholder="Describe the reason in detail" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-col gap-2">
            <p className="text-text-regular text-text-title">Enter your account password to confirm deactivation.</p>
            <PasswordInput size="sm" label="Password" placeholder="Enter password" />
          </div>
        </div>
      </Modal>
      <Modal open={step === 'confirm'} onClose={close} className="[&>div>div]:max-w-[310px]"
        footer={<><Button variant="tertiary" onClick={close}>Cancel</Button><Button onClick={() => onStep('done')}>{off ? 'Yes, Deactivate' : 'Yes, Reactivate'}</Button></>}>
        <Warn red={off} />
        <h2 className="pb-3 text-title-l leading-[31px] text-text-title [text-wrap:nowrap] -mx-10">{off ? 'Deactivate Samuel’s account?' : 'Reactivate Samuel’s account?'}</h2>
        <p className="text-body-regular text-text-subtitle">{off ? 'User will receive the deactivation email with your given reason and won’t be able to access until you activate it back.' : 'User will receive the reactivation email with your given reason and would be able to access it back.'}</p>
      </Modal>
      <SuccessModal open={step === 'done'} onClose={onDone} onAction={onDone} action="Done" tone={off ? 'yellow' : 'green'}
        title={off ? 'Samuel’s account has been deactivated!' : 'Samuel’s account has been reactivated!'}
        body={off ? 'Samuel’s account has been deactivated now and he cannot use anymore. He can contact us back to appeal and access his account.' : 'Participant can login back to access their account.'} />
    </>
  )
}
