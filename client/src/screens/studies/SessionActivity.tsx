import { useState } from 'react'
import Button from '../../components/ui/Button'
import { ChevronDown, Search, Star, UsersIcon } from '../../components/ui/icons'
import { ScoreCell } from '../../components/client/RespondentTable'
import { useOpenProfile } from '../../app/ProfileHost'
import type { Recruit } from '@shared/derive'
import type { ClientStudy } from '../../platform'
import { monthDayYearTime } from '@shared/format'
import { ActivityList, PinCard } from './respondentBits'
import RatePanel from './RatePanel'

/**
 * A group session's Activity tab (1627:106405): a search, then each
 * participant with View Profile, View Activity (their steps, opened in place)
 * and Rate or Rated once they have completed, then the shared PIN.
 */
export default function SessionActivity({ study, people, pin }: {
  study: ClientStudy; people: Recruit[]
  pin: { pin?: string; onShared?: (code: string) => void; text?: string }
}) {
  const openProfile = useOpenProfile()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(0)
  const [rating, setRating] = useState<string | undefined>()
  const q = query.trim().toLowerCase()
  const shown = people.filter((r) => !q || r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q))

  return (
    <div className="flex flex-col gap-3 p-4">
      <label className="flex h-10 items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3">
        <Search className="h-4 w-4 text-text-subtitle" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or role" aria-label="Search by name or role"
          className="flex-1 bg-transparent text-text-regular text-text-title outline-none placeholder:text-text-body" />
      </label>
      {shown.length === 0 && <p className="py-6 text-center text-text-regular text-text-subtitle">{people.length ? 'No one matches this search.' : 'No one has booked a seat in this session yet.'}</p>}
      {shown.map((r, i) => {
        const finished = r.state === 'completed' || r.state === 'rated'
        return (
          <article key={r.id} className="overflow-hidden rounded-lg border-1 border-stroke-1">
            <header className="flex h-[60px] items-center gap-3 bg-bg-1 px-3">
              <div className="flex flex-1 flex-col">
                <span className="text-body-medium text-text-title">{r.name}</span>
                <span className="text-text-regular text-text-subtitle">{r.role}</span>
              </div>
              <ScoreCell score={r.score} tier={r.tier} />
              <Button variant="tertiary" size="none" className="h-[38px] px-3" leftIcon={<UsersIcon className="h-4 w-4" />} onClick={() => openProfile(r.id)}>View Profile</Button>
              <Button variant="secondary" size="none" className="h-[38px] px-3" onClick={() => setOpen(open === i ? -1 : i)}
                rightIcon={open === i ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}>View Activity</Button>
              {finished && (r.state === 'rated'
                ? <span className="flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-4 text-text-medium text-text-title">Rated</span>
                : <Button size="none" className="h-[38px] px-3" leftIcon={<Star className="h-4 w-4" />} onClick={() => setRating(r.id)}>Rate</Button>)}
            </header>
            {open === i && (
              <div className="px-4 pb-4">
                <ActivityList events={r.participation.events.map((e) => ({ label: e.label, at: monthDayYearTime(e.at) }))} />
              </div>
            )}
          </article>
        )
      })}
      <PinCard variant="activity" {...pin} />
      <RatePanel open={rating !== undefined} onClose={() => setRating(undefined)} study={study} personId={rating} />
    </div>
  )
}
