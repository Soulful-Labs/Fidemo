import { useRoutes } from 'react-router-dom'
import AppShell from './app/AppShell'
import routes from './routes'

export default function App() {
  return <AppShell>{useRoutes(routes)}</AppShell>
}
