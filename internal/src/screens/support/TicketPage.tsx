import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button, { IconButton } from '../../components/ui/Button'
import { ChevronLeft, ExternalIcon, InfoIcon, LinkIcon } from '../../components/ui/icons'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { cn } from '../../lib/cn'
import { useTicket } from '../../mock/support'
import { platform } from '@shared/store'
import { TEAM } from '../../platform'

type State = 'new' | 'ongoing' | 'closed'
const Time = ({ right, at }: { right?: boolean; at: string }) => <p className={cn('pt-1.5 text-label text-text-body', right && 'text-right')}>{at}</p>
const Them = ({ children }: { children: ReactNode }) => <div className="max-w-[600px] self-start whitespace-pre-line rounded-lg bg-bg-2 p-4 text-text-regular leading-5 text-text-title">{children}</div>
const Us = ({ lines, at }: { lines: string[]; at: string }) => (
  <div className="self-end"><div className="flex w-[600px] flex-col gap-5 whitespace-pre-line rounded-lg bg-yellow-40 p-4 text-text-regular leading-5 text-text-title">{lines.map((l) => <p key={l}>{l}</p>)}</div><Time right at={at} /></div>
)
const Chip = ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
  <button type="button" onClick={onClick} className="flex h-8 items-center gap-1.5 rounded-full bg-bgAlt-2 px-3 text-text-regular text-text-subtitle">{children}<ExternalIcon className="h-4 w-4" /></button>
)

/**
 * A ticket (`/support/:id`, `?state=ongoing|closed`): a chat that fills the
 * page. The title bar carries the ticket number and the one action; a 46px
 * bar under it the subject, the status, an info button and a link to the
 * user's profile.
 * - New (2045:51486, user created): the user's "Ticket Info" (Subject,
 *   Message) and attachment; "Mark Resolved" greyed; the composer.
 * - Ongoing (2045:52936, team created): the team's opening message, the
 *   user's replies; "Mark Resolved" live; a "[Report/Verification]" link back
 *   to what the ticket is about. This is where Chat on a verification lands.
 * - Closed (2045:53435): the whole thread, "Solved", "Re-open", no composer,
 *   and "This ticket has been resolved and closed".
 */
export default function TicketPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const v = useTicket(id)
  const t = v.ticket
  /** The state is the ticket's own: new until a person on the team replies, then ongoing, then closed. */
  const state: State = v.stage
  const [dialog, setDialog] = useState<null | 'ask' | 'done'>(null)
  const [draft, setDraft] = useState('')
  const [first, ...rest] = v.messages
  const info = first && (
    <div className="self-start"><Them>
      <p className="flex items-center gap-1 pb-2 text-brand-primary"><InfoIcon className="h-4 w-4" />Ticket Info</p>
      <p className="text-text-subtitle">Subject</p><p>{t.subject}</p><p className="pt-3 text-text-subtitle">Message</p>
      <p>{first.text}</p>
    </Them><Time at={first.time} /></div>
  )
  /** The thread as the team sees it: the user on the left, the team and the automatic first answer on the right. */
  const thread = (first?.from === 'user' ? rest : v.messages).map((m) => m.from === 'user'
    ? <div key={m.id} className="self-start"><Them>{m.text}</Them><Time at={m.time} /></div>
    : <Us key={m.id} lines={[m.text]} at={m.time} />)
  const send = () => { if (draft.trim() && platform().replyTicket(t.id, 'team', draft.trim(), TEAM).ok) setDraft('') }

  return (
    <AppShell className="flex flex-col p-0" crumbs={[{ label: state === 'new' ? 'New Ticket' : state === 'closed' ? 'Closed' : 'Ongoing', to: `/support${state === 'new' ? '' : `?tab=${state}`}` }, { label: t.subject }]}
      right={<>
        <span className="text-body-regular text-text-subtitle">#{t.id}</span>
        {state === 'closed' ? <Button variant="tertiary" size="md" className="px-3" onClick={() => platform().reopenTicket(t.id, TEAM)}>Re-open</Button>
          : <Button size="md" className="px-3" disabled={state === 'new'} onClick={() => setDialog('ask')}>Mark Resolved</Button>}
      </>}>
      <div className="sticky top-topbar z-10 flex h-14 shrink-0 items-center gap-3 bg-bg-1 px-4">
        <button type="button" aria-label="Back to Support" onClick={() => navigate(`/support${state === 'new' ? '' : `?tab=${state}`}`)}><ChevronLeft className="h-5 w-5 text-text-title" /></button>
        <h1 className="flex-1 pl-1 text-body-medium text-text-title">{t.subject}</h1>
        <span className={cn('flex h-7 items-center rounded-full px-2.5 text-text-regular', state === 'closed' ? 'bg-state-successBg text-state-success' : 'bg-yellow-50 text-brand-primary')}>{state === 'closed' ? 'Solved' : 'Open'}</span>
        <button type="button" aria-label="Ticket info" className="px-1"><InfoIcon className="h-6 w-6 text-text-title" /></button>
        <Chip onClick={() => navigate(v.profile)}><img src="/img/verifications/robert.png" alt="" className="h-4 w-4 rounded-full" />User profile</Chip>
        {v.about && <Chip onClick={() => navigate(v.about!)}><span className="text-text-title">[Report/Verification]</span></Chip>}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-4">
        <p className="self-center pb-1 text-label text-text-subtitle">{v.day}</p>
        {first?.from === 'user' && info}
        {thread}
        {state === 'closed' && <p className="mt-3 flex h-11 items-center justify-center gap-2 rounded-md border-1 border-stroke-1 bg-bgAlt-1 text-text-regular text-text-title">This ticket has been resolved and closed<span aria-hidden="true">•</span><span className="text-text-subtitle">{v.closedAt}</span></p>}
      </div>
      {state !== 'closed' && (
        <form className="sticky bottom-0 flex h-[66px] shrink-0 items-center gap-3 border-t-1 border-stroke-1 bg-bg-1 px-4" onSubmit={(e) => { e.preventDefault(); send() }}>
          <IconButton label="Attach a file"><LinkIcon className="h-5 w-5" /></IconButton>
          <input aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..." className="h-[38px] flex-1 rounded-sm border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title outline-none placeholder:text-text-body" />
          <Button type="submit" size="md" className="px-5">Send</Button>
        </form>
      )}
      <Modal open={dialog === 'ask'} onClose={() => setDialog(null)} title="Mark Resolved?" footer={<><Button variant="tertiary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => { if (platform().resolveTicket(t.id, TEAM).ok) setDialog('done') }}>Mark Resolved</Button></>}>
        <p className="text-body-regular text-text-subtitle">Are you sure you want to mark this ticket as resolved? User won’t be able to message further on this ticket.</p>
      </Modal>
      <SuccessModal tone="green" open={dialog === 'done'} onClose={() => setDialog(null)} onAction={() => setDialog(null)} action="Done"
        title="Ticket Is Resolved And Closed!" body={<><strong className="font-semibold">#{t.id}</strong> is marked as resolved and moved to closed section.</>} />
    </AppShell>
  )
}
