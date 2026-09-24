import SidePanel from '../../components/ui/SidePanel'
import { CostingSummary, Payment } from './StudyBits'

/**
 * Payment Breakdown (1627:95310): the 600px panel View Breakdown opens on
 * Payment and Publish. It is the step-4 Costing Summary and Payment sections
 * lifted into a panel, so it reuses them.
 */
export default function BreakdownPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Payment Breakdown" headerClassName="h-[56px]"
      bodyClassName="flex flex-col px-4">
      <CostingSummary className="!px-0" />
      <Payment className="!px-0" />
    </SidePanel>
  )
}
