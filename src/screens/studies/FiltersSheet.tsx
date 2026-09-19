import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Picker from '../../components/ui/Picker'
import RangeSlider from '../../components/ui/RangeSlider'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { STUDY_TYPE_LABEL } from '../../components/app/StudyTypeTag'
import { cn } from '../../lib/cn'
import { money } from '../../lib/format'
import { DEFAULT_FILTERS, PRICE_RANGE, TIME_RANGE } from '../../mock/storeTypes'
import type { StudyFilters } from '../../mock/storeTypes'
import type { StudyType } from '../../mock/types'
import { INDUSTRIES, PROFESSIONS } from '../onboarding/options'

const TYPES = Object.keys(STUDY_TYPE_LABEL) as StudyType[]

/**
 * PRD 6.3. Full screen, title "Filters", Reset and Apply.
 *
 * Edits a local draft so nothing changes behind the sheet until Apply, which
 * is what "Applies to the list and closes" means in the button table.
 */
export default function FiltersSheet({
  open, filters, onClose, onApply, onReset,
}: {
  open: boolean
  filters: StudyFilters
  onClose: () => void
  onApply: (next: StudyFilters) => void
  onReset: () => void
}) {
  const [draft, setDraft] = useState(filters)
  const [picker, setPicker] = useState<'industries' | 'occupations' | null>(null)

  useEffect(() => { if (open) setDraft(filters) }, [open, filters])
  if (!open) return null

  const patch = (p: Partial<StudyFilters>) => setDraft((d) => ({ ...d, ...p }))
  const toggleType = (type: StudyType) =>
    patch({ types: draft.types.includes(type) ? draft.types.filter((t) => t !== type) : [...draft.types, type] })

  const chips = (key: 'industries' | 'occupations', label: string, onOpen: () => void) => (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-medium text-text-subtitle">{label}</span>
        <button type="button" onClick={onOpen} className="text-label text-brand-primary">+ Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {draft[key].length === 0 && <span className="text-label text-text-disabled">Any</span>}
        {draft[key].map((v) => (
          <Tag key={v} tone="yellow" onRemove={() => patch({ [key]: draft[key].filter((x) => x !== v) } as Partial<StudyFilters>)}>
            {v}
          </Tag>
        ))}
      </div>
    </section>
  )

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-frame flex-col bg-bg-0">
      <TopBar
        title="Filters"
        onBack={onClose}
        right={
          <button
            type="button"
            onClick={() => { setDraft({ ...DEFAULT_FILTERS, query: draft.query, sort: draft.sort }); onReset() }}
            className="text-text-medium text-brand-primary"
          >
            Reset
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <section className="flex flex-col gap-2">
          <span className="text-text-medium text-text-subtitle">Study Category</span>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                aria-pressed={draft.types.includes(type)}
                className={cn(
                  'h-btn-sm rounded-full border-1 px-4 text-text-medium transition-colors',
                  draft.types.includes(type)
                    ? 'border-cta-primary bg-cta-primary text-cta-primaryText'
                    : 'border-cta-tertiaryStroke bg-bg-1 text-text-body',
                )}
              >
                {STUDY_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </section>

        <RangeSlider
          label="Price" min={PRICE_RANGE[0]} max={PRICE_RANGE[1]} step={10}
          value={draft.price} onChange={(price) => patch({ price })}
          format={([a, b]) => `${money(a)}-${money(b)}`}
        />

        <RangeSlider
          label="Study Time" min={TIME_RANGE[0]} max={TIME_RANGE[1]} step={5}
          value={draft.time} onChange={(time) => patch({ time })}
          format={([a, b]) => `${a}-${b} minutes`}
        />

        {chips('industries', 'Industries', () => setPicker('industries'))}
        {chips('occupations', 'Occupations', () => setPicker('occupations'))}
      </div>

      <div className="px-4 pb-6 pt-2">
        <Button fullWidth onClick={() => onApply(draft)}>Apply</Button>
      </div>

      <Picker
        open={picker === 'industries'} onClose={() => setPicker(null)}
        title="Select Industry" options={INDUSTRIES} value={draft.industries}
        multiple searchable searchPlaceholder="Select industry field of your profession"
        onSelect={() => undefined} onApply={(industries) => patch({ industries })}
      />
      <Picker
        open={picker === 'occupations'} onClose={() => setPicker(null)}
        title="Select Profession" options={PROFESSIONS} value={draft.occupations}
        multiple searchable searchPlaceholder="Search and select your profession"
        onSelect={() => undefined} onApply={(occupations) => patch({ occupations })}
      />
    </div>
  )
}
