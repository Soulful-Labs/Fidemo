import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { payoutsToProcess, personById } from '@shared/derive'
import { ago, money, monthDayYear } from '@shared/format'
import { platform } from '@shared/store'
import Button from '../../components/ui/Button'
import { Modal } from '../../components/ui/Overlay'
import Table from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { notice } from '../../components/app/Notice'
import { TEAM, say, usePlatform } from '../../platform'

type Row = ReturnType<typeof payoutsToProcess>[number]

/**
 * Payouts (`/finance/payouts`). Not drawn in the exports. Nothing on the
 * platform pays a participant automatically: when a study finishes, the team
 * is notified that its payouts are ready, and processes them here by hand.
 * Process Payouts asks first, then pays everyone who completed, except a
 * session without a code confirmed on both sides ("no code, no payment"),
 * who stays on the list. The team can supply the client's half of the code
 * there, from the session's PIN, as it can on the session page.
 */
export default function Payouts() {
  const state = usePlatform()
  const navigate = useNavigate()
  const rows = payoutsToProcess(state)
  const [askingId, setAskingId] = useState<string | null>(null)
  /** Read fresh each render, so a code confirmed in the dialog moves that person to paid-ready at once. */
  const asking = rows.find((r) => r.study.id === askingId) ?? null
  const setAsking = (r: Row | null) => setAskingId(r?.study.id ?? null)
  const total = rows.reduce((n, r) => n + r.amount, 0)

  const process = () => {
    if (!asking) return
    const res = platform().processPayouts(asking.study.id, TEAM)
    if (say(res) && res.ok) notice(`${res.paid} payout${res.paid === 1 ? '' : 's'} processed for ${asking.study.title}.${res.held ? ` ${res.held} held: no code, no payment.` : ''}`)
    setAsking(null)
  }

  const cols: Column<Row>[] = [
    { key: 'f', header: 'Finished', width: 130, render: (r) => monthDayYear(r.study.completedAt) },
    { key: 's', header: 'Study', width: '1fr', render: (r) => <button type="button" className="truncate text-left hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/studies/${r.study.id}`) }}>{r.study.title}</button> },
    { key: 'c', header: 'Client', width: 170, render: (r) => r.client?.company ?? '' },
    { key: 'p', header: 'To pay', width: 90, render: (r) => String(r.ready.length) },
    { key: 'h', header: 'Held', width: 80, render: (r) => (r.owed.length - r.ready.length ? <span title="No code, no payment">{r.owed.length - r.ready.length}</span> : '0') },
    { key: 'a', header: 'Amount', width: 110, render: (r) => money(r.amount) },
    { key: 'x', header: '', width: 160, render: (r) => <Button size="md" className="px-3" disabled={r.owed.length === 0} onClick={(e) => { e.stopPropagation(); setAsking(r) }}>Process Payouts</Button> },
  ]

  return (
    <>
      <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Payouts to Process</h2>
      <p className="pt-1 text-text-regular leading-5 text-text-body">Studies that have finished. Nothing is paid automatically: process each study&rsquo;s payouts here once you have checked them.</p>
      <div className="mt-3 flex h-[84px] items-center justify-between rounded-lg border-1 border-stroke-1 bg-bgAlt-1 px-4">
        <div><p className="text-text-regular text-text-title">Studies waiting</p><p className="pt-1 text-title-l text-text-title">{rows.length}</p></div>
        <div className="text-right"><p className="text-text-regular text-text-title">Ready to pay out</p><p className="pt-1 text-title-l text-text-title">{money(total)}</p></div>
      </div>
      <Table empty="When a study finishes, its participants' payouts will appear here to be processed." className="mt-4" rowHeight={56} rows={rows} rowKey={(r) => r.study.id} columns={cols} />

      <Modal open={asking !== null} onClose={() => setAsking(null)} layout="titled" title="Process Payouts?"
        footer={<><Button variant="tertiary" onClick={() => setAsking(null)}>Cancel</Button><Button disabled={(asking?.ready.length ?? 0) === 0} onClick={process}>Process {asking?.ready.length ?? 0} &middot; {money(asking?.amount ?? 0)}</Button></>}>
        {asking && (
          <div className="flex flex-col gap-3 text-text-regular leading-5 text-text-title">
            <p>{asking.study.title} finished {ago(asking.study.completedAt, new Date())}. These participants will be paid {money(asking.study.rates.incentivePer)} each, into their wallets, now.</p>
            <ul className="flex max-h-[220px] flex-col gap-1 overflow-y-auto rounded-md bg-bg-1 p-3">
              {asking.owed.map((p) => {
                const held = !asking.ready.includes(p)
                return (
                  <li key={p.personId} className="flex items-center justify-between gap-3">
                    <span>{personById(state, p.personId)?.name ?? p.personId}</span>
                    {held && p.code ? (
                      <span className="flex items-center gap-2 text-text-subtitle">Held: no code, no payment
                        <Button variant="tertiary" size="sm" className="px-2" onClick={() => say(platform().enterClientCode(asking.study.id, p.personId, p.code!.value))}>Confirm code {p.code.value}</Button>
                      </span>
                    ) : <span className={held ? 'text-text-subtitle' : ''}>{held ? 'Held: no code, no payment' : money(asking.study.rates.incentivePer)}</span>}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </Modal>
    </>
  )
}
