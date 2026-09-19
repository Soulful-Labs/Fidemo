import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface UIValue {
  /** Names the screen that is not built yet, per hard rule 1. */
  comingSoon: string | null
  openComingSoon: (name: string) => void
  closeComingSoon: () => void
}

const UIContext = createContext<UIValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [comingSoon, setComingSoon] = useState<string | null>(null)

  const openComingSoon = useCallback((name: string) => setComingSoon(name), [])
  const closeComingSoon = useCallback(() => setComingSoon(null), [])

  const value = useMemo(
    () => ({ comingSoon, openComingSoon, closeComingSoon }),
    [comingSoon, openComingSoon, closeComingSoon],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
