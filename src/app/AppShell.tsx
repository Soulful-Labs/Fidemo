import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import ModalHost from './ModalHost'
import PhoneFrame from './PhoneFrame'
import ToastHost from './ToastHost'
import { showsNav } from './navigation'

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
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  useScrollMemory(main, pathname)

  const navVisible = showsNav(pathname)

  return (
    <PhoneFrame>
      <main ref={main} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {navVisible && <BottomNav pathname={pathname} />}

      <ToastHost navVisible={navVisible} />
      <ModalHost />
    </PhoneFrame>
  )
}
