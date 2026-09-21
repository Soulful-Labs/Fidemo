import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SuccessScreen from '../../components/app/SuccessScreen'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { cn } from '../../lib/cn'
import { money } from '../../lib/format'
import { WITHDRAWAL_FEE, canWithdraw, netWithdrawal } from '../../lib/rules'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'
import { Breakdown } from './bits'

const last4 = (account: string) => `****${account.replace(/\s/g, '').slice(-4)}`

/**
 * PRD 10.1, Figma 1219:29661. /withdraw, /withdraw/method (the Select
 * Payout Method sheet) and /withdraw/done share this screen so the amount
 * survives the sheet.
 */
export default function Withdraw() {
  const { step } = useParams()
  const navigate = useNavigate()
  const { user, payoutMethods, withdraw, toast } = useStore()
  const [raw, setRaw] = useState('')
  const [methodId, setMethodId] = useState(payoutMethods.find((m) => m.isDefault)?.id ?? payoutMethods[0]?.id)
  const [draft, setDraft] = useState(methodId)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(0)

  const amount = Number(raw)
  const method = payoutMethods.find((m) => m.id === methodId)
  const check = user.taxFormRequired
    ? { ok: false as const, reason: 'A tax form is needed before you can withdraw. Upload it from the Wallet screen.' }
    : canWithdraw(amount, user.walletBalance)

  if (step === 'done') {
    return (
      <SuccessScreen
        alt
        title={`${money(sent)} withdrawal request sent successfully!`}
        body={`Your withdrawal request for ${money(sent)} has been sent and the funds will be credited within 2-3 working days.`}
        onAction={() => navigate('/wallet', { replace: true })}
      />
    )
  }

  const submit = () => {
    if (!method) return
    setSending(true)
    setSent(amount)
    setTimeout(() => {
      withdraw(amount, last4(method.accountNumber))
      navigate('/wallet/withdraw/done', { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Withdraw" onBack={() => navigate('/wallet')} />

      <div className="flex flex-1 flex-col gap-4 bg-yellow-fade px-4 pb-6 pt-6">
        <p className="text-center text-body-regular text-text-subtitle">Enter Amount To Withdraw</p>
        <label className={cn('flex h-16 items-center justify-center gap-1 rounded-lg border-1.5 text-display-s text-brand-primary', raw && !check.ok ? 'border-state-danger' : 'border-brand-primary')}>
          <span>$</span>
          <input
            inputMode="decimal"
            value={raw}
            placeholder="0"
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.]/g, ''))}
            aria-label="Amount to withdraw"
            size={Math.max(1, raw.length)}
            className="min-w-0 bg-transparent text-left outline-none placeholder:text-text-disabled"
          />
        </label>
        {(raw || user.taxFormRequired) && !check.ok && <p className="text-center text-label text-state-danger">{check.reason}</p>}

        <div className="flex items-center justify-between">
          <Tag tone="outline" size="md">Balance: <span className="text-brand-primary">{money(user.walletBalance)}</span></Tag>
          <Button size="md" variant="tertiary" onClick={() => setRaw(String(user.walletBalance))}>Max.</Button>
        </div>

        {method ? (
          <div className="flex flex-col gap-3 rounded-lg bg-bgAlt-2 p-4">
            <p className="flex items-center gap-2 text-body-medium text-text-title">
              To {method.bankName}
              {method.isDefault && <Tag tone="outline">Default</Tag>}
            </p>
            <p className="text-text-regular text-text-subtitle">{last4(method.accountNumber)}</p>
            <Button size="md" variant="tertiary" className="self-start" onClick={() => { setDraft(methodId); navigate('/wallet/withdraw/method') }}>Change</Button>
          </div>
        ) : (
          <Button variant="secondary" fullWidth onClick={() => navigate('/wallet/payout-methods/add')}>Add Payout Account</Button>
        )}

        <Breakdown amount={check.ok ? amount : 0} fee={WITHDRAWAL_FEE} net={check.ok ? netWithdrawal(amount) : 0} />
      </div>

      <CtaBar alt>
        <Button fullWidth loading={sending} disabled={!check.ok || !method} onClick={submit}
          onBlocked={() => toast(method ? (check.reason ?? 'Enter an amount') : 'Add a payout account first')}>
          Withdraw
        </Button>
      </CtaBar>

      <BottomSheet alt open={step === 'method'} onClose={() => navigate('/wallet/withdraw')} title="Select Payout Method"
        footer={<Button fullWidth onClick={() => { setMethodId(draft); navigate('/wallet/withdraw'); toast('Payout method updated') }}>Save</Button>}>
        <div className="flex flex-col gap-2">
          {payoutMethods.map((m) => {
            const on = draft === m.id
            return (
              <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setDraft(m.id)}
                className={cn('flex items-start gap-3 rounded-md border-1 p-3 text-left', on ? 'border-yellow-700 bg-yellow-1000/50' : 'border-transparent bg-bgAlt-2')}>
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5', on ? 'border-brand-primary' : 'border-text-subtitle')}>
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className={cn('text-body-medium', on ? 'text-brand-primary' : 'text-text-title')}>
                    {m.bankName} {m.isDefault && <span className="text-text-regular text-text-body">(Default)</span>}
                  </span>
                  <span className="text-text-regular text-text-subtitle">{last4(m.accountNumber)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}
