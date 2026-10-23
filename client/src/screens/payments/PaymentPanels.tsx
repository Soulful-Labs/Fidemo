import { fileName, pdf, save } from '@shared/files'
import SidePanel from '../../components/ui/SidePanel'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { Check, ChevronDown, ChevronRight, DiaryBookIcon, Download, Info, LinkIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useBill } from '../../mock/pay'
import { ADD_CARD, removeCardCopy } from '../../mock/payments'
import { useToast } from '../../components/ui/Toast'
import { useState } from 'react'
import { useWorkspace } from '../../mock/workspace'
import { useNavigate } from 'react-router-dom'

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
  open, onClose, paid, onPay, studyId,
}: { open: boolean; onClose: () => void; paid?: boolean; onPay?: () => void; studyId?: string }) {
  const nav = useNavigate()
  const toast = useToast()
  const { BILLING, BILLING_TOTAL, INVOICE, study, card } = useBill(studyId)
  return (
    <SidePanel open={open} onClose={onClose} title={INVOICE.title} headerClassName="h-14"
      className="h-fit max-h-full" bodyClassName="flex flex-col gap-3 px-4 pb-4 pt-4"
      footer={paid
        ? <Button variant="tertiary" fullWidth size="none" className="h-12 text-body-medium" onClick={() => toast(`Saved ${save(fileName(INVOICE.number.replace('Invoice Number: ', 'invoice '), 'pdf'), pdf(INVOICE.title, [INVOICE.number, INVOICE.issued, '', { heading: 'Billing' }, ...BILLING.map((b) => `${b.label}  ${b.amount}`), `${BILLING_TOTAL.total.label}  ${BILLING_TOTAL.total.amount}`, `${BILLING_TOTAL.less.label}  ${BILLING_TOTAL.less.amount}`, `${BILLING_TOTAL.net.label}  ${BILLING_TOTAL.net.amount}`, '', INVOICE.paidTitle, INVOICE.paidAt]))}`)} leftIcon={<Download className="h-4 w-4" />}>Download</Button>
        : <Button fullWidth size="none" className="h-12 text-body-medium" onClick={onPay}>Make Payment</Button>}>
      <p className="text-body-medium text-text-title">{INVOICE.number}</p>

      <div className="flex flex-col gap-2 rounded-lg border-1 border-stroke-input p-4">
        <span className="flex items-center justify-between gap-3">
          <StudyTypeTag type={study?.type ?? 'diary'} icon={study?.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
          <button type="button" onClick={() => nav(studyId ? `/studies/${studyId}` : '/studies')}
            className="inline-flex items-center gap-2 rounded-full border-1 border-stroke-input px-3 py-1.5 text-text-regular text-text-title">
            <LinkIcon className="h-4 w-4 text-text-subtitle" />View Study
          </button>
        </span>
        <p className="text-body-medium text-text-title">{INVOICE.study}</p>
        <p className="text-text-regular text-text-subtitle">{INVOICE.issued}</p>
      </div>

      <div className={cn('flex flex-col gap-2 rounded-lg p-4', paid ? 'bg-bgAlt-1' : 'bg-yellow-30')}>
        {paid ? (
          <>
            <p className="text-body-large text-brand-secondary">{INVOICE.paidTitle}</p>
            <p className="flex items-center gap-2 text-body-medium text-text-title">
              <CardMark brand={card?.brand} />{card?.brand ?? 'Card'} <span className="text-text-body">&bull;</span> •••• {card?.last4 ?? ''}
            </p>
            <p className="text-text-regular text-text-subtitle">{INVOICE.paidAt}</p>
          </>
        ) : (
          <>
            <p className="text-title-s text-text-title">{INVOICE.amount}</p>
            <p className="text-text-regular text-brand-primary">{INVOICE.due}</p>
            {/* The frame's "If not paid manually, will be auto-debited from [card]" is not shown: nothing is
                debited without the client paying (decided 15 Oct 2026). */}
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border-1 border-stroke-input">
        <div className="flex h-12 items-center justify-between gap-3 border-b-1 border-stroke-1 bg-bg-1 px-4">
          <span className="text-text-medium text-text-title">Invoice Breakdown</span>
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
  open, onClose, onPaid, onInvoice, studyId,
}: { open: boolean; onClose: () => void; onPaid?: () => void; onInvoice?: () => void; studyId?: string }) {
  const toast = useToast()
  const { MAKE_PAYMENT } = useBill(studyId)
  const { cards } = useWorkspace()
  const [pick, setPick] = useState(0)
  const card = cards[pick % Math.max(1, cards.length)]
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
          <span className="text-title-s text-text-title">{MAKE_PAYMENT.amount}</span>
        </span>
        <Button variant="tertiary" size="row" onClick={onInvoice} rightIcon={<ChevronRight className="h-4 w-4" />}>
          {MAKE_PAYMENT.link}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-bg-1 p-4">
        <span className="flex flex-col gap-2">
          <span className="text-text-regular text-text-title">{MAKE_PAYMENT.from}</span>
          <span className="inline-flex h-8 items-center gap-3 rounded-full bg-bgAlt-1 px-3 text-text-regular text-text-subtitle">
            <CardMark brand={card?.brand} />{card?.brand ?? 'Card'} <span className="text-text-body">&bull;</span> •••• {card?.last4 ?? ''}
          </span>
        </span>
        <Button variant="tertiary" size="row" onClick={() => {
          if (cards.length < 2) { toast('Add a second card to switch between them'); return }
          setPick((i) => (i + 1) % cards.length)
        }}>{MAKE_PAYMENT.change}</Button>
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

/**
 * Edit Card. Not drawn in the exports. The client changes a saved card's
 * expiry and name, or replaces it with a new card number. The card keeps its
 * place and whether it is the default; Publish then charges the new details.
 */
export function EditCardPanel({ open, onClose, last4 }: { open: boolean; onClose: () => void; last4?: string }) {
  const { cards, updateCard } = useWorkspace()
  const toast = useToast()
  const card = cards.find((c) => c.last4 === last4)
  const [values, setValues] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setValues((cur) => ({ ...cur, [k]: v }))
  const close = () => { setValues({}); onClose() }

  const save = () => {
    if (!card) { close(); return }
    const typed = (values['New Card Number'] ?? '').replace(/\D/g, '')
    if (typed && typed.length < 12) { toast('Please enter a full card number, or leave it blank to keep this card'); return }
    const expiry = values['Expiry Date'] ?? ''
    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) { toast('Expiry should be MM / YYYY'); return }
    const [mm, yy] = expiry.replace(/\s/g, '').split('/')
    const res = updateCard(card.last4, {
      brand: typed ? (typed.startsWith('4') ? 'VISA' : 'Mastercard') : card.brand,
      last4: typed ? typed.slice(-4) : card.last4,
      expires: `Expires ${mm}/${(yy ?? '').slice(-2)}`,
    })
    if (!res.ok) { toast(res.why ?? 'That card could not be saved'); return }
    toast(typed ? `Card replaced. ${card.isDefault ? 'It is your default card.' : ''}`.trim() : 'Card updated')
    close()
  }

  return (
    <SidePanel open={open} onClose={close} title="Edit Card" headerClassName="h-14"
      className="h-fit" bodyClassName="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 pt-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="tertiary" onClick={close}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      }>
      {card && (
        <p className="col-span-2 flex items-center gap-2 text-body-regular text-text-title">
          <CardMark brand={card.brand} />{card.brand} <span className="text-text-body">&bull;</span> •••• {card.last4}
          <span className="text-text-regular text-text-subtitle">{card.expires}</span>
        </p>
      )}
      {[
        { label: 'New Card Number', placeholder: 'Leave blank to keep this card', wide: true },
        { label: 'Expiry Date', placeholder: 'MM / YYYY' },
        { label: 'CVV', placeholder: '000' },
        { label: 'Name on Card', placeholder: 'Enter name', wide: true },
      ].map((f) => (
        <label key={f.label} className={cn('flex flex-col gap-2', f.wide && 'col-span-2')}>
          <span className="text-text-regular text-text-subtitle">{f.label}</span>
          <input value={values[f.label] ?? ''} onChange={(e) => set(f.label, e.target.value)}
            placeholder={f.placeholder} aria-label={f.label}
            className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-title outline-none placeholder:text-text-body" />
        </label>
      ))}
      <p className="col-span-2 pt-1 text-text-regular text-text-subtitle">To replace this card, type the new card number. To keep it, leave the number blank and update the expiry.</p>
    </SidePanel>
  )
}

/** $350 paid successfully! (1779:104245). */
export function PaidModal({ open, onClose, studyId }: { open: boolean; onClose: () => void; studyId?: string }) {
  const { PAID_MODAL } = useBill(studyId)
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
  const { cards } = useWorkspace()
  const copy = removeCardCopy(cards.find((c) => c.last4 === last4)?.brand ?? 'Mastercard', last4 || (cards[0]?.last4 ?? ''))
  return (
    <Modal open={open} onClose={onClose} wide
      title={copy.title}
      body={copy.body}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm ?? onClose}>Remove</Button>
        </>
      } />
  )
}
