import { Fragment } from 'react'
import type { ReactNode } from 'react'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import type { StudyType } from '../../../components/app/StudyTypeTag'
import { PinIcon, UsersIcon } from '../../../components/ui/icons'
import { AUDIENCE, REVIEW } from '../../../mock/review'
import { Pill, Rule } from './parts'

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <p className="text-text-regular text-text-subtitle">{label}</p>
    {children}
  </div>
)
const Value = ({ children }: { children: ReactNode }) => <p className="text-body-regular text-text-title">{children}</p>

/**
 * About (1982:104845): what the client entered, read only. Five rows, each a
 * 14px label 4 above its value, with a stroke-1 rule and 12 either side
 * between rows: Title, Description, Study Type (the type tag), Study Time and
 * the 160 x 90 Thumbnail.
 */
export function AboutTab({ type }: { type: StudyType }) {
  return (
    <div className="flex flex-col gap-3">
      <Row label="Title"><Value>{REVIEW.title}</Value></Row>
      <Rule />
      <Row label="Description"><Value>{REVIEW.about.description}</Value></Row>
      <Rule />
      <Row label="Study Type"><div><StudyTypeTag type={type} filled /></div></Row>
      <Rule />
      <Row label="Study Time"><Value>{REVIEW.about.studyTime}</Value></Row>
      <Rule />
      <Row label="Thumbnail"><img src={REVIEW.about.thumbnail} alt="" className="h-[90px] w-40 rounded-sm object-cover" /></Row>
    </div>
  )
}

const ICON = { users: UsersIcon, pin: PinIcon }

/**
 * Audience (1984:114713): the targeting as ringed pills, one per line, in three
 * groups (Target Audience, Work details, Conditions to apply) with a rule and
 * 16 either side between groups. Pills sit 8 apart, 12 under Work details.
 */
export function AudienceTab() {
  return (
    <div className="flex flex-col gap-4">
      {AUDIENCE.map((g, i) => (
        <Fragment key={g.heading}>
          {i > 0 && <Rule />}
          <section>
            <h3 className="text-text-regular text-text-subtitle">{g.heading}</h3>
            <div className={g.gap === 'loose' ? 'flex flex-col items-start gap-3 pt-3' : 'flex flex-col items-start gap-2 pt-2'}>
              {g.pills.map((p) => {
                const Icon = p.icon ? ICON[p.icon] : null
                return <Pill key={p.value} label={p.label} icon={Icon && <Icon className="h-4 w-4 text-text-subtitle" />}>{p.value}</Pill>
              })}
            </div>
          </section>
        </Fragment>
      ))}
    </div>
  )
}
