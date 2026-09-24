import { useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ChevronRight, Edit } from '../../components/ui/icons'
import { blankQuestion, useDraft } from '../../mock/createStore'
import CreateShell from './CreateShell'
import { Section } from './CreateBits'
import { CostingSummary, IncentivePayments, Payment, SettingsCard } from './StudyBits'
import SurveyComposer from './SurveyComposer'

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
    <Section icon={TARGET} title="Survey Settings" sub="Setup your survey for the participants" headPad="pb-4" pad="py-4">
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

/**
 * The settings section for whichever type the draft chose on step 1. `?type=`
 * overrides it so each variant can be opened and compared on its own.
 */
function TypeSettings({ type }: { type: string }) {
  if (type === 'survey') return <SurveySettings />
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
  const open = (draft.surveyOpen || params.get('state') === 'building') && type === 'survey'

  return (
    <CreateShell step="study" action={
      <>
        <Button variant="tertiary" size="row">Save Draft &amp; Exit</Button>
        <Button size="row" disabled>Proceed to Publish</Button>
      </>
    }>
      <div className="min-h-[1302px] rounded-lg bg-bg-0 px-6 pt-[9px]">
        {open ? (
          <div className="flex items-start gap-6 pb-6">
            <SurveyComposer
              onSubmit={() => { set('surveyQuestions', SEED_SURVEY); set('surveyOpen', false) }}
              onBack={() => set('surveyOpen', false)} />
            <div className="flex w-[488px] shrink-0 flex-col">
              <TypeSettings type={type} />
              <IncentivePayments />
              <CostingSummary />
              <Payment />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-[600px] flex-col">
            <TypeSettings type={type} />
            <IncentivePayments />
            <CostingSummary />
            <Payment />
          </div>
        )}
      </div>
    </CreateShell>
  )
}
