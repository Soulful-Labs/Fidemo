import { useNavigate } from 'react-router-dom'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { ChevronUp, DownloadIcon, ExternalIcon } from '../../components/ui/icons'
import { SidePanel } from '../../components/ui/Overlay'
import { useInvoice } from '../../mock/clients'
import { BillLine, Mastercard } from '../studies/review/PaymentRevisions'

const Rule = () => <hr className="border-0 border-t-1 border-stroke-input" />

/**
 * Invoice Details (the 600 panel, 931 tall): the study it bills, its payment
 * state, and the Invoice Breakdown. Paid (2051:130623): "Paid $350
 * successfully!" with the card and time, and Download. To pay (2051:130751):
 * the amount, "Due on ...", "If not paid manually, will be auto-debited from
 * ...", and no footer. Every figure is the study's own bill from the shared
 * platform (mock/money.ts). Read only.
 */
export default function InvoicePanel({ studyId, onClose }: { studyId: string | null; onClose: () => void }) {
  const navigate = useNavigate()
  const inv = useInvoice(studyId ?? undefined)
  const paid = Boolean(inv && inv.b.outstanding <= 0)
  const card = inv?.card
  return (
    <SidePanel open={studyId !== null && Boolean(inv)} onClose={onClose} title={inv ? `Invoice Details (${inv.invoice}) - ${inv.study.title}` : ''}
      footer={paid ? <Button variant="tertiary" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download</Button> : undefined}>
      {inv && (
        <>
          <h3 className="pt-1 text-body-medium leading-[22px] text-text-title">Invoice Number: {inv.invoice}</h3>
          <div className="mt-3 rounded-lg border-1 border-stroke-1 p-4 text-text-regular leading-5">
            <div className="flex items-center justify-between"><StudyTypeTag type={inv.type} className="h-7 px-2.5" />
              <Button variant="tertiary" size="sm" className="h-7 rounded-full px-2.5 text-text-regular text-text-subtitle" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate(`/studies/${inv.study.id}?state=completed`)}>View Study</Button></div>
            <p className="pt-2.5 text-text-medium text-text-title">{inv.study.title}</p>
            <p className="pt-3 text-text-subtitle">{inv.issued}</p>
          </div>
          {paid ? (
            <div className="mt-3 rounded-lg bg-bgAlt-1 p-4 text-text-regular leading-5">
              <p className="text-body-regular leading-[22px] text-state-success">Paid {inv.paidAmount} successfully!</p>
              <p className="flex items-center gap-2 pt-2 text-text-title"><Mastercard />{card?.brand ?? 'Card'}<span aria-hidden="true">•</span>**** {card?.last4 ?? ''}</p><p className="pt-2 text-text-subtitle">{inv.paidAt}</p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-yellow-30 p-4 text-text-regular leading-5">
              <p className="text-body-medium leading-[22px] text-text-title">{inv.outstanding}</p><p className="pt-2 text-brand-primary">Due on {inv.dueBy}</p>
              <p className="flex items-center gap-2 pt-2 text-text-title">If not paid manually, will be auto-debited from<span className="flex h-8 items-center gap-2 rounded-full bg-bgAlt-2 px-3 text-text-subtitle"><Mastercard />{card?.brand ?? 'Card'}<span aria-hidden="true">•</span>**** {card?.last4 ?? ''}</span></p>
            </div>
          )}
          <section className="mb-5 mt-3 overflow-hidden rounded-lg border-1 border-stroke-1">
            <h4 className="flex h-11 items-center justify-between bg-bg-1 px-4 text-text-medium text-text-title">Invoice Breakdown<ChevronUp className="h-5 w-5" /></h4>
            <div className="flex flex-col gap-3 p-4">
              {inv.lines.map((line, i) => <div key={line.label} className="flex flex-col gap-3">{i > 0 && <Rule />}<BillLine line={line} /></div>)}
              <Rule /><BillLine line={{ label: 'Total cost', amount: inv.total }} /><BillLine line={inv.depositLine} />
              <Rule /><p className="flex justify-between text-body-regular text-text-title"><span>{paid ? 'Net Total Paid' : 'Net payable cost'}</span><span>{inv.net}</span></p>
            </div>
          </section>
        </>
      )}
    </SidePanel>
  )
}
