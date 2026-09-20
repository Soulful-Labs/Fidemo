import BottomSheet from '../../components/ui/BottomSheet'
import { Check } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { SORT_OPTIONS } from '../../lib/studyFilters'
import type { SortKey } from '../../mock/storeTypes'

/** Sort options from PRD 6.2, applied on select. */
export default function SortMenu({
  open, onClose, value, onSelect,
}: { open: boolean; onClose: () => void; value: SortKey; onSelect: (key: SortKey) => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <ul className="flex flex-col gap-2">
        {SORT_OPTIONS.map((option) => {
          const active = option.key === value
          return (
            <li key={option.key}>
              <button
                type="button"
                onClick={() => { onSelect(option.key); onClose() }}
                className={cn(
                  'flex h-input w-full items-center justify-between rounded-md border-1 px-4 text-left text-body-regular',
                  active ? 'border-cta-primary bg-yellow-1000/50 text-brand-primary' : 'border-transparent bg-bg-1 text-text-title',
                )}
              >
                {option.label}
                {active && <Check className="text-brand-primary" />}
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
