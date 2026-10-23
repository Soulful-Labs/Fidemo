import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ChevronRight, Edit } from '../../components/ui/icons'
import { studySummary } from '@shared/studyForm'
import { setupDone, useDraft } from '../../mock/createStore'
import CreateShell, { SaveDraftButton } from './CreateShell'
import { Section } from './CreateBits'
import { SettingsCard } from './StudyBits'
import SurveyComposer from './SurveyComposer'
import AvailabilityComposer from './AvailabilityComposer'
import OverridePanel from './OverridePanel'
import { DiarySettings } from './DiarySetup'

const TARGET = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

/** Survey Settings: the questionnaire is either still to be made, or made. */
function SurveySettings() {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const made = params.get('state') === 'created' || draft.tasksSubmitted
  const count = draft.tasks.filter((q) => q.text.trim()).length
  return (
    <Section icon={TARGET} title="Survey Settings" sub="Setup your survey for the participants" headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard title="Custom Survey Form" sub={made ? undefined : 'Make the input form for survey questions'}>
        {made ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              {draft.tasksSubmitted ? `${count} Question${count === 1 ? '' : 's'}` : '10 Questions'}
              <ChevronRight className="h-4 w-4 text-text-subtitle" />
            </button>
            <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => set('surveyOpen', true)}>Edit Survey</Button>
          </>
        ) : (
          <Button size="none" className="h-12 w-full text-body-medium" disabled={draft.surveyOpen || params.get('state') === 'building'}
            onClick={() => set('surveyOpen', true)}>Create Survey Questionnaire</Button>
        )}
      </SettingsCard>
    </Section>
  )
}


/** Video Call Settings (1518:92729 individual, 1518:93335 group). */
function VideoSettings({ group, open }: { group: boolean; open: boolean }) {
  const { draft, set } = useDraft()
  return (
    <Section icon={TARGET}
      title={group ? 'Focus Group Video Call Settings' : 'Video Call Settings'}
      sub={group ? 'Setup scheduler for group video call for the participants' : 'Setup scheduler for individual 1:1 video call for the participants'}
      headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard
        title={group ? 'Set Availability for Group sessions' : 'Set Availability'}
        sub="Set your availability to allow participants to book sessions with you and let you conduct your individual video calls with them at your convenient timings">
        {draft.availabilitySet ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              {studySummary(draft).value}
              <ChevronRight className="h-4 w-4 text-text-subtitle" />
            </button>
            <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => set('surveyOpen', true)}>Update Timing Availability</Button>
          </>
        ) : (
          <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" disabled={open}
            onClick={() => set('surveyOpen', true)}>Set Timing Availability</Button>
        )}
      </SettingsCard>
    </Section>
  )
}


/** In-Person Interiew Settings (1518:93678), the frame's own spelling. */
function InPersonSettings({ group, open }: { group: boolean; open: boolean }) {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const saved = params.get('state') === 'created' || draft.availabilitySet
  return (
    <Section icon={TARGET}
      title={group ? 'In-Person Group Interview Settings' : 'In-Person Interiew Settings'}
      sub={group ? 'Setup your in-person group sessions details for the participants' : 'Setup your in-person details for the participants'} headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard title={group ? 'Set Availability for Group sessions' : 'Set Availability'}
        sub={group
          ? 'Availability to allow participants to book seat in Group in-person sessions with you and let you conduct your group sessions with them at your convenient timings'
          : 'Availability to allow participants to book 1:1 individual in-person sessions with you and let you conduct your individual sessions  with them at your convenient timings'}>
        {saved ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              {draft.availabilitySet ? studySummary(draft).value : group ? '2 sessions, 10 seats per sessions, 1 address' : '2 addresses, available 5 days/week, custom timings, 2 days overrides'}
              <ChevronRight className="h-4 w-4 text-text-subtitle" />
            </button>
            <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => set('surveyOpen', true)}>{group ? 'Update Timing Availability' : 'Update Address & Availability'}</Button>
          </>
        ) : (
          <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" disabled={open}
            onClick={() => set('surveyOpen', true)}>Set Address &amp; Availability</Button>
        )}
      </SettingsCard>
    </Section>
  )
}

/**
 * The settings section for whichever type the draft chose on step 1. `?type=`
 * overrides it so each variant can be opened and compared on its own.
 */
function TypeSettings({ type, group, open }: { type: string; group: boolean; open: boolean }) {
  if (type === 'survey') return <SurveySettings />
  if (type === 'diary') return <DiarySettings icon={TARGET} />
  if (type === 'video_call') return <VideoSettings group={group} open={open} />
  if (type === 'in_person') return <InPersonSettings group={group} open={open} />
  return null
}

/**
 * 2.1.3 Study setup, the one step where the four types differ. As every type's
 * frame draws it (1518:91922, 1518:94742, 1518:92570, 1518:93998), the type's
 * settings card, and the step ends in Proceed to Publish. Incentive Payments,
 * Costing Summary and Payment came out on 23 Oct 2026 (the client no longer
 * sets the incentive or sees the old fee lines). The survey and diary composers open as
 * the whole page, with Save & Continue in the top bar; a session study's
 * composer is submitted by Continue. Either returns here.
 */
export default function StudySetup() {
  const nav = useNavigate()
  const { draft, set } = useDraft()
  const [override, setOverride] = useState(false)
  const [editing, setEditing] = useState<string | undefined>()
  const [params] = useSearchParams()
  const type = params.get('type') ?? draft.type
  const group = params.get('group') === '1' || (type === 'video_call' ? draft.groupVideo : draft.groupInPerson)
  const open = draft.surveyOpen || params.get('state') === 'building'
  const formOpen = open && (type === 'survey' || type === 'diary')
  /** Save & Continue on an open survey or diary form submits it, as the form's own Submit did. */
  const saveForm = () => document.querySelector<HTMLButtonElement>('[data-submit-form]')?.click()
  /** A session study's open composer is submitted by Continue, which then moves on (1518:93678 draws no Submit of its own). */
  const sessionOpen = open && (type === 'video_call' || type === 'in_person')
  const submitAvailability = () => document.querySelector<HTMLButtonElement>('[data-submit-availability]')?.click()

  return (
    <CreateShell step="study" action={
      <>
        <SaveDraftButton />
        {formOpen
          ? <Button size="row" onClick={saveForm}>Save &amp; Continue</Button>
          : sessionOpen
            ? <Button size="row" onClick={submitAvailability}>Continue</Button>
            : <Button size="row" disabled={!setupDone(draft)} title={setupDone(draft) ? undefined : 'Finish the study settings first'} onClick={() => nav('/studies/create/publish')}>Proceed to Publish</Button>}
      </>
    }>
      <div className={`rounded-lg bg-bg-0 px-6 ${formOpen && type === 'diary' ? 'pt-6' : 'pt-[9px]'} ${type === 'diary' ? 'min-h-[1707px]' : type === 'video_call' ? (open ? 'min-h-[1408px]' : 'min-h-[1374px]') : type === 'in_person' ? (open ? (group ? 'min-h-[1408px]' : 'min-h-[1579px]') : 'min-h-[1374px]') : 'min-h-[1302px]'}`}>
        {open ? (
          <div className="flex items-start gap-6 pb-6">
            {type === 'video_call' || type === 'in_person' ? (
              <AvailabilityComposer group={group} address={type === 'in_person'}
                title={type === 'in_person' && !group ? 'Set Address & Availability' : 'Set Availability'}
                onOverride={(id) => { setEditing(id); setOverride(true) }}
                onBack={() => set('surveyOpen', false)}
                onSubmit={() => { set('availabilitySet', true); set('surveyOpen', false) }} />
            ) : type === 'diary' ? (
              <SurveyComposer title="Create Diary Form" submit="Submit Diary Form" diary
                lead="Setup your form inputs form for users with AI or manually" kind="Multi-line input"
                onSubmit={() => { set('tasksSubmitted', true); set('surveyOpen', false) }}
                onBack={() => set('surveyOpen', false)} />
            ) : (
              <SurveyComposer
                onSubmit={() => { set('tasksSubmitted', true); set('surveyOpen', false) }}
                onBack={() => set('surveyOpen', false)} />
            )}
            {/* The frames draw the composer alone: no settings card beside it (22 Oct 2026, 1518:93678). */}
            {!formOpen && !sessionOpen && (
              <div className="flex w-[488px] shrink-0 flex-col">
                <TypeSettings type={type} group={group} open={open} />
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto flex w-[600px] flex-col">
            <TypeSettings type={type} group={group} open={open} />
          </div>
        )}
      </div>

      <OverridePanel open={override || params.get('panel') === 'override'} editId={editing} onClose={() => setOverride(false)} />
    </CreateShell>
  )
}
