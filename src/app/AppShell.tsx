import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useStore } from '../mock/store'
import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import ModalHost from './ModalHost'
import PhoneFrame from './PhoneFrame'
import ToastHost from './ToastHost'
import { isAltPalette, showsNav } from './navigation'

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

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
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

  const navVisible = showsNav(pathname)
  const alt = isAltPalette(pathname)

  return (
    <PhoneFrame alt={alt}>
      <main ref={main} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {navVisible && <BottomNav pathname={pathname} alt={alt} />}

      <ToastHost navVisible={navVisible} />
      <ModalHost />
    </PhoneFrame>
  )
}
