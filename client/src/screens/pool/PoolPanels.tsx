import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { Avatar } from '../../components/client/RespondentCard'
import { Check, ChevronLeft, DiaryBookIcon, Star, StarFilled } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { INVITE_STUDIES, REVIEWS, SAVE_TARGETS } from '../../mock/pool'

/** The person a Pool panel is about, under its title bar. */
function Person({ tight }: { tight?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4', tight ? 'py-3' : 'py-4')}>
      <Avatar name="Ferry L." size={tight ? 40 : 64} />
      <span className="flex flex-col">
        <span className="text-text-regular text-text-subtitle">Ferry L.</span>
        <span className="text-title-s leading-[22px] text-text-title">Physiology Therapist, Orthopedic</span>
        <span className="pt-1 text-text-regular text-text-subtitle">
          New York, USA <span className="px-1 text-text-body">&bull;</span> Cert. ID: HL-R-9F2A-3K7P
        </span>
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
export function ReviewsPanel({ open, onClose, onBack }: { open: boolean; onClose: () => void; onBack?: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Profile of Ferry L." headerClassName="h-14"
      bodyClassName="flex flex-col p-0"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button>Invite To Study</Button>
          <Button variant="secondary">Save To Micropanel</Button>
        </div>
      }>
      <Person />
      <div className="mx-4 flex flex-col rounded-lg border-1 border-stroke-input">
        <button type="button" onClick={onBack}
          className="flex items-center gap-4 border-b-1 border-stroke-1 px-4 py-[14px] text-title-s leading-[22px] text-text-title">
          <ChevronLeft className="h-5 w-5 text-text-subtitle" />Reviews
        </button>
        {REVIEWS.map((r) => (
          <div key={r.study} className="flex flex-col gap-1.5 border-b-1 border-stroke-1 px-4 py-3 last:border-b-0">
            <p className="text-body-medium text-text-title">{r.study}</p>
            <p className="flex items-center gap-2">
              <Stars n={r.stars} />
              <span className="text-body-medium text-text-title">{r.rating}</span>
              <span className="text-text-body">&bull;</span>
              <span className="text-text-regular text-text-subtitle">{r.at}</span>
            </p>
            <p className="text-text-regular leading-5 text-text-subtitle">{r.body}</p>
            {r.client && (
              <p className="flex items-center gap-2 truncate pt-1">
                <span className="shrink-0 text-text-regular text-text-subtitle">To client:</span>
                <span className="shrink-0 text-body-medium text-text-title">{r.client}</span>
                <Stars n={r.clientStars ?? 0} size="h-4 w-4" />
                <span className="shrink-0 text-body-medium text-text-title">{r.clientRating}</span>
                <span className="truncate text-text-regular text-text-body">{r.clientBody}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </SidePanel>
  )
}

/** Invite To Study (1645:163182): pick which live study the invitation is for. */
export function InvitePanel({ open, onClose, name = 'Roma' }: { open: boolean; onClose: () => void; name?: string }) {
  return (
    <SidePanel open={open} onClose={onClose} title={`Invite ${name} To Study`} headerClassName="h-14"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Send Invite</Button>
        </div>
      }>
      <div className="flex flex-col gap-1">
        <p className="text-title-s leading-[22px] text-text-title">Select active studies</p>
        <p className="text-text-regular text-text-subtitle">An invitation will be sent to apply for selected studies</p>
      </div>
      {INVITE_STUDIES.map((s, i) => (
        <div key={s.id} className={cn('flex items-center gap-3 rounded-lg border-1 p-3',
          i === 0 ? 'border-cta-primary bg-yellow-30' : 'border-stroke-input')}>
          <img src={s.image} alt="" className="h-[52px] w-[72px] shrink-0 rounded-md object-cover" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="truncate text-body-medium text-text-title">{s.title}</span>
            <span className="flex items-center gap-2">
              <StudyTypeTag type={s.type} icon={s.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
              <span className="inline-flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">
                {s.domain}
              </span>
            </span>
          </span>
          {i === 0 && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cta-primary text-cta-primaryText">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>
      ))}
    </SidePanel>
  )
}

/** Save to micro-panel (1651:177206): pick the panel to save the respondent into. */
export function SavePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="Save to micro-panel" headerClassName="h-14"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save</Button>
        </div>
      }>
      <div className="flex flex-col gap-1">
        <p className="text-title-s leading-[22px] text-text-title">Select micro-panel to save in</p>
        <p className="text-text-regular text-text-subtitle">They won’t be notified for it</p>
      </div>
      {SAVE_TARGETS.map((t, i) => (
        <div key={t.id} className={cn('flex items-center gap-3 rounded-lg border-1 px-4 py-4',
          i === 0 ? 'border-cta-primary bg-yellow-30' : 'border-stroke-input')}>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-title-s leading-[22px] text-text-title">{t.title}</span>
            <span className="flex min-w-0 items-center gap-2 text-text-regular text-text-subtitle">
              {t.domain} <span className="text-text-body">&bull;</span>
              <span className="truncate">&#9878; {t.roles}</span>
            </span>
          </span>
          {i === 0 && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cta-primary text-cta-primaryText">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>
      ))}
    </SidePanel>
  )
}
