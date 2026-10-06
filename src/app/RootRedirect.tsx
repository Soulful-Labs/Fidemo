import { Navigate } from 'react-router-dom'
import { useStore } from '../mock/store'
import Landing from '../screens/landing/Landing'

/** `/` sends a signed-in user to the dashboard; everyone else sees the landing page. */
export default function RootRedirect() {
  const { signedIn } = useStore()
  return signedIn ? <Navigate to="/dashboard" replace /> : <Landing />
}
