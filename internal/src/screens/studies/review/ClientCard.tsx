import { Fragment } from 'react'
import { MailIcon, VerifiedIcon } from '../../../components/ui/icons'
import { Avatar } from '../../../components/ui/Tag'
import { CLIENT as C } from '../../../mock/review'
import { Rule } from './parts'

/**
 * The client who submitted the study (1982:104845, 360 wide beside the tabs):
 * a 48px avatar, name and role, their email; under a full-width rule
 * "Workspace" (five rows 33 apart with inset rules), and under another
 * "Metrics" (four rows 28 apart). Labels text-body, values subtitle. Nothing
 * here is a link in the frames.
 */
export default function ClientCard() {
  return (
    <aside className="w-[360px] shrink-0 self-start rounded-lg border-1 border-stroke-1 pb-3 pt-3 text-text-regular leading-5">
      <div className="px-3">
        <div className="flex items-center gap-2">
          <Avatar src={C.avatar} name={C.name} size={48} />
          <div>
            <p className="text-body-medium text-text-title">{C.name}</p>
            <p className="pt-1 text-text-subtitle">{C.role}</p>
          </div>
        </div>
        <p className="flex items-center gap-1 pt-3 text-text-subtitle"><MailIcon className="h-4 w-4" />{C.email}</p>
      </div>
      <Rule className="mt-3" />
      <div className="px-3 pt-3">
        <h3 className="text-text-medium text-text-title">Workspace</h3>
        <dl className="flex flex-col gap-1.5 pt-2">
          {C.workspace.map(([label, value], i) => (
            <Fragment key={label}>
              {i > 0 && <Rule />}
              <div className="flex justify-between"><dt className="text-text-body">{label}</dt><dd className="text-text-subtitle">{value}</dd></div>
            </Fragment>
          ))}
        </dl>
      </div>
      <Rule className="mt-3" />
      <div className="px-3 pt-3">
        <h3 className="text-text-medium text-text-title">Metrics</h3>
        <dl className="flex flex-col gap-2 pt-2">
          {C.metrics.map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <dt className="text-text-body">{label}</dt>
              <dd className="flex items-center gap-1 text-text-subtitle">
                {label === 'Verification' && <VerifiedIcon className="h-4 w-4 text-state-success" />}{value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}
