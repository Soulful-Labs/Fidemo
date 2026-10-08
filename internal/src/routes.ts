import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'
import Placeholder from './screens/Placeholder'

/**
 * No screens are built yet. Every route renders the placeholder until its
 * turn in the build order (CLAUDE.md, "Build order").
 */
const routes: RouteObject[] = [
  { path: '*', element: createElement(Placeholder) },
]

export default routes
