import { useState } from 'react'
import Button from '../../components/ui/Button'
import RespondentCard from '../../components/client/RespondentCard'
import { ChevronLeft, Close, Plus } from '../../components/ui/icons'
import FilterRail from '../pool/poolBits'
import { POOL_DEFAULT_FILTERS, POOL_SEARCH, usePool } from '../../mock/pool'
import type { PoolPerson } from '../../mock/pool'
import { matchesPool, poolChips } from '../../lib/poolFilter'
import { participationOf } from '@shared/lifecycle'
import type { ClientStudy as Study } from '../../platform'

const RAIL = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M10 4v16M6.8 8.5h.4M6.8 11.5h.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

/**
 * INVITE FROM POOL (15 Oct 2026), inside the Matched tab of every study type:
 * the whole pool, searched and filtered as on the Pool screen, with "Invite
 * To This Study" on each card. Someone already on the study shows
 * "Invitation Sent!" instead. The back button returns to Matched.
 */
export default function InviteFromPool({ study, onBack, onInvite, onView }: {
  study: Study; onBack: () => void; onInvite: (p: PoolPerson) => void; onView: (p: PoolPerson) => void
}) {
  const { people: POOL, total } = usePool()
  const [f, setF] = useState({ ...POOL_DEFAULT_FILTERS })
  const [query, setQuery] = useState('')
  const [rail, setRail] = useState(true)
  const [limit, setLimit] = useState(12)
  const people = POOL.filter((p) => matchesPool(p, f))
  const chips = poolChips(f)
  const clear = () => { setF({ ...POOL_DEFAULT_FILTERS }); setQuery('') }
  const onStudy = (id: string) => Boolean(participationOf(study, id) && participationOf(study, id)!.state !== 'matched')

  return (
    <div className="flex flex-col px-4 pt-4">
      <div className="flex items-center gap-3 border-b-1 border-stroke-1 pb-4">
        <button type="button" aria-label="Back to Matched" onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-md border-1 border-stroke-input bg-bg-0 text-text-title hover:bg-bg-1"><ChevronLeft className="h-4 w-4" /></button>
        <h2 className="text-title-s text-text-title">Invite to this study from the pool</h2>
      </div>

      <h3 className="pb-[11px] pt-6 text-body-medium text-text-title">Find Participants</h3>
      <form className="flex h-[62px] items-center justify-between gap-4 rounded-lg border-1 border-stroke-3 bg-bgAlt-1 pl-4 pr-[11px]"
        onSubmit={(e) => { e.preventDefault(); setF({ ...f, query }) }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={POOL_SEARCH} aria-label="Find participants"
          className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body" />
        <Button type="submit" variant="secondary" size="row" className="px-3"
          leftIcon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M20 11a8 8 0 1 0-3.2 6.4M17 17l3.5 3.5M17 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}>
          Find and Filter
        </Button>
      </form>

      <div className="flex pt-6">
        {rail && (
          <div className="mr-4 w-[240px] shrink-0 border-r-1 border-stroke-1 pr-4">
            <div className="flex h-7 items-center gap-2 text-body-regular text-text-title">
              Filters
              <button type="button" aria-label="Hide filters" onClick={() => setRail(false)} className="flex h-6 w-7 items-center justify-center rounded-sm bg-bgAlt-2 text-text-title hover:bg-bg-2">{RAIL}</button>
              <span className="flex-1" />
              <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-text-medium text-text-title hover:text-brand-primary">Reset</button>
            </div>
            <div className="mt-[11px] border-t-1 border-stroke-1 pt-[9px]"><FilterRail value={f} onChange={setF} /></div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
            {!rail && <button type="button" onClick={() => setRail(true)} className="mr-1 inline-flex h-7 items-center gap-1.5 rounded-sm bg-bgAlt-2 px-2 text-text-regular text-text-title hover:bg-bg-2">{RAIL}Show Filters</button>}
            <span className="pr-1 text-text-regular text-text-subtitle">{people.length} of {total} results</span>
            {chips.map((c) => (
              <span key={c.key} className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle">
                {c.label}
                <button type="button" aria-label={`Remove ${c.label}`} onClick={() => setF(c.remove(f))} className="text-text-subtitle hover:text-text-title"><Close className="h-4 w-4" /></button>
              </span>
            ))}
            {(chips.length > 0 || query !== '') && (
              <button type="button" onClick={clear} className="inline-flex h-7 items-center gap-1 px-1 text-text-regular text-text-subtitle hover:text-text-title"><Close className="h-4 w-4" />Clear All</button>
            )}
          </div>
          <div className="mt-[14px] border-t-1 border-stroke-1" />
          {people.length === 0 && <p className="py-16 text-center text-body-regular text-text-subtitle">Nobody in the pool matches every filter. Take one off to widen it.</p>}
          <div className={rail ? 'grid grid-cols-2 gap-3 pt-3' : 'grid grid-cols-3 gap-3 pt-3'}>
            {people.slice(0, limit).map((p) => (
              <RespondentCard key={p.id} respondent={p} actions={onStudy(p.id) ? (
                <Button variant="tertiary" size="none" className="h-11 flex-1" disabled>Invitation Sent!</Button>
              ) : (
                <>
                  <Button variant="tertiary" size="none" className="h-11 flex-1" leftIcon={<Plus className="h-4 w-4" />} onClick={() => onInvite(p)}>Invite To This Study</Button>
                  <Button variant="tertiary" size="none" className="h-11 flex-1" onClick={() => onView(p)}>View Profile</Button>
                </>
              )} />
            ))}
            {people.length > limit && (
              <button type="button" onClick={() => setLimit((n) => n + 12)} className="col-span-full py-4 text-body-medium text-brand-primary hover:underline">
                Load more ({people.length - limit} more)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
