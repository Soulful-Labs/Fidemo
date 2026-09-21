import { useNavigate } from 'react-router-dom'
import StarRating from '../../components/app/StarRating'
import TopBar from '../../components/ui/TopBar'
import { ShieldCheck } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { RATING_DELTA, TRUST } from '../../lib/rules'

const pill = (value: number) => (
  <span className={cn('rounded-full px-2 py-0.5 text-text-medium', value >= 0 ? 'bg-green-900/60 text-brand-secondary' : 'bg-state-dangerBg text-state-danger')}>
    {value >= 0 ? '+' : ''}{value}
  </span>
)

/**
 * PRD 7.2, Figma 1114:95469, at the signed policy's values and wording
 * (docs/Trust-and-Rewards-Policy.html section 1), which outrank the drawn
 * ones: No show -4, Cancelled session -2, Late show up -2, Fraud -20.
 */
export default function TrustScoreRules() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-full flex-col bg-bgAlt-0">
      <TopBar alt title="Trust Score Rules" onBack={() => navigate('/trust-score')} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-14 w-14 text-brand-primary" />
          <p className="text-body-medium text-brand-primary">Trust Score For Performance Overview</p>
          <p className="text-text-regular text-text-body">Your Trust Score reflects the overall strength of your profile and performance on HumanLayer.</p>
        </div>

        <h2 className="pt-2 text-center text-body-medium text-text-title">How Trust Score Works</h2>

        <section className="flex flex-col gap-4 rounded-lg bg-bgAlt-2 p-4">
          <div className="flex flex-col gap-1">
            <p className="flex items-center justify-between text-body-medium text-text-title">Onboarding {pill(TRUST.ONBOARDING)}</p>
            <p className="text-text-regular text-text-body">• Once you create your account</p>
          </div>
          <span className="h-px w-full bg-stroke-3" />
          <div className="flex flex-col gap-1">
            <p className="flex items-center justify-between text-body-medium text-text-title">Study Completion {pill(TRUST.STUDY_COMPLETION_CAP_PER_YEAR)}</p>
            <p className="text-text-regular text-text-body">• +{TRUST.STUDY_COMPLETION} for each completed study</p>
            <p className="text-text-regular text-text-body">• Up to {TRUST.STUDY_COMPLETION_CAP_PER_YEAR} studies in a year</p>
          </div>
          <span className="h-px w-full bg-stroke-3" />
          <div className="flex flex-col gap-2">
            <p className="flex items-center justify-between text-body-medium text-text-title">Participation Ratings {pill(TRUST.RATINGS_MAX)}</p>
            <p className="text-text-regular text-text-body">Ratings from the last {TRUST.RATINGS_WINDOW} studies count</p>
            {[5, 4, 3, 2, 1].map((stars) => (
              <p key={stars} className="flex items-center gap-2 text-text-regular text-text-title">
                <StarRating value={stars} size="sm" />
                {stars}-star rating
                <span className="ml-auto">{pill(RATING_DELTA[stars])}</span>
              </p>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-bgAlt-2 p-4">
          <p className="text-body-medium text-text-title">Deductions</p>
          {[
            ['No show', TRUST.NO_SHOW, 'Booked a session and did not appear'],
            ['Cancelled session', TRUST.CANCELLED_SESSION, 'Cancelling a session you had booked'],
            ['Late show up', TRUST.LATE_SHOW_UP, 'Took part, but arrived late'],
            ['Fraud', TRUST.FRAUD, 'Applied if reported and found guilty of fraud'],
          ].map(([label, value, note]) => (
            <div key={String(label)} className="flex flex-col gap-0.5 border-t-1 border-stroke-3 pt-3">
              <p className="flex items-center justify-between text-body-regular text-text-title">{label}{pill(Number(value))}</p>
              {note && <p className="text-label text-text-body">{note}</p>}
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-lg bg-bgAlt-2 p-4">
          <p className="text-body-medium text-text-title">Important to know</p>
          {[
            `Onboarding is fixed at ${TRUST.ONBOARDING}. This is the minimum Trust Score.`,
            `Study completion contributes up to ${TRUST.STUDY_COMPLETION_CAP_PER_YEAR} per year, based on a maximum of ${TRUST.STUDY_COMPLETION_CAP_PER_YEAR} completed studies.`,
            `The rating component uses the last ${TRUST.RATINGS_WINDOW} ratings and can contribute up to ${TRUST.RATINGS_MAX}.`,
            'Adding a credential does not change the Trust Score, whether you have one or not.',
            `The score is kept within a ${TRUST.MIN} minimum and ${TRUST.MAX} maximum.`,
            'Points never touch the Trust Score. They are a separate rewards currency.',
          ].map((line) => (
            <p key={line} className="flex items-start gap-2 text-text-regular text-text-subtitle">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" className="mt-0.5 shrink-0 text-brand-secondary"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {line}
            </p>
          ))}
        </section>
      </div>
    </div>
  )
}
