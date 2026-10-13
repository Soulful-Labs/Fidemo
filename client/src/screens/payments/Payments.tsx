import { useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import { AddCardPanel, CardMark, InvoiceDetailsPanel, MakePaymentPanel, PaidModal, RemoveCardModal } from './PaymentPanels'
import { DollarCircle, Download, Eye, InvoiceIcon, MoneyMark, Plus } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { invoices, paymentStats } from '@shared/derive'
import { money, monthDayYear } from '@shared/format'
import { useStudies } from '../../platform'
import { useToast } from '../../components/ui/Toast'
import { PaidAllModal, PayAllPanel, dueOn } from './PayAll'
import type { Invoice } from '@shared/derive'
import type { ClientStudy } from '../../platform'
import { compactMoney } from '../../lib/insight'
import { useWorkspace } from '../../mock/workspace'
import type { SavedCard } from '../../mock/workspace'

const GLYPH = [InvoiceIcon, MoneyMark, DollarCircle]

/** A saved card, with its default state and a remove link. */
function CardTile({ c, onRemove, onDefault }: { c: SavedCard; onRemove: () => void; onDefault: () => void }) {
  return (
    <div className="flex h-[132px] flex-col justify-between rounded-lg bg-bg-1 p-4">
      <span className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-0"><CardMark brand={c.brand} /></span>
        <span className="flex flex-col gap-0.5 pl-2">
          <span className="text-body-regular text-text-title">
            {c.brand} <span className="px-1.5">&bull;</span> **** {c.last4}
          </span>
          <span className="text-text-regular text-text-subtitle">{c.expires}</span>
        </span>
      </span>
      <span className="flex items-center gap-3">
        {c.isDefault
          ? <span className="flex h-[38px] items-center rounded-md border-1 border-stroke-input px-3 text-text-regular text-text-disabled">Default</span>
          : <Button variant="tertiary" size="row" className="px-3" onClick={onDefault}>Set As Default</Button>}
        <button type="button" onClick={onRemove}
          className="px-2 text-text-regular text-text-title hover:text-brand-primary">Remove</button>
      </span>
    </div>
  )
}

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="m10.5 4 1.9 4.6L17 10.5l-4.6 1.9L10.5 17l-1.9-4.6L4 10.5l4.6-1.9L10.5 4Zm8 9.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

/** What was actually taken in each of the last six months: deposits and balances, less refunds, off the studies' own payments. */
function spendByMonth(studies: ClientStudy[], now: Date = new Date()) {
  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1))
  return months.map((m) => ({
    label: m.toLocaleDateString('en-US', { month: 'short' }),
    total: studies.flatMap((s) => s.payments).filter((p) => { const d = new Date(p.at); return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth() })
      .reduce((n, p) => n + (p.kind === 'refund' ? -p.amount : p.amount), 0),
  }))
}

/** Spend By Month: six bars against four grid lines, each bar carrying its own figure. */
function SpendChart({ data }: { data: { label: string; total: number }[] }) {
  const peak = Math.max(...data.map((d) => d.total), 1)
  const step = [1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000, 250_000].find((x) => x * 4 >= peak) ?? Math.ceil(peak / 4)
  const top = step * 4
  const H = 188
  return (
    <div className="relative mt-[22px] h-[212px] pl-[42px]" role="img" aria-label={`Spend by month: ${data.map((d) => `${d.label} ${money(d.total)}`).join(', ')}`}>
      {[4, 3, 2, 1, 0].map((n) => (
        <span key={n} className="absolute left-0 right-0 flex items-center" style={{ top: (1 - n / 4) * H - 8 }}>
          <span className="w-[34px] text-right text-label text-text-subtitle">{n === 0 ? '0' : compactMoney(step * n)}</span>
          <span className={cn('ml-2 flex-1 border-t-1', n === 0 ? 'border-stroke-input' : 'border-dashed border-stroke-input')} />
        </span>
      ))}
      <div className="absolute bottom-0 left-[42px] right-0 top-0 flex justify-around">
        {data.map((d) => (
          <div key={d.label} className="relative flex w-[52px] flex-col items-center">
            <div className="flex w-full flex-col justify-end" style={{ height: H }}>
              <span className="pb-1.5 text-center text-label text-text-body">{d.total > 0 ? money(d.total) : ''}</span>
              {/* The export draws each bar as a stack of fine stripes. */}
              <span className="w-full" style={{ height: Math.round((Math.max(0, d.total) / top) * H), backgroundImage: 'repeating-linear-gradient(to bottom, #fdb541 0 2px, transparent 2px 3.5px)' }} />
            </div>
            <span className="pt-2 text-label text-text-subtitle">{d.label}</span>
          </div>
        ))}
      </div>
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
  const { pathname } = useLocation()
  // /payments/history is this page with the toggle on Completed; the saved
  // cards sit on the same page, so /payments/methods is this page too.
  const done = params.get('tab') === 'completed' || pathname === '/payments/history'
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const [removing, setRemoving] = useState<string | null>(null)
  const [paying, setPaying] = useState<string | null>(null)
  const [paidAll, setPaidAll] = useState<Invoice[] | null>(null)
  /** `?panel=paidall` opens the success dialog over the pending invoices, so it can be compared with its export. */
  const preview = params.get('panel') === 'paidall'
  const set = (k: string) => { const n = new URLSearchParams(params); n.set('tab', k); setParams(n) }

  const { studies } = useStudies()
  const { cards, removeCard, setDefaultCard, payInvoice } = useWorkspace()
  /** Step 53: one invoice per completed study, pending until its study no longer owes. */
  const all = invoices(studies)
  const ps = paymentStats(studies)
  const rows = all.filter((i) => (done ? i.paid : !i.paid))
  const open = all.find((r) => r.number === paying)
  const pending = all.filter((i) => !i.paid)
  const owed = pending.reduce((n, i) => n + i.amount, 0)
  const spend = spendByMonth(studies)
  const soonest = pending.map((i) => new Date(dueOn(i)).getTime()).sort((a, b) => a - b)[0]
  const days = soonest === undefined ? 0 : Math.ceil((soonest - Date.now()) / 86_400_000)
  const stats = [
    { label: 'Due Payments', value: money(ps.due), suffix: `of ${ps.dueStudies} studies`, tint: true },
    { label: 'All Time Spent', value: money(ps.spent), suffix: `for ${ps.spentStudies} studies` },
    { label: 'Average Study Cost', value: money(ps.average), suffix: `from ${ps.averageStudies} studies` },
  ]

  return (
    <AppShell hideCreate crumbs={[{ label: 'Payments' }]}>
      <div className="min-h-[1216px] rounded-lg bg-bg-0 p-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => {
            const Icon = GLYPH[i]
            return (
              <div key={s.label} className={cn('flex h-[88px] items-center gap-3 rounded-lg px-4',
                s.tint ? 'bg-yellow-30' : 'border-1 border-stroke-1')}>
                <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-brand-primary',
                  s.tint ? 'bg-bg-0' : 'bg-bg-1')}>
                  <Icon className="h-7 w-7" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-text-regular text-text-title">{s.label}</span>
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-title-l leading-7 text-text-title">{s.value}</span>
                    <span className="text-text-regular text-text-subtitle">{s.suffix}</span>
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <div className="grid h-[291px] grid-cols-2 gap-4 pt-6" style={{ height: 315 }}>
          <section className="rounded-lg border-1 border-stroke-1 px-4 pt-[15px]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-title-s text-text-title">Spend By Month</h2>
              <span className="text-body-regular text-text-body">{money(spend.reduce((n, m) => n + m.total, 0))} in last 6 months</span>
            </div>
            <SpendChart data={spend} />
          </section>
          <section className="flex flex-col rounded-lg bg-gradient-to-b from-green-50 to-bgAlt-1 px-4 pt-[17px]">
            <h2 className="flex items-center gap-2 text-title-s font-normal text-brand-secondary">{SPARKLE}Super Insight</h2>
            {/* Said from the invoices themselves: how many are pending, what they come to and when the first falls due. */}
            <p className="max-w-[480px] pt-[19px] text-title-s leading-[25px] text-text-title">
              {pending.length === 0 ? 'Nothing is due. Every completed study is settled.'
                : `${pending.length} ${pending.length === 1 ? 'invoice is' : 'invoices are'} pending, ${money(owed)} in all. ${days > 0 ? `The first falls due in ${days} day${days === 1 ? '' : 's'}.` : 'The first is already due.'}`}
            </p>
            <p className="pt-[11px] text-body-regular text-text-subtitle">
              {pending.length === 0 ? 'An invoice is raised when a study is completed.' : 'Each invoice is the balance on a completed study. They can be paid one at a time, or together.'}
            </p>
            {pending.length > 0 && (
              <span className="pt-[15px]">
                <Button variant="secondary" size="none" className="h-12 px-5 text-body-medium" onClick={() => setPanel('payall')}
                  leftIcon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3 10.5h18M7 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}>
                  Pay All Invoices At Once
                </Button>
              </span>
            )}
          </section>
        </div>

        <div className="flex items-end justify-between pt-[25px]">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-title-s text-text-title">Invoices</h2>
            <p className="text-text-regular text-text-subtitle">
              {pending.length} pending invoice{pending.length === 1 ? '' : 's'}, due a week after the study is completed
            </p>
          </div>
          <Tabs variant="segmented" className="w-[220px]" value={done ? 'completed' : 'pending'}
            onChange={set} items={[{ key: 'pending', label: 'Pending' }, { key: 'completed', label: 'Completed' }]} />
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border-1 border-stroke-1">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b-1 border-stroke-1 bg-bg-1">
                {/* The export heads this "Due Date (auto-debit)". Nothing debits a card on its own, so the column says only what it is. */}
                {[['Invoice Number', 'w-[12.2%]'], ['Study Invoice', 'w-[39.1%]'],
                  [done ? 'Date' : 'Due Date', 'w-[15.6%]'], ['Amount', 'w-[11%]'], ['', 'w-[22.1%]']].map(([l, w], i) => (
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
                <tr key={r.number} className="border-b-1 border-stroke-1 last:border-b-0">
                  <td className="h-[70px] px-[16px] text-text-regular text-text-subtitle">{r.number}</td>
                  <td className="h-[70px] px-[16px] text-text-regular text-text-title">{r.study}</td>
                  <td className="h-[70px] px-[16px] text-text-regular text-text-title">{done ? monthDayYear(r.paidAt ?? r.date) : monthDayYear(dueOn(r))}</td>
                  <td className={cn('h-[70px] px-[16px] text-text-title', done ? 'text-body-medium' : 'text-body-regular')}>{money(r.amount)}</td>
                  <td className="h-[70px] px-[16px]">
                    <span className="flex items-center justify-end gap-3">
                      <button type="button" aria-label="Download invoice" onClick={() => toast('Invoice downloaded')}
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-1 border-stroke-input text-text-title hover:bg-bg-1">
                        <Download className="h-5 w-5" />
                      </button>
                      <button type="button" aria-label="View invoice" onClick={() => { setPaying(r.number); setPanel(done ? 'paid' : 'topay') }}
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-1 border-stroke-input text-text-title hover:bg-bg-1">
                        <Eye className="h-5 w-5" />
                      </button>
                      {!done && (
                        <Button size="row" className="px-3" onClick={() => { setPaying(r.number); setPanel('topay') }}>Pay Invoice</Button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="pt-[26px] text-title-s text-text-title">Saved Payment Methods</h2>
        <div className="grid grid-cols-[377px_377px_1fr] gap-[9px] pt-3">
          {cards.length === 0 && (
            <p className="col-span-2 py-6 text-text-regular text-text-subtitle">No card is on file yet.</p>
          )}
          {cards.map((c) => <CardTile key={c.last4} c={c} onDefault={() => setDefaultCard(c.last4)}
            onRemove={() => setRemoving(c.last4)} />)}
        </div>
        <Button variant="secondary" size="row" className="mt-3 px-3" leftIcon={<Plus className="h-5 w-5" />}
          onClick={() => setPanel('addcard')}>
          Add New Method
        </Button>
      </div>

      <InvoiceDetailsPanel open={panel === 'topay' || panel === 'paid'} paid={panel === 'paid'}
        onClose={() => setPanel('')} onPay={() => setPanel('make')}
        studyId={open?.studyId} />
      <MakePaymentPanel open={panel === 'make'} onClose={() => setPanel('')} studyId={open?.studyId}
        onPaid={() => { if (paying) payInvoice(paying); setPanel('done') }}
        onInvoice={() => setPanel('topay')} />
      <AddCardPanel open={panel === 'addcard'} onClose={() => setPanel('')} />
      <PayAllPanel open={panel === 'payall'} invoices={pending} onClose={() => setPanel('')} onPaid={(paid) => { setPaidAll(paid); setPanel('') }} />
      <PaidAllModal open={paidAll !== null || (preview && panel === 'paidall')} paid={paidAll ?? pending} onClose={() => { setPaidAll(null); setPanel('') }} />
      <PaidModal open={panel === 'done'} studyId={open?.studyId} onClose={() => { setPanel(''); setPaying(null) }} />
      <RemoveCardModal open={removing !== null} onClose={() => setRemoving(null)}
        last4={removing ?? ''}
        onConfirm={() => { if (removing) removeCard(removing); setRemoving(null) }} />
    </AppShell>
  )
}
