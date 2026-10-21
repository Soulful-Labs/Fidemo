import { audienceFromPrompt } from '@shared/fromPrompt'
import { SKILLS, WORK_FUNCTIONS } from '@shared/platform'
import { AUDIENCE_LISTS, EXPERIENCE_RANGES, INCOME_RANGES } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input, { Select, TextArea } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Overlay'
import { Radio } from '../../../components/ui/controls'
import { AudienceIcon, FilterIcon, UsersIcon } from '../../../components/ui/icons'
import { AiCard, Labelled, MultiPick, Section } from './EditBits'
import type { SetForm } from './EditSteps'

const listOf = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean)
/** A comma list as picks, keeping any value typed before that is not on the list. */
const pickList = (base: readonly string[], v: string) => [...new Set([...base, ...listOf(v)])]
const counted = (one: string, many: string, verb = 'selected') => (n: number) => `${n} ${n === 1 ? one : many} ${verb}`

/**
 * Audience (2325:214318), in the Edit frame's order. The number of target
 * participants is shown and locked (decided 21 Oct 2026: no money field
 * changes on a live study); everything about who qualifies can change.
 * Fill with AI reads a description with the client's own reader and fills
 * what it names, never the number of participants.
 */
export default function AudienceStep({ form, set, company }: { form: StudyForm; set: SetForm; company: string }) {
  const [asking, setAsking] = useState(false)
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ filled: string[]; missing: string[] } | null>(null)
  const fill = () => {
    const made = audienceFromPrompt(text, form)
    const { participants, ...patch } = made.patch
    for (const [k, v] of Object.entries(patch)) set(k as keyof StudyForm, v as never)
    setResult({ filled: made.filled.filter((f) => !f.startsWith('Number of participants')), missing: participants ? [...made.missing, 'Number of participants (cannot change on a live study)'] : made.missing })
    setAsking(false)
  }
  return (
    <>
      <AiCard line="Set target audience base with AI using study context" action="Fill with AI" onAction={() => setAsking(true)}>
        {result && (
          <div className="flex flex-col gap-1 border-t-1 border-stroke-2 pt-3 text-text-regular" aria-live="polite">
            {result.filled.length > 0 && <p className="text-text-title">From your description: {result.filled.join('; ')}.</p>}
            {result.missing.length > 0 && <p className="text-text-subtitle">Not filled: {result.missing.join(', ')}.</p>}
          </div>
        )}
      </AiCard>
      <Section icon={<UsersIcon />} title="Set Target Audience" sub="Who qualifies for this study">
        <div className="flex flex-col gap-1 rounded-md bg-bg-1 p-4">
          <Input size="sm" label="Number of target participants" value={form.participants} disabled />
          <span className="text-text-regular text-text-subtitle">Cannot change on a live study</span>
        </div>
        <MultiPick label="Country" options={AUDIENCE_LISTS.countries} picked={form.countries} onChange={(v) => set('countries', v)} prompt="Choose country..." count={counted('country', 'countries')} />
        <MultiPick label="Gender" all="All Genders" chips={false} options={AUDIENCE_LISTS.gender} picked={form.gender} onChange={(v) => set('gender', v)} prompt="All Genders" />
        <MultiPick label="Level of Education" chips={false} options={AUDIENCE_LISTS.education} picked={form.education} onChange={(v) => set('education', v)} prompt="Any level" />
        <MultiPick label="Age Range" options={AUDIENCE_LISTS.ageRanges} picked={form.ageRanges} onChange={(v) => set('ageRanges', v)} prompt="Select age range..." count={counted('range', 'range')} />
        <MultiPick label="Ethnicity" options={AUDIENCE_LISTS.ethnicity} picked={form.ethnicity ?? []} onChange={(v) => set('ethnicity', v)} prompt="Select ethnicity..." count={counted('ethnicity', 'ethnicities')} />
        <MultiPick label="Area Type" options={AUDIENCE_LISTS.areaTypes} picked={form.areaTypes ?? []} onChange={(v) => set('areaTypes', v)} prompt="Select area type..." count={counted('type', 'types')} />
      </Section>
      <Section icon={<AudienceIcon />} title="Work details" sub="Who qualifies for this study">
        <MultiPick label="Work Functions" options={pickList(WORK_FUNCTIONS, form.functions)} picked={listOf(form.functions)} onChange={(v) => set('functions', v.join(', '))}
          prompt="Choose work functions..." count={counted('function', 'functions')} />
        <Labelled label="Roles">
          <Input size="sm" placeholder="e.g. General Doctor, Nutritionist" value={form.roles} onChange={(e) => set('roles', e.target.value)} />
          <span className="text-text-regular text-text-subtitle">Separate several with commas.</span>
        </Labelled>
        <MultiPick label="Skills" options={pickList(SKILLS, form.skills)} picked={listOf(form.skills)} onChange={(v) => set('skills', v.join(', '))}
          prompt="Choose skills..." count={counted('skill', 'skills', 'added')} />
        <MultiPick label="Industries" options={pickList(AUDIENCE_LISTS.industries, form.industries)} picked={listOf(form.industries)} onChange={(v) => set('industries', v.join(', '))}
          prompt="Choose industry domains..." count={counted('Industry', 'Industries', 'added')} />
        <MultiPick label="Experience" options={Object.keys(EXPERIENCE_RANGES)} picked={form.experience ?? []} onChange={(v) => set('experience', v)} prompt="Select experience range" count={counted('range', 'ranges', 'added')} />
        <MultiPick label="Household Income" options={Object.keys(INCOME_RANGES)} picked={form.income ?? []} onChange={(v) => set('income', v)} prompt="Select income range" count={counted('range', 'ranges', 'added')} />
      </Section>
      <Section icon={<FilterIcon />} title="Set conditions to apply" sub="Allow participants to apply only if they meet the following criteria">
        <div className="flex flex-col gap-3 rounded-md border-1 border-stroke-input p-4" role="radiogroup" aria-label="Conditions to apply">
          <Radio name="condition" checked={form.condition === 'na'} onChange={() => set('condition', 'na')} label="N/A" />
          <Radio name="condition" checked={form.condition === 'fresh'} onChange={() => set('condition', 'fresh')} label="Prefer fresh people" />
          <Radio name="condition" checked={form.condition === 'never'} onChange={() => set('condition', 'never')} label={`Has never participated in any study with ${company} before`} />
        </div>
        <Select size="sm" label="Profile Tiers" value={form.tiers || 'Any tier'} options={['Any tier', ...AUDIENCE_LISTS.tiers.filter(Boolean)]} onChange={(v) => set('tiers', v === 'Any tier' ? '' : v)} />
      </Section>
      <Modal open={asking} onClose={() => setAsking(false)} layout="titled" title="Fill with AI"
        footer={<><Button variant="secondary" onClick={() => setAsking(false)}>Cancel</Button><Button disabled={!text.trim()} onClick={fill}>Fill Audience</Button></>}>
        <TextArea size="sm" rows={5} label="Describe who this study is for: their job, industry, age and where they live." value={text} onChange={(e) => setText(e.target.value)} />
      </Modal>
    </>
  )
}

const TIERS = ['Silver', 'Gold', 'Platinum']
const ROWS = ['Average Score', 'Recommended Incentive', 'Estimated Time To Fill']

/**
 * Check Participation Forecast (2352:153937, 21 Oct 2026), as on the client's
 * Audience step. Everything under the contact box is a placeholder the frame
 * draws greyed: the Coming Soon pills, the tier bar at XX% and the three
 * figures. Nothing here reads data (PRD D34).
 */
export function ForecastPanel() {
  const nav = useNavigate()
  return (
    <aside className="sticky top-[94px] w-[488px] shrink-0 self-start rounded-lg border-1 border-stroke-2 bg-bg-0">
      <div className="flex h-[51px] items-center gap-2 border-b-1 border-stroke-1 px-4">
        <h2 className="text-body-medium text-text-subtitle">Check Participation Forecast</h2>
        <span className="flex h-7 items-center rounded-full bg-bgAlt-2 px-2.5 text-text-regular text-text-subtitle">Coming Soon</span>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col items-start gap-2 rounded-md bg-bg-1 p-4">
          <p className="text-text-medium leading-5 text-text-title">Want to check eligible participants matching to your criteria?</p>
          <Button size="md" className="px-3" onClick={() => nav('/support')}>Contact Us</Button>
        </div>
        <div className="rounded-lg border-1 border-stroke-1 p-4" aria-label="Tier distribution, coming soon">
          <div className="flex h-6 items-center justify-between">
            <span className="text-text-regular uppercase text-text-body">Tier Distribution</span>
            <span className="text-body-medium text-text-disabled">Coming Soon</span>
          </div>
          <div className="mt-2.5 flex h-4 gap-0.5 rounded-full border-1 border-stroke-1 p-[3px]" aria-hidden="true">
            <span className="w-[23%] rounded-full bg-stroke-input" />
            <span className="flex-1 rounded-full bg-stroke-input" />
            <span className="w-[23%] rounded-full bg-stroke-input" />
          </div>
          <div className="mt-3 grid grid-cols-3">
            {TIERS.map((t) => (
              <span key={t} className="flex items-center gap-1 text-text-regular text-text-disabled">
                <span className="h-3 w-3 rounded-full bg-stroke-input" />{t}<span className="pl-0.5">XX%</span>
              </span>
            ))}
          </div>
        </div>
        <dl className="flex flex-col">
          {ROWS.map((k) => (
            <div key={k} className="flex h-[37px] items-center justify-between border-b-1 border-stroke-1 last:border-b-0">
              <dt className="text-text-regular text-text-body">{k}</dt>
              <dd className="text-text-medium text-text-disabled">Coming Soon</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}
