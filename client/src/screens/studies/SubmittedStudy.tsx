import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import { ClockArrow, DiaryIcon, Download, Edit, Info, PaymentsIcon, PoolIcon, StudiesIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useDraft } from '../../mock/createStore'
import { useWorkspace } from '../../mock/workspace'
import RevisionsTimeline from '../../components/client/RevisionsTimeline'
import { usePlatform } from '../../platform'
import { CardMark } from '../payments/PaymentPanels'
import type { ClientStudy as Study } from '../../platform'
import { DEPOSIT_RULE } from '@shared/platform'
import { durationLabel } from '@shared/derive'
import { money, monthDayYearTime } from '@shared/format'
import { fileName, pdf, save } from '@shared/files'
import { canEditStudy } from '@shared/lifecycle'

/**
 * A study that is not live yet, as the client sees it once submitted (Manage
 * Study, Manage Study-1 to -6, 15 Oct 2026): the header with its status and an
 * edit pencil, then six tabs that read back what was built. Every value is the
 * study's own: its form, its screener and tasks with their verdicts, its price
 * and deposit, and the team's revision requests. The frame's "AutoPay: On"
 * row is not built (AutoPay is gone).
 */
const TABS = [
  { key: 'about', label: 'About', Icon: Info },
  { key: 'audience', label: 'Audience', Icon: PoolIcon },
  { key: 'screener', label: 'Screener', Icon: StudiesIcon },
  { key: 'study', label: 'Study', Icon: DiaryIcon },
  { key: 'payment', label: 'Payment', Icon: PaymentsIcon },
  { key: 'revisions', label: 'Revisions History', Icon: ClockArrow },
] as const
type TabKey = (typeof TABS)[number]['key']

const Pill = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex h-8 items-center gap-1.5 self-start rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-title', className)}>{children}</span>
)
const Verdict = ({ mark }: { mark: string }) => (
  <span className={cn('flex h-12 w-[154px] shrink-0 items-center rounded-md border-1 border-stroke-input bg-bg-1 px-3 text-body-regular',
    /correct|must|qualify/i.test(mark) && !/incorrect|disqualify/i.test(mark) ? 'text-green-ok' : /incorrect|disqualify/i.test(mark) ? 'text-red-600' : 'text-text-subtitle')}>{mark}</span>
)

/** One question read back: its label and kind, the question, and each option with the verdict the client gave it. */
function QuestionRead({ label, kind, prompt, options, marks }: { label: string; kind: string; prompt: string; options?: string[]; marks: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-3 border-b-1 border-stroke-1 py-4 last:border-b-0">
      <span className="flex items-center gap-2">
        <span className="flex h-8 items-center rounded-full bg-bg-1 px-3 text-text-regular text-text-title">{label}</span>
        <span className="flex h-8 items-center rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-subtitle">{kind}</span>
      </span>
      <p className="text-body-regular text-text-title">{prompt}</p>
      {options?.length ? options.map((o) => (
        <span key={o} className="flex gap-1.5">
          <span className="flex h-12 flex-1 items-center gap-3 rounded-md border-1 border-stroke-input px-4 text-body-regular text-text-title">
            <span className="h-5 w-5 shrink-0 rounded-full border-1.5 border-neutral-700" />{o}
          </span>
          {marks[o] && <Verdict mark={marks[o]!} />}
        </span>
      )) : (
        <span className="flex h-12 items-center rounded-md border-1 border-stroke-input px-4 text-body-regular text-text-body">
          {/number/i.test(kind) ? 'Participants will enter a number here...' : /file/i.test(kind) ? 'Participants will upload a file here...' : /multi-line|long/i.test(kind) ? 'Participants will enter a long text response here...' : 'Participants will enter a short text response here...'}
        </span>
      )}
    </div>
  )
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5 border-b-1 border-stroke-1 py-4 last:border-b-0">
    <span className="text-text-regular text-text-subtitle">{label}</span>
    <div className="text-body-regular text-text-title">{children}</div>
  </div>
)

export default function SubmittedStudy({ s }: { s: Study }) {
  const nav = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'about') as TabKey
  const { open } = useDraft()
  const { cards } = useWorkspace()
  const clientName = usePlatform().clients.find((c) => c.id === s.clientId)?.name ?? ''
  const card = cards.find((c) => c.isDefault) ?? cards[0]
  const form = s.form
  const pills = s.setup?.audience ?? s.review?.audience ?? []
  const target = pills.filter((p) => !p.label || ['Gender', 'Education', 'Age'].includes(p.label))
  const work = pills.filter((p) => p.label && ['Work Functions', 'Roles', 'Industry', 'Skills'].includes(p.label))
  const conditions = pills.filter((p) => p.label && ['Condition', 'Profile Tiers'].includes(p.label))
  const preMarks = (q: Study['preScreener'][number]) => Object.fromEntries(q.options.map((o) => [o, q.passing.includes(o) ? 'Correct' : 'Incorrect']))
  const { platformFee, recruitingPer, incentivePer, moderationPer } = s.rates
  const n = s.required
  const total = platformFee + (recruitingPer + incentivePer + moderationPer) * n
  const deposit = s.payments.filter((p) => p.kind === 'deposit').reduce((a, p) => a + p.amount, 0)
  const edit = () => { open(s); nav('/studies/create/about') }
  const editable = canEditStudy(s.state)

  return (
    <AppShell hideCreate crumbs={[{ label: 'My Studies', to: '/studies' }, { label: 'Drafts', to: '/studies/drafts' }, { label: s.title.length > 26 ? `${s.title.slice(0, 26)}...` : s.title }]}>
      <div className="flex min-h-[881px] flex-col gap-6 rounded-lg bg-bg-0 p-4">
        <div className="flex items-start gap-6 rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
          <span className="h-[117px] w-[156px] shrink-0 overflow-hidden rounded-md bg-bg-2">
            {s.image && <img src={s.image} alt="" className="h-full w-full object-cover" />}
          </span>
          <div className="flex flex-1 flex-col gap-3">
            <StudyTypeTag type={s.type} className="self-start" />
            <h1 className="text-title-l text-text-title">{s.title}</h1>
            <span className="flex items-center gap-2">
              <Pill className="h-8"><ClockArrow className="h-4 w-4 text-text-subtitle" />{durationLabel(s.durationMins)}</Pill>
              {s.industry && <Pill className="h-8">{s.industry}</Pill>}
            </span>
          </div>
          <span className="flex items-center gap-3">
            <span className="flex h-8 items-center rounded-full bg-yellow-30 px-3 text-text-regular text-brand-primary">{s.state === 'draft' ? 'Draft' : 'In Review'}</span>
            <button type="button" aria-label="Edit study" disabled={!editable} onClick={edit}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-1 border-stroke-input bg-bg-0 text-text-title hover:bg-bg-1 disabled:text-text-disabled">
              <Edit className="h-5 w-5" />
            </button>
          </span>
        </div>

        <section className="flex-1 rounded-lg border-1 border-stroke-1">
          <div role="tablist" className="flex gap-1 border-b-1 border-stroke-1 bg-bg-1 px-2">
            {TABS.map(({ key, label, Icon }) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setParams(key === 'about' ? {} : { tab: key }, { replace: true })}
                className={cn('-mb-px flex h-[44px] items-center gap-2 border-b-2 px-3 text-body-regular',
                  tab === key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-subtitle hover:text-text-title')}>
                <Icon className="h-5 w-5" />{label}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4">
            {tab === 'about' && (
              <>
                <Row label="Title">{s.title}</Row>
                <Row label="Description">{s.description || <span className="text-text-body">None given</span>}</Row>
                <Row label="Study Type"><StudyTypeTag type={s.type} /></Row>
                <Row label="Study Time">{durationLabel(s.durationMins)}</Row>
                {/* Not drawn on the frame; kept so the end date the client set is read back somewhere (flagged for the designer). */}
                <Row label="Study End Date">{form?.endDate || new Date(s.endsAt).toLocaleDateString('en-GB').replace(/\//g, ' / ')}</Row>
                <Row label="Thumbnail">
                  {s.image ? <img src={s.image} alt="" className="h-[89px] w-[160px] rounded-md object-cover" /> : <span className="text-text-body">None uploaded</span>}
                </Row>
              </>
            )}

            {tab === 'audience' && (
              <div className="flex flex-col">
                {[['Target Audience', target], ['Work details', work], ['Conditions to apply', conditions]].map(([title, list]) => (
                  (list as typeof pills).length > 0 && (
                    <div key={title as string} className="flex flex-col gap-3 border-b-1 border-stroke-1 py-4 last:border-b-0">
                      <span className="text-text-regular text-text-subtitle">{title as string}</span>
                      {(list as typeof pills).map((p, i) => (
                        <Pill key={i}>{p.label && <span className="text-text-subtitle">{p.label}:</span>}{p.value}</Pill>
                      ))}
                    </div>
                  )
                ))}
              </div>
            )}

            {tab === 'screener' && (
              <div className="max-w-[766px]">
                {s.preScreener.map((q, i) => <QuestionRead key={q.id} label={`Pre-screener - Q${i + 1}`} kind="Single-select" prompt={q.prompt} options={q.options} marks={preMarks(q)} />)}
                {s.screenerOutline.filter((q) => !q.eligibility).map((q, i) => {
                  const src = s.screener.find((x) => x.id === q.id)
                  return <QuestionRead key={q.id} label={`Q${s.preScreener.length + i + 1}`} kind={q.type} prompt={q.prompt} options={q.options} marks={src?.marks ?? {}} />
                })}
                {s.screenerOutline.length === 0 && <p className="py-4 text-text-regular text-text-subtitle">No screening questions yet.</p>}
              </div>
            )}

            {tab === 'study' && (
              <div className="max-w-[766px] pt-4">
                <p className="flex h-[30px] items-center justify-center rounded-full bg-bgAlt-1 text-text-regular text-text-subtitle">
                  {s.review?.studyRow.label ?? 'Study'}: <span className="pl-1 text-text-title">{s.tasks?.length ? `${s.tasks.length} Question${s.tasks.length === 1 ? '' : 's'}` : s.review?.studyRow.value}</span>
                </p>
                {/* A diary's settings, and a session study's schedule, read back above any questions. */}
                {s.details.map((d) => <Row key={d.label} label={d.label}>{d.value}</Row>)}
                {s.tasks?.length ? s.tasksOutline.map((q, i) => (
                  <QuestionRead key={q.id} label={`Q${i + 1}`} kind={q.type} prompt={q.prompt} options={q.options} marks={s.tasks?.find((x) => x.id === q.id)?.marks ?? {}} />
                )) : null}
              </div>
            )}

            {tab === 'payment' && (
              <div className="grid grid-cols-2 gap-x-6 pt-4">
                <h2 className="col-span-2 pb-3 text-title-s text-text-title">Payment Overview</h2>
                <div className="flex flex-col gap-3">
                  <span className="flex h-[58px] items-center justify-between rounded-md border-1 border-stroke-1 px-4"><span className="text-body-regular text-text-subtitle">Total Cost</span><span className="text-title-m text-text-title">{money(total)}</span></span>
                  <span className="flex h-[58px] items-center justify-between rounded-md bg-bg-1 px-4"><span className="text-body-regular text-text-subtitle">Deposit Paid</span><span className="text-title-m text-text-title">{money(deposit)}</span></span>
                </div>
                <div className="flex flex-col rounded-md border-1 border-stroke-1 px-3 text-text-regular">
                  <span className="flex h-[48px] items-center justify-between border-b-1 border-stroke-1"><span className="text-text-subtitle">Incentive</span><span className="text-green-ok">{money(incentivePer)}</span></span>
                  <span className="flex h-[48px] items-center justify-between"><span className="text-text-subtitle">Card on File</span>
                    <span className="flex items-center gap-2 text-text-title">{card ? <><CardMark brand={card.brand} />•••• {card.last4}</> : 'None'}</span></span>
                </div>
                <div className="pt-6">
                  <h2 className="pb-3 text-title-s text-text-title">Billing</h2>
                  <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4 text-text-regular">
                    {[['Platform Fee', platformFee, ''], ['Recruiting Fee', recruitingPer * n, `${money(recruitingPer)} x ${n} participants`], ['Incentives', incentivePer * n, `${money(incentivePer)} x ${n} participants`], ['Moderation Fee', moderationPer * n, `${money(moderationPer)} x ${n} participants`]].map(([l, a, d]) => (
                      <span key={l as string} className="flex justify-between border-b-1 border-stroke-input pb-3"><span className="flex flex-col text-text-title">{l as string}{d && <span className="text-text-subtitle">{d as string}</span>}</span><span className="text-text-title">{money(a as number)}</span></span>
                    ))}
                    <span className="flex justify-between"><span className="text-text-title">Total cost</span><span>{money(total)}</span></span>
                    <span className="flex justify-between border-b-1 border-stroke-input pb-3"><span className="flex flex-col text-text-title">Less: Deposit<span className="text-text-subtitle">{DEPOSIT_RULE}</span></span><span>-{money(deposit)}</span></span>
                    <span className="flex justify-between text-body-medium text-text-title"><span>Net payable cost</span><span>{money(Math.max(0, total - deposit))}</span></span>
                  </div>
                </div>
                <div className="pt-6">
                  <h2 className="pb-3 text-title-s text-text-title">Transactions</h2>
                  {s.payments.filter((p) => p.kind === 'deposit').map((p) => (
                    <div key={p.id} className="flex flex-col gap-1 rounded-md border-1 border-stroke-1 p-3 text-text-regular">
                      <span className="flex justify-between text-text-title"><span>Deposit Paid</span><span>{money(p.amount)}</span></span>
                      <span className="flex items-center justify-between text-text-subtitle">
                        <span className="flex flex-col gap-1"><span>{monthDayYearTime(p.at)}</span><span>{DEPOSIT_RULE}</span></span>
                        <button type="button" onClick={() => toast(`Saved ${save(fileName(`receipt deposit ${s.title}`, 'pdf'), pdf(`Receipt: Deposit for ${s.title}`, [monthDayYearTime(p.at), DEPOSIT_RULE, '', `Amount: ${money(p.amount)}`]))}`)}
                          className="flex h-[38px] items-center gap-2 rounded-md border-1 border-stroke-input px-3 text-text-title hover:bg-bg-1"><Download className="h-4 w-4" />Receipt</button>
                      </span>
                    </div>
                  ))}
                  {deposit === 0 && <p className="text-text-subtitle">Nothing has been paid on this study yet.</p>}
                </div>
              </div>
            )}

            {tab === 'revisions' && <div className="pt-4"><RevisionsTimeline study={s} viewer="client" firstName={clientName.split(' ')[0] ?? ''} /></div>}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
