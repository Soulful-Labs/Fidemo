import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, ChevronUp } from '../../components/ui/icons'
import Tag from '../../components/ui/Tag'
import type { ActionGroup, ActionRow } from '../../mock/dashboard'

const Dot = () => <span aria-hidden="true" className="px-2 text-text-subtitle">•</span>

/**
 * One group under Actions Pending, measured on 1851:115853: a 1px stroke-1
 * box with Radius/L; a 52px bgAlt-1 header (12 in: the 20px chevron, 8, the
 * Body 16 title, 8, the count Tag) with "View All >" 12 from the right; then
 * 68px rows on bg-0 with a stroke-1 rule between them: an optional 44px
 * thumbnail, 8, the 14px title (medium) and its second line; on the right,
 * "View" over the time. The chevron collapses the group (both states are
 * drawn: Client-Business Verification on 1872:70720, Client on 1872:71711).
 */
export default function ActionGroupCard({ group }: { group: ActionGroup }) {
  const [open, setOpen] = useState(!group.collapsed)
  return (
    <section className="overflow-hidden rounded-lg border-1 border-stroke-1 bg-bg-0">
      <header className="flex h-[52px] items-center gap-2 bg-bgAlt-1 px-3">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-text-title">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          <span className="text-body-medium">{group.title}</span>
        </button>
        <Tag tone="count">{group.count}</Tag>
        <Link to={group.viewAll} className="ml-auto flex items-center gap-1 text-text-medium text-text-title">
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </header>
      {open && group.rows.map((row) => <Row key={row.id} row={row} />)}
    </section>
  )
}

function Row({ row }: { row: ActionRow }) {
  return (
    <div className="flex h-[68px] items-center gap-2 border-t-1 border-stroke-1 px-3">
      {row.thumb && <img src={row.thumb} alt="" className="h-11 w-11 shrink-0 rounded-xs object-cover" />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-text-medium leading-5 text-text-title">
          {row.title}
          {row.meta && <><Dot /><span className="text-text-regular text-text-subtitle">{row.meta}</span></>}
        </p>
        <p className="truncate text-text-regular leading-5 text-text-subtitle">
          {row.lead && <><span className="text-text-title">{row.lead}</span><Dot /></>}
          {row.detail.map((d, i) => <Fragment key={i}>{i > 0 && <Dot />}{d}</Fragment>)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Link to={row.to} className="text-text-regular leading-5 text-text-title">View</Link>
        <span className="text-text-regular leading-5 text-text-body">{row.when}</span>
      </div>
    </div>
  )
}
