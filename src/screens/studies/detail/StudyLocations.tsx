import { useState } from 'react'
import { ChevronDown } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { Study } from '../../../mock/types'

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5ZM9 4v13.5M15 6.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * In-Person and In-Person Group only (PRD 6.6, Figma 919:74119): a pin
 * heading, a dropdown listing the locations, and the map button that opens
 * directions in a new tab.
 */
export default function StudyLocations({ study }: { study: Study }) {
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState(0)
  if (!study.locations?.length) return null

  const current = study.locations[chosen]
  const directions = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.address)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-body-regular text-text-subtitle">
        <Pin />
        Study Locations
      </h2>
      <div className="flex items-start gap-2">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex h-input w-full items-center justify-between gap-2 rounded-md border-1 border-stroke-3 px-4 text-left text-body-regular text-text-title"
          >
            <span className="truncate">{current.short ?? `${current.label}, ${current.address.split(', ').slice(-2).join(', ')}`}</span>
            <ChevronDown className={cn('shrink-0 text-text-title transition-transform', open && 'rotate-180')} />
          </button>
          {open && (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 flex flex-col gap-1 rounded-md bg-bg-2 p-1">
              {study.locations.map((location, i) => (
                <li key={location.id}>
                  <button
                    type="button"
                    onClick={() => { setChosen(i); setOpen(false) }}
                    className={cn('flex w-full flex-col rounded-sm px-3 py-2 text-left', i === chosen ? 'text-brand-primary' : 'text-text-subtitle')}
                  >
                    <span className="text-text-medium">{location.label}</span>
                    <span className="text-label text-text-body">{location.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={directions}
          aria-label="View Directions"
          className="flex h-input w-12 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title"
        >
          <MapIcon />
        </button>
      </div>
    </section>
  )
}
