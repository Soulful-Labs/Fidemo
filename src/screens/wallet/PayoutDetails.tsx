import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import Button from '../../components/ui/Button'
import TopBar from '../../components/ui/TopBar'
import { dateLong, dateTime, money } from '../../lib/format'
import { useStore } from '../../mock/store'
import { Breakdown, KeyValue, StatusChip } from './bits'

function Download() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** PRD 10.1 Payout Details, Figma 969:29192. Download Receipt PDF toasts, no file. */
export default function PayoutDetails() {
  const { payoutId } = useParams()
  const navigate = useNavigate()
  const { payouts, toast } = useStore()
  const payout = payouts.find((p) => p.id === payoutId)

  if (!payout) {
    return <EmptyState title="Payout not found" actionLabel="Back to Payouts" onAction={() => navigate('/wallet/payouts')} />
  }

  const expected = payout.expectedBy ?? new Date(new Date(payout.at).getTime() + 2 * 86_400_000).toISOString()

  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Payout Details" onBack={() => navigate('/wallet/payouts')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <h1 className="text-title-s text-text-title">Bank Transfer {payout.destination.slice(-4)}</h1>

        <div className="grid grid-cols-2 gap-4">
          <KeyValue label="Withdrawal Amount" value={money(payout.amount)} />
          <KeyValue label="Date" value={dateTime(payout.at)} />
          <KeyValue label="Transaction ID" value={payout.txId} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-text-regular text-text-body">Status</span>
          <span className="self-start"><StatusChip status={payout.status} /></span>
          {payout.status === 'processing' && (
            <p className="rounded-md bg-yellow-1000/50 px-3 py-2 text-text-regular text-text-title">
              Expected in bank by <span className="text-text-medium">{dateLong(expected)}</span>
            </p>
          )}
        </div>

        <Breakdown title="Payout Breakdown" amount={payout.amount} fee={payout.fee} net={payout.net} lastLabel="Receivable Amount" />

        <Button variant="tertiary" fullWidth leftIcon={<Download />} onClick={() => toast('Receipt downloaded')}>
          Download Receipt PDF
        </Button>
      </div>
    </div>
  )
}
