import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Stepper from '../../components/ui/Stepper'
import { Flame, PointsCoin } from '../../components/ui/icons'
import { POINTS } from '../../lib/rules'
import { useStore } from '../../mock/store'

/**
 * PRD 5.4 streak details, Figma 1457:50774.
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
      showClose={false}
      footer={<Button fullWidth onClick={onClose}>Got It!</Button>}
    >
      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-brand-primary bg-yellow-1000/60 text-text-title shadow-glow shadow-yellow-700">
          <Flame className="h-10 w-10" />
        </span>
        <p className="text-body-regular text-text-subtitle">Monthly Streak</p>

        <div className="relative mt-4 flex w-full flex-col items-center gap-4 rounded-lg bg-yellow-1000/50 px-4 pb-4 pt-8">
          <span className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-700 bg-yellow-900 text-title-l text-text-title">
            {current}
          </span>
          <p className="text-body-regular text-text-subtitle">
            of {target} studies in {month}
          </p>
          <Stepper current={current} total={target} variant="pills" className="w-full" />
        </div>

        <span className="mt-2 flex h-btn items-center gap-2 rounded-full bg-green-900/50 px-5 text-body-regular text-text-title">
          Get Reward of
          <PointsCoin className="h-5 w-5 text-brand-secondary" />
          <span className="text-body-medium text-brand-secondary">{POINTS.STREAK} points</span>
        </span>
      </div>
    </Modal>
  )
}
