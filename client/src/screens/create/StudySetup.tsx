import { useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ChevronRight, Edit } from '../../components/ui/icons'
import { blankQuestion, useDraft } from '../../mock/createStore'
import CreateShell from './CreateShell'
import Select from '../../components/ui/Select'
import { Section } from './CreateBits'
import { CostingSummary, IncentivePayments, Payment, SettingsCard } from './StudyBits'
import SurveyComposer from './SurveyComposer'
import AvailabilityComposer from './AvailabilityComposer'

const TARGET = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

/** The four survey questions the frame starts the questionnaire with. */
const SEED_SURVEY = [
  { ...blankQuestion('SQ 1', 'Single-select'), options: [
    { id: 'sq1a', text: '', mark: 'Qualify' }, { id: 'sq1b', text: '', mark: 'Disqualify' },
  ] },
]

/** Survey Settings: the questionnaire is either still to be made, or made. */
function SurveySettings() {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const made = params.get('state') === 'created' || draft.surveyQuestions !== null
  return (
    <Section icon={TARGET} title="Survey Settings" sub="Setup your survey for the participants" headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard title="Custom Survey Form" sub={made ? undefined : 'Make the input form for survey questions'}>
        {made ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              {draft.surveyQuestions?.length ?? 10} Questions
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


/** The four diary settings the frame fills, as a 2x2 of selects. */
const DIARY_FIELDS: { key: 'durationUnit' | 'frequency' | 'studyDuration' | 'minimumRequired'; label: string; note?: string }[] = [
  { key: 'durationUnit', label: 'Duration Unit' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'studyDuration', label: 'Study Duration', note: 'Total number of entries you need' },
  { key: 'minimumRequired', label: 'Minimum Required', note: 'To qualify for reward' },
]

/** Diary Study Settings (1518:94580): the schedule, then the study form. */
function DiarySettings() {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const made = params.get('state') === 'created'
  return (
    <Section icon={TARGET} title="Diary Study Settings" sub="Setup your Diary study for the participants" headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <div className="flex flex-col gap-3.5 rounded-lg bg-yellow-30 p-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-body-medium text-text-title">Diary Study Setup</span>
          <span className="text-text-regular text-text-subtitle">
            It start the counting of duration with set frequency from the time users logs(enters) their first entry
          </span>
        </span>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {DIARY_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-text-regular text-text-subtitle">{f.label}</span>
              <Select value={draft[f.key]} className="w-full" />
              {f.note && <span className="text-text-regular text-text-subtitle">{f.note}</span>}
            </label>
          ))}
        </div>

        <span className="border-t-1 border-[#f2e3cc]" />

        <span className="flex flex-col gap-0.5">
          <span className="text-body-medium text-text-title">Create Study Form</span>
          {!made && (
            <span className="text-text-regular text-text-subtitle">
              Make the input form for diary questions on every selected duration unit
            </span>
          )}
        </span>

        {made ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              5 questions, 5 days logs
              <ChevronRight className="h-4 w-4 text-text-subtitle" />
            </button>
            <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => set('surveyOpen', true)}>Update Diary Questionnaire</Button>
          </>
        ) : (
          <Button size="none" className="h-12 w-full text-body-medium"
            disabled={draft.surveyOpen || params.get('state') === 'building'}
            onClick={() => set('surveyOpen', true)}>Create Survey Questionnaire</Button>
        )}
      </div>
    </Section>
  )
}


/** Video Call Settings (1518:92729 individual, 1518:93335 group). */
function VideoSettings({ group, open }: { group: boolean; open: boolean }) {
  const { set } = useDraft()
  return (
    <Section icon={TARGET}
      title={group ? 'Focus Group Video Call Settings' : 'Video Call Settings'}
      sub={group ? 'Setup scheduler for group video call for the participants' : 'Setup scheduler for individual 1:1 video call for the participants'}
      headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard
        title={group ? 'Set Availability for Group sessions' : 'Set Availability'}
        sub="Set your availability to allow participants to book sessions with you and let you conduct your individual video calls with them at your convenient timings">
        <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" disabled={open}
          onClick={() => set('surveyOpen', true)}>Set Timing Availability</Button>
      </SettingsCard>
    </Section>
  )
}


/** In-Person Interiew Settings (1518:93678), the frame's own spelling. */
function InPersonSettings({ group, open }: { group: boolean; open: boolean }) {
  const { set } = useDraft()
  const [params] = useSearchParams()
  const saved = params.get('state') === 'created'
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
              {group ? '2 sessions, 10 seats per sessions, 1 address' : '2 addresses, available 5 days/week, custom timings, 2 days overrides'}
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
  if (type === 'diary') return <DiarySettings />
  if (type === 'video_call') return <VideoSettings group={group} open={open} />
  if (type === 'in_person') return <InPersonSettings group={group} open={open} />
  return null
}

/**
 * 2.1.3 Study setup, the one step where the four types differ. Survey
 * (1518:91922 / 91779 / 92064) is three states of this screen: the
 * questionnaire still to make, made, and the composer open beside it.
 */
export default function StudySetup() {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const type = params.get('type') ?? draft.type
  const group = params.get('group') === '1' || (type === 'video_call' ? draft.groupVideo : draft.groupInPerson)
  const open = draft.surveyOpen || params.get('state') === 'building'

  return (
    <CreateShell step="study" action={
      <>
        <Button variant="tertiary" size="row">Save Draft &amp; Exit</Button>
        <Button size="row" disabled>Proceed to Publish</Button>
      </>
    }>
      <div className={`rounded-lg bg-bg-0 px-6 pt-[9px] ${type === 'diary' ? 'min-h-[1707px]' : type === 'video_call' ? (open ? 'min-h-[1408px]' : 'min-h-[1374px]') : type === 'in_person' ? (open ? (group ? 'min-h-[1408px]' : 'min-h-[1579px]') : 'min-h-[1374px]') : 'min-h-[1302px]'}`}>
        {open ? (
          <div className="flex items-start gap-6 pb-6">
            {type === 'video_call' || type === 'in_person' ? (
              <AvailabilityComposer group={group} address={type === 'in_person'}
                title={type === 'in_person' && !group ? 'Set Address & Availability' : 'Set Availability'}
                onBack={() => set('surveyOpen', false)} onSubmit={() => set('surveyOpen', false)} />
            ) : type === 'diary' ? (
              <SurveyComposer title="Create Diary Form" submit="Submit Diary Form" dayGroup="DAY 1"
                lead="Setup your form inputs form for users with AI or manually" kind="Multi-line input" seed={2}
                onSubmit={() => { set('surveyQuestions', SEED_SURVEY); set('surveyOpen', false) }}
                onBack={() => set('surveyOpen', false)} />
            ) : (
              <SurveyComposer
                onSubmit={() => { set('surveyQuestions', SEED_SURVEY); set('surveyOpen', false) }}
                onBack={() => set('surveyOpen', false)} />
            )}
            <div className="flex w-[488px] shrink-0 flex-col">
              <TypeSettings type={type} group={group} open={open} />
              <IncentivePayments />
              <CostingSummary />
              <Payment />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-[600px] flex-col">
            <TypeSettings type={type} group={group} open={open} />
            <IncentivePayments />
            <CostingSummary />
            <Payment />
          </div>
        )}
      </div>
    </CreateShell>
  )
}
