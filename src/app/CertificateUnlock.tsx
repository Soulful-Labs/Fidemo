import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { ParticleField, burst } from '../components/motion/Particles'
import Button from '../components/ui/Button'
import { ShieldCheck } from '../components/ui/icons'
import { useOverlay } from '../components/ui/Modal'
import { shownCertId } from '../screens/profile/Certificate'
import { VerifiedIcon } from '../screens/profile/profileIcons'
import { useStampSequence } from './useStampSequence'
import CertificatePlayful from './playful/CertificatePlayful'
import { usePlayful } from '../lib/playful'

export interface CertificateUnlockProps {
  /** The account's email, which the certificate ID is derived from; null when closed. */
  email: string | null
  onClose: () => void
}

/**
 * Moment C: the Human Certificate being issued, the instant the ID check
 * passes (policy section 2: "issued automatically the moment the ID passes").
 * Every word here is already in the app: the certificate's own title, its
 * Cert. ID line, its Government ID Verified line and Done. No name, per the
 * policy. Tap anywhere while it plays to skip to the end.
 */
export default function CertificateUnlock({ email, onClose }: CertificateUnlockProps) {
  useOverlay(email !== null, onClose)
  const playful = usePlayful()
  if (!email) return null
  return playful ? <CertificatePlayful email={email} onClose={onClose} /> : <Stamp email={email} onClose={onClose} />
}

/** A line of the certificate that writes itself in from the left. */
export function Written({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block overflow-hidden align-bottom">
      {children}
      <span data-s="cover" aria-hidden="true" className="absolute inset-y-0 -left-px -right-1 bg-bg-1 will-change-transform" />
    </span>
  )
}

function Stamp({ email, onClose }: { email: string; onClose: () => void }) {
  const specks = useMemo(() => burst(12, 21, [34, 70], 0.05), [])
  const { scope, playing, skip } = useStampSequence(specks)

  return (
    <div ref={scope} role="dialog" aria-modal="true" aria-label="Human Certificate"
      style={{ opacity: 0 }} onClickCapture={(e) => { if (playing.current) { e.stopPropagation(); skip() } }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-bg-0 bg-yellow-fade px-4 pb-6 pt-12">
      <div data-s="card" style={{ opacity: 0 }} className="mt-8 flex flex-col items-center gap-4 rounded-lg bg-bg-1 px-4 pb-6 pt-6 text-center">
        <h1 data-s="title" style={{ opacity: 0 }} className="text-title-l text-text-title">Human Certificate</h1>

        <div className="relative my-2 flex h-halo w-halo items-center justify-center">
          {/* The faint impression the seal leaves behind, a little off true. */}
          <span data-s="impression" aria-hidden="true" style={{ opacity: 0 }} className="absolute inset-0 flex rotate-3 scale-110 items-center justify-center text-state-success">
            <ShieldCheck className="h-28 w-28" />
          </span>
          <span data-s="ink" data-decor aria-hidden="true" style={{ opacity: 0 }} className="absolute inset-3 rounded-full border-4 border-state-success will-change-transform" />
          <ParticleField name="speck" particles={specks} tones={['text-state-success', 'text-green-700', 'text-text-body']} />
          <span data-s="seal" style={{ opacity: 0 }} className="relative text-state-success will-change-transform">
            <ShieldCheck className="h-28 w-28" />
          </span>
        </div>

        <span className="text-text-regular text-text-body">
          <Written>Cert. ID: <span className="text-text-title">{shownCertId(email)}</span></Written>
        </span>
        <span className="flex items-center gap-2 text-text-regular text-text-title">
          <span data-s="tick" style={{ opacity: 0 }}><VerifiedIcon className="text-brand-secondary" /></span>
          <Written>Government ID Verified</Written>
        </span>
      </div>

      <div data-s="cta" style={{ opacity: 0 }} className="mt-auto w-full pt-6">
        <Button fullWidth onClick={onClose}>Done</Button>
      </div>
    </div>
  )
}
