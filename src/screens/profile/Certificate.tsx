import { useNavigate } from 'react-router-dom'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import TopBar from '../../components/ui/TopBar'
import { tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'
import { PerformanceRatings } from '../trust/TrustScoreDetails'
import { Avatar } from './Profile'
import { VerifiedIcon } from './profileIcons'

const CERT_ID = 'HL-R-9F2A-3K7P'
const CERT_LINK = `https://humanlayer.app/certificate/${CERT_ID}`

/**
 * PRD 12.1, Figma 979:74343. The share icon copies a link. "Live Photo
 * Verified" only shows once the selfie has actually passed (conflict 23),
 * and the score is labelled Trust Score, not Profile Score (PRD 2).
 */
export default function Certificate() {
  const navigate = useNavigate()
  const { user, toast } = useStore()
  const tier = tierFor(user.trustScore)

  const share = async () => {
    try { await navigator.clipboard.writeText(CERT_LINK) } catch { /* clipboard unavailable outside a secure context */ }
    toast('Certificate link copied')
  }

  const checks = [
    { label: 'Government ID Verified', ok: user.verified.govId },
    { label: 'Live Photo Verified', ok: user.verified.livePhoto },
    { label: 'Professional License/Certificate Verified', ok: user.verified.license },
    { label: 'NPI cross checked', ok: user.verified.license && user.profile.industry === 'Healthcare' },
  ].filter((c) => c.ok)

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Human Certificate" onBack={() => navigate('/profile')}
        right={
          <button type="button" aria-label="Share certificate" onClick={share} className="text-text-title">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        } />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="flex flex-col gap-4 rounded-lg bg-bg-1 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size={56} />
            <div className="flex flex-col gap-0.5">
              <span className="text-title-s text-text-title">{user.name}</span>
              <span className="text-text-regular text-text-body">Cert. ID: <span className="text-text-title">{CERT_ID}</span></span>
            </div>
          </div>

          <p className="text-body-medium text-text-title">Trust Score</p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-2 bg-yellow-fade p-3">
            <ScoreDial score={user.trustScore} size="sm" />
            <TierChip tier={tier} onClick={() => navigate('/trust-score/tiers')} />
          </div>

          <p className="text-body-medium text-text-title">Performance Ratings</p>
          <PerformanceRatings alt={false} />

          <p className="text-body-medium text-text-title">Verified</p>
          <ul className="flex flex-col gap-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-text-regular text-text-title">
                <VerifiedIcon className="text-brand-secondary" />
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
