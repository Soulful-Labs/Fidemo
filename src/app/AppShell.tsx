import { useEffect, useLayoutEffect, useRef } from 'react'
import { feedback } from '../lib/feedback'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useStore } from '../mock/store'
import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import ModalHost from './ModalHost'
import PhoneFrame from './PhoneFrame'
import ToastHost from './ToastHost'
import { ConfettiLayer } from '../components/motion/Confetti'
import PullIndicator from './playful/PullIndicator'
import { useElastic, useLongPressSwell } from './playful/touch'
import { recordNavigation } from './history'
import { isAltPalette, showsNav } from './navigation'
import { TIER, around } from '../lib/motion'

/**
 * Global interaction rule 8: scroll resets on a new navigation and is restored
 * when coming back to a screen already visited.
 */
function useScrollMemory(ref: React.RefObject<HTMLElement | null>, key: string) {
  const navigationType = useNavigationType()
  const positions = useRef(new Map<string, number>())

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (navigationType === 'POP') {
      el.scrollTop = positions.current.get(key) ?? 0
    } else {
      el.scrollTop = 0
    }
    const remember = () => positions.current.set(key, el.scrollTop)
    el.addEventListener('scroll', remember, { passive: true })
    return () => el.removeEventListener('scroll', remember)
  }, [ref, key, navigationType])
}

/**
 * Route transitions (moment J): going forward slides the new screen in from
 * the right, going back from the left, and moving between tab roots or
 * replacing a step just fades it up. Opacity and transform only, on <main>.
 */
function useRouteMotion(ref: React.RefObject<HTMLElement | null>, pathname: string) {
  const navigationType = useNavigationType()
  const last = useRef<string | null>(null)
  useLayoutEffect(() => {
    const from = last.current
    last.current = pathname
    if (from === null || from === pathname) return
    const tabs = showsNav(from) && showsNav(pathname)
    const dx = tabs || navigationType === 'REPLACE' ? 0 : navigationType === 'POP' ? -24 : 24
    // Tier 1 (getting around): a small fade and slide, fast, ease out, no
    // overshoot. Switching tabs moves nothing but the nav tint: one tap, one motion.
    if (tabs) return
    const s = TIER.around.slide * Math.sign(dx)
    around(ref.current, { opacity: 0, transform: dx ? `translateX(${s}px)` : `translateY(${TIER.around.slide * 0.75}px)` }, { opacity: 1, transform: 'none' })
  }, [ref, pathname, navigationType])
}

/** A short haptic tick on every press of something live, wherever the device supports it. */
function usePressHaptics() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest('button, a[href], [role=button], [role=link], [role=tab], [role=switch]')
      if (el && !el.matches(':disabled, [aria-disabled=true]')) feedback('press')
    }
    document.addEventListener('pointerdown', onDown, { passive: true })
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname, search, key } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()

  // Back arrows return to where the person came from (history.ts).
  useEffect(() => { recordNavigation(navigationType, key, pathname) }, [navigationType, key, pathname])
  const main = useRef<HTMLElement>(null)
  const { setSource } = useStore()
  const record = useRef(setSource)
  record.current = setSource

  // Workflow 12 and 14: every study link and sign-up link carries a code, and
  // the app records which one the person came through.
  useEffect(() => {
    const params = new URLSearchParams(search)
    const code = params.get('src') ?? params.get('ref')
    if (code) record.current(code)
  }, [search])

  // Dev only: lets scripts/demo.mjs move around the app without a reload,
  // which would drop the in-memory transition timers.
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __hlNavigate?: unknown }).__hlNavigate = navigate
  }, [navigate])
  useScrollMemory(main, pathname)
  useRouteMotion(main, pathname)
  const elastic = useElastic(main)
  useLongPressSwell()
  usePressHaptics()

  const navVisible = showsNav(pathname)
  const alt = isAltPalette(pathname)

  return (
    <PhoneFrame alt={alt}>
      <main ref={main} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      <PullIndicator {...elastic} />

      {navVisible && <BottomNav pathname={pathname} alt={alt} />}

      <ToastHost navVisible={navVisible} />
      <ModalHost />
      <ConfettiLayer />
    </PhoneFrame>
  )
}
