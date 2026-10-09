import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { CloseIcon, SupportIcon, VerifiedIcon } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { CLIENT_HISTORY, CLIENT_PENDING } from '../../mock/clients'
import type { ClientCheck } from '../../mock/clients'
import { Field } from '../participants/profile/AboutTab'
import DecisionFlow from '../participants/verifications/dialogs'
import type { Decision, Step } from '../participants/verifications/dialogs'
import { ClientAbout, ClientHeader } from './parts'

const col = (key: keyof ClientCheck, header: string, width: number | string, sortable = false): Column<ClientCheck> => ({ key, header, width, sortable, render: (r) => <span className="block truncate">{r[key]}</span> })
const who: Column<ClientCheck> = { key: 'name', header: 'Name', width: 200, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> }
const flag: Column<ClientCheck> = { key: 'flag', header: 'Flagged For', width: 170, render: () => 'Business Verification' }

/**
 * Client verifications (2051:143183 Pending, 2051:150538 History): one queue,
 * business verification only. The History frame labels the first segment
 * "Onboarding"; built as "Pending" on both.
 */
export function ClientVerificationsList() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const history = params.get('tab') === 'history'
  const open = (r: ClientCheck) => navigate(`/clients/verifications/${r.id}`)
  return (
    <AppShell crumbs={[{ label: 'Verifications' }]}>
      <SegmentedTabs className="w-[280px]" segmentClassName="flex-1 min-w-0" value={history ? 'history' : 'pending'} onChange={(k) => setParams(k === 'history' ? { tab: k } : {}, { replace: true })}
        items={[{ key: 'pending', label: 'Pending' }, { key: 'history', label: 'History' }]} />
      <h2 className="pb-2 pt-4 text-title-s leading-[25px] text-text-title">{history ? 'History' : '87 pending verifications'}</h2>
      <div className="flex gap-4 pb-[15px]"><SearchInput size="sm" placeholder="Search participants by name or role..." /><Select size="sm" className="w-[200px] shrink-0" value="Flagged for All" options={['Flagged for All']} /></div>
      {history
        ? <Table rowHeight={52} rows={CLIENT_HISTORY} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 220), col('date', 'Completed', 130, true), flag, col('reason', 'Verification Remarks', '1fr'),
          { key: 'result', header: 'Result', width: 120, render: (r) => <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-text-regular', r.result === 'Verified' ? 'bg-state-successBg text-state-success' : 'bg-orange-100 text-state-destructive')}>{r.result}</span> }]} />
        : <Table rowHeight={52} rows={CLIENT_PENDING} rowKey={(r) => r.id} onRowClick={open} columns={[who, col('role', 'Role', 240), col('date', 'Date', 130, true), flag, col('reason', 'Reason', '1fr')]} />}
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
 * things the client typed: the VAT (Tax) number and the company website,
 * against records. No document is uploaded. Reject, Mark Verified and Chat;
 * the dialogs are the participant profession ones, reused word for word in
 * the frames ("Mark Profession Verified", "Samuel's profession credentials").
 * The frames light Participants > Verifications; the route lights Clients.
 */
export function ClientVerificationDetail() {
  const { id = 'cv-1' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [outcome, setOutcome] = useState<'pending' | 'verified' | 'rejected'>(params.get('state') === 'rejected' || id === 'cv-2h' ? 'rejected' : id.endsWith('h') ? 'verified' : 'pending')
  const [flow, setFlow] = useState<{ kind: Decision; step: Step } | null>(null)
  const profile = params.get('tab') === 'profile'
  const pending = outcome === 'pending'
  const ok = outcome === 'verified'
  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: pending && !profile ? 'Verifications' : 'Onboarding', to: '/clients/verifications' }, { label: pending ? 'Jennifer Lee' : 'Samuel Lee' }]}>
      <ClientHeader />
      <UnderlineTabs className="mt-4" value={profile ? 'profile' : 'flagged'} onChange={(k) => setParams(k === 'profile' ? { tab: 'profile' } : {}, { replace: true })}
        items={[{ key: 'flagged', label: profile ? 'Status' : 'Flagged' }, { key: 'profile', label: 'Profile Details' }]} />
      {profile ? <div className="pt-5"><ClientAbout /></div> : (
        <div className="flex flex-col gap-3 pt-6">
          <h2 className="text-body-regular leading-[22px] text-text-subtitle">Profession Credential</h2>
          <section className={cn('flex items-center justify-between gap-4 rounded-lg px-4 py-3.5 text-text-regular leading-5', pending ? 'bg-yellow-40' : 'border-1 border-stroke-1 bg-bg-1')}>
            <div><h3 className="text-body-medium leading-[22px] text-text-title">VAT (Tax) Number Registration, Website</h3><p className="pt-1.5 text-text-subtitle">Given VAT number for company registration and website could be found and matched in records.</p><p className="pt-1.5 text-text-subtitle">Oct 1, 2026</p></div>
            {pending ? (
              <div className="flex shrink-0 gap-3">
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-danger!" leftIcon={<CloseIcon className="h-5 w-5" />} onClick={() => setFlow({ kind: 'reject-verification', step: 'form' })}>Reject</Button>
                <Button variant="tertiary" className="bg-yellow-40 px-5 text-state-success!" leftIcon={<VerifiedIcon className="h-5 w-5" />} onClick={() => setFlow({ kind: 'verify-profession', step: 'form' })}>Mark Verified</Button>
                <Button className="px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={() => navigate('/support/tk-1')}>Chat</Button>
              </div>
            ) : <Button variant="tertiary" className="bg-bg-1 px-5" leftIcon={<SupportIcon className="h-5 w-5" />} onClick={() => navigate('/support/tk-1')}>View Support Chat</Button>}
          </section>
          {!pending && (
            <div className="rounded-md border-1 border-stroke-1 bg-bg-0 p-4 text-text-regular leading-5">
              <p className={cn('text-body-regular', ok ? 'text-state-success' : 'text-state-danger')}>{ok ? 'Marked as verified!' : 'Rejected the Business registration verification.'}</p>
              <p className="pt-1.5 text-text-title">{ok ? 'An OCR error, manually verified and matched with record.' : 'Did not submitted the VAT number document for verification as required.'}</p><p className="pt-1.5 text-text-subtitle">{ok ? 'Oct 5, 2026' : 'Oct 30, 2026'}</p>
            </div>
          )}
          <Field label="Company Name" value="SoulfulLabs" />
          <Field label="VAT (Tax) Number" value="EAS56893231459" /><Tag good={ok}>{ok ? 'Marked as Verified' : 'Company registration could not be verified with records!'}</Tag>
          <Field label="Company Website" value="https://www.soulfullabs.ai" /><Tag good={ok}>{ok ? 'Marked as Verified' : 'Website not found!'}</Tag>
        </div>
      )}
      {flow && <DecisionFlow kind={flow.kind} step={flow.step} onStep={(s) => setFlow(s ? { ...flow, step: s } : null)} onDone={() => { setOutcome(flow.kind === 'verify-profession' ? 'verified' : 'rejected'); setFlow(null) }} />}
    </AppShell>
  )
}
