import { resultsOf } from '../../mock/respondent'
import type { QA } from '../../mock/respondent'
import { csv, fileName, pdf, save, text as textFile } from '@shared/files'
import { Avatar } from '../../components/client/RespondentCard'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Pagination from '../../components/client/Pagination'
import { ScoreCell, Th } from '../../components/client/RespondentTable'
import { StudyFrame } from '../../components/client/StudyFrame'
import { OverviewTile } from './StudyOverview'
import { ChevronRight, Download, LinkIcon, Star } from '../../components/ui/icons'
import { copyText } from '../../lib/copy'
import { sessionPath } from './sessionLink'
import { CERTIFICATE, NOTES_SUMMARIES, SUMMARIES } from '../../mock/results'
import { useToast } from '../../components/ui/Toast'
import { usePlatform, useStudy } from '../../platform'
import { monthDayYear } from '@shared/format'
import { averageScore, counts, pageLabels, paginate, recruits, sessionSeats, studyCertificate } from '@shared/derive'
import { useState } from 'react'
import { PersonName } from '../../app/ProfileHost'
import Picker from '../../components/ui/Picker'
import { TIER_MENU, tierFromMenu } from '@shared/lifecycle'

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
/** One answer as a spreadsheet cell. */
const answerText = (a: QA['answer']): string =>
  a.kind === 'text' ? a.value : a.kind === 'file' ? `${a.name} (${a.size})` : a.kind === 'matrix' ? a.rows.map((r) => `${r.label}: ${a.columns[r.choice] ?? ''}`).join('; ') : a.values.join('; ')

export default function ResultsTab() {
  const toast = useToast()
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStudy(id)
  const world = usePlatform()
  const [tier, setTier] = useState('All')
  const [page, setPage] = useState(1)
  const c = counts(s)
  const cert = studyCertificate(world, s)
  /**
   * A group study's results are grouped by session (1627:104407 video, 1627:107896 in person): each
   * session's row with its date and View Result, then its participants. Everyone else is one list.
   */
  const grouped = s.type === 'group_video_call' || s.type === 'in_person_group'
  /** In person, the results are the interview notes (1627:101705, 1627:107896): Notes Summaries. */
  const inPerson = s.type === 'in_person' || s.type === 'in_person_group'
  const summary = inPerson ? NOTES_SUMMARIES : SUMMARIES
  const sessions = grouped ? sessionSeats(s) : []
  const sessionOf = (personId: string) => sessions.findIndex((x) => x.people.includes(personId))
  /** Step 50: everyone who finished, which is the results the client receives. */
  const rows = recruits(world, s, 'results')
    .filter((r) => r.state !== 'no_show')
    .filter((r) => tier === 'All' || r.tier === tier.toLowerCase())
    .map((r, i) => ({ r, i, at: sessionOf(r.id) }))
    .sort((a, b) => (grouped ? (a.at < 0 ? 999 : a.at) - (b.at < 0 ? 999 : b.at) : 0) || a.i - b.i)
    .map((x) => x.r)
  const shown = paginate(rows, page)
  /** In-person one-to-one (1627:101705): the sessions sat against the sessions booked, then the participants. */
  const booked = s.participations.filter((p) => p.booking && ['scheduled', 'completed', 'no_show'].includes(p.state))
  const sat = booked.filter((p) => p.state === 'completed')
  const stats = s.type === 'in_person'
    ? [
        { label: 'Sessions Completed', value: String(sat.length), suffix: `/${booked.length}` },
        { label: 'Participants Completed', value: String(c.completed), suffix: `/${s.required} required` },
        { label: 'Avg. Trust Score', value: String(averageScore(world, s)) },
      ]
    : [
        { label: 'Completed', value: String(c.completed), suffix: `/${s.required} required` },
        { label: 'Avg. Trust Score', value: String(averageScore(world, s)) },
        // The group studies' Results draw two figures, without Rated By You (1627:104407, 1627:107896).
        ...(grouped ? [] : [{ label: 'Rated By You', value: String(c.rated), suffix: `/${c.completed} completed` }]),
      ]
  /** Notes Summaries gives every note written, one session or interview after another. */
  const notesFile = () => {
    const parts = s.type === 'in_person_group'
      ? sessionSeats(s).filter((x) => x.notes?.trim()).map((x) => `${monthDayYear(x.date)}, ${x.slot}\n${x.notes}`)
      : recruits(world, s).filter((r) => r.participation.notes?.trim()).map((r) => `${r.name}, ${monthDayYear(r.participation.booking?.date)}\n${r.participation.notes}`)
    toast(parts.length ? `Saved ${save(fileName(`${s.title} notes`, 'txt'), textFile(parts.join('\n\n')))}` : 'No notes have been written on this study yet')
  }
  /** The link a certificate is checked at, on the same demo domain as the apps' other links. */
  const certLink = `https://humanlayer.app/certificate/${cert.id}`

  return (
    <AppShell hideCreate crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="results" minH="min-h-[1481px]" bodyMinH="min-h-[1231px]">
        <div className="flex flex-col px-4 pt-4">
          <div className={stats.length === 2 ? 'grid grid-cols-[1fr_1fr_1fr] gap-3' : 'grid grid-cols-[213px_213px_213px_1fr] gap-3'}>
            {stats.map((t) => <OverviewTile key={t.label} {...t} />)}
            <div className="flex items-center justify-between gap-4 rounded-md bg-bgAlt-1 px-4 py-4">
              <div className="flex flex-col gap-1">
                {/* 1643:130046: a 22px box, so 16px text, not the 18 it was drawn with. */}
                <p className="text-body-medium text-text-title">{summary.title}</p>
                <p className="text-text-regular text-text-subtitle">{summary.body}</p>
              </div>
              <Button variant="secondary" size="none" className="h-12 px-6" onClick={() => {
                if (inPerson) { notesFile(); return }
                const lines = rows.flatMap((r) => resultsOf(s, r.participation).flatMap((sec) => sec.answers.map((qa) => [r.name, r.role, sec.label ?? '', qa.prompt, answerText(qa.answer)])))
                toast(lines.length ? `Saved ${save(fileName(`${s.title} results`, 'csv'), csv(['Respondent', 'Role', 'Entry', 'Question', 'Answer'], lines))}` : 'No completed responses to download yet')
              }}
                leftIcon={<Download className="h-4 w-4" />} rightIcon={<ChevronRight className="h-4 w-4" />}>
                {summary.cta}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex h-[38px] items-center justify-between gap-4">
            <h2 className="text-title-s leading-[22px] text-text-title">Completed Study Respondents</h2>
            <Picker value={`Tier: ${tier}`} h="h-[38px]" className="w-[220px] text-text-regular" options={TIER_MENU.map((m) => m.label)}
              onPick={(v) => { const t = tierFromMenu(v); setTier(t ? t[0]!.toUpperCase() + t.slice(1) : 'All') }} />
          </div>

          <div className="pt-3">
            <div className="overflow-hidden rounded-md border-1 border-stroke-input">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-b-1 border-stroke-input bg-bg-1">
                    <Th label="Name" className="w-[16.1%]" />
                    <Th label="Role" className={grouped ? 'w-[19.7%]' : 'w-[32.2%]'} />
                    {grouped && <Th label="Session" className="w-[12.5%]" />}
                    <Th label="Date" className="w-[16%]" />
                    <Th label="Score" sortable className="w-[16.1%]" />
                    <Th label="" className="w-[19.6%]" />
                  </tr>
                </thead>
                <tbody>
                  {shown.rows.length === 0 && (
                    <tr><td colSpan={grouped ? 6 : 5} className="h-[70px] px-[18px] text-center text-text-regular text-text-subtitle">
                      Nobody has completed this study yet.
                    </td></tr>
                  )}
                  {shown.rows.map((r, i) => {
                    const at = sessionOf(r.id)
                    const x = sessions[at]
                    const head = grouped && x && (i === 0 || sessionOf(shown.rows[i - 1]!.id) !== at)
                    return [
                    head && (
                      <tr key={`s-${x.id}`} className="border-b-1 border-stroke-input bg-bg-1">
                        <td colSpan={6} className="h-[52px] px-[18px]">
                          <span className="flex items-center justify-between gap-4">
                            <span className="text-text-regular text-text-title">S{at + 1} &bull; {monthDayYear(x.date)}, {x.slot}</span>
                            <Button variant="secondary" size="none" className="h-[38px] px-4" rightIcon={<ChevronRight className="h-4 w-4" />}
                              onClick={() => nav(sessionPath(s, x.id, 'results'))}>View Result</Button>
                          </span>
                        </td>
                      </tr>
                    ),
                    /* Every row opens that participant's result (22 Oct 2026); the name and the rating button keep their own clicks. */
                    <tr key={r.id} onClick={() => nav(`/studies/${s.id}/respondent/${r.id}/result`)}
                      className="cursor-pointer border-b-1 border-stroke-input last:border-b-0 hover:bg-bg-1">
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title"><span className="flex items-center gap-2"><Avatar name={r.name} photo={r.photo} size={28} /><PersonName id={r.id}>{r.name}</PersonName></span></td>
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title">{r.role}</td>
                      {grouped && <td className="h-[70px] px-[18px] text-text-regular text-text-title">{at >= 0 && x ? <>S{at + 1} &bull; {x.slot}</> : ''}</td>}
                      <td className="h-[70px] px-[18px] text-text-regular text-text-title">{monthDayYear(r.participation.completedAt)}</td>
                      <td className="h-[70px] px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
                      <td className="h-[70px] px-[18px]" onClick={(e) => e.stopPropagation()}>
                        {r.state === 'rated'
                          ? <Button variant="tertiary" size="none" className="h-[38px] px-4" onClick={() => toast('Already rated')}>Rated</Button>
                          : (
                            <Button size="none" className="h-[38px] px-4" leftIcon={<Star className="h-4 w-4" />}
                              onClick={() => nav(`/studies/${s.id}/respondent/${r.id}/result?rate=1`)}>
                              Rate Now
                            </Button>
                          )}
                      </td>
                    </tr>,
                    ]
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={shown.page} pages={pageLabels(shown.total, shown.page)} onPage={setPage} />
          </div>

          {/* 1777:98702: the seal sits at 16,16 and the text block starts at
              132, so it is 16px of padding and a 16px gap, not 30 and 31. */}
          <div className="mt-[25px] flex items-start justify-between gap-4 rounded-lg bg-bgAlt-1 p-4">
            <div className="flex items-center gap-4">
              <Seal />
              <div className="flex flex-col gap-1">
                <p className="text-label uppercase tracking-[0.04em] text-text-subtitle">{CERTIFICATE.label}</p>
                <p className="text-title-s leading-[22px] text-text-title">
                  {cert.verified} of {cert.total} completions verified human
                </p>
                <p className="max-w-[816px] text-text-regular text-text-subtitle">{CERTIFICATE.body}</p>
                <p className="text-text-regular text-text-subtitle">CERT ID · {cert.id} · Issued {monthDayYear(cert.issuedAt)}</p>
              </div>
            </div>
            {/* Download and share, two icon buttons (1627:104407, and every type's Results). */}
            <span className="flex shrink-0 items-center gap-2">
              <button type="button" aria-label="Download the certificate" title="Download"
                onClick={() => toast(`Saved ${save(fileName(`certificate ${cert.id}`, 'pdf'), pdf('Human Certificate', [`Cert ID ${cert.id}`, `Issued ${monthDayYear(cert.issuedAt)}`, `Study: ${s.title}`, '', `${cert.verified} of ${cert.total} completions verified human`, CERTIFICATE.body, '', `Check it at ${certLink}`]))}`)}
                className="flex h-9 w-9 items-center justify-center rounded-md border-1 border-cta-tertiaryStroke bg-bg-0 text-text-title hover:border-stroke-3">
                <Download className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Copy the certificate check link" title="Copy check link"
                onClick={async () => toast((await copyText(certLink)) ? 'Check link copied' : 'Could not reach the clipboard')}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-cta-secondary text-text-title hover:bg-yellow-300">
                <LinkIcon className="h-4 w-4" />
              </button>
            </span>
          </div>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
