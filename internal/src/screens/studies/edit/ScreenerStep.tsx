import { screenerFromPrompt } from '@shared/fromPrompt'
import { buildScreener } from '@shared/questions'
import { MARKS } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import { useState } from 'react'
import Button from '../../../components/ui/Button'
import { notice } from '../../../components/app/Notice'
import { ListIcon, PencilIcon, SparkleIcon } from '../../../components/ui/icons'
import { AiCard, Section } from './EditBits'
import type { SetForm } from './EditSteps'
import QuestionsEditor from './QuestionsEditor'

export const screenerLabel = (i: number) => (i < 3 ? `Pre-screener - Q${i + 1}` : `Q${i + 1}`)

/**
 * Screener (2325:214502): Generate adds questions written from what the team
 * types, Regenerate All replaces them, both with the client's own reader and
 * checked the way Publish checks them, so nothing half made is added. Then
 * the builder.
 */
export default function ScreenerStep({ form, set }: { form: StudyForm; set: SetForm }) {
  const [text, setText] = useState('')
  const generate = (all: boolean) => {
    const made = screenerFromPrompt(text, all ? 1 : form.questions.length + 1)
    if (!made.length) { notice('The text does not say what the study is about or who it is for, so nothing was generated'); return }
    const checked = buildScreener(made)
    if (!checked.ok) { notice(`Nothing was generated: ${checked.why}`); return }
    const next = (all ? made : [...form.questions, ...made]).map((q, i) => ({ ...q, label: screenerLabel(i) }))
    set('questions', next)
    notice(`${made.length} questions ${all ? 'written' : 'added'} from your text`)
  }
  return (
    <Section icon={<ListIcon />} title="Screening questions" sub="Use these questions to filter participants and identify who qualifies for this study. Click Preview to see how it will appear to participants.">
      <AiCard line="Let our AI-assitant generate questions">
        <div className="flex items-center gap-2">
          <Button size="md" leftIcon={<SparkleIcon className="h-4 w-4" />} disabled={!text.trim()} onClick={() => generate(false)}>Generate</Button>
          <Button variant="tertiary" size="md" leftIcon={<SparkleIcon className="h-4 w-4" />} disabled={!text.trim()} onClick={() => generate(true)}>Regenerate All</Button>
          <label className="flex h-[38px] flex-1 items-center gap-2 rounded-md border-1 border-stroke-input bg-bg-0 px-3">
            <PencilIcon className="h-4 w-4 shrink-0 text-text-subtitle" />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write - Tell AI what to do" aria-label="Tell AI what to do"
              className="min-w-0 flex-1 bg-transparent text-text-regular text-text-title outline-none placeholder:text-text-body" />
          </label>
        </div>
      </AiCard>
      <QuestionsEditor questions={form.questions} onChange={(q) => set('questions', q)} label={screenerLabel} marks={(k) => MARKS[k] ?? []} />
    </Section>
  )
}
