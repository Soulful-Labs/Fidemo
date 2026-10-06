import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppNav } from '../../../app/useAppNav'
import EmptyState from '../../../components/app/EmptyState'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import SuccessScreen from '../../../components/app/SuccessScreen'
import Button from '../../../components/ui/Button'
import CtaBar from '../../../components/ui/CtaBar'
import TopBar from '../../../components/ui/TopBar'
import { Clock } from '../../../components/ui/icons'
import { bookingLong, duration, money } from '../../../lib/format'
import { canReschedule } from '../../../lib/rules'
import { useStore } from '../../../mock/store'
import SchedulePicker, { SectionHeading } from './SchedulePicker'
import type { Selection } from './SchedulePicker'
import { AgreementSheet, LocationSheet, ReviewSheet } from './ScheduleSheets'

function Pin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * PRD 6.10, Figma 919:75357 / 968:15330 / 919:75433. One screen carries the
 * pick step and, as route-driven sheets, the agreement and review steps:
 * /schedule, /schedule/agreement, /schedule/review, /schedule/done, and the
 * same under /reschedule with "Confirm Reschedule".
 */
export default function ScheduleFlow() {
  const { id = '', step } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { studyById, scheduleStudy, toast } = useStore()
  const study = studyById(id)
  const isReschedule = pathname.includes('/reschedule')
  const base = `/studies/${id}/${isReschedule ? 'reschedule' : 'schedule'}`
  const inPerson = study?.type === 'in_person' || study?.type === 'in_person_group'
  const isCall = study?.type === 'video_call' || study?.type === 'group_video_call'

  const [selection, setSelection] = useState<Selection>({ locationId: study?.booking?.locationId ?? study?.locations?.[0]?.id })
  const [locationSheet, setLocationSheet] = useState(false)

  // A reschedule that the rules block never opens: bounce with the reason.
  useEffect(() => {
    if (!study || !isReschedule || !study.booking) return
    const check = canReschedule(study.booking.rescheduleCount, study.booking.date)
    if (!check.ok) {
      toast(check.reason ?? 'Cannot reschedule')
      navigate(`/studies/${id}`, { replace: true })
    }
  }, [study, isReschedule, id, navigate, toast])

  if (!study) {
    return <EmptyState title="Study not found" actionLabel="Back to My Studies" onAction={() => navigate('/studies/mine')} />
  }

  if (step === 'done') {
    return (
      <SuccessScreen
        tier={2}
        title={isReschedule ? 'Rescheduled successfully!' : 'Scheduled successfully!'}
        body={study.booking ? `Your session is booked for ${bookingLong(study.booking.date, study.booking.slot)} ET. We will remind you before it starts.` : undefined}
        onAction={() => navigate(`/studies/${id}`, { replace: true })}
      />
    )
  }

  const location = study.locations?.find((l) => l.id === selection.locationId)
  const ready = Boolean(selection.date && selection.slot && (!inPerson || location))

  const proceed = () => navigate(isCall ? `${base}/agreement` : `${base}/review`)
  const confirm = () => {
    if (!selection.date || !selection.slot) return
    scheduleStudy(study.id, {
      date: selection.date, slot: selection.slot, locationId: selection.locationId,
      rescheduleCount: isReschedule ? (study.booking?.rescheduleCount ?? 0) + 1 : 0,
    }, isReschedule)
    navigate(`${base}/done`, { replace: true })
  }

  const title = isReschedule ? 'Reschedule Study Session' : isCall ? 'Schedule Study Call' : 'Schedule Study Session'

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={title} onBack={back} />

      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-2 rounded-lg bg-bg-1 p-4">
          <p className="text-body-regular text-text-title">{study.title}</p>
          <p className="flex items-center gap-2 text-text-regular text-text-subtitle">
            {money(study.reward)} <span className="text-text-body">•</span> {duration(study.durationMins)}
            <StudyTypeTag type={study.type} size="sm" />
          </p>
          {isReschedule && study.booking && (
            <p className="flex items-center gap-2 pt-1 text-body-medium text-text-title">
              <Clock className="h-5 w-5" />
              For {bookingLong(study.booking.date, study.booking.slot).replace(' At ', ' • At ')}
            </p>
          )}
        </div>

        <SchedulePicker study={study} value={selection} onChange={setSelection} onBlocked={toast} />

        {inPerson && study.locations && (
          <>
            <span className="h-px w-full bg-stroke-2" />
            <section className="flex flex-col gap-4">
              <SectionHeading icon={<Pin />} title="Select location" sub={`${study.locations.length} available locations to schedule at`} />
              <p className="rounded-md bg-bg-1 p-4 text-body-regular text-text-subtitle">{location?.address}</p>
              <Button variant="secondary" fullWidth onClick={() => setLocationSheet(true)}>Change Location</Button>
            </section>
          </>
        )}
      </div>

      <CtaBar>
        <Button fullWidth disabled={!ready} onClick={proceed}
          onBlocked={() => toast(selection.date ? 'Pick a time slot to continue' : 'Pick a date to continue')}>
          {isReschedule ? 'Submit' : 'Proceed'}
        </Button>
      </CtaBar>

      {study.locations && (
        <LocationSheet open={locationSheet} onClose={() => setLocationSheet(false)} locations={study.locations}
          value={selection.locationId} onSave={(locationId) => { setSelection((s) => ({ ...s, locationId })); setLocationSheet(false) }} />
      )}
      <AgreementSheet open={step === 'agreement'} onClose={() => navigate(base)} onAgree={() => navigate(`${base}/review`)} />
      <ReviewSheet open={step === 'review' && ready} onClose={() => navigate(base)}
        date={selection.date ?? ''} slot={selection.slot ?? ''} address={inPerson ? location?.address : undefined}
        isReschedule={isReschedule} onConfirm={confirm} />
    </div>
  )
}
