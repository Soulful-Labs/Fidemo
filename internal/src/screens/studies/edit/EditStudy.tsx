import { clientById, studyById } from '@shared/derive'
import { platform } from '@shared/store'
import { formFromStudy } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import Button from '../../../components/ui/Button'
import { AudienceIcon, ClipboardIcon, EyeIcon, InfoIcon, ScreenerIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { TEAM, say, usePlatform } from '../../../platform'
import AboutStep from './AboutStep'
import AudienceStep, { ForecastPanel } from './AudienceStep'
import type { SetForm } from './EditSteps'
import { PreviewPanel, ScreenerPreview, StudyPreview } from './Preview'
import ScreenerStep from './ScreenerStep'
import StudyStep from './StudyStep'

const STEPS = [['about', 'About', InfoIcon], ['audience', 'Audience', AudienceIcon], ['screener', 'Screener', ScreenerIcon], ['study', 'Study', ClipboardIcon]] as const
type Step = (typeof STEPS)[number][0]

/** The edit in progress, kept on this device so a reload loses nothing ("Auto-saved"). Every touch of storage is guarded: a blocked store just means no copy. */
const KEY = (id: string) => `fi-console-edit-${id}`
const kept = (id: string): StudyForm | undefined => { try { const v = localStorage.getItem(KEY(id)); return v ? (JSON.parse(v) as StudyForm) : undefined } catch { return undefined } }
const keep = (id: string, f?: StudyForm) => { try { if (f) localStorage.setItem(KEY(id), JSON.stringify(f)); else localStorage.removeItem(KEY(id)) } catch { /* nothing kept */ } }

/**
 * Edit Study in the console (2325:214085, redrawn by 21 Oct 2026): the team
 * changes a live study in four steps, About, Audience, Screener and Study,
 * then Publish (editLiveStudy), which ends on Changes Published. About and
 * Screener carry the participant preview, Audience the forecast. The type,
 * the incentive, the number of participants and anything people may have
 * booked are shown but locked (decided 21 Oct 2026); the store refuses them.
 */
export default function EditStudy() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const state = usePlatform()
  const study = studyById(state, id)!
  const [form, setForm] = useState<StudyForm>(() => kept(id) ?? formFromStudy(study))
  /** Collapsed until opened with Preview, as in the client app. */
  const [preview, setPreview] = useState(false)
  const [composing, setComposing] = useState(false)
  useEffect(() => keep(id, form), [id, form])
  const set: SetForm = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const step = (STEPS.some(([k]) => k === params.get('step')) ? params.get('step') : 'about') as Step
  const leave = () => { keep(id); nav(`/studies/${id}`) }
  const publish = () => { if (say(platform().editLiveStudy(id, form, TEAM))) { keep(id); nav(`/studies/${id}/edit/done`) } }
  const company = clientById(state, study.clientId)?.company ?? 'this client'
  const side = step === 'audience' ? <ForecastPanel />
    : step === 'study' ? null
    : preview ? <PreviewPanel onClose={() => setPreview(false)}>{(k) => (step === 'about' ? <StudyPreview key={k} study={study} form={form} /> : <ScreenerPreview key={k} questions={form.questions} />)}</PreviewPanel>
    : <Button variant="tertiary" size="md" className="self-start" leftIcon={<EyeIcon className="h-4 w-4" />} onClick={() => setPreview(true)}>Preview</Button>

  return (
    <AppShell className="pb-8"
      crumbs={[{ label: 'Edit Study', to: `/studies/${id}` }, { label: study.title.length > 32 ? `${study.title.slice(0, 31)}…` : study.title }]}
      centre={
        <ol className="flex items-center">
          {STEPS.map(([k, label, Icon], i) => (
            <li key={k} className="flex items-center">
              {i > 0 && <span className="h-px w-4 bg-stroke-input" />}
              <button type="button" aria-current={k === step ? 'step' : undefined} onClick={() => setParams({ step: k }, { replace: true })}
                className={cn('flex h-7 items-center gap-1 rounded-full px-3 text-text-regular', k === step ? 'bg-bgAlt-2 text-brand-secondary' : 'bg-bg-1 text-text-subtitle hover:text-text-title')}>
                <Icon className="h-4 w-4" />{label}
              </button>
            </li>
          ))}
        </ol>
      }
      right={<><Button variant="secondary" size="md" onClick={leave}>Cancel</Button><Button size="md" onClick={publish}>Publish</Button></>}>
      <div className={cn('flex items-start gap-12', step === 'study' && !composing && 'justify-center')}>
        <div className="flex w-[600px] shrink-0 flex-col">
          {step === 'about' && <AboutStep form={form} set={set} />}
          {step === 'audience' && <AudienceStep form={form} set={set} company={company} />}
          {step === 'screener' && <ScreenerStep form={form} set={set} />}
          {step === 'study' && <StudyStep study={study} form={form} setForm={setForm} composing={composing} setComposing={setComposing} />}
        </div>
        {side}
      </div>
    </AppShell>
  )
}
