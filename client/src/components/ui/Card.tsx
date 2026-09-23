import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** The white panel every block on a page sits in: 16px radius, hairline, 24px pad. */
export default function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-lg border-1 border-stroke-input bg-bg p-6', className)}>{children}</section>
}

/** A card's heading row: icon, title, and an action on the right. */
export function CardHead({ icon, title, sub, action }: { icon?: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4">
      <div className="flex items-start gap-2">
        {icon && <span className="mt-0.5 text-brand-primary">{icon}</span>}
        <div className="flex flex-col gap-1">
          <h2 className="text-body-medium text-text-title">{title}</h2>
          {sub && <p className="text-text-regular text-text-subtitle">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
