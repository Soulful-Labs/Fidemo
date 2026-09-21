import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../../components/app/EmptyState'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import { ageFrom } from '../../../lib/profile'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'
import PreScreener from './PreScreener'
import QuestionFlow from './QuestionFlow'
import { ExitScreenerModal, WhyScreenerModal } from './ScreenerModals'

/**
 * PRD 6.8, Figma 919:74274, in two stages per workflow 28 and 29: the three
 * eligibility questions first, then the full screener for those who pass.
 * A draft only exists once the full screener has started (a failed
 * pre-screener ends politely and saves nothing). Workflow 30: age, location
 * and job are never asked again; a line says they come from the profile.
 */
export default function Screener() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { studyById, answers, dispatch, saveDraft, submitScreener, applyToStudy, toast, user } = useStore()
  const [exit, setExit] = useState(false)
  const [why, setWhy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState<'pre' | 'full' | 'failed'>()

  const study = studyById(id)
  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to Explore" onAction={() => navigate('/studies')} />
  }

  // A draft, or a screener already in progress, skips straight to the full screener.
  const resumed = study.status === 'draft' || study.status === 'applying'
  const current = answers[study.id] ?? {}
  const phase = stage ?? (resumed ? 'full' : 'pre')

  const startFull = () => {
    // Only now does the study leave Explore / Invites and become an application.
    if (study.status === 'available' || study.status === 'invited_to_apply') applyToStudy(study.id)
    setStage('full')
  }

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      submitScreener(study.id)
      navigate(`/studies/${study.id}/applied`, { replace: true })
    }, TIMINGS.fakeServer)
  }

  if (phase === 'failed') {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-12 text-center">
          <h1 className="text-title-l text-text-title">Not a match this time</h1>
          <p className="text-body-regular text-text-body">
            Thanks for checking. This study is looking for a slightly different group, so we won&apos;t take you through the
            full screener. Nothing has been saved and it does not affect your Trust Score.
          </p>
          <p className="text-text-regular text-text-subtitle">Other studies that match your profile are waiting in Explore.</p>
        </div>
        <CtaBar>
          <Button fullWidth onClick={() => navigate('/studies', { replace: true })}>Back to Explore</Button>
        </CtaBar>
      </div>
    )
  }

  if (phase === 'pre') {
    return (
      <PreScreener
        questions={study.preScreener}
        onPass={startFull}
        onFail={() => setStage('failed')}
        onExit={() => navigate(`/studies/${study.id}`)}
      />
    )
  }

  const age = ageFrom(user.profile.dob)
  const known = [age ? `${age} years old` : undefined, user.profile.address || undefined, user.profile.occupation || undefined].filter(Boolean).join(' • ')

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
        header={
          <p className="rounded-md bg-bg-1 px-3 py-2 text-text-regular text-text-body">
            Age, location and job come from your profile{known ? ` (${known})` : ''}, so we won&apos;t ask them again.
          </p>
        }
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
