import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Stepper from '../../components/ui/Stepper'
import { POINTS } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 5.4 streak details.
 *
 * Conflict 3: Figma says "Get Reward of 100 points" here and on the dashboard
 * chip, but Ways To Earn, notification 20 and the policy all say 50. 50 wins.
 */
export default function StreakDetailModal({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  const { user } = useStore()
  const { current, target, month } = user.streak

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Monthly Streak"
      footer={<Button fullWidth onClick={onClose}>Got It!</Button>}
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-medium text-text-subtitle">
          {current} of {target} studies in {month}
        </p>
        <Stepper current={current} total={target} variant="pills" tone="green" />
        <p className="text-text-regular text-text-body">
          Get Reward of {POINTS.STREAK} points
        </p>
      </div>
    </Modal>
  )
}
