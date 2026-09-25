import type { ReactNode } from 'react'
import Toggle from '../../components/ui/Toggle'
import { useDraft } from '../../mock/createStore'
import { Section } from './CreateBits'
import { useToast } from '../../components/ui/Toast'

const DOLLAR = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 6.8v10.4M14.3 9.4c0-1-1-1.8-2.3-1.8s-2.3.8-2.3 1.8 1 1.8 2.3 1.8 2.3.8 2.3 1.8-1 1.8-2.3 1.8-2.3-.8-2.3-1.8"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const FORM = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 6h10M4 12h16M4 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const RECEIPT = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M5 3h14v18l-2.3-1.6L14.3 21 12 19.4 9.7 21l-2.4-1.6L5 21V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 7v8M14 9.2c0-.9-.9-1.5-2-1.5s-2 .6-2 1.5.9 1.5 2 1.5 2 .6 2 1.5-.9 1.5-2 1.5-2-.6-2-1.5"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

/** One row of a costing or payment table. */
function Row({ label, note, value, strong }: { label: string; note?: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-1 border-stroke-1 py-2 last:border-b-0">
      <span className="flex items-center gap-2 text-text-regular text-text-title">
        {strong ? <span className="text-text-medium">{label}</span> : label}
        {note && <><span className="text-text-body">&bull;</span><span className="text-text-subtitle">{note}</span></>}
      </span>
      <span className={strong ? 'text-text-medium text-text-title' : 'text-text-regular text-text-title'}>{value}</span>
    </div>
  )
}

/**
 * Incentive Payments, the same on every study type (1518:91922 and the video,
 * in-person and diary setups): the amount, its slider and AutoPay.
 */
export function IncentivePayments() {
  const { draft, set } = useDraft()
  const pct = ((draft.incentive - 5) / 995) * 100
  return (
    <Section icon={DOLLAR} title="Incentive Payments" sub="Set the reward payment amount for each participant in your study." headPad="pb-4" titleLead="leading-[22px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-regular text-text-title">Incentive Amount</span>
          <input value={`$${draft.incentive}`} aria-label="Incentive Amount"
            onChange={(e) => set('incentive', Number(e.target.value.replace(/\D/g, '')) || 0)}
            className="h-[38px] w-20 rounded-sm border-1 border-stroke-input bg-bg px-3 text-text-regular text-text-title" />
        </div>
        <div className="flex flex-col gap-1">
          <input type="range" min={5} max={1000} step={5} value={draft.incentive} aria-label="Incentive slider"
            onChange={(e) => set('incentive', Number(e.target.value))} className="slider w-full"
            style={{ ['--slider-track' as string]: `linear-gradient(to right, #fca311 0 ${pct}%, #eeedec ${pct}% 100%)` }} />
          <div className="flex items-center justify-between text-text-regular text-text-subtitle">
            {['$5', '$200', '$400', '$600', '$800', '$1K'].map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
        <p className="text-text-regular text-text-subtitle">
          Participants see this amount before applying, and it strongly influences how quickly your project fills and how long they expect the study to take.
        </p>
        <div className="flex items-start justify-between gap-4 rounded-md bg-bg-1 p-4">
          <span className="flex flex-col gap-1">
            <span className="text-body-medium text-text-title">AutoPay</span>
            <span className="text-text-regular text-text-subtitle">
              Once a participant has been marked as attended, the incentive will be paid out to them automatically.
            </span>
          </span>
          <Toggle checked={draft.autoPay} onChange={(v) => set('autoPay', v)} label="AutoPay" />
        </div>
      </div>
    </Section>
  )
}

/** Costing Summary, the same on every study type. */
export function CostingSummary({ className }: { className?: string } = {}) {
  return (
    <Section icon={FORM} title="Costing Summary" sub="" headPad="pb-2" titleLead="leading-[22px]" className={className}>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-text-regular text-text-title">
          20x participants <span className="text-text-body">&bull;</span> $700 incentive
        </p>
        <div className="flex flex-col">
          <Row label="Incentive Cost" note="20 x $700" value="$1,400" />
          <Row label="Recruitment Cost" note="20 x $25" value="$500" />
          <Row label="Total Study Cost" value="$1,900" strong />
        </div>
      </div>
    </Section>
  )
}

/** Payment, the same on every study type. */
export function Payment({ className }: { className?: string } = {}) {
  const toast = useToast()
  return (
    <Section icon={RECEIPT} title="Payment" sub="" headPad="pb-2" titleLead="leading-[22px]" className={className}>
      <div className="flex flex-col gap-3">
        <p className="text-text-regular text-text-title">
          This payment will contribute towards your total project cost.{' '}
          <button type="button" onClick={() => toast('Platform fee, recruiting, incentives and moderation, per participant delivered')}
            className="text-text-title underline">See how costs are calculated.</button>
        </p>
        <div className="flex flex-col rounded-md bg-bg-1 px-3 py-3">
          <Row label="Recruitment deposit" note="25% of cost" value="$350" />
          <Row label="Incentive deposit" note="25% of cost" value="$125" />
          <Row label="To pay upfront" value="$475" strong />
        </div>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-text-regular text-text-subtitle marker:text-text-body">
          <li>The remaining project costs ($1,050 for incentives and $375 for recruitment) will be billed as participants complete their sessions.</li>
          <li>You are only charged for participants that complete your research. If available, add the estimated recruitment and incentives credits to &ldquo;study deposits&rdquo; upon publishing.</li>
          <li>Studies recruits until filled or till defined deadline or <span className="text-text-title">max 60 days from publish.</span></li>
          <li>This card will be added to your team for future payments.</li>
        </ul>
      </div>
    </Section>
  )
}

/** The warm card each type's own settings section is built around. */
export function SettingsCard({ title, sub, children, tone = 'warm' }: {
  title: string; sub?: string; children?: ReactNode; tone?: 'warm' | 'plain'
}) {
  return (
    <div className={`flex flex-col rounded-lg p-4 ${sub ? 'gap-4' : 'gap-3'} ${tone === 'warm' ? 'bg-yellow-30' : 'bg-bg-1'}`}>
      <span className="flex flex-col gap-0.5">
        <span className="text-body-medium text-text-title">{title}</span>
        {sub && <span className="text-text-regular text-text-subtitle">{sub}</span>}
      </span>
      {children}
    </div>
  )
}
