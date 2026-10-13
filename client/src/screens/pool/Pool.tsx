import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import RespondentCard from '../../components/client/RespondentCard'
import RespondentPanel from '../dashboard/RespondentPanel'
import { InvitePanel, ReviewsPanel, SavePanel } from './PoolPanels'
import { DeleteModal, SentModal } from './PoolModals'
import FilterRail, { PanelTile } from './poolBits'
import { Close, Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { FEATURED_CATEGORIES, FEATURED_PANELS, POOL_DEFAULT_FILTERS, POOL_SEARCH, usePool } from '../../mock/pool'
import type { PoolPerson } from '../../mock/pool'
import { matchesPool, poolChips } from '../../lib/poolFilter'
import { useWorkspace } from '../../mock/workspace'
import { useToast } from '../../components/ui/Toast'

const RAIL = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M10 4v16M6.8 8.5h.4M6.8 11.5h.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

/**
 * Pool of Participants (1645:161430 with filters, 1777:98738 without,
 * 1645:161580 my panels, 1645:162272 featured). One screen: a segmented
 * toggle picks the participants pool or the micro-panels, and each side has
 * one more state of its own.
 */
export default function Pool() {
  const toast = useToast()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const panels = params.get('view') === 'panels'
  const featured = params.get('sub') === 'featured'
  /** Featured panels are public; a client's own panels are theirs. */
  const { panels: mine, deletePanel } = useWorkspace()
  const { people: POOL_PEOPLE, total: POOL_TOTAL } = usePool()
  const [filters, setFilters] = useState(params.get('filters') !== 'hidden')
  /** The rail, the search box and the chips above the grid are one state. */
  const [f, setF] = useState({ ...POOL_DEFAULT_FILTERS })
  const [query, setQuery] = useState('')
  const [panelSearch, setPanelSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [deleting, setDeleting] = useState<string | null>(null)
  /** Whose profile the panel is showing. */
  const [viewing, setViewing] = useState<PoolPerson | null>(null)
  const [saving] = useState<{ id: string; name: string } | null>(null)
  const panelCards = (featured ? FEATURED_PANELS : mine)
    .filter((c) => category === 'All' || c.domain === category)
    .filter((c) => {
      const q = panelSearch.trim().toLowerCase()
      return !q || `${c.title} ${c.domain} ${c.roles ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q)
    })
  const people = POOL_PEOPLE.filter((p) => matchesPool(p, f))
  /** The frame draws twelve cards; the rest of the pool is behind Load more. */
  const [limit, setLimit] = useState(12)
  const chips = poolChips(f)
  /** The four 600px panels the pool cards open. */
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const set = (k: string, v: string) => { const n = new URLSearchParams(params); n.set(k, v); setParams(n) }
  const clear = () => { setF({ ...POOL_DEFAULT_FILTERS }); setQuery('') }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Pool of Participants' }]}>
      <div className={cn('rounded-lg bg-bg-0 p-4', panels ? 'min-h-[873px]' : filters ? 'min-h-[1437px]' : 'min-h-[985px]')}>
        {/* The 13 Oct 2026 exports open the Pool on the search alone: the Participants Pool / Micro-Panels switch and Create Micro-panel are gone. */}
        {!panels && <h1 className="pb-[11px] text-body-medium text-text-title">Find Participants</h1>}
        {!panels && (
          <>
            <form className="flex h-[62px] items-center justify-between gap-4 rounded-lg border-1 border-stroke-3 bg-bgAlt-1 pl-4 pr-[11px]"
              onSubmit={(e) => {
                e.preventDefault()
                const next = { ...f, query }
                setF(next)
                toast(`${POOL_PEOPLE.filter((p) => matchesPool(p, next)).length} of ${POOL_TOTAL} match`)
              }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={POOL_SEARCH}
                className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body" />
              <Button type="submit" variant="secondary" size="row" className="px-3"
                leftIcon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M20 11a8 8 0 1 0-3.2 6.4M17 17l3.5 3.5M17 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}>
                Find and Filter
              </Button>
            </form>

            <div className="flex pt-6">
              {filters && (
                <div className="mr-4 w-[262px] shrink-0 border-r-1 border-stroke-1 pr-4">
                  <div className="flex h-7 items-center gap-2 text-body-regular text-text-title">
                    Filters
                    <button type="button" aria-label="Hide filters" onClick={() => setFilters(false)}
                      className="flex h-6 w-7 items-center justify-center rounded-sm bg-bgAlt-2 text-text-title hover:bg-bg-2">{RAIL}</button>
                    <span className="flex-1" />
                    <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-text-medium text-text-title hover:text-brand-primary">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5V8H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Reset
                    </button>
                  </div>
                  <div className="mt-[11px] border-t-1 border-stroke-1 pt-[9px]"><FilterRail value={f} onChange={setF} /></div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
                  {!filters && (
                    <button type="button" onClick={() => setFilters(true)}
                      className="mr-1 inline-flex h-7 items-center gap-1.5 rounded-sm bg-bgAlt-2 px-2 text-text-regular text-text-title hover:bg-bg-2">{RAIL}Show Filters</button>
                  )}
                  <span className="pr-1 text-text-regular text-text-subtitle">
                    {people.length} of {POOL_TOTAL} results
                  </span>
                  {/* Every chip here is a filter that is on, and its cross takes it off. */}
                  {chips.map((c) => (
                    <span key={c.key} className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle">
                      {c.label}
                      <button type="button" aria-label={`Remove ${c.label}`} onClick={() => setF(c.remove(f))}
                        className="text-text-subtitle hover:text-text-title">
                        <Close className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                  {/* With nothing set there is nothing to clear, so it is not offered. */}
                  {(chips.length > 0 || query !== '') && (
                    <button type="button" onClick={clear} className="inline-flex h-7 items-center gap-1 px-1 text-text-regular text-text-subtitle hover:text-text-title">
                      <Close className="h-4 w-4" />Clear All
                    </button>
                  )}
                </div>
                {filters && <div className="mt-[14px] border-t-1 border-stroke-1" />}
                {people.length === 0 && (
                  <p className="py-16 text-center text-body-regular text-text-subtitle">
                    Nobody in the pool matches every filter. Take one off to widen it.
                  </p>
                )}
                <div className={cn('grid gap-3 pt-3', filters ? 'grid-cols-2' : 'grid-cols-3')}>
                  {people.slice(0, limit).map((p) => (
                    <RespondentCard key={p.id} respondent={p} viewButton={filters}
                      onView={() => { setViewing(p); setPanel('profile') }}
                      onInvite={() => { setViewing(p); setPanel('invite') }} />
                  ))}
                  {people.length > Math.min(limit, people.length) && (
                    <button type="button" onClick={() => setLimit((n) => n + 12)}
                      className="col-span-full py-4 text-body-medium text-brand-primary hover:underline">
                      Load more ({people.length - Math.min(limit, people.length)} more)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {panels && (
          <>
            <div className="mt-4 flex items-end justify-between gap-4">
              <Tabs value={featured ? 'featured' : 'mine'} onChange={(k) => set('sub', k)} className="flex-1"
                items={[{ key: 'mine', label: 'My Panels' }, { key: 'featured', label: 'Featured Public Panels' }]} />
              <span className="flex h-10 w-[240px] shrink-0 items-center gap-2 rounded-full border-1 border-stroke-input px-4 text-body-regular text-text-body">
                <Search className="h-4 w-4 shrink-0" />
                <input value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)}
                  placeholder="Search your panels"
                  className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body" />
              </span>
            </div>

            {featured && (
              <div className="flex flex-wrap gap-2 pt-4">
                {FEATURED_CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={c === category}
                    className={cn('inline-flex h-8 items-center rounded-full px-3 text-text-regular',
                      c === category ? 'bg-bg-1 text-text-title' : 'border-1 border-stroke-input text-text-subtitle hover:text-text-title')}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-4">
              {panelCards.length === 0 && (
                <div className="col-span-3 flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-body-medium text-text-title">
                    {panelSearch.trim() || category !== 'All'
                      ? 'No panels match that.'
                      : featured ? 'No featured panels yet.' : 'You have not built a micro-panel yet.'}
                  </p>
                  <p className="text-text-regular text-text-subtitle">
                    {featured
                      ? 'Public panels appear here once they are published.'
                      : 'Save people from the pool into a panel and recruit from it again later.'}
                  </p>
                  {!featured && (
                    <Button size="row" className="mt-1" onClick={() => nav('/pool/panels/new')}>Create Micro-panel</Button>
                  )}
                </div>
              )}
              {panelCards.map((c) => (
                <PanelTile key={c.id} c={c} to={`/pool/${featured ? 'featured' : 'panels'}/${c.id}`} onDelete={() => setDeleting(c.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      <RespondentPanel open={panel === 'profile'} respondent={viewing ?? POOL_PEOPLE[0]!}
        onClose={() => setPanel('')} onReviews={() => setPanel('reviews')}
        onInvite={() => setPanel('invite')} />
      <ReviewsPanel open={panel === 'reviews'} onClose={() => setPanel('')} onBack={() => setPanel('profile')} />
      <InvitePanel open={panel === 'invite'} name={viewing?.name.split(' ')[0]} personId={viewing?.id} onClose={() => setPanel('')} onSent={() => setPanel('sent')} />
      <SentModal open={panel === 'sent'} onClose={() => setPanel('')} />
      <DeleteModal open={deleting !== null} onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) deletePanel(deleting); setDeleting(null) }} />
      <SavePanel open={panel === 'save'} onClose={() => setPanel('')}
        personId={saving?.id} name={saving?.name} />
    </AppShell>
  )
}
