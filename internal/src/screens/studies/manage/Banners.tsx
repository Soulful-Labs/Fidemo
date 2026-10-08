import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { cn } from '../../../lib/cn'

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
export const CongratsBanner = () => (
  <Banner tone="yellow" title={<><span className="text-state-success">Congrats!</span> 30 required participants are fulfilled and completed now!</>}>
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
