import { useLocation } from 'react-router-dom'
import AppShell from '../app/AppShell'
import Card from '../components/ui/Card'
import type { ScreenKind } from '../routes'

/**
 * Stands in for a screen that stage one has not reached yet. It names the
 * Figma frame it will be built from, so the route map can be walked before
 * the screens exist.
 */
export default function Placeholder({ name, node, kind }: { name: string; node?: string; kind?: ScreenKind }) {
  const { pathname } = useLocation()
  return (
    <AppShell crumbs={[{ label: name }]}>
      <Card className="mx-auto max-w-page">
        <p className="text-label uppercase tracking-widest text-text-body">Not built yet</p>
        <h1 className="pt-2 text-title-l text-text-title">{name}</h1>
        <dl className="flex flex-col gap-1 pt-4 text-text-regular">
          <div className="flex gap-2"><dt className="text-text-body">Route</dt><dd className="text-text-title">{pathname}</dd></div>
          {node && <div className="flex gap-2"><dt className="text-text-body">Figma</dt><dd className="text-text-title">{node}</dd></div>}
          {kind && <div className="flex gap-2"><dt className="text-text-body">Kind</dt><dd className="text-text-title">{kind}</dd></div>}
        </dl>
      </Card>
    </AppShell>
  )
}
