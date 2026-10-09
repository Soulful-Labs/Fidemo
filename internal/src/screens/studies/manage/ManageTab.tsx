import type { ComponentType, ReactNode, SVGProps } from 'react'
import Pill from '../../../components/app/Pill'
import { AudienceIcon, ClipboardIcon, InfoIcon, PinIcon, ScreenerIcon, UsersIcon } from '../../../components/ui/icons'
import { FIGURES as F, audiencePills } from '../../../mock/manage'
import { cn } from '../../../lib/cn'
import type { ManagedStudy } from '../../../mock/manage'

/**
 * One block of Manage Study: a bg-1 card with Radius/L; a head (24px icon, 4,
 * the name: Title-S on About, Body-Medium on the rest) over a 1px stroke-2
 * rule; a body 16 in, 20 from the rule. The frames leave 10 to 14 more under
 * the last three bodies, passed as `body`.
 */
export function Block({ Icon, title, head, body, extra, children }: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; head: string; body: string; extra?: ReactNode; children: ReactNode
}) {
  return (
    <section className="rounded-lg bg-bg-1">
      <header className={`flex items-center gap-2 border-b-1 border-stroke-2 px-4 ${head}`}>
        <h2 className={cn('flex items-center gap-1 text-text-subtitle', title === 'About' ? 'text-title-s leading-[25px]' : 'text-body-medium leading-[22px]')}><Icon className="h-6 w-6" />{title}</h2>
        {extra}
      </header>
      <div className={cn('px-4 pt-5', body)}>{children}</div>
    </section>
  )
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    {children}
  </div>
)
const Value = ({ children }: { children: ReactNode }) => <p className="text-body-regular leading-[22px] text-text-title">{children}</p>
const ICON = { users: UsersIcon, pin: PinIcon }

/** The audience criteria as ringed pills, shared with the completed study's Overview. */
export const AudiencePills = ({ roles }: { roles: string }) => (
  <div className="flex flex-wrap gap-3">
    {audiencePills(roles).map((p, i) => {
      const Icon = p.icon ? ICON[p.icon] : null
      return <Pill key={i} label={p.label} icon={Icon && <Icon className="h-4 w-4" />}>{p.value}</Pill>
    })}
  </div>
)
export const EstimatedAudience = () => (
  <span className="flex h-7 items-center gap-1 rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-title">
    <span className="text-text-subtitle">Estimated Audience:</span>{F.estimatedAudience}<InfoIcon className="h-4 w-4 text-text-subtitle" />
  </span>
)

/**
 * Manage Study (1952:76819): the study as it was approved, in four blocks 12
 * apart. About (title, description, study time, thumbnail), Audience (the
 * estimated audience and every criterion as a pill), Screener and Study (a
 * one-pill summary each, plus the incentive). Nothing is editable as drawn:
 * each block's Edit button, the "Set Criteria" links and the "Study
 * Management Control" row are hidden layers.
 */
export default function ManageTab({ study }: { study: ManagedStudy }) {
  return (
    <div className="flex flex-col gap-3">
      <Block Icon={InfoIcon} title="About" head="h-[49px]" body="pb-4">
        <div className="flex flex-col gap-3">
          <Field label="Title"><Value>{study.about.title}</Value></Field>
          <Field label="Description"><Value>{study.about.description}</Value></Field>
          <Field label="Study Time"><Value>{study.about.time}</Value></Field>
          <Field label="Thumbnail"><img src={study.thumbnail} alt="" className="h-[90px] w-40 rounded-sm object-cover" /></Field>
        </div>
      </Block>
      <Block Icon={AudienceIcon} title="Audience" head="h-[52px]" body="pb-[26px]"
        extra={<EstimatedAudience />}>
        <AudiencePills roles={study.roles} />
      </Block>
      <Block Icon={ScreenerIcon} title="Screener" head="h-12" body="pb-[30px]">
        <Pill label="Screening:">{F.screening}</Pill>
      </Block>
      <Block Icon={ClipboardIcon} title="Study" head="h-12" body="pb-[30px]">
        <div className="flex gap-2">
          <Pill label={study.summary[0]}>{study.summary[1]}</Pill>
          <Pill label="Incentive:">{F.incentive}</Pill>
        </div>
      </Block>
    </div>
  )
}
