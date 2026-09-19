import Tag from '../../components/ui/Tag'
import { STUDY_TYPE_LABEL } from '../../components/app/StudyTypeTag'
import { money } from '../../lib/format'
import { DEFAULT_FILTERS } from '../../mock/storeTypes'
import type { StudyFilters } from '../../mock/storeTypes'
import { useStore } from '../../mock/store'

/** Chips for whatever the Filters sheet currently has applied. */
export default function ActiveFilters({ filters }: { filters: StudyFilters }) {
  const { setFilters, resetFilters } = useStore()
  const d = DEFAULT_FILTERS

  const priceChanged = filters.price[0] !== d.price[0] || filters.price[1] !== d.price[1]
  const timeChanged = filters.time[0] !== d.time[0] || filters.time[1] !== d.time[1]
  const any =
    filters.types.length || filters.industries.length || filters.occupations.length ||
    priceChanged || timeChanged

  if (!any) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4">
      {filters.types.map((type) => (
        <Tag key={type} tone="yellow" onRemove={() => setFilters({ types: filters.types.filter((t) => t !== type) })}>
          {STUDY_TYPE_LABEL[type]}
        </Tag>
      ))}
      {filters.industries.map((industry) => (
        <Tag key={industry} tone="yellow" onRemove={() => setFilters({ industries: filters.industries.filter((i) => i !== industry) })}>
          {industry}
        </Tag>
      ))}
      {filters.occupations.map((occupation) => (
        <Tag key={occupation} tone="yellow" onRemove={() => setFilters({ occupations: filters.occupations.filter((o) => o !== occupation) })}>
          {occupation}
        </Tag>
      ))}
      {priceChanged && (
        <Tag tone="yellow" onRemove={() => setFilters({ price: d.price })}>
          {money(filters.price[0])}-{money(filters.price[1])}
        </Tag>
      )}
      {timeChanged && (
        <Tag tone="yellow" onRemove={() => setFilters({ time: d.time })}>
          {filters.time[0]}-{filters.time[1]} minutes
        </Tag>
      )}
      <button type="button" onClick={resetFilters} className="text-label text-brand-primary">
        Clear all
      </button>
    </div>
  )
}
