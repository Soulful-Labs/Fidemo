import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../../components/app/EmptyState'
import SuccessScreen from '../../../components/app/SuccessScreen'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import QuestionFlow from '../questions/QuestionFlow'

/**
 * PRD 6.12, Figma 919:76161. The survey's task questions one per screen
 * with segmented progress. The study stays Invited To Complete until Submit,
 * so leaving part way can be resumed with Start Study; Submit completes it
 * (In Process, then Paid after the fake delay). /survey/done is
 * "Completed successfully!".
 */
export default function Survey() {
  const { id = '', step } = useParams()
  const navigate = useNavigate()
  const { studyById, answers, dispatch, completeStudy, toast } = useStore()
  const [exit, setExit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const study = studyById(id)

  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  if (step === 'done') {
    return (
      <SuccessScreen
        title="Completed successfully!"
        body="Your survey study has been completed successfully and submitted."
        onAction={() => navigate(`/studies/${id}`, { replace: true })}
      />
    )
  }

  const key = `${study.id}:survey`
  const current = answers[key] ?? {}

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      completeStudy(study.id)
      navigate(`/studies/${id}/survey/done`, { replace: true })
    }, TIMINGS.fakeServer)
  }

  return (
    <>
      <QuestionFlow
        title="Survey Study"
        progress="segments"
        questions={study.tasks ?? []}
        answers={current}
        onAnswer={(qid, value) => dispatch({ type: 'SAVE_ANSWERS', id: key, answers: { ...current, [qid]: value } })}
        onSubmit={submitting ? () => undefined : submit}
        onExit={() => setExit(true)}
      />

      <Modal open={exit} onClose={() => setExit(false)} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setExit(false); toast('Your answers are kept'); navigate(`/studies/${id}`) }}>Exit</Button>
            <Button className="flex-1" onClick={() => setExit(false)}>No, Continue</Button>
          </div>
        }>
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-title-l text-text-title">Want to Exit Survey?</h2>
          <p className="text-body-regular text-text-body">Your answers so far are kept. Come back from the study to finish and submit.</p>
        </div>
      </Modal>
    </>
  )
}
