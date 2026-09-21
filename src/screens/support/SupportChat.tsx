import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import TopBar from '../../components/ui/TopBar'
import { Info } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { REPLY_TIME, TOPIC_LABEL } from '../../lib/support'
import { useStore } from '../../mock/store'
import type { Ticket } from '../../mock/types'

const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
/** "Aug 16, Sunday", as drawn. */
const day = (iso: string) => { const d = new Date(iso); return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}` }

function TicketInfo({ ticket }: { ticket: Ticket }) {
  return (
    <div className="ml-auto flex max-w-[88%] flex-col gap-2 rounded-lg bg-bg-1 p-4 text-text-regular">
      <p className="flex items-center gap-2 text-body-medium text-text-title"><Info className="h-4 w-4" />Ticket Info</p>
      <p className="text-text-body">Subject<br /><span className="text-text-title">{ticket.subject}</span></p>
      <p className="text-text-body">Message<br /><span className="text-text-title">{ticket.message}</span></p>
      {ticket.studyTitle && <p className="text-text-title">Study: {ticket.studyTitle}</p>}
    </div>
  )
}

/** PRD 12.2 Support Chat, Figma 979:74740. Send appends to the thread and clears the composer. */
export default function SupportChat() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { tickets, sendTicketMessage, toast } = useStore()
  const ticket = tickets.find((t) => t.id === id)
  const [text, setText] = useState('')
  const [info, setInfo] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const count = ticket?.messages.length ?? 0

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [count])

  if (!ticket) {
    return <EmptyState title="Ticket not found" actionLabel="Back to Support Chats" onAction={() => navigate('/support/tickets')} />
  }

  const send = () => {
    if (!text.trim()) return
    sendTicketMessage(ticket.id, text.trim())
    setText('')
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={ticket.subject} onBack={() => navigate('/support/tickets')} />

      <div className="flex items-center gap-2 border-b-1 border-stroke-2 px-4 py-2">
        <Tag tone={ticket.status === 'open' ? 'yellow' : 'green'}>{ticket.status === 'open' ? 'Open' : 'Solved'}</Tag>
        <span className="text-body-regular text-text-title">#{ticket.id}</span>
        <button type="button" aria-label="Ticket info" onClick={() => setInfo(true)} className="ml-auto text-text-title"><Info className="h-6 w-6" /></button>
      </div>

      {ticket.status === 'open' && (
        <p className="border-b-1 border-stroke-2 px-4 py-2 text-label text-text-body">
          {TOPIC_LABEL[ticket.topic]} • a person on the team replies {REPLY_TIME[ticket.topic]}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4">
        <p className="text-center text-text-regular text-text-body">{day(ticket.createdAt)}</p>
        <TicketInfo ticket={ticket} />
        {ticket.messages.slice(1).map((m, i) => {
          const mine = m.from === 'you'
          return (
            <div key={m.id} className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[85%] rounded-lg px-4 py-3 text-text-regular', mine ? 'bg-bg-2 text-text-title' : 'bg-yellow-1000/60 text-text-title')}>
                {m.text}
                {!mine && i === 0 && (
                  <span className="mt-2 block w-fit rounded-full bg-bg-0/60 px-2 py-0.5 text-label text-text-subtitle">Automated reply from our guides</span>
                )}
              </div>
              <span className="text-label text-text-body">{time(m.at)}</span>
            </div>
          )
        })}
        <div ref={end} />
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t-1 border-stroke-2 bg-bg-0 px-4 py-3">
        <button type="button" aria-label="Attach a file" onClick={() => toast('Attachments are not part of this prototype')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-1 border-stroke-3 text-text-title">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="m16 8-7.5 7.5a2.1 2.1 0 0 0 3 3L19 11a4.2 4.2 0 0 0-6-6L5.5 12.5a6.4 6.4 0 0 0 9 9L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Write a message..." aria-label="Write a message"
          className="h-10 min-w-0 flex-1 rounded-md border-1 border-stroke-3 bg-transparent px-3 text-text-regular text-text-title outline-none placeholder:text-text-disabled" />
        <Button size="md" className="w-10 shrink-0 px-0" aria-label="Send" onClick={send} disabled={!text.trim()} onBlocked={() => toast('Write a message first')}>
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0"><path d="M4 12 20 4l-4 16-4-7-8-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </Button>
      </div>

      <Modal open={info} onClose={() => setInfo(false)} title="Ticket Info" footer={<Button fullWidth onClick={() => setInfo(false)}>Got It!</Button>}>
        <div className="flex flex-col gap-2 text-text-regular">
          <p className="text-text-body">Subject<br /><span className="text-text-title">{ticket.subject}</span></p>
          <p className="text-text-body">Message<br /><span className="text-text-title">{ticket.message}</span></p>
          {ticket.studyTitle && <p className="text-text-body">Study<br /><span className="text-text-title">{ticket.studyTitle}</span></p>}
        </div>
      </Modal>
    </div>
  )
}
