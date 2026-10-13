import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import type { StudyType } from '../../components/app/StudyTypeTag'
import Button, { IconButton } from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { DotsIcon, DownloadIcon, ExternalIcon, EyeIcon, ReceiptIcon } from '../../components/ui/icons'
import Table from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { useClientView } from '../../mock/clients'
import { platform } from '@shared/store'
import { monthDayYear } from '@shared/format'
import { TEAM } from '../../platform'
import type { ClientStudy } from '../../mock/clients'
import { AccountFlow } from '../participants/profile/accountDialogs'
import type { AccountStep } from '../participants/profile/accountDialogs'
import { Mastercard } from '../studies/review/PaymentRevisions'
import InvoicePanel from './InvoicePanel'
import { ClientAbout, ClientHeader } from './parts'

type Tab = 'about' | 'studies' | 'payments'
const TYPES = ['survey', 'video', 'video-group', 'in-person', 'in-person-group', 'diary']
/** Duplicate to Drafts is gone, as on Manage Study: the console does not create studies (final sweep, 13 Oct 2026). */
const STUDY_MENU = ['Copy Study Link', 'Pause Study']

const Stat = ({ label, value, note, tint }: { label: string; value: string; note: string; tint?: boolean }) => (
  <div className={cn('flex h-[88px] flex-1 items-center gap-4 rounded-lg px-4', tint ? 'bg-yellow-30' : 'border-1 border-stroke-1')}>
    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-bg-0 text-brand-primary"><ReceiptIcon className="h-6 w-6" /></span>
    <div className="flex-1"><p className="text-text-regular leading-5 text-text-title">{label}</p><p className="pt-0.5 text-title-l leading-[31px] text-text-title">{value}</p></div>
    <span className="self-end pb-3 text-text-regular text-text-body">{note}</span>
  </div>
)

/**
 * A client's profile (`/clients/:id`, `?tab=studies|payments`,
 * `&sub=completed`, `?state=deactivated`): three segments.
 * - About: Account Details and Reviews (4.5 of 1,468).
 * - Studies: Ongoing and Completed, each a table with a row menu.
 * - Payments: Due Payments, All Time Spent, Average Study Cost; Pending and
 *   Completed Invoices (download, view); Saved Payment Methods.
 * The options menu (2051:132223) offers Send E-mail and Deactivate Account. A
 * deactivated client carries the banner from 2051:137137.
 */
export default function ClientProfile() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { id } = useParams()
  const view = useClientView(id)
  const c = view.client
  /** Deactivated is what the platform holds for this client. */
  const off = view.deactivated
  const tab: Tab = params.get('tab') === 'studies' ? 'studies' : params.get('tab') === 'payments' ? 'payments' : 'about'
  const done = params.get('sub') === 'completed'
  const go = (n: { tab?: Tab; sub?: string }) => {
    const t = n.tab ?? tab
    setParams({ ...(t !== 'about' && { tab: t }), ...(n.sub === 'completed' && { sub: 'completed' }) }, { replace: true })
  }
  const [menu, setMenu] = useState(false)
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<string | null>(null)
  const [flow, setFlow] = useState<AccountStep>(null)

  const studyCols: Column<ClientStudy>[] = [
    { key: 'name', header: 'Study Name', width: '1fr', render: (r) => <span className="-ml-1 flex items-center gap-3"><img src={r.thumb} alt="" className="h-10 w-10 rounded-xs object-cover" /><span className="truncate">{r.name}</span></span> },
    { key: 'type', header: 'Type', width: 180, render: (r) => TYPES.includes(r.type) ? <StudyTypeTag type={r.type as StudyType} className="h-7 px-2.5" /> : <span className="inline-flex h-7 items-center rounded-full border-1 border-stroke-2 px-2.5 text-text-subtitle">{r.type}</span> },
    { key: 'billed', header: 'Billed', width: 100, sortable: true, render: (r) => r.billed }, { key: 'required', header: 'Required', width: 110, sortable: true, render: (r) => r.required },
    { key: 'completed', header: 'Completed', width: 130, sortable: true, render: (r) => r.completed }, { key: 'date', header: done ? 'Completed On' : 'Created On', width: 140, sortable: true, render: (r) => r.date },
    { key: 'menu', header: '', width: 56, className: 'relative px-2', render: (r) => (
      <>
        <button type="button" aria-label="Study options" onClick={(e) => { e.stopPropagation(); setRowMenu(rowMenu === r.id ? null : r.id) }} className="flex h-8 w-8 items-center justify-center"><DotsIcon className="h-5 w-5" /></button>
        {rowMenu === r.id && (
          <ul role="menu" className="absolute right-2 top-11 z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
            {STUDY_MENU.map((m) => <li key={m} role="none"><button role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); setRowMenu(null) }} className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{m}</button></li>)}
          </ul>
        )}
      </>
    ) },
  ]
  type InvoiceRow = (typeof view.PENDING)[number]
  const invoiceCols = (date: string): Column<InvoiceRow>[] => [
    { key: 'n', header: 'Invoice Number', width: 140, render: (r) => <span className="text-text-subtitle">{r.number}</span> }, { key: 's', header: 'Study Invoice', width: '1fr', render: (r) => r.study },
    { key: 'd', header: date, width: 180, render: (r) => r.date }, { key: 'a', header: 'Amount', width: 260, render: (r) => <span className="text-body-medium">{r.amount}</span> },
    { key: 'x', header: '', width: 112, className: 'px-3', render: (r) => (
      <span className="flex gap-3"><IconButton label="Download invoice" onClick={(e) => e.stopPropagation()}><DownloadIcon className="h-5 w-5" /></IconButton>
        <IconButton label="View invoice" onClick={(e) => { e.stopPropagation(); setInvoice(r.studyId) }}><EyeIcon className="h-5 w-5" /></IconButton></span>) },
  ]
  const H = ({ children }: { children: string }) => <h3 className="pb-3 pt-6 text-title-s leading-[25px] text-text-title">{children}</h3>

  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: off ? 'Deactivated' : 'Active', to: off ? '/clients?tab=deactivated' : '/clients' }, { label: c.name }]}>
      <ClientHeader id={c.id} reviews onReviews={() => go({ tab: 'about' })} menu={
        <>
          <IconButton label="Client options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
          {menu && (
            <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
              {['Send E-mail', off ? 'Reactivate Account' : 'Deactivate Account'].map((item) => (
                <li key={item} role="none"><button role="menuitem" type="button" onClick={() => { setMenu(false); if (item === 'Send E-mail') window.location.href = `mailto:${c.email}`; else setFlow('form') }}
                  className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{item}</button></li>))}
            </ul>
          )}
        </>} />
      {off && (
        <div role="status" className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-yellow-40 px-4 py-3.5 text-text-regular leading-5">
          <div><p className="text-body-medium leading-[22px] text-state-danger">Account is deactivated.</p>
            <p className="pt-1.5 text-text-title">{view.statusNote?.reason ?? 'This account was deactivated.'} Can verify it manually and reactivate.</p><p className="pt-1.5 text-text-subtitle">{monthDayYear(view.statusNote?.at)}</p></div>
          <div className="flex shrink-0 gap-3"><Button variant="tertiary" className="bg-yellow-40 px-5" leftIcon={<ExternalIcon className="h-5 w-5" />}>Reason</Button><Button variant="secondary" className="px-5" onClick={() => setFlow('form')}>Reactivate Account</Button></div>
        </div>
      )}
      <SegmentedTabs className="mt-4 w-80 self-start" segmentClassName="flex-1 min-w-0" value={tab} onChange={(k) => go({ tab: k as Tab })} items={[{ key: 'about', label: 'About' }, { key: 'studies', label: 'Studies' }, { key: 'payments', label: 'Payments' }]} />
      <div className="pt-3">
        {tab === 'about' && <ClientAbout id={c.id} />}
        {tab === 'studies' && (
          <div>
            <UnderlineTabs items={[{ key: 'ongoing', label: 'Ongoing' }, { key: 'completed', label: 'Completed' }]} value={done ? 'completed' : 'ongoing'} onChange={(k) => go({ sub: k })} />
            <div className="flex gap-3 pb-3 pt-4"><SearchInput size="sm" placeholder="Search studies..." /><Select size="sm" className="w-[134px] shrink-0" value="All" options={['All']} /></div>
            <Table empty={done ? 'This client\u2019s completed studies will appear here.' : 'This client\u2019s running studies will appear here.'} rows={done ? view.COMPLETED : view.ONGOING} rowKey={(r) => r.id} columns={studyCols} highlight="st-pay"
              onRowClick={(r) => navigate(`/studies/${r.id}${done ? '?state=completed' : ''}`)} />
          </div>
        )}
        {tab === 'payments' && (
          <div>
            <div className="flex gap-3">{view.stats.map((st) => <Stat key={st.label} tint={st.tint} label={st.label} value={st.value} note={st.note} />)}</div>
            <H>Pending Invoices</H><Table empty="Invoices waiting to be paid will appear here." rowHeight={70} rows={view.PENDING} rowKey={(r) => r.key} columns={invoiceCols('Due Date (auto-debit)')} onRowClick={(r) => setInvoice(r.studyId)} />
            <H>Completed Invoices</H><Table empty="Paid invoices will appear here." rowHeight={70} rows={view.PAID} rowKey={(r) => r.key} columns={invoiceCols('Date')} onRowClick={(r) => setInvoice(r.studyId)} />
            <H>Saved Payment Methods</H>
            <div className="flex gap-2">
              {view.cards.map(({ brand, last4, expires, isDefault: def }) => (
                <div key={last4} className="h-[98px] w-[376px] rounded-lg bg-bg-1 p-4 text-text-regular leading-5">
                  <p className="flex items-center gap-2 text-text-title">{brand === 'Mastercard' ? <Mastercard /> : <span className="text-label font-semibold text-blue-600">VISA</span>}{brand}{def && <><span aria-hidden="true" className="text-text-body">•</span><span className="text-text-body">Default</span></>}</p>
                  {/* The platform keeps the last four digits only, never a full number or a CVV. */}
                  <p className="pt-1.5 text-body-medium text-text-title">**** **** **** {last4}</p><p className="pt-1.5 text-text-subtitle">{expires}</p>
                </div>))}
            </div>
          </div>
        )}
      </div>
      
      <InvoicePanel studyId={invoice} onClose={() => setInvoice(null)} />
      <AccountFlow name={c.name.split(' ')[0]} kind={off ? 'reactivate' : 'deactivate'} step={flow} onStep={setFlow} onReason={(reason) => platform().setClientStatus(c.id, off ? 'active' : 'deactivated', reason, TEAM)} onDone={() => setFlow(null)} />
    </AppShell>
  )
}
