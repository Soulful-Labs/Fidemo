import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import TabBar from '../../components/ui/TabBar'
import TopBar from '../../components/ui/TopBar'
import { ChevronDown, Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { FAQS } from '../../mock/data'
import SupportTickets from './SupportTickets'

/**
 * PRD 12.2 Help & Support, Figma 979:74536. /support is the Get Help tab,
 * /support/tickets the Support Chats tab; the segmented control routes.
 */
export default function Support() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tickets = pathname.startsWith('/support/tickets')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(3)

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.map((f, i) => ({ ...f, i })).filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Help & Support" onBack={() => navigate('/profile')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <TabBar items={[{ key: 'help', label: 'Get Help', to: '/support' }, { key: 'chats', label: 'Support Chats', to: '/support/tickets' }]} />

        {tickets ? (
          <SupportTickets />
        ) : (
          <>
            <h1 className="text-title-m leading-snug text-text-title">Hey there! 👋<br />We are here to help you!</h1>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your queries" aria-label="Search your queries" leftIcon={<Search className="text-text-title" />} />

            <h2 className="pt-2 text-body-medium text-text-title">Frequently Asked Questions</h2>
            <ul className="flex flex-col">
              {faqs.map((f) => {
                const on = open === f.i
                return (
                  <li key={f.q} className="border-b-1 border-stroke-2">
                    <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : f.i)} className="flex w-full items-start justify-between gap-3 py-3 text-left">
                      <span className="text-body-regular text-text-title">{f.q}</span>
                      <ChevronDown className={cn('mt-0.5 shrink-0 text-text-title transition-transform', on && 'rotate-180')} />
                    </button>
                    {on && <p className="pb-3 text-text-regular text-text-body">{f.a}</p>}
                  </li>
                )
              })}
              {faqs.length === 0 && <li className="py-4 text-center text-text-regular text-text-body">No answers match “{query}”. Send us a message instead.</li>}
            </ul>
          </>
        )}
      </div>

      {!tickets && (
        <CtaBar>
          <Button fullWidth onClick={() => navigate('/support/contact')}>Send us a message</Button>
        </CtaBar>
      )}
    </div>
  )
}
