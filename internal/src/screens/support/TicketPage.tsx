import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button, { IconButton } from '../../components/ui/Button'
import { ChevronLeft, ExternalIcon, InfoIcon, LinkIcon } from '../../components/ui/icons'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { cn } from '../../lib/cn'
import { THREAD as T } from '../../mock/support'

type State = 'new' | 'ongoing' | 'closed'
const Time = ({ right }: { right?: boolean }) => <p className={cn('pt-1.5 text-label text-text-body', right && 'text-right')}>{T.time}</p>
const Them = ({ children }: { children: ReactNode }) => <div className="max-w-[600px] self-start whitespace-pre-line rounded-lg bg-bg-2 p-4 text-text-regular leading-5 text-text-title">{children}</div>
const Us = ({ lines }: { lines: string[] }) => (
  <div className="self-end"><div className="flex w-[600px] flex-col gap-5 whitespace-pre-line rounded-lg bg-yellow-40 p-4 text-text-regular leading-5 text-text-title">{lines.map((l) => <p key={l}>{l}</p>)}</div><Time right /></div>
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
  const [params, setParams] = useSearchParams()
  const state: State = params.get('state') === 'ongoing' ? 'ongoing' : params.get('state') === 'closed' ? 'closed' : 'new'
  const [dialog, setDialog] = useState<null | 'ask' | 'done'>(null)
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const set = (s: State) => setParams(s === 'new' ? {} : { state: s }, { replace: true })
  const info = (
    <Them>
      <p className="flex items-center gap-1 pb-2 text-brand-primary"><InfoIcon className="h-4 w-4" />Ticket Info</p>
      <p className="text-text-subtitle">Subject</p><p>{T.info.subject}</p><p className="pt-3 text-text-subtitle">Message</p>
      <p>{T.info.message[0]}</p><p className="pt-5">{T.info.message[1]}</p><p>{T.info.message[2]}</p>
    </Them>
  )
  const shot = <div><img src="/img/support/shot.png" alt="Attachment" className="h-[127px] w-[170px] rounded-md object-cover" /><Time /></div>
  const userMessage = <Them><p>{T.info.message[0]}</p><p className="pt-5">{T.info.message[1]}</p><p>{T.info.message[2]}</p></Them>
  const reply = <div className="self-start"><Them>{T.reply}</Them><Time /></div>

  return (
    <AppShell className="flex flex-col p-0" crumbs={[{ label: state === 'new' ? 'New Ticket' : 'Ongoing', to: `/support${state === 'new' ? '' : `?tab=${state}`}` }, { label: T.subject }]}
      right={<>
        <span className="text-body-regular text-text-subtitle">{T.number}</span>
        {state === 'closed' ? <Button variant="tertiary" size="md" className="px-3" onClick={() => set('ongoing')}>Re-open</Button>
          : <Button size="md" className="px-3" disabled={state === 'new'} onClick={() => setDialog('ask')}>Mark Resolved</Button>}
      </>}>
      <div className="sticky top-topbar z-10 flex h-14 shrink-0 items-center gap-3 bg-bg-1 px-4">
        <button type="button" aria-label="Back to Support" onClick={() => navigate(`/support${state === 'new' ? '' : `?tab=${state}`}`)}><ChevronLeft className="h-5 w-5 text-text-title" /></button>
        <h1 className="flex-1 pl-1 text-body-medium text-text-title">{T.subject}</h1>
        <span className={cn('flex h-7 items-center rounded-full px-2.5 text-text-regular', state === 'closed' ? 'bg-state-successBg text-state-success' : 'bg-yellow-50 text-brand-primary')}>{state === 'closed' ? 'Solved' : 'Open'}</span>
        <button type="button" aria-label="Ticket info" className="px-1"><InfoIcon className="h-6 w-6 text-text-title" /></button>
        <Chip onClick={() => navigate('/participants/p-1')}><img src="/img/verifications/robert.png" alt="" className="h-4 w-4 rounded-full" />User profile</Chip>
        {state === 'ongoing' && <Chip onClick={() => navigate('/participants/verifications/iv-1')}><span className="text-text-title">[Report/Verification]</span></Chip>}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-4">
        <p className="self-center pb-1 text-label text-text-subtitle">{T.day}</p>
        {state === 'new' && <>{info}{shot}</>}
        {state === 'ongoing' && <><Us lines={T.ask} />{userMessage}{shot}{reply}</>}
        {state === 'closed' && <>{info}{shot}<Us lines={T.ask} /><div className="self-start">{userMessage}<Time /></div>{reply}<Us lines={T.bye} /></>}
        {sent.map((m, i) => <Us key={i} lines={[m]} />)}
        {state === 'closed' && <p className="mt-3 flex h-11 items-center justify-center gap-2 rounded-md border-1 border-stroke-1 bg-bgAlt-1 text-text-regular text-text-title">{T.closed[0]}<span aria-hidden="true">•</span><span className="text-text-subtitle">{T.closed[1]}</span></p>}
      </div>
      {state !== 'closed' && (
        <form className="sticky bottom-0 flex h-[66px] shrink-0 items-center gap-3 border-t-1 border-stroke-1 bg-bg-1 px-4" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setSent((s) => [...s, draft.trim()]); setDraft('') } }}>
          <IconButton label="Attach a file"><LinkIcon className="h-5 w-5" /></IconButton>
          <input aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..." className="h-[38px] flex-1 rounded-sm border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title outline-none placeholder:text-text-body" />
          <Button type="submit" size="md" className="px-5">Send</Button>
        </form>
      )}
      <Modal open={dialog === 'ask'} onClose={() => setDialog(null)} title="Mark Resolved?" footer={<><Button variant="tertiary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => setDialog('done')}>Mark Resolved</Button></>}>
        <p className="text-body-regular text-text-subtitle">Are you sure you want to mark this ticket as resolved? User won’t be able to message further on this ticket.</p>
      </Modal>
      <SuccessModal tone="green" open={dialog === 'done'} onClose={() => { setDialog(null); set('closed') }} onAction={() => { setDialog(null); set('closed') }} action="Done"
        title="Ticket Is Resolved And Closed!" body={<><strong className="font-semibold">{T.number}</strong> is marked as resolved and moved to closed section.</>} />
    </AppShell>
  )
}
