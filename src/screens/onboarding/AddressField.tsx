import { useState } from 'react'
import Input from '../../components/ui/Input'
import { ADDRESS_SUGGESTIONS } from './options'

/**
 * Stand-in for the Google powered autocomplete (PRD 4.5). The suggestion list
 * carries the "Powered by Google" mark the design calls for.
 */
export default function AddressField({
  value, onChange,
}: { value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false)

  const matches = ADDRESS_SUGGESTIONS.filter((s) =>
    value.trim().length > 0 && s.toLowerCase().includes(value.trim().toLowerCase()),
  ).slice(0, 5)

  return (
    <div className="relative flex flex-col gap-1">
      <Input
        label="Address"
        placeholder="City, Country"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />

      {open && matches.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border-1 border-stroke-3 bg-bg-2">
          {matches.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => { onChange(suggestion); setOpen(false) }}
                className="w-full px-4 py-3 text-left text-text-regular text-text-subtitle hover:bg-bg-1 hover:text-text-title"
              >
                {suggestion}
              </button>
            </li>
          ))}
          <li className="border-t-1 border-stroke-3 px-4 py-2 text-right text-label text-text-disabled">
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  )
}
