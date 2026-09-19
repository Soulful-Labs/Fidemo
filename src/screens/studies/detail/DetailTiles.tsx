import { Star } from '../../../components/ui/icons'
import { dateLong, duration, money } from '../../../lib/format'
import type { Study } from '../../../mock/types'

/** The four tiles: Reward, Duration, Rating, Ends (PRD 6.6). */
export default function DetailTiles({ study }: { study: Study }) {
  const tiles = [
    { label: 'Reward', value: money(study.reward) },
    { label: 'Duration', value: duration(study.durationMins) },
    { label: 'Rating', value: `${study.client.rating} (${study.client.reviewCount})`, icon: true },
    { label: 'Ends', value: dateLong(study.endsAt) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-lg border-1 border-stroke-2 bg-bg-1 p-3">
          <span className="text-label text-text-body">{tile.label}</span>
          <span className="flex items-center gap-1 text-body-medium text-text-title">
            {tile.icon && <Star className="text-brand-primary" />}
            {tile.value}
          </span>
        </div>
      ))}
    </div>
  )
}
