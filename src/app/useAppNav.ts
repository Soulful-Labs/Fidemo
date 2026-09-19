import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { parentOf } from './navigation'

/**
 * Navigation helpers that follow the global interaction rules.
 *
 * `back` goes to the logical parent rather than browser history (rule 2), so
 * arriving at a screen from an unusual place still leaves sensibly. A screen
 * inside a flow can intercept it to raise its exit confirmation first.
 */
export function useAppNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const back = useCallback(() => {
    navigate(parentOf(pathname))
  }, [navigate, pathname])

  const go = useCallback((to: string) => navigate(to), [navigate])

  const replace = useCallback((to: string) => navigate(to, { replace: true }), [navigate])

  return { back, go, replace, parent: parentOf(pathname), pathname }
}
