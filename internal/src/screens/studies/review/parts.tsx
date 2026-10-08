import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'

/**
 * The 32px pill the Review screen uses throughout (header facts, audience
 * criteria, question labels, diary setup): Radius/Full, 14 sides, 14px. Ringed
 * (1px stroke-2) or filled bgAlt-2; a grey label can lead the value.
 */
export function Pill({ label, icon, filled, muted, className, children }: {
  label?: string; icon?: ReactNode; filled?: boolean; muted?: boolean; className?: string; children: ReactNode
}) {
  return (
    <span className={cn('inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full text-text-regular',
      filled ? 'bg-bgAlt-2 px-[14px]' : 'border-1 border-stroke-2 px-[13px]', muted ? 'text-text-body' : filled ? 'text-text-title' : 'text-text-subtitle', className)}>
      {icon}
      <span>{label && <span className="text-text-body">{label} </span>}{children}</span>
    </span>
  )
}

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
