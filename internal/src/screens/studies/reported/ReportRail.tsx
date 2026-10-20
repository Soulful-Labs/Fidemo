import { counts, daysRemaining, durationLabel, progressPct } from '@shared/derive'
import { dayMonthYear } from '@shared/format'
import type { Study } from '@shared/types'
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PanelTabs from '../../../components/app/PanelTabs'
import Pill from '../../../components/app/Pill'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import Button from '../../../components/ui/Button'
import { ClockIcon, ExternalIcon, InfoIcon, MailIcon, StudiesIcon, VerifiedIcon } from '../../../components/ui/icons'
import { Avatar } from '../../../components/ui/Tag'
import { useReviewData } from '../../../mock/review'
import { consoleType, studyPictures } from '../../../platform'

const Rule = () => <div className="border-t-1 border-stroke-1" />

/** Label and value rows, rules between them, as the frame's Workspace and Performance draw them. */
function Rows({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="px-3 pt-3">
      <h3 className="text-text-medium text-text-title">{title}</h3>
      <dl className="flex flex-col gap-1.5 pt-2">
        {rows.map(([label, value], i) => (
          <Fragment key={label}>
            {i > 0 && <Rule />}
            <div className="flex justify-between gap-3">
              <dt className="text-text-body">{label}</dt>
              <dd className="flex items-center gap-1 text-text-subtitle">{label === 'Verification' && <VerifiedIcon className="h-4 w-4 text-state-success" />}{value}</dd>
            </div>
          </Fragment>
        ))}
      </dl>
    </div>
  )
}

/**
 * The rail beside a reported study (2317:156640, 2314:147794): Study and
 * Client Details tabs. Study: the picture, title, type, duration, industry,
 * description and the study's own figures, with View Full Study. Client
 * Details: the client card the Review screen draws, with View Client Profile.
 */
export default function ReportRail({ study, tab: start = 'study' }: { study: Study; tab?: 'study' | 'client' }) {
  const nav = useNavigate()
  const [tab, setTab] = useState(start)
  const { CLIENT: C } = useReviewData(study.id)
  const c = counts(study)
  return (
    <aside className="w-[360px] shrink-0 self-start overflow-hidden rounded-lg border-1 border-stroke-1 pb-3 text-text-regular leading-5">
      <PanelTabs value={tab} onChange={(k) => setTab(k as 'study' | 'client')}
        tabs={[{ key: 'study', label: 'Study', width: 'w-[100px]', Icon: StudiesIcon }, { key: 'client', label: 'Client Details', width: 'w-[155px]', Icon: InfoIcon }]} />
      {tab === 'study' ? (
        <>
          <div className="flex flex-col gap-2 px-3 pt-3">
            <div className="flex items-center gap-3">
              <img src={studyPictures(study.id, study.image).thumb} alt="" className="h-[62px] w-[83px] shrink-0 rounded-sm object-cover" />
              <p className="text-body-medium text-text-title">{study.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StudyTypeTag type={consoleType(study.type)} filled />
              <Pill icon={<ClockIcon className="h-4 w-4" />}>{durationLabel(study.durationMins)}</Pill>
              {study.industry && <Pill>{study.industry}</Pill>}
            </div>
            <p className="text-text-subtitle">{study.description}</p>
          </div>
          <Rows title="Performance" rows={[
            ['Completed', `${c.completed}/${study.required}`], ['Qualified', `${c.everQualified}/${c.everApplied} applied`],
            ['Days Remaining', String(daysRemaining(study))], ['Progress', `${progressPct(study)}%`], ['Created', dayMonthYear(study.createdAt)],
          ]} />
          <div className="px-3 pt-3">
            <Button variant="tertiary" size="md" className="w-full" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => nav(`/studies/${study.id}`)}>View Full Study</Button>
          </div>
        </>
      ) : (
        <>
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2">
              <Avatar src={C.avatar} name={C.name} size={48} />
              <div>
                <p className="text-body-medium text-text-title">{C.name}</p>
                <p className="pt-1 text-text-subtitle">{C.role}</p>
              </div>
            </div>
            <p className="flex items-center gap-1 pt-3 text-text-subtitle"><MailIcon className="h-4 w-4" />{C.email}</p>
          </div>
          <div className="mt-3"><Rule /></div>
          <Rows title="Workspace" rows={C.workspace as [string, string][]} />
          <div className="mt-3"><Rule /></div>
          <Rows title="Metrics" rows={C.metrics as [string, string][]} />
          <div className="px-3 pt-3">
            <Button variant="tertiary" size="md" className="w-full" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => nav(`/clients/${study.clientId}`)}>View Client Profile</Button>
          </div>
        </>
      )}
    </aside>
  )
}
