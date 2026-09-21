import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ApplyBlocker } from '../lib/eligibility'

interface UIValue {
  /** Names the screen that is not built yet, per hard rule 1. */
  comingSoon: string | null
  openComingSoon: (name: string) => void
  closeComingSoon: () => void
  /** The "Study matching score" explainer (PRD 6.5), openable from any card. */
  matchScore: boolean
  openMatchScore: () => void
  closeMatchScore: () => void
  /** The reason Apply is blocked right now (workflow 15, 17, 57). */
  gate: ApplyBlocker | null
  openGate: (blocker: ApplyBlocker) => void
  closeGate: () => void
}

const UIContext = createContext<UIValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [comingSoon, setComingSoon] = useState<string | null>(null)
  const [matchScore, setMatchScore] = useState(false)
  const [gate, setGate] = useState<ApplyBlocker | null>(null)

  const openComingSoon = useCallback((name: string) => setComingSoon(name), [])
  const closeComingSoon = useCallback(() => setComingSoon(null), [])

  const openMatchScore = useCallback(() => setMatchScore(true), [])
  const closeMatchScore = useCallback(() => setMatchScore(false), [])

  const openGate = useCallback((blocker: ApplyBlocker) => setGate(blocker), [])
  const closeGate = useCallback(() => setGate(null), [])

  const value = useMemo(
    () => ({ comingSoon, openComingSoon, closeComingSoon, matchScore, openMatchScore, closeMatchScore, gate, openGate, closeGate }),
    [comingSoon, openComingSoon, closeComingSoon, matchScore, openMatchScore, closeMatchScore, gate, openGate, closeGate],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
