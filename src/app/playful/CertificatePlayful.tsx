import { createPortal } from 'react-dom'
import { CONFETTI, cannons, fire, glitter } from '../../components/motion/Confetti'
import Tilt from '../../components/motion/Tilt'
import Button from '../../components/ui/Button'
import { ShieldCheck } from '../../components/ui/icons'
import { feedback } from '../../lib/feedback'
import { shownCertId } from '../../screens/profile/Certificate'
import { VerifiedIcon } from '../../screens/profile/profileIcons'
import { Written } from '../CertificateUnlock'
import { useStampPlayful } from './useStampPlayful'

/**
 * Moment C under PLAYFUL: the same card, the same words, the same places, but
 * the seal is a hammer and the card is a collectible. See useStampPlayful for
 * the beats. Tap anywhere to skip.
 */
export default function CertificatePlayful({ email, onClose }: { email: string; onClose: () => void }) {
  const { scope, playing, skip } = useStampPlayful({
    strike: () => {
      feedback('stamp')
      const r = scope.current?.querySelector('[data-s=seal]')?.getBoundingClientRect()
      if (r) fire({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 40, colors: CONFETTI.green, shapes: ['dot', 'paper'], power: 700, spread: 3 })
    },
    shown: () => {
      feedback('celebrate')
      cannons(CONFETTI.green, 70)
      window.setTimeout(() => glitter(CONFETTI.brand, 2.5), 700)
    },
  })

  return createPortal(
    <div ref={scope} role="dialog" aria-modal="true" aria-label="Human Certificate"
      style={{ opacity: 0 }} onClickCapture={(e) => { if (playing.current) { e.stopPropagation(); skip() } }}
      className="fixed inset-0 z-50 overflow-hidden bg-bg-0 bg-yellow-fade">
      <div data-s="stage" className="flex h-full flex-col px-4 pb-6 pt-12 [perspective:900px]">
        <div data-s="card" style={{ opacity: 0 }} className="mt-8 will-change-transform">
          <Tilt holo={1.3} className="flex flex-col items-center gap-4 rounded-lg bg-bg-1 px-4 pb-6 pt-6 text-center">
            <h1 data-s="title" style={{ opacity: 0 }} className="text-title-l text-text-title">Human Certificate</h1>

            <div className="relative my-2 flex h-halo w-halo items-center justify-center">
              <span data-s="shadow" data-decor aria-hidden="true" className="absolute inset-4 rounded-full" style={{ opacity: 0, background: 'radial-gradient(circle, rgb(0 0 0 / 0.9) 30%, transparent 70%)' }} />
              <span data-s="impression" aria-hidden="true" style={{ opacity: 0 }} className="absolute inset-0 flex rotate-3 scale-110 items-center justify-center text-state-success">
                <ShieldCheck className="h-28 w-28" />
              </span>
              <span data-s="ink" data-decor aria-hidden="true" style={{ opacity: 0 }} className="absolute inset-3 rounded-full border-4 border-state-success will-change-transform" />
              <span data-s="ink2" data-decor aria-hidden="true" style={{ opacity: 0 }} className="absolute inset-3 rounded-full border-2 border-brand-secondary will-change-transform" />
              <span data-s="seal" style={{ opacity: 0 }} className="relative z-10 text-state-success drop-shadow-[0_6px_0_var(--pf-green-900)] will-change-transform">
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
          </Tilt>
        </div>

        <div data-s="cta" style={{ opacity: 0 }} className="mt-auto w-full pt-6">
          <Button fullWidth onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
