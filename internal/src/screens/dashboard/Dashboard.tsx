import { useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import { UnderlineTabs } from '../../components/ui/Tabs'
import { GROUPS, KPIS, TABS } from '../../mock/dashboard'
import type { TabKey } from '../../mock/dashboard'
import ActionGroupCard from './ActionGroupCard'

/**
 * Dashboard (section 1850:115647): one screen, five tab states. All is
 * 1851:115853; Onboarding, Studies, Support and Manage are 1872:70720,
 * 71323, 71711 and 72123. The four tiles and the heading are identical in all
 * five; only the tab underline and the groups below it change.
 *
 * Measured: the tiles are one 1162 x 98 box (1px stroke-2, Radius/L) split
 * into four 290px cells by 1px rules, 20 in and 12 down: the figure in
 * Heading (32, in a 42 line) over its label in Body 16 subtitle. "Actions
 * Pending" (Title-S) sits 24 below, the tabs 12 below that, the groups 16
 * below the tabs and 12 apart. The tab is kept in the URL (?tab=) so each
 * state can be opened and rendered directly.
 */
export default function Dashboard() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'all') as TabKey

  return (
    <AppShell crumbs={[{ label: 'Dashboard' }]}>
      <div className="grid grid-cols-4 overflow-hidden rounded-lg border-1 border-stroke-2">
        {KPIS.map((k, i) => (
          <div key={k.label} className={`flex h-24 flex-col px-5 pt-3 ${i > 0 ? 'border-l-1 border-stroke-2' : ''}`}>
            <span className="text-heading leading-[42px] text-text-title">{k.value}</span>
            <span className="pt-1 text-body-regular text-text-subtitle">{k.label}</span>
          </div>
        ))}
      </div>

      <h1 className="pt-6 text-title-s text-text-subtitle">Actions Pending</h1>
      <UnderlineTabs className="mt-3" value={tab} onChange={(k) => setParams(k === 'all' ? {} : { tab: k }, { replace: true })}
        items={TABS.map((t) => ({ key: t.key, label: t.label, count: t.count }))} />

      <div className="flex flex-col gap-3 pt-4">
        {GROUPS[tab].map((g) => <ActionGroupCard key={`${tab}-${g.key}`} group={g} />)}
      </div>
    </AppShell>
  )
}
