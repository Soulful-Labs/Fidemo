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
import { Close, Plus, Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { FEATURED_CATEGORIES, FEATURED_PANELS, POOL_DEFAULT_FILTERS, POOL_PEOPLE, POOL_SEARCH, POOL_TOTAL } from '../../mock/pool'
import { matchesPool, poolChips } from '../../lib/poolFilter'
import { useWorkspace } from '../../mock/workspace'
import { useToast } from '../../components/ui/Toast'

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
  const [filters, setFilters] = useState(params.get('filters') !== 'hidden')
  /** The rail, the search box and the chips above the grid are one state. */
  const [f, setF] = useState({ ...POOL_DEFAULT_FILTERS })
  const [query, setQuery] = useState('')
  const [panelSearch, setPanelSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [deleting, setDeleting] = useState<string | null>(null)
  /** Whose profile the panel is showing. */
  const [viewing, setViewing] = useState<(typeof POOL_PEOPLE)[number] | null>(null)
  const [saving, setSaving] = useState<{ id: string; name: string } | null>(null)
  const panelCards = (featured ? FEATURED_PANELS : mine)
    .filter((c) => category === 'All' || c.domain === category)
    .filter((c) => {
      const q = panelSearch.trim().toLowerCase()
      return !q || `${c.title} ${c.domain} ${c.roles ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q)
    })
  const people = POOL_PEOPLE.filter((p) => matchesPool(p, f))
  const chips = poolChips(f)
  /** The four 600px panels the pool cards open. */
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const set = (k: string, v: string) => { const n = new URLSearchParams(params); n.set(k, v); setParams(n) }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Pool of Participants' }]}>
      <div className={cn('rounded-lg bg-bg-0 p-4', panels ? 'min-h-[873px]' : filters ? 'min-h-[1437px]' : 'min-h-[985px]')}>
        <div className="flex items-center justify-between gap-4">
          <Tabs variant="segmented" className="w-[342px]" value={panels ? 'panels' : 'pool'}
            onChange={(k) => set('view', k)}
            items={[{ key: 'pool', label: 'Participants Pool' }, { key: 'panels', label: 'Micro-Panels' }]} />
          <Button variant={panels ? 'primary' : 'tertiary'} size="none" className="h-12 px-4"
            onClick={() => nav('/pool/panels/new')}
            leftIcon={<Plus className="h-5 w-5" />}>
            <span className="text-body-medium">Create Micro-panel</span>
          </Button>
        </div>

        {!panels && (
          <>
            <form className="mt-4 flex h-[62px] items-center justify-between gap-4 rounded-lg border-1 border-stroke-input bg-bg-1 px-4"
              onSubmit={(e) => {
                e.preventDefault()
                const next = { ...f, query }
                setF(next)
                toast(`${POOL_PEOPLE.filter((p) => matchesPool(p, next)).length} of ${POOL_TOTAL} match`)
              }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={POOL_SEARCH}
                className="min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body" />
              <Button type="submit" variant="secondary" size="none" className="h-10 px-4"
                leftIcon={<Search className="h-4 w-4" />}>
                <span className="text-body-medium">Find and Filter</span>
              </Button>
            </form>

            <div className="flex gap-[34px] pt-[22px]">
              {filters && <FilterRail value={f} onChange={setF} />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-body-medium text-text-title">
                    {people.length} of {POOL_TOTAL} results
                  </span>
                  {/* Every chip here is a filter that is on, and its cross takes it off. */}
                  {chips.map((c) => (
                    <span key={c.key} className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-input px-2.5 text-text-regular text-text-title">
                      {c.label}
                      <button type="button" aria-label={`Remove ${c.label}`} onClick={() => setF(c.remove(f))}
                        className="text-text-subtitle hover:text-text-title">
                        <Close className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4">
                  {/* With nothing set there is nothing to clear, so it says so
                      rather than looking live and doing nothing. */}
                  <button type="button" disabled={chips.length === 0 && query === ''}
                    title={chips.length === 0 && query === '' ? 'No filters are on' : 'Take every filter off'}
                    onClick={() => { setF({ ...POOL_DEFAULT_FILTERS }); setQuery('') }}
                    className={cn('inline-flex items-center gap-2 text-text-regular',
                      chips.length === 0 && query === ''
                        ? 'cursor-not-allowed text-text-disabled'
                        : 'text-text-subtitle hover:text-text-title')}>
                    <Close className="h-4 w-4" />Clear All
                  </button>
                  <button type="button" onClick={() => setFilters((v) => !v)}
                    className="text-text-regular text-text-subtitle hover:text-text-title">
                    {filters ? 'Hide filters' : 'Show filters'}
                  </button>
                </div>
                {people.length === 0 && (
                  <p className="py-16 text-center text-body-regular text-text-subtitle">
                    Nobody in the pool matches every filter. Take one off to widen it.
                  </p>
                )}
                <div className={cn('grid gap-3 pt-4', filters ? 'grid-cols-2' : 'grid-cols-3')}>
                  {people.map((p) => (
                    <RespondentCard key={p.id} respondent={{ ...p, professionVerified: true }} className="px-4 pb-2 pt-4"
                      onSave={() => { setSaving({ id: p.id, name: p.name }); setPanel('save') }}
                      onView={() => { setViewing(p); setPanel('profile') }}
                      actions={<Button variant="tertiary" size="none" className="h-11 flex-1"
                        onClick={() => setPanel('invite')}>Invite To Study</Button>} />
                  ))}
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

      <RespondentPanel open={panel === 'profile'} respondent={{ ...(viewing ?? POOL_PEOPLE[0]), professionVerified: true }}
        onClose={() => setPanel('')} onReviews={() => setPanel('reviews')}
        onInvite={() => setPanel('invite')} />
      <ReviewsPanel open={panel === 'reviews'} onClose={() => setPanel('')} onBack={() => setPanel('profile')} />
      <InvitePanel open={panel === 'invite'} onClose={() => setPanel('')} onSent={() => setPanel('sent')} />
      <SentModal open={panel === 'sent'} onClose={() => setPanel('')} />
      <DeleteModal open={deleting !== null} onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) deletePanel(deleting); setDeleting(null) }} />
      <SavePanel open={panel === 'save'} onClose={() => setPanel('')}
        personId={saving?.id} name={saving?.name} />
    </AppShell>
  )
}
