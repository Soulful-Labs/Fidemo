import { useMemo, useState } from 'react'
import EmptyState from '../../components/app/EmptyState'
import { activeFilterCount, applyFilters } from '../../lib/studyFilters'
import { isExplorable } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import type { StudyFilters } from '../../mock/storeTypes'
import ActiveFilters from './ActiveFilters'
import FiltersSheet from './FiltersSheet'
import SearchRow from './SearchRow'
import SectionTitle from './SectionTitle'
import SortMenu from './SortMenu'
import StudiesTabs from './StudiesTabs'
import StudyList from './StudyList'
import { ViewAll } from '../dashboard/SectionHeader'

/** PRD 6.2. Two lists: invitations to apply, then recommended studies. */
export default function Explore() {
  const { studies, filters, setFilters, resetFilters, toast } = useStore()
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const visible = useMemo(
    () => applyFilters(studies.filter((s) => isExplorable(s.status)), filters),
    [studies, filters],
  )

  const invitations = visible.filter((s) => s.status === 'invited_to_apply')
  const recommended = visible.filter((s) => s.status === 'available')
  const active = activeFilterCount(filters)

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <StudiesTabs />

      <SearchRow
        query={filters.query}
        onQuery={(query) => setFilters({ query })}
        onSort={() => setSortOpen(true)}
        onFilter={() => setFiltersOpen(true)}
        activeFilters={active}
      />

      <ActiveFilters filters={filters} />

      {visible.length === 0 ? (
        <EmptyState
          title="No studies match your search"
          body="Try a different search, or clear your filters to see everything."
          actionLabel="Clear filters"
          onAction={() => { setFilters({ query: '' }); resetFilters(); toast('Filters cleared') }}
        />
      ) : (
        <div className="flex flex-col gap-6 px-4">
          {invitations.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionTitle title={`Invitations To Apply (${invitations.length})`} />
              <StudyList studies={invitations.slice(0, 2)} />
              <ViewAll to="/studies/mine/invites" />
            </section>
          )}

          {recommended.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionTitle title="Recommended Studies" />
              <StudyList studies={recommended} showActions={false} />
            </section>
          )}
        </div>
      )}

      <SortMenu
        open={sortOpen} onClose={() => setSortOpen(false)} value={filters.sort}
        onSelect={(sort) => { setFilters({ sort }); toast('Sorted') }}
      />

      <FiltersSheet
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onReset={() => { resetFilters(); toast('Filters reset') }}
        onApply={(next: StudyFilters) => {
          setFilters(next)
          setFiltersOpen(false)
          toast('Filters applied')
        }}
      />
    </div>
  )
}
