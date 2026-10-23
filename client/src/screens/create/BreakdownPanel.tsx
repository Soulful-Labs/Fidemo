import SidePanel from '../../components/ui/SidePanel'
import { BreakdownBody } from './PaymentSummary'

/**
 * Payment Breakdown (1627:95310, redrawn 23 Oct 2026): the panel View Breakdown opens on Payment and
 * Publish. The costing summary at the platform's rate and the 20/30/50 payment structure, with its notes.
 */
export default function BreakdownPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Payment Breakdown" headerClassName="h-[56px]" bodyClassName="flex flex-col px-4">
      <BreakdownBody />
    </SidePanel>
  )
}
