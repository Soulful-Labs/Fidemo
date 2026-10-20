import { TYPE_LABEL } from '@shared/studyForm'
import { AUDIENCE_LISTS, EXPERIENCE_RANGES, INCOME_RANGES, studyTypeOf } from '@shared/studyForm'
import type { StudyForm } from '@shared/studyForm'
import type { ReactNode } from 'react'
import Input, { Select, TextArea } from '../../../components/ui/Input'
import { CloseIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

const CONDITION: Record<StudyForm['condition'], string> = { na: 'N/A', fresh: 'Prefer fresh people', never: 'Has never participated in any study with this client before' }

const TYPES: [StudyForm['type'], string, string][] = [
  ['survey', 'Survey', 'Structured questionnaire with set questions for data at scale.'],
  ['video_call', 'Video Call', 'Live remote conversation using Zoom, Meet, or similar tools.'],
  ['in_person', 'In-Person', 'Face to face interview in a physical location.'],
  ['diary', 'Diary Study', 'Participants log experiences over time'],
]

export type SetForm = <K extends keyof StudyForm>(k: K, v: StudyForm[K]) => void

/** A block of a step: a green mark, its heading and line, then its fields. */
export function Section({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b-1 border-stroke-1 py-5 last:border-b-0">
      <div className="flex gap-2"><span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-brand-secondary" />
        <div><h2 className="text-title-s text-text-title">{title}</h2><p className="text-text-regular text-text-subtitle">{sub}</p></div></div>
      <div className="flex flex-col gap-3 pl-5">{children}</div>
    </section>
  )
}

/** Tick several of a list. `all` is the "any" word, which clears the rest. */
function Picks({ label, options, picked, onChange, all }: { label: string; options: readonly string[]; picked: string[]; onChange: (v: string[]) => void; all?: string }) {
  const flip = (o: string) => onChange(o === all ? [o] : picked.includes(o) ? picked.filter((x) => x !== o) : [...picked.filter((x) => x !== all), o])
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={picked.includes(o)} onClick={() => flip(o)}
            className={cn('flex h-8 items-center rounded-full border-1 px-3 text-text-regular', picked.includes(o) ? 'border-brand-primary bg-yellow-30 text-text-title' : 'border-stroke-input text-text-subtitle hover:text-text-title')}>{o}</button>
        ))}
      </div>
    </div>
  )
}

/**
 * About (2325:214086). The type is shown and cannot change on a live study,
 * as the frame says; the duration, end date, title, description and picture
 * can.
 */
export function AboutStep({ form, set }: { form: StudyForm; set: SetForm }) {
  return (
    <>
      <Section title="Select Study Type" sub="The study type cannot be changed after published">
        {TYPES.map(([key, label, sub]) => {
          const on = form.type === key
          return (
            <div key={key} aria-disabled="true" className={cn('flex flex-col gap-0.5 rounded-lg border-1 p-3', on ? 'border-stroke-input bg-bg-1' : 'border-stroke-1 opacity-60')}>
              <span className="text-body-medium text-text-title">{on ? TYPE_LABEL[studyTypeOf(form)] : label}</span>
              <span className="text-text-regular text-text-subtitle">{sub}</span>
            </div>
          )
        })}
      </Section>
      <Section title="Durations" sub="Set the estimated time duration to complete the study">
        <label className="flex flex-col gap-2 rounded-md bg-bg-1 p-3">
          <span className="flex justify-between text-text-regular text-text-subtitle">Duration<span className="text-text-title">{form.duration} mins</span></span>
          <input type="range" min={5} max={120} step={5} value={form.duration} aria-label="Duration" onChange={(e) => set('duration', Number(e.target.value))} className="accent-brand-primary" />
        </label>
        <Input size="sm" label="Study End Date (optional)" placeholder="DD / MM / YYYY" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
      </Section>
      <Section title="About Study" sub="What this study is about and your goals for it">
        <Input size="sm" label="Title of your study" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <TextArea size="sm" label="Tell us about your study" value={form.description} onChange={(e) => set('description', e.target.value)} />
        {form.image && (
          <div className="flex items-center gap-3 rounded-md border-1 border-stroke-input p-2">
            <img src={form.image} alt="" className="h-10 w-14 rounded-xs object-cover" />
            <span className="flex-1 truncate text-text-regular text-text-title">{form.thumbnail || 'Thumbnail image'}</span>
            <button type="button" aria-label="Remove thumbnail" onClick={() => { set('image', ''); set('thumbnail', '') }} className="text-text-subtitle hover:text-text-title"><CloseIcon className="h-4 w-4" /></button>
          </div>
        )}
      </Section>
    </>
  )
}

/** Audience (2325:214318). The number of participants is locked on a live study; who qualifies can change. */
export function AudienceStep({ form, set }: { form: StudyForm; set: SetForm }) {
  return (
    <>
      <Section title="Set Target Audience" sub="Who qualifies for this study">
        <Input size="sm" label="Number of target participants (cannot change on a live study)" value={form.participants} disabled />
        <Picks label="Country" options={AUDIENCE_LISTS.countries} picked={form.countries} onChange={(v) => set('countries', v)} />
        <Picks label="Gender" all="All Genders" options={AUDIENCE_LISTS.gender} picked={form.gender} onChange={(v) => set('gender', v)} />
        <Picks label="Level of Education" options={AUDIENCE_LISTS.education} picked={form.education} onChange={(v) => set('education', v)} />
        <Picks label="Age Range" options={AUDIENCE_LISTS.ageRanges} picked={form.ageRanges} onChange={(v) => set('ageRanges', v)} />
      </Section>
      <Section title="Work details" sub="Participant will be required to match at least one of below to apply">
        <Input size="sm" label="Work Functions" value={form.functions} onChange={(e) => set('functions', e.target.value)} />
        <Input size="sm" label="Industries" value={form.industries} onChange={(e) => set('industries', e.target.value)} />
        <Input size="sm" label="Roles" value={form.roles} onChange={(e) => set('roles', e.target.value)} />
        <Picks label="Experience" options={Object.keys(EXPERIENCE_RANGES)} picked={form.experience ?? []} onChange={(v) => set('experience', v)} />
        <Picks label="Household Income" options={Object.keys(INCOME_RANGES)} picked={form.income ?? []} onChange={(v) => set('income', v)} />
        <Input size="sm" label="Skills" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
      </Section>
      <Section title="Set conditions to apply" sub="Allow participants to apply only if they meet the following criteria">
        <Select size="sm" label="Condition" value={CONDITION[form.condition]} options={Object.values(CONDITION)}
          onChange={(v) => set('condition', (Object.keys(CONDITION) as StudyForm['condition'][]).find((k) => CONDITION[k] === v) ?? 'na')} />
        <Select size="sm" label="Profile Tiers" value={form.tiers || 'Any tier'} options={['Any tier', ...AUDIENCE_LISTS.tiers.filter(Boolean)]} onChange={(v) => set('tiers', v === 'Any tier' ? '' : v)} />
      </Section>
    </>
  )
}
