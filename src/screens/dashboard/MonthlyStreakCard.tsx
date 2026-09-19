import Stepper from '../../components/ui/Stepper'
import Tag from '../../components/ui/Tag'
import { Flame } from '../../components/ui/icons'
import { POINTS } from '../../lib/rules'
import { useStore } from '../../mock/store'

/** PRD 5.1 Monthly Streak. Tapping opens the streak detail modal. */
export default function MonthlyStreakCard({ onOpen }: { onOpen: () => void }) {
  const { user } = useStore()
  const { current, target } = user.streak

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 p-4 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-brand-primary"><Flame /></span>
        <span className="text-body-medium text-text-title">Monthly Streak</span>
        <span className="text-text-medium text-text-body">{current} /{target} studies</span>
        <Tag tone="yellow" className="ml-auto">{POINTS.STREAK} Pts</Tag>
      </div>
      <Stepper current={current} total={target} variant="pills" tone="green" />
    </button>
  )
}
