import { useEffect, useState } from 'react'
import type { Invoice } from '@shared/derive'
import { money, monthDayYear } from '@shared/format'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import SidePanel from '../../components/ui/SidePanel'
import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useWorkspace } from '../../mock/workspace'
import { CardMark } from './PaymentPanels'

const DAY = 86_400_000
/** An invoice falls due a week after it is raised, which is what the Payments table already prints. */
export const dueOn = (i: Invoice): string => new Date(new Date(i.date).getTime() + 7 * DAY).toISOString()

/**
 * Pay All Due Invoices (exported 13 Oct 2026): every pending invoice, ticked,
 * with the card they will be charged to and one button for the total. An
 * invoice can be unticked to leave it for later. Paying an invoice is paying
 * the balance on its study (shared/store.ts payBalance), one after another;
 * the platform has no single charge that covers several studies.
 */
export function PayAllPanel({ open, onClose, invoices, onPaid }: {
  open: boolean; onClose: () => void; invoices: Invoice[]; onPaid: (paid: Invoice[]) => void
}) {
  const toast = useToast()
  const { cards, payInvoice } = useWorkspace()
  const [off, setOff] = useState<string[]>([])
  const [pick, setPick] = useState(0)
  useEffect(() => { if (open) setOff([]) }, [open])
  const start = Math.max(0, cards.findIndex((c) => c.isDefault))
  const card = cards[(start + pick) % Math.max(1, cards.length)]
  const chosen = invoices.filter((i) => !off.includes(i.number))
  const total = chosen.reduce((n, i) => n + i.amount, 0)

  const pay = () => {
    if (!card) { toast('Add a payment method before paying'); return }
    chosen.forEach((i) => payInvoice(i.number))
    onPaid(chosen)
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Pay All Due Invoices" headerClassName="h-14" className="h-fit max-h-full"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={<Button size="none" className="h-12 w-full text-body-medium" disabled={chosen.length === 0} onClick={pay}>Pay {money(total)}</Button>}>
      <section className="flex flex-col rounded-lg border-1 border-stroke-1 bg-bg-1 px-4">
        <p className="flex h-[51px] items-center justify-between text-body-regular text-text-title">
          <span>Pay <span className="text-body-medium text-brand-primary">{chosen.length}</span> invoice{chosen.length === 1 ? '' : 's'}</span>
          <span className="text-body-large text-brand-primary">{money(total)}</span>
        </p>
        <p className="flex h-[65px] items-center justify-between border-t-1 border-stroke-input">
          <span className="flex items-center gap-2 text-body-regular text-text-title">
            From
            {card ? (
              <span className="inline-flex h-8 items-center gap-3 rounded-full bg-bgAlt-2 px-3 text-body-regular text-text-title">
                <CardMark brand={card.brand} /><span className="text-text-title">&bull;</span>**** {card.last4}
              </span>
            ) : <span className="text-text-subtitle">no card on file</span>}
          </span>
          <Button variant="tertiary" size="row" className="px-3" onClick={() => {
            if (cards.length < 2) { toast('Add a second card to switch between them'); return }
            setPick((i) => (i + 1) % cards.length)
          }}>Change method</Button>
        </p>
      </section>

      {invoices.map((i) => {
        const on = !off.includes(i.number)
        return (
          <button key={i.number} type="button" role="checkbox" aria-checked={on}
            onClick={() => setOff((x) => (on ? [...x, i.number] : x.filter((n) => n !== i.number)))}
            className="flex h-[76px] items-start gap-2 rounded-lg border-1 border-stroke-1 px-4 pt-[15px] text-left">
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-1.5', on ? 'border-brand-primary bg-brand-primary text-bg-0' : 'border-text-body')}>
              {on && <Check className="h-4 w-4" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-text-medium text-text-title">Final Pay - {i.study}</span>
              <span className="text-text-regular text-text-subtitle">{i.number}<span className="px-2 text-text-title">&bull;</span>Due by {monthDayYear(dueOn(i))}</span>
            </span>
            <span className="text-text-large text-text-title">{money(i.amount)}</span>
          </button>
        )
      })}
    </SidePanel>
  )
}

/** "$34,538 paid successfully!" (exported 13 Oct 2026), with the amount and the count that were actually paid. */
export function PaidAllModal({ open, onClose, paid }: { open: boolean; onClose: () => void; paid: Invoice[] }) {
  const total = paid.reduce((n, i) => n + i.amount, 0)
  return (
    <Modal open={open} onClose={onClose} title={`${money(total)} paid successfully!`}
      body={<>Your payment has been done and {paid.length === 1 ? 'the due invoice has' : `all ${paid.length} due invoices have`} been cleared.</>}
      footer={<Button fullWidth onClick={onClose}>Done</Button>}>
      <span className="mx-auto -order-1 mb-1 flex h-40 w-40 items-center justify-center rounded-full bg-yellow-100">
        <span className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-4 border-brand-primary bg-cta-primary text-bg-0">
          <svg viewBox="0 0 24 24" width="46" height="46" fill="none" aria-hidden="true"><path d="m5.5 12.5 4.3 4.3L18.5 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </span>
    </Modal>
  )
}
