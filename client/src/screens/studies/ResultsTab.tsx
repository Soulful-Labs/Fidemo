import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Pagination from '../../components/client/Pagination'
import { ScoreCell, Th } from '../../components/client/RespondentTable'
import { StudyFrame } from '../../components/client/StudyFrame'
import { OverviewTile } from './StudyOverview'
import { ChevronRight, Download, Star } from '../../components/ui/icons'
import { CERTIFICATE, RESULT_ROWS, RESULT_STATS, SUMMARIES } from '../../mock/results'
import { useToast } from '../../components/ui/Toast'
import { useStudy } from '../../mock/store'

/** The sealed stamp the certificate card is drawn with. */
function Seal() {
  return (
    <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
      <circle cx="36" cy="36" r="35" fill="#f0f7f4" />
      <circle cx="36" cy="36" r="27" fill="#fdfdfc" stroke="#cde8dc" strokeWidth="1" />
      <circle cx="36" cy="36" r="22" fill="none" stroke="#3fb984" strokeWidth="1.5" />
      <path id="seal-arc" d="M36 5.5a30.5 30.5 0 0 0-30.5 30.5" fill="none" />
      <text className="fill-brand-secondary" fontSize="6" letterSpacing="1.2">
        <textPath href="#seal-arc" startOffset="28%">VERIFIED</textPath>
      </text>
      <path d="m28 36.5 6 6 12-13" fill="none" stroke="#fca311" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Results (1627:96628): what the study produced. Three figures and an AI
 * summaries card, the completed respondents with the client's own rating
 * against each, and the study verification certificate.
 */
export default function ResultsTab() {
  const toast = useToast()
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStudy(id)

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="results" minH="min-h-[1481px]" bodyMinH="min-h-[1231px]">
        <div className="flex flex-col px-4 pt-4">
          <div className="grid grid-cols-[213px_213px_213px_1fr] gap-3">
            {RESULT_STATS.map((t) => <OverviewTile key={t.label} {...t} />)}
            <div className="flex items-center justify-between gap-4 rounded-md bg-bgAlt-1 px-4 py-4">
              <div className="flex flex-col gap-1">
                <p className="text-title-s leading-[22px] text-text-title">{SUMMARIES.title}</p>
                <p className="text-text-regular text-text-subtitle">{SUMMARIES.body}</p>
              </div>
              <Button variant="secondary" size="none" className="h-12 px-6" onClick={() => toast('Summaries downloaded')}
                leftIcon={<Download className="h-4 w-4" />} rightIcon={<ChevronRight className="h-4 w-4" />}>
                {SUMMARIES.cta}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex h-[38px] items-center justify-between gap-4">
            <h2 className="text-title-s leading-[22px] text-text-title">Completed Study Respondents</h2>
            <Select value="Tier: All" h="h-[38px]" className="w-[160px] text-text-regular" />
          </div>

          <div className="pt-3">
            <div className="overflow-hidden rounded-md border-1 border-stroke-input">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-b-1 border-stroke-input bg-bg-1">
                    <Th label="Name" className="w-[16.1%]" />
                    <Th label="Role" className="w-[32.2%]" />
                    <Th label="Date" className="w-[16%]" />
                    <Th label="Score" sortable className="w-[16.1%]" />
                    <Th label="" className="w-[19.6%]" />
                  </tr>
                </thead>
                <tbody>
                  {RESULT_ROWS.map((r) => (
                    <tr key={r.id} className="border-b-1 border-stroke-input last:border-b-0">
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title">{r.name}</td>
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title">{r.role}</td>
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title">{r.date}</td>
                      <td className="h-[70px] px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                      <td className="h-[70px] px-[18px]">
                        {r.rated
                          ? <Button variant="tertiary" size="none" className="h-[38px] px-4" onClick={() => toast('Already rated')}>Rated</Button>
                          : (
                            <Button size="none" className="h-[38px] px-4" leftIcon={<Star className="h-4 w-4" />}
                              onClick={() => nav(`/studies/${s.id}/respondent/${r.id}?rate=1`)}>
                              Rate Now
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pages={[1, 2]} />
          </div>

          <div className="mt-[25px] flex items-start justify-between gap-4 rounded-lg bg-bgAlt-1 py-4 pl-[30px] pr-4">
            <div className="flex items-center gap-[31px]">
              <Seal />
              <div className="flex flex-col gap-1">
                <p className="text-label uppercase tracking-[0.04em] text-text-subtitle">{CERTIFICATE.label}</p>
                <p className="text-title-s leading-[22px] text-text-title">{CERTIFICATE.title}</p>
                <p className="max-w-[834px] text-text-regular text-text-subtitle">{CERTIFICATE.body}</p>
                <p className="text-text-regular text-text-subtitle">{CERTIFICATE.meta}</p>
              </div>
            </div>
            <Button variant="secondary" size="none" className="h-12 px-4" onClick={() => toast('Certificate downloaded')} leftIcon={<Download className="h-4 w-4" />}>
              {CERTIFICATE.cta}
            </Button>
          </div>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
