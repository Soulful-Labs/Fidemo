import { billing, studyById } from '@shared/derive'
import { money } from '@shared/format'
import { platform } from '@shared/store'
import { MARKS, TASK_MARKS, formFromStudy, studyDetails } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import Button from '../../../components/ui/Button'
import { ChevronRight } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { TEAM, say, usePlatform } from '../../../platform'
import { AboutStep, AudienceStep, Section } from './EditSteps'
import type { SetForm } from './EditSteps'
import QuestionsEditor from './QuestionsEditor'

const STEPS = [['about', 'About'], ['audience', 'Audience'], ['screener', 'Screener'], ['study', 'Study']] as const
type Step = (typeof STEPS)[number][0]

/**
 * Edit Study in the console (2325:214085, the client's steps in the console's
 * shell): the team changes a live study. About, Audience, Screener and Study,
 * then Publish (editLiveStudy), which ends on Changes Published. The type,
 * the incentive, the number of participants and anything people may have
 * booked are shown but cannot change (decided 21 Oct 2026); the store refuses
 * them too.
 */
export default function EditStudy() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const study = studyById(usePlatform(), id)!
  const [form, setForm] = useState<StudyForm>(() => formFromStudy(study))
  const set: SetForm = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  /** The survey opens as its drawn card; Edit Survey opens the builder. */
  const [composing, setComposing] = useState(false)
  const step = (STEPS.some(([k]) => k === params.get('step')) ? params.get('step') : 'about') as Step
  const publish = () => { if (say(platform().editLiveStudy(id, form, TEAM))) nav(`/studies/${id}/edit/done`) }
  const b = billing(study)
  const survey = study.type === 'survey' || study.type === 'diary'
  const deposit = study.payments.filter((x) => x.kind === 'deposit').reduce((s, x) => s + x.amount, 0)

  return (
    <AppShell className="pb-8"
      crumbs={[{ label: 'Edit Study', to: `/studies/${id}` }, { label: study.title.length > 32 ? `${study.title.slice(0, 31)}…` : study.title }]}
      centre={
        <ol className="flex items-center">
          {STEPS.map(([k, label], i) => (
            <li key={k} className="flex items-center">
              {i > 0 && <span className="h-px w-4 bg-stroke-input" />}
              <button type="button" onClick={() => setParams({ step: k }, { replace: true })}
                className={cn('flex h-7 items-center rounded-full px-3 text-text-medium', k === step ? 'bg-bgAlt-2 text-brand-secondary' : 'bg-bg-1 text-text-subtitle hover:text-text-title')}>{label}</button>
            </li>
          ))}
        </ol>
      }
      right={<><Button variant="secondary" size="md" onClick={() => nav(`/studies/${id}`)}>Cancel</Button><Button size="md" onClick={publish}>Publish</Button></>}>
      <div className="mx-auto w-[640px]">
        {step === 'about' && <AboutStep form={form} set={set} />}
        {step === 'audience' && <AudienceStep form={form} set={set} />}
        {step === 'screener' && (
          <Section title="Screening questions" sub="Use these questions to filter participants and identify who qualifies for this study.">
            <QuestionsEditor questions={form.questions} onChange={(q) => set('questions', q)}
              label={(i) => (i < 3 ? `Pre-screener - Q${i + 1}` : `Q${i + 1}`)} marks={(k) => MARKS[k] ?? []} />
          </Section>
        )}
        {step === 'study' && (
          <>
            {survey ? (
              <Section title={study.type === 'survey' ? 'Survey Settings' : 'Diary Study Settings'} sub="Setup your survey for the participants">
                {!composing ? (
                  <div className="flex flex-col gap-3 rounded-lg bg-yellow-30 p-4">
                    <span className="text-text-medium text-text-title">Custom Survey Form</span>
                    <button type="button" onClick={() => setComposing(true)} className="flex h-10 items-center justify-between rounded-md border-1 border-stroke-input bg-bg-0 px-3 text-text-regular text-text-title">
                      {form.tasks.filter((t) => t.text.trim()).length} Questions<ChevronRight className="h-4 w-4" />
                    </button>
                    <Button variant="secondary" size="md" onClick={() => setComposing(true)}>Edit Survey</Button>
                  </div>
                ) : (
                  <QuestionsEditor questions={form.tasks} onChange={(q) => setForm((f) => ({ ...f, tasks: q, tasksSubmitted: true }))}
                    label={(i) => (study.type === 'diary' ? `Q${i + 1}` : `SQ ${i + 1}`)} marks={() => TASK_MARKS} />
                )}
              </Section>
            ) : (
              <Section title="Availability" sub="People may already have booked these, so they cannot change on a live study">
                <dl className="flex flex-col gap-2">{studyDetails(form).map((r) => <div key={r.label} className="flex justify-between gap-4 text-text-regular"><dt className="text-text-subtitle">{r.label}</dt><dd className="text-right text-text-title">{r.value}</dd></div>)}</dl>
              </Section>
            )}
            <Section title="Incentive Payments" sub="The reward amount for each participant cannot change on a live study">
              <p className="flex h-12 items-center justify-between rounded-md bg-bg-1 px-3 text-text-regular text-text-subtitle">Incentive Amount<span className="text-body-medium text-text-title">{money(study.rates.incentivePer)}</span></p>
            </Section>
            <Section title="Costing Summary" sub={`${study.required}x participants  •  ${money(study.rates.incentivePer)} incentive`}>
              {b.estimate.lines.map((l) => <p key={l.label} className="flex justify-between text-text-regular text-text-title"><span>{l.label}{l.sub ? `  •  ${l.sub}` : ''}</span><span>{money(l.amount)}</span></p>)}
              <p className="flex justify-between border-t-1 border-stroke-1 pt-2 text-text-medium text-text-title"><span>Total Study Cost</span><span>{money(b.estimate.total)}</span></p>
            </Section>
            <Section title="Payment" sub="What the client has paid towards this study">
              <p className="flex justify-between text-text-regular text-text-title"><span>Incentive deposit</span><span>{money(deposit)}</span></p>
            </Section>
          </>
        )}
      </div>
    </AppShell>
  )
}
