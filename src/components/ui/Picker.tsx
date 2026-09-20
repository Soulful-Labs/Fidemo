import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import BottomSheet from './BottomSheet'
import Button from './Button'
import Input from './Input'
import { Search } from './icons'

export interface PickerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  options: string[]
  /** A string for single select, an array when `multiple` is set. */
  value?: string | string[]
  onSelect: (value: string) => void
  onApply?: (values: string[]) => void
  multiple?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  alt?: boolean
}

/**
 * Shared option picker: Education Level, Industry, Profession, ID type and the
 * multi-selects inside Filters all use this one component. Options are the
 * dark option cards from Figma (1236:80597); tapping highlights, Save commits.
 */
export default function Picker({
  open,
  onClose,
  title,
  subtitle,
  options,
  value,
  onSelect,
  onApply,
  multiple = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  alt = false,
}: PickerProps) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<string[]>([])

  // Start each opening from the committed value.
  useEffect(() => {
    if (open) setDraft(Array.isArray(value) ? value : value ? [value] : [])
  }, [open, value])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  }, [options, query])

  const choose = (option: string) => {
    setDraft((prev) =>
      multiple
        ? prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
        : [option],
    )
  }

  const save = () => {
    if (multiple) onApply?.(draft)
    else if (draft[0]) onSelect(draft[0])
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      alt={alt}
      tall
      footer={
        <Button fullWidth disabled={draft.length === 0} onClick={save}>
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {searchable && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="text-text-title" />}
            aria-label={searchPlaceholder}
          />
        )}

        {visible.length === 0 ? (
          <p className="py-6 text-center text-text-regular text-text-body">
            No matches for “{query}”
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((option) => {
              const chosen = draft.includes(option)
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={chosen}
                    onClick={() => choose(option)}
                    className={cn(
                      'flex h-input w-full items-center rounded-md border-1 px-4 text-left text-body-regular transition-colors',
                      chosen
                        ? 'border-cta-primary bg-yellow-1000/50 text-brand-primary'
                        : cn('border-transparent text-text-title', alt ? 'bg-bgAlt-2' : 'bg-bg-1'),
                    )}
                  >
                    {option}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </BottomSheet>
  )
}
