import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import CloseSection from './CloseSection'
import EarnSection from './EarnSection'
import Hero from './Hero'
import StepsSection from './StepsSection'
import { LandingCtx } from './shared'
import './landing.css'

/** The screens of the page, in order. */
const SCREENS = ['hero', 'steps', 'earn', 'close']

/**
 * The first thing a signed-out person sees: four full screens, one scroll,
 * with Sign Up pinned at the thumb. It is a phone screen like every other in
 * the app: one column, inside the app frame.
 *
 * Nothing is measured off the window. The page reads the height of the app's
 * own scroller (<main>, which is the frame minus the status bar) and hands it
 * to the screens as --screen.
 *
 * Two solid bars frame every screen: progress along the top, the buttons along
 * the bottom. Each screen pads for both (`ld-screen`), so content is never
 * under either, and the page snaps so it never rests between two screens.
 */
export default function Landing() {
  const navigate = useNavigate()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(SCREENS[0])
  const at = SCREENS.indexOf(active)

  // The one measurement: how tall a screen is. Read when the frame changes size, never while scrolling.
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

  return (
    <LandingCtx.Provider value={setActive}>
      <div ref={root} className="relative bg-bg-0">
        {/* Where you are in the page: four progress segments, as a phone app's onboarding has. */}
        <div aria-hidden="true" className="pointer-events-none sticky top-0 z-20 h-0">
          <div className="ld-top flex items-center gap-1 bg-bg-0 px-4">
            {SCREENS.map((id, i) => (
              <span key={id} className="h-1 flex-1 overflow-hidden rounded-full bg-stroke-3">
                <span className={cn('block h-full origin-left rounded-full bg-brand-primary transition-transform duration-300', i <= at ? 'scale-x-100' : 'scale-x-0')} />
              </span>
            ))}
          </div>
        </div>

        <Hero />
        <StepsSection />
        <EarnSection />
        <CloseSection />

        {/* The primary action, pinned where a thumb is, on every screen. */}
        <div className="sticky bottom-0 z-20 h-0">
          <div className="ld-bottom absolute inset-x-0 bottom-0 flex gap-3 border-t-1 border-stroke-2 bg-bg-0 px-4">
            <Button className="flex-1" onClick={() => navigate('/signup')}>Sign Up</Button>
            <Button variant="tertiary" onClick={() => navigate('/signin')}>Log In</Button>
          </div>
        </div>
      </div>
    </LandingCtx.Provider>
  )
}
