import { useNavigate } from 'react-router-dom'
import Tilt from '../../components/motion/Tilt'
import { useAppNav } from '../../app/useAppNav'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import TopBar from '../../components/ui/TopBar'
import { tierFor } from '@shared/rules'
import { useStore } from '../../mock/store'
import { VerifiedIcon } from './profileIcons'

/**
 * PRD 12.1, Figma 979:74343, under the signed policy, which outranks both on
 * the certificate: it carries no name, email or phone, and its id is the
 * policy's FI-XXXX-XXXX (CERTIFICATE.ID_PREFIX), the same id the console and
 * the client app read. Figma's avatar, name, "HL-R" id and "Profile Score"
 * are replaced by a seal, the FI- id and "Trust Score". It claims what the
 * team verified, the government ID and, where one was checked, the
 * professional credential, and nothing about a selfie: selfie and liveness
 * checks are out of the product (23 Oct 2026).
 */
/**
 * Issued only once identity verification completes, with the ID generated
 * then and kept (shared/derive.ts freshCertificateId); never recomputed from
 * the email. It shows the identity and profession checks and the Trust Score,
 * and nothing else (decision C: no Performance Ratings, no NPI claim).
 */

export default function Certificate() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { user, toast } = useStore()
  const certId = user.certificateId
  const certLink = `https://humanlayer.app/certificate/${certId ?? ''}`
  const tier = tierFor(user.trustScore)

  const share = async () => {
    try { await navigator.clipboard.writeText(certLink) } catch { /* clipboard unavailable outside a secure context */ }
    toast('Certificate link copied')
  }

  const checks = [
    { label: 'Government ID Verified', ok: user.verified.govId },
    { label: 'Professional License/Certificate Verified', ok: user.verified.license },
  ].filter((c) => c.ok)

  // Policy section 7: no certificate before identity verification completes.
  if (!certId) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar title="Human Certificate" onBack={back} />
        <div className="flex flex-1 flex-col items-center gap-3 px-6 pt-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-2 text-text-body" aria-hidden="true"><VerifiedIcon className="h-7 w-7" /></span>
          <h1 className="text-title-s text-text-title">Not issued yet</h1>
          {user.checks.identity === 'in_review' || user.checks.identity === 'flagged' ? (
            <p className="text-text-regular text-text-body">Your ID is in review. Your Human Certificate is issued, with its own ID, as soon as our team has verified it.</p>
          ) : (
            <>
              <p className="text-text-regular text-text-body">Your Human Certificate is issued when your identity verification completes. It will appear here with its own ID.</p>
              <button type="button" onClick={() => navigate(user.onboarded ? '/profile/settings' : '/onboarding/identity')} className="text-text-medium text-brand-primary">Verify your identity</button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Human Certificate" onBack={back}
        right={
          <button type="button" aria-label="Share certificate" onClick={share} className="text-text-title">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        } />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <Tilt className="flex flex-col gap-4 rounded-lg bg-bg-1 p-4">
          <div className="flex items-center gap-3">
            {/* No name and no face: the certificate says what was checked, not who (policy). */}
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-900/60 text-brand-secondary" aria-hidden="true">
              <VerifiedIcon className="h-7 w-7" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-title-s text-text-title">Identity Verified</span>
              <span className="text-text-regular text-text-body">Cert. ID: <span className="text-text-title">{certId}</span></span>
            </div>
          </div>

          <p className="text-body-medium text-text-title">Trust Score</p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-2 bg-yellow-fade p-3">
            <ScoreDial score={user.trustScore} size="sm" memory="trust-certificate" />
            <TierChip tier={tier} onClick={() => navigate('/trust-score/tiers')} />
          </div>

          <p className="text-body-medium text-text-title">Verified</p>
          <ul className="flex flex-col gap-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-text-regular text-text-title">
                <VerifiedIcon className="text-brand-secondary" />
                {c.label}
              </li>
            ))}
          </ul>
        </Tilt>
      </div>
    </div>
  )
}
