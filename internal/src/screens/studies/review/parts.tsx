import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'

export { default as Pill } from '../../../components/app/Pill'

/** A bg-1 block with Radius/L: 16 sides, 12 above the 25px Title-S; 12 below (16 on the Availability cards, via className). */
export function Card({ title, className, children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-lg bg-bg-1 px-4 pb-3 pt-3', className)}>
      {title && <h3 className="text-title-s leading-[25px] text-text-title">{title}</h3>}
      {children}
    </section>
  )
}

/** A read-only 38px value box: the dialog-size input's look, holding what the client entered. */
export function ValueBox({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex h-[38px] items-center rounded-sm border-1 border-stroke-input bg-bg-0 px-[11px] text-text-regular text-text-title', className)}>
      {children}
    </div>
  )
}

/** The 1px stroke-1 rule between rows. */
export const Rule = ({ className }: { className?: string }) => <hr className={cn('border-0 border-t-1 border-stroke-1', className)} />
