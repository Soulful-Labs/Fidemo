import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Tag from '../../components/ui/Tag'
import { Search } from '../../components/ui/icons'
import { dateLong } from '../../lib/format'
import { useStore } from '../../mock/store'
import TypeFilter from '../studies/TypeFilter'

const STATUS = [{ key: 'any', label: 'Any' }, { key: 'open', label: 'Open' }, { key: 'closed', label: 'Solved' }]
const SORT = [{ key: 'new', label: 'Newest first' }, { key: 'old', label: 'Oldest first' }]

/** The Support Chats tab (PRD 12.2, Figma 979:74612). */
export default function SupportTickets() {
  const navigate = useNavigate()
  const { tickets } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('any')
  const [sort, setSort] = useState('new')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tickets
      .filter((t) => (status === 'any' || t.status === status) && (!q || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)))
      .sort((a, b) => (sort === 'new' ? b.lastActivityAt.localeCompare(a.lastActivityAt) : a.lastActivityAt.localeCompare(b.lastActivityAt)))
  }, [tickets, query, status, sort])

  return (
    <div className="flex flex-col gap-4">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or ticket number" aria-label="Search tickets" leftIcon={<Search className="text-text-title" />} />
      <div className="flex gap-2">
        <div className="flex-1"><TypeFilter value={status} options={STATUS} onChange={setStatus} /></div>
        <div className="flex-1"><TypeFilter value={sort} options={SORT} onChange={setSort} /></div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No support tickets yet!" body="Send us a message and the conversation will show up here." actionLabel="Contact Us" onAction={() => navigate('/support/contact')} />
      ) : (
        list.map((t) => {
          const last = t.messages.at(-1)
          const unread = t.status === 'open' && last?.from === 'support'
          return (
            <Link key={t.id} to={`/support/tickets/${t.id}`} className="flex flex-col gap-2 rounded-lg bg-bg-1 p-4">
              <span className="flex items-center justify-between">
                <Tag tone={t.status === 'open' ? 'yellow' : 'green'} size="md">{t.status === 'open' ? 'Open' : 'Solved'}</Tag>
                <span className="text-text-regular text-text-body">#{t.id}</span>
              </span>
              <span className="text-body-medium text-text-title">{t.subject}</span>
              <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
                {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-primary" aria-label="Unread reply" />}
                <span className="truncate">{last?.from === 'you' ? 'You' : 'Support'}: {last?.text}</span>
              </span>
              <span className="text-label text-text-body">{dateLong(t.lastActivityAt)} • Created on {dateLong(t.createdAt)}</span>
            </Link>
          )
        })
      )}

      <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-bg-2 text-text-title">
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <p className="text-title-s text-text-title">Need Direct Help?</p>
        <p className="text-text-regular text-text-subtitle">Kindly contact us to get your any issues resolved</p>
        <Button size="md" className="self-start" onClick={() => navigate('/support/contact')}>Contact Us</Button>
      </div>
    </div>
  )
}
