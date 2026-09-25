import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Toggle from '../../components/ui/Toggle'
import { ChevronLeft, Close, Info, UsersIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { DiscardModal } from './PoolModals'
import { CRITERIA, FORECAST, FORECAST_BARS, POOL_FILTERS } from '../../mock/pool'

/** The live forecast beside the form; the tiers are bars here, not cards. */
function Forecast({ approx }: { approx?: boolean }) {
  return (
    <aside className="h-fit w-[496px] shrink-0 rounded-lg border-1 border-stroke-input">
      <p className="inline-flex items-center gap-2 px-4 py-4 text-title-s leading-[22px] text-text-title">
        {FORECAST.title} <Info className="h-4 w-4 text-text-subtitle" />
      </p>
      <div className="px-4">
        <div className="flex flex-col gap-1 rounded-md bg-yellow-30 px-4 py-4">
          <span className="inline-flex items-center gap-2 text-text-regular text-text-title">
            <UsersIcon className="h-4 w-4 text-text-subtitle" />{approx ? 'Estimated Approx.' : 'Estimated'}
          </span>
          <span className="text-title-l text-text-title">
            ~1.5K <span className="text-text-regular text-text-subtitle">
              {approx ? 'eligible respondents match criteria' : 'eligible members'}
            </span>
          </span>
        </div>
      </div>
      <div className="mx-4 mt-4 rounded-md border-1 border-stroke-input p-4">
        <p className="text-label uppercase tracking-[0.04em] text-text-body">TIER DISTRIBUTION</p>
        <div className="flex flex-col gap-3 pt-3">
          {FORECAST_BARS.map((t) => (
            <span key={t.label} className="flex items-center gap-4">
              <span className="w-[72px] shrink-0 text-text-regular text-text-title">{t.label}</span>
              <span className="h-1.5 flex-1 rounded-full bg-bg-3">
                <span className={cn('block h-full rounded-full', t.bar)} style={{ width: `${t.pct}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right text-text-regular text-text-title">{t.text}</span>
            </span>
          ))}
        </div>
      </div>
      <dl className="flex flex-col px-4 pb-1">
        {FORECAST.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 border-t-1 border-stroke-1 py-3">
            <dt className="text-text-regular text-text-subtitle">{r.label}</dt>
            <dd className="text-text-regular text-text-title">{r.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}

/** A radio row of the eligibility criteria, four across. */
function Row({ label, options, value }: { label: string; options: string[]; value: string }) {
  return (
    <div className="flex flex-col gap-3 border-b-1 border-stroke-1 pb-4 pt-4">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <div className="grid grid-cols-4">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-3 text-text-regular text-text-title">
            <span className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-1',
              o === value ? 'border-cta-primary' : 'border-cta-tertiaryStroke')}>
              {o === value && <span className="h-2.5 w-2.5 rounded-full bg-cta-primary" />}
            </span>
            {o}
          </label>
        ))}
      </div>
    </div>
  )
}

/** A select with its chosen chips under it. */
function Picked({ label, placeholder, chips }: { label: string; placeholder: string; chips: string[] }) {
  return (
    <div className="flex flex-col gap-2 border-b-1 border-stroke-1 pb-4 pt-4">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <Select value={placeholder} className="text-body-regular text-text-body" />
      <span className="flex flex-wrap gap-2 pt-1">
        {chips.map((c) => (
          <span key={c} className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-bgAlt-2 px-2 text-text-regular text-text-title">
            {c}<Close className="h-3.5 w-3.5 text-text-subtitle" />
          </span>
        ))}
      </span>
    </div>
  )
}

/**
 * Create Micro-panel (1645:162404 the form, 1645:162784 the forecast it
 * proceeds to) and Edit Micro-panel (1645:162594), which differs from Create
 * in 0.31% of pixels: the title, the prefilled name and the top-bar label.
 */
export default function CreatePanel({ edit }: { edit?: boolean }) {
  const [params, setParams] = useSearchParams()
  const step2 = params.get('step') === '2'
  const [discard, setDiscard] = useState(params.get('modal') === 'discard')
  const go = (v: string) => { const n = new URLSearchParams(params); n.set('step', v); setParams(n) }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Pool', to: '/pool?view=panels' }, { label: edit ? 'Edit Micro-panel' : 'Create Micro-panel' }]}
      action={
        <span className="flex items-center gap-3">
          <Button variant="tertiary" size="row" onClick={() => setDiscard(true)}>Cancel</Button>
          <Button size="row" onClick={() => go(step2 ? '1' : '2')}>{step2 ? 'Create Panel' : 'Proceed'}</Button>
        </span>
      }>
      <div className="min-h-[1316px] rounded-lg bg-bg-0 p-4">
        <div className="flex gap-12">
          {step2 ? (
            <div className="min-w-0 flex-1">
              <Button variant="secondary" size="none" className="h-10 px-4" onClick={() => go('1')}
                leftIcon={<ChevronLeft className="h-4 w-4" />}>
                <span className="text-body-medium">Edit Filters Crietria</span>
              </Button>
              <h2 className="pt-[18px] text-title-s leading-[22px] text-text-title">Your Micro-panel Forecast</h2>
              <p className="pt-1 text-text-regular text-text-subtitle">
                Review the predicted metrics for this cohort. Adjust any criteria before generating your spec
              </p>
              <div className="mt-4 rounded-lg border-1 border-stroke-input p-4">
                <p className="text-label uppercase tracking-[0.04em] text-text-body">ACTIVE CRITERIA SUMMARY</p>
                <div className="flex flex-wrap gap-2 pt-3">
                  {CRITERIA.map((c) => (
                    <span key={c.value} className="inline-flex h-8 items-center gap-1.5 rounded-full border-1 border-stroke-input px-3 text-text-regular text-text-title">
                      {c.pin && <span className="text-text-subtitle">&#9679;</span>}
                      {c.label && <span className="text-text-subtitle">{c.label}</span>}{c.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-[600px] shrink-0">
              <h2 className="text-title-s leading-[22px] text-text-title">What domain and persona are you targeting?</h2>
              <p className="pt-1 text-text-regular text-text-subtitle">This defines the core of your micropanel</p>

              <label className="flex flex-col gap-2 pt-4">
                <span className="text-text-regular text-text-subtitle">Micro-panel Name</span>
                <span className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">
                  {edit ? 'Leading Neurologists - USA' : 'Enter a panel name'}
                </span>
              </label>
              <label className="flex flex-col gap-2 pt-4">
                <span className="text-text-regular text-text-subtitle">Domain</span>
                <span className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">Select a domain</span>
              </label>
              <label className="flex flex-col gap-2 pt-4">
                <span className="text-text-regular text-text-subtitle">Role</span>
                <span className="flex h-12 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">Select roles</span>
              </label>
              <label className="flex flex-col gap-2 pt-4">
                <span className="text-text-regular text-text-subtitle">Level of Education</span>
                <Select value="Graduate or Bachelor's" />
              </label>

              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="text-text-regular text-text-subtitle">Experience (if applicable)</span>
                <span className="text-body-medium text-text-title">5+ Years</span>
              </div>
              <span className="mt-3 block h-1.5 w-full rounded-full bg-bg-3">
                <span className="block h-full w-[35%] rounded-full bg-cta-primary" />
              </span>

              <p className="pt-5 text-text-regular text-text-subtitle">Profession Verified Filter</p>
              <div className="flex items-start justify-between gap-4 border-b-1 border-stroke-1 pb-4 pt-3">
                <span className="flex flex-col gap-1">
                  <span className="text-body-regular text-text-title">Require NPI-verified / licensed / certified participants</span>
                  <span className="text-text-regular text-text-subtitle">Limits pool to licensed providers cross-checked against authorized registry</span>
                </span>
                <Toggle checked onChange={() => undefined} />
              </div>

              <h2 className="pt-5 text-title-s leading-[22px] text-text-title">Eligibility criteria</h2>
              <p className="pt-1 text-text-regular text-text-subtitle">Add filters to define your eligible cohort. The forecast updates live</p>
              <Row label="Minimum Profile Score" options={POOL_FILTERS.score} value="80 & above" />
              <Row label="GENDER" options={POOL_FILTERS.gender} value="All" />
              <Picked label="Location" placeholder="Select city, country" chips={['New York, US']} />
              <Picked label="Age Range" placeholder="2 range selected  •  Select age range…" chips={['18–20', '21–30']} />
              <Picked label="Language" placeholder="Select languages" chips={['English']} />
              <Row label="Last Active" options={POOL_FILTERS.lastActive} value="Any" />
            </div>
          )}
          <Forecast approx={step2} />
        </div>
      </div>
      <DiscardModal open={discard} onClose={() => setDiscard(false)} />
    </AppShell>
  )
}
