import { billing } from '@shared/derive'
import { money } from '@shared/format'
import { questionLines, surveyFromPrompt } from '@shared/fromPrompt'
import { depositParts } from '@shared/platform'
import { TASK_MARKS, blankQuestion, studyDetails } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import type { Study } from '@shared/types'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { notice } from '../../../components/app/Notice'
import Button, { IconButton } from '../../../components/ui/Button'
import { ChevronLeft, ChevronRight, ClipboardIcon, CoinIcon, ListIcon, PencilIcon, ReceiptIcon, SparkleIcon, UploadIcon } from '../../../components/ui/icons'
import { Range, Section } from './EditBits'
import QuestionsEditor from './QuestionsEditor'

const SCALE = ['$5', '$200', '$400', '$600', '$800', '$1K']

/**
 * Create Survey (2325:214997): the builder, opened from Edit Survey. The edit
 * is kept on this device as it is typed (Auto-saved); Submit Survey, or the
 * arrow, closes it. Upload File reads one question a line; Generate writes
 * questions from the text.
 */
function SurveyComposer({ form, setForm, label, onDone }: { form: StudyForm; setForm: (f: (f: StudyForm) => StudyForm) => void; label: (i: number) => string; onDone: () => void }) {
  const [text, setText] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const add = (made: StudyForm['tasks'], why: string) => {
    if (!made.length) { notice(why); return }
    setForm((f) => ({ ...f, tasks: [...f.tasks.filter((t) => t.text.trim()), ...made].map((q, i) => ({ ...q, label: label(i) })), tasksSubmitted: true }))
    notice(`${made.length} question${made.length === 1 ? '' : 's'} added`)
  }
  const kept = form.tasks.filter((t) => t.text.trim()).length
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-lg border-1 border-yellow-100 bg-bg-0 p-4">
      <div className="-mx-4 -mt-4 flex items-center gap-3 bg-yellow-30 px-4 py-3">
        <IconButton label="Back to Survey Settings" size={32} onClick={onDone}><ChevronLeft className="h-4 w-4" /></IconButton>
        <span className="flex-1 text-body-medium text-text-title">Create Survey</span>
        <span className="text-text-regular text-text-body">Auto-saved</span>
        <Button size="md" onClick={onDone}>Submit Survey</Button>
      </div>
      <p className="text-text-regular text-text-subtitle">Setup your survey inputs form here for users.</p>
      <div className="flex flex-col gap-3 rounded-md border-1 border-stroke-input bg-bg-1 p-3">
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Survey context or questions"
          placeholder="Enter survey context/questions or upload file to let our AI-assitant generate questions"
          className="resize-none bg-transparent text-text-regular text-text-title outline-none placeholder:text-text-body" />
        <div className="flex justify-between">
          <input ref={file} type="file" accept=".txt,.csv,text/plain,text/csv" className="hidden"
            onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) add(questionLines(await f.text()).map((t, i) => ({ ...blankQuestion(label(kept + i), 'Multi-line input'), text: t })), `${f.name} has no questions to read`) }} />
          <Button variant="tertiary" size="md" leftIcon={<UploadIcon className="h-4 w-4" />} onClick={() => file.current?.click()}>Upload File</Button>
          <Button variant="secondary" size="md" leftIcon={<SparkleIcon className="h-4 w-4" />} disabled={!text.trim()}
            onClick={() => add(surveyFromPrompt(text, label, kept + 1, () => TASK_MARKS), 'The text does not say what the survey is about, so nothing was generated')}>Generate</Button>
        </div>
      </div>
      <QuestionsEditor questions={form.tasks} onChange={(q) => setForm((f) => ({ ...f, tasks: q, tasksSubmitted: true }))} label={label} marks={() => TASK_MARKS} />
    </div>
  )
}

/**
 * Study (2325:214849). Survey and diary: Survey Settings, then the builder.
 * Session studies: their availability, shown and locked because people may
 * have booked it. Incentive, Costing Summary and Payment are drawn as on
 * Create but read only (decided 21 Oct 2026): a live edit changes no amount
 * and takes no payment. Every figure is the study's own.
 */
export default function StudyStep({ study, form, setForm, composing, setComposing }: {
  study: Study; form: StudyForm; setForm: (f: (f: StudyForm) => StudyForm) => void
  /** The builder is open: it takes the whole step, as Create Survey (2325:214997) draws it. */
  composing: boolean; setComposing: (v: boolean) => void
}) {
  const survey = study.type === 'survey' || study.type === 'diary'
  const label = (i: number) => (study.type === 'diary' ? `Q${i + 1}` : `SQ ${i + 1}`)
  const b = billing(study)
  const paid = study.payments.filter((x) => x.kind === 'deposit').reduce((s, x) => s + x.amount, 0)
  const part = depositParts(study.rates, study.required)
  const incentive = study.rates.incentivePer
  if (composing && survey) return <SurveyComposer form={form} setForm={setForm} label={label} onDone={() => setComposing(false)} />
  return (
    <>
      {survey ? (
        <Section icon={<ClipboardIcon />} title={study.type === 'survey' ? 'Survey Settings' : 'Diary Study Settings'} sub="Setup your survey for the participants">
          {(
            <div className="flex flex-col gap-3 rounded-lg bg-yellow-30 p-4">
              <span className="text-text-medium text-text-title">Custom Survey Form</span>
              <button type="button" onClick={() => setComposing(true)} className="flex h-10 items-center justify-between rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title">
                {form.tasks.filter((t) => t.text.trim()).length} Questions<ChevronRight className="h-4 w-4" />
              </button>
              <Button size="lg" variant="secondary" leftIcon={<PencilIcon className="h-4 w-4" />} onClick={() => setComposing(true)}>Edit Survey</Button>
            </div>
          )}
        </Section>
      ) : (
        <Section icon={<ClipboardIcon />} title="Availability" sub="People may already have booked these, so they cannot change on a live study">
          <dl className="flex flex-col gap-2">{studyDetails(form).map((r) => <div key={r.label} className="flex justify-between gap-4 text-text-regular"><dt className="text-text-subtitle">{r.label}</dt><dd className="text-right text-text-title">{r.value}</dd></div>)}</dl>
        </Section>
      )}
      <Section icon={<CoinIcon />} title="Incentive Payments" sub="Set the reward payment amount for each participant in your study.">
        <div className="flex items-center justify-between">
          <span className="text-text-regular text-text-subtitle">Incentive Amount</span>
          <span className="flex h-10 min-w-20 items-center rounded-md border-1 border-stroke-input bg-bg-1 px-3 text-text-regular text-text-title">{money(incentive)}</span>
        </div>
        <Range min={5} max={1000} value={Math.min(1000, incentive)} disabled label="Incentive amount, locked on a live study" />
        <div className="flex justify-between text-text-regular text-text-subtitle">{SCALE.map((s) => <span key={s}>{s}</span>)}</div>
        <p className="text-text-regular text-text-subtitle">Participants see this amount before applying. It cannot change on a live study.</p>
      </Section>
      <Section icon={<ListIcon />} title="Costing Summary" sub={`${study.required}x participants  •  ${money(incentive)} incentive`}>
        {b.estimate.lines.map((l) => <p key={l.label} className="flex justify-between border-b-1 border-stroke-1 pb-2 text-text-regular text-text-title"><span>{l.label}{l.sub ? `  •  ${l.sub}` : ''}</span><span>{money(l.amount)}</span></p>)}
        <p className="flex justify-between text-text-medium text-text-title"><span>Total Study Cost</span><span>{money(b.estimate.total)}</span></p>
      </Section>
      <Section icon={<ReceiptIcon />} title="Payment">
        <p className="text-text-regular text-text-title">This payment contributes towards the total project cost. <Link to={`/studies/${study.id}?tab=pay`} className="underline">See how costs are calculated.</Link></p>
        <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-3 text-text-regular text-text-title">
          <p className="flex justify-between"><span>Incentive deposit paid</span><span>{money(paid)}</span></p>
          <p className="flex justify-between text-text-medium"><span>To Pay</span><span>{money(0)}</span></p>
        </div>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-regular text-text-subtitle">
          <li>Editing a live study changes no amount and takes no payment.</li>
          <li>The remaining project costs ({money(Math.max(0, incentive * study.required - part.incentive))} for incentives and {money(Math.max(0, study.rates.recruitingPer * study.required - part.recruitment))} for recruitment) are billed as participants complete their sessions.</li>
          <li>Studies recruit until filled, or till the end date, or at most 60 days from publish.</li>
        </ul>
      </Section>
    </>
  )
}
