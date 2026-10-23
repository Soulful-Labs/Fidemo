import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import { InfoIcon, VerifiedIcon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/Overlay'
import { notice } from '../../../components/app/Notice'
import { cn } from '../../../lib/cn'
import { useReview } from '../../../mock/review'
import { TEAM, usePlatform } from '../../../platform'
import { billing, currentRate } from '@shared/derive'
import { money } from '@shared/format'
import { platform } from '@shared/store'
import type { Study } from '@shared/types'
import { Transaction, transactionsOf } from '../manage/PayTab'
import { Rule } from './parts'
import { QuotePanel } from './QuotePanel'

interface Line { label: string; detail?: string; amount: string; info?: boolean }

export const BillLine = ({ line, bold }: { line: Line; bold?: boolean }) => (
  <div className="flex items-start justify-between text-text-regular leading-5 text-text-title">
    <div className="flex flex-col gap-1">
      <p className={cn('flex items-center gap-1', bold && 'text-text-medium')}>
        {line.label}{line.info && <InfoIcon className="h-4 w-4 text-text-subtitle" />}
      </p>
      {line.detail && <p className="text-text-subtitle">{line.detail}</p>}
    </div>
    <p className={cn(bold && 'text-text-medium')}>{line.amount}</p>
  </div>
)

export const Mastercard = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
    <circle cx="5" cy="8" r="5" className="fill-state-danger" /><circle cx="11" cy="8" r="5" className="fill-yellow-500" fillOpacity="0.9" />
  </svg>
)

/**
 * Payment (Payment - Study Details - Review, 23 Oct 2026): Payment Overview
 * (Total Cost, Total Paid, Card on File); Billing, the bill at the study's CPI
 * rate and its participants ("$250 x 20 participants") less the deposits
 * taken, down to Net payable cost, with Change CPI Rate under it; and
 * Transactions, each with its invoice. Every figure is the study's own
 * (shared/derive.ts billing); the rate is the stored one the team changes.
 */
export function PaymentTab({ study }: { study: Study }) {
  const [changing, setChanging] = useState(false)
  const client = usePlatform().clients.find((c) => c.id === study.clientId)
  const card = client?.cards.find((c) => c.isDefault) ?? client?.cards[0]
  const b = billing(study)
  const tx = transactionsOf(study)
  const Tile = ({ label, children, ring }: { label: string; children: React.ReactNode; ring?: boolean }) => (
    <div className={cn('flex h-[58px] items-center justify-between rounded-md px-4', ring ? 'border-1 border-stroke-1' : 'bg-bg-1')}>
      <span className="text-body-regular text-text-subtitle">{label}</span><span className="flex items-center gap-2 text-title-m text-text-title">{children}</span>
    </div>
  )
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          <Tile ring label="Total Cost">{money(b.totalCost)}</Tile>
          <Tile label="Total Paid">{money(b.paid)}</Tile>
          <Tile label="Card on File">{card ? <><Mastercard /><span className="text-body-regular">•••• {card.last4}</span></> : <span className="text-body-regular">None</span>}</Tile>
        </div>
      </div>
      <div className="grid grid-cols-2 items-start gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-title-s leading-[25px] text-text-title">Billing</h2>
          <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4 text-text-regular leading-5 text-text-title">
            <div className="flex flex-col gap-2">
              <p className="flex justify-between"><span>Total Recruiting Cost</span><span>{money(b.plan.total)}</span></p>
              <span className="self-start rounded-full bg-bgAlt-2 px-3 py-1.5 text-text-medium">{b.estimate.lines[0]?.label}</span>
            </div>
            {b.less.map((l) => <div key={l.label} className="flex flex-col gap-3"><Rule className="border-stroke-input" /><p className="flex justify-between"><span>{l.label}{l.sub && <span className="text-text-body"> &bull; {l.sub}</span>}</span><span>-{money(-l.amount)}</span></p></div>)}
            <Rule className="border-stroke-input" />
            <p className="flex justify-between text-text-medium"><span>Net payable cost</span><span>{money(Math.max(0, b.estimate.net))}</span></p>
          </div>
          <Button variant="secondary" size="md" className="self-start px-4" leftIcon={<PencilGlyph />} onClick={() => setChanging(true)}>Change CPI Rate</Button>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-title-s leading-[25px] text-text-title">Transactions</h2>
          {tx.map((x) => <Transaction key={x.id} action="Invoice" of={study.title} title={x.title} amount={x.amount} at={x.at} />)}
          {tx.length === 0 && <p className="rounded-md border-1 border-stroke-1 p-3 text-text-regular text-text-subtitle">No payment has been taken for this study yet.</p>}
        </div>
      </div>
      <QuotePanel study={study} />
      <ChangeCpiRate open={changing} onClose={() => setChanging(false)} study={study} />
    </div>
  )
}

const PencilGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" /></svg>
)

/**
 * Change CPI Rate (23 Oct 2026): the cost per interview for this study, per
 * participant. It opens on the rate stored now; Submit saves it through the
 * store (`setStudyRate`), which reprices the bill. Cancel leaves it.
 */
export function ChangeCpiRate({ open, onClose, study }: { open: boolean; onClose: () => void; study: Study }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setValue(String(currentRate(study))); setError('') } }, [open, study])
  const submit = () => {
    const res = platform().setStudyRate(study.id, Number(value.replace(/[$,\s]/g, '')), TEAM)
    if (!res.ok) { setError(res.why); return }
    notice(`The CPI rate is now ${money(Number(value.replace(/[$,\s]/g, '')))} per participant`)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Change CPI Rate"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
      <div className="flex flex-col gap-4 text-text-regular leading-5">
        <p className="text-body-regular text-text-subtitle">Changing CPI (Cost Per Interview/Recruitment) rate will update the total study cost on billing details.</p>
        <label className="flex flex-col gap-2 text-body-regular text-text-subtitle">Cost Per Interview (Recruitment)
          <span className="flex h-12 items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3">
            <span className="text-title-s text-text-title">$</span>
            <input value={value} onChange={(e) => { setValue(e.target.value); setError('') }} inputMode="decimal" aria-label="Cost Per Interview (Recruitment)"
              className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none" />
            <span className="text-text-subtitle">Per Participant</span>
          </span>
        </label>
        {error && <p role="alert" className="text-state-danger">{error}</p>}
      </div>
    </Modal>
  )
}

const Entry = ({ title, when, children }: { title: string; when: string; children?: React.ReactNode }) => (
  <article className="flex gap-2 rounded-lg border-1 border-stroke-1 p-[11px] leading-5">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bgAlt-2"><VerifiedIcon className="h-[18px] w-[18px] text-state-success" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="pb-0.5 text-text-regular leading-5 text-text-title">{title}</h3>
      {children}
      <p className="text-text-regular leading-5 text-text-body">{when}</p>
    </div>
  </article>
)

/**
 * Revisions History (1984:122012): the newest entry first. A request for
 * changes carries the message that was sent to the client, in a bg-1 box; the
 * submission is a single line. Each has a green tick and its time.
 */
export function RevisionsTab() {
  const { REVISIONS: R } = useReview()
  return (
    <div className="flex flex-col gap-2">
      {R.requested.map((q, k) => (
        <Entry key={k} title={q.by ? `${q.title} By ${q.by}.` : q.title} when={q.when}>
          <div className="mb-0.5 whitespace-pre-line rounded-md bg-bg-1 px-3 py-3 text-text-regular leading-5 text-text-title">
            <p>{q.greeting}</p>
            <p>{q.text}</p>
          </div>
        </Entry>
      ))}
      <Entry title={R.created.title} when={R.created.when} />
    </div>
  )
}
