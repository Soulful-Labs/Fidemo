import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import type { StudyType } from '../../components/app/StudyTypeTag'
import Button, { IconButton } from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { DotsIcon, DownloadIcon, ExternalIcon, EyeIcon, ReceiptIcon } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import type { Column } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { CLIENT_STUDIES, CLIENT_STUDIES_MORE, COMPLETED_INVOICES, PENDING_INVOICES } from '../../mock/clients'
import type { ClientStudy } from '../../mock/clients'
import { ReviewsPanel } from '../participants/panels'
import { AccountFlow } from '../participants/profile/accountDialogs'
import type { AccountStep } from '../participants/profile/accountDialogs'
import { Mastercard } from '../studies/review/PaymentRevisions'
import InvoicePanel from './InvoicePanel'
import { ClientAbout, ClientHeader } from './parts'

type Tab = 'about' | 'studies' | 'payments'
const TYPES = ['survey', 'video', 'video-group', 'in-person', 'in-person-group', 'diary']
const STUDY_MENU = ['Copy Study Link', 'Pause Study', 'Duplicate to Drafts']

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
  const off = params.get('state') === 'deactivated'
  const tab: Tab = params.get('tab') === 'studies' ? 'studies' : params.get('tab') === 'payments' ? 'payments' : 'about'
  const done = params.get('sub') === 'completed'
  const go = (n: { tab?: Tab; sub?: string; off?: boolean }) => {
    const t = n.tab ?? tab
    setParams({ ...(t !== 'about' && { tab: t }), ...(n.sub === 'completed' && { sub: 'completed' }), ...((n.off ?? off) && { state: 'deactivated' }) }, { replace: true })
  }
  const [menu, setMenu] = useState(false)
  const [rowMenu, setRowMenu] = useState<string | null>(null)
  const [reviews, setReviews] = useState(false)
  const [invoice, setInvoice] = useState<'paid' | 'due' | null>(null)
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
            {STUDY_MENU.map((m) => <li key={m} role="none" className={m === 'Duplicate to Drafts' ? 'border-t-1 border-stroke-1' : undefined}><button role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); setRowMenu(null) }} className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{m}</button></li>)}
          </ul>
        )}
      </>
    ) },
  ]
  const invoiceCols = (date: string, kind: 'paid' | 'due'): Column<string>[] => [
    { key: 'n', header: 'Invoice Number', width: 140, render: () => <span className="text-text-subtitle">INV-1024366</span> }, { key: 's', header: 'Study Invoice', width: '1fr', render: () => 'Patient Trust in Telehealth' },
    { key: 'd', header: date, width: 180, render: () => 'Aug 10, 2026' }, { key: 'a', header: 'Amount', width: 260, render: (r) => <span className="text-body-medium">{r}</span> },
    { key: 'x', header: '', width: 112, className: 'px-3', render: () => (
      <span className="flex gap-3"><IconButton label="Download invoice" onClick={(e) => e.stopPropagation()}><DownloadIcon className="h-5 w-5" /></IconButton>
        <IconButton label="View invoice" onClick={(e) => { e.stopPropagation(); setInvoice(kind) }}><EyeIcon className="h-5 w-5" /></IconButton></span>) },
  ]
  const H = ({ children }: { children: string }) => <h3 className="pb-3 pt-6 text-title-s leading-[25px] text-text-title">{children}</h3>

  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: 'Active', to: '/clients' }, { label: 'Jennifer Lee' }]}>
      <ClientHeader reviews onReviews={() => setReviews(true)} menu={
        <>
          <IconButton label="Client options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
          {menu && (
            <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
              {['Send E-mail', off ? 'Reactivate Account' : 'Deactivate Account'].map((item) => (
                <li key={item} role="none"><button role="menuitem" type="button" onClick={() => { setMenu(false); if (item === 'Send E-mail') window.location.href = 'mailto:jenniferlee@soulfullabs.ai'; else setFlow('form') }}
                  className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{item}</button></li>))}
            </ul>
          )}
        </>} />
      {off && (
        <div role="status" className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-yellow-40 px-4 py-3.5 text-text-regular leading-5">
          <div><p className="text-body-medium leading-[22px] text-state-danger">Account is deactivated.</p>
            <p className="pt-1.5 text-text-title">This account was deactivated as business verification could not be done. Can verify it manually and reactivate.</p><p className="pt-1.5 text-text-subtitle">Oct 1, 2026</p></div>
          <div className="flex shrink-0 gap-3"><Button variant="tertiary" className="bg-yellow-40 px-5" leftIcon={<ExternalIcon className="h-5 w-5" />}>Reason</Button><Button variant="secondary" className="px-5" onClick={() => setFlow('form')}>Reactivate Account</Button></div>
        </div>
      )}
      <SegmentedTabs className="mt-4 w-80 self-start" segmentClassName="flex-1 min-w-0" value={tab} onChange={(k) => go({ tab: k as Tab })} items={[{ key: 'about', label: 'About' }, { key: 'studies', label: 'Studies' }, { key: 'payments', label: 'Payments' }]} />
      <div className="pt-3">
        {tab === 'about' && <ClientAbout />}
        {tab === 'studies' && (
          <div>
            <UnderlineTabs items={[{ key: 'ongoing', label: 'Ongoing' }, { key: 'completed', label: 'Completed' }]} value={done ? 'completed' : 'ongoing'} onChange={(k) => go({ sub: k })} />
            <div className="flex gap-3 pb-3 pt-4"><SearchInput size="sm" placeholder="Search studies..." /><Select size="sm" className="w-[134px] shrink-0" value="All" options={['All']} /></div>
            <Table rows={done ? [...CLIENT_STUDIES, ...CLIENT_STUDIES_MORE] : CLIENT_STUDIES} rowKey={(r) => r.id} columns={studyCols} highlight="st-pay"
              onRowClick={(r) => r.id.startsWith('st-') && navigate(`/studies/${r.id}${done ? '?state=completed' : ''}`)} />
            {done && <div className="pt-3"><Pagination page={1} pages={80} /></div>}
          </div>
        )}
        {tab === 'payments' && (
          <div>
            <div className="flex gap-3"><Stat tint label="Due Payments" value="$6,874" note="of 5 studies" /><Stat label="All Time Spent" value="$25,890" note="for 5 studies" /><Stat label="Average Study Cost" value="$3,876" note="from 15 studies" /></div>
            <H>Pending Invoices</H><Table rowHeight={70} rows={PENDING_INVOICES} rowKey={(r) => r} columns={invoiceCols('Due Date (auto-debit)', 'due')} onRowClick={() => setInvoice('due')} />
            <H>Completed Invoices</H><Table rowHeight={70} rows={COMPLETED_INVOICES} rowKey={(r) => r} columns={invoiceCols('Date', 'paid')} onRowClick={() => setInvoice('paid')} />
            <H>Saved Payment Methods</H>
            <div className="flex gap-2">
              {[['Mastercard', '2687 4242 3247 4242', true], ['VISA', '2687 0047 2911 6080', false]].map(([brand, num, def]) => (
                <div key={String(brand)} className="h-[98px] w-[376px] rounded-lg bg-bg-1 p-4 text-text-regular leading-5">
                  <p className="flex items-center gap-2 text-text-title">{def ? <Mastercard /> : <span className="text-label font-semibold text-blue-600">VISA</span>}{brand}{def && <><span aria-hidden="true" className="text-text-body">•</span><span className="text-text-body">Default</span></>}</p>
                  <p className="pt-1.5 text-body-medium text-text-title">{num}</p><p className="pt-1.5 text-text-subtitle">Expires 08/28 &nbsp;•&nbsp; CVV: 235</p>
                </div>))}
            </div>
          </div>
        )}
      </div>
      <ReviewsPanel open={reviews} onClose={() => setReviews(false)} />
      <InvoicePanel kind={invoice} onClose={() => setInvoice(null)} />
      <AccountFlow kind={off ? 'reactivate' : 'deactivate'} step={flow} onStep={setFlow} onDone={() => { setFlow(null); go({ off: !off }) }} />
    </AppShell>
  )
}
