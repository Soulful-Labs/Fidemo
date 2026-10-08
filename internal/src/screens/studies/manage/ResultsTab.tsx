import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TierTag from '../../../components/app/TierTag'
import Button from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Input'
import { CheckIcon, ChevronRight, DownloadIcon, SortIcon, StarIcon } from '../../../components/ui/icons'
import { Pagination } from '../../../components/ui/Table'
import type { ManagedStudy } from '../../../mock/manage'
import { CERTIFICATE as C, RESULTS, RESULT_SESSIONS, resultRows } from '../../../mock/results'
import type { ResultRow } from '../../../mock/results'
import { DownloadSessions, RatePanel } from '../respondent/dialogs'
import { Tile } from './OverviewTab'

/**
 * Results (1952:81223 and siblings): tiles and a summary card with Download;
 * "Completed Study Respondents" with a tier filter; the table of who finished,
 * each to be rated ("Rate Now") or already "Rated"; and the study's
 * verification certificate with its own Download.
 *
 * By type: survey, diary and video 1:1 count Completed, Avg. Trust Score and
 * Rated By You; in-person counts sessions and participants; the two group
 * types count Completed and Avg. Trust Score and group the table by session,
 * each with "View Result". In-person types call the summary "Notes Summaries".
 */
export default function ResultsTab({ study }: { study: ManagedStudy }) {
  const navigate = useNavigate()
  const group = study.type === 'video-group' || study.type === 'in-person-group'
  const spec = RESULTS[study.type]
  const rows = resultRows(group)
  const [rating, setRating] = useState<ResultRow | null>(null)
  const [downloading, setDownloading] = useState(false)
  const grid = group ? 'grid-cols-[180px_280px_160px_160px_1fr_150px]' : 'grid-cols-[180px_360px_180px_180px_1fr]'
  const open = (r: ResultRow) => navigate(`/studies/${study.id}/respondents/${r.id}`)

  const Row = ({ r }: { r: ResultRow }) => (
    <div role="row" onClick={() => open(r)} className={`grid ${grid} h-[70px] cursor-pointer items-center border-t-1 border-stroke-1 text-text-regular text-text-title hover:bg-bgAlt-1`}>
      <span className="px-4">{r.name}</span>
      <span className="px-4">{r.role}</span>
      {group && <span className="flex gap-2 px-4">{r.session}<span aria-hidden="true">•</span>10:00 AM</span>}
      <span className="px-4">{r.date}</span>
      <span className="flex items-center gap-2 px-4">{r.score}<TierTag tier={r.tier} /></span>
      <span className={group ? 'flex justify-end px-3' : 'flex px-0'}>
        {r.rated
          ? <span className="flex h-[38px] items-center rounded-md border-1 border-cta-tertiaryStroke px-3 text-text-medium">Rated</span>
          : <Button size="md" className="px-3" leftIcon={<StarIcon className="h-5 w-5" />} onClick={(e) => { e.stopPropagation(); setRating(r) }}>Rate Now</Button>}
      </span>
    </div>
  )

  return (
    <div>
      <div className="flex gap-3">
        {spec.tiles.map(([label, value, rest]) => <Tile key={label} label={label} value={value} rest={rest} />)}
        <div className="ml-1 flex h-[77px] w-[438px] shrink-0 items-center justify-between rounded-md bg-bg-1 px-4">
          <div>
            <p className="text-body-medium leading-[22px] text-text-title">{spec.summary[0]}</p>
            <p className="pt-0.5 text-text-regular leading-5 text-text-subtitle">{spec.summary[1]}</p>
          </div>
          <Button variant="secondary" className="px-5" leftIcon={<DownloadIcon className="h-5 w-5" />} rightIcon={spec.chevron ? <ChevronRight className="h-4 w-4" /> : undefined}
            onClick={() => group && setDownloading(true)}>Download</Button>
        </div>
      </div>

      <div className="flex items-center justify-between pb-3.5 pt-5">
        <h2 className="text-title-s leading-[25px] text-text-title">Completed Study Respondents</h2>
        <Select size="sm" className="w-40" value="Tier: All" options={['Tier: All']} />
      </div>
      <div role="table" className="overflow-hidden rounded-lg border-1 border-stroke-2">
        <div role="row" className={`grid ${grid} h-[52px] items-center bg-bg-1 text-text-regular text-text-subtitle`}>
          <span className="px-4">Name</span><span className="px-4">Role</span>
          {group && <span className="px-4">Session</span>}
          <span className="px-4">Date</span>
          <span className="flex items-center gap-1 px-4">Score<SortIcon className="h-4 w-4 text-text-body" /></span><span />
        </div>
        {group ? RESULT_SESSIONS.map((s) => (
          <Fragment key={s.id}>
            <div className="flex h-[62px] items-center justify-between border-t-1 border-stroke-1 bg-bg-1 pl-4 pr-3 text-text-regular text-text-title">
              <span className="flex gap-2">{s.code}<span aria-hidden="true">•</span>{s.when}</span>
              <Button variant="secondary" size="md" className="px-3" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => navigate(`/studies/${study.id}/sessions/${s.id}?state=completed`)}>View Result</Button>
            </div>
            {rows.filter((r) => r.session === s.code).map((r) => <Row key={r.id} r={r} />)}
          </Fragment>
        )) : rows.map((r) => <Row key={r.id} r={r} />)}
      </div>
      <div className="pt-3"><Pagination page={1} pages={2} /></div>

      <section className="mt-6 flex items-start gap-4 rounded-lg bg-bgAlt-1 p-4">
        <span aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-1 border-stroke-3 bg-bg-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-200"><CheckIcon className="h-7 w-7 text-brand-primary" /></span>
        </span>
        <div className="min-w-0 flex-1 text-text-regular leading-5 text-text-subtitle">
          <p className="text-label uppercase text-text-subtitle">{C.eyebrow}</p>
          <p className="pt-1 text-body-medium leading-[22px] text-text-title">{C.title}</p>
          <p className="max-w-[800px] pt-1">{C.body}</p>
          <p className="flex gap-2 pt-1">{C.foot[0]}<span aria-hidden="true">·</span>{C.foot[1]}</p>
        </div>
        <Button variant="secondary" className="px-5" leftIcon={<DownloadIcon className="h-5 w-5" />}>Download</Button>
      </section>

      <RatePanel person={rating} onClose={() => setRating(null)} />
      <DownloadSessions open={downloading} onClose={() => setDownloading(false)} />
    </div>
  )
}
