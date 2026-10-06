import { motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { AROUND } from '../../lib/motion'
import CloseSection from './CloseSection'
import EarnSection from './EarnSection'
import Hero from './Hero'
import HowSection from './HowSection'
import ProofSection from './ProofSection'
import { CertificateSection, TiersSection } from './TrustSections'
import WhatSection from './WhatSection'
import { LandingCtx } from './shared'
import './landing.css'

/** The screens of the page, in order. */
const SCREENS = ['hero', 'what', 'how', 'earn', 'tiers', 'certificate', 'proof', 'close']

/**
 * The first thing a signed-out person sees: one scrolling page of full-screen
 * sections, with Sign Up pinned at the thumb. It is a phone screen like every
 * other in the app: one column, edge to edge, inside the app frame.
 *
 * Nothing is measured off the window. The page reads the height of the app's
 * own scroller (<main>, which is the frame minus the status bar) and hands it
 * to the sections as --screen.
 */
export default function Landing() {
  const navigate = useNavigate()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(SCREENS[0])
  const at = SCREENS.indexOf(active)

  // The one measurement: how tall a screen is. Read when the frame changes size, never while scrolling;
  // the page has no scroll listener (sections report themselves, and the hero's depth is a CSS scroll timeline).
  useLayoutEffect(() => {
    const el = root.current
    const main = el?.parentElement
    if (!el || !main) return
    const measure = () => el.style.setProperty('--screen', `${main.clientHeight}px`)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(main)
    main.classList.add('ld-snap')
    return () => { ro.disconnect(); main.classList.remove('ld-snap') }
  }, [])

  // The last screen carries its own Sign Up and Log In, so the pinned pair steps aside there.
  const closing = active === 'close'

  return (
    <LandingCtx.Provider value={setActive}>
      <div ref={root} className="relative bg-bg-0">
        {/* Where you are in the page: progress segments along the top edge, as a phone app's story or onboarding has. */}
        <div aria-hidden="true" className="pointer-events-none sticky top-0 z-20 h-0">
          <div className="flex gap-1 px-4 pt-3">
            {SCREENS.map((id, i) => (
              <span key={id} className="h-1 flex-1 overflow-hidden rounded-full bg-text-disabled/40">
                <span className={cn('block h-full origin-left rounded-full bg-brand-primary transition-transform duration-300', i <= at ? 'scale-x-100' : 'scale-x-0')} />
              </span>
            ))}
          </div>
        </div>

        <Hero />
        <WhatSection />
        <HowSection />
        <EarnSection />
        <TiersSection />
        <CertificateSection />
        <ProofSection />
        <CloseSection />

        {/* The primary action, pinned where a thumb is, on every screen of the page. */}
        <div className="pointer-events-none sticky bottom-0 z-20 h-0">
          {/* Clipped, so stepping aside never adds to the page's scroll height. */}
          <div className="absolute inset-x-0 bottom-0 overflow-hidden">
            <motion.div initial={false} animate={{ y: closing ? '100%' : '0%', opacity: closing ? 0 : 1 }} transition={AROUND}
              className={cn('ld-scrim ld-safe-b flex gap-3 px-4 pt-8', !closing && 'pointer-events-auto')}>
              <Button className="flex-1" tabIndex={closing ? -1 : 0} onClick={() => navigate('/signup')}>Sign Up</Button>
              <Button variant="tertiary" className="bg-bg-0" tabIndex={closing ? -1 : 0} onClick={() => navigate('/signin')}>Log In</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </LandingCtx.Provider>
  )
}
