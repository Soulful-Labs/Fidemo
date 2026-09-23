import { cn } from '../../lib/cn'
import { GridIcon } from '../ui/icons'

/**
 * The square button right of the Study Type filter on Ongoing. It shows the
 * view you switch to: the grid mark on the table (1518:90600), the rows mark
 * on the cards (1518:90966).
 */
export default function ViewToggle({ view, onChange, className }: { view: 'table' | 'grid'; onChange: (next: 'table' | 'grid') => void; className?: string }) {
  const next = view === 'table' ? 'grid' : 'table'
  return (
    <button type="button" aria-label={`Switch to ${next} view`} onClick={() => onChange(next)}
      className={cn('flex h-input w-input shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-title hover:bg-bg-1', className)}>
      {view === 'table'
        ? <GridIcon className="h-5 w-5" />
        : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3.5" y="12" width="17" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3.5 19.5h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>}
    </button>
  )
}
