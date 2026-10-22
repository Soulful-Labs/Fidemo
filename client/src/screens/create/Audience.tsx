import Button from '../../components/ui/Button'
import { PoolIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useDraft } from '../../mock/createStore'
import CreateShell, { useEditing } from './CreateShell'
import ListCriterion from './ListCriterion'
import { Chip, Field, Section, TextBox } from './CreateBits'
import { useToast } from '../../components/ui/Toast'
import Picker from '../../components/ui/Picker'
import { Fragment, useState } from 'react'
import PromptDialog from './PromptDialog'
import ForecastCard from '../../components/client/ForecastCard'
import { audienceFromPrompt } from '../../lib/fromPrompt'
import { AUDIENCE_OPTIONS } from './CreateBits'
import { tierOf } from '@shared/derive'
import { AUDIENCE_LISTS, EXPERIENCE_RANGES, INCOME_RANGES, audienceFault, educationOf, gendersOf } from '@shared/studyForm'
import { TIERS } from '@shared/rules'
import CheckPicker from '../../components/ui/CheckPicker'
import { SUPPORT_EMAIL, WORK_FUNCTIONS } from '@shared/platform'
import { GoldMark, PlatinumMark, SilverMark } from '../../components/ui/icons'
import type { StudyForm } from '@shared/studyForm'
import { useClient, usePlatform } from '../../platform'

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

type WorkField = 'functions' | 'industries' | 'roles' | 'experience' | 'income' | 'skills'
const CREATE_ORDER: WorkField[] = ['functions', 'industries', 'roles', 'experience', 'income', 'skills']
const EDIT_ORDER: WorkField[] = ['functions', 'roles', 'skills', 'industries', 'experience', 'income']

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
  const { draft, set } = useDraft()
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
  const client = useClient()
  const pool = state.people.filter((p) => p.status === 'active' && p.identity.state === 'verified')
  /** The share of the pool at these tiers, for the Profile Tiers lines. */
  const share = (ts: string[]) => pool.length ? Math.round((pool.filter((p) => ts.includes(tierOf(state, p.id))).length / pool.length) * 100) : 0
  const education = educationOf(draft)
  const genders = gendersOf(draft)
  const industries = draft.industries.split(',').map((x) => x.trim()).filter(Boolean)
  const noFunction = tried && !draft.functions.trim()
  const functions = draft.functions.split(',').map((x) => x.trim()).filter(Boolean)
  const tierPicks = draft.tiers.split(',').map((x) => x.trim()).filter((x) => ['Platinum', 'Gold', 'Silver'].includes(x))
  const noIndustry = tried && !draft.industries.trim()
  const check = () => { setTried(true); return audienceFault(draft) }
  const editing = useEditing()
  /** The Work details fields, keyed so each frame's order can be followed: Create (1518:91112) and Edit (1645:133969) draw them differently. */
  const work: Record<WorkField, React.ReactNode> = {
    functions: (
      <label className="flex flex-col gap-0.5">
        <span className="text-text-regular text-text-subtitle">{need('Work Function', true)}</span>
        {/* A dropdown of the work functions a participant picks from on their profile (22 Oct 2026; Figma draws no list), several allowed. */}
        <CheckPicker label="Work Function" value={functions.length ? functions.join(', ') : 'Select work functions...'}
          options={WORK_FUNCTIONS.map((w) => ({ value: w }))} picked={functions} onChange={(next) => set('functions', next.join(', '))} />
        {functions.length > 0 && (
          <span className="flex flex-wrap gap-2 pt-1.5">{functions.map((w) => <Chip key={w} onRemove={() => set('functions', functions.filter((x) => x !== w).join(', '))}>{w}</Chip>)}</span>
        )}
        <Help text="The area of work, not the job title. A product manager's work function is Product." error={noFunction ? 'Enter a work function, for example Product' : undefined} />
      </label>
    ),
    // Industries (15 Oct 2026): the drawn list, with its search, opens under the field. Typing still works.
    industries: (
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
    ),
    roles: (
      <label className="flex flex-col gap-0.5">
        <span className="text-text-regular text-text-subtitle">{need('Role', false)}</span>
        <TextBox value={draft.roles} placeholder="e.g. Product Manager" onChange={(v) => set('roles', v)} />
        <Help text="The job title. A product manager's role is Product Manager." />
      </label>
    ),
    // Experience and Household Income (19 Oct 2026): the drawn ranges; a participant matches when their own band overlaps.
    experience: (
    <ListCriterion label="Experience" options={Object.keys(EXPERIENCE_RANGES)} picked={draft.experience ?? []} one="range" many="ranges" verb="added"
      prompt="Select experience range" onChange={(next) => set('experience', next)} />
  ),
  income: (
    <ListCriterion label="Household Income" options={Object.keys(INCOME_RANGES)} picked={draft.income ?? []} one="range" many="ranges" verb="added"
      prompt="Select income range" onChange={(next) => set('income', next)} />
  ),
  skills: (
      <label className="flex flex-col gap-0.5">
        <span className="text-text-regular text-text-subtitle">{need('Skills', false)}</span>
        <TextBox value={draft.skills} placeholder="e.g. SQL, Figma" onChange={(v) => set('skills', v)} />
      </label>
    ),
  }

  return (
    <CreateShell step="audience" check={check}>
      {/* On wide screens the content and the forecast card sit side by side, centred together (22 Oct 2026). */}
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6 min-[1600px]:justify-center">
        <div className="flex w-[600px] shrink-0 flex-col">
          <div className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 px-5 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="flex items-center gap-2 text-text-medium text-text-title">
                  <span className="text-text-title">{SPARKLE}</span>Generate with AI
                </p>
                <p className="text-text-regular text-text-subtitle">Set target audience base with AI using study context</p>
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
                  {/* The USA only (22 Oct 2026, decided scope): the field shows it and offers nothing else. */}
                  <Field label="Country">
                    <Picker picked={[...AUDIENCE_OPTIONS.countries]} options={[...AUDIENCE_OPTIONS.countries]} value="1 country selected  •  USA only"
                      onPick={() => set('countries', [...AUDIENCE_OPTIONS.countries])} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    {AUDIENCE_OPTIONS.countries.map((c) => <Chip key={c}>{FLAG[c]}{c}</Chip>)}
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
                {/* Ethnicity and Area Type (21 Oct 2026): the lists a participant picks from on their profile, so a study only asks for what someone can give. */}
                <ListCriterion label="Ethnicity" options={AUDIENCE_LISTS.ethnicity} picked={draft.ethnicity ?? []} one="ethnicity" many="ethnicities"
                  prompt="Select ethnicity..." onChange={(next) => set('ethnicity', next)} />
                <ListCriterion label="Area Type" options={AUDIENCE_LISTS.areaTypes} picked={draft.areaTypes ?? []} one="type" many="types"
                  prompt="Select area type..." onChange={(next) => set('areaTypes', next)} />
              </div>
            </Section>

            <Section icon={TIE} title="Work details" sub="Who qualifies for this study" headPad="pb-[15px]">
              <div className="flex flex-col gap-3.5">
                {(editing ? EDIT_ORDER : CREATE_ORDER).map((k) => <Fragment key={k}>{work[k]}</Fragment>)}
                <p className="text-text-regular text-text-body">Separate several with commas.</p>
              </div>
            </Section>
            <Section icon={FUNNEL} title="Set conditions to apply" sub="Allow participants to apply only if they meet the following criteria" headPad="pb-[15px]">
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-4 rounded-md border-1 border-stroke-input bg-bg p-4">
                  {/* Two choices since 22 Oct 2026 (2354:155031): N/A, or never taken part with this client. */}
                  <Radio on={draft.condition !== 'never'} onClick={() => set('condition', 'na')} label="N/A" />
                  <Radio on={draft.condition === 'never'} onClick={() => set('condition', 'never')}
                    label={`Who has never participated in any study with ${client?.company || 'you'} (You) before`}
                    sub="Select this to exclude people who have previously participated in your studies" />
                </div>
                {/* Profile Tiers (22 Oct 2026): several tiers, shown as tags like the other multi-select fields. Each line
                    carries its icon, the Trust Score band and the share of the pool at that tier, counted from the pool. */}
                <div className="flex flex-col gap-2">
                  <Field label="Profile Tiers">
                    <CheckPicker label="Profile Tiers" all="Any" value={tierPicks.length ? tierPicks.map((t) => `${t} Tier`).join(', ') : 'Any tier'} picked={tierPicks}
                      onChange={(next) => set('tiers', next.filter((v) => v !== 'Any').join(', '))}
                      options={[
                        { value: 'Platinum', label: 'Platinum Tier', sub: `${TIERS.platinum}+ Trust score, ${share(['platinum'])}% of participants`, icon: <PlatinumMark className="h-6 w-6 text-tier-platinum" /> },
                        { value: 'Gold', label: 'Gold Tier', sub: `${TIERS.gold} to ${TIERS.platinum} Trust score, ${share(['gold'])}% of participants`, icon: <GoldMark className="h-6 w-6 text-tier-gold" /> },
                        { value: 'Silver', label: 'Silver Tier', sub: `${TIERS.silver} to ${TIERS.gold} Trust score, ${share(['silver'])}% of participants`, icon: <SilverMark className="h-6 w-6 text-tier-silver" /> },
                      ]} />
                  </Field>
                  {tierPicks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">{tierPicks.map((t) => <Chip key={t} onRemove={() => set('tiers', tierPicks.filter((x) => x !== t).join(', '))}>{t} Tier</Chip>)}</div>
                  )}
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* Contact Us writes to the team from the client's own mail app (22 Oct 2026); it does not raise a support ticket. */}
        <ForecastCard className="sticky top-[88px]" onContact={() => { window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Matching participants for ${draft.title.trim() || 'a new study'}`)}` }} />
      </div>
      <PromptDialog open={asking} onClose={() => setAsking(false)} onGenerate={generate} action="Fill Audience"
        lead="Describe your study: who you want to hear from (their job, industry, age, where they live) and what it is about." />
    </CreateShell>
  )
}
