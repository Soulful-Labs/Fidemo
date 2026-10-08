import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

export interface Crumb { label: string; to?: string }

/**
 * The "Admin Panel - Title Bar" component (1857:131485): 1210 x 70 beside the
 * sidebar, on the page colour, with a 1px stroke-input hairline along the
 * bottom (y 69). Three slots: breadcrumbs at (24, 19), a centre "Stepper
 * Slot" (410, 17, 397 wide) and "Right CTAs" (831, 16, right-aligned).
 * Earlier crumbs are text-body, the last one text-title. The right slot ends
 * 16 from the window edge (Review, 1982:104845: x 1424). With no stepper the
 * crumbs and the CTAs share the bar, so a long study name is not cut short.
 */
export default function TitleBar({ crumbs, centre, right }: { crumbs: Crumb[]; centre?: ReactNode; right?: ReactNode }) {
  return (
    <header className={cn('sticky top-0 z-20 grid h-topbar items-center gap-6 border-b-1 border-stroke-input bg-bg-0 pl-6 pr-4', centre ? 'grid-cols-[1fr_397px_1fr]' : 'grid-cols-[1fr_auto]')}>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-body-regular">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={i}>
              {c.to && !last
                ? <Link to={c.to} className="text-text-body hover:text-text-subtitle">{c.label} /</Link>
                : <span className={last ? 'truncate text-text-subtitle' : 'text-text-body'}>{c.label}{!last && ' /'}</span>}
            </Fragment>
          )
        })}
      </nav>
      {centre && <div className="flex justify-center">{centre}</div>}
      <div className="flex items-center justify-end gap-3">{right}</div>
    </header>
  )
}
