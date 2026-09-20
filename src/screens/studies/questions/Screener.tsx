import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../../components/app/EmptyState'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import QuestionFlow from './QuestionFlow'
import { ExitScreenerModal, WhyScreenerModal } from './ScreenerModals'

/**
 * PRD 6.8, Figma 919:74274. Answers save to the store as they change, so
 * leaving part way keeps a draft (PRD 6.9) and resuming picks them back up.
 */
export default function Screener() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { studyById, answers, dispatch, saveDraft, submitScreener, applyToStudy, toast } = useStore()
  const [exit, setExit] = useState(false)
  const [why, setWhy] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const study = studyById(id)
  const status = study?.status

  // Arriving from a card that went straight here (Accept & Apply) still marks
  // the study as applying so it leaves Invites.
  useEffect(() => {
    if (status === 'available' || status === 'invited_to_apply') applyToStudy(id)
  }, [status, id, applyToStudy])

  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to Explore" onAction={() => navigate('/studies')} />
  }

  const current = answers[study.id] ?? {}

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      submitScreener(study.id)
      navigate(`/studies/${study.id}/applied`, { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <>
      <QuestionFlow
        title="Screener Questions"
        questions={study.screener}
        answers={current}
        onAnswer={(qid, value) => dispatch({ type: 'SAVE_ANSWERS', id: study.id, answers: { ...current, [qid]: value } })}
        onSubmit={submitting ? () => undefined : submit}
        onExit={() => setExit(true)}
        onInfo={() => setWhy(true)}
      />

      <WhyScreenerModal open={why} onClose={() => setWhy(false)} />
      <ExitScreenerModal
        open={exit}
        onClose={() => setExit(false)}
        onSave={() => {
          saveDraft(study.id, current)
          setExit(false)
          toast('Saved to Drafts')
          navigate('/studies/mine/drafts')
        }}
      />
    </>
  )
}
