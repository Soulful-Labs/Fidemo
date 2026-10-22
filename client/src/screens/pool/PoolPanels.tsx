import SidePanel from '../../components/ui/SidePanel'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { Avatar } from '../../components/client/RespondentCard'
import { Check, ChevronLeft, DiaryBookIcon, Star, StarFilled } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import type { Respondent } from '../../components/client/RespondentCard'
import { participantReviews } from '@shared/derive'
import { usePlatform, useProfile, useStudies } from '../../platform'
import { isLive } from '@shared/lifecycle'
import { useToast } from '../../components/ui/Toast'

/** The person a Pool panel is about, under its title bar. */
function Person({ respondent }: { respondent: Respondent }) {
  const d = useProfile(respondent.id)
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Avatar name={respondent.name} photo={respondent.photo} size={64} />
      <span className="flex flex-col">
        <span className="text-text-regular text-text-subtitle">{respondent.name}</span>
        <span className="text-title-s leading-[22px] text-text-title">{respondent.role}</span>
        {d && (
          <span className="pt-1 text-text-regular text-text-subtitle">
            {d.location} <span className="px-1 text-text-body">&bull;</span> {d.cert}
          </span>
        )}
      </span>
    </div>
  )
}

/** Five stars with the given number beside them. */
function Stars({ n, size = 'h-5 w-5' }: { n: number; size?: string }) {
  return (
    <span className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        i <= n ? <StarFilled key={i} className={cn(size, 'text-brand-primary')} />
          : <Star key={i} className={cn(size, 'text-text-disabled')} />
      ))}
    </span>
  )
}

/**
 * Reviews (1645:163046): the second page of the respondent profile panel,
 * reached from its "Reviews ›" link. Each entry is a study, what the client
 * wrote about the respondent, and what the respondent wrote back.
 */
export function ReviewsPanel({ open, onClose, onBack, onInvite, respondent }: {
  open: boolean; onClose: () => void; onBack?: () => void; onInvite?: () => void
  /** Whose reviews (22 Oct 2026): the rows are the platform's ratings of this person, no longer a drawn sample. */
  respondent: Respondent | null
}) {
  const toast = useToast()
  const state = usePlatform()
  if (!respondent) return null
  const rows = participantReviews(state, respondent.id)
  return (
    <SidePanel open={open} onClose={onClose} title={`Profile of ${respondent.name}.`} headerClassName="h-14"
      bodyClassName="flex flex-col p-0"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={() => (onInvite ? onInvite() : toast('Open their profile to invite them to a study'))}>Invite To Study</Button>
        </div>
      }>
      <Person respondent={respondent} />
      <div className="mx-4 flex flex-col rounded-lg border-1 border-stroke-input">
        <button type="button" onClick={onBack}
          className="flex items-center gap-4 border-b-1 border-stroke-1 px-4 py-4 text-title-s leading-[22px] text-text-title">
          <ChevronLeft className="h-5 w-5 text-text-subtitle" />Reviews
        </button>
        {rows.length === 0 && <p className="px-4 py-4 text-text-regular text-text-subtitle">No client has rated them yet.</p>}
        {rows.map((r) => (
          <div key={r.studyId} className="flex flex-col gap-2 border-b-1 border-stroke-1 px-4 py-4 last:border-b-0">
            <p className="text-body-medium text-text-title">{r.study}</p>
            <p className="flex items-center gap-2">
              <Stars n={r.stars} />
              <span className="text-body-medium text-text-title">{r.stars.toFixed(1)}</span>
              <span className="text-text-body">&bull;</span>
              <span className="text-text-regular text-text-subtitle">{new Date(r.at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </p>
            {r.comment && <p className="text-text-regular leading-5 text-text-subtitle">{r.comment}</p>}
            {r.client && r.back > 0 && (
              <p className="flex items-center gap-2 truncate pt-1">
                <span className="shrink-0 text-text-regular text-text-subtitle">To client:</span>
                <span className="shrink-0 text-body-medium text-text-title">{r.client}</span>
                <Stars n={r.back} size="h-4 w-4" />
                <span className="shrink-0 text-body-medium text-text-title">{r.back.toFixed(1)}</span>
                {r.reply && <span className="truncate text-text-regular text-text-body">{r.reply}</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </SidePanel>
  )
}

/** Invite To Study (1645:163182): pick which live study the invitation is for. */
export function InvitePanel({ open, onClose, name = 'Roma', personId, onSent }: { open: boolean; onClose: () => void; name?: string; personId?: string; onSent?: () => void }) {
  const { studies, moveRespondent } = useStudies()
  const toast = useToast()
  /** The client's own live studies: the only ones an invitation can be for. */
  const INVITE_STUDIES = studies.filter((s) => isLive(s.state))
  /** The frame draws the first study chosen; now it is a choice. */
  const [picked, setStudy] = useState('')
  const study = picked || INVITE_STUDIES[0]?.id || ''
  /** Workflow 26, 27: the invitation is a real move on the shared platform, refused with a reason if it cannot be sent. */
  const send = () => {
    if (personId && study) {
      const res = moveRespondent(study, personId, 'invited')
      if (!res.ok) { toast(res.why); return }
    }
    ;(onSent ?? onClose)()
  }
  return (
    <SidePanel open={open} onClose={onClose} title={`Invite ${name} To Study`} headerClassName="h-14"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={INVITE_STUDIES.length === 0} onClick={send}>Send Invite</Button>
        </div>
      }>
      <div className="flex flex-col gap-1">
        <p className="text-title-s leading-[22px] text-text-title">Select active studies</p>
        <p className="text-text-regular text-text-subtitle">An invitation will be sent to apply for selected studies</p>
      </div>
      {INVITE_STUDIES.map((s) => (
        <button key={s.id} type="button" onClick={() => setStudy(s.id)}
          className={cn('flex items-center gap-3 rounded-lg border-1 p-3 text-left',
          s.id === study ? 'border-cta-primary bg-yellow-30' : 'border-stroke-input hover:bg-bg-1')}>
          <img src={s.image} alt="" className="h-[52px] w-[72px] shrink-0 rounded-md object-cover" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="truncate text-body-medium text-text-title">{s.title}</span>
            <span className="flex items-center gap-2">
              <StudyTypeTag type={s.type} icon={s.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
              <span className="inline-flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
                {s.industry}
              </span>
            </span>
          </span>
          {s.id === study && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cta-primary text-cta-primaryText">
              <Check className="h-4 w-4" />
            </span>
          )}
        </button>
      ))}
    </SidePanel>
  )
}
