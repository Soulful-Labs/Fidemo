import { useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Select from '../../components/ui/Select'
import Tag from '../../components/ui/Tag'
import { AskSupportPanel, SentSuccessModal } from './HelpPanels'
import { ChevronDown, ChevronRight, MessageIcon, Search } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { DIRECT_HELP, REPLY_TIMES, FAQS, TICKETS } from '../../mock/help'
import { useSeeded } from '../../mock/seeded'

/** One question, open or closed. The frame draws the first one open. */
function Faq({ q, a, open, onToggle }: { q: string; a?: string; open?: boolean; onToggle: () => void }) {
  return (
    <div className="border-b-1 border-stroke-1">
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-4 py-4 text-left">
        <span className="text-body-regular leading-[22px] text-text-title">{q}</span>
        <ChevronDown className={cn('mt-0.5 h-5 w-5 shrink-0 text-text-subtitle', open && 'rotate-180')} />
      </button>
      {open && a && <p className="max-w-[776px] pb-4 text-body-regular leading-[23px] text-text-subtitle">{a}</p>}
    </div>
  )
}

/** Need Direct Help?, drawn narrow beside the FAQs and wide under the tickets. */
function DirectHelp({ wide, onAsk }: { wide?: boolean; onAsk: () => void }) {
  if (wide) {
    return (
      <div className="mt-6 flex items-center gap-4 rounded-lg bg-bgAlt-1 p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-bg-0 text-brand-secondary">
          <MessageIcon className="h-6 w-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-title-s leading-[25px] text-text-title">{DIRECT_HELP.title}</span>
          <span className="text-text-regular text-text-subtitle">{DIRECT_HELP.body}</span>
          {/* Step 56's reply time. No frame draws one anywhere in Help. */}
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-text-regular text-brand-secondary">
            {REPLY_TIMES.short}
          </span>
        </span>
        <Button size="row" onClick={onAsk}>{DIRECT_HELP.cta}</Button>
      </div>
    )
  }
  return (
    <aside className="h-fit w-[304px] shrink-0 rounded-lg bg-bgAlt-1 p-4">
      <p className="text-title-s leading-[25px] text-text-title">{DIRECT_HELP.title}</p>
      <p className="pt-2 text-text-regular leading-5 text-text-subtitle">{DIRECT_HELP.body}</p>
      <p className="pt-2 text-text-regular leading-5 text-brand-secondary">{REPLY_TIMES.client}</p>
      <p className="text-text-regular leading-5 text-text-subtitle">{REPLY_TIMES.money}</p>
      <Button size="row" className="mt-4" onClick={onAsk}>{DIRECT_HELP.cta}</Button>
    </aside>
  )
}

/**
 * Help (1663:104191) and Support Tickets (1663:104228). One screen: a
 * segmented toggle swaps the FAQ list for the tickets table, and the same
 * Need Direct Help? card is drawn narrow beside the first and wide under the
 * second. Both raise Ask Support.
 */
export default function Help() {
  const [params, setParams] = useSearchParams()
  const tickets = params.get('tab') === 'tickets'
  /** A new account has raised none. */
  const rows = useSeeded(TICKETS)
  const [openFaq, setOpenFaq] = useState(0)
  const [panel, setPanel] = useState(params.get('panel') ?? '')
  const set = (k: string) => { const n = new URLSearchParams(params); n.set('tab', k); setParams(n) }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Help' }]}>
      <div className="min-h-[939px] rounded-lg bg-bg-0 p-4">
        <Tabs variant="segmented" className="w-[320px]" value={tickets ? 'tickets' : 'help'}
          onChange={set} items={[{ key: 'help', label: 'Help' }, { key: 'tickets', label: 'Support Tickets' }]} />

        {!tickets ? (
          <div className="flex gap-12 pt-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-title-s leading-[25px] text-text-title">Frequently Asked Questions</h2>
              <span className="mt-4 flex h-12 w-[800px] items-center gap-3 rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">
                <Search className="h-5 w-5" />Search your queries
              </span>
              <div className="w-[800px] pt-3">
                {FAQS.map((f, i) => (
                  <Faq key={f.q} {...f} open={i === openFaq} onToggle={() => setOpenFaq(i === openFaq ? -1 : i)} />
                ))}
              </div>
            </div>
            <DirectHelp onAsk={() => setPanel('ask')} />
          </div>
        ) : (
          <>
            <h2 className="pt-6 text-title-s leading-[25px] text-text-title">Tickets List</h2>
            <div className="flex items-center gap-4 pt-4">
              <span className="flex h-12 flex-1 items-center gap-3 rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">
                <Search className="h-5 w-5" />Search by name or ticket number
              </span>
              <Select value="Sort by: Newest first" className="w-[240px]" />
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border-1 border-stroke-input">
              <div className="flex h-[52px] items-center border-b-1 border-stroke-input text-text-regular text-text-subtitle">
                <span className="w-[594px] px-4">Support Ticket</span>
                <span className="w-[120px] px-4">Status</span>
                <span className="w-[120px] px-4">Last Activity</span>
                <span className="w-[120px] px-4">Created On</span>
                <span className="w-[140px] px-4">Ticket Number</span>
                <span className="w-[56px]" />
              </div>
              {rows.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <p className="text-body-medium text-text-title">You have not raised a ticket yet.</p>
                  <p className="text-text-regular text-text-subtitle">
                    Contact Support below and it will appear here.
                  </p>
                </div>
              )}
              {rows.map((t) => (
                <NavLink key={t.id} to={`/help/tickets/${t.id}`}
                  className="flex h-[76px] items-center border-b-1 border-stroke-input last:border-b-0 hover:bg-bg-1">
                  <span className="flex w-[594px] flex-col gap-1 px-4">
                    <span className="text-body-medium text-text-title">{t.subject}</span>
                    <span className="flex items-center gap-2 truncate text-text-regular text-text-subtitle">
                      {t.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-cta-primary" />}
                      <span className="truncate">{t.last}</span>
                    </span>
                  </span>
                  <span className="w-[120px] px-4">
                    <Tag tone="grey" className={cn('h-7 px-2.5',
                      t.status === 'Open' ? 'bg-yellow-30 text-brand-primary' : 'bg-green-50 text-brand-secondary')}>
                      {t.status}
                    </Tag>
                  </span>
                  <span className="w-[120px] px-4 text-text-regular text-text-title">{t.activity}</span>
                  <span className="w-[120px] px-4 text-text-regular text-text-title">{t.created}</span>
                  <span className="w-[140px] px-4 text-text-regular text-text-subtitle">{t.number}</span>
                  <span className="flex w-[56px] justify-center text-text-subtitle"><ChevronRight className="h-6 w-6" /></span>
                </NavLink>
              ))}
            </div>

            <DirectHelp wide onAsk={() => setPanel('ask')} />
          </>
        )}
      </div>

      <AskSupportPanel open={panel === 'ask'} onClose={() => setPanel('')} onSent={() => setPanel('sent')} />
      <SentSuccessModal open={panel === 'sent'} onClose={() => setPanel('')} />
    </AppShell>
  )
}
