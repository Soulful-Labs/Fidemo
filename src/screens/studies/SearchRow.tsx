import Input from '../../components/ui/Input'
import { Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

const ICON_BUTTON =
  'flex h-input w-12 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3 bg-transparent text-text-title hover:text-text-body'

/** Search field, sort icon and filter icon (PRD 6.2, Figma 919:72943). */
export default function SearchRow({
  query, onQuery, onSort, onFilter, activeFilters = 0,
}: {
  query: string
  onQuery: (next: string) => void
  onSort?: () => void
  onFilter?: () => void
  activeFilters?: number
}) {
  return (
    <div className="flex items-center gap-2 px-4">
      <Input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search studies..."
        aria-label="Search studies"
        leftIcon={<Search className="text-text-title" />}
      />

      {onSort && (
        <button type="button" onClick={onSort} aria-label="Sort" className={ICON_BUTTON}>
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          aria-label={`Filters${activeFilters ? `, ${activeFilters} active` : ''}`}
          className={cn(ICON_BUTTON, 'relative', activeFilters > 0 && 'border-cta-primary text-brand-primary')}
        >
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M4 7h10m4 0h2M4 12h2m4 0h10M4 17h10m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {activeFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cta-primary text-label text-cta-primaryText">
              {activeFilters}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
