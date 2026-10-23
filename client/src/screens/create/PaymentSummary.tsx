import { useNavigate } from 'react-router-dom'
import { money } from '@shared/format'
import { paymentPlan, rateFor, rateTimes, sharePct, PAYMENT_STAGES } from '@shared/platform'
import { studyTypeOf } from '@shared/studyForm'
import { useDraft } from '../../mock/createStore'

/**
 * The pricing of 23 Oct 2026 on the Create flow's last step: Total Recruiting
 * Cost is the platform's rate per participant times the participants
 * (shared/platform.ts rateFor, paymentPlan), never a number typed here.
 */
export function usePlan() {
  const { draft } = useDraft()
  const n = /^\d+$/.test(draft.participants.trim()) ? Number(draft.participants) : 0
  // The cost per interview the rate card offers before the team quotes it (24 Oct 2026); the client sees only this figure.
  return paymentPlan(rateFor({ type: studyTypeOf(draft), required: n, durationMins: Number(draft.duration) || 60 }), n)
}

const FORM = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 6h10M4 12h16M4 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const RECEIPT = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M5 3h14v18l-2.3-1.6L14.3 21 12 19.4 9.7 21l-2.4-1.6L5 21V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 7v8M14 9.2c0-.9-.9-1.5-2-1.5s-2 .6-2 1.5.9 1.5 2 1.5 2 .6 2 1.5-.9 1.5-2 1.5-2-.6-2-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

/** The four notes under the price (Payment & Publish and Payment Breakdown, 23 Oct 2026), in the frames' words. */
export function PriceNotes() {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-4 text-text-regular text-text-subtitle marker:text-text-body">
      <li>Cost is subject to change based upon modification in study requirements.</li>
      <li>You are only charged for participants that completes the study.</li>
      <li>Studies recruits until filled or till defined deadline or <span className="font-medium text-text-title">max 60 days from publish.</span></li>
      <li>This card will be used for future invoice payments.</li>
    </ul>
  )
}

/**
 * The card fee line as the frames draw it (23 Oct 2026). Nothing charges it:
 * the 3% fee was removed on 13 Oct and this line is recorded as a reversal on
 * the difference list. Learn about payment options opens Help.
 */
export function CardFeeNote() {
  const nav = useNavigate()
  return (
    <ul className="flex list-disc flex-col pl-4 text-text-regular text-text-subtitle marker:text-text-body">
      <li>3% merchant processing fee applies when using a credit card.{' '}
        <button type="button" onClick={() => nav('/help')} className="font-medium text-text-title hover:text-brand-primary">Learn about payment options</button>
      </li>
    </ul>
  )
}

/** Payment Summary: Total Recruiting Cost with its working, and what is paid upfront. */
export function PaymentSummaryCard({ onBreakdown }: { onBreakdown: () => void }) {
  const plan = usePlan()
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-body-medium text-text-title"><span className="text-brand-secondary">{FORM}</span>Payment Summary</h2>
        <button type="button" onClick={onBreakdown} className="flex items-center gap-1 text-text-medium text-text-title hover:text-brand-primary">
          View Breakdown
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="flex flex-col rounded-md border-1 border-stroke-input bg-bg-0 px-3">
        <div className="flex flex-col gap-2 border-b-1 border-stroke-input py-3">
          <span className="flex items-center justify-between gap-4 text-text-regular text-text-title"><span>Total Recruiting Cost</span><span>{money(plan.total)}</span></span>
          <span className="inline-flex h-7 items-center self-start rounded-full bg-bg-1 px-2 text-text-medium text-text-title">{rateTimes(plan.rate, plan.participants)}</span>
        </div>
        <span className="flex items-center justify-between gap-4 py-3 text-text-regular text-text-title">
          <span>To pay upfront <span className="text-text-subtitle">&bull; {sharePct('upfront')}</span></span><span>{money(plan.upfront)}</span>
        </span>
      </div>
    </>
  )
}

/** Payment Breakdown's body (1627:95310, redrawn 23 Oct 2026): the costing summary and the payment structure. */
export function BreakdownBody() {
  const plan = usePlan()
  const row = 'flex items-center justify-between gap-4 border-b-1 border-stroke-input py-3 text-body-regular text-text-title last:border-b-0'
  return (
    <div className="flex flex-col gap-4 py-4">
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-3 text-title-s text-text-title"><span className="text-brand-secondary">{FORM}</span>Costing Summary</h3>
        <div className="ml-8 flex items-start justify-between gap-4 rounded-md border-1 border-stroke-input px-3 py-3">
          <span className="flex flex-col gap-1 text-body-regular text-text-title">Total Recruiting Cost<span className="text-text-subtitle">{rateTimes(plan.rate, plan.participants)}</span></span>
          <span className="text-body-medium text-text-title">{money(plan.total)}</span>
        </div>
      </section>
      <hr className="border-stroke-input" />
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-3 text-title-s text-text-title"><span className="text-brand-secondary">{RECEIPT}</span>Payment Structure</h3>
        <div className="ml-8 flex flex-col rounded-md bg-bg-1 px-3">
          {(['upfront', 'incentive', 'completion'] as const).map((k) => (
            <span key={k} className={row}><span>{PAYMENT_STAGES[k].label} <span className="text-text-subtitle">&bull; {sharePct(k)}</span></span><span>{money(plan[k])}</span></span>
          ))}
          <span className={`${row} font-medium`}><span>Total Est. Cost</span><span>{money(plan.total)}</span></span>
        </div>
        <div className="ml-8"><PriceNotes /></div>
      </section>
    </div>
  )
}
