import { useNavigate } from 'react-router-dom'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { ChevronUp, DownloadIcon, ExternalIcon } from '../../components/ui/icons'
import { SidePanel } from '../../components/ui/Overlay'
import { FEES } from '../studies/manage/PayTab'
import { BillLine, Mastercard } from '../studies/review/PaymentRevisions'

const Rule = () => <hr className="border-0 border-t-1 border-stroke-input" />

/**
 * Invoice Details (the 600 panel, 931 tall): the study it bills, its payment
 * state, and the Invoice Breakdown. Paid (2051:130623): "Paid $350
 * successfully!" with the card and time, and Download. To pay (2051:130751):
 * "$350 / Due on Aug 10, 2026 / If not paid manually, will be auto-debited
 * from ..." and no footer. Both are titled "Mobile App Usability Testing";
 * the to-pay one names a different study in its body, as drawn. Read only.
 */
export default function InvoicePanel({ kind, onClose }: { kind: 'paid' | 'due' | null; onClose: () => void }) {
  const navigate = useNavigate()
  const paid = kind === 'paid'
  return (
    <SidePanel open={kind !== null} onClose={onClose} title="Invoice Details (INV-1024366) - Mobile App Usability Testing"
      footer={paid ? <Button variant="tertiary" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download</Button> : undefined}>
      <h3 className="pt-1 text-body-medium leading-[22px] text-text-title">Invoice Number: INV-1024366</h3>
      <div className="mt-3 rounded-lg border-1 border-stroke-1 p-4 text-text-regular leading-5">
        <div className="flex items-center justify-between"><StudyTypeTag type="diary" className="h-7 px-2.5" />
          <Button variant="tertiary" size="sm" className="h-7 rounded-full px-2.5 text-text-regular text-text-subtitle" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate('/studies/st-pay')}>View Study</Button></div>
        <p className="pt-2.5 text-text-medium text-text-title">{paid ? 'Mobile App Usability Testing' : 'How do you make your digital payments mostly?'}</p>
        <p className="pt-3 text-text-subtitle">Marked completed and invoice issued on 10 August, 2026, 10:00 PM</p>
      </div>
      {paid ? (
        <div className="mt-3 rounded-lg bg-bgAlt-1 p-4 text-text-regular leading-5">
          <p className="text-body-regular leading-[22px] text-state-success">Paid $350 successfully!</p>
          <p className="flex items-center gap-2 pt-2 text-text-title"><Mastercard />Mastercard<span aria-hidden="true">•</span>**** 4242</p><p className="pt-2 text-text-subtitle">Aug 6, 2026, 04:36 PM</p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-yellow-30 p-4 text-text-regular leading-5">
          <p className="text-body-medium leading-[22px] text-text-title">$350</p><p className="pt-2 text-brand-primary">Due on Aug 10, 2026</p>
          <p className="flex items-center gap-2 pt-2 text-text-title">If not paid manually, will be auto-debited from<span className="flex h-8 items-center gap-2 rounded-full bg-bgAlt-2 px-3 text-text-subtitle"><Mastercard />Mastercard<span aria-hidden="true">•</span><span className="text-text-title">•••• 4242</span></span></p>
        </div>
      )}
      <section className="mb-5 mt-3 overflow-hidden rounded-lg border-1 border-stroke-1">
        <h4 className="flex h-11 items-center justify-between bg-bg-1 px-4 text-text-medium text-text-title">Invoice Breakdown<ChevronUp className="h-5 w-5" /></h4>
        <div className="flex flex-col gap-3 p-4">
          {FEES.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
          <Rule /><BillLine line={{ label: 'Total cost', amount: '$3,350' }} /><BillLine line={{ label: 'Less: Incentive Deposit', detail: '$100 x 30 participants', amount: '-$3000', info: true }} />
          <Rule /><p className="flex justify-between text-body-regular text-text-title"><span>Net Total Paid</span><span>$350</span></p>
        </div>
      </section>
    </SidePanel>
  )
}
