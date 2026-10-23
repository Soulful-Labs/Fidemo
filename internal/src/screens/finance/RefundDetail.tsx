import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { ExternalIcon } from '../../components/ui/icons'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { useRefund } from '../../mock/finance'
import { clientPhoto } from '../../mock/clients'
import { platform } from '@shared/store'
import { TEAM, usePlatform } from '../../platform'
import { cn } from '../../lib/cn'
import { Billing, Transaction } from '../studies/manage/PayTab'
import { BillLine } from '../studies/review/PaymentRevisions'

const Money = ({ label, value, warn }: { label: string; value: string; warn?: boolean }) => (
  <div className={cn('flex h-[75px] flex-1 flex-col justify-center rounded-md px-3', warn ? 'border-1 border-orange-100' : 'border-1 border-stroke-1')}>
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p><p className={cn('pt-1.5 text-title-l leading-[31px]', warn ? 'text-state-destructive' : 'text-text-title')}>{value}</p>
  </div>
)

/**
 * A refund to confirm (`/finance/refunds/:id`, `?state=confirmed`): the
 * client; "Confirm client refund ... the transaction of $1,400 will be
 * initiated to be refunded the balance amount against the client payment."
 * with Confirm Refund (2051:169194), or "Refund Confirmed!" (2051:170363);
 * Payment Overview (Refund Amount, Deposit Paid, Total Billed); Billing down to
 * "Refund Receivable"; Transactions, which gain "Refund Paid" once confirmed.
 * The refund is raised by the platform from the shortfall ("5 participants
 * underfilled"); the team only confirms it.
 */
export default function RefundDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const r = useRefund(id)
  const state = usePlatform()
  /** Confirmed is what the platform records, not a query string. */
  const done = Boolean(r?.confirmed)
  const [step, setStep] = useState<null | 'ask' | 'done'>(null)
  const [why, setWhy] = useState('')
  if (!r) return <AppShell crumbs={[{ label: 'Refunds', to: '/finance/refunds' }]}><p className="text-body-regular text-text-body">There is no refund due on this study.</p></AppShell>
  const client = r.client
  const confirm = () => {
    const res = platform().confirmRefund(r.study.id, TEAM)
    if (res.ok) { setWhy(''); setStep('done') } else setWhy(res.why)
  }
  return (
    <AppShell className="flex flex-col gap-6 pb-8" crumbs={[{ label: 'Refunds', to: '/finance/refunds' }, { label: r.study.title }]}>
      <header className="flex gap-3 rounded-lg border-1 border-stroke-1 bg-bgAlt-1 p-4">
        <img src={clientPhoto(state, client?.id ?? '')} alt="" className="h-[84px] w-[84px] rounded-sm object-cover" />
        <div className="flex-1"><h1 className="text-title-s leading-[25px] text-text-title">{client?.name}</h1>
          <p className="flex items-center gap-2 pt-1.5 text-text-regular text-text-subtitle"><span className="text-body-regular">{client?.role}</span><span aria-hidden="true">•</span>{client?.company}<span aria-hidden="true">•</span>{client?.location}</p>
          <p className="pt-1.5 text-text-regular text-text-body">{r.v.invoice}</p></div>
        <Button variant="tertiary" size="md" className="bg-bgAlt-1 px-3" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate(`/clients/${client?.id ?? ''}`)}>Go To Full Profile</Button>
      </header>
      <section className={cn('-mt-2 flex items-center justify-between rounded-lg px-4 py-3.5 text-text-regular leading-5', done ? 'bg-bg-1' : 'bg-yellow-40')}>
        <div><h2 className="text-body-medium leading-[22px] text-text-title">Confirm client refund</h2>
          <p className="pt-1.5 text-text-title">Once confirmed, the transaction of {r.amount} will be initiated to be refunded the balance amount against the client payment.</p><p className="pt-1.5 text-text-subtitle">{done ? `Confirmed ${r.confirmedAt}` : `Raised ${r.raisedAt}`}</p>{why && <p className="pt-1.5 text-state-danger">{why}</p>}</div>
        {done ? <span className="flex h-7 items-center rounded-full bg-state-successBg px-3 text-state-success">Refund Confirmed!</span> : <Button className="px-5" onClick={() => setStep('ask')}>Confirm Refund</Button>}
      </section>
      <div>
        <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
        <div className="grid grid-cols-[1fr_1fr] gap-6 pt-3"><Money warn={!done} label="Refund Amount" value={r.amount} /><div className="flex gap-3"><Money label="Deposit Paid" value={r.deposit} /><Money label="Total Billed" value={r.billed} /></div></div>
      </div>
      <div className="grid grid-cols-2 items-start gap-6">
        <div><h2 className="pb-3 text-title-s leading-[25px] text-text-title">Billing</h2>
          {/* The study's own final bill (shared/derive.ts billing), never a sample (23 Oct 2026). */}
          <Billing lines={r.v.lines}>
            <BillLine line={{ label: 'Total Billed', amount: r.billed }} />
            <BillLine line={r.v.depositLine} />
            <span className="self-start rounded-full bg-orange-100 px-3 py-1 text-text-regular text-text-title">{r.shortfall} participants underfilled</span>
            <hr className="border-0 border-t-1 border-stroke-input" />
            <p className="flex justify-between text-text-regular text-text-title"><span>Refund Receivable</span><span className="text-state-destructive">-{r.amount}</span></p>
          </Billing></div>
        <div><h2 className="pb-3 text-title-s leading-[25px] text-text-title">Transactions</h2>
          <div className="flex flex-col gap-2">{r.v.transactions.map((t) => <Transaction key={t.label} title={t.label} amount={t.amount} detail={t.detail} />)}</div></div>
      </div>
      <Modal open={step === 'ask'} onClose={() => setStep(null)} title="Confirm Client Refund?" footer={<><Button variant="tertiary" onClick={() => setStep(null)}>Cancel</Button><Button onClick={confirm}>Confirm refund</Button></>}>
        <p className="text-body-regular text-text-subtitle">Confirm a {r.amount} refund to {client?.name} at {client?.company} for the underfilled participants of {r.study.title} study?</p>
        <p className="pt-3 text-body-regular text-text-subtitle">This action will be recorded against transaction {r.v.invoice}, under your name.</p>
      </Modal>
      <SuccessModal open={step === 'done'} onClose={() => setStep(null)} onAction={() => setStep(null)} action="Done"
        title="Client Refund Confirmed!" body={`The transaction of ${r.amount} has been initiated for the refund to ${client?.name} at ${client?.company}. Client will receive the funds within 5-7 working days.`} />
    </AppShell>
  )
}
