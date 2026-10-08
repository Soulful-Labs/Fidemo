import AppShell from '../app/AppShell'
import type { Crumb } from '../app/TitleBar'

/**
 * Stands in for a module screen until its turn in the build order. It sits in
 * the real shell, so the nav and title bar can be checked on every route now.
 */
export default function Placeholder({ crumbs }: { crumbs: Crumb[] }) {
  return <AppShell crumbs={crumbs} />
}
