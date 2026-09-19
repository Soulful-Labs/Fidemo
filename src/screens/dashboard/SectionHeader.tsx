import { Link } from 'react-router-dom'

/** Section title with the "View All" link the dashboard blocks carry. */
export default function SectionHeader({
  title, viewAllTo,
}: { title: string; viewAllTo?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-title-s text-text-title">{title}</h2>
      {viewAllTo && (
        <Link to={viewAllTo} className="text-text-medium text-brand-primary">View All</Link>
      )}
    </div>
  )
}
