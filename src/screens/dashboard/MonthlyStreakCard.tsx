import Stepper from '../../components/ui/Stepper'
import { Flame, PointsCoin } from '../../components/ui/icons'
import { POINTS } from '../../lib/rules'
import { useStore } from '../../mock/store'
import SectionHeader from './SectionHeader'

/**
 * PRD 5.1 Monthly Streak, Figma 918:69716. Tapping opens the streak detail
 * modal. The chip says 50, not the 100 drawn: conflict 3, policy wins.
 */
export default function MonthlyStreakCard({ onOpen }: { onOpen: () => void }) {
  const { user } = useStore()
  const { current, target } = user.streak

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Monthly Streak" />
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-4 rounded-lg bg-bg-1 bg-yellow-fade p-4 text-left"
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary bg-yellow-1000/60 text-text-title shadow-glow shadow-yellow-700">
          <Flame className="h-8 w-8" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="flex items-center gap-2">
            <span className="text-text-title">
              <span className="text-title-l">{current}</span>
              <span className="text-body-regular text-text-subtitle">/{target} studies</span>
            </span>
            <span className="ml-auto flex h-tag items-center gap-2 rounded-full bg-green-900/60 px-3 text-body-medium text-brand-secondary">
              <PointsCoin className="h-5 w-5" />
              {POINTS.STREAK} Pts
            </span>
          </span>
          <Stepper current={current} total={target} variant="pills" memory="streak" />
        </span>
      </button>
    </section>
  )
}
