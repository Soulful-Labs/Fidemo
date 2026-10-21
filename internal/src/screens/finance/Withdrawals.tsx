import { withdrawals } from '@shared/derive'
import type { WithdrawalRow } from '@shared/derive'
import { dayMonthYear, money } from '@shared/format'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from '../../components/ui/icons'
import Table from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { Avatar } from '../../components/ui/Tag'
import { photoFor } from '../../mock/participants'
import { usePlatform } from '../../platform'

/** "**** 1234  •  American Bank": the last four digits and the bank, as the queue draws them. */
export const toAccount = (r: WithdrawalRow) => `**** ${r.payout.destination.replace(/\D/g, '').slice(-4)}  •  ${r.method?.bankName ?? 'Bank'}`

const columns: Column<WithdrawalRow>[] = [
  { key: 'p', header: 'Participant', width: 200, render: (r) => <span className="flex items-center gap-2"><Avatar src={photoFor(r.person)} name={r.person.name} size={24} /><span className="truncate">{r.person.name}</span></span> },
  { key: 'd', header: 'Date', width: 130, sortable: true, render: (r) => dayMonthYear(r.payout.at) },
  { key: 'ref', header: 'Reference ID', width: 130, render: (r) => r.payout.txId },
  { key: 'to', header: 'To Bank Account', width: '1fr', render: (r) => toAccount(r) },
  { key: 'amt', header: 'Withdrawal Payout', width: 160, sortable: true, render: (r) => money(r.payout.amount) },
  { key: 'x', header: '', width: 84, render: () => <span className="flex items-center justify-end gap-1 text-text-medium text-brand-primary">Review<ChevronRight className="h-4 w-4" /></span> },
]

/**
 * Pending Payouts Confirmations (2317:159697): every withdrawal participants
 * have asked for and the team has not yet released, oldest first, with the
 * count and the total. A row opens it to release (2317:160127).
 */
export default function Withdrawals() {
  const navigate = useNavigate()
  const rows = withdrawals(usePlatform(), 'pending')
  const total = rows.reduce((s, r) => s + r.payout.amount, 0)
  return (
    <>
      <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Pending Payouts Confirmations</h2>
      <p className="pt-1 text-text-regular leading-5 text-text-body">Confirm the pending payout transactions to participant for withdrawals</p>
      <div className="mt-3 flex h-[84px] items-center justify-between rounded-lg border-1 border-stroke-1 bg-bg-1 px-4">
        <div><p className="text-text-regular text-text-title">Payouts Pending</p><p className="pt-1 text-title-l text-brand-secondary">{rows.length}</p></div>
        <div className="text-right"><p className="text-text-regular text-text-title">Total withdrawal payouts value</p><p className="pt-1 text-title-l text-brand-secondary">{money(total)}</p></div>
      </div>
      <Table empty="Withdrawals participants ask for will appear here to be released." className="mt-4" rowHeight={56} rows={rows}
        rowKey={(r) => r.payout.id} columns={columns} onRowClick={(r) => navigate(`/finance/payouts/${r.person.id}/${r.payout.id}`)} />
    </>
  )
}
