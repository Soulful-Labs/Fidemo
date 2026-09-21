import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../../app/useAppNav'
import EmptyState from '../../../components/app/EmptyState'
import StarRating from '../../../components/app/StarRating'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import Input from '../../../components/ui/Input'
import TopBar from '../../../components/ui/TopBar'
import { useStore } from '../../../mock/store'
import { TIMINGS } from '../../../mock/timings'

/**
 * PRD 6.15, Figma 919:73471: "Rate For <study>", the client row, two star
 * scales and an optional review. Submit records the review on the study and
 * the history shows "Your review for client" with Edit Rating.
 */
export default function RateClient() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { studyById, rateClient, toast } = useStore()
  const study = studyById(id)
  const [reliability, setReliability] = useState(study?.userReview?.reliability ?? 0)
  const [communication, setCommunication] = useState(study?.userReview?.communication ?? 0)
  const [touched, setTouched] = useState(false)
  const [comment, setComment] = useState(study?.userReview?.comment ?? '')
  const [saving, setSaving] = useState(false)

  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  const valid = reliability > 0 && communication > 0
  const submit = () => {
    setSaving(true)
    setTimeout(() => {
      rateClient(study.id, { reliability, communication, comment: comment.trim() || undefined })
      toast(study.userReview ? 'Rating updated' : 'Thanks, your review is recorded')
      navigate(`/studies/${id}`, { replace: true })
    }, TIMINGS.fakeServer)
  }

  const scale = (label: string, value: number, onChange: (n: number) => void) => (
    <section className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
      <p className="text-body-medium text-text-title">{label}</p>
      <StarRating value={value} onChange={onChange} size="lg" label={label} />
      {touched && value === 0 && <p className="text-label text-state-danger">Pick a star rating for {label.toLowerCase()}</p>}
    </section>
  )

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={`Rate For ${study.title}`} onBack={back} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bg-2 text-body-medium text-text-subtitle">
            {study.client.name.charAt(0)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-text-regular text-text-subtitle">Rate {study.client.name}</span>
            <span className="truncate text-body-medium text-text-title">For {study.title}</span>
          </span>
        </div>

        {scale('Reliability', reliability, setReliability)}
        {scale('Communication', communication, setCommunication)}

        <section className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
          <p className="text-body-medium text-text-title">
            Review <span className="text-text-regular text-text-body">(optional)</span>
          </p>
          <Input multiline rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={`Describe your experience with ${study.client.name} here..`} aria-label="Review" />
        </section>
      </div>

      <CtaBar>
        <Button fullWidth loading={saving} disabled={!valid} onClick={submit}
          onBlocked={() => setTouched(true)}>
          Submit
        </Button>
      </CtaBar>
    </div>
  )
}
