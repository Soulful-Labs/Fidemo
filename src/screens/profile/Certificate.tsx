import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import TierChip from '../../components/app/TierChip'
import TopBar from '../../components/ui/TopBar'
import { certificateId, certificateValidity } from '../../lib/profile'
import { tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'
import { VerifiedIcon } from './profileIcons'

const monthYear = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

/** Policy section 2, the lines under the card, in its own words. */
const POLICY_LINES = [
  'Issued automatically the moment the ID and selfie pass. No studies needed first.',
  'Live rather than a one-time award. The tier on it moves up or down after every study.',
  'The level only reflects what was verified, never behaviour. That is what the tier is for.',
  'Valid twelve months and renews on its own. Signed, so it cannot be altered afterwards.',
]

/**
 * PRD 12.1, Figma 979:74343, with the content the signed policy says the
 * certificate carries and nothing else: tier today, studies completed, the
 * checks that were run, validity, the ID, and the check link line. Never a
 * name, email or phone (policy section 2), so the drawn avatar and name are
 * out. The visual treatment is Figma's.
 *
 * OPEN QUESTION FOR JIM (b): the policy card says "Unlocks at 40" while the
 * score floor is 50; verification alone issues it here, no score gate.
 */
export default function Certificate() {
  const navigate = useNavigate()
  const { user, toast } = useStore()
  const certId = certificateId(user.email)
  const certLink = `https://humanlayer.app/certificate/${certId}`
  const { from, to } = certificateValidity(user.joinedAt)

  const share = async () => {
    try { await navigator.clipboard.writeText(certLink) } catch { /* clipboard unavailable outside a secure context */ }
    toast('Check link copied')
  }

  // The checks that actually ran, in the policy's words: "ID, selfie match, state records, NPI registry".
  const checks = [
    { label: 'ID', ok: user.verified.govId },
    { label: 'selfie match', ok: user.verified.livePhoto },
    { label: 'state records', ok: user.verified.license },
    { label: 'NPI registry', ok: user.verified.license && user.profile.industry === 'Healthcare' },
  ].filter((c) => c.ok).map((c) => c.label)

  if (!user.verified.govId) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar title="Human Certificate" onBack={() => navigate('/profile')} />
        <EmptyState title="Not issued yet" body="Your certificate is issued automatically the moment your ID passes. No studies needed first."
          actionLabel="Verify your ID" onAction={() => navigate('/onboarding/about')} />
      </div>
    )
  }

  const rows: [string, React.ReactNode][] = [
    ['Tier today', <TierChip key="tier" tier={tierFor(user.trustScore)} onClick={() => navigate('/trust-score/tiers')} />],
    ['Studies completed', user.completedStudies],
    ['Checks that were run', checks.join(', ')],
    ['Valid', `${monthYear(from)} to ${monthYear(to)}`],
    ['Certificate ID', certId],
  ]

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Human Certificate" onBack={() => navigate('/profile')}
        right={
          <button type="button" aria-label="Copy the check link" onClick={share} className="text-text-title">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        } />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-4 rounded-lg bg-bg-1 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-bg-2 bg-yellow-fade p-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-1000/60 text-brand-primary"><VerifiedIcon className="h-6 w-6" /></span>
            <span className="flex flex-col">
              <span className="text-label uppercase tracking-widest text-brand-primary">Focus Insite verified</span>
              <span className="text-title-s text-text-title">Verified professional</span>
            </span>
          </div>

          <dl className="flex flex-col">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b-1 border-stroke-2 py-3 last:border-b-0">
                <dt className="text-text-regular text-text-body">{label}</dt>
                <dd className="text-right text-text-medium text-text-title">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-text-regular text-text-subtitle">
            Anyone can open the check link to confirm it is genuine. Never a name, email or phone.
          </p>
        </div>

        <ul className="flex flex-col gap-2 rounded-lg bg-bg-1 p-4">
          {POLICY_LINES.map((line) => (
            <li key={line} className="flex items-start gap-2 text-text-regular text-text-subtitle">
              <VerifiedIcon className="mt-0.5 shrink-0 text-brand-secondary" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
