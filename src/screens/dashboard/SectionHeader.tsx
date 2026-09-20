import { Link } from 'react-router-dom'
import { ChevronRight } from '../../components/ui/icons'

/** Section title, 20px medium, as on the dashboard blocks. */
export default function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-title-m text-text-title">{title}</h2>
}

/** The full-width outlined "View All >" button that closes a dashboard list. */
export function ViewAll({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="flex h-btn w-full items-center justify-center gap-2 rounded-lg border-1 border-cta-tertiaryStroke text-body-medium text-text-title hover:bg-bg-2"
    >
      View All
      <ChevronRight className="h-5 w-5" />
    </Link>
  )
}
