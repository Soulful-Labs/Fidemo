import { diaryWords } from '@shared/platform'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../../app/useAppNav'
import EmptyState from '../../../components/app/EmptyState'
import ProgressBar from '../../../components/app/ProgressBar'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import TopBar from '../../../components/ui/TopBar'
import { Check, ChevronRight } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { diaryComplete } from '@shared/platform'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import { dateLong, dateShort } from '../../../lib/format'

/**
 * The next day to fill in: the first one not done whose date has come
 * (`locks`, shared/derive.ts diaryLocks; earlier days stay open to catch up
 * on). Undefined when every open day is done.
 */
export function nextDiaryDay(completed: number[], total: number, locks: (string | null)[] = []): number | undefined {
  for (let d = 1; d <= total; d++) if (!completed.includes(d) && !locks[d - 1]) return d
  return undefined
}

/** The first day not done that is still locked, and the date it opens, when nothing open is left to fill. */
export function nextLockedDay(completed: number[], total: number, locks: (string | null)[] = []): { day: number; opens: string } | undefined {
  for (let d = 1; d <= total; d++) { const opens = locks[d - 1]; if (!completed.includes(d) && opens) return { day: d, opens } }
  return undefined
}

/** "Resume Study Day 2" per PRD 6.13, in the unit the diary counts its entries in. */
export function resumeLabel(completed: number[], total: number, w: ReturnType<typeof diaryWords> = diaryWords(), locks: (string | null)[] = []): string {
  const next = nextDiaryDay(completed, total, locks)
  if (next) return `Resume Study ${w.Unit} ${next}`
  const locked = nextLockedDay(completed, total, locks)
  return locked ? `${w.Unit} ${locked.day} opens ${dateShort(locked.opens)}` : `All ${w.units} completed`
}

/**
 * PRD 6.13 diary overview: the day list with what is done, the 4-of-5 rule,
 * Resume Study Day N, and Complete Study once the rule is met.
 */
export default function DiaryOverview() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { studyById, completeStudy, toast } = useStore()
  const study = studyById(id)

  if (!study?.diary) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  const { totalDays, minDays, completedDays } = study.diary
  /** An entry is an hour, a day or a week, whichever the client chose (shared/platform.ts). */
  const w = diaryWords(study.diary.unit)
  // 23 Oct 2026: each entry opens on its own date; earlier ones stay open to catch up on (demo accounts have every one open).
  const locks = study.diary.locks ?? []
  const next = nextDiaryDay(completedDays, totalDays, locks)
  const locked = next ? undefined : nextLockedDay(completedDays, totalDays, locks)
  const canFinish = diaryComplete(completedDays, minDays)
  const finished = study.status === 'in_process' || study.status === 'paid'

  const finish = () => {
    completeStudy(study.id)
    toast('Diary submitted. Awaiting payout. The team processes it when the study finishes.')
    setTimeout(() => navigate(`/studies/${id}`, { replace: true }), TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Diary Study" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-3 rounded-lg bg-bg-1 bg-yellow-fade p-4">
          <p className="text-body-medium text-brand-primary">{completedDays.length}/{totalDays} {w.units} completed</p>
          <ProgressBar value={completedDays.length} max={totalDays} memory={`diary-${study.id}`} />
          <p className="text-text-regular text-text-subtitle">
            At least {minDays} {w.units} needs to be filled out of {totalDays} to complete this study and get reward.
          </p>
        </div>

        <h2 className="text-title-s text-text-title">{study.title}</h2>

        <ol className="flex flex-col gap-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const done = completedDays.includes(day)
            const opens = done ? null : locks[day - 1] ?? null
            const isNext = day === next && !finished
            const open = !done && !opens && !finished
            return (
              <li key={day}>
                <button
                  type="button"
                  aria-disabled={!done && !open}
                  onClick={() => (done || open ? navigate(`/studies/${id}/diary/${day}`)
                    : toast(finished ? 'This diary is complete' : `${w.Unit} ${day} opens on ${dateLong(opens!)}`))}
                  className={cn(
                    'flex h-btn w-full items-center gap-3 rounded-md px-4 text-left text-body-regular',
                    done ? 'bg-bg-1 text-text-title' : isNext ? 'border-1 border-yellow-700 bg-yellow-1000/40 text-brand-primary' : open ? 'bg-bg-1 text-text-title' : 'bg-bg-1 text-text-disabled',
                  )}
                >
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border-1', done ? 'border-brand-secondary bg-brand-secondary text-bg-0' : 'border-current')}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-label">{day}</span>}
                  </span>
                  {w.Unit} {day} of {totalDays}
                  <span className="ml-auto text-text-regular">{done ? 'Completed' : isNext ? 'Up next' : open ? 'Open' : opens ? `Opens ${dateShort(opens)}` : 'Locked'}</span>
                  {isNext && <ChevronRight className="h-5 w-5" />}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <CtaBar>
        {finished ? (
          <Button fullWidth variant="secondary" onClick={() => navigate(`/studies/${id}`)}>View Study</Button>
        ) : next ? (
          <Button fullWidth onClick={() => navigate(`/studies/${id}/diary/${next}`)} rightIcon={<ChevronRight className="h-5 w-5" />}>
            {resumeLabel(completedDays, totalDays, w, locks)}
          </Button>
        ) : locked ? (
          <Button fullWidth disabled onBlocked={() => toast(`${w.Unit} ${locked.day} opens on ${dateLong(locked.opens)}`)}>
            {resumeLabel(completedDays, totalDays, w, locks)}
          </Button>
        ) : null}
        {!finished && canFinish && (
          <Button fullWidth variant={next ? 'secondary' : 'primary'} onClick={finish}>Complete Study</Button>
        )}
        {!finished && !canFinish && !next && (
          <Button fullWidth disabled onBlocked={() => toast(`Fill at least ${minDays} ${w.units} to complete this study`)}>Complete Study</Button>
        )}
      </CtaBar>
    </div>
  )
}
