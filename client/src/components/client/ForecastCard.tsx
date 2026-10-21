import Button from '../ui/Button'
import { cn } from '../../lib/cn'

const TIERS = ['Silver', 'Gold', 'Platinum']
const ROWS = ['Average Score', 'Recommended Incentive', 'Estimated Time To Fill']

/**
 * Check Participation Forecast (2352:153937, 21 Oct 2026), on the Audience
 * step of Create and of editing a study in review. Everything under the
 * contact box is a placeholder the frame draws greyed: the Coming Soon pills,
 * the tier bar at XX% and the three figures. Nothing here reads data (PRD D34).
 */
export default function ForecastCard({ onContact, className }: { onContact: () => void; className?: string }) {
  return (
    <aside className={cn('w-[488px] shrink-0 rounded-lg border-1 border-stroke-2 bg-bg-0', className)}>
      <div className="flex h-[51px] items-center gap-2 border-b-1 border-stroke-1 px-4">
        <h2 className="text-body-medium text-text-subtitle">Check Participation Forecast</h2>
        <span className="flex h-7 items-center rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-subtitle">Coming Soon</span>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col items-start gap-2 rounded-md bg-bg-1 p-4">
          <p className="text-text-medium leading-5 text-text-title">Want to check eligible participants matching to your criteria?</p>
          <Button size="row" className="px-3" onClick={onContact}>Contact Us</Button>
        </div>
        <div className="rounded-lg border-1 border-stroke-1 p-4" aria-label="Tier distribution, coming soon">
          <div className="flex h-6 items-center justify-between">
            <span className="text-text-regular uppercase text-text-body">Tier Distribution</span>
            <span className="text-body-medium text-text-disabled">Coming Soon</span>
          </div>
          <div className="mt-2.5 flex h-4 gap-0.5 rounded-full border-1 border-stroke-1 p-[3px]" aria-hidden="true">
            <span className="w-[23%] rounded-full bg-neutral-500" />
            <span className="flex-1 rounded-full bg-neutral-500" />
            <span className="w-[23%] rounded-full bg-neutral-500" />
          </div>
          <div className="mt-3 grid grid-cols-3">
            {TIERS.map((t) => (
              <span key={t} className="flex items-center gap-1 text-text-regular text-text-disabled">
                <span className="h-3 w-3 rounded-full bg-neutral-500" />{t}<span className="pl-0.5">XX%</span>
              </span>
            ))}
          </div>
        </div>
        <dl className="flex flex-col">
          {ROWS.map((k) => (
            <div key={k} className="flex h-[37px] items-center justify-between border-b-1 border-stroke-1 last:border-b-0">
              <dt className="text-text-regular text-text-body">{k}</dt>
              <dd className="text-text-medium text-text-disabled">Coming Soon</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}
