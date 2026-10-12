import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import './index.css'
import routes from './routes'
import { CreateProvider } from './mock/createStore'
import ToastHost from './components/ui/Toast'
import { PlatformClock } from './platform'
import { SessionProvider } from './mock/session'
import { WorkspaceProvider } from './mock/workspace'

function Routed() {
  return useRoutes(routes)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <WorkspaceProvider>
          <CreateProvider>
            <PlatformClock />
            <ToastHost>
              <Routed />
            </ToastHost>
          </CreateProvider>
        </WorkspaceProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
