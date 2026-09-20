import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The 96px bottom CTA bar from the layout constants: fixed under the content,
 * 16px padding, a hairline on top. Holds one or two buttons side by side.
 */
export default function CtaBar({
  children,
  alt = false,
  className,
}: { children: ReactNode; alt?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 flex h-cta w-full shrink-0 items-start gap-3 border-t-1 border-stroke-2 px-4 pt-4',
        alt ? 'bg-bgAlt-0' : 'bg-bg-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
