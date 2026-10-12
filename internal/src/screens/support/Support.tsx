import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Input, { SearchInput, TextArea } from '../../components/ui/Input'
import { ChevronRight, SortIcon } from '../../components/ui/icons'
import { SidePanel } from '../../components/ui/Overlay'
import { Pagination } from '../../components/ui/Table'
import { SegmentedTabs } from '../../components/ui/Tabs'
import { cn } from '../../lib/cn'
import { ownerByEmail, useSupportList } from '../../mock/support'
import { platform } from '@shared/store'
import { TEAM, usePlatform } from '../../platform'

type Tab = 'new' | 'ongoing' | 'closed'
const GRID = 'grid grid-cols-[1fr_160px_140px_120px_125px_40px] items-center'

/**
 * Create Ticket (2045:115768, the 600 panel, 470 tall): Subject, User Email
 * Address, Message; Create and Send / Cancel. The team opens a ticket to a
 * user by email; nothing says whether that user is a participant or a client.
 */
export function CreateTicket({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (id: string) => void }) {
  const state = usePlatform()
  const [form, setForm] = useState({ subject: '', email: '', message: '' })
  const [why, setWhy] = useState('')
  /** The ticket is opened on the platform for whoever holds that email, participant or client. */
  const create = () => {
    const owner = ownerByEmail(state, form.email)
    if (!owner) { setWhy('No participant or client has that email address'); return }
    const made = platform().createTicket(owner, { subject: form.subject, message: form.message }, TEAM)
    if (!made.ok) { setWhy(made.why); return }
    setWhy(''); setForm({ subject: '', email: '', message: '' }); onCreate(made.id)
  }
  return (
    <SidePanel open={open} onClose={onClose} title="Create Ticket" footer={<><Button onClick={create}>Create and Send</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></>}>
      <div className="flex flex-col gap-4 pb-3 pt-1">
        <Input label="Subject" placeholder="Enter subject of the ticket" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
        <Input label="User Email Address" type="email" placeholder="Add user email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <TextArea label="Message" rows={3} className="[&_textarea]:h-[90px]" placeholder="Enter you message in detail" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        {why && <p className="text-text-regular text-state-danger">{why}</p>}
      </div>
    </SidePanel>
  )
}

/**
 * Support (New 2036:159859, Ongoing 2044:49967, Closed 2044:50380): three
 * segments over one list. A heading with a count ("Pending Tickets 3",
 * "Ongoing Tickets 4 messages", "Completed Tickets 628"), one search, then
 * 62px rows: the subject over the last message (an orange dot when unread),
 * From, Last Activity, Created On, Ticket Number and a chevron. New has three
 * tickets, no pagination, and the only "Create Ticket" button.
 * No column, tag or filter tells a participant's ticket from a client's.
 */
export default function Support() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'ongoing' ? 'ongoing' : params.get('tab') === 'closed' ? 'closed' : 'new'
  const [creating, setCreating] = useState(false)
  const { rows: all, HEADING } = useSupportList(tab)
  const [title, count] = HEADING
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  /** Search narrows by name, subject or ticket number; the list pages at ten. */
  const found = all.filter((t) => !query.trim() || `${t.from} ${t.subject} ${t.number}`.toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.max(1, Math.ceil(found.length / 10))
  const rows = found.slice((Math.min(page, pages) - 1) * 10, Math.min(page, pages) * 10)
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Support' }]}>
      <div className="flex items-center justify-between">
        <SegmentedTabs className="w-[360px]" segmentClassName="flex-1 min-w-0" value={tab} onChange={(k) => setParams(k === 'new' ? {} : { tab: k }, { replace: true })}
          items={[{ key: 'new', label: 'New' }, { key: 'ongoing', label: 'Ongoing' }, { key: 'closed', label: 'Closed' }]} />
        {tab === 'new' && <Button variant="secondary" className="px-5" onClick={() => setCreating(true)}>Create Ticket</Button>}
      </div>
      <h2 className="flex items-center gap-2 pb-[17px] pt-4 text-title-s leading-[25px] text-text-title">{title}
        <span className={cn('flex h-7 items-center rounded-full px-2.5 text-text-regular', tab === 'new' ? 'min-w-7 justify-center bg-yellow-500 text-text-title' : tab === 'ongoing' ? 'bg-yellow-200 text-text-title' : 'border-1 border-stroke-3 text-text-subtitle')}>{count}</span></h2>
      <SearchInput placeholder="Search by name or ticket number" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div role="table" className="mt-4 overflow-hidden rounded-lg border-1 border-stroke-2 text-text-regular text-text-title">
        <div role="row" className={cn(GRID, 'h-[52px] bg-bg-1 px-4 text-text-subtitle')}>
          <span>Support Ticket</span><span>From</span><span className="flex items-center gap-2">Last Activity<SortIcon className="h-4 w-4 text-text-body" /></span>
          <span className="flex items-center gap-1">Created On<SortIcon className="h-4 w-4 text-text-body" /></span><span>Ticket Number</span><span />
        </div>
        {rows.map((t) => {
          const dot = tab !== 'closed' && t.unread
          return (
            <div role="row" key={t.id} onClick={() => navigate(`/support/${t.id}`)} className={cn(GRID, 'h-[76px] cursor-pointer border-t-1 border-stroke-1 px-4 hover:bg-bgAlt-1')}>
              <span className="min-w-0 pr-6">
                <span className="block text-text-medium">{t.subject}</span>
                <span className={cn('flex items-center gap-2 pt-1', dot ? 'text-text-title' : 'text-text-subtitle')}>{dot && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" />}
                  <span className="truncate">{t.who}: {t.last}</span></span>
              </span>
              <span className="self-start pt-4">{t.from}</span><span className="self-start pt-4">{t.date}</span><span className="self-start pt-4">{t.created}</span>
              <span className="self-start pt-4 text-text-subtitle">{t.number}</span><ChevronRight className="h-5 w-5 justify-self-end" />
            </div>
          )
        })}
      </div>
      {tab !== 'new' && <div className="pt-3"><Pagination page={Math.min(page, pages)} pages={pages} onChange={setPage} /></div>}
      <CreateTicket open={creating} onClose={() => setCreating(false)} onCreate={(id) => { setCreating(false); navigate(`/support/${id}`) }} />
    </AppShell>
  )
}
