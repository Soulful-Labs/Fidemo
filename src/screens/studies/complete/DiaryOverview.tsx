import { useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../../app/useAppNav'
import EmptyState from '../../../components/app/EmptyState'
import ProgressBar from '../../../components/app/ProgressBar'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import TopBar from '../../../components/ui/TopBar'
import { Check, ChevronRight } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { diaryComplete } from '../../../lib/rules'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'

/** The next day to fill in, or undefined when every day is done. */
export function nextDiaryDay(completed: number[], total: number): number | undefined {
  for (let d = 1; d <= total; d++) if (!completed.includes(d)) return d
  return undefined
}

/** "Resume Study Day 2" per PRD 6.13. */
export function resumeLabel(completed: number[], total: number): string {
  const next = nextDiaryDay(completed, total)
  return next ? `Resume Study Day ${next}` : 'All days completed'
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
  const next = nextDiaryDay(completedDays, totalDays)
  const canFinish = diaryComplete(completedDays, minDays)
  const finished = study.status === 'in_process' || study.status === 'paid'

  const finish = () => {
    completeStudy(study.id)
    toast('Diary submitted, payment on its way')
    setTimeout(() => navigate(`/studies/${id}`, { replace: true }), TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Diary Study" onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-3 rounded-lg bg-bg-1 bg-yellow-fade p-4">
          <p className="text-body-medium text-brand-primary">{completedDays.length}/{totalDays} days completed</p>
          <ProgressBar value={completedDays.length} max={totalDays} memory={`diary-${study.id}`} />
          <p className="text-text-regular text-text-subtitle">
            At least {minDays} days needs to be filled out of {totalDays} to complete this study and get reward.
          </p>
        </div>

        <h2 className="text-title-s text-text-title">{study.title}</h2>

        <ol className="flex flex-col gap-2">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const done = completedDays.includes(day)
            const isNext = day === next && !finished
            return (
              <li key={day}>
                <button
                  type="button"
                  aria-disabled={!done && !isNext}
                  onClick={() => (done ? toast(`Day ${day} is already submitted`)
                    : isNext ? navigate(`/studies/${id}/diary/${day}`)
                      : toast(finished ? 'This diary is complete' : `Day ${day} unlocks after day ${next}`))}
                  className={cn(
                    'flex h-btn w-full items-center gap-3 rounded-md px-4 text-left text-body-regular',
                    done ? 'bg-bg-1 text-text-title' : isNext ? 'border-1 border-yellow-700 bg-yellow-1000/40 text-brand-primary' : 'bg-bg-1 text-text-disabled',
                  )}
                >
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border-1', done ? 'border-brand-secondary bg-brand-secondary text-bg-0' : 'border-current')}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-label">{day}</span>}
                  </span>
                  Day {day} of {totalDays}
                  <span className="ml-auto text-text-regular">{done ? 'Completed' : isNext ? 'Up next' : 'Locked'}</span>
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
            {resumeLabel(completedDays, totalDays)}
          </Button>
        ) : null}
        {!finished && canFinish && (
          <Button fullWidth variant={next ? 'secondary' : 'primary'} onClick={finish}>Complete Study</Button>
        )}
        {!finished && !canFinish && !next && (
          <Button fullWidth disabled onBlocked={() => toast(`Fill at least ${minDays} days to complete this study`)}>Complete Study</Button>
        )}
      </CtaBar>
    </div>
  )
}
