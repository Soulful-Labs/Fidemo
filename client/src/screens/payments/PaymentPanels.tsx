import SidePanel from '../../components/ui/SidePanel'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { Check, ChevronDown, ChevronRight, DiaryBookIcon, Download, Info, LinkIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { BILLING, BILLING_TOTAL } from '../../mock/pay'
import { ADD_CARD, INVOICE, MAKE_PAYMENT, PAID_MODAL, REMOVE_CARD } from '../../mock/payments'
import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'
import { useWorkspace } from '../../mock/workspace'

/** The card brand mark, as the payment rows draw it. */
export function CardMark({ brand = 'Mastercard' }: { brand?: string }) {
  return (
    <span className="flex h-5 w-[26px] shrink-0 items-center justify-center" aria-hidden="true">
      {brand === 'VISA' ? (
        <svg viewBox="0 0 26 10" width="26" height="10">
          <text x="13" y="9" textAnchor="middle" fontSize="10" fontWeight="700" fontStyle="italic" fill="#1a1f71">VISA</text>
        </svg>
      ) : (
        <svg viewBox="0 0 26 16" width="26" height="16">
          <circle cx="10" cy="8" r="7" fill="#eb001b" />
          <circle cx="16" cy="8" r="7" fill="#f79e1b" fillOpacity=".85" />
        </svg>
      )}
    </span>
  )
}

/**
 * Invoice Details (1664:127262 to pay, 1663:103948 paid). One panel: the
 * money block turns from a warm due notice into a green receipt, and the
 * footer from Make Payment into Download.
 */
export function InvoiceDetailsPanel({
  open, onClose, paid, onPay,
}: { open: boolean; onClose: () => void; paid?: boolean; onPay?: () => void }) {
  const toast = useToast()
  return (
    <SidePanel open={open} onClose={onClose} title={INVOICE.title} headerClassName="h-14"
      className="h-fit max-h-full" bodyClassName="flex flex-col gap-3 px-4 pb-4 pt-4"
      footer={paid
        ? <Button variant="tertiary" fullWidth size="none" className="h-12 text-body-medium" onClick={() => toast('Invoice downloaded')} leftIcon={<Download className="h-4 w-4" />}>Download</Button>
        : <Button fullWidth size="none" className="h-12 text-body-medium" onClick={onPay}>Make Payment</Button>}>
      <p className="text-body-medium text-text-title">{INVOICE.number}</p>

      <div className="flex flex-col gap-2 rounded-lg border-1 border-stroke-input p-4">
        <span className="flex items-center justify-between gap-3">
          <StudyTypeTag type="diary" icon={<DiaryBookIcon className="h-4 w-4" />} />
          <button type="button" onClick={() => toast('Opening the study')} className="inline-flex items-center gap-2 rounded-full border-1 border-stroke-input px-3 py-1.5 text-text-regular text-text-title">
            <LinkIcon className="h-4 w-4 text-text-subtitle" />View Study
          </button>
        </span>
        <p className="text-body-medium text-text-title">{paid ? INVOICE.paidStudy : INVOICE.study}</p>
        <p className="text-text-regular text-text-subtitle">{INVOICE.issued}</p>
      </div>

      <div className={cn('flex flex-col gap-2 rounded-lg p-4', paid ? 'bg-bgAlt-1' : 'bg-yellow-30')}>
        {paid ? (
          <>
            <p className="text-body-large text-brand-secondary">{INVOICE.paidTitle}</p>
            <p className="flex items-center gap-2 text-body-medium text-text-title">
              <CardMark />Mastercard <span className="text-text-body">&bull;</span> •••• 4242
            </p>
            <p className="text-text-regular text-text-subtitle">{INVOICE.paidAt}</p>
          </>
        ) : (
          <>
            <p className="text-title-s leading-[22px] text-text-title">{INVOICE.amount}</p>
            <p className="text-text-regular text-brand-primary">{INVOICE.due}</p>
            <p className="flex flex-wrap items-center gap-2 text-text-regular text-text-title">
              {INVOICE.autoDebit}
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-bg-1 px-3 text-text-regular text-text-subtitle">
                <CardMark />Mastercard <span className="text-text-body">&bull;</span> •••• 4242
              </span>
            </p>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border-1 border-stroke-input">
        <div className="flex h-12 items-center justify-between gap-3 border-b-1 border-stroke-1 bg-bg-1 px-4">
          <span className="text-body-medium text-text-title">Invoice Breakdown</span>
          <ChevronDown className="h-5 w-5 rotate-180 text-text-subtitle" />
        </div>
        {BILLING.map((r) => (
          <div key={r.label} className={cn('flex items-start justify-between gap-4 border-b-1 border-stroke-1 px-4',
            r.sub ? 'py-3' : 'h-12 items-center')}>
            <span className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 text-text-regular leading-5 text-text-title">
                {r.label}{r.info && <Info className="h-4 w-4 text-text-body" />}
              </span>
              {r.sub && <span className="text-text-regular leading-5 text-text-subtitle">{r.sub}</span>}
            </span>
            <span className="text-text-regular leading-5 text-text-title">{r.amount}</span>
          </div>
        ))}
        <div className="flex flex-col gap-2 border-b-1 border-stroke-1 px-4 py-[14px]">
          <span className="flex items-center justify-between gap-4 text-text-regular leading-5 text-text-title">
            {BILLING_TOTAL.total.label}<span>{BILLING_TOTAL.total.amount}</span>
          </span>
          <span className="flex items-start justify-between gap-4">
            <span className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 text-text-regular leading-5 text-text-title">
                {BILLING_TOTAL.less.label}<Info className="h-4 w-4 text-text-body" />
              </span>
              <span className="text-text-regular leading-5 text-text-subtitle">{BILLING_TOTAL.less.sub}</span>
            </span>
            <span className="text-text-regular leading-5 text-text-title">{BILLING_TOTAL.less.amount}</span>
          </span>
        </div>
        <div className="flex h-12 items-center justify-between gap-4 px-4">
          <span className="text-body-medium text-text-title">{INVOICE.net.label}</span>
          <span className="text-body-medium text-text-title">{INVOICE.net.amount}</span>
        </div>
      </div>
    </SidePanel>
  )
}

/** Make Payment (1666:127878): the invoice's own checkout, card already chosen. */
export function MakePaymentPanel({
  open, onClose, onPaid, onInvoice,
}: { open: boolean; onClose: () => void; onPaid?: () => void; onInvoice?: () => void }) {
  const toast = useToast()
  return (
    <SidePanel open={open} onClose={onClose} title={MAKE_PAYMENT.toPay === '' ? '' : 'Make Payment'}
      headerClassName="h-14" className="h-fit" bodyClassName="flex flex-col gap-3 px-4 pb-4 pt-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button onClick={onPaid}>{MAKE_PAYMENT.cta}</Button>
        </div>
      }>
      <div className="flex items-center justify-between gap-4 rounded-lg border-1 border-stroke-input p-4">
        <span className="flex flex-col gap-1">
          <span className="text-text-regular text-text-body">{MAKE_PAYMENT.toPay}</span>
          <span className="text-title-s leading-[22px] text-text-title">{MAKE_PAYMENT.amount}</span>
        </span>
        <Button variant="tertiary" size="row" onClick={onInvoice} rightIcon={<ChevronRight className="h-4 w-4" />}>
          {MAKE_PAYMENT.link}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-bg-1 p-4">
        <span className="flex flex-col gap-2">
          <span className="text-text-regular text-text-title">{MAKE_PAYMENT.from}</span>
          <span className="inline-flex h-8 items-center gap-3 rounded-full bg-bgAlt-1 px-3 text-text-regular text-text-subtitle">
            <CardMark />Mastercard <span className="text-text-body">&bull;</span> <span className="pl-4">4242</span>
          </span>
        </span>
        <Button variant="tertiary" size="row" onClick={() => toast('Choose another card')}>{MAKE_PAYMENT.change}</Button>
      </div>
    </SidePanel>
  )
}

/** Add New Card (1663:103923), raised by Add New Method. */
export function AddCardPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCard } = useWorkspace()
  const toast = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setValues((cur) => ({ ...cur, [k]: v }))

  const save = () => {
    const number = (values['Card Number'] ?? '').replace(/\D/g, '')
    if (number.length < 12) { toast('Please enter a full card number'); return }
    const expiry = values['Expiry Date'] ?? ''
    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) { toast('Expiry should be MM / YYYY'); return }
    addCard({
      brand: number.startsWith('4') ? 'VISA' : 'Mastercard',
      last4: number.slice(-4),
      expires: `Expires ${expiry.replace(/\s/g, '').replace('/', '/').slice(0, 5)}`,
    })
    setValues({})
    toast('Card added')
    onClose()
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Add New Card" headerClassName="h-14"
      className="h-fit" bodyClassName="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 pt-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      }>
      {ADD_CARD.fields.map((f) => (
        <label key={f.label} className={cn('flex flex-col gap-2', f.wide && 'col-span-2')}>
          <span className="text-text-regular text-text-subtitle">{f.label}</span>
          <input value={values[f.label] ?? ''} onChange={(e) => set(f.label, e.target.value)}
            placeholder={f.placeholder}
            className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-title outline-none placeholder:text-text-body" />
        </label>
      ))}
      <p className="col-span-2 pt-1 text-text-regular text-text-subtitle">{ADD_CARD.note}</p>
    </SidePanel>
  )
}

/** $350 paid successfully! (1779:104245). */
export function PaidModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={PAID_MODAL.title} body={PAID_MODAL.body}
      footer={<Button fullWidth onClick={onClose}>Done</Button>}>
      <span className="mx-auto -order-1 mb-2 flex h-[150px] w-[150px] items-center justify-center rounded-full bg-yellow-40">
        <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-b-4 border-yellow-700 bg-gradient-to-b from-[#fdc86f] to-[#fca311] text-bg-0">
          <Check className="h-11 w-11" />
        </span>
      </span>
    </Modal>
  )
}

/** Remove **** 4242 Card? (1779:104288). */
export function RemoveCardModal({ open, onClose, onConfirm, last4 }: {
  open: boolean; onClose: () => void; onConfirm?: () => void; last4?: string
}) {
  return (
    <Modal open={open} onClose={onClose} wide
      title={last4 ? REMOVE_CARD.title.replace('4242', last4) : REMOVE_CARD.title}
      body={REMOVE_CARD.body}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm ?? onClose}>Remove</Button>
        </>
      } />
  )
}
