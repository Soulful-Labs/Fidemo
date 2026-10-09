import { useNavigate } from 'react-router-dom'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { DownloadIcon, ExternalIcon } from '../../components/ui/icons'
import { SidePanel } from '../../components/ui/Overlay'

export type DetailKind = 'earning' | 'payouts' | 'payments'
const LABEL = { earning: ['Participant Earning', 'Paid To'], payouts: ['Participant Payouts', 'Paid To'], payments: ['Study Payment', 'Received From'] }

/**
 * Transaction Details (the 600 panel): Participant Earning (2051:171000), a
 * payout (2051:171394), a Study Payment (2051:171506). Who was paid or who
 * paid, $350, when, the transaction id; the study it belongs to (or the bank
 * withdrawal); Download. Read only. Every one draws the same $350, person and
 * id, as drawn.
 */
export default function TransactionDetails({ kind, onClose }: { kind: DetailKind | null; onClose: () => void }) {
  const navigate = useNavigate()
  const [title, party] = LABEL[kind ?? 'earning']
  const study = (
    <div className="mt-3 flex items-center justify-between rounded-lg border-1 border-stroke-1 p-3 text-text-regular">
      <div><p className="text-text-title">{kind === 'payments' ? 'For About goal-tracking methods' : 'About goal-tracking methods'}</p><StudyTypeTag type="diary" className="mt-2 h-7 px-2.5 text-text-body" /></div>
      <Button variant="tertiary" size="sm" className="rounded-sm px-2.5 text-text-regular" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate('/studies/st-goal')}>View Study</Button>
    </div>
  )
  return (
    <SidePanel open={kind !== null} onClose={onClose} title="Transaction Details" footer={<Button variant="tertiary" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download</Button>}>
      <h3 className="text-body-regular text-text-subtitle">{title}</h3>
      <div className="mt-3 rounded-lg bg-bgAlt-1 p-3 text-text-regular leading-5">
        <p className="text-text-subtitle">{party}</p>
        <p className="flex items-center justify-between pt-2"><span className="flex h-8 items-center gap-2 rounded-full bg-bgAlt-2 px-3 text-text-title"><img src="/img/verifications/robert.png" alt="" className="h-4 w-4 rounded-full" />Jennifer Winter<ExternalIcon className="h-4 w-4 text-text-subtitle" /></span><span className="text-body-medium text-state-success">$350</span></p>
        <p className="pt-2 text-text-title">Aug 6, 2026, 04:36 PM</p>
        <hr className="my-3 border-0 border-t-1 border-stroke-1" />
        <p className="text-text-subtitle">Transaction ID</p><p className="pt-1 text-body-regular text-text-title">#2356897120</p>
        {kind === 'payments' && <><p className="pt-3 text-text-subtitle">Payment Method</p><p className="pt-1 text-body-regular text-text-title">Visa Card &nbsp;•&nbsp; **** 4242</p></>}
      </div>
      {kind === 'payouts' ? <p className="mt-3 rounded-lg border-1 border-stroke-1 p-3 text-text-regular text-text-title">Bank Withdrawal To **** 1263</p> : study}
      <div className="h-1" />
    </SidePanel>
  )
}
