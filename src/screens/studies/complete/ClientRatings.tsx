import { useNavigate, useParams } from 'react-router-dom'
import StarRating from '../../../components/app/StarRating'
import TopBar from '../../../components/ui/TopBar'
import { Star } from '../../../components/ui/icons'
import { dateLong } from '../../../lib/format'
import { clientReviews } from '../../../mock/data'
import { useStore } from '../../../mock/store'

/**
 * PRD 6.16, Figma 1323:22940: the client's aggregate rating and the written
 * reviews other respondents left, each with the client's reply "To
 * participant".
 */
export default function ClientRatings() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { studies } = useStore()
  const client = studies.find((s) => s.client.id === clientId)?.client
  const reviews = clientReviews(clientId ?? '')

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Client Ratings" onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-1 border-b-1 border-stroke-2 px-4 pb-4 pt-4">
        {client && <p className="text-body-medium text-text-title">{client.name}</p>}
        <p className="flex items-center gap-2 text-body-regular text-text-body">
          <Star className="h-5 w-5 text-brand-primary" />
          <span className="text-title-s text-brand-secondary">{client?.rating ?? 4.5}</span>
          ({client?.reviewCount ?? reviews.length} rating-reviews)
        </p>
      </div>

      <ul className="flex flex-col px-4 pb-6">
        {reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-2 border-b-1 border-stroke-2 py-4">
            <p className="text-title-s leading-snug text-text-title">{review.study}</p>
            <p className="flex items-center gap-2 text-body-regular text-text-body">
              <StarRating value={review.stars} />
              <span className="text-body-medium text-brand-secondary">{review.stars}</span>
              <span>•</span>
              <span>{dateLong(review.at)}</span>
            </p>
            <p className="text-body-regular text-text-subtitle">{review.comment}</p>
            <p className="text-body-regular text-text-subtitle">
              <span className="text-text-body">To participant: </span>
              <span className="text-body-medium text-text-title">{review.participant.name} </span>
              <StarRating value={review.participant.stars} size="sm" />
              <span className="text-body-medium text-text-title"> {review.participant.stars.toFixed(1)}</span>
              {review.participant.comment && <span> {review.participant.comment}</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
