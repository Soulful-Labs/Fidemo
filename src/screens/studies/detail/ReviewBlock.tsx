import { useNavigate } from 'react-router-dom'
import StarRating from '../../../components/app/StarRating'
import Button from '../../../components/ui/Button'
import { Star } from '../../../components/ui/icons'
import type { Study } from '../../../mock/types'

/**
 * PRD 6.15, drawn inside the Paid banner (919:73336 and 919:73224): the
 * client's review of the respondent with its Trust Score effect, then the
 * respondent's review of the client with Edit Rating, or the "Rate and
 * review" nudge and Rate Client button while either side is missing.
 */
export default function ReviewBlock({ study }: { study: Study }) {
  const navigate = useNavigate()
  const { clientReview, userReview } = study
  const yourStars = userReview ? Math.round((userReview.reliability + userReview.communication) / 2) : 0
  const rate = () => navigate(`/studies/${study.id}/rate`)

  return (
    <div className="flex flex-col gap-3 border-t-1 border-stroke-3 pt-3">
      {clientReview ? (
        <>
          <p className="text-body-medium text-text-title">Client&apos;s review for you</p>
          <div className="flex items-center gap-2">
            <StarRating value={clientReview.stars} size="sm" />
            <span className="text-body-medium text-text-title">{clientReview.stars}</span>
            <span className="text-text-medium text-brand-secondary">
              {clientReview.trustDelta >= 0 ? '+' : ''}{clientReview.trustDelta} Trust score
            </span>
          </div>
          <p className="text-text-regular text-text-subtitle">{clientReview.comment}</p>
          <p className="flex flex-wrap gap-x-3 text-label text-text-body">
            <span>Expertise: <span className="text-text-title">{clientReview.expertise}</span></span>
            <span>Reliability: <span className="text-text-title">{clientReview.reliability}</span></span>
            <span>Communication: <span className="text-text-title">{clientReview.communication}</span></span>
          </p>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-body-medium text-brand-primary">
            <Star filled={false} className="h-5 w-5" />
            Rate and review
          </p>
          <p className="text-text-regular italic text-text-subtitle">
            The client has not rated you yet!<br />No worries, we will remind them twice for it.
          </p>
        </>
      )}

      {userReview ? (
        <>
          <p className="text-body-medium text-text-title">Your review for client</p>
          <div className="flex items-center gap-2">
            <StarRating value={yourStars} size="sm" />
            <span className="text-body-medium text-text-title">{yourStars}</span>
            {userReview.comment && <span className="text-text-regular text-text-subtitle">{userReview.comment}</span>}
          </div>
          <Button variant="secondary" fullWidth onClick={rate}>Edit Rating</Button>
        </>
      ) : (
        <Button variant="secondary" fullWidth onClick={rate}>Rate Client</Button>
      )}
    </div>
  )
}
