import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { setupDone, useDraft } from '../../mock/createStore'
import CreateShell, { SaveDraftButton } from './CreateShell'
import { CostingSummary, IncentivePayments, Payment } from './StudyBits'

/**
 * 2.1.4 Pricing, its own step since 15 Oct 2026, after Study setup and before
 * Payment & Publish, for every study type. It is the lower half of the
 * "Survey_Study Setup - New Study" frame as drawn: Incentive Payments,
 * Costing Summary and the Payment card, one 600px column. The figures are the
 * fee table's for the study being built (shared/platform.ts quoteStudy).
 */
export default function Pricing() {
  const nav = useNavigate()
  const { draft } = useDraft()
  return (
    <CreateShell step="pricing" action={
      <>
        <SaveDraftButton />
        <Button size="row" disabled={!setupDone(draft)} title={setupDone(draft) ? undefined : 'Finish the Study step first'}
          onClick={() => nav('/studies/create/publish')}>Proceed to Publish</Button>
      </>
    }>
      <div className="min-h-[1302px] rounded-lg bg-bg-0 px-6 pt-[9px]">
        <div className="mx-auto flex w-[600px] flex-col">
          <IncentivePayments />
          <CostingSummary />
          <Payment />
        </div>
      </div>
    </CreateShell>
  )
}
