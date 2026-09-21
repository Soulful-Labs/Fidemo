import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import TopBar from '../components/ui/TopBar'
import { Search } from '../components/ui/icons'
import { useStore } from '../mock/store'

/** The `*` route: a real empty state, with a way back that depends on whether the person is signed in. */
export default function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { signedIn } = useStore()
  const home = signedIn ? '/dashboard' : '/signin'

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Page not found" onBack={() => navigate(home, { replace: true })} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-2 text-text-disabled">
          <Search className="h-6 w-6" />
        </div>
        <p className="text-body-large text-text-title">We can&apos;t find that page</p>
        <p className="text-text-regular text-text-body">
          <span className="break-all text-text-subtitle">{pathname}</span> is not part of the app. The link may be out of date, or the study it pointed to has closed.
        </p>
        <div className="flex gap-2 pt-1">
          <Button size="md" variant="secondary" onClick={() => navigate(home, { replace: true })}>{signedIn ? 'Go to Dashboard' : 'Sign in'}</Button>
          {signedIn && <Button size="md" onClick={() => navigate('/studies', { replace: true })}>Explore Studies</Button>}
        </div>
      </div>
    </div>
  )
}
