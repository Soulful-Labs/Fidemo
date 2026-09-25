import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import { AddCardPanel, CardMark, InvoiceDetailsPanel, MakePaymentPanel, PaidModal, RemoveCardModal } from './PaymentPanels'
import { DollarCircle, Download, Eye, InvoiceIcon, MoneyMark, Plus } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { CARDS } from '../../mock/payments'
import { invoices, paymentStats } from '../../lib/derive'
import { useStudies } from '../../mock/store'
import { useToast } from '../../components/ui/Toast'
import { useSeeded } from '../../mock/seeded'

const GLYPH = [InvoiceIcon, MoneyMark, DollarCircle]

/** A saved card, with its default state and a remove link. */
function CardTile({ c, onRemove }: { c: typeof CARDS[number]; onRemove: () => void }) {
  const toast = useToast()
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      <span className="flex items-center gap-3">
        <CardMark brand={c.brand} />
        <span className="flex flex-col">
          <span className="text-body-medium text-text-title">
            {c.brand} <span className="px-1 text-text-body">&bull;</span> ✱✱✱✱ {c.last4}
          </span>
          <span className="text-text-regular text-text-subtitle">{c.expires}</span>
        </span>
      </span>
      <span className="flex items-center gap-3">
        {c.isDefault
          ? <span className="flex h-9 items-center rounded-sm bg-bg-2 px-3 text-text-regular text-text-disabled">Default</span>
          : <Button variant="tertiary" size="none" className="h-9 px-3" onClick={() => toast('Default card changed')}>Set As Default</Button>}
        <button type="button" onClick={onRemove}
          className="px-2 text-text-regular text-text-title hover:text-brand-primary">Remove</button>
      </span>
    </div>
  )
}

/**
 * Payments (1663:103326 pending, 1663:103525 completed). One page: three
 * figures, the invoice table under a Pending/Completed toggle, and the saved
 * cards below it. The third frame in the section is switched off.
 */
export default function Payments() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const done = params.get('tab') === 'completed'
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const set = (k: string) => { const n = new URLSearchParams(params); n.set('tab', k); setParams(n) }

  const { studies } = useStudies()
  const cards = useSeeded(CARDS)
  const ps = paymentStats(studies)
  const money = (n: number) => `$${n.toLocaleString('en-US')}`
  /** Step 53: one invoice per completed study, pending until it is settled. */
  const rows = invoices(studies).filter((i) => (done ? i.paid : !i.paid))
  const stats = [
    { label: 'Due Payments', value: money(ps.due), suffix: `of ${ps.dueStudies} studies`, tint: true },
    { label: 'All Time Spent', value: money(ps.spent), suffix: `for ${ps.spentStudies} studies` },
    { label: 'Average Study Cost', value: money(ps.average), suffix: `from ${ps.averageStudies} studies` },
  ]

  return (
    <AppShell hideCreate crumbs={[{ label: 'Payments' }]}>
      <div className="min-h-[939px] rounded-lg bg-bg-0 p-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => {
            const Icon = GLYPH[i]
            return (
              <div key={s.label} className={cn('flex h-[93px] items-center gap-4 rounded-lg px-4',
                s.tint ? 'bg-yellow-30' : 'border-1 border-stroke-input')}>
                <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-brand-primary',
                  s.tint ? 'bg-bg-0' : 'bg-bg-1')}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-text-regular text-text-title">{s.label}</span>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-title-l text-text-title">{s.value}</span>
                    <span className="text-text-regular text-text-body">{s.suffix}</span>
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <h2 className="pt-[22px] text-title-s leading-[22px] text-text-title">Invoices</h2>
        <Tabs variant="segmented" className="mt-3 w-[343px] justify-between" value={done ? 'completed' : 'pending'}
          onChange={set} items={[{ key: 'pending', label: 'Pending' }, { key: 'completed', label: 'Completed' }]} />

        <div className="mt-3 overflow-hidden rounded-lg border-1 border-stroke-input">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b-1 border-stroke-input">
                {[['Invoice Number', 'w-[12.5%]'], ['Study Invoice', 'w-[39%]'],
                  [done ? 'Date' : 'Due Date (auto-debit)', 'w-[16%]'], ['Amount', 'w-[13%]'], ['', 'w-[19.5%]']].map(([l, w], i) => (
                  <th key={i} className={cn('h-[52px] px-[16px] text-left text-text-regular font-normal text-text-subtitle', w)}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="h-[70px] px-[16px] text-center text-text-regular text-text-subtitle">
                  {done ? 'Nothing has been settled yet.' : 'Nothing is outstanding.'}
                </td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.number} className="border-b-1 border-stroke-input last:border-b-0">
                  <td className="h-[70px] px-[16px] text-text-regular text-text-subtitle">{r.number}</td>
                  <td className="h-[70px] px-[16px] text-text-regular text-text-title">{r.study}</td>
                  <td className="h-[70px] px-[16px] text-text-regular text-text-title">{r.date}</td>
                  <td className={cn('h-[70px] px-[16px] text-text-title', done ? 'text-body-medium' : 'text-body-regular')}>{money(r.amount)}</td>
                  <td className="h-[70px] px-[16px]">
                    <span className="flex items-center justify-end gap-3">
                      <button type="button" aria-label="Download invoice" onClick={() => toast('Invoice downloaded')}
                        className="flex h-9 w-9 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                        <Download className="h-[18px] w-[18px]" />
                      </button>
                      <button type="button" aria-label="View invoice" onClick={() => setPanel(done ? 'paid' : 'topay')}
                        className="flex h-9 w-9 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                      {!done && (
                        <Button size="none" className="h-9 px-3" onClick={() => setPanel('topay')}>Pay Invoice</Button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="pt-[22px] text-title-s leading-[22px] text-text-title">Saved Payment Methods</h2>
        <div className="grid grid-cols-3 gap-3 pt-3">
          {cards.map((c) => <CardTile key={c.last4} c={c} onRemove={() => setPanel('remove')} />)}
        </div>
        <Button variant="secondary" size="none" className="mt-3 h-10 px-4" leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setPanel('addcard')}>
          Add New Method
        </Button>
      </div>

      <InvoiceDetailsPanel open={panel === 'topay' || panel === 'paid'} paid={panel === 'paid'}
        onClose={() => setPanel('')} onPay={() => setPanel('make')} />
      <MakePaymentPanel open={panel === 'make'} onClose={() => setPanel('')}
        onPaid={() => setPanel('done')} onInvoice={() => setPanel('topay')} />
      <AddCardPanel open={panel === 'addcard'} onClose={() => setPanel('')} />
      <PaidModal open={panel === 'done'} onClose={() => setPanel('')} />
      <RemoveCardModal open={panel === 'remove'} onClose={() => setPanel('')} />
    </AppShell>
  )
}
