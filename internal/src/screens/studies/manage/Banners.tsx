import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { cn } from '../../../lib/cn'
import { clockTime, monthDayYear } from '@shared/format'

/** A study banner: 80 tall, Radius/L, a 1px edge, 16 inside; a Body-Medium line over a 14px one; its CTAs on the right. */
function Banner({ tone, title, children, actions, className }: { tone: 'yellow' | 'red'; title: ReactNode; children: string; actions?: ReactNode; className?: string }) {
  return (
    <div role="status" className={cn('flex h-20 items-center justify-between gap-4 rounded-lg border-1 px-4',
      tone === 'red' ? 'border-red-200 bg-red-100' : 'border-yellow-200 bg-yellow-40', className)}>
      <div className="min-w-0">
        <p className="text-body-medium leading-[22px] text-text-title">{title}</p>
        <p className="pt-1 text-text-regular leading-5 text-text-subtitle">{children}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-4">{actions}</div>}
    </div>
  )
}

/**
 * "Congrats!" (video 1:1, 1952:80462): the target is met and the client is
 * expected to pay. It offers the team nothing: its two CTAs are hidden layers.
 */
export const CongratsBanner = ({ required }: { required: number }) => (
  <Banner tone="yellow" title={<><span className="text-state-success">Congrats!</span> {required} required participants are fulfilled and completed now!</>}>
    Client will complete the study by a payment or get more participants if needed. If not paid manually, will be auto-paid from saved method.
  </Banner>
)

/** Paused (1952:75945): recruiting has stopped; resume it or mark the study completed. Drawn 1152 wide, 10 short of the header under it. */
export const PausedBanner = ({ onResume, onComplete }: { onResume: () => void; onComplete: () => void }) => (
  <Banner tone="red" className="mr-[10px]" title="You have paused this study with stopping recruit new participants further."
    actions={<>
      <Button variant="secondary" size="md" className="px-3" onClick={onComplete}>Mark as completed</Button>
      <Button size="md" className="px-3" onClick={onResume}>Resume Study</Button>
    </>}>
    This study is paused now to get new participations. You can resume it back or mark completed.
  </Banner>
)

const STOPPED_BY: Record<'client' | 'team' | 'filled', string> = {
  client: 'This study is stopped by the client to mark completed!',
  team: 'This study is stopped by the team to mark completed!',
  filled: 'This study has filled its target and stopped recruiting!',
}

/**
 * Stopped-Completed - To Pay (23 Oct 2026), above the study header on Pay: who
 * stopped it and when, and Re-publish and Recruit, which takes it back to
 * recruiting. The frame's "by you" is the client's sentence; the console names
 * who stopped it.
 */
export const BillingBanner = ({ by, at, onRepublish }: { by: 'client' | 'team' | 'filled'; at?: string; onRepublish: () => void }) => (
  <div role="status" className="flex items-start justify-between gap-4 rounded-lg border-1 border-yellow-200 bg-yellow-40 px-4 py-[13px]">
    <div className="flex flex-col gap-1">
      <p className="text-body-medium leading-[22px] text-text-title">{STOPPED_BY[by]}</p>
      <p className="text-text-regular leading-5 text-text-subtitle">Complete the study by a payment or get more participants if needed.</p>
      {at && <p className="text-text-regular leading-5 text-text-body">{monthDayYear(at)}, at {clockTime(at)}</p>}
    </div>
    <Button variant="tertiary" size="md" className="shrink-0 px-3" onClick={onRepublish}>Re-publish and Recruit</Button>
  </div>
)
