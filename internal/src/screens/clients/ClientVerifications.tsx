import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { SearchInput } from '../../components/ui/Input'
import { CloseIcon, SupportIcon, VerifiedIcon } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { useClientCase, useClientChecks } from '../../mock/clients'
import { ticketsOf } from '@shared/derive'
import { platform } from '@shared/store'
import { TEAM, usePlatform } from '../../platform'
import type { ClientCheck } from '../../mock/clients'
import { Field } from '../participants/profile/AboutTab'
import DecisionFlow from '../participants/verifications/dialogs'
import type { Decision, Step } from '../participants/verifications/dialogs'
import { ClientAbout, ClientHeader } from './parts'
import { useFacet } from '../participants/verifications/VerificationsList'

const col = (key: keyof ClientCheck, header: string, width: number | string, sortable = false): Column<ClientCheck> => ({ key, header, width, sortable, render: (r) => <span className="block truncate">{r[key]}</span> })
const who: Column<ClientCheck> = { key: 'name', header: 'Name', width: 200, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> }
const flag: Column<ClientCheck> = { key: 'flag', header: 'Flagged For', width: 170, render: () => 'Business Verification' }

/**
 * Client verifications (2051:143183 Pending, 2051:150538 History): one queue,
 * business verification only. The History frame labels the first segment
 * "Onboarding"; built as "Pending" on both.
 */
export function ClientVerificationsList() {
  const checks = useClientChecks()
  const { count } = checks
  /** Every check here is a business verification, so Pending narrows by what failed and History by the result (22 Oct 2026). */
  const [CLIENT_PENDING, pendingBy] = useFacet(checks.CLIENT_PENDING, 'reason', 'Flagged for')
  const [CLIENT_HISTORY, historyBy] = useFacet(checks.CLIENT_HISTORY, 'result', 'Result:')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const history = params.get('tab') === 'history'
  const open = (r: ClientCheck) => navigate(`/clients/verifications/${r.id}`)
  return (
    <AppShell crumbs={[{ label: 'Verifications' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={history ? 'history' : 'pending'} onChange={(k) => setParams(k === 'history' ? { tab: k } : {}, { replace: true })}
        items={[{ key: 'pending', label: 'Pending' }, { key: 'history', label: 'History' }]} />
      <h2 className="pb-2 pt-4 text-title-s leading-[25px] text-text-title">{history ? 'History' : count}</h2>
      <div className="flex gap-4 pb-[15px]"><SearchInput size="sm" placeholder="Search participants by name or role..." />{history ? historyBy : pendingBy}</div>
      {history
        ? <Table empty="Business verifications you have decided will appear here." rowHeight={52} rows={CLIENT_HISTORY} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 220), col('date', 'Completed', 130, true), flag, col('reason', 'Verification Remarks', '1fr'),
          { key: 'result', header: 'Result', width: 120, render: (r) => <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-text-regular', r.result === 'Verified' ? 'bg-state-successBg text-state-success' : 'bg-orange-100 text-state-destructive')}>{r.result}</span> }]} />
        : <Table empty="Business checks that need a person will appear here." rowHeight={52} rows={CLIENT_PENDING} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 240), col('date', 'Date', 130, true), flag, col('reason', 'Reason', '1fr')]} />}
      <div className="border-b-1 border-stroke-1 pb-10 pt-3"><Pagination page={1} pages={10} /></div>
    </AppShell>
  )
}

const Tag = ({ good, children }: { good: boolean; children: string }) => (
  <span className={cn('inline-flex h-7 items-center gap-1 self-start rounded-full px-2.5 text-text-regular', good ? 'bg-state-successBg text-state-success' : 'bg-red-50 text-state-danger')}>{good ? <VerifiedIcon className="h-4 w-4" /> : <CloseIcon className="h-4 w-4" />}{children}</span>
)

/**
 * A client's business verification (2051:145339 flagged, 2051:145410 Profile
 * Details, 2051:145795 verified, 2051:145873 rejected). What is checked is two
 * things the client typed: the company website and, where given, the tax ID,
 * against records. No document is uploaded. Reject, Mark Verified and Chat;
 * the dialogs are the participant profession ones, reused word for word in
 * the frames ("Mark Profession Verified", "Samuel's profession credentials").
 * The frames light Participants > Verifications; the route lights Clients.
 */
export function ClientVerificationDetail() {
  const { id = 'cv-cl-verda' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const k = useClientCase(id)
  const c = k.client
  const outcome = k.outcome
  const state = usePlatform()
  const [flow, setFlow] = useState<{ kind: Decision; step: Step } | null>(null)
  const profile = params.get('tab') === 'profile'
  const pending = outcome === 'pending'
  const ok = outcome === 'verified'
  const by = k.decidedBy ? ` · by ${k.decidedBy}` : ''
  const chat = () => {
    const open = ticketsOf(state, 'client', c.id)[0]
    if (open) { navigate(`/support/${open.id}`); return }
    const made = platform().createTicket({ kind: 'client', id: c.id }, { subject: 'Business verification: more information needed', message: c.business.reason ?? 'We need a little more information to verify your business.' }, TEAM)
    if (made.ok) navigate(`/support/${made.id}`)
  }
  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: pending && !profile ? 'Verifications' : 'Onboarding', to: '/clients/verifications' }, { label: c.name }]}>
      <ClientHeader id={c.id} />
      <UnderlineTabs className="mt-4" value={profile ? 'profile' : 'flagged'} onChange={(k) => setParams(k === 'profile' ? { tab: 'profile' } : {}, { replace: true })}
        items={[{ key: 'flagged', label: profile ? 'Status' : 'Flagged' }, { key: 'profile', label: 'Profile Details' }]} />
      {profile ? <div className="pt-5"><ClientAbout id={c.id} /></div> : (
        <div className="flex flex-col gap-3 pt-6">
          <h2 className="text-body-regular leading-[22px] text-text-subtitle">Profession Credential</h2>
          <section className={cn('flex items-center justify-between gap-4 rounded-lg px-4 py-3.5 text-text-regular leading-5', pending ? 'bg-yellow-40' : 'border-1 border-stroke-1 bg-bg-1')}>
            <div><h3 className="text-body-medium leading-[22px] text-text-title">Tax ID Registration, Website</h3><p className="pt-1.5 text-text-subtitle">{c.business.reason}</p><p className="pt-1.5 text-text-subtitle">{k.flaggedAt}</p></div>
            {pending ? (
              <div className="flex shrink-0 gap-3">
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" leftIcon={<CloseIcon className="h-5 w-5" />} onClick={() => setFlow({ kind: 'reject-verification', step: 'form' })}>Reject</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-success!" leftIcon={<VerifiedIcon className="h-5 w-5" />} onClick={() => setFlow({ kind: 'verify-profession', step: 'form' })}>Mark Verified</Button>
                <Button className="px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={chat}>Chat</Button>
              </div>
            ) : <Button variant="tertiary" className="bg-bg-1 px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={chat}>View Support Chat</Button>}
          </section>
          {!pending && (
            <div className="rounded-md border-1 border-stroke-1 bg-bg-0 p-4 text-text-regular leading-5">
              <p className={cn('text-body-regular', ok ? 'text-state-success' : 'text-state-danger')}>{ok ? 'Marked as verified!' : 'Rejected the Business registration verification.'}</p>
              <p className="pt-1.5 text-text-title">{c.business.note}</p><p className="pt-1.5 text-text-subtitle">{k.decidedAt}{by}</p>
            </div>
          )}
          <Field label="Company Name" value={c.company} />
          {/* The tax ID is optional (clients are US based; an EIN where they have one). Without one there is nothing to check against records. */}
          <Field label="Tax ID (optional)" value={c.taxId || 'Not given'} />{c.taxId && <Tag good={ok}>{ok ? 'Marked as Verified' : 'Company registration could not be verified with records!'}</Tag>}
          <Field label="Company Website" value={c.website || 'N/A'} /><Tag good={ok}>{ok ? 'Marked as Verified' : 'Website not found!'}</Tag>
        </div>
      )}
      {flow && <DecisionFlow kind={flow.kind} name={c.name.split(' ')[0]} step={flow.step} onStep={(s) => setFlow(s ? { ...flow, step: s } : null)}
        onDecide={(statement) => platform().decideBusiness(c.id, flow.kind === 'verify-profession' ? 'verified' : 'rejected', statement, TEAM)} onDone={() => setFlow(null)} />}
    </AppShell>
  )
}
