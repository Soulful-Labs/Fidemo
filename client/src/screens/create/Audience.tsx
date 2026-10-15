import Button from '../../components/ui/Button'
import { Info, PoolIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useDraft } from '../../mock/createStore'
import CreateShell from './CreateShell'
import { Chip, Field, Section, TextBox, TierBar } from './CreateBits'
import { useToast } from '../../components/ui/Toast'
import Picker from '../../components/ui/Picker'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PromptDialog from './PromptDialog'
import { audienceFromPrompt } from '../../lib/fromPrompt'
import { AUDIENCE_OPTIONS } from './CreateBits'
import { cohort, poolPerson } from '@shared/derive'
import { audienceFault, audiencePeople, educationOf, gendersOf } from '@shared/studyForm'
import { TIERS } from '@shared/rules'
import CheckPicker from '../../components/ui/CheckPicker'
import { GoldMark, PlatinumMark, SilverMark } from '../../components/ui/icons'
import type { StudyForm } from '@shared/studyForm'
import { usePlatform } from '../../platform'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)
const TIE = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M12 3v4m0 0-2 3 2 11 2-11-2-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
const FUNNEL = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const FLAG: Record<string, React.ReactNode> = {
  'United States of America': (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="10" fill="#f0f0f0" />
      <path d="M10 0a10 10 0 0 0-10 10h20A10 10 0 0 0 10 0Z" fill="#f0f0f0" />
      <g fill="#d80027">
        <rect y="3" width="20" height="1.6" /><rect y="6.2" width="20" height="1.6" />
        <rect y="9.4" width="20" height="1.6" /><rect y="12.6" width="20" height="1.6" />
        <rect y="15.8" width="20" height="1.6" />
      </g>
      <path d="M10 0a10 10 0 0 0-10 10h10V0Z" fill="#2e52b2" />
    </svg>
  ),
  'United Kingdom': (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="10" fill="#f0f0f0" />
      <path d="M2 4 18 16M18 4 2 16" stroke="#d80027" strokeWidth="2.2" />
      <path d="M10 0v20M0 10h20" stroke="#f0f0f0" strokeWidth="5" />
      <path d="M10 0v20M0 10h20" stroke="#d80027" strokeWidth="3" />
    </svg>
  ),
}

/** The radio the conditions box is built from. */
function Radio({ on, onClick, label, sub }: { on: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <label className="flex items-start gap-3">
      <button type="button" role="radio" aria-checked={on} onClick={onClick}
        className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5',
          on ? 'border-cta-primary' : 'border-neutral-1000')}>
        {on && <span className="h-2.5 w-2.5 rounded-full bg-cta-primary" />}
      </button>
      <span className="flex flex-col gap-1">
        <span className="text-body-regular text-text-title">{label}</span>
        {sub && <span className="text-text-regular text-text-subtitle">{sub}</span>}
      </span>
    </label>
  )
}

/** One requirement label: the field name, then "required" or "optional" in the quieter colour. */
const need = (name: string, required: boolean) => (
  <>{name} <span className="text-text-body">({required ? 'required' : 'optional'})</span></>
)

/** A field's helper line, and under it its error once Continue has been pressed with it empty. */
function Help({ text, error }: { text: string; error?: string }) {
  return (
    <>
      {text && <span className="pt-1 text-text-regular text-text-subtitle">{text}</span>}
      {error && <span className="pt-0.5 text-text-regular text-red-600">{error}</span>}
    </>
  )
}

/**
 * 2.1.1 Audience, New Study (1622:81615): who qualifies, with the
 * Participation Forecast beside it. Level of Education takes several levels.
 * Work Function and Industry are required; Role and Skills are optional.
 * Generate with AI asks the client to describe the study and fills the step
 * from what they typed (lib/fromPrompt.ts). The no-match state (1518:91273)
 * is this same step when the forecast reaches zero.
 */
export default function Audience() {
  const toast = useToast()
  const navigate = useNavigate()
  const { draft, set, form } = useDraft()
  const [asking, setAsking] = useState(false)
  /** What the last Generate filled, and what the text did not mention, shown under the card. */
  const [result, setResult] = useState<{ filled: string[]; missing: string[] } | null>(null)
  /** Continue was pressed with a required field empty: the fields say which. */
  const [tried, setTried] = useState(false)
  const generate = (text: string) => {
    const made = audienceFromPrompt(text, draft)
    for (const [k, v] of Object.entries(made.patch)) set(k as keyof StudyForm, v as never)
    setResult({ filled: made.filled, missing: made.missing })
    toast(made.filled.length ? `Filled ${made.filled.length} field${made.filled.length === 1 ? '' : 's'} from your description` : 'Nothing in your description matched these fields')
  }
  /** The people on the platform who fit what is entered on this step, so the forecast moves with it. */
  const state = usePlatform()
  const fit = cohort(audiencePeople(state, form()).map((p) => poolPerson(state, p)))
  const tier = (t: string) => fit.tiers.find((x) => x.tier === t)?.pct ?? 0
  /** Fewer people fit the audience than the study asks for. */
  const insufficient = fit.count < Math.max(1, Number(draft.participants) || 0)
  const education = educationOf(draft)
  const genders = gendersOf(draft)
  const industries = draft.industries.split(',').map((x) => x.trim()).filter(Boolean)
  const noFunction = tried && !draft.functions.trim()
  const noIndustry = tried && !draft.industries.trim()
  const check = () => { setTried(true); return audienceFault(draft) }

  return (
    <CreateShell step="audience" check={check}>
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col">
          <div className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 px-5 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="flex items-center gap-2 text-body-medium text-text-title">
                  <span className="text-text-title">{SPARKLE}</span>Generate with AI
                </p>
                <p className="text-text-regular text-text-subtitle">Describe your study and who you want to hear from; the audience is filled from it</p>
              </div>
              <Button variant="secondary" leftIcon={SPARKLE} onClick={() => setAsking(true)}>Fill with AI</Button>
            </div>
            {result && (
              <div className="flex flex-col gap-1 border-t-1 border-stroke-2 pt-3 text-text-regular" aria-live="polite">
                {result.filled.length > 0 && <p className="text-text-title">From your description: {result.filled.join('; ')}.</p>}
                {result.missing.length > 0 && <p className="text-text-subtitle">Not in your description, so left as they were: {result.missing.join(', ')}.</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <Section icon={<PoolIcon className="h-5 w-5" />} title="Set Target Audience" sub="Who qualifies for this study" headPad="pb-[15px]">
              <div className="flex flex-col gap-3.5">
                <div className="rounded-md bg-bg-1 p-4">
                  <Field label="Number of target participants" className="gap-1">
                    <TextBox value={draft.participants} onChange={(v) => set('participants', v)} />
                  </Field>
                </div>

                <div className="flex flex-col gap-2">
                  <Field label="Country">
                    <Picker multiple picked={draft.countries} options={AUDIENCE_OPTIONS.countries}
                      value={`${draft.countries.length} countries selected  •  Choose country...`}
                      onPick={(v) => set('countries', draft.countries.includes(v)
                        ? draft.countries.filter((x) => x !== v) : [...draft.countries, v])} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.countries.map((c) => (
                      <Chip key={c} onRemove={() => set('countries', draft.countries.filter((x) => x !== c))}>
                        {FLAG[c]}{c}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Genders (15 Oct 2026): several can be ticked; "All Genders" clears the rest. */}
                <Field label="Gender">
                  <CheckPicker label="Gender" all="All Genders" value={genders.length ? genders.map((g) => (g === 'Other' ? 'Others' : g)).join(', ') : 'All Genders'}
                    options={AUDIENCE_OPTIONS.gender.map((g) => ({ value: g, label: g === 'Other' ? 'Others' : g }))}
                    picked={genders} onChange={(next) => set('gender', next.length ? next : ['All Genders'])} />
                </Field>
                {/* Education (15 Oct 2026): a dropdown of checkboxes; several levels can be ticked, "All" means any. */}
                <Field label="Level of Education">
                  <CheckPicker label="Level of Education" all="All" value={education.length ? education.join(', ') : 'All'}
                    options={AUDIENCE_OPTIONS.education.map((e) => ({ value: e }))} picked={education} onChange={(next) => set('education', next)} />
                </Field>

                <div className="flex flex-col gap-2">
                  <Field label="Age Range">
                    <CheckPicker label="Age Range" all="All" picked={draft.ageRanges} options={AUDIENCE_OPTIONS.ageRanges.map((a) => ({ value: a }))}
                      value={`${draft.ageRanges.length} range selected  •  Select age range...`} onChange={(next) => set('ageRanges', next)} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.ageRanges.map((a) => (
                      <Chip key={a} onRemove={() => set('ageRanges', draft.ageRanges.filter((x) => x !== a))}>{a}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section icon={TIE} title="Work details" sub="Who qualifies for this study" headPad="pb-[15px]">
              <div className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-subtitle">{need('Work Function', true)}</span>
                  <TextBox value={draft.functions} placeholder="e.g. Product, Engineering, Marketing" onChange={(v) => set('functions', v)}
                    className={noFunction ? 'border-red-600' : undefined} />
                  <Help text="The area of work, not the job title. A product manager's work function is Product." error={noFunction ? 'Enter a work function, for example Product' : undefined} />
                </label>
                {/* Industries (15 Oct 2026): the drawn list, with its search, opens under the field. Typing still works. */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-subtitle">{need('Industry', true)}</span>
                  <CheckPicker label="Industries" search="Search your industry..." value={draft.industries}
                    options={AUDIENCE_OPTIONS.industries.map((i) => ({ value: i }))} picked={industries}
                    onChange={(next) => set('industries', next.join(', '))}
                    field={(open) => (
                      <span onFocus={open} onClick={open}>
                        <TextBox value={draft.industries} placeholder="e.g. Healthcare, Finance" onChange={(v) => set('industries', v)}
                          className={noIndustry ? 'border-red-600' : undefined} />
                      </span>
                    )} />
                  {noIndustry && <Help text="" error="Enter an industry, for example Healthcare" />}
                </div>
                <label className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-subtitle">{need('Role', false)}</span>
                  <TextBox value={draft.roles} placeholder="e.g. Product Manager" onChange={(v) => set('roles', v)} />
                  <Help text="The job title. A product manager's role is Product Manager." />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-text-regular text-text-subtitle">{need('Skills', false)}</span>
                  <TextBox value={draft.skills} placeholder="e.g. SQL, Figma" onChange={(v) => set('skills', v)} />
                </label>
                <p className="text-text-regular text-text-body">Separate several with commas.</p>
              </div>
            </Section>
            <Section icon={FUNNEL} title="Set conditions to apply" sub="Allow participants to apply only if they meet the following criteria" headPad="pb-[15px]">
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-4 rounded-md border-1 border-stroke-input bg-bg p-4">
                  <Radio on={draft.condition === 'na'} onClick={() => set('condition', 'na')} label="N/A" />
                  {/* The signed policy's guardrail, and workflow step 57, give a
                      study three repeat rules: allow them, prefer fresh people,
                      or exclude anyone who has taken part before. The frame draws
                      the first and the third; the middle one is the policy's own
                      wording, added here and flagged for the designer. */}
                  <Radio on={draft.condition === 'fresh'} onClick={() => set('condition', 'fresh')}
                    label="Prefer fresh people"
                    sub="Repeat participants are still matched, but ranked below people new to your studies" />
                  <Radio on={draft.condition === 'never'} onClick={() => set('condition', 'never')}
                    label="Has never participated in any study with Soulful Labs (You) before"
                    sub="Turn this on to exclude people who have previously participated in your studies" />
                </div>
                {/* Profile Tiers (15 Oct 2026): one choice, each with its icon and the Trust Score it means.
                    The drawn "top 10% / top 25% of participants" is left out: nothing measures it. */}
                <Field label="Profile Tiers">
                  <CheckPicker single label="Profile Tiers" value={draft.tiers || 'Select tiers...'} picked={[draft.tiers || 'Any tier']}
                    onChange={([v]) => set('tiers', !v || v === 'Any tier' ? '' : v)}
                    options={[
                      { value: 'Any tier', label: 'Any', sub: 'For all tiers' },
                      { value: 'Platinum only', label: 'Platinum Tier', sub: `${TIERS.platinum}+ Trust score`, icon: <PlatinumMark className="h-6 w-6 text-tier-platinum" /> },
                      { value: 'Gold and above', label: 'Gold Tier and above', sub: `${TIERS.gold}+ Trust score`, icon: <GoldMark className="h-6 w-6 text-tier-gold" /> },
                      { value: 'Silver and above', label: 'Silver Tier and above', sub: `${TIERS.silver}+ Trust score`, icon: <SilverMark className="h-6 w-6 text-tier-silver" /> },
                    ]} />
                </Field>
              </div>
            </Section>
          </div>
        </div>

        <aside className="sticky top-[88px] w-[488px] shrink-0 rounded-lg border-1 border-stroke-input bg-bg-0">
          <h2 className="flex items-center gap-2 border-b-1 border-stroke-input px-4 py-4 text-body-medium text-text-title">
            Participation Forecast
            <Info className="h-4 w-4 text-text-body" />
          </h2>

          <div className="flex flex-col gap-4 p-4">
            {/* Fewer people fit than the study needs: "Insufficient", with Contact Us beside it (NO Matching Audience, 15 Oct 2026). */}
            <div className="flex items-start justify-between gap-3 rounded-md bg-yellow-30 px-4 py-4">
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
                  <PoolIcon className="h-4 w-4" />Estimated
                </span>
                <span className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-brand-primary">
                  {insufficient ? 'Insufficient' : `~${fit.count.toLocaleString('en-US')}`} <span className="text-body-regular font-normal text-text-subtitle">eligible members</span>
                </span>
              </span>
              {insufficient && (
                <span className="flex flex-col items-end gap-2">
                  <span className="text-text-medium text-text-title">Insufficient participants?</span>
                  <Button size="sm" onClick={() => navigate('/help?panel=ask')}>Contact Us</Button>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-md border-1 border-stroke-input p-4">
              <span className="text-label uppercase tracking-wide text-text-body">Tier Distribution</span>
              <TierBar label="Silver" value={tier('silver')} colour="#7f9ab0" />
              <TierBar label="Gold" value={tier('gold')} colour="#f2c200" />
              <TierBar label="Platinum" value={tier('platinum')} colour="#9139f6" />
            </div>

            <dl className="flex flex-col">
              {[['Average Score', fit.count ? `${fit.averageScore}%` : 'N/A'], ['Recommended Incentive', '$100-200'], ['Estimated Time To Fill', insufficient ? 'N/A' : '15-20 days']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b-1 border-stroke-input py-2 last:border-b-0">
                  <dt className="text-text-regular text-text-subtitle">{k}</dt>
                  <dd className="text-text-medium text-text-title">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
      <PromptDialog open={asking} onClose={() => setAsking(false)} onGenerate={generate} action="Fill Audience"
        lead="Describe your study: who you want to hear from (their job, industry, age, where they live) and what it is about." />
    </CreateShell>
  )
}
