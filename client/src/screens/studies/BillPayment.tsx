import { useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { Clock, DiaryBookIcon, Info, PaymentsIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { BILL, BILLING, BILLING_TOTAL } from '../../mock/pay'
import type { BillingRow } from '../../mock/pay'
import { managedStudy } from '../../mock/studies'
import { useToast } from '../../components/ui/Toast'

/** One invoice line, on the white card this screen draws it in. */
function Line({ r, last }: { r: BillingRow; last?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-4',
      r.sub ? 'py-3' : 'h-12 items-center', !last && 'border-b-1 border-bgAlt-2')}>
      <span className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 text-text-regular leading-5 text-text-title">
          {r.label}{r.info && <Info className="h-4 w-4 text-text-body" />}
        </span>
        {r.sub && <span className="text-text-regular leading-5 text-text-subtitle">{r.sub}</span>}
      </span>
      <span className="text-text-regular leading-5 text-text-title">{r.amount}</span>
    </div>
  )
}

/** A labelled field of the card form. */
function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-[5px]', className)}>
      <span className="text-text-regular leading-5 text-text-subtitle">{label}</span>
      <span className="flex h-[38px] items-center rounded-sm border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title">
        {value}
      </span>
    </label>
  )
}

/** A figure on the study summary card. */
function Fig({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="text-title-s text-text-title">
        {value}{suffix && <span className="text-text-regular text-text-subtitle"> {suffix}</span>}
      </span>
    </div>
  )
}

/**
 * Bill Payment (1627:96956): the checkout the Pay tab's Pay Balance opens once
 * the study is marked completed. It leaves the study tabs behind, drops Create
 * Study from the top bar, and pairs the invoice with a card form.
 */
export default function BillPayment() {
  const toast = useToast()
  const { id } = useParams()
  const s = managedStudy(id)
  const c = BILL.card

  return (
    <AppShell hideCreate crumbs={[
      { label: 'Studies', to: '/studies' },
      { label: 'GLP-1 Care…' },
      { label: BILL.crumb },
    ]}>
      <div className="min-h-[913px] rounded-lg bg-bg-0 p-4">
        <div className="flex justify-between">
          <div className="w-[534px]">
            <div className="flex flex-col gap-3 rounded-lg border-1 border-stroke-input px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <StudyTypeTag type={s.type} icon={s.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
                <span className="flex h-8 items-center rounded-full bg-bg-1 px-3 text-text-regular text-text-subtitle">
                  {BILL.status}
                </span>
              </div>
              <p className="text-title-s leading-[22px] text-text-title">{s.title}</p>
              <div className="flex items-center gap-2">
                <span className="flex h-8 items-center gap-2 rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
                  <Clock className="h-4 w-4" />{s.duration}
                </span>
                <span className="flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
                  {s.industry}
                </span>
              </div>
              <div className="grid grid-cols-[173px_172px_1fr]">
                <Fig label="Completed" value={BILL.completed} suffix={BILL.completedOf} />
                <Fig label="Qualified" value={BILL.qualified} suffix={BILL.qualifiedOf} />
                <Fig label="Progress" value={BILL.progress} />
              </div>
              <p className="text-text-regular text-text-body">{BILL.markedAt}</p>
            </div>

            <h2 className="pt-[18px] text-title-s leading-[22px] text-text-title">{BILL.heading}</h2>
            <div className="mt-3 overflow-hidden rounded-lg border-1 border-bgAlt-2">
              {BILLING.map((r) => <Line key={r.label} r={r} />)}
              <div className="flex flex-col gap-2 border-b-1 border-bgAlt-2 px-4 py-[14px]">
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
              <Line r={BILLING_TOTAL.net} last />
            </div>
          </div>

          <div className="flex h-fit w-[567px] flex-col rounded-lg bg-bg-1 p-4">
            <p className="inline-flex items-center gap-2 text-title-s leading-[22px] text-text-title">
              <PaymentsIcon className="h-5 w-5 text-brand-secondary" />{c.title}
            </p>
            <div className="flex flex-col gap-[11px] pt-[15px]">
              <Field label="Card Number" value={c.number} />
              <div className="flex gap-4">
                <Field label="Expiry Date" value={c.expiry} className="w-[259px]" />
                <Field label="CVV" value={c.cvv} className="w-[259px]" />
              </div>
              <Field label="Name on Card" value={c.name} />
              <div className="flex gap-4">
                <Field label="Billing Address" value={c.address} className="w-[259px]" />
                <Field label="Zip Code" value={c.zip} className="w-[259px]" />
              </div>
            </div>
            <Button size="none" className="mt-[15px] h-12 w-full" onClick={() => toast(`${c.cta} sent`)}><span className="text-body-medium">{c.cta}</span></Button>
            <ul className="flex flex-col pt-4">
              {BILL.notes.map((n) => (
                <li key={n.text} className="flex gap-2 text-text-regular leading-5 text-text-subtitle">
                  <span>&bull;</span>
                  <span>{n.text}{n.link && <span className="text-text-medium text-text-title">{n.link}</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
