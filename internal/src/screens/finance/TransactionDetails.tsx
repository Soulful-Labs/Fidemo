import { useNavigate } from 'react-router-dom'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { DownloadIcon, ExternalIcon } from '../../components/ui/icons'
import { SidePanel } from '../../components/ui/Overlay'
import { useLedgerRow } from '../../mock/finance'

export type DetailKind = 'earning' | 'payouts' | 'payments'
const LABEL = { earning: ['Participant Earning', 'Paid To'], payouts: ['Participant Payouts', 'Paid To'], payments: ['Study Payment', 'Received From'] }

/**
 * Transaction Details (the 600 panel): Participant Earning (2051:171000), a
 * payout (2051:171394), a Study Payment (2051:171506). Who was paid or who
 * paid, $350, when, the transaction id; the study it belongs to (or the bank
 * withdrawal); Download. Read only. Every one draws the same $350, person and
 * id, as drawn.
 */
export default function TransactionDetails({ kind, id, onClose }: { kind: DetailKind | null; id?: string; onClose: () => void }) {
  const navigate = useNavigate()
  const t = useLedgerRow(id)
  const party = kind === 'payments' ? t?.row.from : t?.row.to
  const [title, partyLabel] = LABEL[kind ?? 'earning']
  const study = (
    <div className="mt-3 flex items-center justify-between rounded-lg border-1 border-stroke-1 p-3 text-text-regular">
      <div><p className="text-text-title">{kind === 'payments' ? `For ${t?.study?.title ?? ''}` : t?.study?.title}</p>{t?.type && <StudyTypeTag type={t.type} className="mt-2 h-7 px-2.5 text-text-body" />}</div>
      <Button variant="tertiary" size="sm" className="rounded-sm px-2.5 text-text-regular" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => t?.study && navigate(`/studies/${t.study.id}`)}>View Study</Button>
    </div>
  )
  return (
    <SidePanel open={kind !== null} onClose={onClose} title="Transaction Details" footer={<Button variant="tertiary" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download</Button>}>
      <h3 className="text-body-regular text-text-subtitle">{title}</h3>
      <div className="mt-3 rounded-lg bg-bgAlt-1 p-3 text-text-regular leading-5">
        <p className="text-text-subtitle">{partyLabel}</p>
        <p className="flex items-center justify-between pt-2"><span className="flex h-8 items-center gap-2 rounded-full bg-bgAlt-2 px-3 text-text-title"><img src="/img/verifications/robert.png" alt="" className="h-4 w-4 rounded-full" />{party}<ExternalIcon className="h-4 w-4 text-text-subtitle" /></span><span className="text-body-medium text-state-success">$350</span></p>
        <p className="pt-2 text-title-s text-text-title">{t?.amount}</p><p className="pt-2 text-text-title">{t?.at}</p>
        <hr className="my-3 border-0 border-t-1 border-stroke-1" />
        <p className="text-text-subtitle">Transaction ID</p><p className="pt-1 text-body-regular text-text-title">{t?.row.reference}</p>
        {kind === 'payments' && <><p className="pt-3 text-text-subtitle">Payment Method</p><p className="pt-1 text-body-regular text-text-title">{t?.card?.brand ?? 'Card'} &nbsp;•&nbsp; **** {t?.card?.last4 ?? ''}</p></>}
      </div>
      {kind === 'payouts' ? <p className="mt-3 rounded-lg border-1 border-stroke-1 p-3 text-text-regular text-text-title">{t?.row.title}</p> : study}
      <div className="h-1" />
    </SidePanel>
  )
}
