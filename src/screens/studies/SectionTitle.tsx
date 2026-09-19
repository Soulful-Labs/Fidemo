import { Link } from 'react-router-dom'

/** Section heading with an optional "View All". */
export default function SectionTitle({
  title, viewAllTo,
}: { title: string; viewAllTo?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-title-s text-text-title">{title}</h2>
      {viewAllTo && <Link to={viewAllTo} className="text-text-medium text-brand-primary">View All</Link>}
    </div>
  )
}
