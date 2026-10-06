import type { ReactNode } from 'react'
import { useOverlay } from '../components/ui/Modal'
import CertificatePlayful from './playful/CertificatePlayful'

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
  if (!email) return null
  return <CertificatePlayful email={email} onClose={onClose} />
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
