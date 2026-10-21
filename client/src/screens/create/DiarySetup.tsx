import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { diaryMinimumFor, diaryWords } from '@shared/platform'
import { studySummary } from '@shared/studyForm'
import Button from '../../components/ui/Button'
import { ChevronRight, Edit } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'
import { Section } from './CreateBits'
import { SettingsCard } from './StudyBits'
import { Pick } from './Screener'

type Field = 'durationUnit' | 'frequency' | 'studyDuration' | 'minimumRequired'

/** The four diary settings the frame fills, as a 2x2 of selects. */
const DIARY_FIELDS: { key: Field; label: string; note?: string }[] = [
  { key: 'durationUnit', label: 'Duration Unit' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'studyDuration', label: 'Study Duration', note: 'Total number of entries you need' },
  { key: 'minimumRequired', label: 'Minimum Required', note: 'To qualify for reward' },
]

/**
 * What each diary field offers. The two counts are counts of entries, so they
 * are written in the unit an entry is (shared/platform.ts diaryWords). The
 * minimum offers only what the policy allows for the chosen duration: at
 * least 4 of every 5 entries, up to all of them (diaryMinimumFor).
 */
const diaryOptions = (unit: string, total: number): Record<Field, string[]> => {
  const u = diaryWords(unit).units
  const least = diaryMinimumFor(total)
  return {
    durationUnit: ['Hour', 'Day', 'Week'],
    frequency: ['Every day', 'Every 2 days', 'Every 3 days', 'Weekly'],
    studyDuration: [3, 5, 7, 14].map((n) => `${n} ${u}`),
    minimumRequired: Array.from({ length: total - least + 1 }, (_, i) => `${least + i} ${u}`),
  }
}

const count = (s: string, fallback: number) => Number.parseInt(s, 10) || fallback

/**
 * Diary Study Setup (2354:155489, 21 Oct 2026): the schedule, inside the
 * diary form since the 21 Oct frame. `onTotal` hears a new number of entries
 * first and may refuse it, so the day cards below never lose a written question.
 */
export function DiarySetupCard({ onTotal }: { onTotal: (total: number) => boolean }) {
  const { draft, set } = useDraft()
  const total = count(draft.studyDuration, 5)
  const options = diaryOptions(draft.durationUnit, total)
  const pick = (key: Field, v: string) => {
    if (key === 'studyDuration') {
      const next = count(v, 5), least = diaryMinimumFor(next), now = count(draft.minimumRequired, 0)
      if (!onTotal(next)) return
      set(key, v)
      // A shorter or longer diary moves the minimum to the policy's least for it, if it is now out of range.
      if (now < least || now > next) set('minimumRequired', `${least} ${diaryWords(draft.durationUnit).units}`)
      return
    }
    set(key, v)
    if (key !== 'durationUnit') return
    // Changing the unit rewrites the two counts in it: "5 days" becomes "5 weeks", the number kept.
    const u = diaryWords(v).units
    set('studyDuration', `${total} ${u}`)
    set('minimumRequired', `${count(draft.minimumRequired, 4)} ${u}`)
  }
  return (
    <div className="flex flex-col gap-4 rounded-lg border-1 border-stroke-1 bg-bg-1 p-4">
      <span className="flex flex-col gap-0.5">
        <span className="text-text-medium text-text-title">Diary Study Setup</span>
        <span className="text-text-regular text-text-subtitle">It start the counting of duration with set frequency from the time users logs(enters) their first entry</span>
      </span>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {DIARY_FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-text-regular text-text-subtitle">{f.label}</span>
            <Pick value={draft[f.key]} className="w-full" options={options[f.key]} onPick={(v) => pick(f.key, v)} />
            {f.note && <span className="pt-0.5 text-text-regular text-text-body">{f.note}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Diary Study Settings on the Study step (1518:94742, 21 Oct 2026). The
 * schedule now sits in the form itself, so the card only opens the form, or
 * reads it back once it is made.
 */
export function DiarySettings({ icon }: { icon: ReactNode }) {
  const { draft, set } = useDraft()
  const [params] = useSearchParams()
  const made = params.get('state') === 'created' || draft.tasksSubmitted
  return (
    <Section icon={icon} title="Diary Study Settings" sub="Setup your Diary study for the participants" headPad="pb-4" titleLead="leading-[22px]" pad="py-4">
      <SettingsCard titleClass="text-text-medium" title="Diary Study Setup" sub="It start the counting of duration with set frequency from the time users logs(enters) their first entry">
        <span className="flex flex-col gap-0.5">
          <span className="text-text-medium text-text-title">Create Study Form</span>
          {!made && <span className="text-text-regular text-text-subtitle">Make the input form for diary questions on every selected duration unit</span>}
        </span>
        {made ? (
          <>
            <button type="button" onClick={() => set('surveyOpen', true)}
              className="-mt-1 flex h-[38px] items-center justify-between gap-3 rounded-sm border-1 border-stroke-input bg-bg px-4 text-text-regular text-text-title">
              {studySummary(draft).value}
              <ChevronRight className="h-4 w-4 text-text-subtitle" />
            </button>
            <Button variant="secondary" size="none" className="h-12 w-full text-body-medium" leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => set('surveyOpen', true)}>Update Diary Questionnaire</Button>
          </>
        ) : (
          <Button size="none" className="h-12 w-full text-body-medium" disabled={draft.surveyOpen || params.get('state') === 'building'}
            onClick={() => set('surveyOpen', true)}>Create Survey Questionnaire</Button>
        )}
      </SettingsCard>
    </Section>
  )
}
