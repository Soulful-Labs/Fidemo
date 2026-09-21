import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SuccessBadge from '../../components/app/SuccessBadge'
import Button from '../../components/ui/Button'
import CtaBar from '../../components/ui/CtaBar'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'
import { TIMINGS } from '../../mock/timings'

/**
 * PRD 12.2 Contact us, Figma 1327:85144. Get Support on a study arrives with
 * ?study= and the subject prefilled. Submit adds a ticket and shows the
 * success modal (1327:85294) with Go To Chat and Done.
 */
export default function ContactUs() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const study = params.get('study') ?? undefined
  const { addTicket, toast } = useStore()
  const [subject, setSubject] = useState(study ? `About "${study}"` : '')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const valid = subject.trim().length >= 3 && message.trim().length >= 10

  const submit = () => {
    setSending(true)
    setTimeout(() => {
      setTicketId(addTicket(subject.trim(), message.trim(), study))
      setSending(false)
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Contact us" onBack={() => navigate(-1)} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <p className="text-text-regular text-text-subtitle">Send us a message</p>
        <Input label="Subject" placeholder="Write subject here" value={subject} onChange={(e) => setSubject(e.target.value)}
          onBlur={() => setTouched(true)} error={touched && subject.trim().length < 3 ? 'Enter a subject' : undefined} />
        <Input label="Message" multiline rows={6} placeholder="Describe your issues in detail here.." value={message} onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched(true)} error={touched && message.trim().length < 10 ? 'Tell us a little more (at least 10 characters)' : undefined} />
      </div>

      <CtaBar>
        <Button fullWidth loading={sending} disabled={!valid} onClick={submit} onBlocked={() => { setTouched(true); toast('Add a subject and a message') }}>Submit</Button>
      </CtaBar>

      <Modal open={ticketId !== null} onClose={() => undefined} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate(`/support/tickets/${ticketId}`, { replace: true })}>Go To Chat</Button>
            <Button className="flex-1" onClick={() => navigate('/support/tickets', { replace: true })}>Done</Button>
          </div>
        }>
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <SuccessBadge />
          <h2 className="text-title-l text-text-title">Submitted successfully!</h2>
          <p className="text-body-regular text-text-body">Your issue has been sent to our Support team and they will revert back to you shortly!</p>
        </div>
      </Modal>
    </div>
  )
}
