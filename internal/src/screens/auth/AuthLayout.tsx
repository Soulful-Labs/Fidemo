import type { ReactNode } from 'react'
import { LogoMark } from '../../components/ui/Logo'
import { cn } from '../../lib/cn'

/**
 * The four Onboarding frames (section 1849:111735) share one layout, measured
 * at 1440 x 960: a bgAlt-2 page; the "Vector Logo" 164 x 200 at (638, 64),
 * drawn as a 10% watermark; and a bgAlt-0 card with Radius/XL corners and a
 * soft shadow, its top at y 230.5. Sign In's card is 524 wide; the other three
 * are 460. The card is centred on the 1440 frame, so it centres here.
 */
export default function AuthLayout({ width = 460, className, children }: { width?: 460 | 524; className?: string; children: ReactNode }) {
  return (
    <main className="relative min-h-full overflow-hidden bg-bgAlt-2">
      <LogoMark className="absolute left-1/2 top-16 h-[200px] w-[164px] -translate-x-1/2 opacity-10" />
      <div className="relative flex justify-center pb-16 pt-[230.5px]">
        <div className={cn('rounded-xl bg-bgAlt-0 shadow-[0_2px_8px_0_rgb(32_30_25/0.06)]', width === 524 ? 'w-[524px]' : 'w-modal', className)}>
          {children}
        </div>
      </div>
    </main>
  )
}

/** A centred heading block: Title, then Subtitle 8px under it. */
export function AuthHeader({ title, subtitle, big }: { title: string; subtitle?: ReactNode; big?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className={cn('text-text-title', big ? 'text-heading leading-[42px]' : 'text-title-l leading-[31px]')}>{title}</h1>
      {subtitle && <p className="text-body-regular text-text-subtitle">{subtitle}</p>}
    </div>
  )
}
