import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { stepsBack } from './history'
import { parentOf } from './navigation'

/**
 * Navigation helpers that follow the global interaction rules.
 *
 * `back` returns to the screen the person actually came from when there is
 * one in the in-app history, and to the logical parent otherwise (a fresh
 * load or a deep link), so arriving from an unusual place still leaves
 * sensibly. A screen inside a flow can intercept it to raise its exit
 * confirmation first.
 */
export function useAppNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const back = useCallback(() => {
    const steps = stepsBack(pathname)
    if (steps > 0) navigate(-steps)
    else navigate(parentOf(pathname))
  }, [navigate, pathname])

  const go = useCallback((to: string) => navigate(to), [navigate])

  const replace = useCallback((to: string) => navigate(to, { replace: true }), [navigate])

  return { back, go, replace, parent: parentOf(pathname), pathname }
}
