import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Picker from '../../components/ui/Picker'
import RangeSlider from '../../components/ui/RangeSlider'
import SelectField from '../../components/ui/SelectField'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { STUDY_TYPE_LABEL, StudyTypeIcon } from '../../components/app/StudyTypeTag'
import { cn } from '../../lib/cn'
import { money } from '../../lib/format'
import { DEFAULT_FILTERS, PRICE_RANGE, TIME_RANGE } from '../../mock/storeTypes'
import type { StudyFilters } from '../../mock/storeTypes'
import type { StudyType } from '../../mock/types'
import { INDUSTRIES, PROFESSIONS } from '../onboarding/options'

const TYPES = Object.keys(STUDY_TYPE_LABEL) as StudyType[]

const BOX = 'flex h-btn items-center justify-center gap-2 rounded-md border-1 text-body-regular transition-colors'
const BOX_ON = 'border-transparent bg-cta-secondary text-cta-secondaryText'
const BOX_OFF = 'border-stroke-3 text-text-title hover:border-cta-tertiaryStroke'

/**
 * PRD 6.3, Figma 919:72968. Full screen, title "Filters", Reset and Apply in
 * the CTA bar. Edits a local draft so nothing changes behind the sheet until
 * Apply, which is what "Applies to the list and closes" means.
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

  const chips = (key: 'industries' | 'occupations') =>
    draft[key].length > 0 && (
      <div className="flex flex-wrap gap-2">
        {draft[key].map((v) => (
          <Tag key={v} tone="neutral" size="md" onRemove={() => patch({ [key]: draft[key].filter((x) => x !== v) } as Partial<StudyFilters>)}>
            {v}
          </Tag>
        ))}
      </div>
    )

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-frame flex-col bg-bg-0">
      <TopBar title="Filters" onBack={onClose} />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6 pt-6">
        <section className="flex flex-col gap-3">
          <span className="text-body-regular text-text-subtitle">Study Category</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => patch({ types: [] })}
              aria-pressed={draft.types.length === 0}
              className={cn(BOX, draft.types.length === 0 ? BOX_ON : BOX_OFF)}
            >
              All
            </button>
            {TYPES.map((type) => {
              const on = draft.types.includes(type)
              return (
                <button key={type} type="button" onClick={() => toggleType(type)} aria-pressed={on} className={cn(BOX, on ? BOX_ON : BOX_OFF)}>
                  <StudyTypeIcon type={type} className="text-brand-primary" />
                  {STUDY_TYPE_LABEL[type]}
                </button>
              )
            })}
          </div>
        </section>

        <RangeSlider
          label="Price" min={PRICE_RANGE[0]} max={PRICE_RANGE[1]} step={10}
          value={draft.price} onChange={(price) => patch({ price })}
          format={([a, b]) => `${money(a)}-${b >= PRICE_RANGE[1] ? `${b}+` : b}`}
        />

        <RangeSlider
          label="Study Time" min={TIME_RANGE[0]} max={TIME_RANGE[1]} step={5}
          value={draft.time} onChange={(time) => patch({ time })}
          format={([a, b]) => `${a}-${b} minutes`}
        />

        <section className="flex flex-col gap-3">
          <SelectField label="Industry Domains" placeholder="Select Industries" onOpen={() => setPicker('industries')} />
          {chips('industries')}
        </section>

        <section className="flex flex-col gap-3">
          <SelectField label="Occupations" placeholder="Select occupation" onOpen={() => setPicker('occupations')} />
          {chips('occupations')}
        </section>
      </div>

      <CtaBar>
        <Button
          variant="secondary" className="flex-1"
          onClick={() => { setDraft({ ...DEFAULT_FILTERS, query: draft.query, sort: draft.sort }); onReset() }}
        >
          Reset
        </Button>
        <Button className="flex-1" onClick={() => onApply(draft)}>Apply</Button>
      </CtaBar>

      <Picker
        open={picker === 'industries'} onClose={() => setPicker(null)}
        title="Select Industry" subtitle="Select industry field of your profession"
        options={INDUSTRIES} value={draft.industries}
        multiple searchable searchPlaceholder="Search industry..."
        onSelect={() => undefined} onApply={(industries) => patch({ industries })}
      />
      <Picker
        open={picker === 'occupations'} onClose={() => setPicker(null)}
        title="Select Profession" subtitle="Search and select your profession"
        options={PROFESSIONS} value={draft.occupations}
        multiple searchable searchPlaceholder="Search profession..."
        onSelect={() => undefined} onApply={(occupations) => patch({ occupations })}
      />
    </div>
  )
}
