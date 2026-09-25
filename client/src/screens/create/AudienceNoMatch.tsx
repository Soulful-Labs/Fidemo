import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Close, Info, PoolIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import CreateShell from './CreateShell'
import { useToast } from '../../components/ui/Toast'
import Picker from '../../components/ui/Picker'

/** A form section heading: small green icon, title, and the line under it. */
function Section({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="flex border-b-1 border-stroke-1 px-2 py-5 last:border-b-0">
      <span className="w-5 shrink-0 text-brand-secondary">{icon}</span>
      <div className="flex-1 pr-[10px]">
        <div className="flex flex-col gap-0.5 pb-2.5">
          <h2 className="text-title-s text-text-title">{title}</h2>
          <p className="text-text-regular text-text-subtitle">{sub}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

/** A read-only field as the frame draws them: label above, value in the box. */
function Field({ label, value, placeholder, className }: { label: string; value?: string; placeholder?: string; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="flex h-input items-center rounded-sm border-1 border-stroke-input bg-bg px-4 text-body-regular text-text-title">
        {value ?? <span className="text-text-body">{placeholder}</span>}
      </span>
    </label>
  )
}

/** One bar of the tier distribution. */
function TierBar({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-text-regular text-text-subtitle">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-3">
        <span className="block h-full rounded-full" style={{ width: `${value}%`, background: colour }} />
      </span>
      <span className="w-10 shrink-0 text-right text-text-regular text-text-subtitle">{value}%</span>
    </div>
  )
}

/**
 * NO Matching Audience - New Study (1518:91273): the Create → Audience step
 * with the Participation Forecast showing "~0 eligible members" and the
 * "No matching respondents?" prompt with Contact Us.
 */
export default function AudienceNoMatch() {
  const toast = useToast()
  const nav = useNavigate()
  const [condition, setCondition] = useState('na')
  const [recent, setRecent] = useState('6 months')
  const [trust, setTrust] = useState('Select trust score')

  return (
    <CreateShell step="audience" action={
      <>
        <Button variant="tertiary" size="row" onClick={() => nav('/studies/drafts')}>Save Draft &amp; Exit</Button>
        <Button size="row" disabled onClick={() => nav('/studies/create/published')}>Publish Study</Button>
      </>
    }>
      <div className="flex items-start gap-12 rounded-lg bg-bg-0 p-6">
        <div className="flex w-[600px] shrink-0 flex-col">
          <div className="flex items-center justify-between gap-4 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 px-5 py-3.5">
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-2 text-body-medium text-text-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-text-title" aria-hidden="true">
                  <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                Generate with AI
              </p>
              <p className="text-text-regular text-text-subtitle">Set target audience base with AI using study context</p>
            </div>
            <Button variant="secondary" leftIcon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>} onClick={() => toast('Audience filled in')}>Fill with AI</Button>
          </div>

          <div className="flex flex-col">
          <Section icon={<PoolIcon className="h-5 w-5" />} title="Set Target Audience" sub="Who qualifies for this study">
            <div className="flex flex-col gap-3.5">
              <div className="rounded-md bg-bg-1 p-4">
                <Input label="Number of target participants" defaultValue="10" />
              </div>
              <Field label="Location" value="Worldwide" />
              <Field label="Gender" value="All Genders" />
              <Field label="Level of Education" value="Graduate or Bachelor's" />
              <div className="flex flex-col gap-2">
                <Field label="Age Range" value="2 range selected  •  Select age range..." />
                <div className="flex items-center gap-2">
                  {['18-20', '21-30'].map((a) => (
                    <span key={a} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bgAlt-2 px-3 text-label text-green-700">
                      {a}<Close className="h-3.5 w-3.5" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M12 3v4m0 0-2 3 2 11 2-11-2-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>}
            title="Work details" sub="Who qualifies for this study">
            <div className="flex flex-col gap-3.5">
              <Field label="Roles" placeholder="Choose job roles..." />
              <Field label="Work Functions" placeholder="Select job functions..." />
              <Field label="Industries" placeholder="Choose industry domains..." />
              <Field label="Organization size" placeholder="Choose company sizes..." />
            </div>
          </Section>

          <Section
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>}
            title="Set conditions to apply" sub="Allow participants to apply only if they meet the following criteria">
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-4 rounded-md bg-bg-1 p-4">
                {[
                  { key: 'na', label: 'N/A' },
                  { key: 'never', label: 'Has never participated in any study with Soulful Labs (You) before', sub: 'Turn this on to exclude people who have previously participated in your studies' },
                  { key: 'recent', label: 'Has not participated in a study with Soulful Labs (You) in the last' },
                ].map((o) => (
                  <label key={o.key} className="flex items-start gap-3">
                    <button type="button" role="radio" aria-checked={condition === o.key} onClick={() => setCondition(o.key)}
                      className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-1.5',
                        condition === o.key ? 'border-cta-primary' : 'border-neutral-1000')}>
                      {condition === o.key && <span className="h-2.5 w-2.5 rounded-full bg-cta-primary" />}
                    </button>
                    <span className="flex flex-col gap-1">
                      <span className="text-body-regular text-text-title">{o.label}</span>
                      {o.sub && <span className="text-text-regular text-text-subtitle">{o.sub}</span>}
                      {o.key === 'recent' && (
                        <span className="pt-1 inline-block">
                          <Picker value={recent} className="w-[150px]"
                            options={['3 months', '6 months', '12 months']} onPick={setRecent} />
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <Field label="Profile Tiers" placeholder="Select tiers..." />
              <div className="flex flex-col gap-1.5">
                <span className="text-text-regular text-text-subtitle">Trust Score</span>
                <Picker value={trust} options={['Any', '90 & above', '80 & above', '70 & above']}
                  onPick={setTrust} />
              </div>
            </div>
          </Section>
          </div>
        </div>

        <aside className="sticky top-[88px] w-[488px] shrink-0 rounded-lg border-1 border-stroke-input bg-bg-0">
          <h2 className="flex items-center gap-2 border-b-1 border-stroke-input px-5 py-4 text-body-medium text-text-title">
            Participation Forecast
            <Info className="h-4 w-4 text-text-body" />
          </h2>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-4 rounded-md bg-yellow-30 px-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-text-regular text-text-subtitle">
                  <PoolIcon className="h-4 w-4" />Estimated
                </span>
                <span className="text-title-l text-brand-primary">~0 <span className="text-text-regular text-text-subtitle">eligible members</span></span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-text-medium text-text-title">No matching respondents?</span>
                <Button size="sm" onClick={() => toast('Support request opened')}>Contact Us</Button>
              </div>
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
