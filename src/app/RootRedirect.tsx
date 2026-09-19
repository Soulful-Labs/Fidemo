import { Navigate } from 'react-router-dom'
import { useStore } from '../mock/store'

/** `/` sends a signed-in user to the dashboard, everyone else to sign up. */
export default function RootRedirect() {
  const { signedIn } = useStore()
  return <Navigate to={signedIn ? '/dashboard' : '/signup'} replace />
}
