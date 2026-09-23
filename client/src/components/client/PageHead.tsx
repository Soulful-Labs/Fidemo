import type { ReactNode } from 'react'

/** A page title with an optional right-hand action, as drawn above each list. */
export default function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-l text-text-title">{title}</h1>
        {sub && <p className="text-text-regular text-text-subtitle">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/** "Ongoing Studies … View All", the section heading used down the dashboard. */
export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-title-s text-text-title">{title}</h2>
      {action}
    </div>
  )
}
