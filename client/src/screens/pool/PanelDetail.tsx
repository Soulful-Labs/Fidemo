import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import RespondentCard from '../../components/client/RespondentCard'
import TierChip from '../../components/client/TierChip'
import { useState } from 'react'
import { AddToPanel } from './poolBits'
import { SentModal } from './PoolModals'
import { Calendar, Info, MoreVertical, UsersIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { CRITERIA, FORECAST, PANEL_DETAIL, POOL_PEOPLE } from '../../mock/pool'
import { useWorkspace } from '../../mock/workspace'
import { useToast } from '../../components/ui/Toast'

/** The forecast card the Panel Details tab puts beside the criteria. */
function Forecast() {
  return (
    <aside className="w-[468px] shrink-0 overflow-hidden rounded-lg border-1 border-stroke-input">
      <p className="inline-flex items-center gap-2 px-4 py-4 text-title-s leading-[22px] text-text-title">
        {FORECAST.title} <Info className="h-4 w-4 text-text-subtitle" />
      </p>
      <div className="px-4">
        <div className="flex flex-col gap-1 rounded-md bg-yellow-30 px-4 py-4">
          <span className="inline-flex items-center gap-2 text-text-regular text-text-title">
            <UsersIcon className="h-4 w-4 text-text-subtitle" />{FORECAST.estimated}
          </span>
          <span className="text-title-l text-text-title">
            {FORECAST.count} <span className="text-text-regular text-text-subtitle">{FORECAST.countSuffix}</span>
          </span>
        </div>
      </div>
      <p className="px-4 pt-4 text-label uppercase tracking-[0.04em] text-text-body">TIER DISTRIBUTION</p>
      <div className="grid grid-cols-3 gap-3 px-4 pt-2">
        {FORECAST.tiers.map((t) => (
          <div key={t.tier} className="flex flex-col items-center gap-2 rounded-md border-1 border-stroke-input py-3">
            <span className="text-title-s text-text-title">{t.pct}</span>
            <TierChip tier={t.tier} />
            <span className="text-text-regular text-text-subtitle">{t.members}</span>
          </div>
        ))}
      </div>
      <dl className="flex flex-col px-4 pt-4">
        {FORECAST.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 border-t-1 border-stroke-1 py-3">
            <dt className="text-text-regular text-text-subtitle">{r.label}</dt>
            <dd className="text-text-regular text-text-title">{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}

/** Active criteria summary, the left half of the Panel Details tab. */
function Criteria({ created }: { created?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className="text-title-s leading-[22px] text-text-title">Active criteria summary</h2>
      <p className="pt-1 text-text-regular text-text-subtitle">
        Review the predicted metrics for this cohort. Adjust any criteria before generating your spec
      </p>
      <div className="flex gap-2 pt-4">
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-bg-1 px-3 text-text-regular text-text-body">
          <Calendar className="h-4 w-4" />Last Updated on Jul 1, 2026
        </span>
        {created && (
          <span className="inline-flex h-8 items-center rounded-full bg-bg-1 px-3 text-text-regular text-text-body">
            Created on Jul 1, 2026
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 rounded-lg bg-bg-1 p-4">
        {CRITERIA.map((c) => (
          <span key={c.value} className="inline-flex h-8 items-center gap-1.5 rounded-full border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title">
            {c.pin && <span className="text-text-subtitle">&#9679;</span>}
            {c.label && <span className="text-text-subtitle">{c.label}</span>}{c.value}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * A micro-panel (1645:161734 members, 1645:162050 eligible matches,
 * 1645:162132 panel details) and a featured panel (1645:161816, 1645:161904).
 * One screen: a featured panel adds a description and a Last Updated figure,
 * drops Eligible Matches, Launch Study and the kebab.
 */
export default function PanelDetail({ featured }: { featured?: boolean }) {
  const nav = useNavigate()
  const { panelId = 'p1' } = useParams()
  const [params, setParams] = useSearchParams()
  const tabKey = params.get('tab') ?? 'members'
  const tab = tabKey
  const { panels, addToPanel } = useWorkspace()
  const toast = useToast()
  /** A panel the client built shows its own name, roles and members. */
  const own = featured ? undefined : panels.find((x) => x.id === panelId)
  const base = featured ? PANEL_DETAIL.featured : PANEL_DETAIL.mine
  const d = own
    ? { ...base, title: own.title, domain: own.domain, roles: own.roles || base.roles,
        stats: base.stats.map((st) => (st.label === 'Panel Members'
          ? { ...st, value: String(own.memberIds.length) } : st)) }
    : base
  /** Members are the people in it; Eligible Matches are everyone else. */
  const members = own ? POOL_PEOPLE.filter((x) => own.memberIds.includes(x.id)) : POOL_PEOPLE
  const eligible = own ? POOL_PEOPLE.filter((x) => !own.memberIds.includes(x.id)) : POOL_PEOPLE
  const shown = tabKey === 'members' ? members : eligible
  const [sent, setSent] = useState(params.get('modal') === 'sent')
  const set = (k: string) => { const n = new URLSearchParams(params); n.set('tab', k); setParams(n) }
  const tabs = featured
    ? [{ key: 'members', label: 'Members' }, { key: 'details', label: 'Panel Details' }]
    : [{ key: 'members', label: 'Members' }, { key: 'matches', label: 'Eligible Matches' }, { key: 'details', label: 'Panel Details' }]

  return (
    <AppShell hideCreate crumbs={[{ label: 'Pool', to: '/pool?view=panels' }, { label: d.crumb }, { label: d.title }]}>
      <div className="min-h-[873px] rounded-lg bg-bg-0 p-4">
        <div className="flex flex-col gap-3 rounded-lg bg-bgAlt-1 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-title-l text-text-title">{d.title}</h1>
            <span className="flex items-center gap-3">
              <Button variant="secondary" size="row" onClick={() => setSent(true)}>Invite All To Study</Button>
              {!featured && (
                <>
                  <Button variant="tertiary" size="row" onClick={() => nav('/studies/create/about')}>Launch Study</Button>
                  <button type="button" aria-label="Panel options" onClick={() => nav(`/pool/panels/${panelId}/edit`)}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-title">
              {d.domain}
            </span>
            <span className="inline-flex h-8 items-center gap-2 rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-title">
              <span className="text-text-body">&#9878;</span>{d.roles}
            </span>
          </div>
          {'description' in d && <p className="text-text-regular text-text-subtitle">{d.description}</p>}
          <div className={cn('grid pt-1', featured ? 'grid-cols-[164px_166px_166px_162px_1fr]' : 'grid-cols-[164px_166px_166px_1fr]')}>
            {d.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-text-regular text-text-subtitle">{s.label}</span>
                <span className={cn('text-title-s', 'accent' in s && s.accent ? 'text-brand-secondary' : 'text-text-title')}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border-1 border-stroke-input">
          <div className="flex h-11 items-end gap-8 border-b-1 border-stroke-1 px-4">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => set(t.key)}
                className={cn('-mb-px border-b-1 pb-2 text-body-regular',
                  t.key === tab ? 'border-cta-primary text-brand-primary' : 'border-transparent text-text-subtitle hover:text-text-title')}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'details' ? (
            <div className="flex gap-12 px-4 pb-4 pt-4">
              <Criteria created={!featured} />
              <Forecast />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 px-4 pb-4 pt-4">
              {shown.length === 0 && (
                <p className="col-span-3 py-12 text-center text-body-regular text-text-subtitle">
                  {tab === 'members'
                    ? 'Nobody is in this panel yet. Add them from Eligible Matches.'
                    : 'Everyone who matches is already in this panel.'}
                </p>
              )}
              {shown.map((p) => (
                <RespondentCard key={p.id} respondent={{ ...p, professionVerified: true }}
                  className="px-4 pb-2 pt-4"
                  saveable={tab === 'members'}
                  actions={tab === 'members'
                    ? <Button variant="tertiary" size="none" className="h-11 flex-1" onClick={() => setSent(true)}>Invite To Study</Button>
                    : <AddToPanel onAdd={() => {
                        const res = own ? addToPanel(own.id, p.id) : { ok: false, why: 'A featured panel cannot be edited' }
                        toast(res.ok ? `${p.name} added to ${d.title}` : res.why!)
                      }} />} />
              ))}
            </div>
          )}
        </div>
      </div>
      <SentModal open={sent} onClose={() => setSent(false)}
        panel={{ members: String(members.length), title: d.title }} />
    </AppShell>
  )
}
