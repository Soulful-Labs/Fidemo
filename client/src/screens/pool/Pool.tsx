import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { FEATURED_CATEGORIES, FEATURED_PANELS, MY_PANELS, POOL_CHIPS, POOL_PEOPLE, POOL_RESULTS, POOL_SEARCH } from '../../mock/pool'

/**
 * Pool of Participants (1645:161430 with filters, 1777:98738 without,
 * 1645:161580 my panels, 1645:162272 featured). One screen: a segmented
 * toggle picks the participants pool or the micro-panels, and each side has
 * one more state of its own.
 */
export default function Pool() {
  const [params, setParams] = useSearchParams()
  const panels = params.get('view') === 'panels'
  const featured = params.get('sub') === 'featured'
  const [filters, setFilters] = useState(params.get('filters') !== 'hidden')
  /** The four 600px panels the pool cards open. */
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const set = (k: string, v: string) => { const n = new URLSearchParams(params); n.set(k, v); setParams(n) }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Pool of Participants' }]}>
      <div className={cn('rounded-lg bg-bg-0 p-4', panels ? 'min-h-[873px]' : filters ? 'min-h-[1437px]' : 'min-h-[985px]')}>
        <div className="flex items-center justify-between gap-4">
          <Tabs variant="segmented" value={panels ? 'panels' : 'pool'}
            onChange={(k) => set('view', k)} className="w-[343px] justify-between"
            items={[{ key: 'pool', label: 'Participants Pool' }, { key: 'panels', label: 'Micro-Panels' }]} />
          <Button variant={panels ? 'primary' : 'tertiary'} size="none" className="h-12 px-4"
            leftIcon={<Plus className="h-5 w-5" />}>
            <span className="text-body-medium">Create Micro-panel</span>
          </Button>
        </div>

        {!panels && (
          <>
            <div className="mt-4 flex h-[62px] items-center justify-between gap-4 rounded-lg border-1 border-stroke-input bg-bg-1 px-4">
              <span className="text-body-regular text-text-body">{POOL_SEARCH}</span>
              <Button variant="secondary" size="none" className="h-10 px-4" leftIcon={<Search className="h-4 w-4" />}>
                <span className="text-body-medium">Find and Filter</span>
              </Button>
            </div>

            <div className="flex gap-[34px] pt-[22px]">
              {filters && <FilterRail />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-body-medium text-text-title">{POOL_RESULTS}</span>
                  {POOL_CHIPS.map((c) => (
                    <span key={c} className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-input px-2.5 text-text-regular text-text-title">
                      {c}<Close className="h-3.5 w-3.5 text-text-subtitle" />
                    </span>
                  ))}
                </div>
                <button type="button" onClick={() => setFilters((f) => !f)}
                  className="mt-3 inline-flex items-center gap-2 text-text-regular text-text-subtitle hover:text-text-title">
                  <Close className="h-4 w-4" />Clear All
                </button>
                <div className={cn('grid gap-3 pt-4', filters ? 'grid-cols-2' : 'grid-cols-3')}>
                  {POOL_PEOPLE.map((p) => (
                    <RespondentCard key={p.id} respondent={{ ...p, professionVerified: true }} saveable className="gap-2.5 px-4 pb-2 pt-4"
                      onView={() => setPanel('profile')}
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
                <Search className="h-4 w-4" />Search your panels
              </span>
            </div>

            {featured && (
              <div className="flex flex-wrap gap-2 pt-4">
                {FEATURED_CATEGORIES.map((c, i) => (
                  <span key={c} className={cn('inline-flex h-8 items-center rounded-full px-3 text-text-regular',
                    i === 0 ? 'bg-bg-1 text-text-title' : 'border-1 border-stroke-input text-text-subtitle')}>
                    {c}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-4">
              {(featured ? FEATURED_PANELS : MY_PANELS).map((c) => (
                <PanelTile key={c.id} c={c} to={`/pool/${featured ? 'featured' : 'panels'}/${c.id}`} onDelete={() => setPanel('delete')} />
              ))}
            </div>
          </>
        )}
      </div>

      <RespondentPanel open={panel === 'profile'} respondent={{ ...POOL_PEOPLE[0], professionVerified: true }}
        onClose={() => setPanel('')} onReviews={() => setPanel('reviews')} />
      <ReviewsPanel open={panel === 'reviews'} onClose={() => setPanel('')} onBack={() => setPanel('profile')} />
      <InvitePanel open={panel === 'invite'} onClose={() => setPanel('')} onSent={() => setPanel('sent')} />
      <SentModal open={panel === 'sent'} onClose={() => setPanel('')} />
      <DeleteModal open={panel === 'delete'} onClose={() => setPanel('')} />
      <SavePanel open={panel === 'save'} onClose={() => setPanel('')} />
    </AppShell>
  )
}
