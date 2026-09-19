import Input from '../../components/ui/Input'
import { Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

const ICON_BUTTON =
  'flex h-input w-12 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3 bg-bg-1 text-text-body hover:text-text-title'

/** Search field, sort icon and filter icon (PRD 6.2). */
export default function SearchRow({
  query, onQuery, onSort, onFilter, activeFilters,
}: {
  query: string
  onQuery: (next: string) => void
  onSort: () => void
  onFilter: () => void
  activeFilters: number
}) {
  return (
    <div className="flex items-center gap-2 px-4">
      <Input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search studies..."
        aria-label="Search studies"
        leftIcon={<Search />}
      />

      <button type="button" onClick={onSort} aria-label="Sort" className={ICON_BUTTON}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onFilter}
        aria-label={`Filters${activeFilters ? `, ${activeFilters} active` : ''}`}
        className={cn(ICON_BUTTON, 'relative', activeFilters > 0 && 'border-cta-primary text-brand-primary')}
      >
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M3 5h18l-7 8v6l-4 2v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        {activeFilters > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cta-primary text-label text-cta-primaryText">
            {activeFilters}
          </span>
        )}
      </button>
    </div>
  )
}
