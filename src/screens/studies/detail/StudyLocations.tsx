import Button from '../../../components/ui/Button'
import type { Study } from '../../../mock/types'

/** In-Person and In-Person Group only (PRD 6.6). */
export default function StudyLocations({ study }: { study: Study }) {
  if (!study.locations?.length) return null

  const directions = (address: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-s text-text-title">Study Locations</h2>
      {study.locations.map((location) => (
        <div key={location.id} className="flex flex-col gap-2 rounded-lg border-1 border-stroke-2 bg-bg-1 p-3">
          <p className="text-body-medium text-text-title">{location.label}</p>
          <p className="text-label text-text-body">{location.address}</p>
          <Button size="sm" variant="ghost" className="self-start" onClick={() => directions(location.address)}>
            View Directions
          </Button>
        </div>
      ))}
    </section>
  )
}
