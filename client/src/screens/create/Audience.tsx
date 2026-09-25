import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { Info, PoolIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useDraft } from '../../mock/createStore'
import CreateShell from './CreateShell'
import { Chip, Field, Section, TextBox, TierBar } from './CreateBits'
import { useToast } from '../../components/ui/Toast'

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

/**
 * 2.1.1 Audience, New Study (1622:81615): who qualifies, with the
 * Participation Forecast beside it. The no-match state of this same step is
 * drawn separately at 1518:91273 and disagrees on several fields; see
 * client/CLAUDE.md.
 */
export default function Audience() {
  const toast = useToast()
  const { draft, set } = useDraft()

  return (
    <CreateShell step="audience">
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col">
          <div className="flex items-center justify-between gap-4 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 px-5 py-3.5">
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-2 text-body-medium text-text-title">
                <span className="text-text-title">{SPARKLE}</span>Generate with AI
              </p>
              <p className="text-text-regular text-text-subtitle">Set target audience base with AI using study context</p>
            </div>
            <Button variant="secondary" leftIcon={SPARKLE} onClick={() => toast('Audience filled in')}>Fill with AI</Button>
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
                    <Select value={`${draft.countries.length} countries selected  •  Choose country...`} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    {draft.countries.map((c) => (
                      <Chip key={c} onRemove={() => set('countries', draft.countries.filter((x) => x !== c))}>
                        {FLAG[c]}{c}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Field label="Gender"><Select value={draft.gender} /></Field>
                <Field label="Level of Education"><Select value={draft.education} /></Field>

                <div className="flex flex-col gap-2">
                  <Field label="Age Range">
                    <Select value={`${draft.ageRanges.length} range selected  •  Select age range...`} />
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
                <Field label="Roles"><TextBox value={draft.roles} placeholder="Choose job roles..." onChange={(v) => set('roles', v)} /></Field>
                <Field label="Work Functions"><TextBox value={draft.functions} placeholder="Select job functions..." onChange={(v) => set('functions', v)} /></Field>
                <Field label="Skills"><TextBox value={draft.skills} placeholder="Choose skills..." onChange={(v) => set('skills', v)} /></Field>
                <Field label="Industries"><TextBox value={draft.industries} placeholder="Choose industry domains..." onChange={(v) => set('industries', v)} /></Field>
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
                <Field label="Profile Tiers">
                  <TextBox value={draft.tiers} placeholder="Select tiers..." onChange={(v) => set('tiers', v)} />
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
            <div className="flex flex-col gap-1 rounded-md bg-yellow-30 px-4 py-4">
              <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
                <PoolIcon className="h-4 w-4" />Estimated
              </span>
              <span className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-brand-primary">
                ~1.5K <span className="text-body-regular font-normal text-text-subtitle">eligible members</span>
              </span>
            </div>

            <div className="flex flex-col gap-3 rounded-md border-1 border-stroke-input p-4">
              <span className="text-label uppercase tracking-wide text-text-body">Tier Distribution</span>
              <TierBar label="Silver" value={50} colour="#7f9ab0" />
              <TierBar label="Gold" value={42} colour="#f2c200" />
              <TierBar label="Platinum" value={8} colour="#9139f6" />
            </div>

            <dl className="flex flex-col">
              {[['Average Score', '86%'], ['Recommended Incentive', '$100-200'], ['Estimated Time To Fill', '15-20 days']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b-1 border-stroke-input py-2 last:border-b-0">
                  <dt className="text-text-regular text-text-subtitle">{k}</dt>
                  <dd className="text-text-medium text-text-title">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </CreateShell>
  )
}
