import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { CopyIcon, ExternalIcon, MailIcon } from '../../../components/ui/icons'
import { Avatar } from '../../../components/ui/Tag'
import { FIGURES as F, MANAGE_CLIENT as C } from '../../../mock/manage'
import type { ManagedStudy } from '../../../mock/manage'

const Tile = ({ label, value, rest, children }: { label: string; value: string; rest?: string; children?: ReactNode }) => (
  <div className="flex h-[77px] flex-1 items-center justify-between rounded-md bg-yellow-30 p-3">
    <div>
      <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
      <p className="flex items-baseline gap-0.5 pt-0.5 text-title-l leading-[31px] text-text-title">
        {value}{rest && <span className="text-body-medium leading-[22px]">{rest}</span>}
      </p>
    </div>
    {children}
  </div>
)

/** The 45px progress ring: a yellow-100 track with a brand-primary arc for two thirds. */
const Ring = () => (
  <svg viewBox="0 0 45 45" className="mx-1 h-[45px] w-[45px] -rotate-90" aria-hidden="true">
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" strokeWidth="6" className="stroke-yellow-100" />
    <circle cx="22.5" cy="22.5" r="18.5" fill="none" strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray="66 100" className="stroke-yellow-500" />
  </svg>
)

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    {children}
  </div>
)

/** About Client (304 wide on bg-1): who owns the study, four facts, and a way to their profile. */
function ClientCard() {
  const navigate = useNavigate()
  return (
    <aside className="w-[304px] shrink-0 self-start rounded-lg bg-bg-1 p-3 text-text-regular leading-5">
      <h3 className="text-text-body">About Client</h3>
      <div className="flex items-center gap-2 pt-3">
        <Avatar src={C.avatar} name={C.name} size={48} />
        <div>
          <p className="text-body-medium text-text-title">{C.name}</p>
          <p className="pt-1 text-text-subtitle">{C.role}</p>
        </div>
      </div>
      <p className="flex items-center gap-1 pt-3 text-text-subtitle"><MailIcon className="h-4 w-4" />{C.email}</p>
      <dl className="flex flex-col gap-2 pt-2.5">
        {C.rows.map(([label, value]) => (
          <Fragment key={label}>
            <hr className="border-0 border-t-1 border-stroke-input" />
            <div className="flex justify-between"><dt className="text-text-body">{label}</dt><dd className="text-text-subtitle">{value}</dd></div>
          </Fragment>
        ))}
      </dl>
      <Button variant="tertiary" size="md" fullWidth className="mt-6" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => navigate('/clients/c-1')}>Go To Profile</Button>
    </aside>
  )
}

/**
 * Overview (1952:76685): four yellow-30 tiles (Progress with its ring,
 * Completed, Qualified, Days Remaining), the study description, the share
 * link in a read-only box with Copy, and "Active Since"; About Client sits
 * beside them. The paused frame (1952:75945) draws the same without the
 * client card, the tiles running the full width.
 */
export default function OverviewTab({ study, paused }: { study: ManagedStudy; paused: boolean }) {
  return (
    <div className="flex gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex gap-2">
          <Tile label="Progress" value={F.progress}><Ring /></Tile>
          <Tile label="Completed" value={F.completed[0]!} rest={F.completed[1]} />
          <Tile label="Qualified" value={paused ? F.qualified[0]! : study.tileQualified[0]} rest={paused ? F.qualified[1] : study.tileQualified[1]} />
          <Tile label="Days Remaining" value={F.daysRemaining} />
        </div>
        <Field label="Study Description"><p className="text-body-regular leading-[22px] text-text-title">{study.description}</p></Field>
        <Field label="Share Link">
          <div className="flex gap-3">
            <p className="flex h-12 min-w-0 flex-1 items-center truncate rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-body-regular text-text-subtitle">{F.shareLink}</p>
            <Button variant="tertiary" className="w-[103px] px-0" leftIcon={<CopyIcon className="h-5 w-5" />} onClick={() => { void navigator.clipboard?.writeText(F.shareLink) }}>Copy</Button>
          </div>
        </Field>
        <Field label="Active Since"><p className="text-body-regular leading-[22px] text-text-subtitle">{F.activeSince}</p></Field>
      </div>
      {!paused && <ClientCard />}
    </div>
  )
}
