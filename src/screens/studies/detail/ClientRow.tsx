import { Link } from 'react-router-dom'
import { ChevronRight, Star } from '../../../components/ui/icons'
import type { Study } from '../../../mock/types'

/**
 * "For RJP Pharma Ltd." with the rating, tappable through to Client Ratings.
 *
 * Conflict 21 flags that naming the client to respondents is unconfirmed
 * (open item 15); it is shown here as drawn.
 */
export default function ClientRow({ study }: { study: Study }) {
  return (
    <Link
      to={`/clients/${study.client.id}/ratings`}
      className="flex items-center gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 p-3"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-2 text-label text-text-body">
        {study.client.name.charAt(0)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-medium text-text-title">For {study.client.name}</span>
        <span className="flex items-center gap-1 text-label text-text-body">
          <Star className="text-brand-primary" />
          {study.client.rating} ({study.client.reviewCount})
        </span>
      </span>
      <ChevronRight className="ml-auto text-text-body" />
    </Link>
  )
}
