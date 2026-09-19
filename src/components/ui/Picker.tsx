import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import BottomSheet from './BottomSheet'
import Button from './Button'
import Input from './Input'
import { Check, Search } from './icons'

export interface PickerProps {
  open: boolean
  onClose: () => void
  title: string
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
 * multi-selects inside Filters all use this one component.
 */
export default function Picker({
  open,
  onClose,
  title,
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
  const [draft, setDraft] = useState<string[]>(Array.isArray(value) ? value : [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  }, [options, query])

  const isChosen = (option: string) =>
    multiple ? draft.includes(option) : value === option

  const choose = (option: string) => {
    if (multiple) {
      setDraft((prev) =>
        prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option],
      )
      return
    }
    onSelect(option)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      alt={alt}
      tall
      footer={
        multiple ? (
          <Button fullWidth onClick={() => { onApply?.(draft); onClose() }}>
            Apply
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3">
        {searchable && (
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={<Search />}
            aria-label={searchPlaceholder}
          />
        )}

        {visible.length === 0 ? (
          <p className="py-6 text-center text-text-regular text-text-body">
            No matches for “{query}”
          </p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((option) => {
              const chosen = isChosen(option)
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => choose(option)}
                    className={cn(
                      'flex h-12 w-full items-center justify-between gap-3 border-b-1 border-stroke-2 px-1 text-left text-body-regular transition-colors',
                      chosen ? 'text-brand-primary' : 'text-text-subtitle hover:text-text-title',
                    )}
                  >
                    {option}
                    {chosen && <Check className="text-brand-primary" />}
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
