import { useLocation } from 'react-router-dom'
import TopBar from './ui/TopBar'
import { useAppNav } from '../app/useAppNav'
import { showsNav } from '../app/navigation'

const TAB_ROOTS = ['/dashboard', '/studies', '/wallet', '/profile']

/**
 * Stands in for a screen that is not built yet. It renders inside the shell
 * with a real top bar, so back behaviour and the nav rules can be walked
 * across the whole route map before the screens exist.
 */
export default function Placeholder({ name }: { name: string }) {
  const { pathname } = useLocation()
  const { back, parent } = useAppNav()
  const isTabRoot = TAB_ROOTS.includes(pathname)

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={name} onBack={isTabRoot ? undefined : back} />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
        <p className="text-label uppercase tracking-widest text-text-disabled">Not built yet</p>
        <h1 className="text-title-l text-text-title">{name}</h1>
        <p className="text-text-regular text-text-body">{pathname}</p>
        <dl className="mt-2 flex flex-col gap-1 text-label text-text-disabled">
          <div className="flex gap-2">
            <dt>Bottom nav</dt>
            <dd className="text-text-body">{showsNav(pathname) ? 'shown' : 'hidden'}</dd>
          </div>
          {!isTabRoot && (
            <div className="flex gap-2">
              <dt>Back goes to</dt>
              <dd className="text-text-body">{parent}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
