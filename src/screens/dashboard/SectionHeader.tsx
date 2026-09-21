import { Link } from 'react-router-dom'
import { ChevronRight } from '../../components/ui/icons'

/** Section title, 20px medium, as on the dashboard blocks. */
export default function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-title-m text-text-title">{title}</h2>
}

const VIEW_ALL = 'flex h-btn w-full items-center justify-center gap-2 rounded-lg border-1 border-cta-tertiaryStroke text-body-medium text-text-title hover:bg-bg-2'

/** The full-width outlined "View All >" button that closes a list. */
export function ViewAll({ to, onClick }: { to?: string; onClick?: () => void }) {
  const body = (
    <>
      View All
      <ChevronRight className="h-5 w-5" />
    </>
  )
  return to ? (
    <Link to={to} className={VIEW_ALL}>{body}</Link>
  ) : (
    <button type="button" onClick={onClick} className={VIEW_ALL}>{body}</button>
  )
}
