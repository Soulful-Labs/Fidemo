import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { barredFrom } from '@shared/derive'
import { closedByOwner } from '@shared/lifecycle'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TopBar from '../components/ui/TopBar'
import { dateLong } from '../lib/format'
import { useStore } from '../mock/store'

/**
 * Policy section 9. A restricted participant is told they are restricted,
 * which category it was, and when it ends: a banner over every screen until
 * the date passes. A deactivated one is sent the written reason and can
 * appeal: the whole app gives way to this screen.
 */
export function RestrictionBanner() {
  const { user, signedIn } = useStore()
  const [open, setOpen] = useState(false)
  const bar = signedIn ? barredFrom(user) : null
  if (!bar || bar.kind !== 'restricted') return null
  return (
    <div role="status" className="shrink-0 border-b-1 border-state-danger bg-state-dangerBg px-4 py-2.5">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-col gap-0.5 text-left">
        <span className="text-text-medium text-text-title">Account restricted until {dateLong(bar.until)}</span>
        <span className="text-label text-text-subtitle">
          {bar.category}. You cannot take part in studies, withdraw or redeem until then.{open ? '' : ' Tap for the reason.'}
        </span>
        {open && <span className="pt-1 text-label text-text-body">{bar.reason}</span>}
      </button>
    </div>
  )
}

export function DeactivatedScreen() {
  const { user, appealDeactivation, signOut } = useStore()
  const [text, setText] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const note = user.statusNote
  return (
    <div className="flex min-h-full flex-col gap-4 px-4 pb-8 pt-10">
      <h1 className="text-title-l text-text-title">Your account has been deactivated</h1>
      <div className="flex flex-col gap-2 rounded-lg bg-bg-1 p-4">
        <span className="text-label uppercase text-text-subtitle">Reason{note?.category ? ` · ${note.category}` : ''}</span>
        <p className="text-body-regular text-text-title">{note?.reason || 'No reason was recorded.'}</p>
        {note?.at && <span className="text-label text-text-body">Decided on {dateLong(note.at)}</span>}
      </div>
      {sent ? (
        <div className="flex flex-col gap-2 rounded-lg border-1 border-brand-secondary p-4">
          <p className="text-body-medium text-text-title">Appeal sent</p>
          <p className="text-text-regular text-text-body">Your appeal is ticket #{sent}. The team will review it and reply by email.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-text-regular text-text-body">If you think this is wrong, tell the team why. Your appeal goes to them as a support ticket.</p>
          <Input label="Your appeal" multiline rows={4} placeholder="Why should this decision be reviewed?" value={text} onChange={(e) => setText(e.target.value)} />
          <Button fullWidth disabled={!text.trim()} onClick={() => { const id = appealDeactivation(text); if (id) setSent(id) }}>Send Appeal</Button>
        </div>
      )}
      <Button variant="tertiary" fullWidth onClick={signOut}>Sign Out</Button>
    </div>
  )
}

/** Whether the signed-in participant is deactivated by the team (not the same as signing out). */
export function useDeactivated(): boolean {
  const { user, signedIn } = useStore()
  // An account its owner just closed is signed out by Deactivate Account's own modal, not taken over by this screen.
  return signedIn && barredFrom(user)?.kind === 'deactivated' && !closedByOwner(user)
}

/**
 * Policy section 9: while restricted, a participant cannot apply, attend,
 * submit, withdraw or redeem. The screens for those are wrapped in this
 * gate (src/routes.ts), so reaching one by any button or address says why,
 * which category, and until when, instead of starting something the platform
 * will refuse.
 */
export function RestrictedGate({ title, back, children }: { title: string; back: string; children?: ReactNode }) {
  const { user, signedIn } = useStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const bar = signedIn ? barredFrom(user) : null
  if (!bar || bar.kind !== 'restricted') return <>{children}</>
  const to = back.replace(':id', id ?? '')
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={title} onBack={() => navigate(to)} />
      <div className="flex flex-col gap-4 px-4 pt-6">
        <h1 className="text-title-m text-text-title">Your account is restricted until {dateLong(bar.until)}</h1>
        <p className="text-body-regular text-text-body">Until then you cannot take part in studies, withdraw or redeem. Everything else in the app works as usual, and this lifts by itself on that date.</p>
        <div className="flex flex-col gap-1 rounded-lg bg-bg-1 p-4">
          <span className="text-label uppercase text-text-subtitle">{bar.category}</span>
          <p className="text-text-regular text-text-title">{bar.reason || 'No reason was recorded.'}</p>
        </div>
        <Button fullWidth onClick={() => navigate(to)}>Go Back</Button>
      </div>
    </div>
  )
}
