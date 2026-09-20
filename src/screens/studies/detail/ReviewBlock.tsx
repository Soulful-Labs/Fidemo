import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { Star } from '../../../components/ui/icons'
import type { Study } from '../../../mock/types'

const stars = (n: number) => (
  <span className="flex items-center gap-1 text-body-medium text-text-title">
    <Star className="text-brand-primary" />
    {n}
  </span>
)

/**
 * PRD 6.15, drawn inside the Paid banner (919:73336): the client's review of
 * the respondent with its Trust Score effect, then the respondent's review of
 * the client with Edit Rating, or the nudge when either side has not rated.
 */
export default function ReviewBlock({ study }: { study: Study }) {
  const navigate = useNavigate()
  const { clientReview, userReview } = study
  const yourStars = userReview ? Math.round((userReview.reliability + userReview.communication) / 2) : 0

  return (
    <div className="flex flex-col gap-3 border-t-1 border-stroke-3 pt-3">
      <p className="text-body-medium text-text-title">Client&apos;s review for you</p>
      {clientReview ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {stars(clientReview.stars)}
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
        </div>
      ) : (
        <p className="text-text-regular text-text-subtitle">
          Rate and review. The client has not rated you yet! No worries, we will remind them twice for it.
        </p>
      )}

      <p className="pt-1 text-body-medium text-text-title">Your review for client</p>
      {userReview ? (
        <>
          <div className="flex items-center gap-2">
            {stars(yourStars)}
            {userReview.comment && <span className="text-text-regular text-text-subtitle">{userReview.comment}</span>}
          </div>
          <Button variant="secondary" fullWidth onClick={() => navigate(`/studies/${study.id}/rate`)}>Edit Rating</Button>
        </>
      ) : (
        <p className="text-text-regular text-text-subtitle">You have not rated {study.client.name} yet.</p>
      )}
    </div>
  )
}
