import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../../components/app/EmptyState'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import { Close, Info } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import QuestionInput, { isAnswered } from '../questions/QuestionInput'
import Modal from '../../../components/ui/Modal'

/**
 * One diary day (PRD 6.13, Figma 919:76614): every question for the day on
 * one page under the segmented day progress and the "DAY 1 of 5" pill.
 * Submit Progress marks the day complete and returns to the overview.
 */
export default function DiaryDay() {
  const { id = '', day: dayParam = '1' } = useParams()
  const day = Number(dayParam)
  const navigate = useNavigate()
  const { studyById, answers, dispatch, completeDiaryDay, toast } = useStore()
  const [info, setInfo] = useState(false)
  const [saving, setSaving] = useState(false)
  const study = studyById(id)

  if (!study?.diary) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  const { totalDays, completedDays } = study.diary
  const questions = study.tasks ?? []
  const key = `${study.id}:day${day}`
  const current = answers[key] ?? {}
  const complete = questions.every((q) => isAnswered(q, current[q.id]))
  const overview = `/studies/${id}/diary`

  const submit = () => {
    setSaving(true)
    setTimeout(() => {
      completeDiaryDay(study.id, day)
      toast(`Day ${day} submitted`)
      navigate(overview, { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b-1 border-stroke-1 bg-bg-0 px-4 pb-2 pt-3">
        <div className="flex h-8 items-center gap-2">
          <button type="button" onClick={() => navigate(overview)} aria-label="Close" className="-ml-1 flex h-8 w-8 items-center justify-center text-text-title">
            <Close className="h-6 w-6" />
          </button>
          <h1 className="text-title-s text-text-title">Diary Study</h1>
          <button type="button" onClick={() => setInfo(true)} aria-label="About this diary" className="ml-auto flex h-8 w-8 items-center justify-center text-text-title">
            <Info className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center gap-2" role="progressbar" aria-valuenow={day} aria-valuemax={totalDays}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
            <span key={d} className={cn('h-1 flex-1 rounded-full', d === day || completedDays.includes(d) ? 'bg-brand-secondary' : 'bg-green-900/60')} />
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-4">
        <p className="rounded-full bg-bg-2 py-2 text-center text-text-medium uppercase text-text-title">Day {day} of {totalDays}</p>

        {questions.map((question, i) => (
          <section key={question.id} className="flex flex-col gap-3">
            <h2 className="flex gap-2 text-body-medium text-text-title">
              <span>{i + 1}.</span>
              <span>{question.prompt}</span>
            </h2>
            <QuestionInput
              question={question}
              value={current[question.id]}
              onChange={(value) => dispatch({ type: 'SAVE_ANSWERS', id: key, answers: { ...current, [question.id]: value } })}
            />
          </section>
        ))}
      </div>

      <CtaBar>
        <Button fullWidth loading={saving} disabled={!complete} onClick={submit}
          onBlocked={() => toast('Answer every question to submit today')}>
          Submit Progress
        </Button>
      </CtaBar>

      <Modal open={info} onClose={() => setInfo(false)} title="Diary Study" showClose={false}
        footer={<Button fullWidth onClick={() => setInfo(false)}>Got It!</Button>}>
        <p className="text-text-regular text-text-subtitle">
          Fill in one entry each day. At least {study.diary.minDays} days needs to be filled out of {totalDays} to
          complete this study and get reward. Your answers save as you type.
        </p>
      </Modal>
    </div>
  )
}
