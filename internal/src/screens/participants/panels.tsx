import { useState } from 'react'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button from '../../components/ui/Button'
import { Chip } from '../../components/ui/controls'
import { Select } from '../../components/ui/Input'
import { CheckIcon, StarIcon } from '../../components/ui/icons'
import { Modal, SidePanel } from '../../components/ui/Overlay'
import { cn } from '../../lib/cn'
import { ADVANCED, useInviteStudies, useParticipantReviews } from '../../mock/participants'
import { platform } from '@shared/store'
import { personById, shortName } from '@shared/derive'
import { usePlatform } from '../../platform'

/**
 * Advanced Filters (2003:133781, the 600 panel, 597 tall): Roles, Domain,
 * Location and Language, each a 38px dropdown with the chosen values as
 * removable chips under it; Cancel / Save.
 */
export function AdvancedFilters({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [chips, setChips] = useState(ADVANCED.map((f) => f.chips))
  /** Each list offers what the platform's participants hold (22 Oct 2026; the menus are not drawn): picking one adds its chip. */
  const people = usePlatform().people
  const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort()
  const choices = [
    uniq(people.map((p) => p.profile.occupation)), uniq(people.map((p) => p.profile.industry)),
    uniq(people.map((p) => p.location)), uniq(people.flatMap((p) => p.profile.languages)),
  ]
  return (
    <SidePanel open={open} onClose={onClose} title="Advanced Filters"
      footer={<><Button variant="tertiary" onClick={onClose}>Cancel</Button><Button onClick={onClose}>Save</Button></>}>
      <div className="flex flex-col gap-4 pb-2">
        {ADVANCED.map((f, i) => (
          <div key={f.label}>
            <Select size="sm" label={f.label} placeholder={f.placeholder} options={choices[i]!.filter((o) => !chips[i]!.includes(o))}
              onChange={(v) => setChips((all) => all.map((list, j) => (j === i ? [...list, v] : list)))} />
            <div className="flex gap-2 pt-2">
              {chips[i]!.map((c) => <Chip key={c} onRemove={() => setChips((all) => all.map((list, j) => (j === i ? list.filter((x) => x !== c) : list)))}>{c}</Chip>)}
            </div>
          </div>
        ))}
      </div>
    </SidePanel>
  )
}

export const Stars = ({ value, size = 'h-5 w-5' }: { value: number; size?: string }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} className={cn(size, n <= Math.ceil(value) ? 'fill-yellow-500 text-yellow-500' : 'text-text-body')} />)}
  </span>
)

/**
 * Reviews (1992:103368, 600 x 721): each study the participant took part in,
 * the client's stars, score, date and words, and under them what the
 * participant said back "To client". Read only; no footer.
 */
export function ReviewsPanel({ open, onClose, personId }: { open: boolean; onClose: () => void; personId?: string }) {
  const { name, rows: REVIEWS } = useParticipantReviews(personId)
  return (
    <SidePanel open={open} onClose={onClose} title={`Reviews of ${name}`}>
        {REVIEWS.length === 0 && <p className="px-2 pt-2 text-text-regular text-text-body">No client has rated them yet.</p>}
      <div className="flex flex-col gap-[18px] px-2 pb-5 pt-2 text-text-regular leading-5">
        {REVIEWS.map((r) => (
          <article key={r.study}>
            <h3 className="text-body-medium leading-[22px] text-text-title">{r.study}</h3>
            <p className="flex items-center gap-2 pt-1.5 text-text-body"><Stars value={r.stars} /><span className="text-text-medium text-text-title">{r.score}</span><span>•&nbsp; {r.date}</span></p>
            <p className="pt-1.5 text-text-subtitle">{r.text}</p>
            <p className="flex items-center gap-1 pt-1.5 text-text-subtitle"><span>To client:</span><span className="text-text-medium text-text-title">{r.client}</span>
              <Stars value={r.back} size="h-4 w-4" /><span className="text-text-medium">{r.backScore}</span><span className="min-w-0 flex-1 truncate text-text-body">{r.reply}</span></p>
          </article>
        ))}
      </div>
    </SidePanel>
  )
}

/**
 * Invite To Study (1992:103508, 600 x 517): pick from the active studies (one
 * is drawn selected, yellow-30 with a tick), then Cancel / Send Invite, which
 * confirms with "Invitation has been sent!" (1992:103806).
 */
export function InviteToStudy({ open, onClose, personId }: { open: boolean; onClose: () => void; personId?: string }) {
  const INVITE_STUDIES = useInviteStudies()
  const state = usePlatform()
  const person = personId ? personById(state, personId) : undefined
  const [chosen, setPicked] = useState('')
  const picked = chosen || INVITE_STUDIES[0]?.id || ''
  const [sent, setSent] = useState(false)
  const [why, setWhy] = useState('')
  /** Workflow 26, 27: the invitation is a move on the shared platform, refused with a reason when it cannot be sent. */
  const send = () => {
    if (!personId) { setSent(true); return }
    const res = platform().invite(picked, personId)
    if (res.ok) { setWhy(''); setSent(true) } else setWhy(res.why)
  }
  return (
    <>
      <SidePanel open={open && !sent} onClose={onClose} title={`Invite ${person?.name.split(' ')[0] ?? 'them'} To Study`}
        footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={send}>Send Invite</Button></>}>
        <h3 className="text-body-medium leading-[22px] text-text-title">Select active studies</h3>
        <p className="pt-1 text-text-regular leading-5 text-text-body">An invitation will be sent to apply for selected studies</p>
        {why && <p className="pt-1 text-text-regular text-state-danger">{why}</p>}
        <div className="flex flex-col gap-2 pb-2 pt-3">
          {INVITE_STUDIES.map((s) => {
            const on = s.id === picked
            return (
              <button key={s.id} type="button" aria-pressed={on} onClick={() => setPicked(s.id)}
                className={cn('flex h-[90px] items-center gap-3 rounded-md border-1 px-4 text-left', on ? 'border-brand-primary bg-yellow-30' : 'border-stroke-1')}>
                <img src={s.thumb} alt="" className="h-[58px] w-[78px] rounded-sm object-cover" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-body-medium leading-[22px] text-text-title">{s.title}</span>
                  <span className="flex gap-2"><StudyTypeTag type={s.type} filled className="h-7 px-2.5" />
                    <span className="flex h-7 items-center rounded-full border-1 border-stroke-3 px-2.5 text-text-regular text-text-subtitle">{s.industry}</span></span>
                </span>
                {on && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-bg-0"><CheckIcon className="h-5 w-5" /></span>}
              </button>
            )
          })}
        </div>
      </SidePanel>
      <Modal open={open && sent} onClose={() => { setSent(false); onClose() }} title="Invitation has been sent!" className="[&>div>div]:max-w-none"
        footer={<Button onClick={() => { setSent(false); onClose() }}>Done!</Button>}>
        <p className="text-body-regular text-text-subtitle">{person ? shortName(person.name) : 'They'} has been invited to apply for this study.</p>
      </Modal>
    </>
  )
}
